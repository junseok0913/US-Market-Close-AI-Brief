# Web Frontend

Next.js 기반 팟캐스트 플레이어 웹 애플리케이션

## Quick Start

```bash
cd web

# 의존성 설치
npm install

# DB에서 데이터 빌드 + 개발 서버 실행
npm run dev:fresh

# 또는 개발 서버만 실행 (기존 데이터 사용)
npm run dev
```

http://localhost:3000 에서 확인

## Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (localhost만) |
| `npm run dev:network` | 개발 서버 실행 (외부 네트워크 접근 허용, `내IP:3000`) |
| `npm run dev:fresh` | 데이터 빌드 + 개발 서버 |
| `npm run build:data` | DB → public/ 데이터 빌드만 |
| `npm run build` | 데이터 빌드 + 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |

## YouTube 영상 자동화

Episode 화면(슬라이드 + 스크립트 + 플레이바)을 그대로 녹화해 MP4를 생성하고, 옵션으로 YouTube 업로드까지 수행합니다.

### 실행 명령

```bash
# 로컬 MP4만 생성
./run_youtube.sh 20260213 --lang ko

# 생성 + YouTube 업로드
./run_youtube.sh 20260213 --lang ko --upload --privacy private
```

### 사전 준비

```bash
# ffmpeg 설치 확인
ffmpeg -version

# Playwright가 없다면 설치
cd web
npm install --save-dev @playwright/test
npx playwright install chromium
```

### 출력 경로

```text
podcast/{date}/{lang}/youtube/{date}_{lang}_episode.mp4
```

### 필요한 환경변수

```bash
YOUTUBE_CLIENT_SECRETS_FILE=/absolute/path/to/client_secret.json  # optional, default: shared/runtime/secrets/youtube/client_secret.json
YOUTUBE_TOKEN_FILE=/absolute/path/to/token.json          # optional, default: shared/runtime/cache/youtube/token.json
YOUTUBE_PRIVACY_STATUS=private                            # optional
YOUTUBE_CATEGORY_ID=25                                    # optional
YOUTUBE_DEFAULT_TAGS=미국주식,시황,market,stocks          # optional
```

### 구현 구성

- `run_youtube.sh`: 전체 오케스트레이션 (자산 복사, 웹 서버 실행, 녹화, mp4 mux, 선택 업로드)
- `web/scripts/record_episode_video.mjs`: Playwright 기반 1920x1080 화면 녹화
- `shared/ops/scripts/youtube/upload_youtube_video.py`: OAuth 토큰 확보/갱신 + YouTube Data API 업로드
- `web/src/app/youtube/episode/[date]/page.tsx`: YouTube 녹화 전용 화면 라우트

### 운영 모드 요약

- `--render-mode timeline`: script 타임라인 기준 프레임 렌더 후 MP4 합성 (운영 권장, 재현성 높음)
- `--render-mode realtime`: 실제 재생 UI를 녹화 후 MP4 합성 (디버깅/체감 확인용)

### 최근 반영 사항 (2026-02)

- 캡처 안정성:
  - YouTube 플레이어의 시작 오버레이(`재생 시작`)가 캡처 첫 프레임에 찍히지 않도록 초기 렌더 동작 보정
  - `capture=1` 경로 + start-delay/trim 조합으로 초반 싱크 안정화
  - title 슬라이드 `date`를 에피소드 날짜로 강제 고정해 전일 날짜 혼입 방지
- 가독성:
  - 우측 `Live Script` 카드 글자 크기/행간/대비 상향
- 시장 데이터 신뢰성:
  - `market-summary` 백필에 WTI 원유(`CL=F`) 경로 추가
  - `WTI 유`/`WTI`/`crude`/`oil` 표기를 원유 심볼로 정규화
  - `CL=F` 응답 누락 시 `USO -> BZ=F -> BNO` 순서로 폴백 백필
  - 원유 값 누락 시 품질 검증에서 경고/실패로 잡히도록 보강
- 티커 소개 슬라이드 안전장치:
  - 실시간 시세 조회 실패 시 `N/A`/`No Data` 문자열 노출을 최소화하고, 변동률 중심 정보로 폴백

### 캡처 라우트

- 기본 캡처 라우트: `/youtube/episode/{date}`
- 기존 UI(` /episode/{date}`)로 캡처하고 싶으면 환경변수로 변경:

```bash
export YOUTUBE_CAPTURE_PATH=/episode/20260213
./run_youtube.sh 20260213 --lang ko --overwrite
```

## 데이터 흐름

```
../podcast/podcast.db          # SQLite DB (에피소드 메타데이터)
../podcast/{date}/{date}.json  # 에피소드 스크립트 데이터
../podcast/{date}/{date}.wav   # 에피소드 오디오 파일
        ↓
  npm run build:data (scripts/build-data.ts)
        ↓
public/data/episodes.json      # 에피소드 목록
public/data/{date}.json        # 에피소드 상세 데이터
public/audio/{date}.wav        # 오디오 파일
```

**DB 업데이트 후**: `npm run build:data` 실행 필요

## 프로젝트 구조

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈 (에피소드 목록)
│   │   ├── globals.css         # 전역 스타일
│   │   └── episode/
│   │       └── [date]/
│   │           └── page.tsx    # 에피소드 상세 페이지
│   │
│   ├── components/
│   │   ├── EpisodeCard.tsx     # 에피소드 카드 (목록용)
│   │   ├── EpisodePlayer.tsx   # 에피소드 플레이어 (상세페이지)
│   │   ├── ScriptViewer.tsx    # 스크립트 뷰어
│   │   ├── ScriptTurn.tsx      # 스크립트 턴 (발화 단위)
│   │   ├── Playbar.tsx         # 오디오 컨트롤 바
│   │   └── TickerTag.tsx       # 티커 태그
│   │
│   ├── lib/
│   │   ├── data.ts             # 데이터 로딩 함수
│   │   ├── format.ts           # 날짜/시간 포맷 유틸
│   │   └── utils.ts            # 기타 유틸리티
│   │
│   └── types/
│       └── episode.ts          # 타입 정의
│
├── public/
│   ├── data/                   # 빌드된 JSON 데이터
│   ├── audio/                  # 오디오 파일
│   └── icons/                  # SVG 아이콘
│
└── scripts/
    └── build-data.ts           # DB → public 빌드 스크립트
```

## 주요 기능

### 에피소드 목록 (홈)
- 에피소드 카드 목록
- 호버 시 밑줄 애니메이션
- View Transitions API로 페이지 전환

### 에피소드 플레이어
- **레이아웃**: 랜딩 페이지(4) : 스크립트(2) 비율
- **반응형**: 작은 화면에서는 스크립트만 표시
- **오디오 컨트롤**:
  - 재생/일시정지
  - 10초 앞/뒤로
  - 배속 조절 (0.05 단위, 0.25x ~ 2.00x)
  - 반복 재생
- **스크립트 동기화**: 오디오 시간에 맞춰 현재 발화 하이라이트
- **스크립트 클릭**: 해당 시점으로 이동

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Font**: SUIT Variable, Computer Modern

## 디자인 시스템

### 색상 (globals.css)

```css
--color-bg-primary: #F5F4F0;    /* 배경 */
--color-bg-card: #FFFFFF;        /* 카드 배경 */
--color-text-primary: #000000;   /* 텍스트 */
--color-border-default: #000000; /* 테두리 */
```

### 폰트

- **SUIT Variable**: UI 텍스트
- **Computer Modern**: 스크립트 본문

## 슬라이드 자동 생성

orchestrator 실행 시, `script.json`을 기반으로 웹 슬라이드가 자동 생성됩니다.

### 생성 흐름

```
podcast/{date}/script.json
        ↓ (LLM 분석)
  python web/scripts/slide_generator.py
        ↓
web/src/landing/{date}/slides.ts  (생성)
web/src/landing/index.ts          (자동 업데이트)
```

### 수동 생성

orchestrator가 실패하거나, 슬라이드만 재생성하고 싶을 때:

```bash
python web/scripts/generate-slides.py 20260121
```

### 슬라이드 타입

`src/types/slide.ts`에 정의된 타입 참고:
- `title`: 타이틀 슬라이드
- `market-summary`: 시장 요약 (지수, 상품)
- `headline`: 주요 뉴스
- `ticker-intro`: 종목 소개
- `ticker-analysis`: 종목 분석
- `closing`: 마무리

### 기능

- **LLM 기반 생성**: GPT가 script.json 분석 후 TypeScript 코드 생성
- **티커 심볼 변환**: Yahoo Finance → TradingView 자동 변환
- **후처리**: 티커 변환 누락 시 강제 보정 (2차 안전장치)
- **index.ts 업데이트**: import 및 slidesMap 자동 추가

### 환경변수

슬라이드 생성 전용 LLM 설정 (선택사항):

```bash
# .env
SLIDE_OPENAI_MODEL=gpt-4o         # 슬라이드 전용 모델
SLIDE_OPENAI_TEMPERATURE=0.3       # 슬라이드 전용 temperature
```

설정하지 않으면 `OPENAI_MODEL` (기본값: gpt-5.1) 사용
