# US Market Close AI Brief - Web Player

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

미국 증시 장마감 AI 브리핑을 재생하고 탐색하는 Next.js 웹 애플리케이션입니다.

## 주요 기능

- 팟캐스트 에피소드 목록 조회 (DB 연동)
- 에피소드 상세 청취 및 스크립트 뷰어
- 턴(Turn) 단위 하이라이트 및 이동
- **팟캐스트 메타데이터 생성 (New)**

## 디렉토리 구조

```
web/
├── public/                 # 정적 파일 (오디오, 데이터)
├── scripts/                # 유틸리티 스크립트
│   ├── generate-podcast-metadata.py  # 메타데이터 생성 (LLM)
│   ├── prompts/metadata.yaml         # 메타데이터 생성 프롬프트
│   └── build-data.ts                 # DB -> public JSON 빌드
├── src/                    # Next.js 소스
└── README.md
```

## Getting Started

First, run the development server:

```bash
# DB 데이터 기반으로 public/data json 파일 생성 후 서버 실행 (권장)
npm run dev:fresh

# or standard Next.js dev
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 유틸리티 스크립트

### 1. 팟캐스트 메타데이터 생성

Spotify 등 플랫폼 업로드를 위해 타이틀, 설명, 키워드를 자동 생성합니다.

```bash
# 루트 디렉토리에서 실행
uv run python web/scripts/generate-podcast-metadata.py YYYYMMDD
```

- **입력**: `podcast/{date}/script.json`
- **출력**: 
  - `podcast/{date}/metadata.json`
  - `podcast/{date}/metadata.txt`
- **기능**:
  - `nutshell` 기반 제목 생성
  - Gemini 2.5 Pro 기반 상세 설명 생성 (YAML 프롬프트 사용)
  - 스크립트 내 티커/키워드 자동 추출

### 2. 슬라이드 생성

```bash
uv run python web/scripts/generate-slides.py YYYYMMDD
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

