# Web / YouTube Architecture

## Scope

`web/`는 두 가지를 담당한다.

- 웹 에피소드 플레이어 렌더링 (`/episode/{date}`)
- YouTube 제작용 렌더/캡처 화면 제공 (`/youtube/episode/{date}`)

## Runtime Components

1. Data inputs
- `podcast/{date}/ko/{date}.json`: 스크립트/타임라인
- `podcast/{date}/ko/{date}.mp3`: 오디오
- `podcast/{date}/ko/metadata.json`: 업로드 메타데이터

2. Slide generation
- `web/scripts/slide_generator.py`가 `web/src/landing/{date}/slides.ts` 생성
- 생성 후 지수/원자재/티커 값을 스냅샷으로 백필

3. Web player
- `src/components/EpisodePlayer.tsx`: 일반 웹 플레이어
- `src/components/Slideshow.tsx`: turn/time 기반 슬라이드 전환
- `src/components/TradingViewWidget.tsx`: 차트/데이터 폴백 렌더

4. YouTube player
- `src/components/YouTubeEpisodePlayer.tsx`: 캡처 최적화 UI
- `run_youtube.sh`: 캡처/합성/업로드 오케스트레이션
- `web/scripts/record_episode_video.mjs`: 실시간 녹화
- `web/scripts/render_episode_slides.mjs`: timeline 프레임 렌더

## Rendering Modes

- `timeline`:
  - 슬라이드 타임라인 기준으로 정적 프레임 합성
  - 빠르고 재현성이 높아 운영 기본
- `realtime`:
  - 실제 오디오 재생에 맞춰 페이지를 녹화
  - 체감 싱크 확인/디버깅용

## Data Reliability Rules

`slide_generator.py` 보강 사항:

- `WTI` 표기 정규화: `WTI`, `WTI 유`, `crude`, `oil`, `원유` -> `WTI Crude`
- WTI 값 백필 체인: `CL=F -> USO -> BZ=F -> BNO`
- 필수 market value 검증에 `WTI Crude` 포함
- `title` 슬라이드의 `date`를 에피소드 날짜(`YYYY-MM-DD`)로 강제 고정
- ticker-intro 가격 누락/0 검증 + 스냅샷 백필

## Capture Stability Rules

- YouTube 시작 오버레이는 초기 렌더에서 비활성화
- 메타데이터 로드 이후(비-capture 경로)만 오버레이 활성화
- `capture=1` 경로에서는 오버레이 미노출

## Current Known Limits

- Yahoo/차트 API 순간 실패 시 일부 카드 값은 비어 있을 수 있음
- 과거에 이미 생성된 `slides.ts`는 자동 재계산되지 않음
  - 최신 로직 반영을 위해 해당 날짜 슬라이드 재생성 필요

## Operational Commands

```bash
# 슬라이드 재생성
uv run python web/scripts/generate-slides.py 20260218

# 웹 실행
cd web && npm run dev

# YouTube 렌더(예: 120초 미리보기)
YOUTUBE_CAPTURE_PATH="/episode/20260218" ./run_youtube.sh 20260218 --lang ko --render-mode realtime --preview-seconds 120 --overwrite
```
