'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Episode, Script } from '@/types/episode';
import type { Slide } from '@/types/slide';
import { formatDateKorean } from '@/lib/format';
import { getSlides } from '@/landing';
import {
  TitleSlide,
  MarketSummarySlide,
  HeadlineSlide,
  ComparisonSlide,
  StatsSlide,
  TickerIntroSlide,
  TickerAnalysisSlide,
  EventsSlide,
  ClosingSlide,
} from './slides';
import { EpisodeRenderProvider } from './EpisodeRenderContext';

interface YouTubeEpisodePlayerProps {
  episode: Episode;
  storageDate?: string;
  renderMode?: boolean;
  forcedSlideIndex?: number;
  renderCurrentTimeSec?: number;
  renderDurationSec?: number;
  renderLeadMs?: number;
}

interface FitSlideCanvasProps {
  slideKey: string | number;
  children: ReactNode;
  minScale?: number;
}

interface SourceSignal {
  key: string;
  title: string;
  subtitle: string;
}

function sourceTypeLabel(sourceType: string): string {
  switch (sourceType) {
    case 'article':
      return 'News';
    case 'chart':
      return 'Chart';
    case 'event':
      return 'Event';
    case 'sec_filing':
      return 'Filing';
    default:
      return sourceType;
  }
}

function buildSourceSignals(scripts: Script[]): SourceSignal[] {
  const signals: SourceSignal[] = [];
  const seen = new Set<string>();

  for (const script of scripts) {
    for (const source of script.sources || []) {
      const rawTitle = source.title?.trim();
      const title = rawTitle || sourceTypeLabel(source.type);
      const subtitleParts = [
        sourceTypeLabel(source.type),
        source.ticker,
        source.date || source.filed_date,
      ].filter(Boolean) as string[];
      const subtitle = subtitleParts.join(' · ');

      const key = `${source.type}|${source.ticker || ''}|${title}|${subtitle}`;
      if (seen.has(key)) continue;
      seen.add(key);

      signals.push({
        key,
        title,
        subtitle,
      });
      if (signals.length >= 8) {
        return signals;
      }
    }
  }

  return signals;
}

function slideTitle(slide: Slide | undefined): string {
  if (!slide) return '브리핑 준비 중';
  switch (slide.type) {
    case 'title':
      return slide.nutshell;
    case 'market-summary':
      return slide.title || '시장 요약';
    case 'headline':
    case 'comparison':
    case 'stats':
    case 'ticker-analysis':
    case 'events':
      return slide.title;
    case 'ticker-intro':
      return `${slide.companyName} (${slide.ticker})`;
    case 'closing':
      return slide.headline;
    default:
      return '브리핑';
  }
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|(?<=다\.)\s+|(?<=요\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function compactText(text: string, limit = 120): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, Math.max(0, limit - 1)).trim()}…`;
}

function buildBullets(text: string, maxItems = 3, limit = 80): string[] {
  return splitSentences(text)
    .slice(0, maxItems)
    .map((sentence) => compactText(sentence, limit))
    .filter(Boolean);
}

function chapterScripts(episode: Episode, chapterName: Episode['chapter'][number]['name']): Script[] {
  const chapter = episode.chapter.find((item) => item.name === chapterName);
  if (!chapter) return [];
  return episode.scripts.filter((script) => script.id >= chapter.start_id && script.id <= chapter.end_id);
}

function inferIndexDirection(text: string, fallbackValue: number): number {
  if (/(하락|급락|하회|밀렸|약세)/.test(text)) return -Math.abs(fallbackValue);
  if (/(상승|반등|급등|올랐|강세)/.test(text)) return Math.abs(fallbackValue);
  return fallbackValue;
}

function extractIndexChange(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern);
  if (!match) return null;
  const value = Number.parseFloat(match[1]);
  if (!Number.isFinite(value)) return null;
  const start = Math.max(0, (match.index ?? 0) - 8);
  const end = Math.min(text.length, (match.index ?? 0) + match[0].length + 24);
  return inferIndexDirection(text.slice(start, end), value);
}

function toIsoDate(compactDate: string): string {
  const cleaned = compactDate.replace(/[^0-9]/g, '');
  if (cleaned.length !== 8) return compactDate;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
}

function buildFallbackIndices(episode: Episode) {
  const combined = episode.scripts.slice(0, 10).map((script) => script.text).join(' ');
  const dow = extractIndexChange(combined, /다우(?:존스)?(?: 산업평균지수)?(?:는)?\s*([0-9]+(?:\.[0-9]+)?)%/);
  const spx = extractIndexChange(combined, /S&P\s*500(?: 지수)?(?:는)?\s*([0-9]+(?:\.[0-9]+)?)%/i);
  const nasdaq = extractIndexChange(combined, /나스닥(?: 지수)?(?:는)?\s*([0-9]+(?:\.[0-9]+)?)%/);

  return [
    { name: 'DOW', value: null, change: null, changePercent: dow ?? 0 },
    { name: 'S&P 500', value: null, change: null, changePercent: spx ?? 0 },
    { name: 'NASDAQ', value: null, change: null, changePercent: nasdaq ?? 0 },
  ];
}

function buildFallbackSlides(episode: Episode, slideDate: string): Slide[] {
  const openingScripts = chapterScripts(episode, 'opening');
  const themeScripts = chapterScripts(episode, 'theme');
  const tickerScripts = chapterScripts(episode, 'ticker');
  const closingScripts = chapterScripts(episode, 'closing');
  const firstTicker = episode.user_tickers[0] || 'TICKER';
  const eventSources = themeScripts
    .flatMap((script) => script.sources || [])
    .filter((source) => source.type === 'event')
    .slice(0, 3);

  const themeAnalystScripts = themeScripts.filter((script) => script.speaker === '해설자').slice(0, 3);
  const tickerAnalystScripts = tickerScripts.filter((script) => script.speaker === '해설자').slice(0, 2);

  const slides: Slide[] = [
    {
      id: 0,
      type: 'title',
      turnId: openingScripts[0]?.id ?? 0,
      date: toIsoDate(slideDate),
      nutshell: episode.nutshell,
      description: compactText(openingScripts[0]?.text || episode.nutshell, 180),
    },
    {
      id: 1,
      type: 'market-summary',
      turnId: openingScripts[1]?.id ?? openingScripts[0]?.id ?? 0,
      title: '오늘의 시장 요약',
      description: compactText(themeScripts[0]?.text || episode.nutshell, 180),
      indices: buildFallbackIndices(episode),
      commodities: [],
      charts: [
        { ticker: 'SP:SPX', title: 'S&P 500' },
        { ticker: 'NASDAQ:IXIC', title: 'NASDAQ' },
      ],
    },
  ];

  for (const [index, script] of themeAnalystScripts.entries()) {
    slides.push({
      id: slides.length,
      type: 'headline',
      turnId: script.id,
      title: index === 0 ? '메인 이슈' : `핵심 포인트 ${index + 1}`,
      subtitle: compactText(splitSentences(script.text)[0] || script.text, 90),
      description: compactText(script.text, 220),
      bullets: buildBullets(script.text),
      theme: index === 0 ? 'red' : 'blue',
    });
  }

  if (tickerAnalystScripts.length > 0) {
    slides.push({
      id: slides.length,
      type: 'ticker-intro',
      turnId: tickerScripts[0]?.id ?? tickerAnalystScripts[0].id,
      ticker: firstTicker,
      companyName: firstTicker,
      currentPrice: 0,
      dayChange: 0,
      dayChangePercent: 0,
      description: compactText(tickerScripts[0]?.text || tickerAnalystScripts[0].text, 180),
      charts: [{ ticker: firstTicker }],
    });
  }

  for (const script of tickerAnalystScripts) {
    slides.push({
      id: slides.length,
      type: 'ticker-analysis',
      turnId: script.id,
      ticker: firstTicker,
      title: compactText(splitSentences(script.text)[0] || `${firstTicker} 분석`, 70),
      points: buildBullets(script.text, 4, 90),
      description: compactText(script.text, 220),
      charts: [{ ticker: firstTicker }],
    });
  }

  slides.push({
    id: slides.length,
    type: 'events',
    turnId: themeAnalystScripts.at(-1)?.id ?? closingScripts[0]?.id ?? episode.scripts.at(-1)?.id ?? 0,
    title: '체크 포인트',
    description: '시장에 영향을 준 이벤트와 다음 확인 포인트를 정리합니다.',
    events: eventSources.length > 0
      ? eventSources.map((source) => ({
          date: source.date || slideDate,
          label: compactText(source.title || '주요 이벤트', 50),
          description: compactText(source.title || '시장 변동성에 영향을 준 이벤트', 90),
        }))
      : [
          {
            date: slideDate,
            label: '주요 이벤트 점검',
            description: compactText(themeScripts[0]?.text || episode.nutshell, 90),
          },
        ],
  });

  slides.push({
    id: slides.length,
    type: 'closing',
    turnId: closingScripts[0]?.id ?? episode.scripts.at(-1)?.id ?? 0,
    headline: compactText(episode.nutshell, 60),
    tagline: compactText(closingScripts.at(-1)?.text || '오늘 브리핑을 마칩니다.', 90),
    description: compactText(closingScripts.map((script) => script.text).join(' '), 220),
  });

  return slides;
}

function renderSlide(slide: Slide) {
  switch (slide.type) {
    case 'title':
      return <TitleSlide slide={slide} />;
    case 'market-summary':
      return <MarketSummarySlide slide={slide} />;
    case 'headline':
      return <HeadlineSlide slide={slide} />;
    case 'comparison':
      return <ComparisonSlide slide={slide} />;
    case 'stats':
      return <StatsSlide slide={slide} />;
    case 'ticker-intro':
      return <TickerIntroSlide slide={slide} />;
    case 'ticker-analysis':
      return <TickerAnalysisSlide slide={slide} />;
    case 'events':
      return <EventsSlide slide={slide} />;
    case 'closing':
      return <ClosingSlide slide={slide} />;
    default:
      return null;
  }
}

function formatClock(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const min = Math.floor(safe / 60);
  const sec = Math.floor(safe % 60);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function FitSlideCanvas({ slideKey, children, minScale = 0.72 }: FitSlideCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    let rafId = 0;
    const measure = () => {
      const viewportW = Math.max(1, viewport.clientWidth - 8);
      const viewportH = Math.max(1, viewport.clientHeight - 8);
      const contentW = Math.max(1, content.scrollWidth);
      const contentH = Math.max(1, content.scrollHeight);

      const nextScale = Math.min(1, viewportW / contentW, viewportH / contentH);
      const boundedScale = Math.max(minScale, nextScale);

      setScale((prev) => (Math.abs(prev - boundedScale) < 0.01 ? prev : boundedScale));
    };

    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    schedule();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => schedule());
      observer.observe(viewport);
      observer.observe(content);

      return () => {
        cancelAnimationFrame(rafId);
        observer.disconnect();
      };
    }

    const intervalId = window.setInterval(measure, 500);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearInterval(intervalId);
    };
  }, [slideKey, minScale]);

  return (
    <div ref={viewportRef} className="h-full w-full overflow-hidden">
      <div
        ref={contentRef}
        className="w-full"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function YouTubeEpisodePlayer({
  episode,
  storageDate,
  renderMode = false,
  forcedSlideIndex,
  renderCurrentTimeSec,
  renderDurationSec,
  renderLeadMs,
}: YouTubeEpisodePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSyncedTimeRef = useRef(0);

  const [queryParams] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        render: false,
        slide: undefined as number | undefined,
        leadMs: 0,
        leadProvided: false,
        autoplay: false,
        capture: false,
      };
    }

    const params = new URLSearchParams(window.location.search);
    const renderParam = params.get('render');
    const slideParam = params.get('slide');
    const leadParam = params.get('leadMs');
    const autoplayParam = params.get('autoplay');
    const captureParam = params.get('capture');
    const parsedSlide = slideParam !== null ? Number.parseInt(slideParam, 10) : Number.NaN;
    const parsedLead = leadParam !== null ? Number.parseInt(leadParam, 10) : Number.NaN;

    return {
      render: renderParam === '1' || renderParam === 'true',
      slide: Number.isFinite(parsedSlide) ? parsedSlide : undefined,
      leadMs: Number.isFinite(parsedLead) ? parsedLead : 0,
      leadProvided: leadParam !== null,
      autoplay: autoplayParam === '1' || autoplayParam === 'true',
      capture: captureParam === '1' || captureParam === 'true',
    };
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Keep hidden on first paint to avoid capture artifacts before URL params are hydrated.
  const [showStartOverlay, setShowStartOverlay] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const effectiveRenderMode = renderMode || queryParams.render;
  const effectiveForcedSlideIndex = forcedSlideIndex ?? queryParams.slide;

  const slideLookupDate = storageDate || episode.date;
  const staticSlides = useMemo(() => getSlides(slideLookupDate), [slideLookupDate]);
  const slides = useMemo(
    () => (staticSlides.length > 0 ? staticSlides : buildFallbackSlides(episode, slideLookupDate)),
    [episode, slideLookupDate, staticSlides],
  );

  const getCurrentTurnId = useCallback(
    (timeInSeconds: number): number => {
      const timeInMs = timeInSeconds * 1000;
      for (let i = episode.scripts.length - 1; i >= 0; i -= 1) {
        const script = episode.scripts[i];
        if (timeInMs >= script.time[0]) {
          return script.id;
        }
      }
      return 0;
    },
    [episode.scripts],
  );

  const effectivePlaybackTime =
    effectiveRenderMode && Number.isFinite(renderCurrentTimeSec)
      ? Math.max(0, renderCurrentTimeSec ?? 0)
      : currentTime;
  const effectiveLeadMs =
    effectiveRenderMode && Number.isFinite(renderLeadMs)
      ? Math.max(0, renderLeadMs ?? 0)
      : queryParams.leadProvided
        ? queryParams.leadMs
        : queryParams.capture
          ? 550
          : 0;
  const effectiveTurnTime = Math.max(0, effectivePlaybackTime + effectiveLeadMs / 1000);
  const currentTurnId = getCurrentTurnId(effectiveTurnTime);

  const autoSlideIndex = useMemo(() => {
    if (slides.length === 0) return 0;

    let slideIndex = 0;
    for (let i = slides.length - 1; i >= 0; i -= 1) {
      if (currentTurnId >= slides[i].turnId) {
        slideIndex = i;
        break;
      }
    }
    return slideIndex;
  }, [currentTurnId, slides]);

  const currentSlideIndex = useMemo(() => {
    if (!effectiveRenderMode || effectiveForcedSlideIndex === undefined) {
      return autoSlideIndex;
    }
    return Math.min(Math.max(effectiveForcedSlideIndex, 0), Math.max(slides.length - 1, 0));
  }, [autoSlideIndex, effectiveForcedSlideIndex, effectiveRenderMode, slides.length]);

  const activeSlide = slides[currentSlideIndex];
  const displayedTurnId = currentTurnId;

  const currentScript = useMemo(
    () => episode.scripts.find((s) => s.id === displayedTurnId),
    [displayedTurnId, episode.scripts],
  );

  const currentScriptIndex = useMemo(
    () => episode.scripts.findIndex((s) => s.id === displayedTurnId),
    [displayedTurnId, episode.scripts],
  );

  const currentScriptWindow = useMemo((): Script[] => {
    if (episode.scripts.length === 0) return [];
    const baseIndex = currentScriptIndex >= 0 ? currentScriptIndex : 0;
    const start = Math.max(0, baseIndex - 1);
    const end = Math.min(episode.scripts.length, baseIndex + 4);
    return episode.scripts.slice(start, end);
  }, [currentScriptIndex, episode.scripts]);

  const scriptedDuration = useMemo(() => {
    const last = episode.scripts.at(-1);
    if (!last || !Array.isArray(last.time)) return 0;
    return Math.max(last.time[1] / 1000, 0);
  }, [episode.scripts]);

  const currentSpeaker = currentScript?.speaker ?? '진행자';

  const currentChapter = useMemo(() => {
    const chapter = episode.chapter.find(
      (item) => displayedTurnId >= item.start_id && displayedTurnId <= item.end_id,
    );
    const map: Record<string, string> = {
      opening: '오프닝',
      theme: '메인 이슈',
      ticker: '종목 분석',
      closing: '클로징',
    };
    return map[chapter?.name ?? 'opening'] || '브리핑';
  }, [displayedTurnId, episode.chapter]);

  const marketSummary = useMemo(
    () =>
      slides.find(
        (slide): slide is Extract<Slide, { type: 'market-summary' }> =>
          slide.type === 'market-summary',
      ),
    [slides],
  );

  const pulseIndices = useMemo(
    () => (marketSummary?.indices ?? []).slice(0, 4),
    [marketSummary],
  );

  const activeSlideStartSec = useMemo(() => {
    if (!activeSlide) return 0;
    const sourceScript = episode.scripts.find((script) => script.id === activeSlide.turnId);
    if (!sourceScript || !Array.isArray(sourceScript.time)) return 0;
    return Math.max(0, sourceScript.time[0] / 1000 - effectiveLeadMs / 1000);
  }, [activeSlide, effectiveLeadMs, episode.scripts]);

  const activeSlideElapsedSec = useMemo(
    () => Math.max(0, effectivePlaybackTime - activeSlideStartSec),
    [activeSlideStartSec, effectivePlaybackTime],
  );

  const sourceSignals = useMemo(
    () => buildSourceSignals(currentScriptWindow),
    [currentScriptWindow],
  );

  const displayTime = useMemo(() => {
    if (!effectiveRenderMode) return effectivePlaybackTime;
    if (!currentScript) return effectivePlaybackTime;
    return Math.max(0, currentScript.time[0] / 1000);
  }, [effectivePlaybackTime, effectiveRenderMode, currentScript]);

  const effectiveDuration =
    effectiveRenderMode && Number.isFinite(renderDurationSec)
      ? Math.max(0, renderDurationSec ?? 0)
      : effectiveRenderMode
        ? scriptedDuration
        : duration;
  const progressPercent =
    effectiveDuration > 0 ? Math.min((displayTime / effectiveDuration) * 100, 100) : 0;

  useEffect(() => {
    if (!effectiveRenderMode) return;
    document.documentElement.dataset.videoRender = '1';
    return () => {
      delete document.documentElement.dataset.videoRender;
    };
  }, [effectiveRenderMode]);

  useEffect(() => {
    if (!effectiveRenderMode || typeof window === 'undefined') return;

    (window as Window & { __YT_RENDER_META?: unknown }).__YT_RENDER_META = {
      slideCount: slides.length,
      slideTurnIds: slides.map((slide) => slide.turnId),
      scripts: episode.scripts.map((script) => ({
        id: script.id,
        time: script.time,
      })),
      duration: scriptedDuration,
    };
  }, [effectiveRenderMode, episode.scripts, scriptedDuration, slides]);

  useEffect(() => {
    if (effectiveRenderMode || !queryParams.autoplay) return;

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
        setShowStartOverlay(false);
      } catch {
        if (cancelled) return;
        if (attempts < 20) {
          timerId = window.setTimeout(() => {
            void tryAutoplay();
          }, 200);
          return;
        }
        setShowStartOverlay(!queryParams.capture);
      }
    };

    void tryAutoplay();

    return () => {
      cancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [effectiveRenderMode, queryParams.autoplay, queryParams.capture]);

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
        timeoutId = window.setTimeout(() => {
          tick();
        }, 120);
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

  const handleStartPlayback = async () => {
    if (!audioRef.current) return;
    // Hide the start overlay immediately on click to avoid first-second capture artifacts.
    setShowStartOverlay(false);
    try {
      await audioRef.current.play();
      lastSyncedTimeRef.current = audioRef.current.currentTime;
    } catch {
      setShowStartOverlay(!queryParams.capture);
      setAudioError(true);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-slate-100 text-slate-900">
      {!effectiveRenderMode && (
        <audio
          ref={audioRef}
          src={`/audio/${episode.date}.mp3`}
          onLoadedMetadata={() => {
            if (!audioRef.current) return;
            setDuration(audioRef.current.duration);
            if (!queryParams.autoplay && !queryParams.capture) {
              setShowStartOverlay(true);
            }
          }}
          onTimeUpdate={() => {
            if (!audioRef.current) return;
            const nextTime = audioRef.current.currentTime;
            lastSyncedTimeRef.current = nextTime;
            setCurrentTime(nextTime);
          }}
          onPlay={() => {
            setShowStartOverlay(false);
          }}
          onPause={() => {
            if (audioRef.current?.ended) return;
          }}
          onEnded={() => undefined}
          onError={() => {
            setAudioError(true);
            setShowStartOverlay(!queryParams.capture);
          }}
        />
      )}

      <div className="absolute inset-0 px-6 py-5">
        <div className="flex h-full flex-col gap-4">
          <header className="shrink-0 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">US Market Close Briefing</p>
                <h1 className="text-3xl font-extrabold text-slate-900">{formatDateKorean(episode.date)}</h1>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-700">
                  Slide {slides.length > 0 ? currentSlideIndex + 1 : 0}/{slides.length}
                </p>
                <p className="text-xs text-slate-500">
                  {formatClock(displayTime)} / {formatClock(effectiveDuration)}
                </p>
                {effectiveRenderMode && <p className="text-[11px] text-slate-400">Video Render Mode</p>}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </header>

          <main className="min-h-0 flex-1">
            <div className="grid h-full grid-cols-12 gap-4">
              <section className="col-span-9 min-h-0 rounded-[26px] border border-slate-200 bg-white p-3 shadow-sm">
                <div
                  data-testid="yt-render-ready"
                  data-slide-index={currentSlideIndex}
                  className="h-full w-full rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  {activeSlide ? (
                    <FitSlideCanvas slideKey={activeSlide.id}>
                      <EpisodeRenderProvider
                        key={activeSlide.id}
                        value={{
                          renderMode: effectiveRenderMode,
                          slideElapsedSec: activeSlideElapsedSec,
                        }}
                      >
                        <div className="mx-auto w-full max-w-[1320px]">{renderSlide(activeSlide)}</div>
                      </EpisodeRenderProvider>
                    </FitSlideCanvas>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl bg-white text-slate-600">
                      이 날짜에 해당하는 슬라이드가 없습니다.
                    </div>
                  )}
                </div>
              </section>

              <aside className="col-span-3 min-h-0 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Now Briefing</p>
                  <p className="mt-2 text-xs font-semibold text-sky-700">{currentChapter} · {currentSpeaker}</p>
                  <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-tight text-slate-900">
                    {slideTitle(activeSlide)}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500">
                    Turn {displayedTurnId} · {formatClock(displayTime)}
                  </p>

                  {pulseIndices.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {pulseIndices.map((idx) => (
                        <div key={idx.name} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                          <p className="truncate text-[11px] text-slate-500">{idx.name}</p>
                          <p
                            className={`text-xs font-semibold ${
                              idx.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {idx.changePercent >= 0 ? '+' : ''}
                            {idx.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex min-h-0 h-[58%] flex-col rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <p className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-slate-500">Live Script</p>
                  <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-auto pr-1">
                    {currentScriptWindow.length > 0 ? (
                      currentScriptWindow.map((script) => {
                        const isCurrent = script.id === displayedTurnId;
                        return (
                          <div
                            key={script.id}
                            className={`rounded-lg border px-3.5 py-2.5 text-[14px] leading-[1.55] ${
                              isCurrent
                                ? 'border-sky-200 bg-sky-50 text-slate-900'
                                : 'border-slate-200 bg-slate-50 text-slate-700'
                            }`}
                          >
                            <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                              {script.speaker}
                            </p>
                            <p className="text-[14px] leading-[1.6] whitespace-pre-wrap">{script.text}</p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500">대본 정보를 불러오는 중입니다.</p>
                    )}
                  </div>
                  {audioError && (
                    <p className="mt-2 shrink-0 text-[11px] text-rose-600">
                      오디오를 불러오지 못했습니다. `/web/public/audio/{episode.date}.mp3`를 확인하세요.
                    </p>
                  )}
                </div>

                <div className="flex min-h-0 h-[30%] flex-col rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <p className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-slate-500">Source Signals</p>
                  <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-auto pr-1">
                    {sourceSignals.length > 0 ? (
                      sourceSignals.map((signal) => (
                        <div
                          key={signal.key}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-2"
                        >
                          <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-slate-700">
                            {signal.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">{signal.subtitle}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">현재 구간의 소스 정보를 준비 중입니다.</p>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>

      {!effectiveRenderMode && showStartOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px]">
          <button
            type="button"
            data-testid="yt-start-playback"
            onClick={handleStartPlayback}
            className="rounded-2xl bg-white px-10 py-5 text-xl font-semibold text-slate-900 shadow-xl transition hover:bg-slate-100"
          >
            재생 시작
          </button>
        </div>
      )}

    </div>
  );
}
