#!/bin/bash

# ==============================================================================
# Shorts-Pexels-Demo Independent Pipeline
#
# Flow:
#   1) Build scene plan from existing shorts script/slides
#   2) Prepare narration audio (reuse/copy from existing shorts)
#   3) Search Pexels + Gemini ranker and download scene images
#   4) Render MP4 (~59s after retime)
# ==============================================================================

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UV_CACHE_DIR="${UV_CACHE_DIR:-${ROOT_DIR}/.cache/uv}"
PROMPT_CONFIG_PATH="${ROOT_DIR}/shorts-pexels-demo/prompt/shorts_pexels_demo_pipeline.yaml"
SOURCE_SUBDIR="shorts"
DATE=""
LANG="ko"
START_FROM=1
OVERWRITE=0
NO_LLM=0
NO_LLM_RANKER=0
CURRENT_STEP="init"
USE_UV=0
PYTHON_BIN="python3"

usage() {
    cat <<'EOH'
Usage:
  ./shorts-pexels-demo/run_shorts_pexels_demo.sh YYYYMMDD --lang ko|en [--start-from 1..4] [--overwrite]

Options:
  --lang ko|en             Language path (default: ko)
  --start-from <n>         Resume from step n (1..4, default: 1)
                           1=scene-plan, 2=audio, 3=pexels-images, 4=render
  --source-subdir <name>   Source shorts folder under podcast/{date}/{lang} (default: shorts)
  --config <path>          Prompt/config YAML path
  --overwrite              Regenerate artifacts even if existing files are present
  --no-llm                 Disable scene-query LLM
  --no-llm-ranker          Disable image-ranker LLM (first candidate policy)
  -h, --help               Show this help
EOH
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

run_python() {
    if [ "${USE_UV}" -eq 1 ]; then
        uv run python "$@"
    else
        "${PYTHON_BIN}" "$@"
    fi
}

require_file() {
    local path="$1"
    if [ ! -f "${path}" ]; then
        echo "❌ Required file not found: ${path}"
        exit 1
    fi
}

run_step_1_scene_plan() {
    require_file "${ROOT_DIR}/shorts-pexels-demo/generate_shorts.py"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SCENE_PLAN_PATH}" ]; then
        local args=(
            "${DATE}"
            --lang "${LANG}"
            --source-subdir "${SOURCE_SUBDIR}"
            --config "${PROMPT_CONFIG_PATH}"
            --output "${SCENE_PLAN_PATH}"
        )
        if [ "${NO_LLM}" -eq 1 ]; then
            args+=(--no-llm)
        fi

        echo "🧠 Generating scene plan..."
        run_python "${ROOT_DIR}/shorts-pexels-demo/generate_shorts.py" "${args[@]}"
    else
        echo "♻️  Reusing scene plan: ${SCENE_PLAN_PATH}"
    fi

    require_file "${SCENE_PLAN_PATH}"
}

run_step_2_audio() {
    require_file "${ROOT_DIR}/shorts-pexels-demo/generate_shorts_audio.py"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${SHORTS_AUDIO_PATH}" ]; then
        echo "🎙️  Preparing shorts demo audio..."
        run_python "${ROOT_DIR}/shorts-pexels-demo/generate_shorts_audio.py" \
            "${DATE}" \
            --lang "${LANG}" \
            --source-subdir "${SOURCE_SUBDIR}" \
            --output-subdir "shorts-pexels-demo"
    else
        echo "♻️  Reusing demo audio: ${SHORTS_AUDIO_PATH}"
    fi

    require_file "${SHORTS_AUDIO_PATH}"
}

run_step_3_images() {
    require_file "${ROOT_DIR}/shorts-pexels-demo/generate_shorts_slides.py"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${RENDER_JSON_PATH}" ]; then
        local args=(
            "${DATE}"
            --lang "${LANG}"
            --config "${PROMPT_CONFIG_PATH}"
            --scene-plan "${SCENE_PLAN_PATH}"
            --output "${RENDER_JSON_PATH}"
            --manifest "${IMAGE_MANIFEST_PATH}"
            --images-dir "${IMAGES_DIR}"
        )
        if [ "${NO_LLM_RANKER}" -eq 1 ]; then
            args+=(--no-llm-ranker)
        fi

        echo "🖼️  Fetching Pexels images + ranking candidates..."
        run_python "${ROOT_DIR}/shorts-pexels-demo/generate_shorts_slides.py" "${args[@]}"
    else
        echo "♻️  Reusing render JSON: ${RENDER_JSON_PATH}"
    fi

    require_file "${RENDER_JSON_PATH}"
    require_file "${IMAGE_MANIFEST_PATH}"
}

run_step_4_render() {
    require_file "${ROOT_DIR}/shorts-pexels-demo/generate_shorts_video.py"

    if [ "${OVERWRITE}" -eq 1 ] || [ ! -f "${OUTPUT_MP4_PATH}" ]; then
        echo "🎬 Rendering shorts demo video..."
        run_python "${ROOT_DIR}/shorts-pexels-demo/generate_shorts_video.py" \
            "${DATE}" \
            --lang "${LANG}" \
            --input "${RENDER_JSON_PATH}" \
            --audio "${SHORTS_AUDIO_PATH}" \
            --output "${OUTPUT_MP4_PATH}" \
            --thumbnail "${THUMBNAIL_PATH}"
    else
        echo "♻️  Reusing rendered video: ${OUTPUT_MP4_PATH}"
    fi

    require_file "${OUTPUT_MP4_PATH}"
    require_file "${THUMBNAIL_PATH}"
}

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
        --source-subdir)
            SOURCE_SUBDIR="$2"
            shift 2
            ;;
        --config)
            PROMPT_CONFIG_PATH="$2"
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
        --no-llm-ranker)
            NO_LLM_RANKER=1
            shift
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
if ! [[ "${START_FROM}" =~ ^[0-9]+$ ]] || [ "${START_FROM}" -lt 1 ] || [ "${START_FROM}" -gt 4 ]; then
    echo "❌ --start-from must be within 1..4: ${START_FROM}"
    exit 1
fi

if [[ "${PROMPT_CONFIG_PATH}" != /* ]]; then
    PROMPT_CONFIG_PATH="${ROOT_DIR}/${PROMPT_CONFIG_PATH}"
fi
require_file "${PROMPT_CONFIG_PATH}"

EPISODE_BASE="${ROOT_DIR}/podcast/${DATE}/${LANG}"
if [ ! -d "${EPISODE_BASE}" ]; then
    echo "❌ Episode directory not found: ${EPISODE_BASE}"
    exit 1
fi

SHORTS_DEMO_BASE="${EPISODE_BASE}/shorts-pexels-demo"
SCENE_PLAN_PATH="${SHORTS_DEMO_BASE}/scenes.json"
SHORTS_AUDIO_PATH="${SHORTS_DEMO_BASE}/shorts${DATE}.mp3"
RENDER_JSON_PATH="${SHORTS_DEMO_BASE}/slides.render.json"
IMAGE_MANIFEST_PATH="${SHORTS_DEMO_BASE}/image_manifest.json"
IMAGES_DIR="${SHORTS_DEMO_BASE}/images"
OUTPUT_DIR="${SHORTS_DEMO_BASE}/youtube"
OUTPUT_MP4_PATH="${OUTPUT_DIR}/${DATE}_${LANG}_shorts_pexels_demo.mp4"
THUMBNAIL_PATH="${OUTPUT_DIR}/${DATE}_${LANG}_shorts_pexels_demo_thumbnail.png"

mkdir -p "${SHORTS_DEMO_BASE}" "${OUTPUT_DIR}" "${IMAGES_DIR}"

echo "========================================================"
echo "🎬 Shorts-Pexels-Demo Start"
echo "📅 Date: ${DATE}"
echo "🌐 Language: ${LANG}"
echo "📦 Source subdir: ${SOURCE_SUBDIR}"
echo "▶️  Start from: Step ${START_FROM}"
echo "🧠 Scene-query LLM: $( [ "${NO_LLM}" -eq 1 ] && echo "disabled" || echo "enabled" )"
echo "🔎 Image-ranker LLM: $( [ "${NO_LLM_RANKER}" -eq 1 ] && echo "disabled" || echo "enabled" )"
echo "⚙️  Config: ${PROMPT_CONFIG_PATH}"
echo "========================================================"

if [ "${START_FROM}" -le 1 ]; then
    CURRENT_STEP="step1_scene_plan"
    echo ""
    echo "[1/4] Scene plan"
    run_step_1_scene_plan
else
    echo ""
    echo "[1/4] Scene plan skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 2 ]; then
    CURRENT_STEP="step2_audio"
    echo ""
    echo "[2/4] Audio prepare"
    run_step_2_audio
else
    echo ""
    echo "[2/4] Audio prepare skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 3 ]; then
    CURRENT_STEP="step3_images"
    echo ""
    echo "[3/4] Pexels image fetch"
    run_step_3_images
else
    echo ""
    echo "[3/4] Pexels image fetch skipped (start-from ${START_FROM})"
fi

if [ "${START_FROM}" -le 4 ]; then
    CURRENT_STEP="step4_render"
    echo ""
    echo "[4/4] Render video"
    run_step_4_render
else
    echo ""
    echo "[4/4] Render video skipped (start-from ${START_FROM})"
fi

CURRENT_STEP="done"
echo ""
echo "✅ Shorts-Pexels-Demo complete"
echo "🧠 Scene plan: ${SCENE_PLAN_PATH}"
echo "🎵 Audio: ${SHORTS_AUDIO_PATH}"
echo "🧩 Render JSON: ${RENDER_JSON_PATH}"
echo "🖼️  Image manifest: ${IMAGE_MANIFEST_PATH}"
echo "📹 MP4: ${OUTPUT_MP4_PATH}"
echo "🖼️  Thumbnail: ${THUMBNAIL_PATH}"
