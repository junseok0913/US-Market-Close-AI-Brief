import type { FC } from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import type { MarketChartData } from "@/types/market-chart";
import { normalizeMarketChartSymbol } from "@/lib/market-chart";
import { COLORS, SPEAKER_META, seededRandom, getTickerDisplayParts } from "./styles";
import { MiniChart } from "./MiniChart";
import { TickerCard, NumberExtractor, type ChartDataMap } from "./DataPanels";
import {
  ComparisonBarChart,
  EventCalendar,
  GaugeMeter,
  NewsHeadlineCards,
  SecFilingCards,
  SectorHeatmap,
} from "./DataViz";

type Source = {
  type?: string;
  title?: string;
  ticker?: string;
  start_date?: string;
  end_date?: string;
  pk?: string;
  id?: string;
  form?: string;
  accession_number?: string;
  date?: string;
  filed_date?: string;
};

type ScriptEntry = {
  id: number;
  speaker: string;
  text: string;
  sources?: Source[];
};

const KEYWORD_PATTERNS = [
  /(\d+\.?\d*%)/g,
  /(\d+\.?\d*퍼센트)/g,
  /(\$[\d,.]+)/g,
  /([\d,.]+달러)/g,
  /([\d,.]+조\s?달러)/g,
  /([\d,.]+억\s?달러)/g,
  /([\d,.]+선)/g,
  /(S&P\s?500|나스닥|다우존스|FOMC|NVDA|엔비디아|연준|금리|인플레이션|유가|스태그플레이션|WTI|PMI|GDP|AI|GTC|DMA)/g,
];

function splitIntoParagraphs(text: string, sentencesPerParagraph = 2): string[] {
  const sentences = text.split(/(?<=다\.|요\.|까\.|죠\.|군요\.|데요\.|니다\.)\s+/);
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
    paragraphs.push(
      sentences.slice(i, i + sentencesPerParagraph).join(" "),
    );
  }
  return paragraphs;
}

function highlightText(
  text: string,
): Array<{ text: string; highlight: boolean }> {
  const positions: Array<{ start: number; end: number }> = [];

  for (const pattern of KEYWORD_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      positions.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  positions.sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const pos of positions) {
    if (merged.length > 0 && pos.start <= merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(
        merged[merged.length - 1].end,
        pos.end,
      );
    } else {
      merged.push({ ...pos });
    }
  }

  const segments: Array<{ text: string; highlight: boolean }> = [];
  let cursor = 0;
  for (const m of merged) {
    if (cursor < m.start) {
      segments.push({ text: text.slice(cursor, m.start), highlight: false });
    }
    segments.push({ text: text.slice(m.start, m.end), highlight: true });
    cursor = m.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlight: false });
  }

  return segments.length > 0 ? segments : [{ text, highlight: false }];
}

const WAVEFORM_BARS = 24;

const AudioWaveform: FC<{
  color: string;
  active: boolean;
}> = ({ color, active }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: 40,
        padding: "0 4px",
      }}
    >
      {Array.from({ length: WAVEFORM_BARS }).map((_, i) => {
        const phase = i * 0.45 + frame * 0.12;
        const baseH = active
          ? interpolate(Math.sin(phase), [-1, 1], [4, 32])
          : 4;
        const secondWave = active
          ? interpolate(
              Math.sin(phase * 0.7 + i * 0.3),
              [-1, 1],
              [0.5, 1],
            )
          : 0.3;
        const h = baseH * secondWave;

        return (
          <div
            key={i}
            style={{
              width: 3,
              height: Math.max(3, h),
              borderRadius: 1.5,
              backgroundColor: color,
              opacity: active
                ? interpolate(h, [3, 32], [0.3, 0.9])
                : 0.2,
              transition: "height 0.05s",
            }}
          />
        );
      })}
    </div>
  );
};

const SpeakerBadge: FC<{
  speaker: string;
  isActive: boolean;
}> = ({ speaker, isActive }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = SPEAKER_META[speaker] || SPEAKER_META["진행자"];

  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 150 },
  });

  const scale = interpolate(badgeSpring, [0, 1], [0.8, 1]);
  const opacity = interpolate(badgeSpring, [0, 1], [0, 1]);

  const pulseRing = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.4, 0.8],
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
        {isActive && (
          <div
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              border: `2px solid ${meta.color}`,
              opacity: pulseRing,
            }}
          />
        )}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${meta.color}30, ${meta.color}15)`,
            border: `2px solid ${meta.color}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: meta.color, fontSize: 18, fontWeight: 800 }}>
            {meta.role[0]}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            color: meta.color,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {meta.role}
        </span>
        <span style={{ color: COLORS.text, fontSize: 17, fontWeight: 700 }}>
          {meta.label}
        </span>
      </div>

      <AudioWaveform color={meta.color} active={isActive} />
    </div>
  );
};

const SourceBadge: FC<{
  source: Source;
  index: number;
  chapterColor: string;
}> = ({ source, index, chapterColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120 },
    delay: 12 + index * 6,
  });

  const translateY = interpolate(cardSpring, [0, 1], [25, 0]);
  const opacity = interpolate(cardSpring, [0, 1], [0, 1]);

  let icon = "📰";
  let label = source.title || "Article";
  let badgeColor: string = COLORS.textMuted;

  if (source.type === "chart" && source.ticker) {
    icon = "📈";
    const { symbol, name } = getTickerDisplayParts(source.ticker);
    label = name ? `${symbol} · ${name}` : symbol;
    badgeColor = chapterColor;
  } else if (source.type === "event") {
    icon = "📅";
    label = source.title || "Event";
    badgeColor = COLORS.accent;
  } else if (source.type === "sec_filing") {
    icon = "📋";
    if (source.ticker) {
      const { symbol, name } = getTickerDisplayParts(source.ticker);
      const baseLabel = name ? `${symbol} · ${name}` : symbol;
      label = `${baseLabel} ${source.form || ""}`.trim();
    } else {
      label = `${source.form || "Filing"}`.trim();
    }
    badgeColor = "#8b5cf6";
  } else if (source.type === "article" && source.title) {
    label =
      source.title.length > 40
        ? source.title.slice(0, 38) + "…"
        : source.title;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        backgroundColor: `${badgeColor}10`,
        border: `1px solid ${badgeColor}25`,
        borderRadius: 6,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span
        style={{
          color: source.type === "chart" ? badgeColor : COLORS.textSecondary,
          fontSize: 12,
          fontWeight: source.type === "chart" ? 700 : 500,
          fontFamily:
            source.type === "chart"
              ? "'Space Grotesk', monospace"
              : "inherit",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
};

function lookupChart(
  chartDataMap: ChartDataMap | undefined,
  ticker: string,
): MarketChartData | null {
  if (!chartDataMap) return null;
  const key = normalizeMarketChartSymbol(ticker);
  return chartDataMap[key] || chartDataMap[ticker] || null;
}

export const ScriptScene: FC<{
  script: ScriptEntry;
  localFrame: number;
  durationFrames: number;
  chapterColor: string;
  prevSpeaker?: string;
  chartDataMap?: ChartDataMap;
  isOpening?: boolean;
}> = ({ script, localFrame, durationFrames, chapterColor, prevSpeaker, chartDataMap, isOpening = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const meta = SPEAKER_META[script.speaker] || SPEAKER_META["진행자"];

  const entryProgress = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const exitStart = Math.max(0, durationFrames - fps * 0.3);
  const exitProgress = interpolate(
    localFrame,
    [exitStart, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const textOpacity = Math.min(entryProgress, exitProgress);
  const textTranslateY = interpolate(entryProgress, [0, 1], [20, 0]);

  const paragraphs = splitIntoParagraphs(script.text, 2);

  const chartSources = (script.sources || []).filter(
    (s) => s.type === "chart" && s.ticker,
  );
  const uniqueChartTickers = Array.from(
    new Map(chartSources.map((s) => [s.ticker, s])).values(),
  );
  const eventSources = (script.sources || []).filter(
    (s) => s.type === "event" && s.title && s.date,
  );
  const articleSources = (script.sources || []).filter(
    (s) => s.type === "article" && s.title,
  );
  const secFilingSources = (script.sources || []).filter(
    (s) => s.type === "sec_filing",
  );

  const hasCharts = uniqueChartTickers.length > 0;
  const hasEvents = eventSources.length > 0;
  const hasHeatmap =
    isOpening &&
    !hasCharts &&
    !hasEvents &&
    !!chartDataMap &&
    Object.keys(chartDataMap).length >= 4;

  const hasRightPanel = hasCharts || hasEvents || hasHeatmap;

  const primaryChart = uniqueChartTickers[0];
  const allChartTickers = uniqueChartTickers
    .map((s) => s.ticker)
    .filter(Boolean) as string[];
  const secondaryCharts = uniqueChartTickers.slice(1, 4);

  const vixMentioned =
    /VIX|변동성\s?지수|공포\s?지수/.test(script.text) ||
    chartSources.some(
      (s) => s.ticker === "^VIX" || s.ticker === "TVC:VIX",
    );

  const showGaugeMeter = vixMentioned && !!chartDataMap;
  const showComparisonChart =
    hasCharts && allChartTickers.length >= 3 && !!chartDataMap;
  const showMiniChart =
    !!primaryChart?.ticker && (!showGaugeMeter || !showComparisonChart);
  const showSecondaryCards =
    hasCharts &&
    allChartTickers.length < 3 &&
    secondaryCharts.length > 0 &&
    !showGaugeMeter;

  const textLen = script.text.length;
  const baseFontSize = hasRightPanel ? 22 : 30;
  const fontSize = hasRightPanel && textLen > 350
    ? Math.max(18, baseFontSize - Math.floor((textLen - 350) / 80) * 2)
    : baseFontSize;

  return (
    <div
      style={{
        position: "absolute",
        top: 124,
        left: 48,
        right: 48,
        bottom: 76,
        display: "flex",
        flexDirection: hasRightPanel ? "row" : "column",
        justifyContent: hasRightPanel ? "flex-start" : "center",
        alignItems: hasRightPanel ? "stretch" : "stretch",
        gap: hasRightPanel ? 48 : 30,
      }}
    >
      {/* ───────── Left: Text ───────── */}
      <div
        style={{
          flex: hasRightPanel ? "0 0 44%" : "unset",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          maxWidth: hasRightPanel ? undefined : 1600,
        }}
      >
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
          }}
        >
          <SpeakerBadge speaker={script.speaker} isActive />
        </div>

        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textTranslateY * 1.2}px)`,
            paddingLeft: 66,
          }}
        >
          <div
            style={{
              width: 36,
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${meta.color}, transparent)`,
              marginBottom: 14,
              opacity: 0.6,
            }}
          />

          <div
            style={{
              fontSize,
              lineHeight: 1.75,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: COLORS.text,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              gap: paragraphs.length > 1 ? 14 : 0,
            }}
          >
            {paragraphs.map((para, pi) => {
              const segs = highlightText(para);
              return (
                <p key={pi} style={{ margin: 0 }}>
                  {segs.map((seg, i) =>
                    seg.highlight ? (
                      <span
                        key={i}
                        style={{
                          color: meta.color,
                          fontWeight: 700,
                          textShadow: `0 0 30px ${meta.color}30`,
                        }}
                      >
                        {seg.text}
                      </span>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    ),
                  )}
                </p>
              );
            })}
          </div>

          <div style={{ marginTop: 14 }}>
            <NumberExtractor text={script.text} accentColor={meta.color} />
          </div>

          {articleSources.length > 0 && (
            <NewsHeadlineCards
              sources={articleSources}
              accentColor={meta.color}
              delay={16}
              max={hasCharts ? 2 : 3}
            />
          )}

          {secFilingSources.length > 0 && (
            <SecFilingCards
              sources={secFilingSources}
              accentColor={meta.color}
              delay={18}
              max={2}
            />
          )}
        </div>
      </div>

      {/* ───────── Right: Data Visualizations ───────── */}
      {hasRightPanel && (
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            justifyContent: "center",
            opacity: textOpacity,
            transform: `translateX(${interpolate(entryProgress, [0, 1], [50, 0])}px)`,
          }}
        >
          {showMiniChart && primaryChart?.ticker && (
            <MiniChart
              ticker={primaryChart.ticker}
              accentColor={chapterColor}
              delay={6}
              chartData={lookupChart(chartDataMap, primaryChart.ticker)}
            />
          )}

          {showComparisonChart && chartDataMap && (
            <ComparisonBarChart
              tickers={allChartTickers}
              chartDataMap={chartDataMap}
              accentColor={chapterColor}
              delay={10}
            />
          )}

          {showSecondaryCards && (
            <div style={{ display: "flex", gap: 10 }}>
              {secondaryCharts.map((s, i) =>
                s.ticker ? (
                  <div key={s.ticker} style={{ flex: 1 }}>
                    <TickerCard
                      ticker={s.ticker}
                      accentColor={chapterColor}
                      delay={12 + i * 5}
                      size="compact"
                      chartDataMap={chartDataMap}
                    />
                  </div>
                ) : null,
              )}
            </div>
          )}

          {showGaugeMeter && chartDataMap && (
            <GaugeMeter chartDataMap={chartDataMap} delay={14} />
          )}

          {hasEvents && (
            <EventCalendar
              events={eventSources}
              accentColor={chapterColor}
              delay={hasCharts ? 18 : 6}
            />
          )}

          {hasHeatmap && chartDataMap && (
            <SectorHeatmap chartDataMap={chartDataMap} delay={6} />
          )}
        </div>
      )}
    </div>
  );
};
