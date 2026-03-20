import type { FC } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { MarketChartData } from "@/types/market-chart";
import { COLORS, seededRandom, getTickerDisplayName } from "./styles";

function generateChartPoints(
  ticker: string,
  count: number,
): { x: number; y: number }[] {
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed += ticker.charCodeAt(i) * (i + 1);
  }

  const points: { x: number; y: number }[] = [];
  let value = 50 + seededRandom(seed) * 40;

  for (let i = 0; i < count; i++) {
    const noise = (seededRandom(seed + i * 7.3) - 0.48) * 8;
    const trend = (seededRandom(seed * 2.1) - 0.45) * 0.6;
    value = Math.max(10, Math.min(95, value + noise + trend));
    points.push({ x: i / (count - 1), y: value });
  }
  return points;
}

function pointsToPath(
  pts: { x: number; y: number }[],
  w: number,
  h: number,
  padding: number,
): string {
  const plotW = w - padding * 2;
  const plotH = h - padding * 2;
  const yMin = Math.min(...pts.map((p) => p.y));
  const yMax = Math.max(...pts.map((p) => p.y));
  const yRange = yMax - yMin || 1;

  return pts
    .map((p, i) => {
      const sx = padding + p.x * plotW;
      const sy = padding + (1 - (p.y - yMin) / yRange) * plotH;
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");
}

function pointsToAreaPath(
  pts: { x: number; y: number }[],
  w: number,
  h: number,
  padding: number,
): string {
  const linePath = pointsToPath(pts, w, h, padding);
  const plotW = w - padding * 2;
  const lastX = padding + plotW;
  const firstX = padding;
  const bottom = h - padding;
  return `${linePath} L${lastX.toFixed(1)},${bottom} L${firstX.toFixed(1)},${bottom} Z`;
}

const VB_W = 800;
const VB_H = 360;

function realDataToPoints(data: MarketChartData): { x: number; y: number }[] {
  const pts = data.points;
  if (pts.length === 0) return [];
  return pts.map((p, i) => ({
    x: i / Math.max(1, pts.length - 1),
    y: p.c,
  }));
}

export const MiniChart: FC<{
  ticker: string;
  accentColor: string;
  delay?: number;
  chartData?: MarketChartData | null;
}> = ({ ticker, accentColor, delay = 0, chartData }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hasReal = chartData && chartData.points.length > 1;
  const points = hasReal
    ? realDataToPoints(chartData)
    : generateChartPoints(ticker, 50);
  const isUp = hasReal
    ? chartData.trend === "up"
    : points[points.length - 1].y >= points[0].y;
  const lineColor = isUp ? COLORS.positive : COLORS.negative;

  const pad = 16;
  const linePath = pointsToPath(points, VB_W, VB_H, pad);
  const areaPath = pointsToAreaPath(points, VB_W, VB_H, pad);

  const totalLen = VB_W * 2;
  const drawProgress = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 40 },
    delay,
  });
  const dashOffset = totalLen * (1 - drawProgress);

  const fadeIn = interpolate(
    spring({ frame, fps, config: { damping: 200 }, delay }),
    [0, 1],
    [0, 1],
  );

  const changePercent = hasReal
    ? chartData.changePercent
    : ((points[points.length - 1].y - points[0].y) / points[0].y) * 100;
  const displayTicker = ticker.replace("^", "").replace("=F", "");
  const krName = getTickerDisplayName(ticker);

  let rangeLabel = "1개월";
  if (hasReal && chartData.points.length >= 2) {
    const firstTs = chartData.points[0].t;
    const lastTs = chartData.points[chartData.points.length - 1].t;
    const diffDays = Math.round((lastTs - firstTs) / 86400);
    if (diffDays <= 7) rangeLabel = "1주";
    else if (diffDays <= 35) rangeLabel = "1개월";
    else if (diffDays <= 100) rangeLabel = "3개월";
    else if (diffDays <= 200) rangeLabel = "6개월";
    else rangeLabel = "1년";
  }

  const displayPrice = hasReal
    ? chartData.latest.toFixed(2)
    : (100 + seededRandom(ticker.charCodeAt(0) * 17.3) * 4900).toFixed(2);

  const yMin = Math.min(...points.map((p) => p.y));
  const yMax = Math.max(...points.map((p) => p.y));
  const yRange = yMax - yMin || 1;
  const lastPt = points[points.length - 1];
  const dotCx = pad + lastPt.x * (VB_W - pad * 2);
  const dotCy = pad + (1 - (lastPt.y - yMin) / yRange) * (VB_H - pad * 2);

  return (
    <div
      style={{
        width: "100%",
        opacity: fadeIn,
        transform: `translateY(${interpolate(fadeIn, [0, 1], [20, 0])}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 10,
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span
            style={{
              color: accentColor,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.05em",
              fontFamily: "'Space Grotesk', monospace",
            }}
          >
            {displayTicker}
          </span>
          {krName && (
            <span
              style={{
                color: COLORS.textSecondary,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {krName}
            </span>
          )}
          <span
            style={{
              color: COLORS.textMuted,
              fontSize: 12,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 4,
              backgroundColor: "rgba(255,255,255,0.06)",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {rangeLabel}
          </span>
          <span
            style={{
              color: COLORS.text,
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', monospace",
            }}
          >
            ${displayPrice}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 8,
            backgroundColor: isUp
              ? "rgba(16,185,129,0.15)"
              : "rgba(239,68,68,0.15)",
          }}
        >
          <span style={{ color: lineColor, fontSize: 14 }}>
            {isUp ? "▲" : "▼"}
          </span>
          <span
            style={{
              color: lineColor,
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', monospace",
            }}
          >
            {isUp ? "+" : ""}
            {changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div
        style={{
          background: `linear-gradient(180deg, ${COLORS.bgCard} 0%, ${COLORS.bgPanel} 100%)`,
          border: `1px solid ${COLORS.bgCardBorder}`,
          borderRadius: 14,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          style={{ display: "block", width: "100%", height: "auto" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id={`area-${ticker}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient
              id={`line-${ticker}`}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.6} />
              <stop offset="60%" stopColor={lineColor} stopOpacity={1} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={1} />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={pad}
              y1={pad + (VB_H - pad * 2) * ratio}
              x2={VB_W - pad}
              y2={pad + (VB_H - pad * 2) * ratio}
              stroke={COLORS.border}
              strokeWidth={0.5}
              strokeDasharray="4,4"
              opacity={0.4}
            />
          ))}

          <path
            d={areaPath}
            fill={`url(#area-${ticker})`}
            opacity={drawProgress * 0.8}
          />

          <path
            d={linePath}
            fill="none"
            stroke={`url(#line-${ticker})`}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={totalLen}
            strokeDashoffset={dashOffset}
          />

          {drawProgress > 0.9 && (
            <>
              <circle
                cx={dotCx}
                cy={dotCy}
                r={5}
                fill={lineColor}
                opacity={interpolate(
                  Math.sin(frame * 0.1),
                  [-1, 1],
                  [0.6, 1],
                )}
              />
              <circle
                cx={dotCx}
                cy={dotCy}
                r={10}
                fill="none"
                stroke={lineColor}
                strokeWidth={1.5}
                opacity={interpolate(
                  Math.sin(frame * 0.1),
                  [-1, 1],
                  [0.2, 0.5],
                )}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export const SparkLine: FC<{
  ticker: string;
  width?: number;
  height?: number;
  color: string;
}> = ({ ticker, width = 80, height = 28, color }) => {
  const points = generateChartPoints(ticker, 20);
  const isUp = points[points.length - 1].y >= points[0].y;
  const lineColor = isUp ? COLORS.positive : COLORS.negative;
  const path = pointsToPath(points, width, height, 2);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
