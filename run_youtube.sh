#!/bin/bash

# ==============================================================================
# YouTube Video Automation (Web Capture -> MP4 -> Optional Upload)
#
# Usage:
#   ./run_youtube.sh YYYYMMDD --lang ko|en [--shorts] [--upload] [--privacy private|unlisted|public]
#
# Examples:
#   ./run_youtube.sh 20260213 --lang ko
#   ./run_youtube.sh 20260220 --lang ko --shorts
#   ./run_youtube.sh 20260213 --lang ko --upload --privacy private
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
YOUTUBE_UPLOAD_SCRIPT="${ROOT_DIR}/shared/ops/scripts/youtube/upload_youtube_video.py"
if [ ! -f "${YOUTUBE_UPLOAD_SCRIPT}" ] && [ -f "${ROOT_DIR}/scripts/upload_youtube_video.py" ]; then
    YOUTUBE_UPLOAD_SCRIPT="${ROOT_DIR}/scripts/upload_youtube_video.py"
fi

DATE=""
LANG="ko"
IS_SHORTS=0
UPLOAD=0
PRIVACY="${YOUTUBE_PRIVACY_STATUS:-private}"
OVERWRITE=0
WEB_PORT="${YOUTUBE_WEB_PORT:-3100}"
MAX_SECONDS="${YOUTUBE_MAX_SECONDS:-1800}"
RENDER_MODE="${YOUTUBE_RENDER_MODE:-realtime}"
RENDER_ENGINE="${YOUTUBE_RENDER_ENGINE:-browser}"
PREVIEW_SECONDS=""
TURN_LEAD_MS="${YOUTUBE_TURN_LEAD_MS:-550}"
TRIM_START_SECONDS="${YOUTUBE_TRIM_START_SECONDS:-0}"
TRIM_SET_BY_FLAG=0
START_DELAY_SECONDS="${YOUTUBE_REALTIME_START_DELAY_SECONDS:-1}"
REMOTION_TIMEOUT_MS="${YOUTUBE_REMOTION_TIMEOUT_MS:-180000}"
REMOTION_CONCURRENCY="${YOUTUBE_REMOTION_CONCURRENCY:-2}"
THUMBNAIL_SLIDE_INDEX="${YOUTUBE_THUMBNAIL_SLIDE_INDEX:-0}"
THUMBNAIL_WIDTH="${YOUTUBE_THUMBNAIL_WIDTH:-1280}"
THUMBNAIL_HEIGHT="${YOUTUBE_THUMBNAIL_HEIGHT:-720}"
THUMBNAIL_TIMEOUT_SECONDS="${YOUTUBE_THUMBNAIL_TIMEOUT_SECONDS:-120}"
THUMBNAIL_WIDTH_SET=0
THUMBNAIL_HEIGHT_SET=0
THUMBNAIL_READY_SELECTOR='[data-testid="yt-thumbnail-ready"]'

WEB_PID=""
WEB_STARTED_BY_SCRIPT=0

usage() {
    cat <<'EOF'
Usage:
  ./run_youtube.sh YYYYMMDD --lang ko|en [--shorts] [--upload] [--privacy private|unlisted|public] [--overwrite]

Options:
  --lang ko|en              Language path to render (default: ko)
  --shorts                  Render shorts route/video (9:16) instead of full episode
  --upload                  Upload to YouTube after local MP4 render
  --privacy <value>         YouTube privacy status (default: env YOUTUBE_PRIVACY_STATUS or private)
  --render-mode <value>     realtime|timeline (default: env YOUTUBE_RENDER_MODE or realtime)
  --render-engine <value>   browser|remotion (default: env YOUTUBE_RENDER_ENGINE or browser)
  --remotion-timeout-ms <n> delayRender timeout in ms for remotion engine (default: env YOUTUBE_REMOTION_TIMEOUT_MS or 180000)
  --remotion-concurrency <n> concurrent frame workers for remotion engine (default: env YOUTUBE_REMOTION_CONCURRENCY or 2)
  --preview-seconds <n>     Render only first n seconds for quick verification
  --turn-lead-ms <n>        Advance slide turn matching by n milliseconds (default: env YOUTUBE_TURN_LEAD_MS or 550)
  --start-delay-seconds <n> Delay audio start by n seconds after recording begins in realtime mode (default: env YOUTUBE_REALTIME_START_DELAY_SECONDS or 1)
  --trim-start-seconds <n>  Trim first n seconds from recorded video only in realtime mode (default: env YOUTUBE_TRIM_START_SECONDS or auto=start-delay)
  --overwrite               Overwrite existing output MP4/WEBM
  --port <number>           Next.js local port (default: env YOUTUBE_WEB_PORT or 3100)
  --max-seconds <number>    Timeout in seconds for recording/capture scripts (default: env YOUTUBE_MAX_SECONDS or 1800)
  --thumbnail-slide <n>     Slide index to use for thumbnail capture (default: env YOUTUBE_THUMBNAIL_SLIDE_INDEX or 0)
  --thumbnail-width <n>     Thumbnail capture width (default: env YOUTUBE_THUMBNAIL_WIDTH or 1280)
  --thumbnail-height <n>    Thumbnail capture height (default: env YOUTUBE_THUMBNAIL_HEIGHT or 720)
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

require_cmd() {
    local cmd="$1"
    if ! command -v "${cmd}" >/dev/null 2>&1; then
        echo "❌ Required command not found: ${cmd}"
        exit 1
    fi
}

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
        --upload)
            UPLOAD=1
            shift
            ;;
        --shorts)
            IS_SHORTS=1
            shift
            ;;
        --privacy)
            PRIVACY="$2"
            shift 2
            ;;
        --render-mode)
            RENDER_MODE="$2"
            shift 2
            ;;
        --render-engine)
            RENDER_ENGINE="$2"
            shift 2
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
        --turn-lead-ms)
            TURN_LEAD_MS="$2"
            shift 2
            ;;
        --start-delay-seconds)
            START_DELAY_SECONDS="$2"
            shift 2
            ;;
        --trim-start-seconds)
            TRIM_START_SECONDS="$2"
            TRIM_SET_BY_FLAG=1
            shift 2
            ;;
        --overwrite)
            OVERWRITE=1
            shift
            ;;
        --port)
            WEB_PORT="$2"
            shift 2
            ;;
        --max-seconds)
            MAX_SECONDS="$2"
            shift 2
            ;;
        --thumbnail-slide)
            THUMBNAIL_SLIDE_INDEX="$2"
            shift 2
            ;;
        --thumbnail-width)
            THUMBNAIL_WIDTH="$2"
            THUMBNAIL_WIDTH_SET=1
            shift 2
            ;;
        --thumbnail-height)
            THUMBNAIL_HEIGHT="$2"
            THUMBNAIL_HEIGHT_SET=1
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

if [[ "${PRIVACY}" != "private" && "${PRIVACY}" != "unlisted" && "${PRIVACY}" != "public" ]]; then
    echo "❌ --privacy must be one of: private, unlisted, public"
    exit 1
fi

if [[ "${RENDER_MODE}" != "timeline" && "${RENDER_MODE}" != "realtime" ]]; then
    echo "❌ --render-mode must be one of: timeline, realtime"
    exit 1
fi

if [[ "${RENDER_ENGINE}" != "browser" && "${RENDER_ENGINE}" != "remotion" ]]; then
    echo "❌ --render-engine must be one of: browser, remotion"
    exit 1
fi

if [ "${RENDER_ENGINE}" = "remotion" ] && [ "${IS_SHORTS}" -ne 1 ]; then
    echo "❌ --render-engine remotion currently supports --shorts only"
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

if ! [[ "${TURN_LEAD_MS}" =~ ^-?[0-9]+$ ]]; then
    echo "❌ --turn-lead-ms must be an integer (ms): ${TURN_LEAD_MS}"
    exit 1
fi

if ! [[ "${START_DELAY_SECONDS}" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
    echo "❌ --start-delay-seconds must be a non-negative number: ${START_DELAY_SECONDS}"
    exit 1
fi

if ! [[ "${TRIM_START_SECONDS}" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
    echo "❌ --trim-start-seconds must be a non-negative number: ${TRIM_START_SECONDS}"
    exit 1
fi

if ! [[ "${WEB_PORT}" =~ ^[0-9]+$ ]]; then
    echo "❌ --port must be numeric: ${WEB_PORT}"
    exit 1
fi

if ! [[ "${MAX_SECONDS}" =~ ^[0-9]+$ ]]; then
    echo "❌ --max-seconds must be numeric: ${MAX_SECONDS}"
    exit 1
fi

if ! [[ "${REMOTION_TIMEOUT_MS}" =~ ^[0-9]+$ ]]; then
    echo "❌ --remotion-timeout-ms must be numeric: ${REMOTION_TIMEOUT_MS}"
    exit 1
fi

if [ "${REMOTION_TIMEOUT_MS}" -le 0 ]; then
    echo "❌ --remotion-timeout-ms must be > 0"
    exit 1
fi

if ! [[ "${REMOTION_CONCURRENCY}" =~ ^[0-9]+$ ]]; then
    echo "❌ --remotion-concurrency must be numeric: ${REMOTION_CONCURRENCY}"
    exit 1
fi

if [ "${REMOTION_CONCURRENCY}" -le 0 ]; then
    echo "❌ --remotion-concurrency must be > 0"
    exit 1
fi

if ! [[ "${THUMBNAIL_SLIDE_INDEX}" =~ ^[0-9]+$ ]]; then
    echo "❌ --thumbnail-slide must be numeric: ${THUMBNAIL_SLIDE_INDEX}"
    exit 1
fi

if ! [[ "${THUMBNAIL_WIDTH}" =~ ^[0-9]+$ ]]; then
    echo "❌ --thumbnail-width must be numeric: ${THUMBNAIL_WIDTH}"
    exit 1
fi

if ! [[ "${THUMBNAIL_HEIGHT}" =~ ^[0-9]+$ ]]; then
    echo "❌ --thumbnail-height must be numeric: ${THUMBNAIL_HEIGHT}"
    exit 1
fi

if ! [[ "${THUMBNAIL_TIMEOUT_SECONDS}" =~ ^[0-9]+$ ]]; then
    echo "❌ YOUTUBE_THUMBNAIL_TIMEOUT_SECONDS must be numeric: ${THUMBNAIL_TIMEOUT_SECONDS}"
    exit 1
fi

if [ "${RENDER_MODE}" = "realtime" ] && [ "${TRIM_SET_BY_FLAG}" -eq 0 ]; then
    if awk "BEGIN { exit !(${START_DELAY_SECONDS} > 0) }"; then
        TRIM_START_SECONDS="${START_DELAY_SECONDS}"
        echo "ℹ️  Auto-sync enabled: setting video trim to start delay (${TRIM_START_SECONDS}s)"
    fi
fi

if [ "${IS_SHORTS}" -eq 1 ]; then
    if [ "${THUMBNAIL_WIDTH_SET}" -eq 0 ]; then
        THUMBNAIL_WIDTH="1080"
    fi
    if [ "${THUMBNAIL_HEIGHT_SET}" -eq 0 ]; then
        THUMBNAIL_HEIGHT="1920"
    fi
    THUMBNAIL_READY_SELECTOR='[data-testid="yt-shorts-render-ready"]'
fi

require_cmd ffmpeg
require_cmd ffprobe
require_cmd node
require_cmd npm
require_cmd curl
if [ "${RENDER_ENGINE}" = "remotion" ]; then
    require_cmd npx
fi
if [ "${UPLOAD}" -eq 1 ] || [ "${IS_SHORTS}" -eq 1 ]; then
    require_cmd uv
fi
if [ "${UPLOAD}" -eq 1 ]; then
    if [ ! -f "${YOUTUBE_UPLOAD_SCRIPT}" ]; then
        echo "❌ YouTube upload script not found: ${YOUTUBE_UPLOAD_SCRIPT}"
        exit 1
    fi
fi

SRC_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}"
SRC_JSON="${SRC_BASE}/${DATE}.json"
SRC_MP3="${SRC_BASE}/${DATE}.mp3"

WEB_DATA_PATH="${ROOT_DIR}/web/public/data/${DATE}.json"
WEB_AUDIO_PATH="${ROOT_DIR}/web/public/audio/${DATE}.mp3"
TARGET_PATH="${YOUTUBE_CAPTURE_PATH:-/youtube/episode/${DATE}}"
OUTPUT_DIR="${SRC_BASE}/youtube"
OUTPUT_BASENAME="${DATE}_${LANG}_episode"
THUMBNAIL_BASENAME="${DATE}_${LANG}_thumbnail"
RENDER_SCRIPT="${ROOT_DIR}/web/scripts/render_episode_slides.mjs"
REMOTION_RENDER_SCRIPT="${ROOT_DIR}/web/scripts/render_shorts_remotion.mjs"

if [ "${IS_SHORTS}" -eq 1 ]; then
    SRC_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}/shorts"
    SRC_JSON="${SRC_BASE}/slides.render.json"
    SRC_MP3="${SRC_BASE}/shorts${DATE}.mp3"
    WEB_DATA_PATH="${ROOT_DIR}/web/public/data/shorts/${DATE}.json"
    WEB_AUDIO_PATH="${ROOT_DIR}/web/public/audio/shorts/${DATE}.mp3"
    TARGET_PATH="${YOUTUBE_CAPTURE_PATH:-/youtube/shorts/${DATE}}"
    OUTPUT_DIR="${SRC_BASE}/youtube"
    OUTPUT_BASENAME="${DATE}_${LANG}_shorts"
    THUMBNAIL_BASENAME="${DATE}_${LANG}_shorts_thumbnail"
    RENDER_SCRIPT="${ROOT_DIR}/web/scripts/render_shorts_slides.mjs"
fi

if [ -n "${PREVIEW_SECONDS}" ]; then
    OUTPUT_BASENAME="${DATE}_${LANG}_preview_${PREVIEW_SECONDS}s"
    THUMBNAIL_BASENAME="${DATE}_${LANG}_preview_${PREVIEW_SECONDS}s_thumbnail"
fi

OUTPUT_WEBM="${OUTPUT_DIR}/${OUTPUT_BASENAME}.webm"
OUTPUT_MP4="${OUTPUT_DIR}/${OUTPUT_BASENAME}.mp4"
FRAMES_DIR="${OUTPUT_DIR}/${OUTPUT_BASENAME}_frames"
CONCAT_FILE="${OUTPUT_DIR}/${OUTPUT_BASENAME}.concat.txt"
TIMELINE_META="${OUTPUT_DIR}/${OUTPUT_BASENAME}.timeline.json"
WEB_LOG="${OUTPUT_DIR}/next-dev.log"
THUMBNAIL_PNG="${OUTPUT_DIR}/${THUMBNAIL_BASENAME}.png"
TARGET_URL="http://127.0.0.1:${WEB_PORT}${TARGET_PATH}"
if [ "${IS_SHORTS}" -ne 1 ] && [ "${TURN_LEAD_MS}" -ne 0 ]; then
    QUERY_SEP="?"
    if [[ "${TARGET_URL}" == *\?* ]]; then
        QUERY_SEP="&"
    fi
    TARGET_URL="${TARGET_URL}${QUERY_SEP}leadMs=${TURN_LEAD_MS}"
fi

if [ "${RENDER_MODE}" = "realtime" ]; then
    QUERY_SEP="?"
    if [[ "${TARGET_URL}" == *\?* ]]; then
        QUERY_SEP="&"
    fi
    TARGET_URL="${TARGET_URL}${QUERY_SEP}capture=1"
fi
if [ "${IS_SHORTS}" -eq 1 ]; then
    THUMBNAIL_URL="http://127.0.0.1:${WEB_PORT}/youtube/shorts/${DATE}?render=1&slide=${THUMBNAIL_SLIDE_INDEX}"
else
    THUMBNAIL_URL="http://127.0.0.1:${WEB_PORT}/youtube/thumbnail/${DATE}?slide=${THUMBNAIL_SLIDE_INDEX}"
fi

echo "========================================================"
echo "🎬 YouTube Video Pipeline Start"
echo "📅 Date: ${DATE}"
echo "🌐 Language: ${LANG}"
echo "🎞️  Target: $( [ "${IS_SHORTS}" -eq 1 ] && echo "shorts (9:16)" || echo "episode" )"
echo "🛠️  Render mode: ${RENDER_MODE}"
echo "🎬 Render engine: ${RENDER_ENGINE}"
echo "⏱️  Preview: $( [ -n "${PREVIEW_SECONDS}" ] && echo "${PREVIEW_SECONDS}s" || echo "full" )"
if [ "${IS_SHORTS}" -ne 1 ]; then
    echo "🎚️  Turn lead: ${TURN_LEAD_MS}ms"
fi
if [ "${RENDER_ENGINE}" = "browser" ] && [ "${RENDER_MODE}" = "realtime" ]; then
    echo "⏳ Realtime start delay: ${START_DELAY_SECONDS}s"
    echo "✂️  Realtime video trim: ${TRIM_START_SECONDS}s"
fi
if [ "${RENDER_ENGINE}" = "remotion" ]; then
    echo "⏳ Remotion timeout: ${REMOTION_TIMEOUT_MS}ms"
    echo "⚙️  Remotion concurrency: ${REMOTION_CONCURRENCY}"
fi
echo "🔗 Target URL: ${TARGET_URL}"
echo "📹 Output MP4: ${OUTPUT_MP4}"
echo "🖼️  Thumbnail: ${THUMBNAIL_PNG}"
echo "☁️  Upload: $( [ "${UPLOAD}" -eq 1 ] && echo "Yes (${PRIVACY})" || echo "No" )"
echo "========================================================"

TARGET_SUFFIX="${TARGET_URL#http://127.0.0.1:${WEB_PORT}}"
THUMBNAIL_SUFFIX="${THUMBNAIL_URL#http://127.0.0.1:${WEB_PORT}}"

if [ "${IS_SHORTS}" -eq 1 ]; then
    SHORTS_SCRIPT_PATH="${ROOT_DIR}/podcast/${DATE}/${LANG}/shorts/script.json"
    SHORTS_SECTION_TIMING_PATH="${ROOT_DIR}/podcast/${DATE}/${LANG}/shorts/sections.timing.json"
    FULL_SCRIPT_PATH_A="${ROOT_DIR}/podcast/${DATE}/${LANG}/${DATE}.json"
    FULL_SCRIPT_PATH_B="${ROOT_DIR}/podcast/${DATE}/${LANG}/script.json"
    FULL_SCRIPT_PATH=""
    if [ -f "${FULL_SCRIPT_PATH_A}" ]; then
        FULL_SCRIPT_PATH="${FULL_SCRIPT_PATH_A}"
    elif [ -f "${FULL_SCRIPT_PATH_B}" ]; then
        FULL_SCRIPT_PATH="${FULL_SCRIPT_PATH_B}"
    fi

    if [ ! -f "${SHORTS_SCRIPT_PATH}" ]; then
        echo "❌ Shorts script not found: ${SHORTS_SCRIPT_PATH}"
        exit 1
    fi
    if [ -z "${FULL_SCRIPT_PATH}" ]; then
        echo "❌ Full script not found: ${FULL_SCRIPT_PATH_A} or ${FULL_SCRIPT_PATH_B}"
        exit 1
    fi

    mkdir -p "${SRC_BASE}"
    echo "🧠 Regenerating shorts slides from script.json inputs (ignoring existing slides.json)..."
    SLIDE_ARGS=(
        "${DATE}"
        --lang "${LANG}"
        --shorts-script "${SHORTS_SCRIPT_PATH}"
        --full-script "${FULL_SCRIPT_PATH}"
        --output "${SRC_JSON}"
    )
    if [ -f "${SHORTS_SECTION_TIMING_PATH}" ]; then
        SLIDE_ARGS+=(--section-timing "${SHORTS_SECTION_TIMING_PATH}")
    fi
    uv run python "${ROOT_DIR}/shorts/generate_shorts_slides.py" \
        "${SLIDE_ARGS[@]}"
fi

if [ ! -f "${SRC_JSON}" ]; then
    echo "❌ Episode JSON not found: ${SRC_JSON}"
    exit 1
fi

if [ ! -f "${SRC_MP3}" ]; then
    echo "❌ Episode MP3 not found: ${SRC_MP3}"
    exit 1
fi

if [ "${RENDER_ENGINE}" = "browser" ]; then
    if [ ! -f "${RENDER_SCRIPT}" ]; then
        echo "❌ Render script not found: ${RENDER_SCRIPT}"
        exit 1
    fi
else
    if [ ! -f "${REMOTION_RENDER_SCRIPT}" ]; then
        echo "❌ Remotion render script not found: ${REMOTION_RENDER_SCRIPT}"
        exit 1
    fi
fi

AUDIO_DURATION="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${SRC_MP3}" | tr -d '\r')"
if [ -z "${AUDIO_DURATION}" ]; then
    echo "❌ Failed to read audio duration: ${SRC_MP3}"
    exit 1
fi

TARGET_DURATION="${AUDIO_DURATION}"
if [ -n "${PREVIEW_SECONDS}" ]; then
    TARGET_DURATION="$(awk -v p="${PREVIEW_SECONDS}" -v a="${AUDIO_DURATION}" 'BEGIN { if (p < a) print p; else print a }')"
fi

mkdir -p "${OUTPUT_DIR}"
mkdir -p "${ROOT_DIR}/web/public/data"
mkdir -p "${ROOT_DIR}/web/public/audio"
if [ "${IS_SHORTS}" -eq 1 ]; then
    mkdir -p "${ROOT_DIR}/web/public/data/shorts"
    mkdir -p "${ROOT_DIR}/web/public/audio/shorts"
fi

if [ -f "${OUTPUT_MP4}" ] && [ "${OVERWRITE}" -ne 1 ]; then
    echo "❌ Output already exists: ${OUTPUT_MP4}"
    echo "   Use --overwrite to replace existing files."
    exit 1
fi

if [ "${OVERWRITE}" -eq 1 ]; then
    rm -f "${OUTPUT_WEBM}" "${OUTPUT_MP4}" "${CONCAT_FILE}" "${TIMELINE_META}" "${THUMBNAIL_PNG}"
    rm -rf "${FRAMES_DIR}"
fi

echo "📂 Syncing target data into web/public..."
cp "${SRC_JSON}" "${WEB_DATA_PATH}"
cp "${SRC_MP3}" "${WEB_AUDIO_PATH}"

if [ "${RENDER_ENGINE}" = "browser" ]; then
    REUSE_EXISTING_SERVER=0
    if curl -sSf "${TARGET_URL}" >/dev/null 2>&1; then
        REUSE_EXISTING_SERVER=1
        echo "♻️  Reusing existing Next.js server on 127.0.0.1:${WEB_PORT}"
    elif [ "${WEB_PORT}" != "3000" ]; then
        ALT_TARGET_URL="http://127.0.0.1:3000${TARGET_SUFFIX}"
        ALT_THUMBNAIL_URL="http://127.0.0.1:3000${THUMBNAIL_SUFFIX}"
        if curl -sSf "${ALT_TARGET_URL}" >/dev/null 2>&1; then
            REUSE_EXISTING_SERVER=1
            WEB_PORT="3000"
            TARGET_URL="${ALT_TARGET_URL}"
            THUMBNAIL_URL="${ALT_THUMBNAIL_URL}"
            echo "♻️  Found existing Next.js server on 127.0.0.1:3000, using it to avoid .next lock conflict"
            echo "🔗 Updated Target URL: ${TARGET_URL}"
        fi
    fi

    if [ "${REUSE_EXISTING_SERVER}" -ne 1 ]; then
        echo "🚀 Starting Next.js dev server on 127.0.0.1:${WEB_PORT}..."
        (
            cd "${ROOT_DIR}/web"
            npm run dev -- --hostname 127.0.0.1 --port "${WEB_PORT}" >"${WEB_LOG}" 2>&1
        ) &
        WEB_PID=$!
        WEB_STARTED_BY_SCRIPT=1
    fi

    READY=0
    for _ in $(seq 1 120); do
        if curl -sSf "${TARGET_URL}" >/dev/null 2>&1; then
            READY=1
            break
        fi

        if ! kill -0 "${WEB_PID}" 2>/dev/null; then
            echo "❌ Web server exited unexpectedly."
            if [ -f "${WEB_LOG}" ]; then
                echo "---- ${WEB_LOG} (tail) ----"
                tail -n 60 "${WEB_LOG}" || true
                echo "---------------------------"
            fi
            exit 1
        fi
        sleep 1
    done

    if [ "${READY}" -ne 1 ]; then
        echo "❌ Timed out waiting for web server readiness: ${TARGET_URL}"
        if [ -f "${WEB_LOG}" ]; then
            echo "---- ${WEB_LOG} (tail) ----"
            tail -n 60 "${WEB_LOG}" || true
            echo "---------------------------"
        fi
        exit 1
    fi
fi

if [ "${RENDER_ENGINE}" = "remotion" ]; then
    REMOTION_AUDIO_SRC="audio/${DATE}.mp3"
    if [ "${IS_SHORTS}" -eq 1 ]; then
        REMOTION_AUDIO_SRC="audio/shorts/${DATE}.mp3"
    fi

    echo "🎬 Rendering video via Remotion..."
    REMOTION_ARGS=(
        --episode-json "${SRC_JSON}"
        --output "${OUTPUT_MP4}"
        --audio-src "${REMOTION_AUDIO_SRC}"
        --timeout "${REMOTION_TIMEOUT_MS}"
        --concurrency "${REMOTION_CONCURRENCY}"
    )
    if [ -n "${PREVIEW_SECONDS}" ]; then
        REMOTION_ARGS+=(--preview-seconds "${PREVIEW_SECONDS}")
    fi
    node "${REMOTION_RENDER_SCRIPT}" "${REMOTION_ARGS[@]}"
else
    if [ "${RENDER_MODE}" = "timeline" ]; then
        mkdir -p "${FRAMES_DIR}"
        echo "🖼️  Rendering slide frames from timeline..."
        TIMELINE_ARGS=(
            --url "${TARGET_URL}"
            --output-dir "${FRAMES_DIR}"
            --concat-file "${CONCAT_FILE}"
            --meta-file "${TIMELINE_META}"
            --timeout "$((MAX_SECONDS * 1000))"
        )
        if [ -n "${PREVIEW_SECONDS}" ]; then
            TIMELINE_ARGS+=(--preview-seconds "${PREVIEW_SECONDS}")
        fi
        node "${RENDER_SCRIPT}" "${TIMELINE_ARGS[@]}"

        if [ ! -f "${CONCAT_FILE}" ]; then
            echo "❌ Missing concat file: ${CONCAT_FILE}"
            exit 1
        fi

        echo "🎞️  Muxing slide timeline with source MP3 -> MP4..."
        ffmpeg -hide_banner -loglevel error -y \
            -f concat -safe 0 -i "${CONCAT_FILE}" \
            -i "${SRC_MP3}" \
            -map 0:v:0 \
            -map 1:a:0 \
            -t "${TARGET_DURATION}" \
            -vsync vfr \
            -c:v libx264 \
            -preset veryfast \
            -crf 20 \
            -pix_fmt yuv420p \
            -c:a aac \
            -b:a 192k \
            -movflags +faststart \
            "${OUTPUT_MP4}"
    else
        echo "🎥 Recording target UI to WEBM (realtime)..."
        RECORD_SECONDS="${MAX_SECONDS}"
        RECORD_ARGS=(
            --url "${TARGET_URL}"
            --output "${OUTPUT_WEBM}"
        )
        RECORD_WIDTH="1920"
        RECORD_HEIGHT="1080"
        if [ "${IS_SHORTS}" -eq 1 ]; then
            RECORD_WIDTH="1080"
            RECORD_HEIGHT="1920"
        fi
        if [ -n "${PREVIEW_SECONDS}" ]; then
            RECORD_SECONDS="${PREVIEW_SECONDS}"
            RECORD_ARGS+=(--stop-on-timeout)
        fi
        RECORD_ARGS+=(--start-delay-seconds "${START_DELAY_SECONDS}")
        RECORD_ARGS+=(--max-seconds "${RECORD_SECONDS}")
        RECORD_ARGS+=(--width "${RECORD_WIDTH}")
        RECORD_ARGS+=(--height "${RECORD_HEIGHT}")
        node "${ROOT_DIR}/web/scripts/record_episode_video.mjs" "${RECORD_ARGS[@]}"

        if awk "BEGIN { exit !(${TRIM_START_SECONDS} > 0) }"; then
            echo "🎞️  Muxing WEBM video with source MP3 -> MP4 (video trim=${TRIM_START_SECONDS}s)..."
            ffmpeg -hide_banner -loglevel error -y \
                -ss "${TRIM_START_SECONDS}" -i "${OUTPUT_WEBM}" \
                -i "${SRC_MP3}" \
                -map 0:v:0 \
                -map 1:a:0 \
                -t "${TARGET_DURATION}" \
                -c:v libx264 \
                -preset veryfast \
                -crf 20 \
                -c:a aac \
                -b:a 192k \
                -shortest \
                -movflags +faststart \
                "${OUTPUT_MP4}"
        else
            echo "🎞️  Muxing WEBM video with source MP3 -> MP4..."
            ffmpeg -hide_banner -loglevel error -y \
                -i "${OUTPUT_WEBM}" \
                -i "${SRC_MP3}" \
                -map 0:v:0 \
                -map 1:a:0 \
                -t "${TARGET_DURATION}" \
                -c:v libx264 \
                -preset veryfast \
                -crf 20 \
                -c:a aac \
                -b:a 192k \
                -shortest \
                -movflags +faststart \
                "${OUTPUT_MP4}"
        fi
    fi
fi

# ── Shorts 59-second speed-up ──────────────────────────────────────────────
# YouTube Shorts must be ≤ 60s.  We target 59s to leave a small margin.
if [ "${IS_SHORTS}" -eq 1 ] && [ -f "${OUTPUT_MP4}" ]; then
    SHORTS_MAX_SECONDS=59
    RAW_DURATION="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${OUTPUT_MP4}" | tr -d '\r')"
    IS_OVER="$(awk -v d="${RAW_DURATION}" -v m="${SHORTS_MAX_SECONDS}" 'BEGIN { print (d > m) ? 1 : 0 }')"

    if [ "${IS_OVER}" -eq 1 ]; then
        SPEED_RATIO="$(awk -v d="${RAW_DURATION}" -v m="${SHORTS_MAX_SECONDS}" 'BEGIN { printf "%.6f", d / m }')"
        VIDEO_PTS="$(awk -v r="${SPEED_RATIO}" 'BEGIN { printf "%.6f", 1.0 / r }')"

        echo "⚡ Shorts speed-up: ${RAW_DURATION}s → ${SHORTS_MAX_SECONDS}s (${SPEED_RATIO}x)"

        # atempo only supports 0.5–2.0 range, so chain filters for higher ratios
        ATEMPO_FILTERS=""
        REMAINING="${SPEED_RATIO}"
        while awk -v r="${REMAINING}" 'BEGIN { exit !(r > 2.0) }'; do
            ATEMPO_FILTERS="${ATEMPO_FILTERS}atempo=2.0,"
            REMAINING="$(awk -v r="${REMAINING}" 'BEGIN { printf "%.6f", r / 2.0 }')"
        done
        ATEMPO_FILTERS="${ATEMPO_FILTERS}atempo=${REMAINING}"

        SPEEDUP_TMP="${OUTPUT_MP4%.mp4}_speedup.mp4"
        ffmpeg -hide_banner -loglevel error -y \
            -i "${OUTPUT_MP4}" \
            -filter:v "setpts=${VIDEO_PTS}*PTS" \
            -filter:a "${ATEMPO_FILTERS}" \
            -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p \
            -c:a aac -b:a 192k \
            -movflags +faststart \
            "${SPEEDUP_TMP}"

        mv "${SPEEDUP_TMP}" "${OUTPUT_MP4}"
        NEW_DURATION="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${OUTPUT_MP4}" | tr -d '\r')"
        echo "✅ Shorts speed-up complete: ${NEW_DURATION}s"
    else
        echo "✅ Shorts duration OK: ${RAW_DURATION}s (≤ ${SHORTS_MAX_SECONDS}s)"
    fi
fi

STREAMS="$(ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "${OUTPUT_MP4}" | tr '\n' ' ')"
if [[ "${STREAMS}" != *video* ]] || [[ "${STREAMS}" != *audio* ]]; then
    echo "❌ MP4 validation failed (missing video/audio stream): ${OUTPUT_MP4}"
    exit 1
fi

if [ "${RENDER_ENGINE}" = "remotion" ]; then
    echo "🖼️  Capturing thumbnail from rendered MP4..."
    ffmpeg -hide_banner -loglevel error -y \
        -ss 0.20 \
        -i "${OUTPUT_MP4}" \
        -vf "scale=${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}:force_original_aspect_ratio=decrease,pad=${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}:(ow-iw)/2:(oh-ih)/2" \
        -frames:v 1 \
        "${THUMBNAIL_PNG}"
else
    echo "🖼️  Capturing thumbnail PNG..."
    node "${ROOT_DIR}/web/scripts/capture_thumbnail.mjs" \
        --url "${THUMBNAIL_URL}" \
        --output "${THUMBNAIL_PNG}" \
        --width "${THUMBNAIL_WIDTH}" \
        --height "${THUMBNAIL_HEIGHT}" \
        --ready-selector "${THUMBNAIL_READY_SELECTOR}" \
        --timeout "$((THUMBNAIL_TIMEOUT_SECONDS * 1000))"
fi

cleanup
WEB_PID=""
WEB_STARTED_BY_SCRIPT=0
trap - EXIT INT TERM

if [ "${UPLOAD}" -eq 1 ]; then
    echo "☁️  Uploading MP4 to YouTube..."
    uv run python "${YOUTUBE_UPLOAD_SCRIPT}" \
        --file "${OUTPUT_MP4}" \
        --thumbnail "${THUMBNAIL_PNG}" \
        --date "${DATE}" \
        --lang "${LANG}" \
        --privacy "${PRIVACY}"

    if [ -f "${OUTPUT_WEBM}" ]; then
        rm -f "${OUTPUT_WEBM}"
        echo "🧹 Removed intermediate WEBM: ${OUTPUT_WEBM}"
    fi
fi

echo "✅ YouTube pipeline complete"
echo "📹 Local file: ${OUTPUT_MP4}"
echo "🖼️  Thumbnail file: ${THUMBNAIL_PNG}"
