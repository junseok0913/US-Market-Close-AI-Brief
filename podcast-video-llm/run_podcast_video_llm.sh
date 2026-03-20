#!/bin/bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DATE=""
LANG="ko"
START_FROM=1
OVERWRITE=0
NO_LLM=0
PREVIEW_SECONDS=""
TURN_LEAD_MS="${YOUTUBE_TURN_LEAD_MS:-550}"
REMOTION_TIMEOUT_MS="${YOUTUBE_REMOTION_TIMEOUT_MS:-180000}"
REMOTION_CONCURRENCY="${YOUTUBE_REMOTION_CONCURRENCY:-2}"

usage() {
    cat <<'EOF'
Usage:
  ./podcast-video-llm/run_podcast_video_llm.sh YYYYMMDD --lang ko|en [--start-from 1..4] [--overwrite] [--no-llm] [--preview-seconds N]

Steps:
  1. Generate dedicated PodcastVideoComposition render.json from the existing timed episode
  2. Validate existing timed episode JSON + MP3
  3. Prefetch chart data
  4. Render via Remotion
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

run_python() {
    if [ -x "${ROOT_DIR}/.venv/bin/python" ]; then
        "${ROOT_DIR}/.venv/bin/python" "$@"
        return
    fi
    if command -v uv >/dev/null 2>&1; then
        uv run python "$@"
        return
    fi
    python3 "$@"
}

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
        --no-llm)
            NO_LLM=1
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
    echo "--lang must be ko or en" >&2
    exit 1
fi

if ! [[ "${START_FROM}" =~ ^[1-4]$ ]]; then
    echo "--start-from must be between 1 and 4" >&2
    exit 1
fi

if [ -n "${PREVIEW_SECONDS}" ]; then
    if ! [[ "${PREVIEW_SECONDS}" =~ ^[0-9]+$ ]] || [ "${PREVIEW_SECONDS}" -le 0 ]; then
        echo "--preview-seconds must be a positive integer" >&2
        exit 1
    fi
fi

require_cmd node
require_cmd ffprobe

BASE_DIR="${ROOT_DIR}/podcast/${DATE}/${LANG}/podcast-video-llm"
RENDER_JSON="${BASE_DIR}/render.json"
SOURCE_DIR="${ROOT_DIR}/podcast/${DATE}/${LANG}"
SOURCE_TIMED_JSON="${SOURCE_DIR}/${DATE}.json"
SOURCE_EPISODE_MP3="${SOURCE_DIR}/${DATE}.mp3"
CHART_DATA_JSON="${BASE_DIR}/${DATE}_${LANG}_chart_data.json"
OUTPUT_DIR="${BASE_DIR}/youtube"
OUTPUT_MP4="${OUTPUT_DIR}/${DATE}_${LANG}_podcast_video_llm.mp4"
WEB_DATA_DIR="${ROOT_DIR}/web/public/data/podcast-video-llm"
WEB_AUDIO_DIR="${ROOT_DIR}/web/public/audio/podcast-video-llm"
WEB_DATA_PATH="${WEB_DATA_DIR}/${DATE}.json"
WEB_AUDIO_PATH="${WEB_AUDIO_DIR}/${DATE}.mp3"

if [ "${OVERWRITE}" -eq 1 ]; then
    rm -f "${RENDER_JSON}" "${CHART_DATA_JSON}" "${OUTPUT_MP4}"
fi

mkdir -p "${BASE_DIR}" "${OUTPUT_DIR}" "${WEB_DATA_DIR}" "${WEB_AUDIO_DIR}"

if [ "${START_FROM}" -le 1 ]; then
    echo "🧠 Generating PodcastVideoComposition render plan..."
    GENERATE_ARGS=(
        "${ROOT_DIR}/podcast-video-llm/generate_podcast_video_script.py"
        "${DATE}"
        --lang "${LANG}"
        --output "${RENDER_JSON}"
    )
    if [ "${NO_LLM}" -eq 1 ]; then
        GENERATE_ARGS+=(--no-llm)
    fi
    run_python "${GENERATE_ARGS[@]}"
    require_file "${RENDER_JSON}"
fi

if [ "${START_FROM}" -le 2 ]; then
    echo "🎙️ Reusing existing timed episode assets..."
    require_file "${SOURCE_TIMED_JSON}"
    require_file "${SOURCE_EPISODE_MP3}"
fi

if [ "${START_FROM}" -le 3 ]; then
    require_file "${RENDER_JSON}"
    echo "📈 Prefetching chart data..."
    node "${ROOT_DIR}/web/scripts/prefetch_episode_chart_data.mjs" \
        --episode-json "${RENDER_JSON}" \
        --output "${CHART_DATA_JSON}" \
        --as-of "${DATE}"
    require_file "${CHART_DATA_JSON}"
fi

if [ "${START_FROM}" -le 4 ]; then
    require_file "${ROOT_DIR}/web/scripts/render_episode_remotion.mjs"
    require_file "${RENDER_JSON}"
    require_file "${SOURCE_EPISODE_MP3}"
    require_file "${CHART_DATA_JSON}"

    echo "📂 Syncing PodcastVideoComposition assets into web/public..."
    cp "${RENDER_JSON}" "${WEB_DATA_PATH}"
    cp "${SOURCE_EPISODE_MP3}" "${WEB_AUDIO_PATH}"

    AUDIO_DURATION="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${SOURCE_EPISODE_MP3}" | tr -d '\r')"
    if [ -z "${AUDIO_DURATION}" ]; then
        echo "Failed to read episode audio duration: ${SOURCE_EPISODE_MP3}" >&2
        exit 1
    fi

    RENDER_ARGS=(
        "${ROOT_DIR}/web/scripts/render_episode_remotion.mjs"
        --entry-point "remotion/podcast-video.index.ts"
        --composition-id "PodcastVideoComposition"
        --episode-json "${RENDER_JSON}"
        --output "${OUTPUT_MP4}"
        --storage-date "${DATE}"
        --audio-src "audio/podcast-video-llm/${DATE}.mp3"
        --chart-data-json "${CHART_DATA_JSON}"
        --duration-seconds "${AUDIO_DURATION}"
        --turn-lead-ms "${TURN_LEAD_MS}"
        --timeout "${REMOTION_TIMEOUT_MS}"
        --concurrency "${REMOTION_CONCURRENCY}"
    )
    if [ -n "${PREVIEW_SECONDS}" ]; then
        RENDER_ARGS+=(--preview-seconds "${PREVIEW_SECONDS}")
    fi

    echo "🎬 Rendering PodcastVideoComposition via Remotion..."
    node "${RENDER_ARGS[@]}"
    require_file "${OUTPUT_MP4}"
    echo "✅ Render complete: ${OUTPUT_MP4}"
fi
