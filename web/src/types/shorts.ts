export type ShortsPhase =
  | 'hook'
  | 'market'
  | 'insight'
  | 'ticker'
  | 'signal'
  | 'watch'
  | 'finale';

export type ShortsTheme = 'alert' | 'bear' | 'bull' | 'neutral' | 'macro' | 'flash';

export interface ShortsSlide {
  id: number;
  phase: ShortsPhase;
  theme: ShortsTheme;
  startSec: number;
  endSec: number;
  eyebrow: string;
  headline: string;
  subheadline?: string;
  body?: string;
  bullets: string[];
  tickers: string[];
  highlights: string[];
}

export interface ShortsCaption {
  id: number;
  startSec: number;
  endSec: number;
  text: string;
}

export interface ShortsSourceDigestItem {
  type: string;
  label: string;
  detail?: string;
}

export interface ShortsEpisode {
  date: string;
  lang: 'ko' | 'en';
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
  };
}

export interface ShortsTimelineFrame {
  path: string;
  duration: number;
}

export interface ShortsTimelineMeta {
  sourceUrl: string;
  totalDuration: number;
  previewSeconds?: number;
  slideCount: number;
  frames: ShortsTimelineFrame[];
  concatFile: string;
}
