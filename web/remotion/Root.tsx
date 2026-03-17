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
  ShortsThemeFirmComposition,
  type ShortsThemeFirmCompositionProps,
} from "./ShortsThemeFirmComposition";
import {
  WdcDebateShortsDemo,
  type WdcDebateShortsDemoProps,
} from "./WdcDebateShortsDemo";
import wdcDebateDemoProps from "./demo/wdc-debate-demo.props.json";

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

const defaultShortsThemeFirmEpisode: ShortsThemeFirmCompositionProps["episode"] = {
  date: "20260307",
  lang: "ko",
  title: "AMAT 분석",
  hook: "AI 수혜의 중심에 있지만 중국 규제 리스크가 동시에 커진 AMAT를 네 가지 관점으로 봅니다.",
  durationSeconds: 60,
  audioFile: "20260307.mp3",
  slides: [
    {
      id: 0,
      phase: "hook",
      theme: "flash",
      startSec: 0,
      endSec: 8,
      eyebrow: "HOOK",
      headline: "AMAT Expert Analysis",
      subheadline: "AI 성장과 규제 리스크가 충돌했습니다.",
      body: "",
      bullets: [],
      tickers: ["AMAT"],
      highlights: [],
    },
    {
      id: 1,
      phase: "insight",
      theme: "neutral",
      startSec: 8,
      endSec: 20,
      eyebrow: "Fundamental",
      headline: "안정적인 현금과 서비스 매출",
      subheadline: "반도체 장비 시장의 기초 체력이 강합니다.",
      body: "현금 여력과 반복 매출 기반이 견조합니다.",
      bullets: ["현금 보유", "서비스 매출", "재무 안정성"],
      tickers: ["AMAT"],
      highlights: [],
    },
    {
      id: 2,
      phase: "insight",
      theme: "bull",
      startSec: 20,
      endSec: 32,
      eyebrow: "Growth",
      headline: "AI 공정 투자 확대",
      subheadline: "GAA와 HBM 관련 장비 수요가 성장 포인트입니다.",
      body: "첨단 공정 전환이 장비 수요를 밀어줍니다.",
      bullets: ["GAA", "HBM", "AI capex"],
      tickers: ["AMAT"],
      highlights: [],
    },
    {
      id: 3,
      phase: "insight",
      theme: "bear",
      startSec: 32,
      endSec: 44,
      eyebrow: "Risk",
      headline: "중국 수출 규제 변수",
      subheadline: "정책 리스크가 밸류에이션을 흔들 수 있습니다.",
      body: "중국 노출도는 핵심 리스크입니다.",
      bullets: ["중국 매출", "규제 확대", "정책 불확실성"],
      tickers: ["AMAT"],
      highlights: [],
    },
    {
      id: 4,
      phase: "insight",
      theme: "alert",
      startSec: 44,
      endSec: 54,
      eyebrow: "Sentiment",
      headline: "시장은 리스크를 더 크게 봤습니다",
      subheadline: "AI 기대보다 규제 부담이 먼저 반영됐습니다.",
      body: "당일 주가 급락으로 투자심리가 꺾였습니다.",
      bullets: ["급락", "심리 위축", "변동성 확대"],
      tickers: ["AMAT"],
      highlights: [],
    },
    {
      id: 5,
      phase: "finale",
      theme: "flash",
      startSec: 54,
      endSec: 60,
      eyebrow: "Wrap Up",
      headline: "핵심은 성장과 규제의 힘겨루기",
      subheadline: "다음 분기엔 중국 규제와 AI 설비투자를 함께 봐야 합니다.",
      body: "",
      bullets: ["AI 설비투자", "중국 규제", "실적 가이던스"],
      tickers: ["AMAT"],
      highlights: [],
    },
  ],
  captions: [],
  sourceDigest: [],
  meta: {
    keyPoints: ["현금과 서비스 매출은 강점", "AI 공정 투자 수혜 기대", "중국 규제가 핵심 리스크"],
    featuredTickers: ["AMAT"],
    sceneCount: 6,
    variant: "theme-firm",
    companyMoves: [
      {
        ticker: "AMAT",
        name: "Applied Materials",
        day_change_pct: -6.12,
        day_change_display: "-6.12%",
        month_change_pct: 4.18,
        month_change_display: "+4.18%",
        market_cap_display: "$167.3B",
        pe_ratio_display: "24.1",
        pbr_display: "8.7",
        roe_display: "39.2%",
        move_summary: "안정적인 재무 체력",
        reason: "서비스와 장비 매출이 균형을 이룹니다.",
        slide_points: ["현금 보유", "서비스 매출", "재무 안정성"],
        segment_role: "fundamental",
      },
      {
        ticker: "AMAT",
        name: "Applied Materials",
        day_change_pct: -6.12,
        day_change_display: "-6.12%",
        month_change_pct: 4.18,
        month_change_display: "+4.18%",
        market_cap_display: "$167.3B",
        pe_ratio_display: "24.1",
        pbr_display: "8.7",
        roe_display: "39.2%",
        move_summary: "AI 공정 투자 수혜",
        reason: "GAA와 HBM 장비 수요가 성장 동력입니다.",
        slide_points: ["GAA", "HBM", "AI capex"],
        segment_role: "growth",
      },
      {
        ticker: "AMAT",
        name: "Applied Materials",
        day_change_pct: -6.12,
        day_change_display: "-6.12%",
        month_change_pct: 4.18,
        month_change_display: "+4.18%",
        market_cap_display: "$167.3B",
        pe_ratio_display: "24.1",
        pbr_display: "8.7",
        roe_display: "39.2%",
        move_summary: "중국 규제 압력",
        reason: "수출 제한 강화 가능성이 리스크입니다.",
        slide_points: ["중국 매출", "규제 확대", "정책 불확실성"],
        segment_role: "risk",
      },
      {
        ticker: "AMAT",
        name: "Applied Materials",
        day_change_pct: -6.12,
        day_change_display: "-6.12%",
        month_change_pct: 4.18,
        month_change_display: "+4.18%",
        market_cap_display: "$167.3B",
        pe_ratio_display: "24.1",
        pbr_display: "8.7",
        roe_display: "39.2%",
        move_summary: "투자심리 급랭",
        reason: "시장 반응은 성장보다 리스크를 먼저 봤습니다.",
        slide_points: ["급락", "심리 위축", "변동성 확대"],
        segment_role: "sentiment",
      },
    ],
    companyProfile: {
      ticker: "AMAT",
      name: "Applied Materials",
      expert_sections: [
        {
          name: "company_1",
          role: "fundamental",
          label: "펀더멘털",
          summary: "현금과 반복 매출 기반이 탄탄한 반도체 장비 대형주입니다.",
          slide_points: ["현금 보유", "서비스 매출", "재무 안정성"],
        },
        {
          name: "company_2",
          role: "growth",
          label: "성장 포인트",
          summary: "AI 공정 전환과 고대역폭 메모리 투자가 장비 수요를 키웁니다.",
          slide_points: ["GAA", "HBM", "AI capex"],
        },
        {
          name: "company_3",
          role: "risk",
          label: "리스크",
          summary: "중국 노출도와 수출 규제 강화는 밸류에이션에 직접적 부담입니다.",
          slide_points: ["중국 매출", "규제 확대", "정책 불확실성"],
        },
        {
          name: "company_4",
          role: "sentiment",
          label: "시장 해석",
          summary: "시장은 성장 서사보다 규제 리스크를 더 빠르게 가격에 반영했습니다.",
          slide_points: ["급락", "심리 위축", "변동성 확대"],
        },
      ],
    },
  },
};

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

const defaultWdcDebateShortsDemoProps =
  wdcDebateDemoProps as WdcDebateShortsDemoProps;

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
        id="ShortsThemeFirmComposition"
        component={ShortsThemeFirmComposition}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={18000}
        defaultProps={{
          episode: defaultShortsThemeFirmEpisode,
          audioSrc: "audio/shorts-theme-firm/20260307.mp3",
          includeAudio: true,
        }}
      />

      <Composition
        id="WdcDebateShortsDemo"
        component={WdcDebateShortsDemo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1800}
        defaultProps={defaultWdcDebateShortsDemoProps}
      />
    </>
  );
};
