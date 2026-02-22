'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ShortsEpisode, ShortsSlide } from '@/types/shorts';
import { useEffect, useMemo, useRef, useState } from 'react';

interface YouTubeShortsPlayerProps {
  episode: ShortsEpisode;
  renderMode?: boolean;
  forcedSlideIndex?: number;
}

type ShortsSection = 'hook' | 'data' | 'story' | 'closing';

interface DataCard {
  name: string;
  ticker: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface MetricCard {
  label: string;
  value: string;
  suffix: string;
  tone: 'loss' | 'accent';
}

const PHASE_TO_SECTION: Record<string, ShortsSection> = {
  hook: 'hook',
  market: 'data',
  insight: 'story',
  ticker: 'story',
  signal: 'story',
  watch: 'closing',
  finale: 'closing',
};

const DEFAULT_DATA_CARDS: Array<{ name: string; ticker: string }> = [
  { name: 'S&P 500', ticker: '^GSPC' },
  { name: 'NASDAQ', ticker: '^IXIC' },
  { name: 'DOW', ticker: '^DJI' },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function compactText(value: unknown, fallback = ''): string {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function compactTextWithLimit(value: unknown, fallback: string, maxLen: number): string {
  const text = compactText(value, fallback);
  if (maxLen <= 0 || text.length <= maxLen) return text;
  return `${text.slice(0, Math.max(1, maxLen - 1)).trimEnd()}…`;
}

function formatDotDate(date: string): string {
  const cleaned = String(date || '').replace(/[^0-9]/g, '');
  if (cleaned.length !== 8) return date;
  return `${cleaned.slice(0, 4)}.${cleaned.slice(4, 6)}.${cleaned.slice(6, 8)}`;
}

function findSlideIndexByTime(slides: ShortsSlide[], currentTime: number): number {
  if (slides.length === 0) return 0;
  for (let i = slides.length - 1; i >= 0; i -= 1) {
    if (currentTime >= slides[i].startSec) {
      return i;
    }
  }
  return 0;
}

function sectionFromPhase(phase: string | undefined): ShortsSection {
  return PHASE_TO_SECTION[phase || ''] || 'story';
}

function uniqueTexts(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const cleaned = compactText(value);
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    out.push(cleaned);
  }
  return out;
}

function extractToken(text: string, pattern: RegExp): string {
  const hit = text.match(pattern);
  return hit?.[0] || '';
}

function extractPercentTokens(source: string): string[] {
  return source.match(/[+-]?\d+(?:\.\d+)?%/g) || [];
}

/**
 * Parse pipe-separated segments from subheadline.
 * e.g. "S&P 500 +0.69% | 나스닥 +0.90%" → [{metric: '+0.69%'}, {metric: '+0.90%'}]
 * We intentionally do NOT extract the label here because the index name from
 * free-text is unreliable — we always keep DEFAULT_DATA_CARDS names.
 */
function parsePipePercentSegments(subheadline: string): string[] {
  return subheadline
    .split('|')
    .map((part) => extractToken(part.trim(), /[+-]?\d+(?:\.\d+)?%/))
    .filter(Boolean);
}

function buildDataCards(slide: ShortsSlide | undefined): DataCard[] {
  if (!slide) {
    return DEFAULT_DATA_CARDS.map((item) => ({
      ...item,
      value: '--',
      change: '--',
      isPositive: true,
    }));
  }

  // Priority 1: parse percent values from subheadline pipe segments
  // e.g. "S&P 500 +0.69% | 나스닥 +0.90%"
  const subheadline = compactText(slide.subheadline);
  const pipePercents = parsePipePercentSegments(subheadline);

  // Priority 2: bullet lines that contain a percent
  // e.g. ["S&P 500: +0.69%", "나스닥: +0.90%"]
  const bulletPercents = (slide.bullets || [])
    .map((b) => extractToken(compactText(b), /[+-]?\d+(?:\.\d+)?%/))
    .filter(Boolean);

  // Priority 3: highlights array (e.g. ["+0.69%", "+0.90%"])
  const highlightPercents = (slide.highlights || [])
    .map((h) => extractToken(compactText(h), /[+-]?\d+(?:\.\d+)?%/))
    .filter(Boolean);

  // Priority 4: parse body text for index-specific percent values
  // Matches patterns like "S&P 500은 0.69%", "나스닥은 0.90%", "다우존스는 0.47%"
  const bodyText = compactText(slide.body);
  const bodyPercents: string[] = [];
  const spMatch = bodyText.match(/S.P\s*500[^,]*?(\d+\.\d+)%/i);
  const nasdaqMatch = bodyText.match(/(?:나스닥|NASDAQ)[^,]*?(\d+\.\d+)%/i);
  const dowMatch = bodyText.match(/(?:다우|DOW)[^,]*?(\d+\.\d+)%/i);
  if (spMatch) bodyPercents.push(`+${spMatch[1]}%`);
  if (nasdaqMatch) bodyPercents.push(`+${nasdaqMatch[1]}%`);
  if (dowMatch) bodyPercents.push(`+${dowMatch[1]}%`);

  // Merge in priority order — take the first available source per index
  const changePool = DEFAULT_DATA_CARDS.map((_, idx) => {
    let raw = pipePercents[idx] || bulletPercents[idx] || highlightPercents[idx] || bodyPercents[idx] || '--';
    // Ensure a '+' prefix for positive values (some sources omit it)
    if (raw !== '--' && !raw.startsWith('+') && !raw.startsWith('-')) {
      raw = `+${raw}`;
    }
    return raw;
  });

  return DEFAULT_DATA_CARDS.map((base, idx) => {
    const change = changePool[idx];
    return {
      name: base.name,
      ticker: base.ticker,
      value: change,
      change,
      isPositive: !change.startsWith('-'),
    };
  });
}

function buildMetricCards(slide: ShortsSlide | undefined): MetricCard[] {
  if (!slide) {
    return [
      { label: '핵심 지표 1', value: '--', suffix: '예상치 비교', tone: 'loss' },
      { label: '핵심 지표 2', value: '--', suffix: 'MoM', tone: 'accent' },
    ];
  }

  const bullets = (slide.bullets || []).map((item) => compactText(item)).filter(Boolean);
  const highlights = (slide.highlights || []).map((item) => compactText(item)).filter(Boolean);
  const fallback = uniqueTexts([compactText(slide.subheadline), compactText(slide.body)]).filter(Boolean);
  const numericHighlights = highlights.filter((line) => /[+-]?\d+(?:\.\d+)?%|\$?\d+(?:,\d{3})*(?:\.\d+)?/.test(line));
  const candidates = [...bullets, ...fallback].slice(0, 2);
  if (numericHighlights.length > 0 && candidates.length < 2) {
    candidates.push(...numericHighlights.slice(0, 2 - candidates.length));
  }

  while (candidates.length < 2) {
    candidates.push(`핵심 지표 ${candidates.length + 1}`);
  }

  return candidates.map((line, idx) => {
    const metric = extractToken(line, /[+-]?\d+(?:\.\d+)?%|\$?\d+(?:,\d{3})*(?:\.\d+)?/);
    const label = compactText(line.replace(metric, '').replace(/[():]/g, ''), `핵심 지표 ${idx + 1}`);
    return {
      label,
      value: metric || '--',
      suffix: metric ? compactText(line.replace(metric, '').replace(/[():]/g, ''), idx === 0 ? '예상치 비교' : 'MoM') : compactText(line, idx === 0 ? '예상치 비교' : 'MoM'),
      tone: idx === 0 ? 'loss' : 'accent',
    };
  });
}

function renderHookSection(params: {
  date: string;
  title: string;
  hook: string;
  animated: boolean;
}) {
  const { date, title, hook, animated } = params;

  return (
    <div className="flex h-full flex-col items-center justify-center px-16 text-center relative">
      <div className="absolute inset-0 gradient-main" />

      <motion.div
        className="absolute top-[280px] left-16 right-16 h-[3px] gradient-accent-line rounded-full"
        initial={animated ? { scaleX: 0 } : false}
        animate={{ scaleX: 1 }}
        transition={{ duration: animated ? 0.8 : 0, ease: 'easeOut' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-12">
        <motion.div
          initial={animated ? { opacity: 0, y: -20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animated ? 0.5 : 0 }}
          className="bg-primary-15 border border-primary-30 rounded-full px-12 py-5"
        >
          <span className="font-mono-code text-[40px] tracking-widest text-foreground font-bold">
            {date}
          </span>
        </motion.div>

        <motion.div
          initial={animated ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: animated ? 0.3 : 0, duration: animated ? 0.5 : 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <span className="font-display text-[30px] font-semibold tracking-widest uppercase text-primary glow-text">
            Market Briefing
          </span>
        </motion.div>

        <motion.h1
          initial={animated ? { opacity: 0, y: 30 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animated ? 0.5 : 0, duration: animated ? 0.7 : 0, ease: 'easeOut' }}
          className="text-[64px] font-black leading-[1.25] tracking-tight text-foreground max-w-[900px]"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animated ? 1 : 0, duration: animated ? 0.6 : 0 }}
          className="text-[36px] leading-[1.6] text-muted-foreground max-w-[850px] font-medium"
        >
          {hook}
        </motion.p>
      </div>

      <motion.div
        className="absolute bottom-[200px] left-1/2 -translate-x-1/2"
        initial={animated ? { opacity: 0, scale: 0.8 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: animated ? 1.3 : 0, duration: animated ? 0.5 : 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-16 h-[2px] bg-primary-30" />
          <div className="w-2 h-2 rounded-full bg-primary-50" />
          <div className="w-16 h-[2px] bg-primary-30" />
        </div>
      </motion.div>
    </div>
  );
}

function renderDataSection(params: {
  cards: DataCard[];
  metrics: MetricCard[];
  animated: boolean;
}) {
  const { cards, metrics, animated } = params;

  return (
    <div className="flex flex-col h-full px-14 py-20 relative">
      <div className="absolute inset-0 gradient-main" />

      <div className="relative z-10 flex flex-col h-full">
        <motion.div
          initial={animated ? { opacity: 0, x: -30 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: animated ? 0.5 : 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="font-display text-[26px] font-semibold tracking-widest uppercase text-primary">
              Today&apos;s Market
            </span>
          </div>
          <div className="h-[2px] gradient-accent-line w-48 rounded-full" />
        </motion.div>

        <div className="flex flex-col gap-8 flex-1 justify-center">
          {cards.map((item, idx) => (
            <motion.div
              key={item.ticker}
              initial={animated ? { opacity: 0, x: -50 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: animated ? 0.3 + idx * 0.2 : 0, duration: animated ? 0.6 : 0, ease: 'easeOut' }}
              className="bg-surface-elevated border border-border rounded-2xl p-10 glow-primary"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-[40px] font-bold text-foreground">{item.name}</h3>
                  <span className="font-mono-code text-[22px] text-muted-foreground">{item.ticker}</span>
                </div>
                <motion.div
                  initial={animated ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ delay: animated ? 0.6 + idx * 0.2 : 0, type: 'spring', stiffness: 200 }}
                  className={`px-8 py-3 rounded-xl ${item.isPositive ? 'bg-primary-15' : 'bg-destructive-15'
                    }`}
                >
                  <span
                    className={`font-mono-code text-[36px] font-bold ${item.isPositive ? 'text-gain' : 'text-loss'
                      }`}
                  >
                    {item.change}
                  </span>
                </motion.div>
              </div>
              <div className="font-mono-code text-[52px] font-bold text-foreground">{item.value}</div>
              <div className="flex items-end gap-2 mt-6 h-10">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={`${item.ticker}-${i}`}
                    initial={animated ? { height: 0 } : false}
                    animate={{ height: `${Math.random() * 100}%` }}
                    transition={{ delay: animated ? 0.8 + idx * 0.2 + i * 0.02 : 0, duration: animated ? 0.3 : 0 }}
                    className={`flex-1 rounded-sm ${item.isPositive ? 'bg-primary-30' : 'bg-destructive-30'}`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={animated ? { opacity: 0, y: 30 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animated ? 1.2 : 0, duration: animated ? 0.5 : 0 }}
          className="mt-12 grid grid-cols-2 gap-6"
        >
          {metrics.slice(0, 2).map((metric) => (
            <div key={`${metric.label}-${metric.value}`} className="bg-surface-glass rounded-xl p-8 border border-border">
              <span className="text-[22px] text-muted-foreground block mb-2">{metric.label}</span>
              <span className={`font-mono-code text-[38px] font-bold ${metric.tone === 'loss' ? 'text-loss' : 'text-accent'}`}>
                {metric.value}
              </span>
              {metric.suffix ? (
                <span className="text-[20px] text-muted-foreground ml-3">{metric.suffix}</span>
              ) : null}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function renderStorySection(params: {
  keyPoints: string[];
  featuredTicker: string;
  featuredSubtitle: string;
  featuredBadge: string;
  animated: boolean;
}) {
  const { keyPoints, featuredTicker, featuredSubtitle, featuredBadge, animated } = params;

  return (
    <div className="flex flex-col h-full px-14 pt-14 pb-[220px] relative">
      <div className="absolute inset-0 gradient-main" />

      <div className="relative z-10 flex flex-col h-full">
        <motion.div
          initial={animated ? { opacity: 0, x: -30 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: animated ? 0.5 : 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="font-display text-[26px] font-semibold tracking-widest uppercase text-secondary">
              Key Insights
            </span>
          </div>
          <div className="h-[2px] gradient-accent-line w-48 rounded-full" />
        </motion.div>

        <div className="flex flex-col gap-10 flex-1 justify-center">
          {keyPoints.map((point, idx) => (
            <motion.div
              key={`${point}-${idx}`}
              initial={animated ? { opacity: 0, x: -40 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: animated ? 0.3 + idx * 0.3 : 0, duration: animated ? 0.6 : 0, ease: 'easeOut' }}
              className="flex gap-6 items-start"
            >
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
                <span className="font-display text-[32px] font-bold text-primary">{idx + 1}</span>
              </div>

              <div className="flex-1 bg-surface-elevated border border-border rounded-2xl p-6">
                <motion.p
                  initial={animated ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ delay: animated ? 0.5 + idx * 0.3 : 0, duration: animated ? 0.5 : 0 }}
                  className="text-[30px] leading-[1.5] text-foreground font-medium"
                >
                  {point}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={animated ? { opacity: 0, y: 30 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animated ? 1.8 : 0, duration: animated ? 0.5 : 0 }}
          className="mt-auto bg-surface-glass border border-primary-30 rounded-2xl p-8 glow-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[22px] text-muted-foreground block mb-2">주목 종목</span>
              <span className="font-display text-[48px] font-bold text-primary glow-text">{featuredTicker}</span>
              <span className="text-[26px] text-muted-foreground ml-4">{featuredSubtitle}</span>
            </div>
            <div className="px-8 py-4 rounded-xl bg-primary-15">
              <span className="font-display text-[30px] font-bold text-gain">{featuredBadge}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function renderClosingSection(params: {
  title: string;
  eventDate: string;
  eventName: string;
  eventDetail: string;
  animated: boolean;
}) {
  const { title, eventDate, eventName, eventDetail, animated } = params;

  return (
    <div className="flex flex-col items-center justify-center h-full px-16 text-center relative">
      <div className="absolute inset-0 gradient-main" />

      <div className="relative z-10 flex flex-col items-center gap-14">
        <motion.div
          initial={animated ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={{ duration: animated ? 0.8 : 0 }}
          className="w-64 h-[3px] gradient-accent-line rounded-full"
        />

        <motion.div
          initial={animated ? { opacity: 0, scale: 0.9 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: animated ? 0.3 : 0, duration: animated ? 0.6 : 0 }}
          className="flex flex-col items-center gap-8"
        >
          <h2 className="font-display text-[56px] font-black text-foreground leading-[1.3]">{title}</h2>

          <div className="bg-surface-elevated border border-accent-30 rounded-2xl p-10 max-w-[800px]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              <span className="font-display text-[26px] font-semibold text-accent">{eventDate}</span>
            </div>
            <p className="text-[40px] font-bold text-foreground leading-[1.4]">{eventName}</p>
            <p className="text-[28px] text-muted-foreground mt-4 leading-[1.5]">{eventDetail}</p>
          </div>
        </motion.div>

        <motion.div
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animated ? 0.8 : 0, duration: animated ? 0.5 : 0 }}
          className="flex flex-col items-center gap-6 mt-8"
        >
          <p className="text-[32px] text-muted-foreground font-medium">매일 장마감 후 업데이트됩니다</p>
          <div className="flex items-center gap-4">
            <span className="text-[36px] font-bold text-primary glow-text">구독</span>
            <span className="text-[36px] text-muted-foreground">·</span>
            <span className="text-[36px] font-bold text-secondary">좋아요</span>
            <span className="text-[36px] text-muted-foreground">·</span>
            <span className="text-[36px] font-bold text-accent">알림설정</span>
          </div>
        </motion.div>

        <motion.div
          initial={animated ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={{ delay: animated ? 1 : 0, duration: animated ? 0.8 : 0 }}
          className="w-64 h-[3px] gradient-accent-line rounded-full"
        />
      </div>
    </div>
  );
}

export default function YouTubeShortsPlayer({
  episode,
  renderMode = false,
  forcedSlideIndex,
}: YouTubeShortsPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSyncedTimeRef = useRef(0);

  const slides = useMemo(
    () => [...(episode.slides || [])].sort((a, b) => a.startSec - b.startSec),
    [episode.slides],
  );

  const [queryParams] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        render: false,
        slide: undefined as number | undefined,
        autoplay: true,
        capture: false,
      };
    }

    const params = new URLSearchParams(window.location.search);
    const renderParam = params.get('render');
    const slideParam = params.get('slide');
    const autoplayParam = params.get('autoplay');
    const captureParam = params.get('capture');
    const parsedSlide = slideParam !== null ? Number.parseInt(slideParam, 10) : Number.NaN;

    const autoplayEnabled = autoplayParam === null ? true : autoplayParam === '1' || autoplayParam === 'true';

    return {
      render: renderParam === '1' || renderParam === 'true',
      slide: Number.isFinite(parsedSlide) ? parsedSlide : undefined,
      autoplay: autoplayEnabled,
      capture: captureParam === '1' || captureParam === 'true',
    };
  });

  const audioCandidates = useMemo(() => {
    const candidates = [
      `/audio/shorts/${episode.date}.mp3`,
      episode.audioFile ? `/audio/shorts/${episode.audioFile}` : '',
      episode.audioFile ? `/audio/${episode.audioFile}` : '',
    ].filter(Boolean);
    return Array.from(new Set(candidates));
  }, [episode.audioFile, episode.date]);

  const [audioSrcIndex, setAudioSrcIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(Number(episode.durationSeconds) || 0);
  const [audioError, setAudioError] = useState(false);

  const audioSrc = audioCandidates[Math.min(audioSrcIndex, Math.max(0, audioCandidates.length - 1))];
  const effectiveRenderMode = renderMode || queryParams.render;
  const effectiveForcedSlideIndex = forcedSlideIndex ?? queryParams.slide;

  const autoSlideIndex = useMemo(() => findSlideIndexByTime(slides, currentTime), [slides, currentTime]);

  const currentSlideIndex = useMemo(() => {
    if (!effectiveRenderMode || effectiveForcedSlideIndex === undefined) {
      return autoSlideIndex;
    }
    return clamp(effectiveForcedSlideIndex, 0, Math.max(slides.length - 1, 0));
  }, [autoSlideIndex, effectiveForcedSlideIndex, effectiveRenderMode, slides.length]);

  const activeSlide = slides[currentSlideIndex];
  const section = sectionFromPhase(activeSlide?.phase);
  const animated = !effectiveRenderMode;

  const effectiveDuration = Math.max(duration, Number(episode.durationSeconds) || 0);

  useEffect(() => {
    document.documentElement.dataset.videoRender = '1';
    return () => {
      delete document.documentElement.dataset.videoRender;
    };
  }, []);

  useEffect(() => {
    if (!effectiveRenderMode || typeof window === 'undefined') return;
    (
      window as Window & {
        __YT_SHORTS_RENDER_META?: unknown;
      }
    ).__YT_SHORTS_RENDER_META = {
      slideCount: slides.length,
      duration: Number(episode.durationSeconds) || effectiveDuration,
      slides: slides.map((slide) => ({
        id: slide.id,
        startSec: slide.startSec,
        endSec: slide.endSec,
      })),
    };
  }, [effectiveDuration, effectiveRenderMode, episode.durationSeconds, slides]);

  useEffect(() => {
    if (effectiveRenderMode || !queryParams.autoplay || !audioRef.current) return;

    let cancelled = false;
    let timerId: number | null = null;
    let attempts = 0;

    const tryAutoplay = async () => {
      if (cancelled || !audioRef.current) return;
      attempts += 1;
      try {
        await audioRef.current.play();
        if (cancelled || !audioRef.current) return;
        lastSyncedTimeRef.current = audioRef.current.currentTime;
      } catch {
        if (attempts < 28) {
          timerId = window.setTimeout(() => {
            void tryAutoplay();
          }, 180);
        }
      }
    };

    void tryAutoplay();
    return () => {
      cancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [audioSrc, effectiveRenderMode, queryParams.autoplay]);

  useEffect(() => {
    if (effectiveRenderMode || !audioRef.current) return;

    let rafId = 0;
    let timeoutId: number | null = null;

    const tick = () => {
      const audio = audioRef.current;
      if (!audio) return;

      const nextTime = audio.currentTime;
      if (Math.abs(nextTime - lastSyncedTimeRef.current) >= 0.03) {
        lastSyncedTimeRef.current = nextTime;
        setCurrentTime(nextTime);
      }

      if (audio.ended) return;
      if (audio.paused) {
        timeoutId = window.setTimeout(() => tick(), 140);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [effectiveRenderMode]);

  const handleAudioError = () => {
    const hasNextSource = audioSrcIndex + 1 < audioCandidates.length;
    if (hasNextSource) {
      setAudioSrcIndex((prev) => prev + 1);
      return;
    }
    setAudioError(true);
  };

  const hookDate = formatDotDate(episode.date);
  const hookTitle = compactTextWithLimit(activeSlide?.headline, compactText(episode.title, 'US Market Close'), 34);
  const hookCopy = compactTextWithLimit(activeSlide?.subheadline || activeSlide?.body, compactText(episode.hook), 72);

  const dataCards = useMemo(
    () =>
      buildDataCards(activeSlide).map((card) => ({
        ...card,
        name: compactTextWithLimit(card.name, card.name, 18),
        value: compactTextWithLimit(card.value, card.value, 16),
        change: compactTextWithLimit(card.change, card.change, 12),
      })),
    [activeSlide],
  );
  const metricCards = useMemo(
    () =>
      buildMetricCards(activeSlide).map((metric) => ({
        ...metric,
        label: compactTextWithLimit(metric.label, metric.label, 16),
        value: compactTextWithLimit(metric.value, metric.value, 10),
        suffix: compactTextWithLimit(metric.suffix, metric.suffix, 14),
      })),
    [activeSlide],
  );

  const storyPoints = uniqueTexts([
    ...(episode.meta.keyPoints || []),
  ]).slice(0, 4);
  for (const extra of activeSlide?.bullets || []) {
    if (storyPoints.length >= 4) break;
    const cleaned = compactText(extra);
    if (!cleaned || storyPoints.includes(cleaned)) continue;
    storyPoints.push(cleaned);
  }
  if (storyPoints.length < 4) {
    const bodyText = compactText(activeSlide?.body);
    if (bodyText && !storyPoints.includes(bodyText)) {
      storyPoints.push(bodyText);
    }
  }
  while (storyPoints.length < 4) {
    storyPoints.push(`핵심 포인트 ${storyPoints.length + 1}`);
  }
  for (let i = 0; i < storyPoints.length; i += 1) {
    storyPoints[i] = compactTextWithLimit(storyPoints[i], storyPoints[i], 42);
  }

  const featuredTicker = compactTextWithLimit(activeSlide?.tickers?.[0], compactText(episode.meta.featuredTickers?.[0], 'XRT'), 10);
  const featuredSubtitle = compactTextWithLimit(activeSlide?.subheadline, '소매업종 ETF', 20);
  const featuredBadge = compactTextWithLimit(activeSlide?.highlights?.[0], '시장 평균 상회', 12);

  const closingTitle = compactTextWithLimit(activeSlide?.headline, '다음 주 핵심 변수', 24);
  const closingEventDate = compactTextWithLimit(activeSlide?.eyebrow, '2월 27일 (금)', 18);
  const closingEventName = compactTextWithLimit(activeSlide?.subheadline || activeSlide?.bullets?.[0], '생산자물가지수 (PPI)', 26);
  const closingDetail = compactTextWithLimit(activeSlide?.body || activeSlide?.bullets?.[1], '인플레이션과 시장 방향의 핵심 지표', 52);

  return (
    <div
      className="relative overflow-hidden bg-background text-foreground font-regular"
      style={{
        fontFamily: "'Noto Sans KR', sans-serif",
        width: 1080,
        height: 1920,
      }}
    >
      {!effectiveRenderMode && audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onLoadedMetadata={() => {
            if (!audioRef.current) return;
            setDuration(audioRef.current.duration);
          }}
          onTimeUpdate={() => {
            if (!audioRef.current) return;
            const nextTime = audioRef.current.currentTime;
            lastSyncedTimeRef.current = nextTime;
            setCurrentTime(nextTime);
          }}
          onError={handleAudioError}
        />
      )}

      <div
        data-testid="yt-shorts-render-ready"
        data-slide-index={currentSlideIndex}
        className="relative h-full w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${section}-${activeSlide?.id ?? currentSlideIndex}`}
            className="w-full h-full"
            initial={animated ? { opacity: 0 } : false}
            animate={{ opacity: 1, transition: { duration: animated ? 0.4 : 0 } }}
            exit={animated ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 1 }}
          >
            {section === 'hook' &&
              renderHookSection({
                date: hookDate,
                title: hookTitle,
                hook: hookCopy,
                animated,
              })}

            {section === 'data' &&
              renderDataSection({
                cards: dataCards,
                metrics: metricCards,
                animated,
              })}

            {section === 'story' &&
              renderStorySection({
                keyPoints: storyPoints,
                featuredTicker,
                featuredSubtitle,
                featuredBadge,
                animated,
              })}

            {section === 'closing' &&
              renderClosingSection({
                title: closingTitle,
                eventDate: closingEventDate,
                eventName: closingEventName,
                eventDetail: closingDetail,
                animated,
              })}
          </motion.div>
        </AnimatePresence>
      </div>

      {!effectiveRenderMode && audioError && (
        <div className="absolute bottom-6 left-1/2 z-20 w-[90%] -translate-x-1/2 rounded-xl border border-[#f29a9a]/45 bg-[#2a1111]/90 px-3 py-2 text-center text-[12px] text-[#ffd2d2]">
          오디오를 불러오지 못했습니다. {`web/public/audio/shorts/${episode.date}.mp3`} 파일을 확인하세요.
        </div>
      )}

    </div>
  );
}
