import type { FC, ReactNode } from "react";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

import type { ShortsCaption, ShortsSlide, ShortsSourceDigestItem } from "../src/types/shorts";
import "./shorty-fonts.css";

type SectionKind = "hook" | "company" | "closing";
type FirmVariant = "firm" | "theme-firm";

type ThemeFirmExpertRole = "fundamental" | "growth" | "risk" | "sentiment";

interface ThemeFirmExpertSection {
  name: string;
  role: ThemeFirmExpertRole;
  label?: string;
  summary?: string;
  spoken_text?: string;
  slide_points?: string[];
  [key: string]: unknown;
}

interface ThemeFirmCompanyProfile {
  ticker?: string;
  name?: string;
  identity_expert_summary?: string;
  today_expert_summary?: string;
  identity_summary?: string;
  business_model?: string;
  moat?: string;
  why_now?: string;
  key_products?: string[];
  customer_base?: string;
  expert_sections?: ThemeFirmExpertSection[];
  [key: string]: unknown;
}

interface ThemeFirmCompanyMove {
  ticker: string;
  name: string;
  day_change_pct: number;
  day_change_display: string;
  month_change_pct: number;
  month_change_display: string;
  market_cap?: number;
  market_cap_display: string;
  pe_ratio?: number;
  pe_ratio_display: string;
  pbr?: number;
  pbr_display: string;
  roe?: number;
  roe_display: string;
  move_summary: string;
  reason: string;
  slide_points: string[];
  segment_role?: ThemeFirmExpertRole;
  [key: string]: unknown;
}

interface ShortsThemeFirmEpisode {
  date: string;
  lang: "ko" | "en";
  title: string;
  hook: string;
  durationSeconds: number;
  audioFile: string;
  slides: ShortsSlide[];
  captions: ShortsCaption[];
  sourceDigest: ShortsSourceDigestItem[];
  meta: {
    keyPoints: string[];
    featuredTickers: (string | { ticker: string; label?: string; tag?: string })[];
    sceneCount: number;
    companyMoves?: ThemeFirmCompanyMove[];
    companyProfile?: ThemeFirmCompanyProfile;
    variant?: string;
    [key: string]: unknown;
  };
}

export interface ShortsThemeFirmCompositionProps {
  episode: ShortsThemeFirmEpisode;
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

type CompanyMove = ThemeFirmCompanyMove;

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
const OXBLOOD_SOLID = "#2A1218";

const GRADIENT_MAIN_S2 =
  "linear-gradient(180deg, hsl(255 18% 7%) 0%, hsl(260 20% 6%) 50%, hsl(258 16% 8%) 100%)";
const GRADIENT_MAIN_S3 =
  "linear-gradient(180deg, hsl(40 30% 95%) 0%, hsl(38 25% 92%) 50%, hsl(35 20% 89%) 100%)";
const GRADIENT_MAIN_S3_FUNDAMENTAL =
  "linear-gradient(180deg, hsl(42 35% 96%) 0%, hsl(40 28% 93%) 50%, hsl(38 22% 90%) 100%)";
const GRADIENT_MAIN_S3_GROWTH =
  "linear-gradient(180deg, hsl(150 20% 96%) 0%, hsl(148 18% 93%) 50%, hsl(145 15% 90%) 100%)";
const GRADIENT_MAIN_S3_RISK =
  "linear-gradient(180deg, hsl(10 25% 96%) 0%, hsl(8 20% 93%) 50%, hsl(5 18% 90%) 100%)";
const GRADIENT_MAIN_S3_SENTIMENT =
  "linear-gradient(180deg, hsl(215 25% 96%) 0%, hsl(212 20% 93%) 50%, hsl(210 18% 90%) 100%)";
const GRADIENT_THEME_FIRM = GRADIENT_MAIN_S3;

const BACKGROUND_BY_VARIANT: Record<FirmVariant, string> = {
  firm: GRADIENT_MAIN_S2,
  "theme-firm": GRADIENT_THEME_FIRM,
};

const VARIANT_FRAME = {
  firm: {
    rootBackground: "hsl(255 18% 7%)",
    surface: COLORS.surfaceElevated,
    border: COLORS.border,
    hookPattern:
      "repeating-linear-gradient(135deg, hsl(265 70% 60%) 0px, hsl(265 70% 60%) 2px, transparent 2px, transparent 40px)",
    hookBar: "linear-gradient(90deg, hsl(185 75% 48%), hsl(265 70% 60%), hsl(345 75% 58%))",
    hookPillBg: "hsl(185 75% 48% / 0.12)",
    hookPillBorder: "hsl(185 75% 48% / 0.25)",
    hookDot: COLORS.s2Secondary,
    hookLabel: "Stock Picks",
    hookLabelColor: COLORS.s2Secondary,
    closingPattern:
      "repeating-linear-gradient(-135deg, hsl(345 75% 58%) 0px, hsl(345 75% 58%) 2px, transparent 2px, transparent 40px)",
    closingBar: "linear-gradient(90deg, hsl(185 75% 48%), hsl(345 75% 58%), hsl(265 70% 60%))",
    closingDot: COLORS.s2Accent,
    closingLabel: "Wrap Up",
    closingLabelColor: COLORS.s2Accent,
  },
  "theme-firm": {
    rootBackground: "hsl(40 30% 95%)",
    surface: "hsl(40 30% 95%)",
    border: "hsl(35 15% 82%)",
    hookPattern:
      "repeating-linear-gradient(45deg, hsl(35 80% 42%) 0px, hsl(35 80% 42%) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(-45deg, hsl(35 80% 42%) 0px, hsl(35 80% 42%) 1px, transparent 1px, transparent 60px)",
    hookBar: "linear-gradient(90deg, hsl(35 80% 42%), hsl(155 70% 32%), hsl(0 75% 45%), hsl(210 80% 42%))",
    hookPillBg: "hsl(35 80% 42% / 0.10)",
    hookPillBorder: "hsl(35 80% 42% / 0.25)",
    hookDot: "hsl(35 80% 42%)",
    hookLabel: "Expert Analysis",
    hookLabelColor: "hsl(35 80% 42%)",
    closingPattern:
      "repeating-linear-gradient(45deg, hsl(35 80% 42%) 0px, hsl(35 80% 42%) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(-45deg, hsl(35 80% 42%) 0px, hsl(35 80% 42%) 1px, transparent 1px, transparent 60px)",
    closingBar: "linear-gradient(90deg, hsl(35 80% 42%), hsl(155 70% 32%), hsl(0 75% 45%), hsl(210 80% 42%))",
    closingDot: "hsl(35 80% 42%)",
    closingLabel: "Wrap Up",
    closingLabelColor: "hsl(35 80% 42%)",
  },
} as const;

const FIRM_THEMES = [
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

const THEME_FIRM_THEMES = [
  {
    accent: COLORS.s2Primary,
    accentText: COLORS.s2Primary,
    accentBg: "hsl(185 75% 48% / 0.10)",
    accentBorder: "hsl(185 75% 48% / 0.20)",
    dot: COLORS.s2Primary,
    label: "FUNDAMENTAL",
    chartLineUp:
      "M0,30 C20,28 34,22 54,18 C74,14 88,20 108,12 C128,6 146,10 166,8 C184,6 195,3 200,4",
    chartFillUp:
      "M0,30 C20,28 34,22 54,18 C74,14 88,20 108,12 C128,6 146,10 166,8 C184,6 195,3 200,4 L200,40 L0,40 Z",
    chartLineDown:
      "M0,6 C20,8 34,14 54,18 C74,22 88,16 108,24 C128,30 146,26 166,28 C184,30 195,33 200,32",
    chartFillDown:
      "M0,6 C20,8 34,14 54,18 C74,22 88,16 108,24 C128,30 146,26 166,28 C184,30 195,33 200,32 L200,40 L0,40 Z",
  },
  {
    accent: COLORS.s2Secondary,
    accentText: COLORS.s2Secondary,
    accentBg: "hsl(265 70% 60% / 0.10)",
    accentBorder: "hsl(265 70% 60% / 0.20)",
    dot: COLORS.s2Secondary,
    label: "GROWTH",
    chartLineUp:
      "M0,28 C18,29 34,26 52,20 C72,14 92,20 112,12 C132,5 152,8 172,6 C188,4 197,3 200,2",
    chartFillUp:
      "M0,28 C18,29 34,26 52,20 C72,14 92,20 112,12 C132,5 152,8 172,6 C188,4 197,3 200,2 L200,40 L0,40 Z",
    chartLineDown:
      "M0,5 C18,7 34,13 52,17 C72,21 92,15 112,23 C132,29 152,25 172,27 C188,29 197,31 200,30",
    chartFillDown:
      "M0,5 C18,7 34,13 52,17 C72,21 92,15 112,23 C132,29 152,25 172,27 C188,29 197,31 200,30 L200,40 L0,40 Z",
  },
  {
    accent: COLORS.s2Accent,
    accentText: COLORS.s2Accent,
    accentBg: "hsl(345 75% 58% / 0.10)",
    accentBorder: "hsl(345 75% 58% / 0.20)",
    dot: COLORS.s2Accent,
    label: "RISK",
    chartLineUp:
      "M0,32 C24,28 44,22 64,18 C84,14 102,18 122,12 C142,6 160,8 178,5 C190,4 197,2 200,2",
    chartFillUp:
      "M0,32 C24,28 44,22 64,18 C84,14 102,18 122,12 C142,6 160,8 178,5 C190,4 197,2 200,2 L200,40 L0,40 Z",
    chartLineDown:
      "M0,4 C24,8 44,16 64,20 C84,24 102,20 122,28 C142,34 160,30 178,33 C190,35 197,37 200,38",
    chartFillDown:
      "M0,4 C24,8 44,16 64,20 C84,24 102,20 122,28 C142,34 160,30 178,33 C190,35 197,37 200,38 L200,40 L0,40 Z",
  },
  {
    accent: COLORS.s2Primary,
    accentText: COLORS.s2Primary,
    accentBg: "hsl(185 75% 48% / 0.10)",
    accentBorder: "hsl(185 75% 48% / 0.20)",
    dot: COLORS.s2Primary,
    label: "SENTIMENT",
    chartLineUp:
      "M0,29 C18,30 36,25 56,18 C76,11 96,18 116,11 C136,4 156,7 176,5 C190,4 197,4 200,5",
    chartFillUp:
      "M0,29 C18,30 36,25 56,18 C76,11 96,18 116,11 C136,4 156,7 176,5 C190,4 197,4 200,5 L200,40 L0,40 Z",
    chartLineDown:
      "M0,6 C18,8 36,14 56,21 C76,28 96,21 116,28 C136,35 156,32 176,34 C190,35 197,35 200,34",
    chartFillDown:
      "M0,6 C18,8 36,14 56,21 C76,28 96,21 116,28 C136,35 156,32 176,34 C190,35 197,35 200,34 L200,40 L0,40 Z",
  },
] as const;

const THEME_FIRM_ROLE_ORDER: ThemeFirmExpertRole[] = [
  "fundamental",
  "growth",
  "risk",
  "sentiment",
];

const THEME_FIRM_ROLE_LABELS: Record<ThemeFirmExpertRole, string> = {
  fundamental: "펀더멘털",
  growth: "성장 포인트",
  risk: "리스크",
  sentiment: "시장 해석",
};

const THEME_FIRM_TAG_LABELS: Record<ThemeFirmExpertRole, string> = {
  fundamental: "Fundamental",
  growth: "Growth",
  risk: "Risk",
  sentiment: "Sentiment",
};

const THEME_FIRM_PALETTE = {
  base: GRADIENT_MAIN_S3,
  hook: GRADIENT_MAIN_S3,
  closing: GRADIENT_MAIN_S3,
  panel: "hsl(40 30% 95%)",
  panelStrong: "hsl(38 25% 92%)",
  border: "hsl(35 15% 82%)",
  foreground: "hsl(30 15% 15%)",
  muted: "hsl(30 10% 45%)",
  softMuted: "hsl(30 15% 15%)",
  fundamental: "hsl(35 80% 42%)",
  growth: "hsl(155 70% 32%)",
  risk: "hsl(0 75% 45%)",
  sentiment: "hsl(210 80% 42%)",
} as const;

const THEME_FIRM_ROLE_THEME: Record<
  ThemeFirmExpertRole,
  {
    accent: string;
    accentSoft: string;
    accentBorder: string;
    accentGlow: string;
    gradient: string;
    tag: string;
  }
> = {
  fundamental: {
    accent: THEME_FIRM_PALETTE.fundamental,
    accentSoft: withAlpha(THEME_FIRM_PALETTE.fundamental, 0.10),
    accentBorder: withAlpha(THEME_FIRM_PALETTE.fundamental, 0.20),
    accentGlow: withAlpha(THEME_FIRM_PALETTE.fundamental, 0.25),
    gradient: GRADIENT_MAIN_S3_FUNDAMENTAL,
    tag: "FUNDAMENTALS",
  },
  growth: {
    accent: THEME_FIRM_PALETTE.growth,
    accentSoft: withAlpha(THEME_FIRM_PALETTE.growth, 0.10),
    accentBorder: withAlpha(THEME_FIRM_PALETTE.growth, 0.20),
    accentGlow: withAlpha(THEME_FIRM_PALETTE.growth, 0.25),
    gradient: GRADIENT_MAIN_S3_GROWTH,
    tag: "GROWTH",
  },
  risk: {
    accent: THEME_FIRM_PALETTE.risk,
    accentSoft: withAlpha(THEME_FIRM_PALETTE.risk, 0.10),
    accentBorder: withAlpha(THEME_FIRM_PALETTE.risk, 0.20),
    accentGlow: withAlpha(THEME_FIRM_PALETTE.risk, 0.25),
    gradient: GRADIENT_MAIN_S3_RISK,
    tag: "RISK",
  },
  sentiment: {
    accent: THEME_FIRM_PALETTE.sentiment,
    accentSoft: withAlpha(THEME_FIRM_PALETTE.sentiment, 0.10),
    accentBorder: withAlpha(THEME_FIRM_PALETTE.sentiment, 0.20),
    accentGlow: withAlpha(THEME_FIRM_PALETTE.sentiment, 0.25),
    gradient: GRADIENT_MAIN_S3_SENTIMENT,
    tag: "SENTIMENT",
  },
};

interface ThemeFirmTag {
  role: ThemeFirmExpertRole;
  label: string;
}

interface ThemeFirmExpertData {
  name: string;
  role: ThemeFirmExpertRole;
  label: string;
  summary: string;
  spokenText: string;
  slidePoints: string[];
}

function simplifyCompanyName(value: unknown): string {
  const text = compactText(value);
  if (!text) return "";
  const simplified = text
    .replace(/,?\s+(?:incorporated|inc\.?|corporation|corp\.?|company|co\.?|holdings|holding|group|limited|ltd\.?|llc|plc)\s*$/i, "")
    .replace(/\s+class\s+[a-z]\s*$/i, "")
    .trim()
    .replace(/[,\s]+$/, "");
  return simplified || text;
}

function buildThemeFirmTitle(episode: ShortsThemeFirmEpisode): string {
  const companyProfile = episode.meta?.companyProfile;
  const companyMoves = episode.meta?.companyMoves ?? [];
  const fallbackName = companyMoves.length > 0 ? compactText(companyMoves[0]?.name) : "";
  const base =
    simplifyCompanyName(companyProfile?.name) ||
    simplifyCompanyName(fallbackName) ||
    simplifyCompanyName(episode.title) ||
    (compactText(episode.lang).toLowerCase() === "en" ? "Company" : "핵심 기업");
  const suffix = compactText(episode.lang).toLowerCase() === "en" ? "Analysis" : "분석";
  if (/(?:^|\s)(?:분석|analysis)$/i.test(base)) return base;
  return `${base} ${suffix}`.trim();
}

function compactText(value: unknown, fallback = ""): string {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function compactTextWithLimit(value: unknown, fallback: string, maxLen: number): string {
  const text = compactText(value, fallback);
  if (maxLen <= 0 || text.length <= maxLen) return text;
  return `${text.slice(0, Math.max(1, maxLen - 1)).trimEnd()}…`;
}

function withAlpha(color: string, alpha: number): string {
  return color.replace(")", ` / ${alpha})`);
}

function isThemeFirmExpertRole(value: unknown): value is ThemeFirmExpertRole {
  return THEME_FIRM_ROLE_ORDER.includes(String(value).toLowerCase() as ThemeFirmExpertRole);
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

function normalizeThemeFirmExpertSection(value: ThemeFirmExpertSection | Record<string, unknown>): ThemeFirmExpertData | null {
  const role = compactText(value.role).toLowerCase();
  if (!isThemeFirmExpertRole(role)) return null;

  return {
    name: compactText(value.name, role),
    role,
    label: compactText(value.label, THEME_FIRM_ROLE_LABELS[role]),
    summary: compactText(value.summary),
    spokenText: compactText(value.spoken_text, compactText(value.summary)),
    slidePoints: normalizeStringList(value.slide_points, 3),
  };
}

function getThemeFirmCompanyProfile(episode: ShortsThemeFirmEpisode): ThemeFirmCompanyProfile | null {
  if (!episode.meta?.companyProfile || typeof episode.meta.companyProfile !== "object") {
    return null;
  }
  return episode.meta.companyProfile;
}

function buildThemeFirmTags(experts: ThemeFirmExpertData[]): ThemeFirmTag[] {
  const roles = experts
    .map((expert) => expert.role)
    .filter((role, index, list) => list.indexOf(role) === index);
  const orderedRoles = THEME_FIRM_ROLE_ORDER.filter((role) => roles.includes(role));

  const finalRoles = orderedRoles.length > 0 ? orderedRoles : THEME_FIRM_ROLE_ORDER;
  return finalRoles.map((role) => ({
    role,
    label: THEME_FIRM_TAG_LABELS[role],
  }));
}

function resolveThemeFirmExperts(
  slides: ShortsSlide[],
  companyMoves: CompanyMove[],
  profile: ThemeFirmCompanyProfile | null,
): ThemeFirmExpertData[] {
  const rawExpertSections = Array.isArray(profile?.expert_sections) ? profile.expert_sections : [];
  const fromProfile = rawExpertSections
    .map((section) => normalizeThemeFirmExpertSection(section))
    .filter((section): section is ThemeFirmExpertData => Boolean(section));
  const companySlides = slides.filter((slide, index) => resolveSectionKind(slide, index, slides.length) === "company");

  const experts = THEME_FIRM_ROLE_ORDER.map((role, index) => {
    const profileSection =
      fromProfile.find((section) => section.role === role) ||
      fromProfile.find((section) => section.name === `company_${index + 1}`);
    const companyMoveByRole = companyMoves.find((row) => row.segment_role === role);
    const companyMove = companyMoveByRole || companyMoves[index];
    const slide = companySlides[index];
    const slidePoints = normalizeStringList(slide?.bullets, 3);
    const companyPoints = normalizeStringList(companyMove?.slide_points, 3);
    const fallbackSummary = compactText(slide?.body || slide?.subheadline || companyMove?.reason);

    return {
      name: compactText(profileSection?.name, `company_${index + 1}`),
      role,
      label: compactText(profileSection?.label || slide?.eyebrow, THEME_FIRM_ROLE_LABELS[role]),
      summary: compactText(profileSection?.summary, fallbackSummary),
      spokenText: compactText(profileSection?.spokenText, compactText(profileSection?.summary, fallbackSummary)),
      slidePoints:
        profileSection && profileSection.slidePoints.length > 0
          ? profileSection.slidePoints
          : slidePoints.length > 0
            ? slidePoints
            : companyPoints,
    };
  });

  return experts.filter((expert) => expert.slidePoints.length > 0 || expert.summary || expert.spokenText);
}

function getCompanyMoves(episode: ShortsThemeFirmEpisode): CompanyMove[] {
  const raw = episode.meta?.companyMoves;
  if (!Array.isArray(raw)) return [];

  const out: CompanyMove[] = [];
  for (const item of raw) {
    if (!item) continue;
    const row = item;
    const role = compactText(row.segment_role).toLowerCase();
    out.push({
      ticker: compactText(row.ticker),
      name: compactText(row.name, compactText(row.ticker, "Company")),
      day_change_pct: Number(row.day_change_pct || 0),
      day_change_display: compactText(row.day_change_display, "N/A"),
      month_change_pct: Number(row.month_change_pct || 0),
      month_change_display: compactText(row.month_change_display, "N/A"),
      market_cap: Number(row.market_cap || 0),
      market_cap_display: compactText(row.market_cap_display, "N/A"),
      pe_ratio: Number(row.pe_ratio || 0),
      pe_ratio_display: compactText(row.pe_ratio_display, "N/A"),
      pbr: Number(row.pbr || 0),
      pbr_display: compactText(row.pbr_display, "N/A"),
      roe: Number(row.roe || 0),
      roe_display: compactText(row.roe_display, "N/A"),
      move_summary: compactText(row.move_summary, compactText(row.reason, "핵심 기업 동향")),
      reason: compactText(row.reason),
      slide_points: normalizeStringList(row.slide_points, 3),
      segment_role: isThemeFirmExpertRole(role) ? role : undefined,
    });
  }
  return out;
}

function resolveFirmVariant(episode: ShortsThemeFirmEpisode): FirmVariant {
  const raw = episode.meta?.variant;
  return compactText(raw) === "firm" ? "firm" : "theme-firm";
}

function resolveSectionKind(slide: ShortsSlide | undefined, index: number, total: number): SectionKind {
  const phase = compactText(slide?.phase).toLowerCase();
  if (phase === "hook") return "hook";
  if (phase === "finale" || phase === "watch") return "closing";
  if (index === 0) return "hook";
  if (index === total - 1) return "closing";
  return "company";
}

function normalizeSlides(episode: ShortsThemeFirmEpisode, companyMoves: CompanyMove[]): ShortsSlide[] {
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

function numberValue(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildThemeFirmFallbackExpert(
  slide: ShortsSlide | undefined,
  company: CompanyMove,
  index: number,
): ThemeFirmExpertData {
  const role = THEME_FIRM_ROLE_ORDER[Math.max(0, Math.min(THEME_FIRM_ROLE_ORDER.length - 1, index))] ?? "fundamental";
  return {
    name: `company_${index + 1}`,
    role,
    label: compactText(slide?.eyebrow, THEME_FIRM_ROLE_LABELS[role]),
    summary: compactText(slide?.body || slide?.subheadline, company.reason),
    spokenText: compactText(slide?.body || slide?.subheadline, company.reason),
    slidePoints: normalizeStringList(slide?.bullets, 3).length > 0 ? normalizeStringList(slide?.bullets, 3) : company.slide_points,
  };
}

function resolveThemeFirmDisplayTicker(profile: ThemeFirmCompanyProfile | null, company: CompanyMove): string {
  return compactText(profile?.ticker, compactText(company.ticker, "N/A"));
}

function resolveThemeFirmDisplayName(profile: ThemeFirmCompanyProfile | null, company: CompanyMove): string {
  const fromProfile = simplifyCompanyName(profile?.name);
  if (fromProfile) return compactTextWithLimit(fromProfile, fromProfile, 36);
  const fromCompany = simplifyCompanyName(company.name);
  return compactTextWithLimit(fromCompany, compactText(company.name, "Company"), 36);
}

const ThemeFirmExpertTags: FC<{
  tags: ThemeFirmTag[];
  context?: "hook" | "closing";
}> = ({ tags, context = "hook" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: context === "hook" ? 1.6 : 0.6, duration: 0.5 }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: context === "hook" ? 16 : 12,
      marginTop: context === "hook" ? 16 : 0,
      justifyContent: "center",
    }}
  >
    {tags.map((tag) => {
      const palette = THEME_FIRM_ROLE_THEME[tag.role];
      return (
        <span
          key={`${tag.role}-${tag.label}`}
          style={{
            padding: context === "hook" ? "12px 24px" : "10px 20px",
            borderRadius: 999,
            fontSize: context === "hook" ? 22 : 20,
            fontWeight: 700,
            border: `1px solid ${withAlpha(palette.accent, 0.25)}`,
            background: palette.accentSoft,
            color: palette.accent,
          }}
        >
          {compactTextWithLimit(tag.label, THEME_FIRM_TAG_LABELS[tag.role], 18)}
        </span>
      );
    })}
  </motion.div>
);

const ThemeFirmHookSection: FC<{
  date: string;
  title: string;
  hook: string;
  ticker: string;
  companyName: string;
  tags: ThemeFirmTag[];
}> = ({ date, title, hook, ticker, companyName, tags }) => {
  const accentBar =
    `linear-gradient(90deg, ${THEME_FIRM_PALETTE.fundamental}, ${THEME_FIRM_PALETTE.growth}, ${THEME_FIRM_PALETTE.risk}, ${THEME_FIRM_PALETTE.sentiment})`;

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
        color: THEME_FIRM_PALETTE.foreground,
      }}
    >
      <AbsoluteFill style={{ background: THEME_FIRM_PALETTE.hook }} />

      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          width: 800,
          height: 800,
          borderRadius: "50%",
          opacity: 0.06,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${THEME_FIRM_PALETTE.fundamental}, transparent 70%)`,
        }}
      />

      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.02,
          backgroundImage:
            `repeating-linear-gradient(45deg, ${THEME_FIRM_PALETTE.fundamental} 0px, ${THEME_FIRM_PALETTE.fundamental} 1px, transparent 1px, transparent 60px), repeating-linear-gradient(-45deg, ${THEME_FIRM_PALETTE.fundamental} 0px, ${THEME_FIRM_PALETTE.fundamental} 1px, transparent 1px, transparent 60px)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.02 }}
        transition={{ duration: 1.5 }}
      />

      <motion.div
        style={{
          position: "absolute",
          top: 220,
          left: 56,
          right: 56,
          height: 5,
          borderRadius: 999,
          background: accentBar,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            borderRadius: 999,
            padding: "20px 56px",
            background: withAlpha(THEME_FIRM_PALETTE.fundamental, 0.10),
            border: `1px solid ${withAlpha(THEME_FIRM_PALETTE.fundamental, 0.25)}`,
          }}
        >
          <span style={{ fontFamily: MONO_FONT, fontSize: 42, letterSpacing: "0.25em", fontWeight: 700 }}>
            {formatDotDate(date)}
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
              background: THEME_FIRM_PALETTE.fundamental,
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
              color: THEME_FIRM_PALETTE.fundamental,
            }}
          >
            Expert Analysis
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
          style={{ position: "relative" }}
        >
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 140,
              fontWeight: 900,
              color: THEME_FIRM_PALETTE.fundamental,
              lineHeight: 1,
              textShadow: `0 0 60px ${withAlpha(THEME_FIRM_PALETTE.fundamental, 0.3)}`,
            }}
          >
            {compactTextWithLimit(ticker, "N/A", 8)}
          </span>
          <p style={{ margin: "8px 0 0 0", fontSize: 32, color: THEME_FIRM_PALETTE.muted, fontWeight: 500 }}>
            {compactTextWithLimit(companyName, "Company", 28)}
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
          style={{ margin: 0, maxWidth: 920, fontSize: 52, lineHeight: 1.3, letterSpacing: "-0.01em", fontWeight: 900 }}
        >
          {compactTextWithLimit(title, "핵심 기업 분석", 40)}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{ margin: 0, maxWidth: 860, fontSize: 32, lineHeight: 1.65, color: THEME_FIRM_PALETTE.muted, fontWeight: 500 }}
        >
          {compactTextWithLimit(hook, "오늘 장 핵심 기업을 전문가 시각으로 정리합니다.", 92)}
        </motion.p>

        <ThemeFirmExpertTags tags={tags} context="hook" />
      </div>
    </AbsoluteFill>
  );
};

const ThemeFirmExpertHeader: FC<{
  expert: ThemeFirmExpertData;
  index: number;
  total: number;
}> = ({ expert, index, total }) => {
  const palette = THEME_FIRM_ROLE_THEME[expert.role];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{ marginBottom: 8 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 4 }}>
        <div>
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: palette.accent,
            }}
          >
            {palette.tag}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <span style={{ fontSize: 22, color: THEME_FIRM_PALETTE.muted, fontFamily: MONO_FONT }}>
              {index + 1}/{total}
            </span>
            <span style={{ fontSize: 22, color: THEME_FIRM_PALETTE.muted }}>·</span>
            <span style={{ fontSize: 22, fontWeight: 600, color: palette.accent }}>
              {compactTextWithLimit(expert.label, THEME_FIRM_ROLE_LABELS[expert.role], 18)}
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          height: 4,
          width: 224,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${palette.accent}, transparent)`,
        }}
      />
    </motion.div>
  );
};

const ThemeFirmTickerHeader: FC<{
  ticker: string;
  companyName: string;
  role: ThemeFirmExpertRole;
  rightElement?: ReactNode;
}> = ({ ticker, companyName, role, rightElement }) => {
  const palette = THEME_FIRM_ROLE_THEME[role];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6 }}
      style={{ display: "flex", alignItems: "center", gap: 20 }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 72,
            fontWeight: 900,
            color: palette.accent,
            lineHeight: 1,
            textShadow: `0 0 30px ${palette.accentGlow}`,
          }}
        >
          {compactTextWithLimit(ticker, "N/A", 10)}
        </span>
        <span style={{ fontSize: 26, color: THEME_FIRM_PALETTE.muted, fontWeight: 500, marginTop: 4 }}>
          {compactTextWithLimit(companyName, "Company", 30)}
        </span>
      </div>
      {rightElement ? <div style={{ marginLeft: "auto" }}>{rightElement}</div> : null}
    </motion.div>
  );
};

const ThemeFirmSlidePoints: FC<{
  points: string[];
  role: ThemeFirmExpertRole;
  baseDelay?: number;
}> = ({ points, role, baseDelay = 0.7 }) => {
  const palette = THEME_FIRM_ROLE_THEME[role];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {points.map((point, idx) => (
        <motion.div
          key={`${role}-point-${idx}`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: baseDelay + idx * 0.18, duration: 0.5 }}
          style={{
            position: "relative",
            borderRadius: 24,
            border: `1px solid ${palette.accentBorder}`,
            background: palette.accentSoft,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 10,
              background: palette.accent,
            }}
          />
          <div style={{ padding: "18px 24px 18px 40px" }}>
            <p style={{ margin: 0, fontSize: 34, lineHeight: 1.45, color: THEME_FIRM_PALETTE.foreground, fontWeight: 700 }}>
              {compactTextWithLimit(point, point, 54)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const ThemeFirmFundamentalLayout: FC<{
  expert: ThemeFirmExpertData;
  company: CompanyMove;
  ticker: string;
  companyName: string;
}> = ({ expert, company, ticker, companyName }) => {
  const palette = THEME_FIRM_ROLE_THEME.fundamental;
  const radarMetrics = [
    { label: "수익성", value: clamp(numberValue(company.roe, 15) * 3, 10, 100) },
    { label: "가치", value: clamp(numberValue(company.pe_ratio, 0) > 0 ? Math.max(10, 100 - numberValue(company.pe_ratio) * 1.5) : 50, 10, 100) },
    { label: "안정성", value: clamp(80 - Math.abs(numberValue(company.day_change_pct)) * 8, 20, 100) },
    { label: "성장", value: clamp(50 + numberValue(company.month_change_pct) * 3, 10, 100) },
    { label: "규모", value: clamp(numberValue(company.market_cap) > 100e9 ? 90 : numberValue(company.market_cap) > 10e9 ? 70 : 40, 20, 100) },
  ];
  const metrics = [
    { label: "시가총액", value: compactText(company.market_cap_display, "N/A"), colored: false },
    { label: "PER", value: compactText(company.pe_ratio_display, "N/A"), colored: false },
    { label: "PBR", value: compactText(company.pbr_display, "N/A"), colored: false },
    { label: "ROE", value: compactText(company.roe_display, "N/A"), colored: false },
    { label: "일간", value: compactText(company.day_change_display, "N/A"), colored: true, pct: numberValue(company.day_change_pct) },
    { label: "월간", value: compactText(company.month_change_display, "N/A"), colored: true, pct: numberValue(company.month_change_pct) },
  ];
  const cx = 150;
  const cy = 140;
  const maxR = 110;
  const radarPoints = radarMetrics.map((metric, idx) => {
    const angle = (Math.PI * 2 * idx) / radarMetrics.length - Math.PI / 2;
    const radius = (metric.value / 100) * maxR;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), label: metric.label };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 24 }}>
      <ThemeFirmTickerHeader ticker={ticker} companyName={companyName} role="fundamental" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        style={{
          borderRadius: 16,
          border: `1px solid ${palette.accentBorder}`,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 20,
          background: palette.accentSoft,
        }}
      >
        <svg viewBox="0 0 300 280" style={{ width: 340, height: 320, flexShrink: 0 }}>
          {[0.25, 0.5, 0.75, 1].map((level) => {
            const points = radarMetrics.map((_, idx) => {
              const angle = (Math.PI * 2 * idx) / radarMetrics.length - Math.PI / 2;
              const radius = level * maxR;
              return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
            });
            return (
              <polygon key={level} points={points.join(" ")} fill="none" stroke={THEME_FIRM_PALETTE.softMuted} strokeOpacity={0.08} strokeWidth={1} />
            );
          })}
          {radarMetrics.map((_, idx) => {
            const angle = (Math.PI * 2 * idx) / radarMetrics.length - Math.PI / 2;
            return (
              <line
                key={`axis-${idx}`}
                x1={cx}
                y1={cy}
                x2={cx + maxR * Math.cos(angle)}
                y2={cy + maxR * Math.sin(angle)}
                stroke={THEME_FIRM_PALETTE.softMuted}
                strokeOpacity={0.06}
              />
            );
          })}
          <motion.polygon
            points={radarPoints.map((point) => `${point.x},${point.y}`).join(" ")}
            fill={palette.accent}
            fillOpacity={0.15}
            stroke={palette.accent}
            strokeWidth={3}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          {radarPoints.map((point, idx) => {
            const angle = (Math.PI * 2 * idx) / radarMetrics.length - Math.PI / 2;
            const labelRadius = maxR + 24;
            const lx = cx + labelRadius * Math.cos(angle);
            const ly = cy + labelRadius * Math.sin(angle);
            return (
              <g key={`point-${idx}`}>
                <motion.circle cx={point.x} cy={point.y} r={5} fill={palette.accent} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + idx * 0.1 }} />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={THEME_FIRM_PALETTE.softMuted}
                  fillOpacity={0.6}
                  fontSize={16}
                  fontWeight={700}
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
          {radarMetrics.map((metric, idx) => (
            <div key={`metric-bar-${metric.label}`} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 72, fontSize: 22, color: THEME_FIRM_PALETTE.muted, fontWeight: 600 }}>{metric.label}</span>
              <div style={{ flex: 1, height: 14, borderRadius: 999, background: withAlpha(THEME_FIRM_PALETTE.foreground, 0.05), overflow: "hidden" }}>
                <motion.div
                  style={{ height: "100%", borderRadius: 999, background: palette.accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ delay: 0.6 + idx * 0.1, duration: 0.8 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}
      >
        {metrics.map((metric, idx) => (
          <motion.div
            key={`fundamental-grid-${metric.label}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.06, duration: 0.4 }}
            style={{
              borderRadius: 16,
              border: `1px solid ${palette.accentBorder}`,
              padding: 14,
              textAlign: "center",
              background: palette.accentSoft,
            }}
          >
            <div style={{ fontSize: 20, color: THEME_FIRM_PALETTE.muted, marginBottom: 4, fontWeight: 600, letterSpacing: "0.06em" }}>
              {metric.label}
            </div>
            <div
              style={{
                fontFamily: MONO_FONT,
                fontWeight: 900,
                fontSize: 36,
                color: metric.colored ? (numberValue(metric.pct) >= 0 ? COLORS.gain : COLORS.loss) : palette.accent,
              }}
            >
              {metric.value}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div style={{ marginTop: 24, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <ThemeFirmSlidePoints points={expert.slidePoints} role="fundamental" baseDelay={0.7} />
      </div>
    </div>
  );
};

const ThemeFirmGrowthLayout: FC<{
  expert: ThemeFirmExpertData;
  company: CompanyMove;
  ticker: string;
  companyName: string;
}> = ({ expert, company, ticker, companyName }) => {
  const monthPct = numberValue(company.month_change_pct);
  const dayPct = numberValue(company.day_change_pct);
  const isMonthPositive = monthPct >= 0;
  const isDayPositive = dayPct >= 0;
  const arcPct = clamp(Math.abs(monthPct) * 6, 5, 100);
  const arcLen = (arcPct / 100) * 251;
  const maxAbsPct = Math.max(Math.abs(dayPct), Math.abs(monthPct), 1);
  const dayBarWidth = (Math.abs(dayPct) / maxAbsPct) * 100;
  const monthBarWidth = (Math.abs(monthPct) / maxAbsPct) * 100;
  const momentumLabel =
    monthPct > 0 && dayPct > 0
      ? "상승 가속"
      : monthPct > 0 && dayPct < 0
        ? "모멘텀 둔화"
        : monthPct < 0 && dayPct > 0
          ? "반등 시도"
          : "하락 지속";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 24 }}>
      <ThemeFirmTickerHeader
        ticker={ticker}
        companyName={companyName}
        role="growth"
        rightElement={
          <motion.div style={{ position: "relative" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
            <svg viewBox="0 0 100 100" style={{ width: 160, height: 160 }}>
              <circle cx={50} cy={50} r={40} fill="none" stroke={THEME_FIRM_PALETTE.softMuted} strokeOpacity={0.06} strokeWidth={8} />
              <motion.circle
                cx={50}
                cy={50}
                r={40}
                fill="none"
                stroke={isMonthPositive ? COLORS.gain : COLORS.loss}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={`${arcLen} ${251 - arcLen}`}
                style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
                initial={{ strokeDasharray: "0 251" }}
                animate={{ strokeDasharray: `${arcLen} ${251 - arcLen}` }}
                transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: MONO_FONT, fontSize: 34, fontWeight: 900, color: isMonthPositive ? COLORS.gain : COLORS.loss }}>
                {compactText(company.month_change_display, "N/A")}
              </span>
              <span style={{ fontSize: 17, color: THEME_FIRM_PALETTE.muted, fontWeight: 700, letterSpacing: "0.06em" }}>
                월간
              </span>
            </div>
          </motion.div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        style={{
          borderRadius: 24,
          border: `1px solid ${THEME_FIRM_ROLE_THEME.growth.accentBorder}`,
          padding: 24,
          background: THEME_FIRM_ROLE_THEME.growth.accentSoft,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <span style={{ fontSize: 38, fontWeight: 900, color: THEME_FIRM_ROLE_THEME.growth.accent }}>{momentumLabel}</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: THEME_FIRM_PALETTE.muted }}>일간 변동</span>
            <span style={{ fontFamily: MONO_FONT, fontSize: 38, fontWeight: 900, color: isDayPositive ? COLORS.gain : COLORS.loss }}>
              {compactText(company.day_change_display, "N/A")}
            </span>
          </div>
          <div style={{ height: 26, borderRadius: 999, background: withAlpha(THEME_FIRM_PALETTE.foreground, 0.05), overflow: "hidden" }}>
            <motion.div
              style={{
                height: "100%",
                borderRadius: 999,
                background: isDayPositive ? COLORS.gain : COLORS.loss,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${dayBarWidth}%` }}
              transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: THEME_FIRM_PALETTE.muted }}>월간 변동</span>
            <span style={{ fontFamily: MONO_FONT, fontSize: 38, fontWeight: 900, color: isMonthPositive ? COLORS.gain : COLORS.loss }}>
              {compactText(company.month_change_display, "N/A")}
            </span>
          </div>
          <div style={{ height: 26, borderRadius: 999, background: withAlpha(THEME_FIRM_PALETTE.foreground, 0.05), overflow: "hidden" }}>
            <motion.div
              style={{
                height: "100%",
                borderRadius: 999,
                background: isMonthPositive ? COLORS.gain : COLORS.loss,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${monthBarWidth}%` }}
              transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      <div style={{ marginTop: 24, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <ThemeFirmSlidePoints points={expert.slidePoints} role="growth" baseDelay={0.8} />
      </div>
    </div>
  );
};

const ThemeFirmRiskLayout: FC<{
  expert: ThemeFirmExpertData;
  company: CompanyMove;
  ticker: string;
  companyName: string;
}> = ({ expert, company, ticker, companyName }) => {
  const dayDrop = Math.abs(numberValue(company.day_change_pct));
  const riskLevel = Math.min(100, dayDrop * 12);
  const arcLen = (riskLevel / 100) * 188;
  const riskLabel = riskLevel > 70 ? "HIGH RISK" : riskLevel > 40 ? "MODERATE" : "LOW";
  const riskTextColor = riskLevel > 70 ? COLORS.loss : riskLevel > 40 ? THEME_FIRM_ROLE_THEME.risk.accent : COLORS.gain;
  const isDayWorse = numberValue(company.day_change_pct) < numberValue(company.month_change_pct);
  const stripe = `repeating-linear-gradient(90deg, ${THEME_FIRM_ROLE_THEME.risk.accent} 0px, ${THEME_FIRM_ROLE_THEME.risk.accent} 20px, transparent 20px, transparent 40px)`;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 24 }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, opacity: 0.6, background: stripe }} />

      <ThemeFirmTickerHeader
        ticker={ticker}
        companyName={companyName}
        role="risk"
        rightElement={
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            style={{ fontFamily: MONO_FONT, fontSize: 52, fontWeight: 900, color: COLORS.loss }}
          >
            {compactText(company.day_change_display, "N/A")}
          </motion.div>
        }
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          borderRadius: 24,
          border: `1px solid ${THEME_FIRM_ROLE_THEME.risk.accentBorder}`,
          padding: 24,
          background: THEME_FIRM_ROLE_THEME.risk.accentSoft,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 16 }}>
          <div style={{ position: "relative", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg viewBox="0 0 140 80" style={{ width: 260, height: 145 }}>
              <path d="M10,75 A60,60 0 0,1 130,75" fill="none" stroke={THEME_FIRM_PALETTE.softMuted} strokeOpacity={0.08} strokeWidth={12} strokeLinecap="round" />
              <motion.path
                d="M10,75 A60,60 0 0,1 130,75"
                fill="none"
                stroke={THEME_FIRM_ROLE_THEME.risk.accent}
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={`${arcLen} 188`}
                initial={{ strokeDasharray: "0 188" }}
                animate={{ strokeDasharray: `${arcLen} 188` }}
                transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              style={{ marginTop: 8, fontSize: 32, fontWeight: 900, letterSpacing: "0.2em", color: riskTextColor }}
            >
              {riskLabel}
            </motion.span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
            <span style={{ fontSize: 34, fontWeight: 900, textAlign: "center", color: isDayWorse ? COLORS.loss : THEME_FIRM_ROLE_THEME.risk.accent }}>
              {isDayWorse ? "급격한 악화" : "추세 유지"}
            </span>
            <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, color: THEME_FIRM_PALETTE.muted, fontWeight: 600 }}>일간</div>
                <div style={{ fontFamily: MONO_FONT, fontSize: 34, fontWeight: 900, color: numberValue(company.day_change_pct) >= 0 ? COLORS.gain : COLORS.loss }}>
                  {compactText(company.day_change_display, "N/A")}
                </div>
              </div>
              <div style={{ fontSize: 32, color: withAlpha(THEME_FIRM_PALETTE.muted, 0.3), alignSelf: "center" }}>vs</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, color: THEME_FIRM_PALETTE.muted, fontWeight: 600 }}>월간</div>
                <div style={{ fontFamily: MONO_FONT, fontSize: 34, fontWeight: 900, color: numberValue(company.month_change_pct) >= 0 ? COLORS.gain : COLORS.loss }}>
                  {compactText(company.month_change_display, "N/A")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ marginTop: 24, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <ThemeFirmSlidePoints points={expert.slidePoints} role="risk" baseDelay={0.8} />
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, opacity: 0.6, background: stripe }} />
    </div>
  );
};

const ThemeFirmSentimentLayout: FC<{
  expert: ThemeFirmExpertData;
  company: CompanyMove;
  ticker: string;
  companyName: string;
}> = ({ expert, company, ticker, companyName }) => {
  const isBearish = numberValue(company.day_change_pct) < 0;
  const sentimentPct = clamp(50 + numberValue(company.day_change_pct) * 8, 0, 100);
  const gaugeAngle = (sentimentPct / 100) * 180;
  const needleRadians = ((gaugeAngle - 90) * Math.PI) / 180;
  const needleLength = 75;
  const cx = 120;
  const cy = 100;
  const needleX = cx + needleLength * Math.cos(needleRadians);
  const needleY = cy + needleLength * Math.sin(needleRadians);
  const moodLabel =
    sentimentPct < 20 ? "극도의 공포" :
    sentimentPct < 40 ? "공포" :
    sentimentPct < 60 ? "중립" :
    sentimentPct < 80 ? "탐욕" : "극도의 탐욕";
  const shiftDirection = numberValue(company.day_change_pct) > numberValue(company.month_change_pct) ? "개선" : "악화";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 24 }}>
      <ThemeFirmTickerHeader
        ticker={ticker}
        companyName={companyName}
        role="sentiment"
        rightElement={
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            style={{
              fontSize: 64,
              borderRadius: 20,
              padding: "8px 16px",
              background: isBearish ? "hsl(0 75% 55% / 0.10)" : "hsl(145 80% 50% / 0.10)",
              color: isBearish ? COLORS.loss : COLORS.gain,
              fontWeight: 900,
            }}
          >
            {isBearish ? "BEAR" : "BULL"}
          </motion.div>
        }
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        style={{
          borderRadius: 24,
          border: `1px solid ${THEME_FIRM_ROLE_THEME.sentiment.accentBorder}`,
          padding: 24,
          background: THEME_FIRM_ROLE_THEME.sentiment.accentSoft,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "0.15em", color: THEME_FIRM_ROLE_THEME.sentiment.accent, marginBottom: 12 }}>
          공포 & 탐욕 지수
        </span>
        <svg viewBox="0 0 240 130" style={{ width: 440, height: 220 }}>
          {[
            { start: -180, color: "hsl(0 80% 50%)" },
            { start: -144, color: "hsl(20 70% 50%)" },
            { start: -108, color: "hsl(45 60% 50%)" },
            { start: -72, color: "hsl(80 60% 45%)" },
            { start: -36, color: "hsl(120 65% 40%)" },
          ].map((segment, idx) => {
            const radius = 90;
            const startAngle = (segment.start * Math.PI) / 180;
            const endAngle = ((segment.start + 36) * Math.PI) / 180;
            const x1 = cx + radius * Math.cos(startAngle);
            const y1 = cy + radius * Math.sin(startAngle);
            const x2 = cx + radius * Math.cos(endAngle);
            const y2 = cy + radius * Math.sin(endAngle);
            return (
              <path
                key={`gauge-${idx}`}
                d={`M${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2}`}
                fill="none"
                stroke={segment.color}
                strokeWidth={16}
                strokeOpacity={0.35}
              />
            );
          })}
          <motion.line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke={THEME_FIRM_PALETTE.foreground}
            strokeWidth={3.5}
            strokeLinecap="round"
            initial={{ x2: cx, y2: cy - needleLength }}
            animate={{ x2: needleX, y2: needleY }}
            transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
          />
          <circle cx={cx} cy={cy} r={8} fill={THEME_FIRM_ROLE_THEME.sentiment.accent} />
          <text x={22} y={108} fill="hsl(0 80% 50%)" fontSize={14} fontWeight={700}>공포</text>
          <text x={190} y={108} fill="hsl(120 65% 40%)" fontSize={14} fontWeight={700}>탐욕</text>
        </svg>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}
        >
          <span style={{ fontSize: 40, fontWeight: 900, color: isBearish ? COLORS.loss : COLORS.gain }}>
            {moodLabel}
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          borderRadius: 24,
          border: `1px solid ${THEME_FIRM_ROLE_THEME.sentiment.accentBorder}`,
          padding: 20,
          background: THEME_FIRM_ROLE_THEME.sentiment.accentSoft,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: shiftDirection === "개선" ? COLORS.gain : COLORS.loss }}>
            심리 {shiftDirection}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
            <div>
              <span style={{ fontSize: 22, color: THEME_FIRM_PALETTE.muted, fontWeight: 600 }}>일간</span>
              <span style={{ marginLeft: 8, fontFamily: MONO_FONT, fontSize: 32, fontWeight: 900, color: numberValue(company.day_change_pct) >= 0 ? COLORS.gain : COLORS.loss }}>
                {compactText(company.day_change_display, "N/A")}
              </span>
            </div>
            <span style={{ fontSize: 26, color: withAlpha(THEME_FIRM_PALETTE.muted, 0.4) }}>→</span>
            <div>
              <span style={{ fontSize: 22, color: THEME_FIRM_PALETTE.muted, fontWeight: 600 }}>월간</span>
              <span style={{ marginLeft: 8, fontFamily: MONO_FONT, fontSize: 32, fontWeight: 900, color: numberValue(company.month_change_pct) >= 0 ? COLORS.gain : COLORS.loss }}>
                {compactText(company.month_change_display, "N/A")}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ marginTop: 24, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <ThemeFirmSlidePoints points={expert.slidePoints} role="sentiment" baseDelay={0.8} />
      </div>
    </div>
  );
};

const ThemeFirmExpertSection: FC<{
  expert: ThemeFirmExpertData;
  company: CompanyMove;
  index: number;
  total: number;
  ticker: string;
  companyName: string;
}> = ({ expert, company, index, total, ticker, companyName }) => {
  const palette = THEME_FIRM_ROLE_THEME[expert.role];

  let layout: ReactNode;
  if (expert.role === "fundamental") {
    layout = <ThemeFirmFundamentalLayout expert={expert} company={company} ticker={ticker} companyName={companyName} />;
  } else if (expert.role === "growth") {
    layout = <ThemeFirmGrowthLayout expert={expert} company={company} ticker={ticker} companyName={companyName} />;
  } else if (expert.role === "risk") {
    layout = <ThemeFirmRiskLayout expert={expert} company={company} ticker={ticker} companyName={companyName} />;
  } else {
    layout = <ThemeFirmSentimentLayout expert={expert} company={company} ticker={ticker} companyName={companyName} />;
  }

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        paddingLeft: 56,
        paddingRight: 56,
        paddingTop: 40,
        paddingBottom: 180,
        overflow: "hidden",
        color: THEME_FIRM_PALETTE.foreground,
      }}
    >
      <AbsoluteFill style={{ background: palette.gradient }} />

      <motion.div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: palette.accent,
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          opacity: 0.05,
          background: `radial-gradient(circle, ${palette.accent}, transparent 70%)`,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <ThemeFirmExpertHeader expert={expert} index={index} total={total} />
        {layout}
      </div>
    </AbsoluteFill>
  );
};

const ThemeFirmClosingSection: FC<{
  closingText: string;
  keyPoints: string[];
  ticker: string;
  companyName: string;
  tags: ThemeFirmTag[];
}> = ({ closingText, keyPoints, ticker, companyName, tags }) => {
  const points = normalizeStringList(keyPoints, 4);
  const displayPoints = points.length > 0 ? points : normalizeStringList([closingText], 1);
  const accentBar =
    `linear-gradient(90deg, ${THEME_FIRM_PALETTE.fundamental}, ${THEME_FIRM_PALETTE.growth}, ${THEME_FIRM_PALETTE.risk}, ${THEME_FIRM_PALETTE.sentiment})`;

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
        color: THEME_FIRM_PALETTE.foreground,
      }}
    >
      <AbsoluteFill style={{ background: THEME_FIRM_PALETTE.closing }} />

      <motion.div
        style={{
          position: "absolute",
          bottom: 160,
          left: 56,
          right: 56,
          height: 5,
          borderRadius: 999,
          background: accentBar,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          opacity: 0.04,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${THEME_FIRM_PALETTE.fundamental}, transparent 70%)`,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 40, maxWidth: 920 }}>
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
              background: THEME_FIRM_PALETTE.fundamental,
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
              color: THEME_FIRM_PALETTE.fundamental,
            }}
          >
            Wrap Up
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 80,
              fontWeight: 900,
              color: THEME_FIRM_PALETTE.fundamental,
              lineHeight: 1,
              textShadow: `0 0 40px ${withAlpha(THEME_FIRM_PALETTE.fundamental, 0.25)}`,
            }}
          >
            {compactTextWithLimit(ticker, "N/A", 10)}
          </span>
          <p style={{ margin: "8px 0 0 0", fontSize: 28, color: THEME_FIRM_PALETTE.muted, fontWeight: 500 }}>
            {compactTextWithLimit(companyName, "Company", 30)}
          </p>
        </motion.div>

        <ThemeFirmExpertTags tags={tags} context="closing" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ width: "100%" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {displayPoints.map((point, idx) => {
              const role = tags[idx % Math.max(1, tags.length)]?.role ?? THEME_FIRM_ROLE_ORDER[idx % THEME_FIRM_ROLE_ORDER.length];
              const palette = THEME_FIRM_ROLE_THEME[role];
              return (
                <motion.div
                  key={`closing-takeaway-${idx}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + idx * 0.15, duration: 0.4 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 20, textAlign: "left" }}
                >
                  <div
                    style={{
                      marginTop: 12,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: withAlpha(palette.accent, 0.5),
                      flexShrink: 0,
                    }}
                  />
                  <p style={{ margin: 0, fontSize: 28, lineHeight: 1.5, color: THEME_FIRM_PALETTE.muted, fontWeight: 500 }}>
                    {compactTextWithLimit(point, point, 70)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 24 }}
        >
          <span style={{ fontSize: 44, fontWeight: 700, color: THEME_FIRM_PALETTE.fundamental }}>구독</span>
          <span style={{ fontSize: 44, color: THEME_FIRM_PALETTE.muted }}>·</span>
          <span style={{ fontSize: 44, fontWeight: 700, color: THEME_FIRM_PALETTE.growth }}>좋아요</span>
          <span style={{ fontSize: 44, color: THEME_FIRM_PALETTE.muted }}>·</span>
          <span style={{ fontSize: 44, fontWeight: 700, color: THEME_FIRM_PALETTE.sentiment }}>알림설정</span>
        </motion.div>
      </div>
    </AbsoluteFill>
  );
};

const HookSection: FC<{ date: string; title: string; hook: string; variant: FirmVariant }> = ({
  date,
  title,
  hook,
  variant,
}) => {
  const frameTheme = VARIANT_FRAME[variant];
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
          background: frameTheme.hookPattern,
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
          background: frameTheme.hookBar,
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
            background: frameTheme.hookPillBg,
            border: `1px solid ${frameTheme.hookPillBorder}`,
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
              background: frameTheme.hookDot,
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
              color: frameTheme.hookLabelColor,
            }}
          >
            {frameTheme.hookLabel}
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
        <div style={{ width: 16, height: 16, border: `2px solid ${frameTheme.hookLabelColor}66` }} />
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
  const frameTheme = VARIANT_FRAME[variant];
  const themes = variant === "theme-firm" ? THEME_FIRM_THEMES : FIRM_THEMES;
  const theme = themes[index % themes.length];
  const isPositive = Number(company.day_change_pct || 0) >= 0;
  const isMonthPositive = Number(company.month_change_pct || 0) >= 0;
  const points = normalizeStringList(company.slide_points, 3);
  const finalPoints = points.length > 0 ? points : normalizeStringList([company.reason, company.move_summary], 3);
  const chartLine = isPositive ? theme.chartLineUp : theme.chartLineDown;
  const chartFill = isPositive ? theme.chartFillUp : theme.chartFillDown;
  const isThemeFirm = variant === "theme-firm";
  const companyBackground = isThemeFirm ? OXBLOOD_SOLID : BACKGROUND_BY_VARIANT[variant];
  const surfaceBackground = isThemeFirm
    ? `linear-gradient(180deg, hsl(345 20% 18% / 0.95) 0%, hsl(345 22% 14% / 0.98) 100%)`
    : frameTheme.surface;
  const pointBackground = isThemeFirm
    ? `linear-gradient(180deg, hsl(345 18% 17% / 0.96) 0%, hsl(345 18% 14% / 0.96) 100%)`
    : theme.accentBg;
  const summaryColor = theme.accentText;
  const companyNameColor = COLORS.mutedForeground;
  const trendCardBackground = isThemeFirm
    ? `linear-gradient(180deg, hsl(345 18% 17% / 0.98) 0%, hsl(345 18% 14% / 0.98) 100%)`
    : isPositive
      ? "hsl(145 80% 50% / 0.08)"
      : "hsl(0 75% 55% / 0.08)";
  const trendCardBorder = isThemeFirm
    ? `1px solid ${theme.accentBorder}`
    : `1px solid ${isPositive ? "hsl(145 80% 50% / 0.15)" : "hsl(0 75% 55% / 0.15)"}`;
  const trendTextColor = isThemeFirm ? theme.accentText : isPositive ? COLORS.gain : COLORS.loss;
  const monthTrendBackground = isThemeFirm
    ? trendCardBackground
    : isMonthPositive
      ? "hsl(145 80% 50% / 0.08)"
      : "hsl(0 75% 55% / 0.08)";
  const monthTrendBorder = isThemeFirm
    ? `1px solid ${theme.accentBorder}`
    : `1px solid ${isMonthPositive ? "hsl(145 80% 50% / 0.15)" : "hsl(0 75% 55% / 0.15)"}`;
  const monthTrendTextColor = isThemeFirm ? theme.accentText : isMonthPositive ? COLORS.gain : COLORS.loss;
  const chartStroke = isThemeFirm ? theme.accent : isPositive ? COLORS.gain : COLORS.loss;
  const chartFillColor = isThemeFirm ? theme.accent : isPositive ? COLORS.gain : COLORS.loss;

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
      <AbsoluteFill style={{ background: companyBackground }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: theme.dot }} />
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                paddingLeft: 16,
                paddingRight: 18,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 999,
                background: isThemeFirm ? theme.accentBg : "transparent",
                border: isThemeFirm ? `1px solid ${theme.accentBorder}` : "none",
              }}
            >
              <span style={{ fontFamily: DISPLAY_FONT, fontSize: 32, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.accentText }}>
                {theme.label}
              </span>
            </div>
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
              textShadow: isThemeFirm ? `0 0 28px ${theme.accentBg}` : `0 0 40px ${theme.accent}30`,
            }}
          >
            {compactText(company.ticker, "N/A")}
          </span>
          <p style={{ margin: 0, fontSize: 30, color: companyNameColor, fontWeight: 500 }}>{compactTextWithLimit(company.name, "Company", 48)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <p style={{ margin: 0, fontSize: 36, fontWeight: 700, lineHeight: 1.4, color: summaryColor }}>
            {compactTextWithLimit(company.move_summary, compactText(company.reason, "핵심 변동 요인"), 48)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          style={{
            background: surfaceBackground,
            border: `1px solid ${frameTheme.border}`,
            borderRadius: 24,
            padding: 32,
            marginBottom: 32,
            boxShadow: isThemeFirm ? "0 24px 64px hsl(220 40% 3% / 0.34)" : "none",
            backdropFilter: isThemeFirm ? "blur(8px)" : undefined,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div
              style={{
                borderRadius: 16,
                padding: 20,
                textAlign: "center",
                background: trendCardBackground,
                border: trendCardBorder,
              }}
            >
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>당일</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 48, fontWeight: 900, lineHeight: 1, color: trendTextColor }}>
                {compactText(company.day_change_display, "N/A")}
              </div>
            </div>
            <div
              style={{
                borderRadius: 16,
                padding: 20,
                textAlign: "center",
                background: monthTrendBackground,
                border: monthTrendBorder,
              }}
            >
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>1개월</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 48, fontWeight: 900, lineHeight: 1, color: monthTrendTextColor }}>
                {compactText(company.month_change_display, "N/A")}
              </div>
            </div>
            <div style={{ borderRadius: 16, padding: 20, textAlign: "center", background: pointBackground, border: `1px solid ${theme.accentBorder}` }}>
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>시가총액</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 700, lineHeight: 1, color: theme.accentText }}>
                {compactText(company.market_cap_display, "N/A")}
              </div>
            </div>
            <div style={{ borderRadius: 16, padding: 20, textAlign: "center", background: pointBackground, border: `1px solid ${theme.accentBorder}` }}>
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>PER</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 700, lineHeight: 1, color: theme.accentText }}>
                {compactText(company.pe_ratio_display, "N/A")}
              </div>
            </div>
            <div style={{ borderRadius: 16, padding: 20, textAlign: "center", background: pointBackground, border: `1px solid ${theme.accentBorder}` }}>
              <div style={{ fontSize: 22, color: COLORS.mutedForeground, marginBottom: 8 }}>PBR</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 700, lineHeight: 1, color: theme.accentText }}>
                {compactText(company.pbr_display, "N/A")}
              </div>
            </div>
            <div style={{ borderRadius: 16, padding: 20, textAlign: "center", background: pointBackground, border: `1px solid ${theme.accentBorder}` }}>
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
                  <stop offset="0%" stopColor={chartFillColor} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={chartFillColor} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <motion.path d={chartFill} fill={`url(#firm-grad-${index})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} />
              <motion.path
                d={chartLine}
                fill="none"
                stroke={chartStroke}
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
                background: pointBackground,
                border: `1px solid ${theme.accentBorder}`,
                boxShadow: isThemeFirm ? "0 14px 30px hsl(220 40% 3% / 0.22)" : "none",
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
  const frameTheme = VARIANT_FRAME[variant];

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
          background: frameTheme.closingPattern,
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
          background: frameTheme.closingBar,
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
              background: frameTheme.closingDot,
              animation: "shortyPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
            }}
          />
          <span style={{ fontFamily: DISPLAY_FONT, fontSize: 28, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: frameTheme.closingLabelColor }}>
            {frameTheme.closingLabel}
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
                <div style={{ marginTop: 10, width: 12, height: 12, borderRadius: "50%", background: `${frameTheme.closingLabelColor}66`, flexShrink: 0 }} />
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
        <div style={{ width: 16, height: 16, border: `2px solid ${frameTheme.closingLabelColor}66` }} />
      </motion.div>
    </AbsoluteFill>
  );
};

export const ShortsThemeFirmComposition: FC<ShortsThemeFirmCompositionProps> = ({
  episode,
  audioSrc,
  includeAudio = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  const variant = resolveFirmVariant(episode);
  const displayTitle = variant === "theme-firm" ? buildThemeFirmTitle(episode) : compactText(episode.title, "US Market Close");
  const companyMoves = useMemo(() => getCompanyMoves(episode), [episode]);
  const slides = useMemo(() => normalizeSlides(episode, companyMoves), [episode, companyMoves]);
  const themeFirmProfile = useMemo(() => getThemeFirmCompanyProfile(episode), [episode]);
  const themeFirmExperts = useMemo(
    () => (variant === "theme-firm" ? resolveThemeFirmExperts(slides, companyMoves, themeFirmProfile) : []),
    [companyMoves, slides, themeFirmProfile, variant],
  );
  const themeFirmTags = useMemo(
    () => (variant === "theme-firm" ? buildThemeFirmTags(themeFirmExperts) : []),
    [themeFirmExperts, variant],
  );

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
          market_cap: 0,
          market_cap_display: "N/A",
          pe_ratio: 0,
          pe_ratio_display: "N/A",
          pbr: 0,
          pbr_display: "N/A",
          roe: 0,
          roe_display: "N/A",
          move_summary: compactText(activeSlide?.headline, "핵심 기업 동향"),
          reason: compactText(activeSlide?.body),
          slide_points: normalizeStringList(activeSlide?.bullets, 3),
          segment_role: undefined,
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

  const activeThemeFirmExpert =
    variant === "theme-firm"
      ? themeFirmExperts[Math.max(0, companyIndex)] || buildThemeFirmFallbackExpert(activeSlide, activeCompany, Math.max(0, companyIndex))
      : null;
  const activeThemeFirmCompany =
    variant === "theme-firm" && activeThemeFirmExpert
      ? companyMoves.find((row) => row.segment_role === activeThemeFirmExpert.role) || activeCompany
      : activeCompany;
  const themeFirmTicker = resolveThemeFirmDisplayTicker(themeFirmProfile, activeThemeFirmCompany);
  const themeFirmCompanyName = resolveThemeFirmDisplayName(themeFirmProfile, activeThemeFirmCompany);

  const hookTitle = compactTextWithLimit(
    variant === "theme-firm" ? displayTitle : activeSlide?.headline,
    displayTitle,
    54,
  );
  const hookCopy = compactTextWithLimit(
    variant === "theme-firm" ? episode.hook : activeSlide?.subheadline || activeSlide?.body,
    compactText(episode.hook, "오늘 장 핵심을 빠르게 정리합니다."),
    120,
  );

  const closingText = compactText(
    activeSlide?.body || activeSlide?.subheadline || activeSlide?.headline,
    compactText(episode.meta?.keyPoints?.[0], "오늘 장 핵심 정리"),
  );

  const closingKeyPoints =
    variant === "theme-firm"
      ? normalizeStringList(episode.meta?.keyPoints, 4)
      : normalizeStringList(Array.isArray(activeSlide?.bullets) ? activeSlide?.bullets : [], 3);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: VARIANT_FRAME[variant].rootBackground,
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
            variant === "theme-firm" ? (
              <ThemeFirmHookSection
                date={episode.date}
                title={hookTitle}
                hook={hookCopy}
                ticker={themeFirmTicker}
                companyName={themeFirmCompanyName}
                tags={themeFirmTags}
              />
            ) : (
              <HookSection date={episode.date} title={hookTitle} hook={hookCopy} variant={variant} />
            )
          ) : null}

          {activeSection === "company" ? (
            variant === "theme-firm" && activeThemeFirmExpert ? (
              <ThemeFirmExpertSection
                expert={activeThemeFirmExpert}
                company={activeThemeFirmCompany}
                index={Math.max(0, companyIndex)}
                total={Math.max(1, totalCompanyScenes)}
                ticker={themeFirmTicker}
                companyName={themeFirmCompanyName}
              />
            ) : (
              <CompanySection
                company={activeCompany}
                index={Math.max(0, companyIndex)}
                total={Math.max(1, totalCompanyScenes)}
                variant={variant}
              />
            )
          ) : null}

          {activeSection === "closing" ? (
            variant === "theme-firm" ? (
              <ThemeFirmClosingSection
                closingText={closingText}
                keyPoints={closingKeyPoints}
                ticker={themeFirmTicker}
                companyName={themeFirmCompanyName}
                tags={themeFirmTags}
              />
            ) : (
              <ClosingSection closingText={closingText} keyPoints={closingKeyPoints} variant={variant} />
            )
          ) : null}
        </motion.div>
      </AnimatePresence>
    </AbsoluteFill>
  );
};

export default ShortsThemeFirmComposition;
