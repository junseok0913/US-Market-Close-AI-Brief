import type { FC } from "react";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

import type { ShortsEpisode, ShortsSlide } from "../src/types/shorts";
import "./shorty-fonts.css";

type SectionKind = "hook" | "company" | "closing";
type FirmVariant = "firm" | "theme-firm";

export interface ShortsFirmCompositionProps {
  episode: ShortsEpisode;
  sectionTiming?: {
    sections?: Array<{
      name?: string;
      startSec?: number;
      endSec?: number;
    }>;
  } | null;
  audioSrc?: string;
  includeAudio?: boolean;
}

interface CompanyMove {
  ticker: string;
  name: string;
  day_change_pct: number;
  day_change_display: string;
  month_change_pct: number;
  month_change_display: string;
  market_cap_display: string;
  pe_ratio_display: string;
  pbr_display: string;
  roe_display: string;
  move_summary: string;
  reason: string;
  slide_points: string[];
}

const BASE_FONT = '"Noto Sans KR", sans-serif';
const DISPLAY_FONT = '"Space Grotesk", "Noto Sans KR", sans-serif';
const MONO_FONT = '"JetBrains Mono", monospace';

const COLORS = {
  foreground: "hsl(210 20% 95%)",
  mutedForeground: "hsl(215 15% 55%)",
  surfaceElevated: "hsl(220 18% 12%)",
  border: "hsl(220 15% 18%)",
  gain: "hsl(145 80% 50%)",
  loss: "hsl(0 75% 55%)",
  s2Primary: "hsl(185 75% 48%)",
  s2Secondary: "hsl(265 70% 60%)",
  s2Accent: "hsl(345 75% 58%)",
};

const GRADIENT_MAIN_S2 =
  "linear-gradient(180deg, hsl(255 18% 7%) 0%, hsl(260 20% 6%) 50%, hsl(258 16% 8%) 100%)";
const GRADIENT_THEME_FIRM =
  "linear-gradient(180deg, hsl(198 42% 10%) 0%, hsl(190 38% 8%) 52%, hsl(178 34% 11%) 100%)";

const BACKGROUND_BY_VARIANT: Record<FirmVariant, string> = {
  firm: GRADIENT_MAIN_S2,
  "theme-firm": GRADIENT_THEME_FIRM,
};

const THEMES = [
  {
    accent: COLORS.s2Primary,
    accentText: COLORS.s2Primary,
    accentBg: "hsl(185 75% 48% / 0.10)",
    accentBorder: "hsl(185 75% 48% / 0.20)",
    dot: COLORS.s2Primary,
    label: "PICK 1",
    chartLineUp:
      "M0,32 C20,30 35,24 55,20 C75,16 85,22 105,14 C125,8 145,12 165,10 C180,7 195,4 200,3",
    chartFillUp:
      "M0,32 C20,30 35,24 55,20 C75,16 85,22 105,14 C125,8 145,12 165,10 C180,7 195,4 200,3 L200,40 L0,40 Z",
    chartLineDown:
      "M0,6 C20,8 35,14 55,18 C75,22 85,16 105,24 C125,30 145,26 165,28 C180,31 195,34 200,35",
    chartFillDown:
      "M0,6 C20,8 35,14 55,18 C75,22 85,16 105,24 C125,30 145,26 165,28 C180,31 195,34 200,35 L200,40 L0,40 Z",
  },
  {
    accent: COLORS.s2Secondary,
    accentText: COLORS.s2Secondary,
    accentBg: "hsl(265 70% 60% / 0.10)",
    accentBorder: "hsl(265 70% 60% / 0.20)",
    dot: COLORS.s2Secondary,
    label: "PICK 2",
    chartLineUp:
      "M0,28 C15,30 30,26 50,22 C70,18 90,24 110,16 C130,10 150,14 170,8 C185,6 195,3 200,5",
    chartFillUp:
      "M0,28 C15,30 30,26 50,22 C70,18 90,24 110,16 C130,10 150,14 170,8 C185,6 195,3 200,5 L200,40 L0,40 Z",
    chartLineDown:
      "M0,5 C15,7 30,11 50,15 C70,19 90,13 110,21 C130,27 150,23 170,29 C185,31 195,34 200,32",
    chartFillDown:
      "M0,5 C15,7 30,11 50,15 C70,19 90,13 110,21 C130,27 150,23 170,29 C185,31 195,34 200,32 L200,40 L0,40 Z",
  },
  {
    accent: COLORS.s2Accent,
    accentText: COLORS.s2Accent,
    accentBg: "hsl(345 75% 58% / 0.10)",
    accentBorder: "hsl(345 75% 58% / 0.20)",
    dot: COLORS.s2Accent,
    label: "PICK 3",
    chartLineUp:
      "M0,30 C25,28 40,22 60,18 C80,14 95,20 115,12 C135,6 155,10 175,8 C190,5 200,4 200,3",
    chartFillUp:
      "M0,30 C25,28 40,22 60,18 C80,14 95,20 115,12 C135,6 155,10 175,8 C190,5 200,4 200,3 L200,40 L0,40 Z",
    chartLineDown:
      "M0,3 C25,5 40,11 60,15 C80,19 95,13 115,21 C135,27 155,23 175,25 C190,28 200,29 200,30",
    chartFillDown:
      "M0,3 C25,5 40,11 60,15 C80,19 95,13 115,21 C135,27 155,23 175,25 C190,28 200,29 200,30 L200,40 L0,40 Z",
  },
] as const;

function compactText(value: unknown, fallback = ""): string {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function compactTextWithLimit(value: unknown, fallback: string, maxLen: number): string {
  const text = compactText(value, fallback);
  if (maxLen <= 0 || text.length <= maxLen) return text;
  return `${text.slice(0, Math.max(1, maxLen - 1)).trimEnd()}…`;
}

function normalizeStringList(values: unknown, limit: number): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const text = compactText(value);
    if (!text) continue;
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(text);
    if (out.length >= limit) break;
  }
  return out;
}

function formatDotDate(date: string): string {
  const cleaned = String(date || "").replace(/[^0-9]/g, "");
  if (cleaned.length !== 8) return date;
  return `${cleaned.slice(0, 4)}.${cleaned.slice(4, 6)}.${cleaned.slice(6, 8)}`;
}

function findSlideIndexByTime(slides: ShortsSlide[], currentSec: number): number {
  if (slides.length === 0) return 0;
  for (let i = slides.length - 1; i >= 0; i -= 1) {
    if (currentSec >= Number(slides[i].startSec || 0)) return i;
  }
  return 0;
}

function getCompanyMoves(episode: ShortsEpisode): CompanyMove[] {
  const raw = (episode.meta as Record<string, unknown> | undefined)?.companyMoves;
  if (!Array.isArray(raw)) return [];

  const out: CompanyMove[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    out.push({
      ticker: compactText(row.ticker),
      name: compactText(row.name, compactText(row.ticker, "Company")),
      day_change_pct: Number(row.day_change_pct || 0),
      day_change_display: compactText(row.day_change_display, "N/A"),
      month_change_pct: Number(row.month_change_pct || 0),
      month_change_display: compactText(row.month_change_display, "N/A"),
      market_cap_display: compactText(row.market_cap_display, "N/A"),
      pe_ratio_display: compactText(row.pe_ratio_display, "N/A"),
      pbr_display: compactText(row.pbr_display, "N/A"),
      roe_display: compactText(row.roe_display, "N/A"),
      move_summary: compactText(row.move_summary, compactText(row.reason, "핵심 기업 동향")),
      reason: compactText(row.reason),
      slide_points: normalizeStringList(row.slide_points, 3),
    });
  }
  return out;
}

function resolveFirmVariant(episode: ShortsEpisode): FirmVariant {
  const raw = (episode.meta as Record<string, unknown> | undefined)?.variant;
  return compactText(raw) === "theme-firm" ? "theme-firm" : "firm";
}

function resolveSectionKind(slide: ShortsSlide | undefined, index: number, total: number): SectionKind {
  const phase = compactText(slide?.phase).toLowerCase();
  if (phase === "hook") return "hook";
  if (phase === "finale" || phase === "watch") return "closing";
  if (index === 0) return "hook";
  if (index === total - 1) return "closing";
  return "company";
}

function normalizeSlides(episode: ShortsEpisode, companyMoves: CompanyMove[]): ShortsSlide[] {
  const source = Array.isArray(episode.slides) ? [...episode.slides] : [];
  source.sort((a, b) => Number(a.startSec || 0) - Number(b.startSec || 0));
  if (source.length > 0) return source;

  const duration = Math.max(1, Number(episode.durationSeconds || 59));
  const sceneCount = Math.max(3, companyMoves.length + 2);
  const span = duration / sceneCount;

  const slides: ShortsSlide[] = [];
  for (let i = 0; i < sceneCount; i += 1) {
    const isHook = i === 0;
    const isClosing = i === sceneCount - 1;
    slides.push({
      id: i,
      phase: isHook ? "hook" : isClosing ? "finale" : "insight",
      theme: isHook ? "alert" : isClosing ? "flash" : "neutral",
      startSec: i * span,
      endSec: i === sceneCount - 1 ? duration : (i + 1) * span,
      eyebrow: isHook ? "장마감 쇼츠" : isClosing ? "체크포인트" : "핵심 기업",
      headline: isHook ? compactText(episode.title) : isClosing ? "Wrap Up" : `PICK ${i}`,
      subheadline: isHook ? compactText(episode.hook) : "",
      body: "",
      bullets: [],
      tickers: [],
      highlights: [],
    });
  }
  return slides;
}

const HookSection: FC<{ date: string; title: string; hook: string; variant: FirmVariant }> = ({
  date,
  title,
  hook,
  variant,
}) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 64,
        paddingRight: 64,
        paddingBottom: 180,
        textAlign: "center",
        overflow: "hidden",
        color: COLORS.foreground,
      }}
    >
      <AbsoluteFill style={{ background: BACKGROUND_BY_VARIANT[variant] }} />

      <motion.div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 600,
          height: 600,
          opacity: 0.04,
          background:
            "repeating-linear-gradient(135deg, hsl(265 70% 60%) 0px, hsl(265 70% 60%) 2px, transparent 2px, transparent 40px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ duration: 1.2 }}
      />

      <motion.div
        style={{
          position: "absolute",
          top: 240,
          left: 56,
          right: 56,
          height: 4,
          borderRadius: 999,
          background: "linear-gradient(90deg, hsl(185 75% 48%), hsl(265 70% 60%), hsl(345 75% 58%))",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 56 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            borderRadius: 999,
            padding: "20px 56px",
            background: "hsl(185 75% 48% / 0.12)",
            border: "1px solid hsl(185 75% 48% / 0.25)",
          }}
        >
          <span style={{ fontFamily: MONO_FONT, fontSize: 42, letterSpacing: "0.25em", fontWeight: 700 }}>{formatDotDate(date)}</span>
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
              background: COLORS.s2Secondary,
              animation: "shortyPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
            }}
          />
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: COLORS.s2Secondary,
            }}
          >
            Stock Picks
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
          style={{ margin: 0, maxWidth: 920, fontSize: 64, lineHeight: 1.3, letterSpacing: "-0.01em", fontWeight: 900 }}
        >
          {compactTextWithLimit(title, "US Market Close", 54)}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          style={{ margin: 0, maxWidth: 860, fontSize: 34, lineHeight: 1.65, color: COLORS.mutedForeground, fontWeight: 500 }}
        >
          {compactTextWithLimit(hook, "오늘 미국 증시 핵심 포인트를 빠르게 정리합니다.", 120)}
        </motion.p>
      </div>

      <motion.div
        style={{ position: "absolute", bottom: 180, left: "50%", transform: "translateX(-50%)" }}
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 45 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <div style={{ width: 16, height: 16, border: "2px solid hsl(265 70% 60% / 0.4)" }} />
      </motion.div>
    </AbsoluteFill>
  );
};

const CompanySection: FC<{ company: CompanyMove; index: number; total: number; variant: FirmVariant }> = ({
  company,
  index,
  total,
  variant,
}) => {
  const theme = THEMES[index % THEMES.length];
  const isPositive = Number(company.day_change_pct || 0) >= 0;
  const isMonthPositive = Number(company.month_change_pct || 0) >= 0;
  const points = normalizeStringList(company.slide_points, 3);
  const finalPoints = points.length > 0 ? points : normalizeStringList([company.reason, company.move_summary], 3);
  const chartLine = isPositive ? theme.chartLineUp : theme.chartLineDown;
  const chartFill = isPositive ? theme.chartFillUp : theme.chartFillDown;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        paddingLeft: 56,
        paddingRight: 56,
        paddingTop: 64,
        paddingBottom: 200,
        overflow: "hidden",
        color: COLORS.foreground,
      }}
    >
      <AbsoluteFill style={{ background: BACKGROUND_BY_VARIANT[variant] }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 12 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: theme.dot }} />
            <span style={{ fontFamily: DISPLAY_FONT, fontSize: 32, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.accentText }}>
              {theme.label}
            </span>
            <span style={{ fontFamily: MONO_FONT, fontSize: 24, color: COLORS.mutedForeground }}>{index + 1}/{total}</span>
          </div>
          <div style={{ height: 3, width: 176, borderRadius: 999, background: `linear-gradient(90deg, ${theme.accent}, transparent)` }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 12 }}
        >
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 100,
              fontWeight: 900,
              color: theme.accentText,
              textShadow: `0 0 40px ${theme.accent}30`,
            }}
          >
            {compactText(company.ticker, "N/A")}
          </span>
          <p style={{ margin: 0, fontSize: 30, color: COLORS.mutedForeground, fontWeight: 500 }}>{compactTextWithLimit(company.name, "Company", 48)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <p style={{ margin: 0, fontSize: 36, fontWeight: 700, lineHeight: 1.4, color: theme.accentText }}>
            {compactTextWithLimit(company.move_summary, compactText(company.reason, "핵심 변동 요인"), 60)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          style={{
            background: COLORS.surfaceElevated,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 24,
            padding: 32,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div
              style={{
                borderRadius: 16,
                padding: 20,
                textAlign: "center",
                background: isPositive ? "hsl(145 80% 50% / 0.08)" : "hsl(0 75% 55% / 0.08)",
                border: `1px solid ${isPositive ? "hsl(145 80% 50% / 0.15)" : "hsl(0 75% 55% / 0.15)"}`,
              }}
            >
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>당일</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 48, fontWeight: 900, lineHeight: 1, color: isPositive ? COLORS.gain : COLORS.loss }}>
                {compactText(company.day_change_display, "N/A")}
              </div>
            </div>
            <div
              style={{
                borderRadius: 16,
                padding: 20,
                textAlign: "center",
                background: isMonthPositive ? "hsl(145 80% 50% / 0.08)" : "hsl(0 75% 55% / 0.08)",
                border: `1px solid ${isMonthPositive ? "hsl(145 80% 50% / 0.15)" : "hsl(0 75% 55% / 0.15)"}`,
              }}
            >
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>1개월</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 48, fontWeight: 900, lineHeight: 1, color: isMonthPositive ? COLORS.gain : COLORS.loss }}>
                {compactText(company.month_change_display, "N/A")}
              </div>
            </div>
            <div style={{ borderRadius: 16, padding: 20, textAlign: "center", background: theme.accentBg, border: `1px solid ${theme.accentBorder}` }}>
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>시가총액</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 700, lineHeight: 1, color: theme.accentText }}>
                {compactText(company.market_cap_display, "N/A")}
              </div>
            </div>
            <div style={{ borderRadius: 16, padding: 20, textAlign: "center", background: theme.accentBg, border: `1px solid ${theme.accentBorder}` }}>
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>PER</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 700, lineHeight: 1, color: theme.accentText }}>
                {compactText(company.pe_ratio_display, "N/A")}
              </div>
            </div>
            <div style={{ borderRadius: 16, padding: 20, textAlign: "center", background: theme.accentBg, border: `1px solid ${theme.accentBorder}` }}>
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>PBR</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 700, lineHeight: 1, color: theme.accentText }}>
                {compactText(company.pbr_display, "N/A")}
              </div>
            </div>
            <div style={{ borderRadius: 16, padding: 20, textAlign: "center", background: theme.accentBg, border: `1px solid ${theme.accentBorder}` }}>
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>ROE</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 700, lineHeight: 1, color: theme.accentText }}>
                {compactText(company.roe_display, "N/A")}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, height: 56 }}>
            <svg viewBox="0 0 200 40" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
              <defs>
                <linearGradient id={`firm-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? COLORS.gain : COLORS.loss} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={isPositive ? COLORS.gain : COLORS.loss} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <motion.path d={chartFill} fill={`url(#firm-grad-${index})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} />
              <motion.path
                d={chartLine}
                fill="none"
                stroke={isPositive ? COLORS.gain : COLORS.loss}
                strokeWidth={1.5}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
              />
            </svg>
          </div>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1, justifyContent: "center" }}>
          {finalPoints.map((point, idx) => (
            <motion.div
              key={`${company.ticker}-${idx}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + idx * 0.2, duration: 0.5 }}
              style={{
                position: "relative",
                borderRadius: 16,
                overflow: "hidden",
                background: theme.accentBg,
                border: `1px solid ${theme.accentBorder}`,
              }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: theme.accent }} />
              <div style={{ paddingLeft: 48, paddingRight: 40, paddingTop: 32, paddingBottom: 32 }}>
                <p style={{ margin: 0, fontSize: 36, lineHeight: 1.5, color: COLORS.foreground, fontWeight: 700 }}>
                  {compactTextWithLimit(point, point, 54)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ClosingSection: FC<{ closingText: string; keyPoints: string[]; variant: FirmVariant }> = ({
  closingText,
  keyPoints,
  variant,
}) => {
  const firstSentence = compactText(closingText).split(/[.!?]/)[0] || "오늘 장 핵심 정리";
  const headline = compactTextWithLimit(`${firstSentence}.`, "오늘 장 핵심 정리.", 52);
  const points = normalizeStringList(keyPoints, 3);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 64,
        paddingRight: 64,
        paddingBottom: 180,
        textAlign: "center",
        overflow: "hidden",
        color: COLORS.foreground,
      }}
    >
      <AbsoluteFill style={{ background: BACKGROUND_BY_VARIANT[variant] }} />

      <motion.div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 600,
          height: 600,
          opacity: 0.04,
          background:
            "repeating-linear-gradient(-135deg, hsl(345 75% 58%) 0px, hsl(345 75% 58%) 2px, transparent 2px, transparent 40px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ duration: 1.2 }}
      />

      <motion.div
        style={{
          position: "absolute",
          top: 260,
          left: 56,
          right: 56,
          height: 4,
          borderRadius: 999,
          background: "linear-gradient(90deg, hsl(185 75% 48%), hsl(345 75% 58%), hsl(265 70% 60%))",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 48, maxWidth: 920 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ display: "flex", alignItems: "center", gap: 16 }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: COLORS.s2Accent,
              animation: "shortyPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
            }}
          />
          <span style={{ fontFamily: DISPLAY_FONT, fontSize: 28, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: COLORS.s2Accent }}>
            Wrap Up
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{ margin: 0, fontSize: 56, fontWeight: 900, lineHeight: 1.3 }}
        >
          {headline}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ width: "100%" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {points.map((point, idx) => (
              <motion.div
                key={`closing-point-${idx}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + idx * 0.15, duration: 0.4 }}
                style={{ display: "flex", alignItems: "flex-start", gap: 20, textAlign: "left" }}
              >
                <div style={{ marginTop: 10, width: 12, height: 12, borderRadius: "50%", background: "hsl(345 75% 58% / 0.4)", flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 30, lineHeight: 1.5, color: COLORS.mutedForeground, fontWeight: 500 }}>
                  {compactTextWithLimit(point, point, 56)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 24 }}
        >
          <span style={{ fontSize: 44, fontWeight: 700, color: COLORS.s2Secondary }}>구독</span>
          <span style={{ fontSize: 44, color: COLORS.mutedForeground }}>·</span>
          <span style={{ fontSize: 44, fontWeight: 700, color: COLORS.s2Primary }}>좋아요</span>
          <span style={{ fontSize: 44, color: COLORS.mutedForeground }}>·</span>
          <span style={{ fontSize: 44, fontWeight: 700, color: COLORS.s2Accent }}>알림설정</span>
        </motion.div>
      </div>

      <motion.div
        style={{ position: "absolute", bottom: 180, left: "50%", transform: "translateX(-50%)" }}
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 45 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        <div style={{ width: 16, height: 16, border: "2px solid hsl(345 75% 58% / 0.4)" }} />
      </motion.div>
    </AbsoluteFill>
  );
};

export const ShortsFirmComposition: FC<ShortsFirmCompositionProps> = ({
  episode,
  audioSrc,
  includeAudio = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  const variant = resolveFirmVariant(episode);
  const companyMoves = useMemo(() => getCompanyMoves(episode), [episode]);
  const slides = useMemo(() => normalizeSlides(episode, companyMoves), [episode, companyMoves]);

  const activeSlideIndex = findSlideIndexByTime(slides, currentSec);
  const activeSlide = slides[activeSlideIndex];

  const sectionKinds = slides.map((slide, idx) => resolveSectionKind(slide, idx, slides.length));
  const totalCompanyScenes = sectionKinds.filter((kind) => kind === "company").length;
  let companyIndex = -1;
  for (let i = 0; i <= activeSlideIndex; i += 1) {
    if (sectionKinds[i] === "company") companyIndex += 1;
  }

  const activeSection = sectionKinds[activeSlideIndex] || "company";
  const companyFallback =
    companyMoves.length > 0
      ? companyMoves[Math.max(0, Math.min(companyMoves.length - 1, companyIndex))]
      : {
          ticker: compactText(activeSlide?.tickers?.[0], "N/A"),
          name: compactText(activeSlide?.headline, "Company"),
          day_change_pct: 0,
          day_change_display: "N/A",
          month_change_pct: 0,
          month_change_display: "N/A",
          market_cap_display: "N/A",
          pe_ratio_display: "N/A",
          pbr_display: "N/A",
          roe_display: "N/A",
          move_summary: compactText(activeSlide?.headline, "핵심 기업 동향"),
          reason: compactText(activeSlide?.body),
          slide_points: normalizeStringList(activeSlide?.bullets, 3),
        };

  const activeCompany =
    variant === "theme-firm"
      ? {
          ...companyFallback,
          move_summary: compactText(
            activeSlide?.subheadline || activeSlide?.headline,
            companyFallback.move_summary,
          ),
          reason: compactText(activeSlide?.body || activeSlide?.subheadline, companyFallback.reason),
          slide_points: normalizeStringList(
            Array.isArray(activeSlide?.bullets) ? activeSlide.bullets : companyFallback.slide_points,
            3,
          ),
        }
      : companyIndex >= 0 && companyIndex < companyMoves.length
        ? companyMoves[companyIndex]
        : companyFallback;

  const hookTitle = compactTextWithLimit(activeSlide?.headline, compactText(episode.title, "US Market Close"), 54);
  const hookCopy = compactTextWithLimit(
    activeSlide?.subheadline || activeSlide?.body,
    compactText(episode.hook, "오늘 장 핵심을 빠르게 정리합니다."),
    120,
  );

  const closingText = compactText(
    activeSlide?.body || activeSlide?.subheadline || activeSlide?.headline,
    compactText(episode.meta?.keyPoints?.[0], "오늘 장 핵심 정리"),
  );

  const closingKeyPoints = normalizeStringList(Array.isArray(activeSlide?.bullets) ? activeSlide?.bullets : [], 3);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: variant === "theme-firm" ? "hsl(191 40% 9%)" : "hsl(255 18% 7%)",
        fontFamily: BASE_FONT,
      }}
    >
      {includeAudio && audioSrc ? <Audio src={staticFile(audioSrc.replace(/^\/+/, ""))} /> : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeSlide?.id ?? 0}-${activeSection}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: "absolute", inset: 0 }}
        >
          {activeSection === "hook" ? (
            <HookSection date={episode.date} title={hookTitle} hook={hookCopy} variant={variant} />
          ) : null}

          {activeSection === "company" ? (
            <CompanySection
              company={activeCompany}
              index={Math.max(0, companyIndex)}
              total={Math.max(1, totalCompanyScenes)}
              variant={variant}
            />
          ) : null}

          {activeSection === "closing" ? (
            <ClosingSection closingText={closingText} keyPoints={closingKeyPoints} variant={variant} />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </AbsoluteFill>
  );
};

export default ShortsFirmComposition;
