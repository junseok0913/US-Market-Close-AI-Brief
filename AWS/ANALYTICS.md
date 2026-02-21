# Listener Analytics 운영 가이드

CloudFront Standard Logging 기반으로 팟캐스트 오디오 요청 통계를 주간 리포트로 생성합니다.

## 1) 1회 설정

1. CloudFront 배포에서 Standard Logging을 활성화합니다.
2. 로그 대상 S3 버킷/프리픽스를 고정합니다.
   - `CLOUDFRONT_LOG_BUCKET`
   - `CLOUDFRONT_LOG_PREFIX=cloudfront/podcast/`
3. GitHub Secrets를 등록합니다.
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `CLOUDFRONT_LOG_BUCKET`
   - `CLOUDFRONT_LOG_PREFIX`
   - `CLOUDFRONT_DOMAIN`

## 2) 로컬 실행

```bash
uv run python AWS/scripts/generate_listener_report.py \
  --from 2026-02-09 \
  --to 2026-02-15 \
  --tz US/Eastern \
  --output-dir feedback/reports \
  --include-shorts \
  --write-json
```

산출물:
- `feedback/reports/weekly_listener_report_{from}_{to}.md`
- `feedback/reports/data/listener_daily_{from}_{to}.csv`
- `feedback/reports/data/listener_summary_{from}_{to}.json`

## 3) 데이터 기준

- 대상 URI:
  - `/{YYYYMMDD}/{ko|en}/{YYYYMMDD}.mp3`
  - `/{YYYYMMDD}/ko/shorts/shorts{YYYYMMDD}.mp3` (`--include-shorts` 사용 시)
- 청취 카운트: `sc-status in (200, 206)`
- 오류율: `(4xx+5xx) / 오디오요청전체`
- 봇 제외: UA에 `bot|crawler|spider|monitor|curl|wget|python-requests|headless`
- 플랫폼 분류 우선순위:
  1. `spotify`
  2. `applecoremedia|itunes|podcasts`
  3. `amazon|amzn`
  4. 미매칭 `unknown`
- 유니크 추정: `sha256(c-ip + "|" + user-agent)` 일 단위 distinct
- 경고 배너: `unknown_ratio > 35%`

## 4) 자동 스케줄

- 워크플로: `.github/workflows/podcast_listener_analytics.yml`
- 기본 실행:
  - 매주 화요일 UTC 1회 (이전 주 Mon-Sun 구간 계산)
  - `workflow_dispatch`로 백필 기간 입력 가능
- 동작:
  - 리포트 생성
  - `feedback/reports/**` artifact 업로드
  - 변경분 커밋/푸시

## 5) 백필

1. GitHub Actions에서 `Podcast Listener Analytics`를 수동 실행합니다.
2. `from`, `to` 입력 (`YYYY-MM-DD`).
3. 필요 시 `include_shorts`, `timezone`을 조정합니다.

## 6) 장애 대응

- 로그 일부 누락:
  - 스크립트는 실패하지 않고 경고를 리포트에 포함합니다.
  - 경고 날짜에 대해 CloudFront 로그 버킷 객체 유무를 확인합니다.
- Unknown 비중 급증:
  - `shared/ops/config/podcast/podcast_platform_rules.yaml` 패턴 업데이트 후 재실행.
- 빈 리포트:
  - `CLOUDFRONT_LOG_BUCKET`, `CLOUDFRONT_LOG_PREFIX`, `CLOUDFRONT_DOMAIN` 값 확인.
