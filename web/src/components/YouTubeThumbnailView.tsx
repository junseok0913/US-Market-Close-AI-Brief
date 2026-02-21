'use client';

import type { Slide } from '@/types/slide';
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
import type { TitleSlide as TitleSlideType } from '@/types/slide';

interface YouTubeThumbnailViewProps {
  episodeDate: string;
  slideIndex?: number;
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

function formatKoreanDate(dateString: string): string {
  const normalized = dateString.trim();

  const dashed = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dashed) {
    const [, year, month, day] = dashed;
    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  }

  const compact = normalized.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    const [, year, month, day] = compact;
    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  }

  return normalized;
}

function renderTitleThumbnail(slide: TitleSlideType) {
  const formattedDate = formatKoreanDate(slide.date);

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#f6f5ef]">
      <div
        className="relative h-full w-full overflow-hidden bg-[radial-gradient(145%_120%_at_10%_0%,#fffbe3_0%,#fff5cc_42%,#ffeeb3_100%)]"
        data-testid="yt-thumbnail-ready"
      >
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,#f59e0b15_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b10_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto flex h-full w-full max-w-[1920px] items-center px-3 py-3">
          <section className="h-full w-full rounded-[28px] border border-[#e7b754] bg-[#fff8df] px-16 py-12 shadow-[0_18px_52px_rgba(146,64,14,0.12)]">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-[clamp(18px,1.2vw,24px)] font-semibold uppercase tracking-[0.22em] text-[#9a3412]">
                  US MARKET CLOSE BRIEFING
                </p>

                <div className="mt-5 inline-flex items-center rounded-full bg-[#ffe8aa] px-6 py-2.5 text-[clamp(36px,2.6vw,46px)] font-black text-[#b45309]">
                  {formattedDate}
                </div>

                <h1 className="mt-8 text-[clamp(96px,7.2vw,132px)] font-black leading-[1.01] tracking-[-0.04em] text-[#b45309]">
                  미국 주식 장마감 브리핑
                </h1>

                <p className="mt-8 max-w-[1560px] text-[clamp(48px,3.75vw,64px)] font-bold leading-[1.16] tracking-[-0.03em] text-[#1f2937]">
                  {slide.nutshell}
                </p>
              </div>

              <div className="h-4 w-full rounded-full bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#ea580c]" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function YouTubeThumbnailView({
  episodeDate,
  slideIndex = 0,
}: YouTubeThumbnailViewProps) {
  const slides = getSlides(episodeDate);
  const safeIndex = Math.min(Math.max(slideIndex, 0), Math.max(slides.length - 1, 0));
  const targetSlide = slides[safeIndex];

  if (targetSlide?.type === 'title') {
    return renderTitleThumbnail(targetSlide);
  }

  return (
    <main className="h-screen w-screen bg-slate-100 p-6">
      <div
        className="mx-auto h-full w-full max-w-[1920px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        data-testid="yt-thumbnail-ready"
      >
        {targetSlide ? renderSlide(targetSlide) : null}
      </div>
    </main>
  );
}
