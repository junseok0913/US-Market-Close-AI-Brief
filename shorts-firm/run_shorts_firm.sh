#!/bin/bash

# ==============================================================================
# Shorts-Firm Independent Pipeline
#
# Flow:
#   1) Generate script.json (Gemini + company context)
#   2) Generate TTS audio + sections.timing.json
#   3) Prepare slide script/template + TSX payload
#   4) Render shorts MP4 (Remotion) + thumbnail
#   5) Upload to YouTube (optional)
# ==============================================================================

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UV_CACHE_DIR="${UV_CACHE_DIR:-${ROOT_DIR}/.cache/uv}"
YOUTUBE_UPLOAD_SCRIPT="${ROOT_DIR}/shared/ops/scripts/youtube/upload_youtube_video.py"
if [ ! -f "${YOUTUBE_UPLOAD_SCRIPT}" ] && [ -f "${ROOT_DIR}/scripts/upload_youtube_video.py" ]; then
    YOUTUBE_UPLOAD_SCRIPT="${ROOT_DIR}/scripts/upload_youtube_video.py"
fi

DATE=""
LANG="ko"
START_FROM=1
OVERWRITE=0
OVERWRITE_RENDER=0
UPLOAD=1
PRIVACY="public"
SHORTS_DURATION_SECONDS="${SHORTS_FIRM_DURATION_SECONDS:-90}"
SHORTS_TTS_VOICE="${SHORTS_FIRM_TTS_VOICE:-Charon}"
SHORTS_TTS_TEMPERATURE="${SHORTS_FIRM_TTS_TEMPERATURE:-0.6}"
REMOTION_TIMEOUT_MS="${SHORTS_FIRM_REMOTION_TIMEOUT_MS:-180000}"
REMOTION_CONCURRENCY="${SHORTS_FIRM_REMOTION_CONCURRENCY:-1}"
PREVIEW_SECONDS=""
PROMPT_CONFIG_PATH="${ROOT_DIR}/shorts-firm/prompt/shorts_firm_pipeline.yaml"
SLIDES_PROMPT_CONFIG_PATH="${SHORTS_FIRM_SLIDES_PROMPT_CONFIG:-${ROOT_DIR}/shorts-firm/prompt/shorts_firm_slides.yaml}"
CURRENT_STEP="init"
USE_UV=0
PYTHON_BIN="python3"

usage() {
    cat <<'EOF'
Usage:
  ./shorts-firm/run_shorts_firm.sh YYYYMMDD --lang ko|en [--start-from 1..5] [--overwrite] [--no-upload]

Options:
  --lang ko|en               Language path (default: ko)
  --start-from <n>           Resume from step n (1..5, default: 1)
                             1=script, 2=tts, 3=slide+tsx, 4=render, 5=upload
  --duration <seconds>       Target shorts script duration (default: 90)
  --voice <name>             TTS voice (default: Charon)
  --temperature <float>      TTS temperature (default: 0.6)
  --prompt-config <path>     Script/TTS YAML config path
  --slides-prompt-config <path> Slides YAML config path
  --overwrite                Regenerate script/audio/render artifacts
  --overwrite-render         Force overwrite slides.render.json placeholder
  --render-json <path>       Use custom slides.render.json path for render step
  --privacy <value>          YouTube privacy: private|unlisted|public (default: public)
  --no-upload                Skip YouTube upload
  --upload                   Force upload on (default)
  --preview-seconds <n>      Render first n seconds only
  --remotion-timeout-ms <n>  Remotion timeout in ms (default: 180000)
  --remotion-concurrency <n> Remotion frame workers (default: 1)
  -h, --help                 Show this help
EOF
}

trap 'echo "❌ Failed at ${CURRENT_STEP}"' ERR

mkdir -p "${UV_CACHE_DIR}"
export UV_CACHE_DIR

if command -v uv >/dev/null 2>&1; then
    if uv run python -c "import sys; print(sys.version)" >/dev/null 2>&1; then
        USE_UV=1
    fi
fi
if [ "${USE_UV}" -ne 1 ] && [ -x "${ROOT_DIR}/.venv/bin/python" ]; then
    PYTHON_BIN="${ROOT_DIR}/.venv/bin/python"
fi

require_cmd() {
    local cmd="$1"
    if [[ "${cmd}" == */* ]]; then
        if [ -x "${cmd}" ]; then
            return 0
        fi
        echo "❌ Required executable not found: ${cmd}"
        exit 1
    fi
    if ! command -v "${cmd}" >/dev/null 2>&1; then
        echo "❌ Required command not found: ${cmd}"
        exit 1
    fi
}

require_file() {
    local path="$1"
    if [ ! -f "${path}" ]; then
        echo "❌ Required file not found: ${path}"
        exit 1
    fi
}

run_python() {
    if [ "${USE_UV}" -eq 1 ]; then
        uv run python "$@"
    else
        "${PYTHON_BIN}" "$@"
    fi
}

require_python_runner() {
    if [ "${USE_UV}" -eq 1 ]; then
        require_cmd uv
    else
        require_cmd "${PYTHON_BIN}"
    fi
}

validate_mp4_streams() {
    local mp4_path="$1"
    local streams
    streams="$(ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "${mp4_path}" | tr '\n' ' ')"
    if [[ "${streams}" != *video* ]] || [[ "${streams}" != *audio* ]]; then
        echo "❌ MP4 validation failed (missing video/audio stream): ${mp4_path}"
        exit 1
    fi
}

enforce_shorts_duration_limit() {
    local mp4_path="$1"
    local target_seconds=59
    local tolerance=0.02
    local raw_duration
    raw_duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${mp4_path}" | tr -d '\r')"
    local needs_retime
    needs_retime="$(awk -v d="${raw_duration}" -v t="${target_seconds}" -v e="${tolerance}" 'BEGIN { diff = d - t; if (diff < 0) diff = -diff; print (diff > e) ? 1 : 0 }')"

    if [ "${needs_retime}" -ne 1 ]; then
        echo "✅ Shorts duration OK: ${raw_duration}s (~${target_seconds}s)"
        return 0
    fi

    local speed_ratio
    speed_ratio="$(awk -v d="${raw_duration}" -v t="${target_seconds}" 'BEGIN { printf "%.6f", d / t }')"
    local video_pts
    video_pts="$(awk -v r="${speed_ratio}" 'BEGIN { printf "%.6f", 1.0 / r }')"

    if awk -v r="${speed_ratio}" 'BEGIN { exit !(r > 1.0) }'; then
        echo "⚡ Shorts speed-up: ${raw_duration}s -> ${target_seconds}s (${speed_ratio}x)"
    else
        echo "🐢 Shorts slow-down: ${raw_duration}s -> ${target_seconds}s (${speed_ratio}x)"
    fi

    local atempo_filters=""
    local remaining="${speed_ratio}"
    while awk -v r="${remaining}" 'BEGIN { exit !(r > 2.0) }'; do
        atempo_filters="${atempo_filters}atempo=2.0,"
        remaining="$(awk -v r="${remaining}" 'BEGIN { printf "%.6f", r / 2.0 }')"
    done
    while awk -v r="${remaining}" 'BEGIN { exit !(r < 0.5) }'; do
        atempo_filters="${atempo_filters}atempo=0.5,"
        remaining="$(awk -v r="${remaining}" 'BEGIN { printf "%.6f", r / 0.5 }')"
    done
    atempo_filters="${atempo_filters}atempo=${remaining}"

    local tmp_path="${mp4_path%.mp4}_speedup.mp4"
    ffmpeg -hide_banner -loglevel error -y \
        -i "${mp4_path}" \
        -filter:v "setpts=${video_pts}*PTS,fps=30" \
        -af "${atempo_filters},aresample=async=1:first_pts=0" \
        -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p \
        -c:a aac -b:a 192k \
        -t "${target_seconds}" \
        -movflags +faststart \
        "${tmp_path}"

    mv "${tmp_path}" "${mp4_path}"
    local new_duration
    new_duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${mp4_path}" | tr -d '\r')"
    echo "✅ Shorts retime complete: ${new_duration}s"
}

generate_script() {
    require_python_runner
    require_file "${ROOT_DIR}/shorts-firm/generate_script.py"
    require_file "${EPISODE_BASE}/script.json"
    require_file "${EPISODE_BASE}/metadata.txt"
    require_file "${PROMPT_CONFIG_PATH}"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SHORTS_SCRIPT_PATH}" ]; then
        echo "🧠 Generating shorts-firm script..."
        run_python "${ROOT_DIR}/shorts-firm/generate_script.py" \
            "${EPISODE_BASE}" \
            --duration "${SHORTS_DURATION_SECONDS}" \
            --prompt-config "${PROMPT_CONFIG_PATH}"
    else
        echo "♻️  Reusing shorts-firm script: ${SHORTS_SCRIPT_PATH}"
    fi

    require_file "${SHORTS_SCRIPT_PATH}"
}

generate_audio() {
    require_python_runner
    require_file "${ROOT_DIR}/shorts-firm/generate_audio.py"
    require_file "${SHORTS_SCRIPT_PATH}"
    require_file "${PROMPT_CONFIG_PATH}"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SHORTS_MP3}" ] || [ ! -f "${SHORTS_SECTION_TIMING_PATH}" ]; then
        echo "🎙️  Generating shorts-firm audio + section timings..."
        run_python "${ROOT_DIR}/shorts-firm/generate_audio.py" \
            "${DATE}" \
            --lang "${LANG}" \
            --voice "${SHORTS_TTS_VOICE}" \
            --temperature "${SHORTS_TTS_TEMPERATURE}" \
            --config "${PROMPT_CONFIG_PATH}"
    else
        echo "♻️  Reusing shorts-firm audio/timing: ${SHORTS_MP3}"
    fi

    require_file "${SHORTS_MP3}"
    require_file "${SHORTS_SECTION_TIMING_PATH}"
}

prepare_slide_assets() {
    require_python_runner
    require_file "${ROOT_DIR}/shorts-firm/generate_slide_script.py"
    require_file "${ROOT_DIR}/shorts-firm/generate_tsx.py"
    require_file "${SHORTS_SCRIPT_PATH}"
    require_file "${SLIDES_PROMPT_CONFIG_PATH}"

    local slide_args=(
        "${DATE}"
        --lang "${LANG}"
        --script "${SHORTS_SCRIPT_PATH}"
        --timing "${SHORTS_SECTION_TIMING_PATH}"
        --script-output "${SHORTS_SLIDE_SCRIPT_PATH}"
        --template-output "${SHORTS_RENDER_TEMPLATE_PATH}"
        --render-output "${SHORTS_RENDER_JSON}"
        --config "${SLIDES_PROMPT_CONFIG_PATH}"
    )
    if [ "${OVERWRITE_RENDER}" -eq 1 ] || [ "${OVERWRITE}" -eq 1 ]; then
        slide_args+=(--overwrite-render)
    fi

    echo "🧩 Preparing shorts-firm slide script/template..."
    run_python "${ROOT_DIR}/shorts-firm/generate_slide_script.py" "${slide_args[@]}"

    echo "🧱 Generating shorts-firm TSX payload..."
    run_python "${ROOT_DIR}/shorts-firm/generate_tsx.py" \
        "${DATE}" \
        --lang "${LANG}" \
        --input "${SHORTS_RENDER_JSON}" \
        --output "${SHORTS_TSX_PATH}"

    require_file "${SHORTS_RENDER_JSON}"
    require_file "${SHORTS_TSX_PATH}"
}

render_video() {
    require_cmd ffmpeg
    require_cmd ffprobe
    require_cmd node
    require_file "${ROOT_DIR}/shorts-firm/render_shorts_remotion.mjs"
    require_file "${SHORTS_RENDER_JSON}"
    require_file "${SHORTS_MP3}"

    mkdir -p "${SHORTS_OUTPUT_DIR}"
    mkdir -p "${ROOT_DIR}/web/public/data/shorts-firm"
    mkdir -p "${ROOT_DIR}/web/public/audio/shorts-firm"

    if [ -f "${SHORTS_OUTPUT_MP4}" ] && [ "${OVERWRITE}" -ne 1 ]; then
        echo "❌ Output already exists: ${SHORTS_OUTPUT_MP4}"
        echo "   Use --overwrite to replace existing files."
        exit 1
    fi
    if [ "${OVERWRITE}" -eq 1 ]; then
        rm -f "${SHORTS_OUTPUT_MP4}" "${SHORTS_THUMBNAIL_PNG}" "${SHORTS_OUTPUT_WEBM}"
    fi

    echo "📂 Syncing shorts-firm assets into web/public..."
    cp "${SHORTS_RENDER_JSON}" "${SHORTS_WEB_DATA_PATH}"
    cp "${SHORTS_MP3}" "${SHORTS_WEB_AUDIO_PATH}"

    local remotion_args=(
        --episode-json "${SHORTS_RENDER_JSON}"
        --section-timing-json "${SHORTS_SECTION_TIMING_PATH}"
        --output "${SHORTS_OUTPUT_MP4}"
        --audio-src "audio/shorts-firm/shortsfirm${DATE}.mp3"
        --timeout "${REMOTION_TIMEOUT_MS}"
        --concurrency "${REMOTION_CONCURRENCY}"
    )
    if [ -n "${PREVIEW_SECONDS}" ]; then
        remotion_args+=(--preview-seconds "${PREVIEW_SECONDS}")
    fi

    echo "🎬 Rendering shorts-firm via Remotion..."
    node "${ROOT_DIR}/shorts-firm/render_shorts_remotion.mjs" "${remotion_args[@]}"

    enforce_shorts_duration_limit "${SHORTS_OUTPUT_MP4}"
    validate_mp4_streams "${SHORTS_OUTPUT_MP4}"

    echo "🖼️  Creating shorts-firm thumbnail from first frame..."
    ffmpeg -hide_banner -loglevel error -y \
        -i "${SHORTS_OUTPUT_MP4}" \
        -frames:v 1 \
        "${SHORTS_THUMBNAIL_PNG}"
}

upload_video() {
    if [ "${UPLOAD}" -ne 1 ]; then
        echo "⏭️  Upload disabled. Skipping shorts-firm upload."
        return 0
    fi

    require_python_runner
    require_file "${YOUTUBE_UPLOAD_SCRIPT}"
    require_file "${SHORTS_OUTPUT_MP4}"

    local upload_args=(
        --file "${SHORTS_OUTPUT_MP4}"
        --date "${DATE}"
        --lang "${LANG}"
        --privacy "${PRIVACY}"
    )
    if [ -f "${SHORTS_THUMBNAIL_PNG}" ]; then
        upload_args+=(--thumbnail "${SHORTS_THUMBNAIL_PNG}")
    fi

    echo "☁️  Uploading shorts-firm MP4 to YouTube..."
    run_python "${YOUTUBE_UPLOAD_SCRIPT}" "${upload_args[@]}"
}

if [ $# -eq 0 ]; then
    usage
    exit 1
fi

CUSTOM_RENDER_JSON=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --lang)
            LANG="$2"
            shift 2
            ;;
        --start-from)
            START_FROM="$2"
            shift 2
            ;;
        --duration)
            SHORTS_DURATION_SECONDS="$2"
            shift 2
            ;;
        --voice)
            SHORTS_TTS_VOICE="$2"
            shift 2
            ;;
        --temperature)
            SHORTS_TTS_TEMPERATURE="$2"
            shift 2
            ;;
        --prompt-config)
            PROMPT_CONFIG_PATH="$2"
            shift 2
            ;;
        --slides-prompt-config)
            SLIDES_PROMPT_CONFIG_PATH="$2"
            shift 2
            ;;
        --overwrite)
            OVERWRITE=1
            shift
            ;;
        --overwrite-render)
            OVERWRITE_RENDER=1
            shift
            ;;
        --render-json)
            CUSTOM_RENDER_JSON="$2"
            shift 2
            ;;
        --privacy)
            PRIVACY="$2"
            shift 2
            ;;
        --upload)
            UPLOAD=1
            shift
            ;;
        --no-upload)
            UPLOAD=0
            shift
            ;;
        --preview-seconds)
            PREVIEW_SECONDS="$2"
            shift 2
            ;;
        --remotion-timeout-ms)
            REMOTION_TIMEOUT_MS="$2"
            shift 2
            ;;
        --remotion-concurrency)
            REMOTION_CONCURRENCY="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            if [ -z "${DATE}" ]; then
                DATE="$1"
                shift
            else
                echo "❌ Unexpected argument: $1"
                usage
                exit 1
            fi
            ;;
    esac
done

if [[ ! "${DATE}" =~ ^[0-9]{8}$ ]]; then
    echo "❌ DATE must be in YYYYMMDD format: ${DATE}"
    exit 1
fi

if [[ "${LANG}" != "ko" && "${LANG}" != "en" ]]; then
    echo "❌ --lang must be one of: ko, en"
    exit 1
fi

if ! [[ "${START_FROM}" =~ ^[0-9]+$ ]] || [ "${START_FROM}" -lt 1 ] || [ "${START_FROM}" -gt 5 ]; then
    echo "❌ --start-from must be within 1..5: ${START_FROM}"
    exit 1
fi

if ! [[ "${SHORTS_DURATION_SECONDS}" =~ ^[0-9]+$ ]]; then
    echo "❌ --duration must be numeric: ${SHORTS_DURATION_SECONDS}"
    exit 1
fi

if ! [[ "${REMOTION_TIMEOUT_MS}" =~ ^[0-9]+$ ]] || [ "${REMOTION_TIMEOUT_MS}" -le 0 ]; then
    echo "❌ --remotion-timeout-ms must be a positive integer: ${REMOTION_TIMEOUT_MS}"
    exit 1
fi

if ! [[ "${REMOTION_CONCURRENCY}" =~ ^[0-9]+$ ]] || [ "${REMOTION_CONCURRENCY}" -le 0 ]; then
    echo "❌ --remotion-concurrency must be a positive integer: ${REMOTION_CONCURRENCY}"
    exit 1
fi

if [ -n "${PREVIEW_SECONDS}" ] && ! [[ "${PREVIEW_SECONDS}" =~ ^[0-9]+$ ]]; then
    echo "❌ --preview-seconds must be numeric: ${PREVIEW_SECONDS}"
    exit 1
fi

if [ -n "${PREVIEW_SECONDS}" ] && [ "${PREVIEW_SECONDS}" -le 0 ]; then
    echo "❌ --preview-seconds must be > 0"
    exit 1
fi

if [[ "${PRIVACY}" != "private" && "${PRIVACY}" != "unlisted" && "${PRIVACY}" != "public" ]]; then
    echo "❌ --privacy must be one of: private, unlisted, public"
    exit 1
fi

if [[ "${PROMPT_CONFIG_PATH}" != /* ]]; then
    PROMPT_CONFIG_PATH="${ROOT_DIR}/${PROMPT_CONFIG_PATH}"
fi
if [[ "${SLIDES_PROMPT_CONFIG_PATH}" != /* ]]; then
    SLIDES_PROMPT_CONFIG_PATH="${ROOT_DIR}/${SLIDES_PROMPT_CONFIG_PATH}"
fi
if [ -n "${CUSTOM_RENDER_JSON}" ] && [[ "${CUSTOM_RENDER_JSON}" != /* ]]; then
    CUSTOM_RENDER_JSON="${ROOT_DIR}/${CUSTOM_RENDER_JSON}"
fi

if [ ! -f "${PROMPT_CONFIG_PATH}" ]; then
    echo "❌ Prompt config not found: ${PROMPT_CONFIG_PATH}"
    exit 1
fi
if [ ! -f "${SLIDES_PROMPT_CONFIG_PATH}" ]; then
    echo "❌ Slides prompt config not found: ${SLIDES_PROMPT_CONFIG_PATH}"
    exit 1
fi

EPISODE_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}"
SHORTS_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}/shorts-firm"
SHORTS_SCRIPT_PATH="${SHORTS_BASE}/script.json"
SHORTS_MP3="${SHORTS_BASE}/shortsfirm${DATE}.mp3"
SHORTS_SECTION_TIMING_PATH="${SHORTS_BASE}/sections.timing.json"
SHORTS_SLIDE_SCRIPT_PATH="${SHORTS_BASE}/slides.script.json"
SHORTS_RENDER_TEMPLATE_PATH="${SHORTS_BASE}/slides.render.template.json"
SHORTS_RENDER_JSON="${SHORTS_BASE}/slides.render.json"
if [ -n "${CUSTOM_RENDER_JSON}" ]; then
    SHORTS_RENDER_JSON="${CUSTOM_RENDER_JSON}"
fi
SHORTS_TSX_PATH="${ROOT_DIR}/web/src/generated/shorts-firm/${DATE}_${LANG}.generated.tsx"
SHORTS_OUTPUT_DIR="${SHORTS_BASE}/youtube"
SHORTS_BASENAME="${DATE}_${LANG}_shorts"
SHORTS_THUMBNAIL_BASENAME="${DATE}_${LANG}_shorts_thumbnail"
if [ -n "${PREVIEW_SECONDS}" ]; then
    SHORTS_BASENAME="${DATE}_${LANG}_shorts_preview_${PREVIEW_SECONDS}s"
    SHORTS_THUMBNAIL_BASENAME="${DATE}_${LANG}_shorts_preview_${PREVIEW_SECONDS}s_thumbnail"
fi
SHORTS_OUTPUT_WEBM="${SHORTS_OUTPUT_DIR}/${SHORTS_BASENAME}.webm"
SHORTS_OUTPUT_MP4="${SHORTS_OUTPUT_DIR}/${SHORTS_BASENAME}.mp4"
SHORTS_THUMBNAIL_PNG="${SHORTS_OUTPUT_DIR}/${SHORTS_THUMBNAIL_BASENAME}.png"
SHORTS_WEB_DATA_PATH="${ROOT_DIR}/web/public/data/shorts-firm/${DATE}.json"
SHORTS_WEB_AUDIO_PATH="${ROOT_DIR}/web/public/audio/shorts-firm/shortsfirm${DATE}.mp3"

if [ ! -d "${EPISODE_BASE}" ]; then
    echo "❌ Episode directory not found: ${EPISODE_BASE}"
    exit 1
fi

mkdir -p "${SHORTS_BASE}"

echo "========================================================"
echo "🎬 Shorts-Firm Independent Pipeline Start"
echo "📅 Date: ${DATE}"
echo "🌐 Language: ${LANG}"
echo "▶️  Start from: Step ${START_FROM}"
echo "☁️  Upload: $( [ "${UPLOAD}" -eq 1 ] && echo "Yes (${PRIVACY})" || echo "No (--no-upload)" )"
echo "🐍 Python runner: $( [ "${USE_UV}" -eq 1 ] && echo "uv run python" || echo "${PYTHON_BIN}" )"
echo "🧠 Script/TTS config: ${PROMPT_CONFIG_PATH}"
echo "🧩 Slides config: ${SLIDES_PROMPT_CONFIG_PATH}"
echo "========================================================"

if [ "${START_FROM}" -le 1 ]; then
    CURRENT_STEP="step1_script"
    echo ""
    echo "[1/5] Generate script"
    generate_script
else
    echo ""
    echo "[1/5] Generate script skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 2 ]; then
    CURRENT_STEP="step2_tts"
    echo ""
    echo "[2/5] Generate TTS audio"
    generate_audio
else
    echo ""
    echo "[2/5] Generate TTS audio skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 3 ]; then
    CURRENT_STEP="step3_slide_and_tsx"
    echo ""
    echo "[3/5] Prepare slide script/template + TSX"
    prepare_slide_assets
else
    echo ""
    echo "[3/5] Prepare slide script/template + TSX skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 4 ]; then
    CURRENT_STEP="step4_render"
    echo ""
    echo "[4/5] Render shorts video"
    render_video
else
    echo ""
    echo "[4/5] Render shorts video skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 5 ]; then
    CURRENT_STEP="step5_upload"
    echo ""
    echo "[5/5] Upload shorts video"
    upload_video
else
    echo ""
    echo "[5/5] Upload shorts video skipped (start-from ${START_FROM})"
fi

CURRENT_STEP="done"
echo ""
echo "✅ Shorts-firm pipeline complete"
echo "🧠 Script: ${SHORTS_SCRIPT_PATH}"
echo "🎵 Audio: ${SHORTS_MP3}"
echo "🧩 Slides render: ${SHORTS_RENDER_JSON}"
echo "🧱 TSX: ${SHORTS_TSX_PATH}"
echo "📹 MP4: ${SHORTS_OUTPUT_MP4}"
echo "🖼️  Thumbnail: ${SHORTS_THUMBNAIL_PNG}"
