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
        uv run orchestrator.py $DATE
    else
        uv run orchestrator.py $DATE -t $TICKERS
    fi
else
    echo -e "\n[1/5] Orchestrator skipped (Start from $START_FROM)"
fi

# ------------------------------------------------------------------------------
# Step 2: Korean TTS Generation
# ------------------------------------------------------------------------------
if [ $START_FROM -le 2 ]; then
    echo -e "\n[2/6] Generating Korean TTS..."
    uv run python -m tts.src.tts $DATE --lang ko
else
    echo -e "\n[2/6] Korean TTS skipped (Start from $START_FROM)"
fi

# ------------------------------------------------------------------------------
# Step 3: English TTS Generation
# ------------------------------------------------------------------------------
if [ $START_FROM -le 3 ]; then
    echo -e "\n[3/6] Generating English TTS..."
    uv run python -m tts.src.tts $DATE --lang en
else
    echo -e "\n[3/6] English TTS skipped (Start from $START_FROM)"
fi


# ------------------------------------------------------------------------------
# Step 4: S3 Upload
# ------------------------------------------------------------------------------
if [ $START_FROM -le 4 ]; then
    echo -e "\n[4/6] Uploading to S3 ($BUCKET)..."
    echo "  ⚠️  AWS CLI configuration required (Profile: ${AWS_PROFILE:-default})"

    # 한국어 업로드
    echo "  ⬆️  Uploading Korean files..."
    aws s3 cp podcast/$DATE/ko/$DATE.mp3 s3://$BUCKET/$DATE/ko/$DATE.mp3
    aws s3 cp podcast/$DATE/ko/metadata.json s3://$BUCKET/$DATE/ko/metadata.json

    # 영어 업로드
    echo "  ⬆️  Uploading English files..."
    aws s3 cp podcast/$DATE/en/$DATE.mp3 s3://$BUCKET/$DATE/en/$DATE.mp3
    aws s3 cp podcast/$DATE/en/metadata.json s3://$BUCKET/$DATE/en/metadata.json
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
# Completion
# ------------------------------------------------------------------------------
echo -e "\n✅ Pipeline Complete!"
echo "--------------------------------------------------------"
echo "🇰🇷 RSS: https://d3kwqqx9p3861y.cloudfront.net/podcast.xml"
echo "🇺🇸 RSS: https://d3kwqqx9p3861y.cloudfront.net/podcast_en.xml"
echo "--------------------------------------------------------"
