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
