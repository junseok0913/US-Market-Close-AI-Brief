import { Composition } from "remotion";
import {
  EpisodeComposition,
  type RemotionEpisode,
} from "./EpisodeComposition";
import {
  ShortsComposition,
  type RemotionShortsEpisode,
} from "./ShortsComposition";
import {
  ShortsFirmComposition,
  type ShortsFirmCompositionProps,
} from "./ShortsFirmComposition";
import {
  BkngDebateShorts,
  type BkngDebateShortsProps,
} from "./BkngDebateShorts";
import bkngDebateDemoProps from "./demo/bkng-debate-demo.props.json";

const defaultShortsEpisode: RemotionShortsEpisode = {
  date: "20260220",
  lang: "ko",
  title: "US Market Close",
  hook: "오늘 장 핵심 이슈를 60초로 정리합니다.",
  durationSeconds: 60,
  audioFile: "shorts20260220.mp3",
  slides: [
    {
      id: 0,
      phase: "hook",
      theme: "flash",
      startSec: 0,
      endSec: 15,
      eyebrow: "HOOK",
      headline: "시장 반전의 핵심",
      subheadline: "숏츠 샘플 프레임",
      body: "실행 시 실제 slides.render.json 값으로 대체됩니다.",
      bullets: ["핵심 수치", "핵심 배경"],
      tickers: ["^GSPC", "^IXIC"],
      highlights: ["+0.69%", "+0.90%"],
    },
  ],
  captions: [],
  sourceDigest: [],
  meta: {
    keyPoints: ["핵심 포인트"],
    featuredTickers: ["^GSPC"],
    sceneCount: 1,
  },
};

const defaultShortsFirmEpisode: ShortsFirmCompositionProps["episode"] = {
  date: "20260220",
  lang: "ko",
  title: "소매주 XRT 급등, 블랙록은 어디로?",
  hook: "경기 둔화와 물가 상승, 두 가지 악재에도 시장이 급등한 이유는?",
  durationSeconds: 59,
  audioFile: "shortsfirm20260220.mp3",
  slides: [
    {
      id: 0,
      phase: "hook",
      theme: "alert",
      startSec: 0,
      endSec: 9,
      eyebrow: "장마감 쇼츠",
      headline: "GDP 쇼크에도 시장 반등",
      subheadline: "핵심 기업으로 흐름을 확인합니다.",
      body: "",
      bullets: [],
      tickers: [],
      highlights: [],
    },
    {
      id: 1,
      phase: "insight",
      theme: "neutral",
      startSec: 9,
      endSec: 40,
      eyebrow: "핵심 기업",
      headline: "XRT",
      subheadline: "",
      body: "",
      bullets: [],
      tickers: ["XRT"],
      highlights: [],
    },
    {
      id: 2,
      phase: "finale",
      theme: "flash",
      startSec: 40,
      endSec: 59,
      eyebrow: "체크포인트",
      headline: "Wrap Up",
      subheadline: "다음 지표 발표 전까지 변동성 주의",
      body: "",
      bullets: [],
      tickers: [],
      highlights: [],
    },
  ],
  captions: [],
  sourceDigest: [],
  meta: {
    keyPoints: ["대법원 판결로 관세 불확실성 완화", "소매 업종 강세", "블랙록 성장 스토리 부각"],
    featuredTickers: ["XRT", "BLK"],
    sceneCount: 3,
    companyMoves: [
      {
        ticker: "XRT",
        name: "SPDR S&P Retail ETF",
        day_change_pct: 0.73,
        day_change_display: "+0.73%",
        month_change_pct: -1.91,
        month_change_display: "-1.91%",
        market_cap_display: "$1.07B",
        pe_ratio_display: "18.22",
        pbr_display: "0.98",
        roe_display: "N/A",
        move_summary: "관세 제동 수혜 기대",
        reason: "수입 원가 부담 완화 기대",
        slide_points: ["관세 불확실성 완화", "소매 업종 대표 ETF 강세", "마진 개선 기대 반영"],
      },
    ],
  },
} as ShortsFirmCompositionProps["episode"];

const defaultEpisode: RemotionEpisode = {
  date: "20260220",
  nutshell: "대법원의 관세 제동에 불확실성 걷히며 증시 랠리",
  user_tickers: ["BLK"],
  chapter: [
    { name: "opening", start_id: 0, end_id: 5 },
    { name: "theme", start_id: 6, end_id: 20 },
    { name: "ticker", start_id: 21, end_id: 28 },
    { name: "closing", start_id: 29, end_id: 37 },
  ],
  scripts: [
    {
      id: 0,
      speaker: "진행자",
      text: "2월 20일 장마감 브리핑입니다.",
      sources: [],
      time: [0, 7891],
    },
    {
      id: 1,
      speaker: "해설자",
      text: "오늘 시장은 대법원 판결 이후 강한 상승세로 전환했습니다.",
      sources: [
        { type: "chart", ticker: "^GSPC", date: "2026-02-20" },
      ],
      time: [8391, 50202],
    },
  ],
};

const defaultBkngDebateShortsProps =
  bkngDebateDemoProps as BkngDebateShortsProps;

const calculateBkngDebateMetadata = async ({
  props,
}: {
  props: BkngDebateShortsProps;
}) => {
  const durationSeconds = Number(props.durationSeconds || 0);
  const safeDurationSeconds = Number.isFinite(durationSeconds) && durationSeconds > 0
    ? durationSeconds
    : 60;

  return {
    durationInFrames: Math.max(1, Math.ceil(safeDurationSeconds * 30)),
    props,
  };
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="EpisodeComposition"
        component={EpisodeComposition}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={108000}
        defaultProps={{
          episode: defaultEpisode,
          audioSrc: "audio/20260220.mp3",
          includeAudio: true,
          turnLeadMs: 550,
        }}
      />

      <Composition
        id="ShortsComposition"
        component={ShortsComposition}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={18000}
        defaultProps={{
          episode: defaultShortsEpisode,
          audioSrc: "audio/shorts/20260220.mp3",
          includeAudio: true,
        }}
      />

      <Composition
        id="ShortsFirmComposition"
        component={ShortsFirmComposition}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={18000}
        defaultProps={{
          episode: defaultShortsFirmEpisode,
          audioSrc: "audio/shorts-firm/shortsfirm20260220.mp3",
          includeAudio: true,
        }}
      />

      <Composition
        id="BkngDebateShorts"
        component={BkngDebateShorts}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1800}
        defaultProps={defaultBkngDebateShortsProps}
        calculateMetadata={calculateBkngDebateMetadata}
      />

    </>
  );
};
