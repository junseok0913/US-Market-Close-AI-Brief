import type { FC } from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { MarketChartData } from "@/types/market-chart";
import { normalizeMarketChartSymbol } from "@/lib/market-chart";
import { COLORS, seededRandom, getTickerDisplayName } from "./styles";
import { SparkLine } from "./MiniChart";

export type ChartDataMap = Record<string, MarketChartData>;

const INDICES = [
  { ticker: "^GSPC", label: "S&P 500" },
  { ticker: "^DJI", label: "DOW" },
  { ticker: "^IXIC", label: "NASDAQ" },
  { ticker: "^VIX", label: "VIX" },
  { ticker: "CL=F", label: "WTI" },
  { ticker: "GC=F", label: "GOLD" },
  { ticker: "^TNX", label: "US10Y" },
];

function lookupChart(
  chartDataMap: ChartDataMap | undefined,
  ticker: string,
): MarketChartData | null {
  if (!chartDataMap) return null;
  const key = normalizeMarketChartSymbol(ticker);
  return chartDataMap[key] || chartDataMap[ticker] || null;
}

function tickerChange(
  ticker: string,
  chartDataMap?: ChartDataMap,
): { value: number; change: number } {
  const real = lookupChart(chartDataMap, ticker);
  if (real) {
    return { value: real.latest, change: real.changePercent };
  }
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed += ticker.charCodeAt(i) * (i + 1);
  }
  const base = 100 + seededRandom(seed * 3.7) * 4900;
  const change = (seededRandom(seed * 11.3) - 0.45) * 4;
  return { value: base, change };
}

export const MarketTicker: FC<{
  tickers?: string[];
  chapterColor: string;
  chartDataMap?: ChartDataMap;
}> = ({ tickers, chapterColor, chartDataMap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    delay: 5,
  });
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);
  const translateY = interpolate(slideIn, [0, 1], [-20, 0]);

  const scrollOffset = frame * 0.5;

  const items = INDICES;
  const doubledItems = [...items, ...items];

  return (
    <div
      style={{
        position: "absolute",
        top: 72,
        left: 0,
        right: 0,
        height: 44,
        overflow: "hidden",
        opacity,
        transform: `translateY(${translateY}px)`,
        zIndex: 9,
        borderBottom: `1px solid ${COLORS.border}40`,
        background:
          "linear-gradient(180deg, rgba(8,12,24,0.7) 0%, rgba(8,12,24,0.4) 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          height: "100%",
          transform: `translateX(-${scrollOffset % (items.length * 200)}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {doubledItems.map((item, idx) => {
          const { value, change } = tickerChange(item.ticker, chartDataMap);
          const isUp = change >= 0;
          const color = isUp ? COLORS.positive : COLORS.negative;

          return (
            <div
              key={`${item.ticker}-${idx}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 24px",
                height: "100%",
                borderRight: `1px solid ${COLORS.border}30`,
                minWidth: 200,
              }}
            >
              <span
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {item.label}
              </span>

              <SparkLine
                ticker={item.ticker}
                width={56}
                height={20}
                color={color}
              />

              <span
                style={{
                  color,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', monospace",
                }}
              >
                {isUp ? "+" : ""}
                {change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const KeyMetricCard: FC<{
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  accentColor: string;
  delay?: number;
}> = ({ label, value, subtext, trend = "neutral", accentColor, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120 },
    delay,
  });

  const opacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const scale = interpolate(cardSpring, [0, 1], [0.9, 1]);

  const trendColor =
    trend === "up"
      ? COLORS.positive
      : trend === "down"
        ? COLORS.negative
        : COLORS.textSecondary;

  return (
    <div
      style={{
        padding: "14px 18px",
        background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bgPanel} 100%)`,
        border: `1px solid ${COLORS.bgCardBorder}`,
        borderRadius: 10,
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 140,
      }}
    >
      <span
        style={{
          color: COLORS.textMuted,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{
            color: COLORS.text,
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "'Space Grotesk', monospace",
          }}
        >
          {value}
        </span>
        {subtext && (
          <span
            style={{
              color: trendColor,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', monospace",
            }}
          >
            {trend === "up" ? "▲" : trend === "down" ? "▼" : ""} {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export const TickerCard: FC<{
  ticker: string;
  accentColor: string;
  delay?: number;
  size?: "normal" | "compact";
  chartDataMap?: ChartDataMap;
}> = ({ ticker, accentColor, delay = 0, size = "normal", chartDataMap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 130 },
    delay,
  });

  const opacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const translateX = interpolate(cardSpring, [0, 1], [30, 0]);

  const displayTicker = ticker.replace("^", "").replace("=F", "");
  const krName = getTickerDisplayName(ticker);
  const { value, change } = tickerChange(ticker, chartDataMap);
  const isUp = change >= 0;
  const color = isUp ? COLORS.positive : COLORS.negative;

  const compact = size === "compact";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 10 : 14,
        padding: compact ? "10px 14px" : "14px 20px",
        background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bgPanel} 100%)`,
        border: `1px solid ${COLORS.bgCardBorder}`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 10,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: compact ? 70 : 90,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              color: accentColor,
              fontSize: compact ? 13 : 16,
              fontWeight: 800,
              letterSpacing: "0.04em",
              fontFamily: "'Space Grotesk', monospace",
            }}
          >
            {displayTicker}
          </span>
          {krName && (
            <span
              style={{
                color: COLORS.textMuted,
                fontSize: compact ? 10 : 12,
                fontWeight: 500,
              }}
            >
              {krName}
            </span>
          )}
        </div>
        <span
          style={{
            color: COLORS.text,
            fontSize: compact ? 16 : 20,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', monospace",
          }}
        >
          ${value.toFixed(2)}
        </span>
      </div>

      <SparkLine ticker={ticker} width={compact ? 50 : 70} height={compact ? 22 : 28} color={color} />

      <div
        style={{
          padding: "3px 8px",
          borderRadius: 5,
          backgroundColor: isUp
            ? "rgba(16,185,129,0.12)"
            : "rgba(239,68,68,0.12)",
        }}
      >
        <span
          style={{
            color,
            fontSize: compact ? 12 : 14,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', monospace",
          }}
        >
          {isUp ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export const NumberExtractor: FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const patterns = [
    /(\d+[\d,.]*%)/g,
    /(\d+[\d,.]*퍼센트)/g,
    /(\$[\d,.]+)/g,
    /([\d,.]+달러)/g,
    /([\d,.]+조\s?달러)/g,
    /([\d,.]+억\s?달러)/g,
    /([\d,.]+선)/g,
    /배럴당\s*([\d,.]+달러)/g,
  ];

  const numbers: string[] = [];
  for (const p of patterns) {
    const regex = new RegExp(p.source, p.flags);
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const val = m[1] || m[0];
      if (!numbers.includes(val)) numbers.push(val);
    }
  }

  if (numbers.length === 0) return null;

  const displayed = numbers.slice(0, 3);

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {displayed.map((num, i) => {
        const s = spring({
          frame,
          fps,
          config: { damping: 18, stiffness: 140 },
          delay: 8 + i * 4,
        });
        const o = interpolate(s, [0, 1], [0, 1]);
        const scale = interpolate(s, [0, 1], [0.8, 1]);

        return (
          <div
            key={`${num}-${i}`}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
              border: `1px solid ${accentColor}30`,
              opacity: o,
              transform: `scale(${scale})`,
            }}
          >
            <span
              style={{
                color: accentColor,
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "'Space Grotesk', monospace",
              }}
            >
              {num}
            </span>
          </div>
        );
      })}
    </div>
  );
};
