import type { FC } from "react";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import type { ShortsEpisode, ShortsSlide } from "../src/types/shorts";
import "./shorty-fonts.css";

export type RemotionShortsEpisode = ShortsEpisode;

export interface ShortsCompositionProps {
  episode: ShortsEpisode;
  sectionTiming?: {
    sectionOrder?: string[];
    sections?: Array<{
      name?: string;
      startSec?: number;
      endSec?: number;
      speechEndSec?: number;
    }>;
  } | null;
  audioSrc?: string;
  includeAudio?: boolean;
}

type ShortsSection = "hook" | "data" | "story" | "closing";

type DataCard = {
  name: string;
  ticker: string;
  value: string;
  change: string;
  isPositive: boolean;
};

type MetricCard = {
  label: string;
  value: string;
  suffix: string;
  tone: "loss" | "accent";
};

type SectionWindow = {
  section: ShortsSection;
  startSec: number;
  endSec: number;
};

const PHASE_TO_SECTION: Record<string, ShortsSection> = {
  hook: "hook",
  market: "data",
  insight: "story",
  ticker: "story",
  signal: "story",
  watch: "closing",
  finale: "closing",
};

const NAME_TO_SECTION: Record<string, ShortsSection> = {
  hook: "hook",
  opening: "hook",
  intro: "hook",
  market: "data",
  data: "data",
  theme: "story",
  story: "story",
  insight: "story",
  ticker: "story",
  signal: "story",
  closing: "closing",
  watch: "closing",
  finale: "closing",
};

const BASE_FONT = '"Noto Sans KR",sans-serif';
const DISPLAY_FONT = '"Space Grotesk","Noto Sans KR",sans-serif';
const MONO_FONT = '"JetBrains Mono",monospace';

const COLORS = {
  background: "hsl(220 20% 4%)",
  foreground: "hsl(210 20% 95%)",
  primary: "hsl(145 80% 50%)",
  secondary: "hsl(215 80% 55%)",
  accent: "hsl(35 95% 55%)",
  mutedForeground: "hsl(215 15% 55%)",
  border: "hsl(220 15% 18%)",
  gain: "hsl(145 80% 50%)",
  loss: "hsl(0 75% 55%)",
  surfaceElevated: "hsl(220 18% 12%)",
  surfaceGlass: "hsl(220 18% 10% / 0.8)",
};

const GRADIENT_MAIN =
  "linear-gradient(180deg, hsl(220 20% 4%) 0%, hsl(220 20% 6%) 50%, hsl(220 18% 8%) 100%)";

const GRADIENT_ACCENT =
  "linear-gradient(90deg, hsl(145 80% 50%) 0%, hsl(215 80% 55%) 50%, hsl(35 95% 55%) 100%)";

const GLOW_PRIMARY =
  "0 0 30px hsl(145 80% 50% / 0.15), 0 0 60px hsl(145 80% 50% / 0.05)";

const DEFAULT_DATA_CARDS = [
  { name: "S&P 500", ticker: "^GSPC" },
  { name: "NASDAQ", ticker: "^IXIC" },
  { name: "DOW", ticker: "^DJI" },
];

const DATA_BAR_HEIGHTS_CACHE = new Map<string, number[][]>();

function compactText(value: unknown, fallback = ""): string {
  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}

function compactTextWithLimit(value: unknown, fallback: string, maxLen: number): string {
  const text = compactText(value, fallback);
  if (maxLen <= 0 || text.length <= maxLen) return text;
  return `${text.slice(0, Math.max(1, maxLen - 1)).trimEnd()}…`;
}

function uniqueTexts(values: string[]): string[] {
  const output: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const cleaned = compactText(value);
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    output.push(cleaned);
  }
  return output;
}

function extractToken(text: string, pattern: RegExp): string {
  const hit = text.match(pattern);
  return hit?.[0] || "";
}

function extractPercentTokens(source: string): string[] {
  return source.match(/[+-]?\d+(?:\.\d+)?%/g) || [];
}

function extractNumberTokens(source: string): string[] {
  return source.match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?/g) || [];
}

function parseInlineDataSegments(
  subheadline: string,
): Array<{ label: string; metric: string }> {
  const segments = subheadline
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  return segments
    .map((segment) => {
      const metric = extractToken(segment, /[+-]?\d+(?:\.\d+)?%/);
      if (!metric) return null;
      const label = compactText(segment.replace(metric, "").replace(/[,:]/g, ""), "MARKET");
      return { label, metric };
    })
    .filter((item): item is { label: string; metric: string } => Boolean(item));
}

function sectionFromPhase(phase: string | undefined): ShortsSection {
  return PHASE_TO_SECTION[phase || ""] || "story";
}

function sectionFromName(name: string | undefined): ShortsSection {
  const key = String(name || "").trim().toLowerCase();
  return NAME_TO_SECTION[key] || "story";
}

function formatDotDate(date: string): string {
  const cleaned = String(date || "").replace(/[^0-9]/g, "");
  if (cleaned.length !== 8) return date;
  return `${cleaned.slice(0, 4)}.${cleaned.slice(4, 6)}.${cleaned.slice(6, 8)}`;
}

function findSlideIndexByTime(slides: ShortsSlide[], currentTime: number): number {
  if (slides.length === 0) return 0;
  for (let i = slides.length - 1; i >= 0; i -= 1) {
    if (currentTime >= slides[i].startSec) return i;
  }
  return 0;
}

function deriveSectionWindowsFromTiming(
  sectionTiming: ShortsCompositionProps["sectionTiming"],
  episodeDuration: number,
): SectionWindow[] {
  const rawSections = Array.isArray(sectionTiming?.sections) ? sectionTiming.sections : [];
  if (rawSections.length === 0) return [];

  const windows = rawSections
    .map((entry) => {
      const startSec = Number(entry?.startSec);
      const endSecCandidate = Number(entry?.endSec ?? entry?.speechEndSec);
      if (!Number.isFinite(startSec) || !Number.isFinite(endSecCandidate)) return null;
      const endSec = Math.max(endSecCandidate, startSec + 0.01);
      return {
        section: sectionFromName(entry?.name),
        startSec: Math.max(0, startSec),
        endSec: Math.max(0, endSec),
      } as SectionWindow;
    })
    .filter((value): value is SectionWindow => Boolean(value))
    .sort((a, b) => a.startSec - b.startSec);

  if (windows.length === 0) return [];
  return windows.map((window, idx) => {
    const nextStart = idx + 1 < windows.length ? windows[idx + 1].startSec : episodeDuration;
    return {
      section: window.section,
      startSec: window.startSec,
      endSec: Math.max(window.endSec, nextStart, window.startSec + 0.01),
    };
  });
}

function deriveSectionWindowsFromSlides(
  slides: ShortsSlide[],
  episodeDuration: number,
): SectionWindow[] {
  if (slides.length === 0) {
    return [{ section: "story", startSec: 0, endSec: Math.max(episodeDuration, 0.01) }];
  }

  const windows: SectionWindow[] = [];
  for (let i = 0; i < slides.length; i += 1) {
    const slide = slides[i];
    const section = sectionFromPhase(slide.phase);
    const startSec = Math.max(0, Number(slide.startSec) || 0);
    const nextStart =
      i + 1 < slides.length
        ? Math.max(0, Number(slides[i + 1].startSec) || startSec)
        : Math.max(episodeDuration, Number(slide.endSec) || startSec + 0.01);
    const endSec = Math.max(startSec + 0.01, nextStart, Number(slide.endSec) || 0);

    const prev = windows[windows.length - 1];
    if (prev && prev.section === section) {
      prev.endSec = Math.max(prev.endSec, endSec);
    } else {
      windows.push({ section, startSec, endSec });
    }
  }

  return windows;
}

function findSectionWindowIndexByTime(
  windows: SectionWindow[],
  currentSec: number,
): number {
  if (windows.length === 0) return 0;
  for (let i = windows.length - 1; i >= 0; i -= 1) {
    if (currentSec >= windows[i].startSec) return i;
  }
  return 0;
}

function buildDataCards(slide: ShortsSlide | undefined): DataCard[] {
  if (!slide) {
    return DEFAULT_DATA_CARDS.map((base) => ({
      ...base,
      value: "--",
      change: "--",
      isPositive: true,
    }));
  }

  const subheadline = compactText(slide.subheadline);
  const inline = parseInlineDataSegments(subheadline);
  const sourceBlob = [
    slide.headline,
    slide.subheadline,
    slide.body,
    ...(slide.bullets || []),
    ...(slide.highlights || []),
  ]
    .map((item) => compactText(item))
    .join(" ");

  const percentPool = uniqueTexts([
    ...inline.map((item) => item.metric),
    ...extractPercentTokens(sourceBlob),
  ]);
  const numberPool = uniqueTexts(
    extractNumberTokens(sourceBlob).filter((token) => !token.includes("%")),
  );

  return DEFAULT_DATA_CARDS.map((base, idx) => {
    const inlineItem = inline[idx];
    const change = compactText(inlineItem?.metric || percentPool[idx], "--");
    const value = compactText(numberPool[idx], change);
    const name = compactText(inlineItem?.label, base.name);
    return {
      name,
      ticker: base.ticker,
      value,
      change,
      isPositive: !change.startsWith("-"),
    };
  });
}

function buildMetricCards(slide: ShortsSlide | undefined): MetricCard[] {
  if (!slide) {
    return [
      { label: "핵심 지표 1", value: "--", suffix: "예상치 비교", tone: "loss" },
      { label: "핵심 지표 2", value: "--", suffix: "MoM", tone: "accent" },
    ];
  }

  const bullets = (slide.bullets || []).map((item) => compactText(item)).filter(Boolean);
  const highlights = (slide.highlights || []).map((item) => compactText(item)).filter(Boolean);
  const fallback = uniqueTexts([compactText(slide.subheadline), compactText(slide.body)]).filter(Boolean);
  const numericHighlights = highlights.filter((line) =>
    /[+-]?\d+(?:\.\d+)?%|\$?\d+(?:,\d{3})*(?:\.\d+)?/.test(line),
  );
  const candidates = [...bullets, ...fallback].slice(0, 2);
  if (numericHighlights.length > 0 && candidates.length < 2) {
    candidates.push(...numericHighlights.slice(0, 2 - candidates.length));
  }

  while (candidates.length < 2) {
    candidates.push(`핵심 지표 ${candidates.length + 1}`);
  }

  return candidates.map((line, idx) => {
    const metric = extractToken(line, /[+-]?\d+(?:\.\d+)?%|\$?\d+(?:,\d{3})*(?:\.\d+)?/);
    const label = compactText(line.replace(metric, "").replace(/[():]/g, ""), `핵심 지표 ${idx + 1}`);
    return {
      label,
      value: metric || "--",
      suffix: metric
        ? compactText(line.replace(metric, "").replace(/[():]/g, ""), idx === 0 ? "예상치 비교" : "MoM")
        : compactText(line, idx === 0 ? "예상치 비교" : "MoM"),
      tone: idx === 0 ? "loss" : "accent",
    };
  });
}

function buildSectionBarHeights(cardIndex: number): number[] {
  return Array.from({ length: 20 }, (_, barIndex) => {
    if (cardIndex < 0 || barIndex < 0) return 0;
    return Math.random() * 100;
  });
}

export const ShortsComposition: FC<ShortsCompositionProps> = ({
  episode,
  sectionTiming = null,
  audioSrc,
  includeAudio = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  const slides = useMemo(
    () => [...(episode.slides || [])].sort((a, b) => a.startSec - b.startSec),
    [episode.slides],
  );

  const activeSlideIndex = findSlideIndexByTime(slides, currentSec);
  const activeSlide = slides[activeSlideIndex];
  const episodeDuration = Math.max(Number(episode.durationSeconds) || 0, 0.01);

  const windowsFromTiming = deriveSectionWindowsFromTiming(sectionTiming, episodeDuration);
  const sectionWindows =
    windowsFromTiming.length > 0
      ? windowsFromTiming
      : deriveSectionWindowsFromSlides(slides, episodeDuration);

  const sectionWindowIndex = findSectionWindowIndexByTime(sectionWindows, currentSec);
  const sectionWindow = sectionWindows[sectionWindowIndex] ?? {
    section: sectionFromPhase(activeSlide?.phase),
    startSec: 0,
    endSec: episodeDuration,
  };

  const sectionSlides = slides.filter(
    (slide) =>
      slide.startSec >= sectionWindow.startSec - 0.001 &&
      slide.startSec < sectionWindow.endSec - 0.001,
  );

  const contentSlide = sectionSlides[0] ?? activeSlide;

  const hookDate = formatDotDate(episode.date);
  const hookTitle = compactTextWithLimit(
    contentSlide?.headline,
    compactText(episode.title, "US Market Close"),
    34,
  );
  const hookCopy = compactTextWithLimit(
    contentSlide?.subheadline || contentSlide?.body,
    compactText(episode.hook),
    72,
  );

  const dataCards = buildDataCards(contentSlide).map((card) => ({
    ...card,
    name: compactTextWithLimit(card.name, card.name, 18),
    value: compactTextWithLimit(card.value, card.value, 16),
    change: compactTextWithLimit(card.change, card.change, 12),
  }));
  const metricCards = buildMetricCards(contentSlide).map((metric) => ({
    ...metric,
    label: compactTextWithLimit(metric.label, metric.label, 16),
    value: compactTextWithLimit(metric.value, metric.value, 10),
    suffix: compactTextWithLimit(metric.suffix, metric.suffix, 14),
  }));
  const dataCardCount = dataCards.length;
  const dataBarsKey = `${sectionWindow.section}:${sectionWindow.startSec.toFixed(3)}:${
    contentSlide?.id ?? ""
  }:${dataCardCount}`;
  let barHeightsByCard = DATA_BAR_HEIGHTS_CACHE.get(dataBarsKey);
  if (!barHeightsByCard) {
    barHeightsByCard = Array.from({ length: dataCardCount }, (_, idx) => buildSectionBarHeights(idx));
    DATA_BAR_HEIGHTS_CACHE.set(dataBarsKey, barHeightsByCard);
  }

  const keyPoints = uniqueTexts(
    (episode.meta.keyPoints || []).map((item) => compactText(item)).filter(Boolean),
  ).slice(0, 4);
  for (const extra of contentSlide?.bullets || []) {
    if (keyPoints.length >= 4) break;
    const cleaned = compactText(extra);
    if (!cleaned || keyPoints.includes(cleaned)) continue;
    keyPoints.push(cleaned);
  }
  if (keyPoints.length < 4) {
    const bodyText = compactText(contentSlide?.body);
    if (bodyText && !keyPoints.includes(bodyText)) {
      keyPoints.push(bodyText);
    }
  }
  for (let i = 0; i < keyPoints.length; i += 1) {
    keyPoints[i] = compactTextWithLimit(keyPoints[i], keyPoints[i], 42);
  }
  while (keyPoints.length < 4) keyPoints.push(`핵심 포인트 ${keyPoints.length + 1}`);

  const featuredTicker = compactTextWithLimit(
    contentSlide?.tickers?.[0],
    compactText(episode.meta.featuredTickers?.[0], "XRT"),
    10,
  );
  const featuredSubtitle = compactTextWithLimit(contentSlide?.subheadline, "소매업종 ETF", 20);
  const featuredBadge = compactTextWithLimit(contentSlide?.highlights?.[0], "시장 평균 상회", 12);

  const closingTitle = compactTextWithLimit(contentSlide?.headline, "다음 주 핵심 변수", 24);
  const closingEventDate = compactTextWithLimit(contentSlide?.eyebrow, "2월 27일 (금)", 18);
  const closingEventName = compactTextWithLimit(
    contentSlide?.subheadline || contentSlide?.bullets?.[0],
    "생산자물가지수 (PPI)",
    26,
  );
  const closingDetail = compactTextWithLimit(
    contentSlide?.body || contentSlide?.bullets?.[1],
    "인플레이션과 시장 방향의 핵심 지표",
    52,
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.foreground,
        fontFamily: BASE_FONT,
      }}
    >
      {includeAudio && audioSrc ? (
        <Audio src={staticFile(audioSrc.replace(/^\/+/, ""))} />
      ) : null}

      <AbsoluteFill style={{ background: GRADIENT_MAIN }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${sectionWindow.section}-${sectionWindow.startSec.toFixed(3)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: "absolute", inset: 0 }}
        >
          {sectionWindow.section === "hook" ? (
            <AbsoluteFill
              style={{
                alignItems: "center",
                justifyContent: "center",
                padding: "0 64px",
                textAlign: "center",
              }}
            >
              <AbsoluteFill style={{ background: GRADIENT_MAIN }} />

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: 280,
                  left: 64,
                  right: 64,
                  height: 3,
                  borderRadius: 999,
                  background: GRADIENT_ACCENT,
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 48,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    borderRadius: 999,
                    padding: "20px 48px",
                    backgroundColor: "hsl(145 80% 50% / 0.15)",
                    border: "1px solid hsl(145 80% 50% / 0.3)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO_FONT,
                      fontSize: 40,
                      letterSpacing: "0.1em",
                      fontWeight: 700,
                    }}
                  >
                    {hookDate}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  style={{ display: "flex", alignItems: "center", gap: 16 }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: COLORS.primary,
                      animation: "shortyPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontSize: 30,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: COLORS.primary,
                      textShadow:
                        "0 0 20px hsl(145 80% 50% / 0.4), 0 0 40px hsl(145 80% 50% / 0.1)",
                    }}
                  >
                    Market Briefing
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                  style={{
                    margin: 0,
                    fontSize: 64,
                    fontWeight: 900,
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                    maxWidth: 900,
                  }}
                >
                  {hookTitle}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  style={{
                    margin: 0,
                    fontSize: 36,
                    lineHeight: 1.6,
                    fontWeight: 500,
                    color: COLORS.mutedForeground,
                    maxWidth: 850,
                  }}
                >
                  {hookCopy}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 200,
                  transform: "translateX(-50%)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 64, height: 2, backgroundColor: "hsl(145 80% 50% / 0.3)" }} />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "hsl(145 80% 50% / 0.5)",
                    }}
                  />
                  <div style={{ width: 64, height: 2, backgroundColor: "hsl(145 80% 50% / 0.3)" }} />
                </div>
              </motion.div>
            </AbsoluteFill>
          ) : null}

          {sectionWindow.section === "data" ? (
            <AbsoluteFill style={{ padding: "80px 56px", display: "flex", flexDirection: "column" }}>
              <AbsoluteFill style={{ background: GRADIENT_MAIN }} />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ marginBottom: 64 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.primary }} />
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontSize: 26,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: COLORS.primary,
                      }}
                    >
                      Today&apos;s Market
                    </span>
                  </div>
                  <div style={{ width: 192, height: 2, borderRadius: 999, background: GRADIENT_ACCENT }} />
                </motion.div>

                <div style={{ display: "flex", flexDirection: "column", gap: 32, flex: 1, justifyContent: "center" }}>
                  {dataCards.map((item, idx) => (
                    <motion.div
                      key={item.ticker}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.2, duration: 0.6, ease: "easeOut" }}
                      style={{
                        borderRadius: 16,
                        padding: 40,
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: COLORS.surfaceElevated,
                        boxShadow: GLOW_PRIMARY,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                        <div>
                          <h3 style={{ margin: 0, fontFamily: DISPLAY_FONT, fontSize: 40, fontWeight: 700 }}>{item.name}</h3>
                          <span style={{ fontFamily: MONO_FONT, fontSize: 22, color: COLORS.mutedForeground }}>{item.ticker}</span>
                        </div>

                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 + idx * 0.2, type: "spring", stiffness: 200 }}
                          style={{
                            borderRadius: 12,
                            padding: "12px 32px",
                            backgroundColor: item.isPositive
                              ? "hsl(145 80% 50% / 0.15)"
                              : "hsl(0 75% 55% / 0.15)",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: MONO_FONT,
                              fontSize: 36,
                              fontWeight: 700,
                              color: item.isPositive ? COLORS.gain : COLORS.loss,
                            }}
                          >
                            {item.change}
                          </span>
                        </motion.div>
                      </div>

                      <div style={{ fontFamily: MONO_FONT, fontSize: 52, fontWeight: 700 }}>{item.value}</div>

                      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 24, height: 40 }}>
                        {barHeightsByCard[idx]?.map((height, i) => (
                          <motion.div
                            key={`${item.ticker}-${i}`}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: 0.8 + idx * 0.2 + i * 0.02, duration: 0.3 }}
                            style={{
                              flex: 1,
                              borderRadius: 2,
                              backgroundColor: item.isPositive
                                ? "hsl(145 80% 50% / 0.3)"
                                : "hsl(0 75% 55% / 0.3)",
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  style={{
                    marginTop: 48,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 24,
                  }}
                >
                  {metricCards.slice(0, 2).map((metric) => (
                    <div
                      key={`${metric.label}-${metric.value}`}
                      style={{
                        borderRadius: 12,
                        padding: 32,
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: COLORS.surfaceGlass,
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          marginBottom: 8,
                          fontSize: 22,
                          color: "hsl(215 15% 55%)",
                        }}
                      >
                        {metric.label}
                      </span>
                      <span
                        style={{
                          fontFamily: MONO_FONT,
                          fontSize: 38,
                          fontWeight: 700,
                          color: metric.tone === "loss" ? COLORS.loss : COLORS.accent,
                        }}
                      >
                        {metric.value}
                      </span>
                      {metric.suffix ? (
                        <span
                          style={{
                            marginLeft: 12,
                            fontSize: 20,
                            color: "hsl(215 15% 55%)",
                          }}
                        >
                          {metric.suffix}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </motion.div>

              </div>
            </AbsoluteFill>
          ) : null}

          {sectionWindow.section === "story" ? (
            <AbsoluteFill style={{ padding: "56px 56px", display: "flex", flexDirection: "column" }}>
              <AbsoluteFill style={{ background: GRADIENT_MAIN }} />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ marginBottom: 40 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.secondary }} />
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontSize: 26,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: COLORS.secondary,
                      }}
                    >
                      Key Insights
                    </span>
                  </div>
                  <div style={{ width: 192, height: 2, borderRadius: 999, background: GRADIENT_ACCENT }} />
                </motion.div>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {keyPoints.map((point, idx) => (
                    <motion.div
                      key={`${point}-${idx}`}
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.3, duration: 0.6, ease: "easeOut" }}
                      style={{ display: "flex", alignItems: "flex-start", gap: 24 }}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          backgroundColor: COLORS.surfaceElevated,
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <span style={{ fontFamily: DISPLAY_FONT, fontSize: 32, fontWeight: 700, color: COLORS.primary }}>
                          {idx + 1}
                        </span>
                      </div>

                      <div
                        style={{
                          flex: 1,
                          borderRadius: 16,
                          padding: 24,
                          backgroundColor: COLORS.surfaceElevated,
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.3, duration: 0.5 }}
                          style={{ margin: 0, fontSize: 30, lineHeight: 1.5, fontWeight: 500 }}
                        >
                          {point}
                        </motion.p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  style={{
                    marginTop: 32,
                    borderRadius: 16,
                    padding: 32,
                    border: "1px solid hsl(145 80% 50% / 0.3)",
                    backgroundColor: COLORS.surfaceGlass,
                    backdropFilter: "blur(20px)",
                    boxShadow: GLOW_PRIMARY,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ display: "block", marginBottom: 8, fontSize: 22, color: COLORS.mutedForeground }}>
                        주목 종목
                      </span>
                      <span
                        style={{
                          fontFamily: DISPLAY_FONT,
                          fontSize: 48,
                          fontWeight: 700,
                          color: COLORS.primary,
                          textShadow:
                            "0 0 20px hsl(145 80% 50% / 0.4), 0 0 40px hsl(145 80% 50% / 0.1)",
                        }}
                      >
                        {featuredTicker}
                      </span>
                      <span style={{ marginLeft: 16, fontSize: 26, color: COLORS.mutedForeground }}>
                        {featuredSubtitle}
                      </span>
                    </div>

                    <div style={{ borderRadius: 12, padding: "16px 32px", backgroundColor: "hsl(145 80% 50% / 0.15)" }}>
                      <span style={{ fontFamily: DISPLAY_FONT, fontSize: 30, fontWeight: 700, color: COLORS.gain }}>
                        {featuredBadge}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </AbsoluteFill>
          ) : null}

          {sectionWindow.section === "closing" ? (
            <AbsoluteFill
              style={{
                alignItems: "center",
                justifyContent: "center",
                padding: "0 64px",
                textAlign: "center",
              }}
            >
              <AbsoluteFill style={{ background: GRADIENT_MAIN }} />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 56,
                }}
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    width: 256,
                    height: 3,
                    borderRadius: 999,
                    background: GRADIENT_ACCENT,
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: DISPLAY_FONT,
                      fontSize: 56,
                      lineHeight: 1.3,
                      fontWeight: 900,
                    }}
                  >
                    {closingTitle}
                  </h2>

                  <div
                    style={{
                      maxWidth: 800,
                      borderRadius: 16,
                      padding: 40,
                      backgroundColor: COLORS.surfaceElevated,
                      border: "1px solid hsl(35 95% 55% / 0.3)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: COLORS.accent,
                          animation: "shortyPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: DISPLAY_FONT,
                          fontSize: 26,
                          fontWeight: 600,
                          color: COLORS.accent,
                        }}
                      >
                        {closingEventDate}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 40, fontWeight: 700, lineHeight: 1.4 }}>{closingEventName}</p>
                    <p style={{ margin: "16px 0 0", fontSize: 28, lineHeight: 1.5, color: COLORS.mutedForeground }}>
                      {closingDetail}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 24,
                    marginTop: 32,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 32, color: COLORS.mutedForeground, fontWeight: 500 }}>
                    매일 장마감 후 업데이트됩니다
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span
                      style={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: COLORS.primary,
                        textShadow:
                          "0 0 20px hsl(145 80% 50% / 0.4), 0 0 40px hsl(145 80% 50% / 0.1)",
                      }}
                    >
                      구독
                    </span>
                    <span style={{ fontSize: 36, color: COLORS.mutedForeground }}>·</span>
                    <span style={{ fontSize: 36, fontWeight: 700, color: COLORS.secondary }}>좋아요</span>
                    <span style={{ fontSize: 36, color: COLORS.mutedForeground }}>·</span>
                    <span style={{ fontSize: 36, fontWeight: 700, color: COLORS.accent }}>알림설정</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.0, duration: 0.8 }}
                  style={{
                    width: 256,
                    height: 3,
                    borderRadius: 999,
                    background: GRADIENT_ACCENT,
                  }}
                />
              </div>
            </AbsoluteFill>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </AbsoluteFill>
  );
};
