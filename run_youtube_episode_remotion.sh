#!/bin/bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DATE=""
LANG="ko"
OVERWRITE=0
PREVIEW_SECONDS=""
TURN_LEAD_MS="${YOUTUBE_TURN_LEAD_MS:-550}"
REMOTION_TIMEOUT_MS="${YOUTUBE_REMOTION_TIMEOUT_MS:-180000}"
REMOTION_CONCURRENCY="${YOUTUBE_REMOTION_CONCURRENCY:-1}"

usage() {
    cat <<'EOF'
Usage:
  ./run_youtube_episode_remotion.sh YYYYMMDD --lang ko|en [--overwrite] [--preview-seconds N]

Options:
  --lang ko|en              Language path to render (default: ko)
  --overwrite               Replace existing render output
  --preview-seconds <n>     Render only the first n seconds for quick verification
  -h, --help                Show this help
EOF
}

require_cmd() {
    local cmd="$1"
    if ! command -v "${cmd}" >/dev/null 2>&1; then
        echo "Required command not found: ${cmd}" >&2
        exit 1
    fi
}

require_file() {
    local path="$1"
    if [ ! -f "${path}" ]; then
        echo "Required file not found: ${path}" >&2
        exit 1
    fi
}

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
        --preview-seconds)
            PREVIEW_SECONDS="$2"
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
                echo "Unexpected argument: $1" >&2
                usage
                exit 1
            fi
            ;;
    esac
done

if [[ ! "${DATE}" =~ ^[0-9]{8}$ ]]; then
    echo "DATE must be in YYYYMMDD format: ${DATE}" >&2
    exit 1
fi

if [[ "${LANG}" != "ko" && "${LANG}" != "en" ]]; then
    echo "--lang must be one of: ko, en" >&2
    exit 1
fi

if [ -n "${PREVIEW_SECONDS}" ]; then
    if ! [[ "${PREVIEW_SECONDS}" =~ ^[0-9]+$ ]] || [ "${PREVIEW_SECONDS}" -le 0 ]; then
        echo "--preview-seconds must be a positive integer: ${PREVIEW_SECONDS}" >&2
        exit 1
    fi
fi

require_cmd node
require_cmd npx
require_cmd ffprobe

EPISODE_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}"
EPISODE_JSON="${EPISODE_BASE}/${DATE}.json"
if [ ! -f "${EPISODE_JSON}" ] && [ -f "${EPISODE_BASE}/script.json" ]; then
    EPISODE_JSON="${EPISODE_BASE}/script.json"
fi
EPISODE_MP3="${EPISODE_BASE}/${DATE}.mp3"
OUTPUT_DIR="${EPISODE_BASE}/youtube-remotion"
OUTPUT_BASENAME="${DATE}_${LANG}_episode_remotion"
if [ -n "${PREVIEW_SECONDS}" ]; then
    OUTPUT_BASENAME="${OUTPUT_BASENAME}_preview_${PREVIEW_SECONDS}s"
fi
OUTPUT_MP4="${OUTPUT_DIR}/${OUTPUT_BASENAME}.mp4"
CHART_DATA_JSON="${OUTPUT_DIR}/${DATE}_${LANG}_episode_chart_data.json"
WEB_DATA_PATH="${ROOT_DIR}/web/public/data/${DATE}.json"
WEB_AUDIO_PATH="${ROOT_DIR}/web/public/audio/${DATE}.mp3"

require_file "${EPISODE_JSON}"
require_file "${EPISODE_MP3}"
require_file "${ROOT_DIR}/web/scripts/render_episode_remotion.mjs"

mkdir -p "${OUTPUT_DIR}"
mkdir -p "${ROOT_DIR}/web/public/data" "${ROOT_DIR}/web/public/audio"

if [ -f "${OUTPUT_MP4}" ] && [ "${OVERWRITE}" -ne 1 ]; then
    echo "Output already exists: ${OUTPUT_MP4}" >&2
    echo "Use --overwrite to replace existing files." >&2
    exit 1
fi

echo "Syncing episode assets into web/public..."
cp "${EPISODE_JSON}" "${WEB_DATA_PATH}"
cp "${EPISODE_MP3}" "${WEB_AUDIO_PATH}"

echo "Prefetching chart data for Remotion..."
node "${ROOT_DIR}/web/scripts/prefetch_episode_chart_data.mjs" \
    --episode-json "${EPISODE_JSON}" \
    --output "${CHART_DATA_JSON}" \
    --as-of "${DATE}"
require_file "${CHART_DATA_JSON}"

AUDIO_DURATION="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${EPISODE_MP3}" | tr -d '\r')"
if [ -z "${AUDIO_DURATION}" ]; then
    echo "Failed to read episode audio duration: ${EPISODE_MP3}" >&2
    exit 1
fi

ARGS=(
    "${ROOT_DIR}/web/scripts/render_episode_remotion.mjs"
    --episode-json "${EPISODE_JSON}"
    --output "${OUTPUT_MP4}"
    --storage-date "${DATE}"
    --audio-src "audio/${DATE}.mp3"
    --chart-data-json "${CHART_DATA_JSON}"
    --duration-seconds "${AUDIO_DURATION}"
    --turn-lead-ms "${TURN_LEAD_MS}"
    --timeout "${REMOTION_TIMEOUT_MS}"
    --concurrency "${REMOTION_CONCURRENCY}"
)

if [ -n "${PREVIEW_SECONDS}" ]; then
    ARGS+=(--preview-seconds "${PREVIEW_SECONDS}")
fi

echo "Rendering episode via Remotion..."
echo "Running: node ${ARGS[*]}"
node "${ARGS[@]}"

require_file "${OUTPUT_MP4}"
echo "Episode Remotion render complete: ${OUTPUT_MP4}"
