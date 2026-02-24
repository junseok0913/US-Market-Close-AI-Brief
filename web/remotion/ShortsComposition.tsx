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
type IndexKey = "sp500" | "nasdaq" | "dow";

type DataCard = {
  name: string;
  ticker: string;
  value: string;
  change: string;
  isPositive: boolean;
  linePath: string;
  chartPath: string;
};

type FeaturedTicker = {
  ticker: string;
  label: string;
  tag: string;
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
const INDEX_KEY_ORDER: IndexKey[] = ["sp500", "nasdaq", "dow"];
const INDEX_KEY_BY_TICKER: Record<string, IndexKey> = {
  "^GSPC": "sp500",
  "^IXIC": "nasdaq",
  "^DJI": "dow",
};
const INDEX_PATTERNS: Record<IndexKey, RegExp> = {
  sp500: /(?:S\.?\s*&?\s*P\.?\s*500|S&P500|에스앤피(?:\s*500)?)/i,
  nasdaq: /(?:NASDAQ|나스닥)/i,
  dow: /(?:\bDOW\b|다우존스|다우)/i,
};
const PERCENT_TOKEN_RE = /[+-]?\d+(?:\.\d+)?%/;
const NEGATIVE_CONTEXT_RE = /(하락|급락|약세|내렸|내린|떨어|감소|부진|밀리|약화|down|decline|declined|fell|drop|dropped|slid|lower)/i;
const POSITIVE_CONTEXT_RE = /(상승|급등|강세|올랐|오른|증가|반등|개선|회복|up|rise|rose|gain|gained|higher)/i;

/* SVG chart paths per card — trend-sensitive variants */
const CHART_PATHS_UP = [
  {
    linePath:
      "M0,28 C15,26 25,22 40,20 C55,18 65,24 80,16 C95,8 110,12 125,10 C140,8 155,6 170,8 C185,10 195,5 200,4",
    chartPath:
      "M0,28 C15,26 25,22 40,20 C55,18 65,24 80,16 C95,8 110,12 125,10 C140,8 155,6 170,8 C185,10 195,5 200,4 L200,40 L0,40 Z",
  },
  {
    linePath:
      "M0,30 C20,28 30,25 50,22 C70,19 80,26 100,14 C120,6 140,10 160,8 C175,6 190,3 200,2",
    chartPath:
      "M0,30 C20,28 30,25 50,22 C70,19 80,26 100,14 C120,6 140,10 160,8 C175,6 190,3 200,2 L200,40 L0,40 Z",
  },
  {
    linePath:
      "M0,25 C20,24 35,20 55,22 C75,24 85,18 105,15 C125,12 145,14 165,10 C180,8 190,6 200,7",
    chartPath:
      "M0,25 C20,24 35,20 55,22 C75,24 85,18 105,15 C125,12 145,14 165,10 C180,8 190,6 200,7 L200,40 L0,40 Z",
  },
];
const CHART_PATHS_DOWN = [
  {
    linePath:
      "M0,6 C15,8 25,12 40,14 C55,16 65,10 80,18 C95,26 110,22 125,24 C140,26 155,28 170,26 C185,24 195,29 200,30",
    chartPath:
      "M0,6 C15,8 25,12 40,14 C55,16 65,10 80,18 C95,26 110,22 125,24 C140,26 155,28 170,26 C185,24 195,29 200,30 L200,40 L0,40 Z",
  },
  {
    linePath:
      "M0,4 C20,6 30,9 50,12 C70,15 80,8 100,20 C120,28 140,24 160,26 C175,28 190,31 200,32",
    chartPath:
      "M0,4 C20,6 30,9 50,12 C70,15 80,8 100,20 C120,28 140,24 160,26 C175,28 190,31 200,32 L200,40 L0,40 Z",
  },
  {
    linePath:
      "M0,7 C20,8 35,12 55,10 C75,8 85,14 105,17 C125,20 145,18 165,22 C180,24 190,26 200,25",
    chartPath:
      "M0,7 C20,8 35,12 55,10 C75,8 85,14 105,17 C125,20 145,18 165,22 C180,24 190,26 200,25 L200,40 L0,40 Z",
  },
];

/* Accent colors for story key-point cards */
const ACCENT_COLORS = [
  { bar: COLORS.primary, bg: "hsl(145 80% 50% / 0.08)", border: "hsl(145 80% 50% / 0.25)" },
  { bar: COLORS.secondary, bg: "hsl(215 80% 55% / 0.08)", border: "hsl(215 80% 55% / 0.25)" },
  { bar: COLORS.accent, bg: "hsl(35 95% 55% / 0.08)", border: "hsl(35 95% 55% / 0.25)" },
  { bar: COLORS.gain, bg: "hsl(145 80% 50% / 0.08)", border: "hsl(145 80% 50% / 0.25)" },
];

const TICKER_COLORS = [
  { text: COLORS.primary, tagColor: COLORS.gain, bg: "hsl(145 80% 50% / 0.15)" },
  { text: COLORS.secondary, tagColor: COLORS.accent, bg: "hsl(215 80% 55% / 0.15)" },
  { text: COLORS.accent, tagColor: COLORS.primary, bg: "hsl(35 95% 55% / 0.15)" },
];

/* ─── Utility functions ─── */

function compactText(value: unknown, fallback = ""): string {
  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}

function compactTextWithLimit(
  value: unknown,
  fallback: string,
  maxLen: number,
): string {
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

function detectIndexKey(text: string): IndexKey | "" {
  for (const key of INDEX_KEY_ORDER) {
    if (INDEX_PATTERNS[key].test(text)) return key;
  }
  return "";
}

function inferDirectionFromContext(
  context: string,
  defaultDirection: "+" | "-",
): "+" | "-" {
  if (NEGATIVE_CONTEXT_RE.test(context)) return "-";
  if (POSITIVE_CONTEXT_RE.test(context)) return "+";
  return defaultDirection;
}

function normalizePercentToken(
  token: string,
  context: string,
  defaultDirection: "+" | "-",
): string {
  const cleaned = compactText(token).replace(/%/g, "").replace(/,/g, "");
  if (!cleaned) return "";

  const explicit = cleaned.startsWith("+") || cleaned.startsWith("-");
  const magnitude = explicit ? cleaned.slice(1) : cleaned;
  if (!/^\d+(?:\.\d+)?$/.test(magnitude)) return "";

  const sign = explicit
    ? (cleaned[0] as "+" | "-")
    : inferDirectionFromContext(context, defaultDirection);
  return `${sign}${magnitude}%`;
}

function parseIndexPercents(
  source: string,
  defaultDirection: "+" | "-",
): Partial<Record<IndexKey, string>> {
  const output: Partial<Record<IndexKey, string>> = {};
  const text = compactText(source);
  if (!text) return output;

  const segments = text
    .split(/[|,\n]/)
    .map((segment) => compactText(segment))
    .filter(Boolean);

  for (const segment of segments) {
    const key = detectIndexKey(segment);
    if (!key || output[key]) continue;
    const token = extractToken(segment, PERCENT_TOKEN_RE);
    if (!token) continue;
    const normalized = normalizePercentToken(token, segment, defaultDirection);
    if (normalized) output[key] = normalized;
  }

  for (const key of INDEX_KEY_ORDER) {
    if (output[key]) continue;
    const regex = new RegExp(
      `${INDEX_PATTERNS[key].source}[^%]{0,48}?([+-]?\\d+(?:\\.\\d+)?%)`,
      "i",
    );
    const hit = text.match(regex);
    if (!hit) continue;
    const normalized = normalizePercentToken(hit[1], hit[0], defaultDirection);
    if (normalized) output[key] = normalized;
  }

  return output;
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

function findSlideIndexByTime(
  slides: ShortsSlide[],
  currentTime: number,
): number {
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
  const rawSections = Array.isArray(sectionTiming?.sections)
    ? sectionTiming.sections
    : [];
  if (rawSections.length === 0) return [];

  const windows = rawSections
    .map((entry) => {
      const startSec = Number(entry?.startSec);
      const endSecCandidate = Number(entry?.endSec ?? entry?.speechEndSec);
      if (!Number.isFinite(startSec) || !Number.isFinite(endSecCandidate))
        return null;
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
    const nextStart =
      idx + 1 < windows.length ? windows[idx + 1].startSec : episodeDuration;
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
    return [
      {
        section: "story",
        startSec: 0,
        endSec: Math.max(episodeDuration, 0.01),
      },
    ];
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
    const endSec = Math.max(
      startSec + 0.01,
      nextStart,
      Number(slide.endSec) || 0,
    );

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

/* ─── Data builders ─── */

function buildDataCards(slide: ShortsSlide | undefined): DataCard[] {
  if (!slide) {
    return DEFAULT_DATA_CARDS.map((base, idx) => ({
      ...base,
      value: "--",
      change: "--",
      isPositive: true,
      ...CHART_PATHS_UP[idx],
    }));
  }

  const defaultDirection: "+" | "-" = slide.theme === "bear" ? "-" : "+";
  const indexChanges: Partial<Record<IndexKey, string>> = {};

  const applyParsed = (source: string) => {
    const parsed = parseIndexPercents(source, defaultDirection);
    for (const key of INDEX_KEY_ORDER) {
      if (indexChanges[key]) continue;
      if (parsed[key]) indexChanges[key] = parsed[key];
    }
  };

  applyParsed(compactText(slide.subheadline));
  for (const bullet of slide.bullets || []) {
    applyParsed(compactText(bullet));
  }
  applyParsed(compactText(slide.body));

  const highlightPercents = (slide.highlights || [])
    .map((h) =>
      normalizePercentToken(
        extractToken(compactText(h), PERCENT_TOKEN_RE),
        compactText(h),
        defaultDirection,
      ),
    )
    .filter(Boolean);
  let highlightCursor = 0;
  for (const key of INDEX_KEY_ORDER) {
    if (indexChanges[key]) continue;
    if (highlightCursor < highlightPercents.length) {
      indexChanges[key] = highlightPercents[highlightCursor];
      highlightCursor += 1;
    }
  }

  return DEFAULT_DATA_CARDS.map((base, idx) => {
    const key = INDEX_KEY_BY_TICKER[base.ticker];
    const change = indexChanges[key] || "--";
    const isPositive = !change.startsWith("-");
    return {
      name: base.name,
      ticker: base.ticker,
      value: change,
      change,
      isPositive,
      ...(isPositive ? CHART_PATHS_UP[idx % CHART_PATHS_UP.length] : CHART_PATHS_DOWN[idx % CHART_PATHS_DOWN.length]),
    };
  });
}

function buildFeaturedTickers(
  episode: ShortsEpisode,
  storySlide: ShortsSlide | undefined,
): FeaturedTicker[] {
  const seen = new Set<string>();
  const result: FeaturedTicker[] = [];

  // Priority 1: meta.featuredTickers as object array (from Gemini)
  // e.g. [{"ticker":"XRT","label":"소매업종 ETF","tag":"시장 평균 상회"}]
  const metaFT = episode.meta?.featuredTickers || [];
  for (const item of metaFT) {
    if (result.length >= 3) break;
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      const tick = compactText(obj.ticker);
      if (!tick || tick.startsWith("^") || seen.has(tick)) continue;
      seen.add(tick);
      result.push({
        ticker: tick,
        label: compactTextWithLimit(obj.label, "주목 종목", 20),
        tag: compactTextWithLimit(obj.tag, "시장 주목", 12),
      });
    } else if (typeof item === "string") {
      const tick = compactText(item);
      if (!tick || tick.startsWith("^") || seen.has(tick)) continue;
      seen.add(tick);
      // String-only: build label/tag from story slide context
      const idx = result.length;
      const storyHighlights = (storySlide?.highlights || []).map((h) => compactText(h));
      const storyBullets = (storySlide?.bullets || []).map((b) => compactText(b));
      result.push({
        ticker: tick,
        label: compactTextWithLimit(
          idx === 0 ? storySlide?.subheadline : undefined,
          "주목 종목",
          20,
        ),
        tag: compactTextWithLimit(
          storyHighlights[idx] || storyBullets[idx],
          "시장 주목",
          12,
        ),
      });
    }
  }

  // Priority 2: gather non-index tickers from all slides
  if (result.length < 3) {
    for (const slide of episode.slides || []) {
      for (const t of slide.tickers || []) {
        if (result.length >= 3) break;
        const tick = compactText(t);
        if (!tick || tick.startsWith("^") || seen.has(tick)) continue;
        seen.add(tick);
        result.push({
          ticker: tick,
          label: "관련 종목",
          tag: "시장 주목",
        });
      }
    }
  }

  // Minimum 1 fallback if absolutely nothing was found
  if (result.length === 0) {
    result.push({ ticker: "XRT", label: "소매업종 ETF", tag: "시장 평균 상회" });
  }

  return result;
}

/* ─── Main composition ─── */

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
  const episodeDuration = Math.max(
    Number(episode.durationSeconds) || 0,
    0.01,
  );

  const windowsFromTiming = deriveSectionWindowsFromTiming(
    sectionTiming,
    episodeDuration,
  );
  const sectionWindows =
    windowsFromTiming.length > 0
      ? windowsFromTiming
      : deriveSectionWindowsFromSlides(slides, episodeDuration);

  const sectionWindowIndex = findSectionWindowIndexByTime(
    sectionWindows,
    currentSec,
  );
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

  /* ── Hook data ── */
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

  /* ── Data cards ── */
  const dataCards = buildDataCards(contentSlide).map((card) => ({
    ...card,
    name: compactTextWithLimit(card.name, card.name, 18),
    value: compactTextWithLimit(card.value, card.value, 16),
    change: compactTextWithLimit(card.change, card.change, 12),
  }));

  /* ── Story key points ── */
  const keyPoints = uniqueTexts(
    (episode.meta.keyPoints || [])
      .map((item) => compactText(item))
      .filter(Boolean),
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

  /* ── Featured tickers ── */
  const featuredTickers = buildFeaturedTickers(episode, contentSlide);

  /* ── Closing data ── */
  const closingEventDate = compactTextWithLimit(
    contentSlide?.eyebrow,
    "2월 27일 (금)",
    18,
  );
  const closingEventName = compactTextWithLimit(
    contentSlide?.headline,
    "생산자물가지수 (PPI)",
    34,
  );
  const closingDetail = compactTextWithLimit(
    contentSlide?.body || contentSlide?.subheadline || contentSlide?.bullets?.[0],
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
          {/* ═══════════════ HOOK SECTION ═══════════════ */}
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

              {/* Decorative line */}
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
                {/* Date badge */}
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

                {/* Market briefing label */}
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
                      animation:
                        "shortyPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
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

                {/* Title */}
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

                {/* Hook */}
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

              {/* Bottom decoration */}
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 2,
                      backgroundColor: "hsl(145 80% 50% / 0.3)",
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "hsl(145 80% 50% / 0.5)",
                    }}
                  />
                  <div
                    style={{
                      width: 64,
                      height: 2,
                      backgroundColor: "hsl(145 80% 50% / 0.3)",
                    }}
                  />
                </div>
              </motion.div>
            </AbsoluteFill>
          ) : null}

          {/* ═══════════════ DATA SECTION ═══════════════ */}
          {sectionWindow.section === "data" ? (
            <AbsoluteFill
              style={{
                padding: "80px 56px",
                display: "flex",
                flexDirection: "column",
              }}
            >
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
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ marginBottom: 24 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: COLORS.primary,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontSize: 28,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: COLORS.primary,
                      }}
                    >
                      Today&apos;s Market
                    </span>
                  </div>
                  <div
                    style={{
                      width: 192,
                      height: 2,
                      borderRadius: 999,
                      background: GRADIENT_ACCENT,
                    }}
                  />
                </motion.div>

                {/* Market cards */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 32,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  {dataCards.map((item, idx) => (
                    <motion.div
                      key={item.ticker}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.3 + idx * 0.2,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                      style={{
                        borderRadius: 16,
                        padding: 40,
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: COLORS.surfaceElevated,
                        boxShadow: GLOW_PRIMARY,
                      }}
                    >
                      {/* Name + change badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontFamily: DISPLAY_FONT,
                            fontSize: 46,
                            fontWeight: 700,
                          }}
                        >
                          {item.name}
                        </h3>

                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.6 + idx * 0.2,
                            type: "spring",
                            stiffness: 200,
                          }}
                          style={{
                            borderRadius: 12,
                            padding: "8px 24px",
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
                              color: item.isPositive
                                ? COLORS.gain
                                : COLORS.loss,
                            }}
                          >
                            {item.change}
                          </span>
                        </motion.div>
                      </div>

                      {/* Value */}
                      <div
                        style={{
                          fontFamily: MONO_FONT,
                          fontSize: 52,
                          fontWeight: 700,
                          marginBottom: 16,
                        }}
                      >
                        {item.value}
                      </div>

                      {/* SVG area chart */}
                      <div style={{ position: "relative", height: 64, marginTop: 8 }}>
                        <svg
                          viewBox="0 0 200 40"
                          style={{ width: "100%", height: "100%" }}
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient
                              id={`grad-${idx}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor={
                                  item.isPositive
                                    ? COLORS.primary
                                    : COLORS.loss
                                }
                                stopOpacity="0.4"
                              />
                              <stop
                                offset="100%"
                                stopColor={
                                  item.isPositive
                                    ? COLORS.primary
                                    : COLORS.loss
                                }
                                stopOpacity="0.02"
                              />
                            </linearGradient>
                          </defs>
                          <motion.path
                            d={item.chartPath}
                            fill={`url(#grad-${idx})`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              delay: 0.8 + idx * 0.2,
                              duration: 0.6,
                            }}
                          />
                          <motion.path
                            d={item.linePath}
                            fill="none"
                            stroke={
                              item.isPositive ? COLORS.primary : COLORS.loss
                            }
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                              delay: 0.8 + idx * 0.2,
                              duration: 1,
                              ease: "easeOut",
                            }}
                          />
                        </svg>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom accent line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  style={{
                    marginTop: 24,
                    height: 2,
                    borderRadius: 999,
                    background: GRADIENT_ACCENT,
                  }}
                />
              </div>
            </AbsoluteFill>
          ) : null}

          {/* ═══════════════ STORY SECTION ═══════════════ */}
          {sectionWindow.section === "story" ? (
            <AbsoluteFill
              style={{
                padding: "64px 56px 220px",
                display: "flex",
                flexDirection: "column",
              }}
            >
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
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ marginBottom: 48 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: COLORS.secondary,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontSize: 34,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: COLORS.secondary,
                      }}
                    >
                      Key Insights
                    </span>
                  </div>
                  <div
                    style={{
                      width: 224,
                      height: 3,
                      borderRadius: 999,
                      background: GRADIENT_ACCENT,
                    }}
                  />
                </motion.div>

                {/* Card-news style key points */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  {keyPoints.map((point, idx) => {
                    const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                    return (
                      <motion.div
                        key={`${point}-${idx}`}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.3 + idx * 0.25,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        style={{
                          position: "relative",
                          borderRadius: 16,
                          backgroundColor: color.bg,
                          border: `1px solid ${color.border}`,
                          overflow: "hidden",
                        }}
                      >
                        {/* Left accent bar */}
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 8,
                            backgroundColor: color.bar,
                            borderTopLeftRadius: 16,
                            borderBottomLeftRadius: 16,
                          }}
                        />

                        <div
                          style={{
                            paddingLeft: 48,
                            paddingRight: 40,
                            paddingTop: 32,
                            paddingBottom: 32,
                          }}
                        >
                          {/* Point label */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginBottom: 16,
                            }}
                          >
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: color.bar,
                              }}
                            />
                            <span
                              style={{
                                fontFamily: DISPLAY_FONT,
                                fontSize: 24,
                                fontWeight: 600,
                                color: COLORS.mutedForeground,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                              }}
                            >
                              Point {idx + 1}
                            </span>
                          </div>

                          {/* Point text */}
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              delay: 0.5 + idx * 0.25,
                              duration: 0.5,
                            }}
                            style={{
                              margin: 0,
                              fontSize: 36,
                              lineHeight: 1.5,
                              fontWeight: 700,
                            }}
                          >
                            {point}
                          </motion.p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Featured tickers */}
                {featuredTickers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.5 }}
                    style={{ marginTop: 40 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginBottom: 24,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: COLORS.primary,
                          animation:
                            "shortyPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: DISPLAY_FONT,
                          fontSize: 26,
                          fontWeight: 600,
                          color: COLORS.mutedForeground,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        Featured Tickers
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 20,
                      }}
                    >
                      {featuredTickers.map((t, idx) => {
                        const tc =
                          TICKER_COLORS[idx % TICKER_COLORS.length];
                        return (
                          <motion.div
                            key={t.ticker}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 1.8 + idx * 0.15,
                              duration: 0.4,
                            }}
                            style={{
                              backgroundColor: COLORS.surfaceGlass,
                              backdropFilter: "blur(20px)",
                              border: "1px solid hsl(145 80% 50% / 0.2)",
                              borderRadius: 16,
                              padding: "28px 40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: 20,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: DISPLAY_FONT,
                                  fontSize: 52,
                                  fontWeight: 700,
                                  color: tc.text,
                                  textShadow:
                                    idx === 0
                                      ? "0 0 20px hsl(145 80% 50% / 0.4), 0 0 40px hsl(145 80% 50% / 0.1)"
                                      : undefined,
                                }}
                              >
                                {t.ticker}
                              </span>
                              <span
                                style={{
                                  fontSize: 26,
                                  color: COLORS.mutedForeground,
                                }}
                              >
                                {t.label}
                              </span>
                            </div>
                            <div
                              style={{
                                padding: "12px 24px",
                                borderRadius: 12,
                                backgroundColor: tc.bg,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: DISPLAY_FONT,
                                  fontSize: 26,
                                  fontWeight: 700,
                                  color: tc.tagColor,
                                }}
                              >
                                {t.tag}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </AbsoluteFill>
          ) : null}

          {/* ═══════════════ CLOSING SECTION ═══════════════ */}
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

              {/* Top decorative line */}
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
                {/* Date badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    borderRadius: 999,
                    padding: "20px 48px",
                    backgroundColor: "hsl(35 95% 55% / 0.15)",
                    border: "1px solid hsl(35 95% 55% / 0.3)",
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
                    {closingEventDate}
                  </span>
                </motion.div>

                {/* Label */}
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
                      backgroundColor: COLORS.accent,
                      animation:
                        "shortyPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontSize: 30,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: COLORS.accent,
                    }}
                  >
                    Next Week Key Event
                  </span>
                </motion.div>

                {/* Main event title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                  style={{
                    margin: 0,
                    fontSize: 72,
                    fontWeight: 900,
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                    maxWidth: 900,
                  }}
                >
                  {closingEventName}
                </motion.h1>

                {/* Sub description */}
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
                  {closingDetail}
                </motion.p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    marginTop: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 44,
                      fontWeight: 700,
                      color: COLORS.primary,
                      textShadow:
                        "0 0 20px hsl(145 80% 50% / 0.4), 0 0 40px hsl(145 80% 50% / 0.1)",
                    }}
                  >
                    구독
                  </span>
                  <span
                    style={{
                      fontSize: 44,
                      color: COLORS.mutedForeground,
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{
                      fontSize: 44,
                      fontWeight: 700,
                      color: COLORS.secondary,
                    }}
                  >
                    좋아요
                  </span>
                  <span
                    style={{
                      fontSize: 44,
                      color: COLORS.mutedForeground,
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{
                      fontSize: 44,
                      fontWeight: 700,
                      color: COLORS.accent,
                    }}
                  >
                    알림설정
                  </span>
                </motion.div>
              </div>

              {/* Bottom decoration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 200,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 2,
                      backgroundColor: "hsl(35 95% 55% / 0.3)",
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "hsl(35 95% 55% / 0.5)",
                    }}
                  />
                  <div
                    style={{
                      width: 64,
                      height: 2,
                      backgroundColor: "hsl(35 95% 55% / 0.3)",
                    }}
                  />
                </div>
              </motion.div>
            </AbsoluteFill>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </AbsoluteFill>
  );
};
