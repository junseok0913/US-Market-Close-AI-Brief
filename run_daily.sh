#!/bin/bash

# ==============================================================================
# Daily Podcast Automation Script (Local)
#
# 사용법:
#   ./run_daily.sh [YYYYMMDD] [TICKERS...] [--start-from N]
#
# 예시:
#   ./run_daily.sh                 # 오늘 날짜로 실행 (처음부터)
#   ./run_daily.sh 20260126        # 특정 날짜 실행
#   ./run_daily.sh 20260126 META   # 특정 날짜 + 티커 지정
#   ./run_daily.sh 20260126 --start-from 3  # step 3(S3 Upload)부터 시작
# ==============================================================================

# 에러 발생 시 즉시 중단
set -e

# 기본값
START_FROM=1
DATE=""
TICKERS_ARR=()
TTS_ROUND_RETRY_MAX_ATTEMPTS="${TTS_ROUND_RETRY_MAX_ATTEMPTS:-3}"
TTS_ROUND_RETRY_DELAY_SECONDS="${TTS_ROUND_RETRY_DELAY_SECONDS:-5}"
SHORTS_FIRM_DURATION_SECONDS="${SHORTS_FIRM_DURATION_SECONDS:-90}"
SHORTS_FIRM_TTS_VOICE="${SHORTS_FIRM_TTS_VOICE:-Charon}"
SHORTS_FIRM_TTS_TEMPERATURE="${SHORTS_FIRM_TTS_TEMPERATURE:-0.6}"
SHORTS_FIRM_PROMPT_CONFIG="${SHORTS_FIRM_PROMPT_CONFIG:-shorts-firm/prompt/shorts_firm_pipeline.yaml}"
SHORTS_FIRM_SLIDES_PROMPT_CONFIG="${SHORTS_FIRM_SLIDES_PROMPT_CONFIG:-shorts-firm/prompt/shorts_firm_slides.yaml}"

THUMBNAIL_SCRIPT="./shared/ops/scripts/youtube/generate_episode_thumbnail.sh"
if [ ! -f "$THUMBNAIL_SCRIPT" ] && [ -f "./scripts/generate_episode_thumbnail.sh" ]; then
    THUMBNAIL_SCRIPT="./scripts/generate_episode_thumbnail.sh"
fi


# AWS 프로필 설정 (기본값: Nam)
# 이 설정이 있어야 S3 업로드 등 모든 AWS 명령어가 'Nam' 프로필로 실행됩니다.
export AWS_PROFILE=${AWS_PROFILE:-Nam}

# 인자 파싱 (순서 무관하도록 처리)
while [[ $# -gt 0 ]]; do
    case "$1" in
        --start-from)
            START_FROM="$2"
            shift 2
            ;;
        *)
            # 날짜 형식인지 체크 (8자리 숫자)
            if [[ "$1" =~ ^[0-9]{8}$ ]] && [ -z "$DATE" ]; then
                DATE="$1"
            elif [[ "$1" =~ ^[A-Z0-9,]+$ ]]; then
                # 나머지는 티커로 간주 (대문자/숫자/쉼표 포함 시)
                TICKERS_ARR+=("$1")
            else
                # 날짜가 이미 세팅되었거나 형식이 안 맞으면 그냥 티커로 추가
                TICKERS_ARR+=("$1")
            fi
            shift
            ;;
    esac
done

# 날짜가 없으면 오늘 날짜 사용
if [ -z "$DATE" ]; then
    DATE=$(date +"%Y%m%d")
fi

# 티커 배열을 공백 구분 문자열로 변환
TICKERS="${TICKERS_ARR[*]}"
BUCKET="podcast-daily-stock"

retry_round() {
    local round_name="$1"
    local max_attempts="$2"
    shift 2

    local attempt=1
    local exit_code=1

    while [ "$attempt" -le "$max_attempts" ]; do
        echo "  🔁 ${round_name} attempt ${attempt}/${max_attempts}..."
        set +e
        "$@"
        exit_code=$?
        set -e

        if [ "$exit_code" -eq 0 ]; then
            if [ "$attempt" -gt 1 ]; then
                echo "  ✅ ${round_name} recovered on attempt ${attempt}/${max_attempts}"
            fi
            return 0
        fi

        if [ "$attempt" -lt "$max_attempts" ]; then
            echo "  ⚠️  ${round_name} failed (exit=${exit_code}). Retrying in ${TTS_ROUND_RETRY_DELAY_SECONDS}s..."
            sleep "$TTS_ROUND_RETRY_DELAY_SECONDS"
        fi

        attempt=$((attempt + 1))
    done

    echo "  ❌ ${round_name} failed after ${max_attempts} attempts."
    return "$exit_code"
}

run_step2_round() {
    (
        set -e
        uv run python -m tts.src.tts "$DATE" --lang ko

        # Copy main MP3 to web public folder for local development
        # Keep this before shorts so main episode audio is available even if shorts fails.
        if [ -f "podcast/$DATE/ko/$DATE.mp3" ]; then
            echo "  📂 Copying main MP3 to web/public/audio..."
            cp "podcast/$DATE/ko/$DATE.mp3" "web/public/audio/$DATE.mp3"
        fi
        
        echo -e "\n[2.5/6] Generating Shorts Script + Slides (Korean)..."
        if [ -f "podcast/$DATE/ko/script.json" ]; then
            uv run shorts/generate_shorts.py "podcast/$DATE/ko" --duration 90
        else
            echo "  ⚠️  podcast/$DATE/ko/script.json not found. Skipping shorts script/slide generation."
        fi
        uv run python shorts/generate_shorts_audio.py "$DATE" --lang ko --voice Charon --temperature 0.6
        if [ -f "podcast/$DATE/ko/shorts/script.json" ]; then
            uv run python shorts/generate_shorts_slides.py "$DATE" --lang ko \
                --section-timing "podcast/$DATE/ko/shorts/sections.timing.json"
        fi

        echo -e "\n[2.6/6] Generating Shorts-Firm Script + Audio + Slides (Korean)..."
        if [ -f "podcast/$DATE/ko/script.json" ] && [ -f "podcast/$DATE/ko/metadata.txt" ]; then
            uv run python shorts-firm/generate_script.py "podcast/$DATE/ko" \
                --duration "${SHORTS_FIRM_DURATION_SECONDS}" \
                --prompt-config "${SHORTS_FIRM_PROMPT_CONFIG}"

            uv run python shorts-firm/generate_audio.py "$DATE" --lang ko \
                --voice "${SHORTS_FIRM_TTS_VOICE}" \
                --temperature "${SHORTS_FIRM_TTS_TEMPERATURE}" \
                --config "${SHORTS_FIRM_PROMPT_CONFIG}"

            uv run python shorts-firm/generate_slide_script.py "$DATE" --lang ko \
                --script "podcast/$DATE/ko/shorts-firm/script.json" \
                --timing "podcast/$DATE/ko/shorts-firm/sections.timing.json" \
                --script-output "podcast/$DATE/ko/shorts-firm/slides.script.json" \
                --template-output "podcast/$DATE/ko/shorts-firm/slides.render.template.json" \
                --render-output "podcast/$DATE/ko/shorts-firm/slides.render.json" \
                --config "${SHORTS_FIRM_SLIDES_PROMPT_CONFIG}" \
                --overwrite-render

            uv run python shorts-firm/generate_tsx.py "$DATE" --lang ko \
                --input "podcast/$DATE/ko/shorts-firm/slides.render.json" \
                --output "web/src/generated/shorts-firm/${DATE}_ko.generated.tsx"
        else
            echo "  ⚠️  podcast/$DATE/ko/script.json or metadata.txt not found. Skipping shorts-firm generation."
        fi
    )
}

run_step3_round() {
    (
        set -e
        uv run python -m tts.src.tts "$DATE" --lang en
    )
}

echo "========================================================"
echo "🚀 Daily Podcast Pipeline Start"
echo "📅 Date: $DATE"
echo "🎯 Tickers: ${TICKERS:-"(Auto Select)"}"
echo "▶️  Start From: Step $START_FROM"
echo "========================================================"

# ------------------------------------------------------------------------------
# Step 1: Orchestrator (Script, Translation, Metadata, Slides)
# ------------------------------------------------------------------------------
if [ $START_FROM -le 1 ]; then
    echo -e "\n[1/5] Running Orchestrator..."
    if [ -z "$TICKERS" ]; then
        NEWS_AWS_PROFILE=Nam uv run orchestrator.py $DATE
    else
        NEWS_AWS_PROFILE=Nam uv run orchestrator.py $DATE -t $TICKERS
    fi
else
    echo -e "\n[1/5] Orchestrator skipped (Start from $START_FROM)"
fi

# ------------------------------------------------------------------------------
# Step 2: Korean TTS Generation
# ------------------------------------------------------------------------------
if [ $START_FROM -le 2 ]; then
    echo -e "\n[2/6] Generating Korean TTS..."
    retry_round "Step 2 (Korean TTS + Shorts + Shorts-Firm)" "$TTS_ROUND_RETRY_MAX_ATTEMPTS" run_step2_round
else
    echo -e "\n[2/6] Korean TTS & Shorts + Shorts-Firm skipped (Start from $START_FROM)"
fi

# ------------------------------------------------------------------------------
# Step 3: English TTS Generation
# ------------------------------------------------------------------------------
if [ $START_FROM -le 3 ]; then
    echo -e "\n[3/6] Generating English TTS..."
    retry_round "Step 3 (English TTS)" "$TTS_ROUND_RETRY_MAX_ATTEMPTS" run_step3_round
else
    echo -e "\n[3/6] English TTS skipped (Start from $START_FROM)"
fi


# # ------------------------------------------------------------------------------
# Step 4: S3 Upload
# ------------------------------------------------------------------------------
if [ $START_FROM -le 4 ]; then
    echo -e "\n[4/6] Uploading to S3 ($BUCKET)..."
    
    # Load .env file for S3 credentials
    if [ -f .env ]; then
        echo "  🔐 Loading S3 credentials from .env..."
        export $(grep -v '^#' .env | grep -E '^(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AWS_REGION)=' | xargs)
    fi
    
    # Unset AWS_PROFILE to use credentials from .env instead of SSO profile
    # (The Nam profile is for Yahoo Finance news, not S3)
    unset AWS_PROFILE
    
    echo "  ⚠️  Using AWS credentials from .env file"

    # 한국어 업로드
    echo "  ⬆️  Uploading Korean files..."
    echo "  🖼️  Generating Korean episode thumbnail..."
    if [ -f "$THUMBNAIL_SCRIPT" ]; then
        if "$THUMBNAIL_SCRIPT" "$DATE" --lang ko --overwrite; then
            echo "  ✅ Korean thumbnail generated"
        else
            echo "  ⚠️  Failed to generate Korean thumbnail (continuing without thumbnail upload)"
        fi
    else
        echo "  ⚠️  Thumbnail script not found: $THUMBNAIL_SCRIPT (skipping thumbnail generation)"
    fi

    aws s3 cp podcast/$DATE/ko/$DATE.mp3 s3://$BUCKET/$DATE/ko/$DATE.mp3
    aws s3 cp podcast/$DATE/ko/metadata.json s3://$BUCKET/$DATE/ko/metadata.json
    if [ -f "podcast/$DATE/ko/youtube/${DATE}_ko_thumbnail.png" ]; then
        aws s3 cp "podcast/$DATE/ko/youtube/${DATE}_ko_thumbnail.png" "s3://$BUCKET/$DATE/ko/thumbnail.png"
    else
        echo "  ⏭️  Korean thumbnail not found, skipping thumbnail upload"
    fi
    
    # 쇼츠 업로드
    if [ -f "podcast/$DATE/ko/shorts/shorts$DATE.mp3" ]; then
        echo "  ⬆️  Uploading Shorts..."
        aws s3 cp podcast/$DATE/ko/shorts/shorts$DATE.mp3 s3://$BUCKET/$DATE/ko/shorts/shorts$DATE.mp3
    fi
    if [ -f "podcast/$DATE/ko/shorts-firm/shorts$DATE.mp3" ]; then
        echo "  ⬆️  Uploading Shorts-Firm..."
        aws s3 cp podcast/$DATE/ko/shorts-firm/shorts$DATE.mp3 s3://$BUCKET/$DATE/ko/shorts-firm/shorts$DATE.mp3
    fi

    # 영어 업로드
    if [ -f "podcast/$DATE/en/$DATE.mp3" ]; then
        echo "  ⬆️  Uploading English files..."
        echo "  🖼️  Generating English episode thumbnail..."
        if [ -f "$THUMBNAIL_SCRIPT" ]; then
            if "$THUMBNAIL_SCRIPT" "$DATE" --lang en --overwrite; then
                echo "  ✅ English thumbnail generated"
            else
                echo "  ⚠️  Failed to generate English thumbnail (continuing without thumbnail upload)"
            fi
        else
            echo "  ⚠️  Thumbnail script not found: $THUMBNAIL_SCRIPT (skipping thumbnail generation)"
        fi

        aws s3 cp podcast/$DATE/en/$DATE.mp3 s3://$BUCKET/$DATE/en/$DATE.mp3
        
        if [ -f "podcast/$DATE/en/metadata.json" ]; then
            aws s3 cp podcast/$DATE/en/metadata.json s3://$BUCKET/$DATE/en/metadata.json
        fi

        if [ -f "podcast/$DATE/en/youtube/${DATE}_en_thumbnail.png" ]; then
            aws s3 cp "podcast/$DATE/en/youtube/${DATE}_en_thumbnail.png" "s3://$BUCKET/$DATE/en/thumbnail.png"
        else
            echo "  ⏭️  English thumbnail not found, skipping thumbnail upload"
        fi
    else
        echo "  ⏭️  English mp3 not found, skipping English upload for $DATE"
    fi
    
    # Restore AWS_PROFILE for subsequent steps
    export AWS_PROFILE=Nam
else
    echo -e "\n[4/6] S3 Upload skipped (Start from $START_FROM)"
fi


# ------------------------------------------------------------------------------
# Step 5: Update RSS Feeds
# ------------------------------------------------------------------------------
if [ $START_FROM -le 5 ]; then
    echo -e "\n[5/6] Updating RSS Feeds..."

    echo "  📡 Updating Korean Feed..."
    uv run python AWS/scripts/update_podcast_feed.py --lang ko

    echo "  📡 Updating English Feed..."
    uv run python AWS/scripts/update_podcast_feed.py --lang en
else
    echo -e "\n[5/6] RSS Update skipped (Start from $START_FROM)"
fi


# ------------------------------------------------------------------------------
# Step 6: Cleanup (Delete TTS folders and WAV files)
# ------------------------------------------------------------------------------
echo -e "\n[6/6] Cleaning up intermediate files..."

# Delete Korean TTS folder
if [ -d "podcast/$DATE/ko/tts" ]; then
    echo "  🗑️  Deleting Korean TTS folder..."
    rm -rf "podcast/$DATE/ko/tts"
fi

# Delete English TTS folder
if [ -d "podcast/$DATE/en/tts" ]; then
    echo "  🗑️  Deleting English TTS folder..."
    rm -rf "podcast/$DATE/en/tts"
fi

# Delete WAV files (if any exist)
if ls podcast/$DATE/ko/*.wav 1> /dev/null 2>&1; then
    echo "  🗑️  Deleting Korean WAV files..."
    rm -f podcast/$DATE/ko/*.wav
fi

if [ -d "podcast/$DATE/ko/shorts-firm/tts" ]; then
    echo "  🗑️  Deleting Shorts-Firm TTS folder..."
    rm -rf "podcast/$DATE/ko/shorts-firm/tts"
fi

if ls podcast/$DATE/ko/shorts-firm/*.wav 1> /dev/null 2>&1; then
    echo "  🗑️  Deleting Shorts-Firm WAV files..."
    rm -f podcast/$DATE/ko/shorts-firm/*.wav
fi

if ls podcast/$DATE/en/*.wav 1> /dev/null 2>&1; then
    echo "  🗑️  Deleting English WAV files..."
    rm -f podcast/$DATE/en/*.wav
fi

echo "  ✅ Cleanup complete!"


# ------------------------------------------------------------------------------
# Completion
# ------------------------------------------------------------------------------
echo -e "\n✅ Pipeline Complete!"
echo "--------------------------------------------------------"
echo "🇰🇷 RSS: https://d3kwqqx9p3861y.cloudfront.net/podcast.xml"
echo "🇺🇸 RSS: https://d3kwqqx9p3861y.cloudfront.net/podcast_en.xml"
echo "--------------------------------------------------------"
