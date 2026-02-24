#!/bin/bash

# ==============================================================================
# Generate episode thumbnail PNG from web thumbnail route.
#
# Usage:
#   ./shared/ops/scripts/youtube/generate_episode_thumbnail.sh YYYYMMDD --lang ko|en [--overwrite]
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"

DATE=""
LANG="ko"
OVERWRITE=0

WEB_PORT="${YOUTUBE_WEB_PORT:-3100}"
THUMBNAIL_SLIDE_INDEX="${YOUTUBE_THUMBNAIL_SLIDE_INDEX:-0}"
THUMBNAIL_WIDTH="${YOUTUBE_THUMBNAIL_WIDTH:-1280}"
THUMBNAIL_HEIGHT="${YOUTUBE_THUMBNAIL_HEIGHT:-720}"
THUMBNAIL_TIMEOUT_SECONDS="${YOUTUBE_THUMBNAIL_TIMEOUT_SECONDS:-120}"

WEB_PID=""
WEB_STARTED_BY_SCRIPT=0

usage() {
    cat <<'EOF'
Usage:
  ./shared/ops/scripts/youtube/generate_episode_thumbnail.sh YYYYMMDD --lang ko|en [--overwrite]

Options:
  --lang ko|en            Language path (default: ko)
  --overwrite             Overwrite existing thumbnail PNG
  --port <number>         Next.js local port (default: env YOUTUBE_WEB_PORT or 3100)
  --slide-index <number>  Thumbnail slide index (default: env YOUTUBE_THUMBNAIL_SLIDE_INDEX or 0)
  --width <number>        Capture width (default: env YOUTUBE_THUMBNAIL_WIDTH or 1280)
  --height <number>       Capture height (default: env YOUTUBE_THUMBNAIL_HEIGHT or 720)
  -h, --help              Show this help
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
        --overwrite)
            OVERWRITE=1
            shift
            ;;
        --port)
            WEB_PORT="$2"
            shift 2
            ;;
        --slide-index)
            THUMBNAIL_SLIDE_INDEX="$2"
            shift 2
            ;;
        --width)
            THUMBNAIL_WIDTH="$2"
            shift 2
            ;;
        --height)
            THUMBNAIL_HEIGHT="$2"
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

if ! [[ "${WEB_PORT}" =~ ^[0-9]+$ ]]; then
    echo "❌ --port must be numeric: ${WEB_PORT}"
    exit 1
fi

if ! [[ "${THUMBNAIL_SLIDE_INDEX}" =~ ^[0-9]+$ ]]; then
    echo "❌ --slide-index must be numeric: ${THUMBNAIL_SLIDE_INDEX}"
    exit 1
fi

if ! [[ "${THUMBNAIL_WIDTH}" =~ ^[0-9]+$ ]]; then
    echo "❌ --width must be numeric: ${THUMBNAIL_WIDTH}"
    exit 1
fi

if ! [[ "${THUMBNAIL_HEIGHT}" =~ ^[0-9]+$ ]]; then
    echo "❌ --height must be numeric: ${THUMBNAIL_HEIGHT}"
    exit 1
fi

if ! [[ "${THUMBNAIL_TIMEOUT_SECONDS}" =~ ^[0-9]+$ ]]; then
    echo "❌ YOUTUBE_THUMBNAIL_TIMEOUT_SECONDS must be numeric: ${THUMBNAIL_TIMEOUT_SECONDS}"
    exit 1
fi

require_cmd curl
require_cmd node
require_cmd npm

SRC_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}"
SRC_JSON="${SRC_BASE}/${DATE}.json"
SRC_MP3="${SRC_BASE}/${DATE}.mp3"
OUTPUT_DIR="${SRC_BASE}/youtube"
OUTPUT_PNG="${OUTPUT_DIR}/${DATE}_${LANG}_thumbnail.png"

WEB_DATA_PATH="${ROOT_DIR}/web/public/data/${DATE}.json"
WEB_AUDIO_PATH="${ROOT_DIR}/web/public/audio/${DATE}.mp3"

if [ ! -f "${SRC_JSON}" ]; then
    echo "❌ Episode JSON not found: ${SRC_JSON}"
    exit 1
fi

if [ ! -f "${SRC_MP3}" ]; then
    echo "❌ Episode MP3 not found: ${SRC_MP3}"
    exit 1
fi

mkdir -p "${OUTPUT_DIR}"
mkdir -p "${ROOT_DIR}/web/public/data"
mkdir -p "${ROOT_DIR}/web/public/audio"

if [ -f "${OUTPUT_PNG}" ] && [ "${OVERWRITE}" -ne 1 ]; then
    echo "ℹ️  Thumbnail already exists: ${OUTPUT_PNG}"
    exit 0
fi

if [ "${OVERWRITE}" -eq 1 ]; then
    rm -f "${OUTPUT_PNG}"
fi

cp "${SRC_JSON}" "${WEB_DATA_PATH}"
cp "${SRC_MP3}" "${WEB_AUDIO_PATH}"

TARGET_URL="http://127.0.0.1:${WEB_PORT}/youtube/thumbnail/${DATE}?slide=${THUMBNAIL_SLIDE_INDEX}"
ALT_TARGET_URL="http://127.0.0.1:3000/youtube/thumbnail/${DATE}?slide=${THUMBNAIL_SLIDE_INDEX}"

if curl -sSf "${TARGET_URL}" >/dev/null 2>&1; then
    echo "♻️  Reusing existing Next.js server on 127.0.0.1:${WEB_PORT}"
elif [ "${WEB_PORT}" != "3000" ] && curl -sSf "${ALT_TARGET_URL}" >/dev/null 2>&1; then
    WEB_PORT="3000"
    TARGET_URL="${ALT_TARGET_URL}"
    echo "♻️  Found existing Next.js server on 127.0.0.1:3000, using it"
else
    echo "🚀 Starting Next.js dev server on 127.0.0.1:${WEB_PORT}..."
    (
        cd "${ROOT_DIR}/web"
        npm run dev -- --webpack --hostname 127.0.0.1 --port "${WEB_PORT}" >/tmp/thumbnail-dev-${DATE}-${LANG}.log 2>&1
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
    if [ "${WEB_STARTED_BY_SCRIPT}" -eq 1 ] && ! kill -0 "${WEB_PID}" 2>/dev/null; then
        echo "❌ Web server exited unexpectedly."
        exit 1
    fi
    sleep 1
done

if [ "${READY}" -ne 1 ]; then
    echo "❌ Timed out waiting for thumbnail route: ${TARGET_URL}"
    exit 1
fi

echo "🖼️  Capturing thumbnail..."
node "${ROOT_DIR}/web/scripts/capture_thumbnail.mjs" \
    --url "${TARGET_URL}" \
    --output "${OUTPUT_PNG}" \
    --width "${THUMBNAIL_WIDTH}" \
    --height "${THUMBNAIL_HEIGHT}" \
    --timeout "$((THUMBNAIL_TIMEOUT_SECONDS * 1000))"

cleanup
WEB_PID=""
WEB_STARTED_BY_SCRIPT=0
trap - EXIT INT TERM

echo "✅ Thumbnail generated: ${OUTPUT_PNG}"
