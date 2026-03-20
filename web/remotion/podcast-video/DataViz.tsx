import type { FC } from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { MarketChartData } from "@/types/market-chart";
import { normalizeMarketChartSymbol } from "@/lib/market-chart";
import { COLORS, getTickerDisplayName } from "./styles";

export type ChartDataMap = Record<string, MarketChartData>;

type EventSource = {
  id?: string;
  title?: string;
  date?: string;
};

function lookupChart(
  chartDataMap: ChartDataMap | undefined,
  ticker: string,
): MarketChartData | null {
  if (!chartDataMap) return null;
  const key = normalizeMarketChartSymbol(ticker);
  return chartDataMap[key] || chartDataMap[ticker] || null;
}

/* ─── Comparison Bar Chart ─── */

export const ComparisonBarChart: FC<{
  tickers: string[];
  chartDataMap: ChartDataMap;
  accentColor: string;
  delay?: number;
}> = ({ tickers, chartDataMap, accentColor, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bars = tickers
    .map((ticker) => {
      const data = lookupChart(chartDataMap, ticker);
      if (!data) return null;
      const displayTicker = ticker.replace("^", "").replace("=F", "");
      const krName = getTickerDisplayName(ticker);
      return {
        ticker: displayTicker,
        label: krName || displayTicker,
        change: data.changePercent,
      };
    })
    .filter(Boolean) as Array<{
    ticker: string;
    label: string;
    change: number;
  }>;

  if (bars.length < 2) return null;

  const sorted = [...bars].sort((a, b) => b.change - a.change);
  const maxAbs = Math.max(...sorted.map((b) => Math.abs(b.change)), 0.01);

  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay,
  });

  return (
    <div
      style={{
        opacity: interpolate(fadeIn, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(fadeIn, [0, 1], [15, 0])}px)`,
        padding: "20px 24px",
        background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bgPanel} 100%)`,
        border: `1px solid ${COLORS.bgCardBorder}`,
        borderRadius: 14,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: COLORS.textMuted,
          letterSpacing: "0.1em",
          marginBottom: 16,
          textTransform: "uppercase",
        }}
      >
        등락률 비교
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map((bar, i) => {
          const barSpring = spring({
            frame,
            fps,
            config: { damping: 30, stiffness: 80 },
            delay: delay + 6 + i * 4,
          });
          const barWidth = interpolate(
            barSpring,
            [0, 1],
            [0, (Math.abs(bar.change) / maxAbs) * 100],
          );

          const isUp = bar.change >= 0;
          const barColor = isUp ? COLORS.positive : COLORS.negative;

          return (
            <div key={bar.ticker} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 110,
                  fontSize: 14,
                  fontWeight: 700,
                  color: COLORS.textSecondary,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {bar.label}
              </div>

              <div
                style={{
                  flex: 1,
                  height: 26,
                  borderRadius: 6,
                  backgroundColor: `${barColor}10`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${barWidth}%`,
                    borderRadius: 6,
                    background: `linear-gradient(90deg, ${barColor}40, ${barColor}90)`,
                  }}
                />
              </div>

              <span
                style={{
                  width: 72,
                  fontSize: 15,
                  fontWeight: 700,
                  color: barColor,
                  fontFamily: "'Space Grotesk', monospace",
                  textAlign: "right",
                }}
              >
                {isUp ? "+" : ""}
                {bar.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Event Calendar (Economic Events Timeline) ─── */

const EVENT_TITLE_KR: Record<string, string> = {
  "non farm payrolls": "비농업 고용",
  "unemployment rate": "실업률",
  "fed interest rate decision": "FOMC 금리 결정",
  "fomc rate decision": "FOMC 금리 결정",
  "us fomc rate decision": "FOMC 금리 결정",
  "fomc economic projections": "FOMC 경제 전망",
  "fomc press conference": "FOMC 기자회견",
  "core inflation rate yoy": "핵심 인플레이션(YoY)",
  "inflation rate yoy": "인플레이션(YoY)",
  "cpi mom": "소비자물가(MoM)",
  "core cpi mom": "핵심 CPI(MoM)",
  "ppi mom": "생산자물가(MoM)",
  "core pce price index mom": "핵심 PCE(MoM)",
  "pce price index mom": "PCE 물가(MoM)",
  "ism manufacturing pmi": "ISM 제조업 PMI",
  "ism services pmi": "ISM 서비스 PMI",
  "s&p global us manufacturing pmi": "제조업 PMI(속보)",
  "s&p global us services pmi": "서비스 PMI(속보)",
  "gdp growth rate qoq adv": "GDP 성장률(QoQ)",
  "gdp growth rate qoq": "GDP 성장률(QoQ)",
  "house price index": "주택가격지수",
  "us housing starts": "주택착공건수",
  "us housing starts (mom)": "주택착공건수(MoM)",
  "existing home sales": "기존주택매매",
  "new home sales": "신규주택매매",
  "cb consumer confidence": "소비자신뢰지수",
  "michigan consumer sentiment": "미시간 소비자심리",
  "us michigan consumer sentiment": "미시간 소비자심리",
  "core ppi mom": "핵심 PPI(MoM)",
  "initial jobless claims": "신규 실업수당 청구",
  "retail sales mom": "소매판매(MoM)",
  "industrial production mom": "산업생산(MoM)",
  "durable goods orders": "내구재 주문",
  "building permits": "건축허가",
};

function shortEventTitle(title: string): string {
  const lower = title.toLowerCase().replace(/\s*\(.*?\)\s*-\s*prel$/i, "").trim();
  if (EVENT_TITLE_KR[lower]) return EVENT_TITLE_KR[lower];
  const key = Object.keys(EVENT_TITLE_KR).find(
    (k) => lower.includes(k) || k.includes(lower),
  );
  if (key) return EVENT_TITLE_KR[key];
  return title.length > 20 ? title.slice(0, 18) + "…" : title;
}

function formatEventDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length >= 3) {
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
  }
  return dateStr;
}

const WEEKDAY_KR = ["일", "월", "화", "수", "목", "금", "토"];

export const EventCalendar: FC<{
  events: EventSource[];
  accentColor: string;
  delay?: number;
}> = ({ events, accentColor, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const validEvents = events
    .filter((e) => e.title && e.date)
    .map((e) => ({
      title: shortEventTitle(e.title!),
      date: e.date!,
      formatted: formatEventDate(e.date!),
      weekday: WEEKDAY_KR[new Date(e.date!).getDay()] || "",
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const unique = validEvents.filter(
    (e, i, arr) => arr.findIndex((x) => x.date === e.date && x.title === e.title) === i,
  );

  if (unique.length === 0) return null;

  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay,
  });

  const displayed = unique.slice(0, 5);

  return (
    <div
      style={{
        opacity: interpolate(fadeIn, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(fadeIn, [0, 1], [15, 0])}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {displayed.map((evt, i) => {
        const cardSpring = spring({
          frame,
          fps,
          config: { damping: 18, stiffness: 120 },
          delay: delay + 4 + i * 5,
        });
        const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
        const cardTranslateY = interpolate(cardSpring, [0, 1], [16, 0]);

        return (
          <div
            key={`${evt.date}-${evt.title}-${i}`}
            style={{
              opacity: cardOpacity,
              transform: `translateY(${cardTranslateY}px)`,
              padding: "18px 22px",
              background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bgPanel} 100%)`,
              border: `1px solid ${COLORS.bgCardBorder}`,
              borderLeft: `4px solid ${i === 0 ? accentColor : `${accentColor}60`}`,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 48,
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: i === 0 ? accentColor : COLORS.text,
                    fontFamily: "'Space Grotesk', monospace",
                    lineHeight: 1.1,
                  }}
                >
                  {evt.formatted}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.textMuted,
                  }}
                >
                  {evt.weekday}
                </span>
              </div>
            </div>

            <div
              style={{
                width: 1,
                height: 32,
                backgroundColor: `${COLORS.border}`,
                flexShrink: 0,
              }}
            />

            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: i === 0 ? COLORS.text : COLORS.textSecondary,
              }}
            >
              {evt.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── VIX Gauge Meter ─── */

export const GaugeMeter: FC<{
  chartDataMap: ChartDataMap;
  delay?: number;
}> = ({ chartDataMap, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const vixData =
    lookupChart(chartDataMap, "^VIX") ||
    lookupChart(chartDataMap, "TVC:VIX");

  if (!vixData) return null;

  const vixValue = vixData.latest;
  const vixChange = vixData.changePercent;
  const maxVix = 50;
  const clampedValue = Math.min(Math.max(vixValue, 0), maxVix);
  const ratio = clampedValue / maxVix;

  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay,
  });

  const needleSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60 },
    delay: delay + 8,
  });

  const needleAngle = interpolate(needleSpring, [0, 1], [-90, -90 + ratio * 180]);

  const cx = 120;
  const cy = 110;
  const r = 90;
  const strokeW = 14;

  const zones = [
    { start: 0, end: 0.3, color: COLORS.positive, label: "안정" },
    { start: 0.3, end: 0.5, color: "#eab308", label: "주의" },
    { start: 0.5, end: 0.7, color: "#f97316", label: "경계" },
    { start: 0.7, end: 1.0, color: COLORS.negative, label: "공포" },
  ];

  const currentZone = zones.find(
    (z) => ratio >= z.start && ratio < z.end,
  ) || zones[zones.length - 1];

  function arcPath(
    startFrac: number,
    endFrac: number,
    radius: number,
  ): string {
    const startAngle = Math.PI + startFrac * Math.PI;
    const endAngle = Math.PI + endFrac * Math.PI;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = endFrac - startFrac > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  return (
    <div
      style={{
        opacity: interpolate(fadeIn, [0, 1], [0, 1]),
        padding: "20px 24px",
        background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bgPanel} 100%)`,
        border: `1px solid ${COLORS.bgCardBorder}`,
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: COLORS.textMuted,
          letterSpacing: "0.1em",
          marginBottom: 10,
          textTransform: "uppercase",
          alignSelf: "flex-start",
        }}
      >
        시장 변동성 (VIX)
      </div>

      <svg width={240} height={140} viewBox={`0 0 240 140`}>
        {zones.map((zone) => (
          <path
            key={zone.label}
            d={arcPath(zone.start, zone.end, r)}
            fill="none"
            stroke={`${zone.color}30`}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        ))}

        <path
          d={arcPath(0, ratio * needleSpring, r)}
          fill="none"
          stroke={currentZone.color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          opacity={0.9}
        />

        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r + strokeW + 8}
          stroke={COLORS.text}
          strokeWidth={2.5}
          strokeLinecap="round"
          transform={`rotate(${needleAngle}, ${cx}, ${cy})`}
        />
        <circle cx={cx} cy={cy} r={5} fill={COLORS.text} />

        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          fill={currentZone.color}
          fontSize={28}
          fontWeight={800}
          fontFamily="'Space Grotesk', monospace"
        >
          {vixValue.toFixed(1)}
        </text>

        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          fill={currentZone.color}
          fontSize={12}
          fontWeight={700}
        >
          {currentZone.label}
        </text>

        <text x={cx - r + 4} y={cy + 16} fill={COLORS.textMuted} fontSize={9} fontWeight={600}>
          0
        </text>
        <text
          x={cx + r - 12}
          y={cy + 16}
          fill={COLORS.textMuted}
          fontSize={9}
          fontWeight={600}
        >
          {maxVix}
        </text>
      </svg>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 4,
        }}
      >
        <span
          style={{
            color: vixChange >= 0 ? COLORS.negative : COLORS.positive,
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', monospace",
          }}
        >
          {vixChange >= 0 ? "▲" : "▼"}{" "}
          {vixChange >= 0 ? "+" : ""}
          {vixChange.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

/* ─── News Headline Cards ─── */

type ArticleSource = {
  type?: string;
  title?: string;
  pk?: string;
};

export const NewsHeadlineCards: FC<{
  sources: ArticleSource[];
  accentColor: string;
  delay?: number;
  max?: number;
}> = ({ sources, accentColor, delay = 0, max = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const articles = sources
    .filter((s) => s.type === "article" && s.title)
    .slice(0, max);

  if (articles.length === 0) return null;

  const fadeIn = spring({ frame, fps, config: { damping: 200 }, delay });

  return (
    <div
      style={{
        opacity: interpolate(fadeIn, [0, 1], [0, 1]),
        display: "flex",
        flexDirection: "column",
        gap: 9,
        marginTop: 12,
      }}
    >
      {articles.map((art, i) => {
        const cardSpring = spring({
          frame,
          fps,
          config: { damping: 18, stiffness: 120 },
          delay: delay + i * 6,
        });
        const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
        const cardX = interpolate(cardSpring, [0, 1], [18, 0]);

        const title = art.title || "";
        const truncated = title.length > 110 ? title.slice(0, 108) + "…" : title;

        return (
          <div
            key={art.pk || i}
            style={{
              opacity: cardOpacity,
              transform: `translateX(${cardX}px)`,
              padding: "11px 14px 12px",
              background: `linear-gradient(135deg, ${COLORS.bgCard}e0 0%, ${COLORS.bgPanel}e0 100%)`,
              border: `1px solid ${COLORS.bgCardBorder}`,
              borderLeft: `3px solid ${accentColor}80`,
              borderRadius: 9,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {/* 출처 뱃지 */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: accentColor,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: accentColor,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  backgroundColor: `${accentColor}18`,
                  padding: "2px 7px",
                  borderRadius: 4,
                  border: `1px solid ${accentColor}35`,
                }}
              >
                NEWS
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 600,
                  color: COLORS.textMuted,
                  fontFamily: "'Space Grotesk', monospace",
                }}
              >
                #{i + 1}
              </span>
            </div>

            {/* 헤드라인 */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: COLORS.textSecondary,
                lineHeight: 1.55,
              }}
            >
              {truncated}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── SEC Filing Cards ─── */

type SecFilingSource = {
  type?: string;
  ticker?: string;
  form?: string;
  filed_date?: string;
  accession_number?: string;
};

function formatFiledDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length >= 3)
    return `${parts[0]}.${parseInt(parts[1])}.${parseInt(parts[2])}`;
  return dateStr;
}

export const SecFilingCards: FC<{
  sources: SecFilingSource[];
  accentColor: string;
  delay?: number;
  max?: number;
}> = ({ sources, accentColor, delay = 0, max = 2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const filings = sources
    .filter((s) => s.type === "sec_filing" && s.ticker)
    .reduce<SecFilingSource[]>((acc, s) => {
      if (!acc.some((x) => x.accession_number === s.accession_number))
        acc.push(s);
      return acc;
    }, [])
    .slice(0, max);

  if (filings.length === 0) return null;

  const fadeIn = spring({ frame, fps, config: { damping: 200 }, delay });
  const filingColor = "#8b5cf6";

  return (
    <div
      style={{
        opacity: interpolate(fadeIn, [0, 1], [0, 1]),
        display: "flex",
        flexDirection: "column",
        gap: 9,
        marginTop: 10,
      }}
    >
      {filings.map((filing, i) => {
        const cardSpring = spring({
          frame,
          fps,
          config: { damping: 18, stiffness: 120 },
          delay: delay + i * 6,
        });
        const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
        const cardX = interpolate(cardSpring, [0, 1], [18, 0]);

        return (
          <div
            key={filing.accession_number || i}
            style={{
              opacity: cardOpacity,
              transform: `translateX(${cardX}px)`,
              padding: "11px 14px 12px",
              background: `linear-gradient(135deg, ${COLORS.bgCard}e0 0%, ${COLORS.bgPanel}e0 100%)`,
              border: `1px solid ${filingColor}25`,
              borderLeft: `3px solid ${filingColor}80`,
              borderRadius: 9,
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {/* 출처 뱃지 행 */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: filingColor,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: filingColor,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  backgroundColor: `${filingColor}18`,
                  padding: "2px 7px",
                  borderRadius: 4,
                  border: `1px solid ${filingColor}35`,
                }}
              >
                SEC 공시
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: accentColor,
                  backgroundColor: `${accentColor}15`,
                  padding: "2px 7px",
                  borderRadius: 4,
                  border: `1px solid ${accentColor}30`,
                  letterSpacing: "0.04em",
                  fontFamily: "'Space Grotesk', monospace",
                }}
              >
                {filing.form || "Filing"}
              </span>
            </div>

            {/* 티커 + 제출일 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: COLORS.text,
                  fontFamily: "'Space Grotesk', monospace",
                  letterSpacing: "0.02em",
                }}
              >
                {filing.ticker}
              </span>
              {filing.filed_date && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: COLORS.textMuted,
                  }}
                >
                  제출 {formatFiledDate(filing.filed_date)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Sector Heatmap ─── */

const TICKER_GROUP_MAP: Record<string, string> = {
  "SP:SPX": "지수",
  "NASDAQ:IXIC": "지수",
  "DJ:DJI": "지수",
  "^GSPC": "지수",
  "^IXIC": "지수",
  "^DJI": "지수",
  "TVC:VIX": "매크로",
  "^VIX": "매크로",
  "TVC:US10Y": "매크로",
  "^TNX": "매크로",
  "TVC:DXY": "매크로",
  "DX-Y.NYB": "매크로",
  "CL=F": "원자재",
  "BZ=F": "원자재",
  "GC=F": "원자재",
  "COMEX:GC1!": "원자재",
  "AMEX:GLD": "원자재",
  "GLD": "원자재",
};

const GROUP_ORDER = ["지수", "원자재", "매크로", "종목/ETF"];

const GROUP_COLORS: Record<string, string> = {
  "지수": "#3b82f6",
  "원자재": "#f59e0b",
  "매크로": "#8b5cf6",
  "종목/ETF": "#06b6d4",
};

export const SectorHeatmap: FC<{
  chartDataMap: ChartDataMap;
  delay?: number;
}> = ({ chartDataMap, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entries = Object.entries(chartDataMap)
    .map(([key, data]) => ({
      key,
      krName: getTickerDisplayName(key) || key.replace(/^\^/, "").replace(/=F$/, ""),
      change: data.changePercent,
      group: TICKER_GROUP_MAP[key] || "종목/ETF",
    }))
    .sort((a, b) => b.change - a.change);

  if (entries.length < 3) return null;

  const groups: Record<string, typeof entries> = {};
  for (const e of entries) {
    if (!groups[e.group]) groups[e.group] = [];
    groups[e.group].push(e);
  }

  const orderedGroups = GROUP_ORDER.filter((g) => groups[g]).map((g) => ({
    name: g,
    items: groups[g],
  }));

  const fadeIn = spring({ frame, fps, config: { damping: 200 }, delay });
  const rawMax = Math.max(...entries.map((e) => Math.abs(e.change)), 0.01);
  /** 바 길이 계산용 상한선 (WTI +51% 같은 극단값이 전체를 차지하지 않도록) */
  const maxAbsChange = Math.min(rawMax, 12);

  let rowIdx = 0;

  return (
    <div
      style={{
        opacity: interpolate(fadeIn, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(fadeIn, [0, 1], [14, 0])}px)`,
        padding: "18px 22px 16px",
        background: `linear-gradient(145deg, ${COLORS.bgCard} 0%, ${COLORS.bgPanel} 100%)`,
        border: `1px solid ${COLORS.bgCardBorder}`,
        borderRadius: 14,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 3,
            height: 16,
            borderRadius: 2,
            backgroundColor: COLORS.primary,
          }}
        />
        <span
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: COLORS.text,
            letterSpacing: "0.06em",
          }}
        >
          시장 현황
        </span>
      </div>

      {/* 그룹 리스트 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orderedGroups.map(({ name, items }) => {
          const groupColor = GROUP_COLORS[name] || "#94a3b8";

          return (
            <div key={name}>
              {/* 그룹 라벨 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    backgroundColor: groupColor,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: `${groupColor}dd`,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {name}
                </span>
              </div>

              {/* 각 종목 행 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {items.map((item) => {
                  const idx = rowIdx++;
                  const rowSpring = spring({
                    frame,
                    fps,
                    config: { damping: 24, stiffness: 130 },
                    delay: delay + 5 + idx * 2,
                  });
                  const rowOpacity = interpolate(rowSpring, [0, 1], [0, 1]);
                  const rowX = interpolate(rowSpring, [0, 1], [12, 0]);
                  const isUp = item.change >= 0;
                  const color = isUp ? COLORS.positive : COLORS.negative;
                  const absChange = Math.abs(item.change);
                  const isCapped = absChange > maxAbsChange;
                  const barPct = Math.min(100, (absChange / maxAbsChange) * 100);
                  const animBarPct = interpolate(rowSpring, [0, 1], [0, barPct]);

                  return (
                    <div
                      key={item.key}
                      style={{
                        opacity: rowOpacity,
                        transform: `translateX(${rowX}px)`,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        borderRadius: 8,
                        backgroundColor: `${color}08`,
                        border: `1px solid ${color}18`,
                      }}
                    >
                      {/* 종목명 */}
                      <span
                        style={{
                          width: 110,
                          fontSize: 15,
                          fontWeight: 800,
                          color: COLORS.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flexShrink: 0,
                        }}
                      >
                        {item.krName}
                      </span>

                      {/* 수평 바 */}
                      <div
                        style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: `${color}12`,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${animBarPct}%`,
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${color}50, ${color}bb)`,
                          }}
                        />
                        {isCapped && (
                          <div
                            style={{
                              position: "absolute",
                              right: 2,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 10,
                              height: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              pointerEvents: "none",
                            }}
                          >
                            {/* 바 차트 절단(scale break) 기호 - 짤림 표시 */}
                            <svg
                              width="8"
                              height="6"
                              viewBox="0 0 8 6"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0 4 L2 2 L4 4 L6 2 L8 4"
                                stroke={color}
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* 등락률 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          flexShrink: 0,
                          minWidth: 80,
                          justifyContent: "flex-end",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color,
                            fontWeight: 800,
                          }}
                        >
                          {isUp ? "▲" : "▼"}
                        </span>
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 900,
                            color,
                            fontFamily: "'Space Grotesk', monospace",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {absChange.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
