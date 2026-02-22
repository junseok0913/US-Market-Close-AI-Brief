#!/bin/bash

# ==============================================================================
# Episode Render Only (No upload, no shorts)
#
# Engines:
#   - timeline (default): browser frame capture + ffmpeg concat/mux (existing design)
#   - remotion: alias to timeline for backward compatibility
#
# Usage:
#   ./run_episode_render.sh YYYYMMDD --lang ko|en [--engine remotion|timeline] [--overwrite]
# ==============================================================================

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DATE=""
LANG="ko"
OVERWRITE=0
PREVIEW_SECONDS=""
RENDER_ENGINE="${EPISODE_RENDER_ENGINE:-timeline}"
WEB_PORT="${YOUTUBE_WEB_PORT:-3100}"
MAX_SECONDS="${YOUTUBE_MAX_SECONDS:-1800}"
TURN_LEAD_MS="${YOUTUBE_TURN_LEAD_MS:-550}"

WEB_PID=""
WEB_STARTED_BY_SCRIPT=0
WEB_LOG=""

WEB_READY_MAX_ATTEMPTS=120
WEB_READY_SLEEP_SECONDS=1

usage() {
    cat <<'HELP'
Usage:
  ./run_episode_render.sh YYYYMMDD --lang ko|en [--engine remotion|timeline] [--overwrite] [--preview-seconds <n>]

Options:
  --lang ko|en                Language path to render (default: ko)
  --engine timeline|remotion  Render engine (default: timeline)
                              remotion is treated as timeline (existing design)
  --overwrite                 Overwrite existing render output
  --preview-seconds <n>       Render only first n seconds for quick verification
  --turn-lead-ms <n>          Slide turn lead in milliseconds (default: 550)
  --port <number>             Next.js local port (default: 3100)
  --max-seconds <number>      Timeout in seconds for timeline frame capture (default: 1800)
  -h, --help                  Show this help
HELP
}

cleanup() {
    if [ "${WEB_STARTED_BY_SCRIPT}" -eq 1 ] && [ -n "${WEB_PID}" ] && kill -0 "${WEB_PID}" 2>/dev/null; then
        echo "Stopping web server (pid=${WEB_PID})..."
        kill "${WEB_PID}" || true
        wait "${WEB_PID}" 2>/dev/null || true
    fi
}

on_error() {
    local exit_code=$?
    echo "Render failed (exit=${exit_code})"
    if [ -n "${WEB_LOG}" ] && [ -f "${WEB_LOG}" ]; then
        echo "---- ${WEB_LOG} (tail) ----"
        tail -n 60 "${WEB_LOG}" || true
        echo "---------------------------"
    fi
    exit "${exit_code}"
}

on_interrupt() {
    echo "Interrupted by user"
    exit 130
}

require_cmd() {
    local cmd="$1"
    if ! command -v "${cmd}" >/dev/null 2>&1; then
        echo "Required command not found: ${cmd}"
        exit 1
    fi
}

require_file() {
    local path="$1"
    if [ ! -f "${path}" ]; then
        echo "Required file not found: ${path}"
        exit 1
    fi
}

require_option_value() {
    local option_name="$1"
    local option_value="${2:-}"
    if [ -z "${option_value}" ] || [[ "${option_value}" == --* ]]; then
        echo "Missing value for ${option_name}"
        exit 1
    fi
}

is_positive_integer() {
    local value="$1"
    [[ "${value}" =~ ^[0-9]+$ ]] && [ "${value}" -gt 0 ]
}

is_port_listening() {
    local port="$1"
    if command -v lsof >/dev/null 2>&1; then
        lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
        return $?
    fi
    if command -v nc >/dev/null 2>&1; then
        nc -z 127.0.0.1 "${port}" >/dev/null 2>&1
        return $?
    fi
    return 1
}

clear_stale_next_lock_if_safe() {
    local lock_file="${ROOT_DIR}/web/.next/dev/lock"
    if [ ! -f "${lock_file}" ]; then
        return 0
    fi

    if is_port_listening "${WEB_PORT}" || is_port_listening 3000; then
        return 0
    fi

    echo "Detected stale Next.js lock. Removing: ${lock_file}" >&2
    rm -f "${lock_file}"
}

validate_mp4_streams() {
    local mp4_path="$1"
    local streams
    streams="$(ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "${mp4_path}" | tr '\n' ' ')"
    if [[ "${streams}" != *video* ]] || [[ "${streams}" != *audio* ]]; then
        echo "MP4 validation failed (missing video/audio stream): ${mp4_path}"
        exit 1
    fi
}

ensure_web_ready() {
    local target_url="$1"
    local output_dir="$2"
    local target_suffix="${target_url#http://127.0.0.1:${WEB_PORT}}"
    local reuse_existing=0

    WEB_LOG="${output_dir}/next-dev.log"

    if curl -sSf "${target_url}" >/dev/null 2>&1; then
        reuse_existing=1
        echo "Reusing existing Next.js server on 127.0.0.1:${WEB_PORT}" >&2
    elif [ "${WEB_PORT}" != "3000" ]; then
        local alt_target_url="http://127.0.0.1:3000${target_suffix}"
        if curl -sSf "${alt_target_url}" >/dev/null 2>&1; then
            reuse_existing=1
            WEB_PORT="3000"
            target_url="${alt_target_url}"
            echo "Found existing Next.js server on 127.0.0.1:3000" >&2
            echo "Updated target URL: ${target_url}" >&2
        fi
    fi

    if [ "${reuse_existing}" -ne 1 ]; then
        clear_stale_next_lock_if_safe
        echo "Starting Next.js dev server on 127.0.0.1:${WEB_PORT}..." >&2
        (
            cd "${ROOT_DIR}/web"
            npm run dev -- --hostname 127.0.0.1 --port "${WEB_PORT}" >"${WEB_LOG}" 2>&1
        ) &
        WEB_PID=$!
        WEB_STARTED_BY_SCRIPT=1
    fi

    local ready=0
    local attempt
    echo "Waiting for web readiness: ${target_url}" >&2
    for attempt in $(seq 1 "${WEB_READY_MAX_ATTEMPTS}"); do
        if curl -sSf "${target_url}" >/dev/null 2>&1; then
            ready=1
            break
        fi
        if [ $((attempt % 10)) -eq 0 ]; then
            echo "Still waiting... (${attempt}/${WEB_READY_MAX_ATTEMPTS})" >&2
        fi
        if [ "${WEB_STARTED_BY_SCRIPT}" -eq 1 ] && ! kill -0 "${WEB_PID}" 2>/dev/null; then
            echo "Web server exited unexpectedly."
            exit 1
        fi
        sleep "${WEB_READY_SLEEP_SECONDS}"
    done

    if [ "${ready}" -ne 1 ]; then
        echo "Timed out waiting for web server readiness: ${target_url}"
        exit 1
    fi

    printf '%s\n' "${target_url}"
}

trap on_error ERR
trap on_interrupt INT TERM
trap cleanup EXIT

if [ $# -eq 0 ]; then
    usage
    exit 1
fi

while [[ $# -gt 0 ]]; do
    case "$1" in
        --lang)
            require_option_value "--lang" "${2-}"
            LANG="$2"
            shift 2
            ;;
        --engine)
            require_option_value "--engine" "${2-}"
            RENDER_ENGINE="$2"
            shift 2
            ;;
        --overwrite)
            OVERWRITE=1
            shift
            ;;
        --preview-seconds)
            require_option_value "--preview-seconds" "${2-}"
            PREVIEW_SECONDS="$2"
            shift 2
            ;;
        --turn-lead-ms)
            require_option_value "--turn-lead-ms" "${2-}"
            TURN_LEAD_MS="$2"
            shift 2
            ;;
        --port)
            require_option_value "--port" "${2-}"
            WEB_PORT="$2"
            shift 2
            ;;
        --max-seconds)
            require_option_value "--max-seconds" "${2-}"
            MAX_SECONDS="$2"
            shift 2
            ;;
        --remotion-timeout-ms|--remotion-concurrency)
            require_option_value "$1" "${2-}"
            echo "Note: $1 is ignored. Episode render uses timeline capture path."
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
                echo "Unexpected argument: $1"
                usage
                exit 1
            fi
            ;;
    esac
done

if [[ ! "${DATE}" =~ ^[0-9]{8}$ ]]; then
    echo "DATE must be in YYYYMMDD format: ${DATE}"
    exit 1
fi

if [[ "${LANG}" != "ko" && "${LANG}" != "en" ]]; then
    echo "--lang must be one of: ko, en"
    exit 1
fi

if [[ "${RENDER_ENGINE}" != "remotion" && "${RENDER_ENGINE}" != "timeline" ]]; then
    echo "--engine must be one of: remotion, timeline"
    exit 1
fi

if [ "${RENDER_ENGINE}" = "remotion" ]; then
    echo "Note: --engine remotion is mapped to timeline to preserve existing web design."
    RENDER_ENGINE="timeline"
fi

if [ -n "${PREVIEW_SECONDS}" ] && ! [[ "${PREVIEW_SECONDS}" =~ ^[0-9]+$ ]]; then
    echo "--preview-seconds must be numeric: ${PREVIEW_SECONDS}"
    exit 1
fi

if [ -n "${PREVIEW_SECONDS}" ] && [ "${PREVIEW_SECONDS}" -le 0 ]; then
    echo "--preview-seconds must be > 0"
    exit 1
fi

if ! is_positive_integer "${WEB_PORT}"; then
    echo "--port must be numeric: ${WEB_PORT}"
    exit 1
fi

if ! is_positive_integer "${MAX_SECONDS}"; then
    echo "--max-seconds must be numeric: ${MAX_SECONDS}"
    exit 1
fi

if ! [[ "${TURN_LEAD_MS}" =~ ^-?[0-9]+$ ]]; then
    echo "--turn-lead-ms must be an integer: ${TURN_LEAD_MS}"
    exit 1
fi

require_cmd ffmpeg
require_cmd ffprobe
require_cmd node
require_cmd npm
require_cmd curl

EPISODE_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}"
EPISODE_JSON="${EPISODE_BASE}/${DATE}.json"
EPISODE_MP3="${EPISODE_BASE}/${DATE}.mp3"
TIMELINE_RENDER_SCRIPT="${ROOT_DIR}/web/scripts/render_episode_slides.mjs"

OUTPUT_DIR="${EPISODE_BASE}/youtube"
OUTPUT_BASENAME="${DATE}_${LANG}_episode_timeline"
THUMBNAIL_BASENAME="${DATE}_${LANG}_episode_timeline_thumbnail"
if [ -n "${PREVIEW_SECONDS}" ]; then
    OUTPUT_BASENAME="${OUTPUT_BASENAME}_preview_${PREVIEW_SECONDS}s"
    THUMBNAIL_BASENAME="${THUMBNAIL_BASENAME}_preview_${PREVIEW_SECONDS}s"
fi

OUTPUT_MP4="${OUTPUT_DIR}/${OUTPUT_BASENAME}.mp4"
FRAMES_DIR="${OUTPUT_DIR}/${OUTPUT_BASENAME}_frames"
CONCAT_FILE="${OUTPUT_DIR}/${OUTPUT_BASENAME}.concat.txt"
TIMELINE_META="${OUTPUT_DIR}/${OUTPUT_BASENAME}.timeline.json"
THUMBNAIL_PNG="${OUTPUT_DIR}/${THUMBNAIL_BASENAME}.png"

WEB_DATA_PATH="${ROOT_DIR}/web/public/data/${DATE}.json"
WEB_AUDIO_PATH="${ROOT_DIR}/web/public/audio/${DATE}.mp3"

require_file "${EPISODE_JSON}"
require_file "${EPISODE_MP3}"
require_file "${TIMELINE_RENDER_SCRIPT}"

mkdir -p "${OUTPUT_DIR}"
mkdir -p "${ROOT_DIR}/web/public/data"
mkdir -p "${ROOT_DIR}/web/public/audio"

if [ -f "${OUTPUT_MP4}" ] && [ "${OVERWRITE}" -ne 1 ]; then
    echo "Output already exists: ${OUTPUT_MP4}"
    echo "Use --overwrite to replace existing files."
    exit 1
fi

if [ "${OVERWRITE}" -eq 1 ]; then
    rm -f "${OUTPUT_MP4}" "${CONCAT_FILE}" "${TIMELINE_META}" "${THUMBNAIL_PNG}"
    rm -rf "${FRAMES_DIR}"
fi

echo "Syncing episode assets into web/public..."
cp "${EPISODE_JSON}" "${WEB_DATA_PATH}"
cp "${EPISODE_MP3}" "${WEB_AUDIO_PATH}"

audio_duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${EPISODE_MP3}" | tr -d '\r')"
if [ -z "${audio_duration}" ]; then
    echo "Failed to read audio duration: ${EPISODE_MP3}"
    exit 1
fi

target_duration="${audio_duration}"
if [ -n "${PREVIEW_SECONDS}" ]; then
    target_duration="$(awk -v p="${PREVIEW_SECONDS}" -v a="${audio_duration}" 'BEGIN { if (p < a) print p; else print a }')"
fi

target_url="http://127.0.0.1:${WEB_PORT}/youtube/episode/${DATE}"
if [ "${TURN_LEAD_MS}" -ne 0 ]; then
    target_url="${target_url}?leadMs=${TURN_LEAD_MS}"
fi
target_url="$(ensure_web_ready "${target_url}" "${OUTPUT_DIR}")"

echo "Episode target URL: ${target_url}"
echo "Rendering episode slides from timeline..."
mkdir -p "${FRAMES_DIR}"

timeline_args=(
    --url "${target_url}"
    --output-dir "${FRAMES_DIR}"
    --concat-file "${CONCAT_FILE}"
    --meta-file "${TIMELINE_META}"
    --timeout "$((MAX_SECONDS * 1000))"
)
if [ -n "${PREVIEW_SECONDS}" ]; then
    timeline_args+=(--preview-seconds "${PREVIEW_SECONDS}")
fi
node "${TIMELINE_RENDER_SCRIPT}" "${timeline_args[@]}"

if [ ! -f "${CONCAT_FILE}" ]; then
    echo "Missing concat file: ${CONCAT_FILE}"
    exit 1
fi

echo "Muxing rendered timeline + source MP3 -> MP4..."
ffmpeg -hide_banner -loglevel error -y \
    -f concat -safe 0 -i "${CONCAT_FILE}" \
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
    "${OUTPUT_MP4}"

validate_mp4_streams "${OUTPUT_MP4}"

echo "Creating thumbnail from first frame..."
ffmpeg -hide_banner -loglevel error -y \
    -i "${OUTPUT_MP4}" \
    -frames:v 1 \
    "${THUMBNAIL_PNG}"

echo ""
echo "Episode render complete"
echo "Engine: ${RENDER_ENGINE}"
echo "MP4: ${OUTPUT_MP4}"
echo "Timeline meta: ${TIMELINE_META}"
echo "Thumbnail: ${THUMBNAIL_PNG}"
