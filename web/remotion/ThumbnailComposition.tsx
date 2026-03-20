import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import { normalizeMarketChartSymbol } from "@/lib/market-chart";
import type { PodcastEpisodeData, ChartDataMap } from "./PodcastVideoComposition";

function lookupChart(chartDataMap: ChartDataMap, ticker: string) {
  const key = normalizeMarketChartSymbol(ticker);
  return chartDataMap[key] || chartDataMap[ticker] || null;
}

function formatDate(dateStr: string): string {
  const year = dateStr.slice(0, 4);
  const month = parseInt(dateStr.slice(4, 6));
  const day = parseInt(dateStr.slice(6, 8));
  return `${year}. ${month}. ${day}.`;
}

function splitNutshell(text: string): [string, string] {
  const breakPoints = [" 속 ", " 및 ", " 그리고 ", " vs ", "와 ", "과 "];
  for (const bp of breakPoints) {
    const idx = text.indexOf(bp);
    if (idx > 4 && idx < text.length - 4) {
      return [
        text.slice(0, idx + bp.trimEnd().length).trim(),
        text.slice(idx + bp.trimEnd().length).trim(),
      ];
    }
  }
  const mid = Math.round([...text].length / 2);
  let best = mid;
  for (let i = 0; i < 8; i++) {
    if (text[mid - i] === " ") { best = mid - i; break; }
    if (text[mid + i] === " ") { best = mid + i; break; }
  }
  return [text.slice(0, best).trim(), text.slice(best).trim()];
}

export type ThumbnailProps = {
  episode: PodcastEpisodeData;
  chartDataMap?: ChartDataMap;
};

export const ThumbnailComposition: FC<ThumbnailProps> = ({
  episode,
  chartDataMap = {},
}) => {
  const spxData =
    lookupChart(chartDataMap, "SP:SPX") || lookupChart(chartDataMap, "^GSPC");
  const marketUp = spxData ? spxData.changePercent >= 0 : false;
  const spxChange = spxData?.changePercent ?? null;

  // Color theme
  const accent = marketUp ? "#22c55e" : "#ef4444";
  const accentGlow = marketUp ? "#16a34a" : "#dc2626";
  const accentLight = marketUp ? "#86efac" : "#fca5a5";
  const accentDim = marketUp ? "#14532d" : "#7f1d1d";

  const [line1, line2] = splitNutshell(episode.nutshell);
  const dateStr = formatDate(episode.date);

  const ff = "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
  const ffMono = "'Space Grotesk', 'SF Mono', monospace";

  // Mega watermark text (S&P change %)
  const watermarkText = spxChange !== null
    ? `${spxChange >= 0 ? "+" : ""}${spxChange.toFixed(2)}%`
    : "";

  return (
    <AbsoluteFill style={{ backgroundColor: "#04070f", fontFamily: ff, overflow: "hidden" }}>

      {/* ── Layer 1: Background glow orbs ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 90% 70% at 100% 0%, ${accentGlow}22 0%, transparent 50%),
          radial-gradient(ellipse 70% 60% at 0% 100%, #1e40af18 0%, transparent 50%),
          radial-gradient(ellipse 50% 40% at 50% 50%, ${accentGlow}08 0%, transparent 60%)
        `,
      }} />

      {/* ── Layer 2: Diagonal lines (abstract) ── */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line
            key={i}
            x1={1300 + i * 90}
            y1={-50}
            x2={800 + i * 90}
            y2={1130}
            stroke={accent}
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* ── Layer 3: Mega watermark S&P change ── */}
      {watermarkText && (
        <div style={{
          position: "absolute",
          right: -60,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 360,
          fontWeight: 900,
          color: accent,
          opacity: 0.055,
          fontFamily: ffMono,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          userSelect: "none",
          whiteSpace: "nowrap",
        }}>
          {watermarkText}
        </div>
      )}

      {/* ── Layer 4: Right glow panel ── */}
      <div style={{
        position: "absolute",
        right: 0, top: 0, bottom: 0,
        width: 520,
        background: `linear-gradient(180deg, ${accentGlow}10 0%, transparent 40%, ${accentGlow}08 100%)`,
        borderLeft: `1px solid ${accent}14`,
      }} />

      {/* ── Top bar gradient ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 5,
        background: `linear-gradient(90deg, transparent 0%, ${accent} 30%, ${accentLight} 60%, transparent 100%)`,
      }} />

      {/* ── Bottom bar gradient ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${accent}60 0%, transparent 60%)`,
      }} />

      {/* ── Main content ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        padding: "60px 110px 64px 100px",
      }}>

        {/* Top row: Brand + Date */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "auto",
        }}>
          {/* Brand badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              backgroundColor: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}>
              📈
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <span style={{
                fontSize: 20,
                fontWeight: 800,
                color: "rgba(255,255,255,0.90)",
                letterSpacing: "0.03em",
              }}>
                미국 주식 브리핑
              </span>
              <span style={{
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                US Market Close AI Brief
              </span>
            </div>
          </div>

          {/* Date chip */}
          <div style={{
            padding: "8px 20px",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 40,
          }}>
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: "rgba(255,255,255,0.50)",
              fontFamily: ffMono,
              letterSpacing: "0.08em",
            }}>
              {dateStr}
            </span>
          </div>
        </div>

        {/* ── Center: Nutshell Title ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 0,
          marginTop: 40,
          marginBottom: 40,
        }}>
          {/* Accent marker */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
          }}>
            <div style={{
              width: 50, height: 6,
              borderRadius: 3,
              backgroundColor: accent,
              boxShadow: `0 0 18px ${accent}`,
            }} />
            <div style={{
              width: 20, height: 6,
              borderRadius: 3,
              backgroundColor: `${accent}50`,
            }} />
            <div style={{
              width: 8, height: 6,
              borderRadius: 3,
              backgroundColor: `${accent}28`,
            }} />
          </div>

          {/* Line 1 – white */}
          <div style={{
            fontSize: 108,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.10,
            letterSpacing: "-0.03em",
            textShadow: "0 4px 40px rgba(0,0,0,0.6)",
          }}>
            {line1}
          </div>

          {/* Line 2 – accent color */}
          {line2 && (
            <div style={{
              fontSize: 108,
              fontWeight: 900,
              color: accentLight,
              lineHeight: 1.10,
              letterSpacing: "-0.03em",
              textShadow: `0 4px 60px ${accentGlow}60`,
            }}>
              {line2}
            </div>
          )}
        </div>

        {/* Bottom row: direction label + S&P change */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Market direction pill */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 28px",
            backgroundColor: `${accentGlow}22`,
            border: `1.5px solid ${accent}50`,
            borderRadius: 40,
          }}>
            <span style={{
              fontSize: 22,
              color: accent,
              fontWeight: 900,
            }}>
              {marketUp ? "▲" : "▼"}
            </span>
            <span style={{
              fontSize: 22,
              fontWeight: 800,
              color: accentLight,
              letterSpacing: "0.02em",
            }}>
              {marketUp ? "상승 마감" : "하락 마감"}
            </span>
          </div>

          {/* S&P 500 large change readout */}
          {spxChange !== null && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 2,
            }}>
              <span style={{
                fontSize: 15,
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}>
                S&P 500
              </span>
              <span style={{
                fontSize: 64,
                fontWeight: 900,
                color: accent,
                fontFamily: ffMono,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                textShadow: `0 0 40px ${accentGlow}80`,
              }}>
                {spxChange >= 0 ? "+" : ""}
                {spxChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Decorative corner rings ── */}
      <svg
        style={{ position: "absolute", bottom: -120, right: -120, opacity: 0.12, pointerEvents: "none" }}
        width="500" height="500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="250" cy="250" r="200" stroke={accent} strokeWidth="1.5" fill="none" />
        <circle cx="250" cy="250" r="150" stroke={accent} strokeWidth="1" fill="none" />
        <circle cx="250" cy="250" r="100" stroke={accent} strokeWidth="0.8" fill="none" />
      </svg>

    </AbsoluteFill>
  );
};
