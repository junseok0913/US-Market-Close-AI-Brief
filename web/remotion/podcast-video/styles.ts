export const COLORS = {
  bg: "#080c18",
  bgPanel: "#0f1629",
  bgCard: "#151d35",
  bgCardBorder: "#1e2d4a",
  primary: "#3b82f6",
  accent: "#f59e0b",
  positive: "#10b981",
  negative: "#ef4444",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#475569",
  hostColor: "#60a5fa",
  analystColor: "#fbbf24",
  border: "#1e293b",
} as const;

export type ChapterMeta = {
  label: string;
  color: string;
  icon: string;
};

export type ChapterMetaMap = Record<string, ChapterMeta>;

export const CHAPTER_META: ChapterMetaMap = {
  opening: { label: "오프닝", color: "#3b82f6", icon: "▶" },
  theme: { label: "핵심 분석", color: "#8b5cf6", icon: "◆" },
  ticker: { label: "종목 분석", color: "#f59e0b", icon: "◈" },
  closing: { label: "마무리", color: "#10b981", icon: "■" },
};

export function resolveChapterMeta(
  chapterName: string,
  chapterMetaMap?: ChapterMetaMap,
): ChapterMeta {
  return (
    chapterMetaMap?.[chapterName] ||
    CHAPTER_META[chapterName] ||
    chapterMetaMap?.opening ||
    CHAPTER_META.opening
  );
}

export const SPEAKER_META: Record<
  string,
  { label: string; color: string; role: string }
> = {
  진행자: { label: "진행자", color: COLORS.hostColor, role: "HOST" },
  해설자: { label: "해설자", color: COLORS.analystColor, role: "ANALYST" },
};

export const TICKER_KR_NAMES: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^IXIC": "나스닥 종합",
  "^DJI": "다우존스",
  "^VIX": "공포지수",
  "^TNX": "미 10년물 금리",
  "^RUT": "러셀 2000",
  "CL=F": "WTI 원유",
  "GC=F": "금",
  "DX-Y.NYB": "달러 인덱스",
  NVDA: "엔비디아",
  AAPL: "애플",
  MSFT: "마이크로소프트",
  GOOGL: "알파벳(구글)",
  GOOG: "알파벳(구글)",
  AMZN: "아마존",
  META: "메타",
  TSLA: "테슬라",
  BKNG: "부킹 홀딩스",
  GS: "골드만삭스",
  SOUN: "사운드하운드 AI",
  UBER: "우버",
  RHHBY: "로슈",
  XLE: "에너지 섹터 ETF",
  XLK: "기술 섹터 ETF",
  XLF: "금융 섹터 ETF",
  QQQ: "나스닥 100 ETF",
  SPY: "S&P 500 ETF",
  IWM: "러셀 2000 ETF",
  AMD: "AMD",
  INTC: "인텔",
  AVGO: "브로드컴",
  TSM: "TSMC",
  NFLX: "넷플릭스",
  DIS: "디즈니",
  JPM: "JP모건",
  BAC: "뱅크오브아메리카",
  WMT: "월마트",
  COST: "코스트코",
  "SP:SPX": "S&P 500",
  "NASDAQ:IXIC": "나스닥 종합",
  "DJ:DJI": "다우존스",
  "TVC:VIX": "공포지수",
  "TVC:US10Y": "미 10년물 금리",
  "COMEX:GC1!": "금",
  "TVC:DXY": "달러 인덱스",
};

export function getTickerDisplayName(ticker: string): string {
  return TICKER_KR_NAMES[ticker] || "";
}

const TICKER_SHORT_LABELS: Record<string, string> = {
  "^GSPC": "GSPC",
  "^IXIC": "IXIC",
  "^DJI": "DJI",
  "^VIX": "VIX",
  "^TNX": "US10Y",
  "SP:SPX": "SPX",
  "NASDAQ:IXIC": "IXIC",
  "DJ:DJI": "DJI",
  "TVC:VIX": "VIX",
  "TVC:US10Y": "US10Y",
  "TVC:DXY": "DXY",
  "DX-Y.NYB": "DXY",
  "CL=F": "WTI",
  "BZ=F": "BZ",
  "GC=F": "GOLD",
  "COMEX:GC1!": "GOLD",
};

export function getTickerShortLabel(ticker: string): string {
  if (TICKER_SHORT_LABELS[ticker]) return TICKER_SHORT_LABELS[ticker];
  const base = ticker.includes(":") ? ticker.split(":").pop() || ticker : ticker;
  return base.replace(/^\^/, "").replace(/=F$/, "");
}

export function getTickerDisplayParts(ticker: string): {
  symbol: string;
  name: string;
} {
  const symbol = getTickerShortLabel(ticker);
  const name = getTickerDisplayName(ticker);
  return {
    symbol,
    name: name && name !== symbol ? name : "",
  };
}

export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
