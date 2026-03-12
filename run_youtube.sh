#!/bin/bash

# ==============================================================================
# YouTube Full Pipeline (Episode + Shorts)
#
# Default flow:
#   1) Episode render (browser capture -> MP4)
#   2) Episode upload to YouTube (public by default)
#   3) Shorts + Shorts-Firm assets prepare (script/audio/slides as needed)
#   4) Shorts + Shorts-Firm render (Remotion -> MP4 + first-frame thumbnail)
#   5) Shorts + Shorts-Firm upload to YouTube (public by default)
#
# Usage:
#   ./run_youtube.sh YYYYMMDD --lang ko|en [--start-from N] [--overwrite]
#
# --start-from step map:
#   1 = episode render
#   2 = episode upload
#   3 = shorts assets prepare
#   4 = shorts render (+ shorts thumbnail first frame)
#   5 = shorts upload
# ==============================================================================

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
YOUTUBE_UPLOAD_SCRIPT="${ROOT_DIR}/shared/ops/scripts/youtube/upload_youtube_video.py"
if [ ! -f "${YOUTUBE_UPLOAD_SCRIPT}" ] && [ -f "${ROOT_DIR}/scripts/upload_youtube_video.py" ]; then
    YOUTUBE_UPLOAD_SCRIPT="${ROOT_DIR}/scripts/upload_youtube_video.py"
fi

DATE=""
LANG="ko"
START_FROM=1
OVERWRITE=0
UPLOAD=1
PRIVACY="public"
WEB_PORT="${YOUTUBE_WEB_PORT:-3100}"
MAX_SECONDS="${YOUTUBE_MAX_SECONDS:-1800}"
PREVIEW_SECONDS=""
TURN_LEAD_MS=550
START_DELAY_SECONDS=1
TRIM_START_SECONDS=1
REMOTION_TIMEOUT_MS="${YOUTUBE_REMOTION_TIMEOUT_MS:-180000}"
REMOTION_CONCURRENCY="${YOUTUBE_REMOTION_CONCURRENCY:-1}"
SHORTS_DURATION_SECONDS="${YOUTUBE_SHORTS_DURATION_SECONDS:-90}"
SHORTS_TTS_VOICE="${YOUTUBE_SHORTS_TTS_VOICE:-Charon}"
SHORTS_TTS_TEMPERATURE="${YOUTUBE_SHORTS_TTS_TEMPERATURE:-0.6}"
SHORTS_FIRM_DURATION_SECONDS="${YOUTUBE_SHORTS_FIRM_DURATION_SECONDS:-90}"
SHORTS_FIRM_TTS_VOICE="${YOUTUBE_SHORTS_FIRM_TTS_VOICE:-Charon}"
SHORTS_FIRM_TTS_TEMPERATURE="${YOUTUBE_SHORTS_FIRM_TTS_TEMPERATURE:-0.6}"
SHORTS_FIRM_PROMPT_CONFIG="${YOUTUBE_SHORTS_FIRM_PROMPT_CONFIG:-${ROOT_DIR}/shorts-firm/prompt/shorts_firm_pipeline.yaml}"
SHORTS_FIRM_SLIDES_PROMPT_CONFIG="${YOUTUBE_SHORTS_FIRM_SLIDES_PROMPT_CONFIG:-${ROOT_DIR}/shorts-firm/prompt/shorts_firm_slides.yaml}"
THUMBNAIL_SLIDE_INDEX="${YOUTUBE_THUMBNAIL_SLIDE_INDEX:-0}"
THUMBNAIL_WIDTH="${YOUTUBE_THUMBNAIL_WIDTH:-1280}"
THUMBNAIL_HEIGHT="${YOUTUBE_THUMBNAIL_HEIGHT:-720}"
THUMBNAIL_TIMEOUT_SECONDS="${YOUTUBE_THUMBNAIL_TIMEOUT_SECONDS:-120}"
EPISODE_RENDER_RETRY_MAX_ATTEMPTS="${YOUTUBE_EPISODE_RENDER_RETRY_MAX_ATTEMPTS:-3}"
EPISODE_RENDER_RETRY_DELAY_SECONDS="${YOUTUBE_EPISODE_RENDER_RETRY_DELAY_SECONDS:-5}"

WEB_PID=""
WEB_STARTED_BY_SCRIPT=0
WEB_LOG=""
CURRENT_STEP="init"

usage() {
    cat <<'EOF'
Usage:
  ./run_youtube.sh YYYYMMDD --lang ko|en [--start-from 1..5] [--overwrite] [--no-upload]

Options:
  --lang ko|en              Language path to render (default: ko)
  --start-from <n>          Resume from step n (1..5, default: 1)
                            1=episode render, 2=episode upload,
                            3=shorts+shorts-firm assets, 4=shorts+shorts-firm render, 5=shorts+shorts-firm upload
  --overwrite               Overwrite existing output files
  --privacy <value>         YouTube privacy status: private|unlisted|public (default: public)
  --no-upload               Render only, skip YouTube uploads
  --upload                  Force upload on (default behavior)
  --preview-seconds <n>     Render only first n seconds for quick verification
  --port <number>           Next.js local port for episode capture (default: 3100)
  --max-seconds <number>    Timeout in seconds for browser recording (default: 1800)
  --remotion-timeout-ms <n> Remotion timeout in ms for shorts render (default: 180000)
  --remotion-concurrency <n> Parsed for compatibility. Render concurrency is fixed to 1.
  -h, --help                Show this help
EOF
}

cleanup() {
    if [ "${WEB_STARTED_BY_SCRIPT}" -eq 1 ] && [ -n "${WEB_PID}" ] && kill -0 "${WEB_PID}" 2>/dev/null; then
        echo "🛑 Stopping web server (pid=${WEB_PID})..."
        kill "${WEB_PID}" || true
        wait "${WEB_PID}" 2>/dev/null || true
    fi
}

on_error() {
    local exit_code=$?
    echo "❌ Failed at ${CURRENT_STEP} (exit=${exit_code})"
    if [ -n "${WEB_LOG}" ] && [ -f "${WEB_LOG}" ]; then
        echo "---- ${WEB_LOG} (tail) ----"
        tail -n 60 "${WEB_LOG}" || true
        echo "---------------------------"
    fi
    exit "${exit_code}"
}

require_cmd() {
    local cmd="$1"
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

validate_mp4_streams() {
    local mp4_path="$1"
    local streams
    streams="$(ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "${mp4_path}" | tr '\n' ' ')"
    if [[ "${streams}" != *video* ]] || [[ "${streams}" != *audio* ]]; then
        echo "❌ MP4 validation failed (missing video/audio stream): ${mp4_path}"
        exit 1
    fi
}

resolve_full_script_path() {
    local path_a="${ROOT_DIR}/podcast/${DATE}/${LANG}/${DATE}.json"
    local path_b="${ROOT_DIR}/podcast/${DATE}/${LANG}/script.json"
    if [ -f "${path_a}" ]; then
        printf '%s\n' "${path_a}"
        return 0
    fi
    if [ -f "${path_b}" ]; then
        printf '%s\n' "${path_b}"
        return 0
    fi
    return 1
}

ensure_web_ready() {
    local target_url="$1"
    local output_dir="$2"
    local initial_port="${WEB_PORT}"
    local target_suffix="${target_url#http://127.0.0.1:${initial_port}}"
    local reuse_existing=0

    WEB_LOG="${output_dir}/next-dev.log"

    if curl -sSf "${target_url}" >/dev/null 2>&1; then
        reuse_existing=1
        echo "♻️  Reusing existing Next.js server on 127.0.0.1:${WEB_PORT}" >&2
    else
        local alt_port
        for alt_port in 3000 3001; do
            if [ "${initial_port}" = "${alt_port}" ]; then
                continue
            fi
            local alt_target_url="http://127.0.0.1:${alt_port}${target_suffix}"
            if curl -sSf "${alt_target_url}" >/dev/null 2>&1; then
                reuse_existing=1
                WEB_PORT="${alt_port}"
                target_url="${alt_target_url}"
                echo "♻️  Found existing Next.js server on 127.0.0.1:${alt_port}" >&2
                echo "🔗 Updated target URL: ${target_url}" >&2
                break
            fi
        done
    fi

    if [ "${reuse_existing}" -ne 1 ]; then
        local next_lock_path="${ROOT_DIR}/web/.next/dev/lock"
        if [ -f "${next_lock_path}" ]; then
            echo "⚠️  Found stale Next.js lock. Removing: ${next_lock_path}" >&2
            rm -f "${next_lock_path}" || true
        fi
    fi

    if [ "${reuse_existing}" -ne 1 ]; then
        echo "🚀 Starting Next.js dev server on 127.0.0.1:${WEB_PORT}..." >&2
        (
            cd "${ROOT_DIR}/web"
            npm run dev -- --webpack --hostname 127.0.0.1 --port "${WEB_PORT}" >"${WEB_LOG}" 2>&1
        ) &
        WEB_PID=$!
        WEB_STARTED_BY_SCRIPT=1
    fi

    local ready=0
    local attempt
    for attempt in $(seq 1 120); do
        if curl -sSf "${target_url}" >/dev/null 2>&1; then
            ready=1
            break
        fi
        if [ "${WEB_STARTED_BY_SCRIPT}" -eq 1 ] && ! kill -0 "${WEB_PID}" 2>/dev/null; then
            echo "❌ Web server exited unexpectedly. Log: ${WEB_LOG}" >&2
            if [ -f "${WEB_LOG}" ]; then
                tail -n 40 "${WEB_LOG}" >&2 || true
            fi
            exit 1
        fi
        if [ $((attempt % 15)) -eq 0 ]; then
            echo "⏳ Waiting for Next.js readiness (${attempt}s): ${target_url}" >&2
        fi
        sleep 1
    done

    if [ "${ready}" -ne 1 ]; then
        echo "❌ Timed out waiting for web server readiness: ${target_url}" >&2
        exit 1
    fi

    printf '%s\n' "${target_url}"
}

enforce_shorts_duration_limit() {
    local mp4_path="$1"
    local max_seconds=59
    local raw_duration
    raw_duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${mp4_path}" | tr -d '\r')"
    local is_over
    is_over="$(awk -v d="${raw_duration}" -v m="${max_seconds}" 'BEGIN { print (d > m) ? 1 : 0 }')"

    if [ "${is_over}" -ne 1 ]; then
        echo "✅ Shorts duration OK: ${raw_duration}s (<= ${max_seconds}s)"
        return 0
    fi

    local speed_ratio
    speed_ratio="$(awk -v d="${raw_duration}" -v m="${max_seconds}" 'BEGIN { printf "%.6f", d / m }')"
    local video_pts
    video_pts="$(awk -v r="${speed_ratio}" 'BEGIN { printf "%.6f", 1.0 / r }')"

    echo "⚡ Shorts speed-up: ${raw_duration}s -> ${max_seconds}s (${speed_ratio}x)"

    local atempo_filters=""
    local remaining="${speed_ratio}"
    while awk -v r="${remaining}" 'BEGIN { exit !(r > 2.0) }'; do
        atempo_filters="${atempo_filters}atempo=2.0,"
        remaining="$(awk -v r="${remaining}" 'BEGIN { printf "%.6f", r / 2.0 }')"
    done
    atempo_filters="${atempo_filters}atempo=${remaining}"

    local tmp_path="${mp4_path%.mp4}_speedup.mp4"
    ffmpeg -hide_banner -loglevel error -y \
        -i "${mp4_path}" \
        -filter:v "setpts=${video_pts}*PTS" \
        -filter:a "${atempo_filters}" \
        -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p \
        -c:a aac -b:a 192k \
        -movflags +faststart \
        "${tmp_path}"

    mv "${tmp_path}" "${mp4_path}"
    local new_duration
    new_duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${mp4_path}" | tr -d '\r')"
    echo "✅ Shorts speed-up complete: ${new_duration}s"
}

render_episode_video() {
    require_cmd ffmpeg
    require_cmd ffprobe
    require_cmd node
    require_cmd npm
    require_cmd curl

    local record_script="${ROOT_DIR}/web/scripts/record_episode_video.mjs"
    local thumbnail_capture_script="${ROOT_DIR}/web/scripts/capture_thumbnail.mjs"
    require_file "${record_script}"
    require_file "${thumbnail_capture_script}"
    require_file "${EPISODE_JSON}"
    require_file "${EPISODE_MP3}"

    mkdir -p "${EPISODE_OUTPUT_DIR}"
    mkdir -p "${ROOT_DIR}/web/public/data"
    mkdir -p "${ROOT_DIR}/web/public/audio"

    if [ -f "${EPISODE_OUTPUT_MP4}" ] && [ "${OVERWRITE}" -ne 1 ]; then
        echo "❌ Output already exists: ${EPISODE_OUTPUT_MP4}"
        echo "   Use --overwrite to replace existing files."
        exit 1
    fi
    if [ "${OVERWRITE}" -eq 1 ]; then
        rm -f "${EPISODE_OUTPUT_WEBM}" "${EPISODE_OUTPUT_MP4}" "${EPISODE_THUMBNAIL_PNG}"
    fi

    echo "📂 Syncing episode assets into web/public..."
    cp "${EPISODE_JSON}" "${EPISODE_WEB_DATA_PATH}"
    cp "${EPISODE_MP3}" "${EPISODE_WEB_AUDIO_PATH}"
    local episode_display_date=""
    episode_display_date="$(node -e "const fs=require('fs'); try { const d=JSON.parse(fs.readFileSync(process.argv[1],'utf8')).date; process.stdout.write(typeof d === 'string' ? d : ''); } catch { process.stdout.write(''); }" "${EPISODE_JSON}")"
    if [[ "${episode_display_date}" =~ ^[0-9]{8}$ ]] && [ "${episode_display_date}" != "${DATE}" ]; then
        cp "${EPISODE_MP3}" "${ROOT_DIR}/web/public/audio/${episode_display_date}.mp3"
        echo "📂 Synced display-date audio alias: ${episode_display_date}.mp3"
    fi

    local audio_duration
    audio_duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${EPISODE_MP3}" | tr -d '\r')"
    if [ -z "${audio_duration}" ]; then
        echo "❌ Failed to read audio duration: ${EPISODE_MP3}"
        exit 1
    fi

    local target_duration="${audio_duration}"
    if [ -n "${PREVIEW_SECONDS}" ]; then
        target_duration="$(awk -v p="${PREVIEW_SECONDS}" -v a="${audio_duration}" 'BEGIN { if (p < a) print p; else print a }')"
    fi

    local target_url="http://127.0.0.1:${WEB_PORT}/youtube/episode/${DATE}"
    if [ "${TURN_LEAD_MS}" -ne 0 ]; then
        target_url="${target_url}?leadMs=${TURN_LEAD_MS}"
    fi
    if [[ "${target_url}" == *\?* ]]; then
        target_url="${target_url}&autoplay=1&capture=1"
    else
        target_url="${target_url}?autoplay=1&capture=1"
    fi
    target_url="$(ensure_web_ready "${target_url}" "${EPISODE_OUTPUT_DIR}")"
    echo "🔗 Episode target URL: ${target_url}"

    echo "🎥 Recording episode UI to WEBM..."
    local record_seconds="${MAX_SECONDS}"
    local record_args=(
        --url "${target_url}"
        --output "${EPISODE_OUTPUT_WEBM}"
        --start-delay-seconds "${START_DELAY_SECONDS}"
        --max-seconds "${record_seconds}"
        --width "1920"
        --height "1080"
    )
    if [ -n "${PREVIEW_SECONDS}" ]; then
        record_seconds="${PREVIEW_SECONDS}"
        record_args=(
            --url "${target_url}"
            --output "${EPISODE_OUTPUT_WEBM}"
            --stop-on-timeout
            --start-delay-seconds "${START_DELAY_SECONDS}"
            --max-seconds "${record_seconds}"
            --width "1920"
            --height "1080"
        )
    fi
    node "${record_script}" "${record_args[@]}"

    echo "🎞️  Muxing episode WEBM + MP3 -> MP4..."
    ffmpeg -hide_banner -loglevel error -y \
        -ss "${TRIM_START_SECONDS}" -i "${EPISODE_OUTPUT_WEBM}" \
        -i "${EPISODE_MP3}" \
        -map 0:v:0 \
        -map 1:a:0 \
        -t "${target_duration}" \
        -c:v libx264 \
        -preset veryfast \
        -crf 20 \
        -c:a aac \
        -b:a 192k \
        -shortest \
        -movflags +faststart \
        "${EPISODE_OUTPUT_MP4}"

    validate_mp4_streams "${EPISODE_OUTPUT_MP4}"

    if [ -f "${EPISODE_THUMBNAIL_PNG}" ]; then
        echo "🖼️  Reusing existing episode thumbnail: ${EPISODE_THUMBNAIL_PNG}"
    else
        echo "🖼️  Capturing episode thumbnail from /youtube/thumbnail route..."
        local thumbnail_url="http://127.0.0.1:${WEB_PORT}/youtube/thumbnail/${DATE}?slide=${THUMBNAIL_SLIDE_INDEX}"
        thumbnail_url="$(ensure_web_ready "${thumbnail_url}" "${EPISODE_OUTPUT_DIR}")"
        node "${thumbnail_capture_script}" \
            --url "${thumbnail_url}" \
            --output "${EPISODE_THUMBNAIL_PNG}" \
            --width "${THUMBNAIL_WIDTH}" \
            --height "${THUMBNAIL_HEIGHT}" \
            --timeout "$((THUMBNAIL_TIMEOUT_SECONDS * 1000))"
    fi

    cleanup
    WEB_PID=""
    WEB_STARTED_BY_SCRIPT=0
}

run_step1_with_retry() {
    local attempt=1
    local max_attempts="${EPISODE_RENDER_RETRY_MAX_ATTEMPTS}"

    while [ "${attempt}" -le "${max_attempts}" ]; do
        echo "  🔁 Step 1 attempt ${attempt}/${max_attempts}..."
        if render_episode_video; then
            if [ "${attempt}" -gt 1 ]; then
                echo "  ✅ Step 1 recovered on attempt ${attempt}/${max_attempts}"
            fi
            return 0
        fi

        local exit_code=$?
        if [ "${attempt}" -lt "${max_attempts}" ]; then
            echo "  ⚠️  Step 1 failed (exit=${exit_code}). Retrying in ${EPISODE_RENDER_RETRY_DELAY_SECONDS}s..."
            cleanup
            WEB_PID=""
            WEB_STARTED_BY_SCRIPT=0
            sleep "${EPISODE_RENDER_RETRY_DELAY_SECONDS}"
        else
            echo "  ❌ Step 1 failed after ${max_attempts} attempts."
            return "${exit_code}"
        fi

        attempt=$((attempt + 1))
    done
}

upload_episode_video() {
    if [ "${UPLOAD}" -ne 1 ]; then
        echo "⏭️  Upload disabled. Skipping episode upload."
        return 0
    fi

    require_file "${EPISODE_OUTPUT_MP4}"
    require_cmd uv
    require_file "${YOUTUBE_UPLOAD_SCRIPT}"

    echo "☁️  Uploading episode MP4 to YouTube..."
    local upload_args=(
        --file "${EPISODE_OUTPUT_MP4}"
        --date "${DATE}"
        --lang "${LANG}"
        --privacy "${PRIVACY}"
    )
    if [ -f "${EPISODE_THUMBNAIL_PNG}" ]; then
        upload_args+=(--thumbnail "${EPISODE_THUMBNAIL_PNG}")
    else
        echo "⚠️  Episode thumbnail not found. Uploading without thumbnail."
    fi
    uv run python "${YOUTUBE_UPLOAD_SCRIPT}" "${upload_args[@]}"

    if [ -f "${EPISODE_OUTPUT_WEBM}" ]; then
        rm -f "${EPISODE_OUTPUT_WEBM}"
        echo "🧹 Removed episode intermediate WEBM: ${EPISODE_OUTPUT_WEBM}"
    fi
}

prepare_shorts_assets() {
    require_cmd uv
    mkdir -p "${SHORTS_BASE}"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SHORTS_SCRIPT_PATH}" ]; then
        require_file "${ROOT_DIR}/shorts/generate_shorts.py"
        require_file "${EPISODE_JSON}"
        require_file "${EPISODE_BASE}/metadata.txt"
        echo "🧠 Generating shorts script..."
        uv run "${ROOT_DIR}/shorts/generate_shorts.py" "${EPISODE_BASE}" --duration "${SHORTS_DURATION_SECONDS}"
    else
        echo "♻️  Reusing existing shorts script: ${SHORTS_SCRIPT_PATH}"
    fi
    require_file "${SHORTS_SCRIPT_PATH}"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SHORTS_MP3}" ] || [ ! -f "${SHORTS_SECTION_TIMING_PATH}" ]; then
        require_file "${ROOT_DIR}/shorts/generate_shorts_audio.py"
        echo "🎙️  Generating shorts audio + section timings..."
        uv run python "${ROOT_DIR}/shorts/generate_shorts_audio.py" \
            "${DATE}" \
            --lang "${LANG}" \
            --voice "${SHORTS_TTS_VOICE}" \
            --temperature "${SHORTS_TTS_TEMPERATURE}"
    else
        echo "♻️  Reusing existing shorts audio/timing: ${SHORTS_MP3}"
    fi
    require_file "${SHORTS_MP3}"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SHORTS_RENDER_JSON}" ]; then
        require_file "${ROOT_DIR}/shorts/generate_shorts_slides.py"
        local full_script_path
        if ! full_script_path="$(resolve_full_script_path)"; then
            echo "❌ Full script not found: ${ROOT_DIR}/podcast/${DATE}/${LANG}/${DATE}.json or script.json"
            exit 1
        fi
        echo "🧩 Generating shorts slides render JSON..."
        local slide_args=(
            "${DATE}"
            --lang "${LANG}"
            --shorts-script "${SHORTS_SCRIPT_PATH}"
            --full-script "${full_script_path}"
            --output "${SHORTS_RENDER_JSON}"
        )
        if [ -f "${SHORTS_SECTION_TIMING_PATH}" ]; then
            slide_args+=(--section-timing "${SHORTS_SECTION_TIMING_PATH}")
        fi
        uv run python "${ROOT_DIR}/shorts/generate_shorts_slides.py" "${slide_args[@]}"
    else
        echo "♻️  Reusing existing shorts render JSON: ${SHORTS_RENDER_JSON}"
    fi
    require_file "${SHORTS_RENDER_JSON}"
}

prepare_shorts_firm_assets() {
    require_cmd uv
    mkdir -p "${SHORTS_FIRM_BASE}"

    require_file "${SHORTS_FIRM_PROMPT_CONFIG}"
    require_file "${SHORTS_FIRM_SLIDES_PROMPT_CONFIG}"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SHORTS_FIRM_SCRIPT_PATH}" ]; then
        require_file "${ROOT_DIR}/shorts-firm/generate_script.py"
        require_file "${EPISODE_BASE}/script.json"
        require_file "${EPISODE_BASE}/metadata.txt"
        echo "🧠 Generating shorts-firm script..."
        uv run python "${ROOT_DIR}/shorts-firm/generate_script.py" \
            "${EPISODE_BASE}" \
            --duration "${SHORTS_FIRM_DURATION_SECONDS}" \
            --prompt-config "${SHORTS_FIRM_PROMPT_CONFIG}"
    else
        echo "♻️  Reusing existing shorts-firm script: ${SHORTS_FIRM_SCRIPT_PATH}"
    fi
    require_file "${SHORTS_FIRM_SCRIPT_PATH}"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SHORTS_FIRM_MP3}" ] || [ ! -f "${SHORTS_FIRM_SECTION_TIMING_PATH}" ]; then
        require_file "${ROOT_DIR}/shorts-firm/generate_audio.py"
        echo "🎙️  Generating shorts-firm audio + section timings..."
        uv run python "${ROOT_DIR}/shorts-firm/generate_audio.py" \
            "${DATE}" \
            --lang "${LANG}" \
            --voice "${SHORTS_FIRM_TTS_VOICE}" \
            --temperature "${SHORTS_FIRM_TTS_TEMPERATURE}" \
            --config "${SHORTS_FIRM_PROMPT_CONFIG}"
    else
        echo "♻️  Reusing existing shorts-firm audio/timing: ${SHORTS_FIRM_MP3}"
    fi
    require_file "${SHORTS_FIRM_MP3}"
    require_file "${SHORTS_FIRM_SECTION_TIMING_PATH}"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SHORTS_FIRM_RENDER_JSON}" ] || [ ! -f "${SHORTS_FIRM_SLIDE_SCRIPT_PATH}" ] || [ ! -f "${SHORTS_FIRM_RENDER_TEMPLATE_PATH}" ]; then
        require_file "${ROOT_DIR}/shorts-firm/generate_slide_script.py"
        echo "🧩 Generating shorts-firm slides render JSON..."
        uv run python "${ROOT_DIR}/shorts-firm/generate_slide_script.py" \
            "${DATE}" \
            --lang "${LANG}" \
            --script "${SHORTS_FIRM_SCRIPT_PATH}" \
            --timing "${SHORTS_FIRM_SECTION_TIMING_PATH}" \
            --script-output "${SHORTS_FIRM_SLIDE_SCRIPT_PATH}" \
            --template-output "${SHORTS_FIRM_RENDER_TEMPLATE_PATH}" \
            --render-output "${SHORTS_FIRM_RENDER_JSON}" \
            --config "${SHORTS_FIRM_SLIDES_PROMPT_CONFIG}" \
            --overwrite-render
    else
        echo "♻️  Reusing existing shorts-firm render JSON: ${SHORTS_FIRM_RENDER_JSON}"
    fi
    require_file "${SHORTS_FIRM_RENDER_JSON}"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SHORTS_FIRM_TSX_PATH}" ]; then
        require_file "${ROOT_DIR}/shorts-firm/generate_tsx.py"
        echo "🧱 Generating shorts-firm TSX payload..."
        uv run python "${ROOT_DIR}/shorts-firm/generate_tsx.py" \
            "${DATE}" \
            --lang "${LANG}" \
            --input "${SHORTS_FIRM_RENDER_JSON}" \
            --output "${SHORTS_FIRM_TSX_PATH}"
    else
        echo "♻️  Reusing existing shorts-firm TSX payload: ${SHORTS_FIRM_TSX_PATH}"
    fi
    require_file "${SHORTS_FIRM_TSX_PATH}"
}

render_shorts_video() {
    require_cmd ffmpeg
    require_cmd ffprobe
    require_cmd node
    require_cmd npx
    require_file "${ROOT_DIR}/web/scripts/render_shorts_remotion.mjs"
    require_file "${SHORTS_RENDER_JSON}"
    require_file "${SHORTS_MP3}"

    mkdir -p "${SHORTS_OUTPUT_DIR}"
    mkdir -p "${ROOT_DIR}/web/public/data/shorts"
    mkdir -p "${ROOT_DIR}/web/public/audio/shorts"

    if [ -f "${SHORTS_OUTPUT_MP4}" ] && [ "${OVERWRITE}" -ne 1 ]; then
        echo "❌ Output already exists: ${SHORTS_OUTPUT_MP4}"
        echo "   Use --overwrite to replace existing files."
        exit 1
    fi
    if [ "${OVERWRITE}" -eq 1 ]; then
        rm -f "${SHORTS_OUTPUT_MP4}" "${SHORTS_THUMBNAIL_PNG}" "${SHORTS_OUTPUT_WEBM}"
    fi

    echo "📂 Syncing shorts assets into web/public..."
    cp "${SHORTS_RENDER_JSON}" "${SHORTS_WEB_DATA_PATH}"
    cp "${SHORTS_MP3}" "${SHORTS_WEB_AUDIO_PATH}"

    echo "🎬 Rendering shorts via Remotion..."
    local remotion_args=(
        --episode-json "${SHORTS_RENDER_JSON}"
        --output "${SHORTS_OUTPUT_MP4}"
        --audio-src "audio/shorts/${DATE}.mp3"
        --timeout "${REMOTION_TIMEOUT_MS}"
        --concurrency "${REMOTION_CONCURRENCY}"
    )
    if [ -n "${PREVIEW_SECONDS}" ]; then
        remotion_args+=(--preview-seconds "${PREVIEW_SECONDS}")
    fi
    node "${ROOT_DIR}/web/scripts/render_shorts_remotion.mjs" "${remotion_args[@]}"

    enforce_shorts_duration_limit "${SHORTS_OUTPUT_MP4}"
    validate_mp4_streams "${SHORTS_OUTPUT_MP4}"

    echo "🖼️  Creating shorts thumbnail from first frame..."
    ffmpeg -hide_banner -loglevel error -y \
        -i "${SHORTS_OUTPUT_MP4}" \
        -frames:v 1 \
        "${SHORTS_THUMBNAIL_PNG}"
}

render_shorts_firm_video() {
    require_cmd ffmpeg
    require_cmd ffprobe
    require_cmd node
    require_file "${ROOT_DIR}/shorts-firm/render_shorts_remotion.mjs"
    require_file "${SHORTS_FIRM_RENDER_JSON}"
    require_file "${SHORTS_FIRM_MP3}"
    require_file "${SHORTS_FIRM_SECTION_TIMING_PATH}"

    mkdir -p "${SHORTS_FIRM_OUTPUT_DIR}"
    mkdir -p "${ROOT_DIR}/web/public/data/shorts-firm"
    mkdir -p "${ROOT_DIR}/web/public/audio/shorts-firm"

    if [ -f "${SHORTS_FIRM_OUTPUT_MP4}" ] && [ "${OVERWRITE}" -ne 1 ]; then
        echo "❌ Output already exists: ${SHORTS_FIRM_OUTPUT_MP4}"
        echo "   Use --overwrite to replace existing files."
        exit 1
    fi
    if [ "${OVERWRITE}" -eq 1 ]; then
        rm -f "${SHORTS_FIRM_OUTPUT_MP4}" "${SHORTS_FIRM_THUMBNAIL_PNG}" "${SHORTS_FIRM_OUTPUT_WEBM}"
    fi

    echo "📂 Syncing shorts-firm assets into web/public..."
    cp "${SHORTS_FIRM_RENDER_JSON}" "${SHORTS_FIRM_WEB_DATA_PATH}"
    cp "${SHORTS_FIRM_MP3}" "${SHORTS_FIRM_WEB_AUDIO_PATH}"

    echo "🎬 Rendering shorts-firm via Remotion..."
    local remotion_args=(
        --episode-json "${SHORTS_FIRM_RENDER_JSON}"
        --section-timing-json "${SHORTS_FIRM_SECTION_TIMING_PATH}"
        --output "${SHORTS_FIRM_OUTPUT_MP4}"
        --audio-src "audio/shorts-firm/shortsfirm${DATE}.mp3"
        --timeout "${REMOTION_TIMEOUT_MS}"
        --concurrency "${REMOTION_CONCURRENCY}"
    )
    if [ -n "${PREVIEW_SECONDS}" ]; then
        remotion_args+=(--preview-seconds "${PREVIEW_SECONDS}")
    fi
    node "${ROOT_DIR}/shorts-firm/render_shorts_remotion.mjs" "${remotion_args[@]}"

    enforce_shorts_duration_limit "${SHORTS_FIRM_OUTPUT_MP4}"
    validate_mp4_streams "${SHORTS_FIRM_OUTPUT_MP4}"

    echo "🖼️  Creating shorts-firm thumbnail from first frame..."
    ffmpeg -hide_banner -loglevel error -y \
        -i "${SHORTS_FIRM_OUTPUT_MP4}" \
        -frames:v 1 \
        "${SHORTS_FIRM_THUMBNAIL_PNG}"
}

upload_shorts_video() {
    if [ "${UPLOAD}" -ne 1 ]; then
        echo "⏭️  Upload disabled. Skipping shorts upload."
        return 0
    fi

    require_file "${SHORTS_OUTPUT_MP4}"
    require_cmd uv
    require_file "${YOUTUBE_UPLOAD_SCRIPT}"

    echo "☁️  Uploading shorts MP4 to YouTube..."
    local upload_args=(
        --file "${SHORTS_OUTPUT_MP4}"
        --date "${DATE}"
        --lang "${LANG}"
        --privacy "${PRIVACY}"
    )
    if [ -f "${SHORTS_THUMBNAIL_PNG}" ]; then
        upload_args+=(--thumbnail "${SHORTS_THUMBNAIL_PNG}")
    else
        echo "⚠️  Shorts thumbnail not found. Uploading without thumbnail."
    fi
    uv run python "${YOUTUBE_UPLOAD_SCRIPT}" "${upload_args[@]}"

    if [ -f "${SHORTS_OUTPUT_WEBM}" ]; then
        rm -f "${SHORTS_OUTPUT_WEBM}"
        echo "🧹 Removed shorts intermediate WEBM: ${SHORTS_OUTPUT_WEBM}"
    fi
}

upload_shorts_firm_video() {
    if [ "${UPLOAD}" -ne 1 ]; then
        echo "⏭️  Upload disabled. Skipping shorts-firm upload."
        return 0
    fi

    require_file "${SHORTS_FIRM_OUTPUT_MP4}"
    require_cmd uv
    require_file "${YOUTUBE_UPLOAD_SCRIPT}"

    echo "☁️  Uploading shorts-firm MP4 to YouTube..."
    local upload_args=(
        --file "${SHORTS_FIRM_OUTPUT_MP4}"
        --date "${DATE}"
        --lang "${LANG}"
        --privacy "${PRIVACY}"
    )
    if [ -f "${SHORTS_FIRM_THUMBNAIL_PNG}" ]; then
        upload_args+=(--thumbnail "${SHORTS_FIRM_THUMBNAIL_PNG}")
    else
        echo "⚠️  Shorts-firm thumbnail not found. Uploading without thumbnail."
    fi
    uv run python "${YOUTUBE_UPLOAD_SCRIPT}" "${upload_args[@]}"

    if [ -f "${SHORTS_FIRM_OUTPUT_WEBM}" ]; then
        rm -f "${SHORTS_FIRM_OUTPUT_WEBM}"
        echo "🧹 Removed shorts-firm intermediate WEBM: ${SHORTS_FIRM_OUTPUT_WEBM}"
    fi
}

trap on_error ERR
trap cleanup EXIT INT TERM

if [ $# -eq 0 ]; then
    usage
    exit 1
fi

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
        --overwrite)
            OVERWRITE=1
            shift
            ;;
        --upload)
            UPLOAD=1
            shift
            ;;
        --no-upload)
            UPLOAD=0
            shift
            ;;
        --privacy)
            PRIVACY="$2"
            shift 2
            ;;
        --preview-seconds)
            PREVIEW_SECONDS="$2"
            shift 2
            ;;
        --port)
            WEB_PORT="$2"
            shift 2
            ;;
        --max-seconds)
            MAX_SECONDS="$2"
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

if ! [[ "${START_FROM}" =~ ^[0-9]+$ ]]; then
    echo "❌ --start-from must be numeric: ${START_FROM}"
    exit 1
fi

if [ "${START_FROM}" -lt 1 ] || [ "${START_FROM}" -gt 5 ]; then
    echo "❌ --start-from must be within 1..5: ${START_FROM}"
    exit 1
fi

if [[ "${PRIVACY}" != "private" && "${PRIVACY}" != "unlisted" && "${PRIVACY}" != "public" ]]; then
    echo "❌ --privacy must be one of: private, unlisted, public"
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

if ! [[ "${WEB_PORT}" =~ ^[0-9]+$ ]]; then
    echo "❌ --port must be numeric: ${WEB_PORT}"
    exit 1
fi

if ! [[ "${THUMBNAIL_SLIDE_INDEX}" =~ ^[0-9]+$ ]]; then
    echo "❌ YOUTUBE_THUMBNAIL_SLIDE_INDEX must be numeric: ${THUMBNAIL_SLIDE_INDEX}"
    exit 1
fi

if ! [[ "${THUMBNAIL_WIDTH}" =~ ^[0-9]+$ ]]; then
    echo "❌ YOUTUBE_THUMBNAIL_WIDTH must be numeric: ${THUMBNAIL_WIDTH}"
    exit 1
fi

if ! [[ "${THUMBNAIL_HEIGHT}" =~ ^[0-9]+$ ]]; then
    echo "❌ YOUTUBE_THUMBNAIL_HEIGHT must be numeric: ${THUMBNAIL_HEIGHT}"
    exit 1
fi

if ! [[ "${THUMBNAIL_TIMEOUT_SECONDS}" =~ ^[0-9]+$ ]]; then
    echo "❌ YOUTUBE_THUMBNAIL_TIMEOUT_SECONDS must be numeric: ${THUMBNAIL_TIMEOUT_SECONDS}"
    exit 1
fi

if ! [[ "${MAX_SECONDS}" =~ ^[0-9]+$ ]]; then
    echo "❌ --max-seconds must be numeric: ${MAX_SECONDS}"
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
if [ "${REMOTION_CONCURRENCY}" -ne 1 ]; then
    echo "⚠️  Remotion concurrency is fixed to 1. Ignoring requested value: ${REMOTION_CONCURRENCY}"
fi
REMOTION_CONCURRENCY=1

if [[ "${SHORTS_FIRM_PROMPT_CONFIG}" != /* ]]; then
    SHORTS_FIRM_PROMPT_CONFIG="${ROOT_DIR}/${SHORTS_FIRM_PROMPT_CONFIG}"
fi
if [[ "${SHORTS_FIRM_SLIDES_PROMPT_CONFIG}" != /* ]]; then
    SHORTS_FIRM_SLIDES_PROMPT_CONFIG="${ROOT_DIR}/${SHORTS_FIRM_SLIDES_PROMPT_CONFIG}"
fi

require_file "${SHORTS_FIRM_PROMPT_CONFIG}"
require_file "${SHORTS_FIRM_SLIDES_PROMPT_CONFIG}"

EPISODE_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}"
EPISODE_JSON="${EPISODE_BASE}/${DATE}.json"
if [ ! -f "${EPISODE_JSON}" ] && [ -f "${EPISODE_BASE}/script.json" ]; then
    EPISODE_JSON="${EPISODE_BASE}/script.json"
fi
EPISODE_MP3="${EPISODE_BASE}/${DATE}.mp3"
EPISODE_OUTPUT_DIR="${EPISODE_BASE}/youtube"
EPISODE_BASENAME="${DATE}_${LANG}_episode"
EPISODE_THUMBNAIL_BASENAME="${DATE}_${LANG}_thumbnail"
if [ -n "${PREVIEW_SECONDS}" ]; then
    EPISODE_BASENAME="${DATE}_${LANG}_episode_preview_${PREVIEW_SECONDS}s"
    EPISODE_THUMBNAIL_BASENAME="${DATE}_${LANG}_episode_preview_${PREVIEW_SECONDS}s_thumbnail"
fi
EPISODE_OUTPUT_WEBM="${EPISODE_OUTPUT_DIR}/${EPISODE_BASENAME}.webm"
EPISODE_OUTPUT_MP4="${EPISODE_OUTPUT_DIR}/${EPISODE_BASENAME}.mp4"
EPISODE_THUMBNAIL_PNG="${EPISODE_OUTPUT_DIR}/${EPISODE_THUMBNAIL_BASENAME}.png"
EPISODE_WEB_DATA_PATH="${ROOT_DIR}/web/public/data/${DATE}.json"
EPISODE_WEB_AUDIO_PATH="${ROOT_DIR}/web/public/audio/${DATE}.mp3"

SHORTS_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}/shorts"
SHORTS_SCRIPT_PATH="${SHORTS_BASE}/script.json"
SHORTS_MP3="${SHORTS_BASE}/shorts${DATE}.mp3"
SHORTS_SECTION_TIMING_PATH="${SHORTS_BASE}/sections.timing.json"
SHORTS_RENDER_JSON="${SHORTS_BASE}/slides.render.json"
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
SHORTS_WEB_DATA_PATH="${ROOT_DIR}/web/public/data/shorts/${DATE}.json"
SHORTS_WEB_AUDIO_PATH="${ROOT_DIR}/web/public/audio/shorts/${DATE}.mp3"

SHORTS_FIRM_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}/shorts-firm"
SHORTS_FIRM_SCRIPT_PATH="${SHORTS_FIRM_BASE}/script.json"
SHORTS_FIRM_MP3="${SHORTS_FIRM_BASE}/shortsfirm${DATE}.mp3"
SHORTS_FIRM_SECTION_TIMING_PATH="${SHORTS_FIRM_BASE}/sections.timing.json"
SHORTS_FIRM_SLIDE_SCRIPT_PATH="${SHORTS_FIRM_BASE}/slides.script.json"
SHORTS_FIRM_RENDER_TEMPLATE_PATH="${SHORTS_FIRM_BASE}/slides.render.template.json"
SHORTS_FIRM_RENDER_JSON="${SHORTS_FIRM_BASE}/slides.render.json"
SHORTS_FIRM_TSX_PATH="${ROOT_DIR}/web/src/generated/shorts-firm/${DATE}_${LANG}.generated.tsx"
SHORTS_FIRM_OUTPUT_DIR="${SHORTS_FIRM_BASE}/youtube"
SHORTS_FIRM_BASENAME="${DATE}_${LANG}_shorts"
SHORTS_FIRM_THUMBNAIL_BASENAME="${DATE}_${LANG}_shorts_thumbnail"
if [ -n "${PREVIEW_SECONDS}" ]; then
    SHORTS_FIRM_BASENAME="${DATE}_${LANG}_shorts_preview_${PREVIEW_SECONDS}s"
    SHORTS_FIRM_THUMBNAIL_BASENAME="${DATE}_${LANG}_shorts_preview_${PREVIEW_SECONDS}s_thumbnail"
fi
SHORTS_FIRM_OUTPUT_WEBM="${SHORTS_FIRM_OUTPUT_DIR}/${SHORTS_FIRM_BASENAME}.webm"
SHORTS_FIRM_OUTPUT_MP4="${SHORTS_FIRM_OUTPUT_DIR}/${SHORTS_FIRM_BASENAME}.mp4"
SHORTS_FIRM_THUMBNAIL_PNG="${SHORTS_FIRM_OUTPUT_DIR}/${SHORTS_FIRM_THUMBNAIL_BASENAME}.png"
SHORTS_FIRM_WEB_DATA_PATH="${ROOT_DIR}/web/public/data/shorts-firm/${DATE}.json"
SHORTS_FIRM_WEB_AUDIO_PATH="${ROOT_DIR}/web/public/audio/shorts-firm/shortsfirm${DATE}.mp3"

echo "========================================================"
echo "🎬 YouTube Full Pipeline Start"
echo "📅 Date: ${DATE}"
echo "🌐 Language: ${LANG}"
echo "▶️  Start from: Step ${START_FROM}"
echo "☁️  Upload: $( [ "${UPLOAD}" -eq 1 ] && echo "Yes (${PRIVACY})" || echo "No (--no-upload)" )"
echo "========================================================"

if [ "${START_FROM}" -le 1 ]; then
    CURRENT_STEP="step1_episode_render"
    echo ""
    echo "[1/5] Episode render (browser capture -> MP4)"
    run_step1_with_retry
else
    echo ""
    echo "[1/5] Episode render skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 2 ]; then
    CURRENT_STEP="step2_episode_upload"
    echo ""
    echo "[2/5] Episode upload"
    upload_episode_video
else
    echo ""
    echo "[2/5] Episode upload skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 3 ]; then
    CURRENT_STEP="step3_shorts_assets"
    echo ""
    echo "[3/5] Shorts + Shorts-Firm assets prepare"
    prepare_shorts_assets
    prepare_shorts_firm_assets
else
    echo ""
    echo "[3/5] Shorts + Shorts-Firm assets prepare skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 4 ]; then
    CURRENT_STEP="step4_shorts_render"
    echo ""
    echo "[4/5] Shorts + Shorts-Firm render (Remotion -> MP4 + first-frame thumbnail)"
    render_shorts_video
    render_shorts_firm_video
else
    echo ""
    echo "[4/5] Shorts + Shorts-Firm render skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 5 ]; then
    CURRENT_STEP="step5_shorts_upload"
    echo ""
    echo "[5/5] Shorts + Shorts-Firm upload"
    upload_shorts_video
    upload_shorts_firm_video
else
    echo ""
    echo "[5/5] Shorts + Shorts-Firm upload skipped (start-from ${START_FROM})"
fi

CURRENT_STEP="done"
echo ""
echo "✅ YouTube full pipeline complete"
echo "📹 Episode MP4: ${EPISODE_OUTPUT_MP4}"
echo "🖼️  Episode thumbnail: ${EPISODE_THUMBNAIL_PNG}"
echo "📹 Shorts MP4: ${SHORTS_OUTPUT_MP4}"
echo "🖼️  Shorts thumbnail: ${SHORTS_THUMBNAIL_PNG}"
echo "📹 Shorts-Firm MP4: ${SHORTS_FIRM_OUTPUT_MP4}"
echo "🖼️  Shorts-Firm thumbnail: ${SHORTS_FIRM_THUMBNAIL_PNG}"
