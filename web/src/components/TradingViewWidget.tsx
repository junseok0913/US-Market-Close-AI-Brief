'use client';

import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { usePathname } from 'next/navigation';

interface TradingViewWidgetProps {
  symbol: string;
  aspectRatio?: string;
  minHeight?: number;
  onMarketData?: (data: MarketChartData | null) => void;
}

interface MarketChartPoint {
  t: number;
  c: number;
}

export interface MarketChartData {
  symbol: string;
  providerSymbol: string;
  asOf: string | null;
  currency: string | null;
  exchangeName: string | null;
  points: MarketChartPoint[];
  latest: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'flat';
}

const EMBED_SYMBOL_FALLBACK_MAP: Record<string, string> = {
  // These index symbols are frequently blocked in embedded TradingView widgets.
  'SP:SPX': 'AMEX:SPY',
  '^IXIC': 'NASDAQ:QQQ',
  'NASDAQ:IXIC': 'NASDAQ:QQQ',
  'DJ:DJI': 'AMEX:DIA',
  '^RUT': 'AMEX:IWM',
  'TVC:RUT': 'AMEX:IWM',
  '^TNX': 'NASDAQ:IEF',
  US10Y: 'NASDAQ:IEF',
  'TVC:US10Y': 'NASDAQ:IEF',
  'DX-Y.NYB': 'AMEX:UUP',
  'TVC:DXY': 'AMEX:UUP',
};

const API_ONLY_SYMBOLS = new Set([
  'US10Y',
  'TVC:US10Y',
  'CBOE:TNX',
]);

// NOTE:
// This repo uses `output: "export"` in Next config. Route handlers under `/api/*`
// are not reliable in exported static hosting. Keep API chart fetching opt-in,
// but allow it automatically on localhost/127.0.0.1 for development/capture.
const ENABLE_MARKET_CHART_API = process.env.NEXT_PUBLIC_ENABLE_MARKET_CHART_API === '1';

function normalizeRequestedSymbol(rawSymbol: string): string {
  return (rawSymbol || '').trim().toUpperCase();
}

function normalizeEmbedSymbol(symbol: string): string {
  return EMBED_SYMBOL_FALLBACK_MAP[symbol] || symbol;
}

function extractEpisodeAsOf(pathname: string | null): string | null {
  if (!pathname) return null;

  const match = pathname.match(/^\/(?:youtube\/)?episode\/(\d{8})\/?$/);
  if (!match) return null;

  const compact = match[1];
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function buildChartPaths(points: MarketChartPoint[]): { line: string; area: string } {
  if (points.length < 2) {
    return {
      line: '0,12 100,12',
      area: '0,24 0,12 100,12 100,24',
    };
  }

  const closes = points.map((pt) => pt.c);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = Math.max(max - min, 1e-9);

  const linePairs = points.map((pt, idx) => {
    const x = (idx / (points.length - 1)) * 100;
    const y = 22 - ((pt.c - min) / span) * 18;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const line = linePairs.join(' ');
  const area = `0,24 ${line} 100,24`;

  return { line, area };
}

function formatMarketNumber(value: number): string {
  const abs = Math.abs(value);
  const maximumFractionDigits = abs >= 1000 ? 0 : abs >= 100 ? 1 : 2;
  return value.toLocaleString(undefined, { maximumFractionDigits });
}

function TradingViewWidgetComponent({
  symbol,
  aspectRatio,
  minHeight = 160,
  onMarketData,
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const normalizedSymbol = useMemo(() => normalizeRequestedSymbol(symbol), [symbol]);
  const embedSymbol = useMemo(() => normalizeEmbedSymbol(normalizedSymbol), [normalizedSymbol]);
  const episodeAsOf = useMemo(() => extractEpisodeAsOf(pathname), [pathname]);
  const isDateFixedMode = Boolean(episodeAsOf);
  const [chartData, setChartData] = useState<MarketChartData | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const [useApiFallback, setUseApiFallback] = useState(false);
  const [renderMode] = useState(
    () => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return false;
      }
      const params = new URLSearchParams(window.location.search);
      const renderParam = params.get('render');
      return (
        document.documentElement.dataset.videoRender === '1'
        || renderParam === '1'
        || renderParam === 'true'
      );
    },
  );
  const [apiRuntimeEnabled] = useState(() => {
    if (ENABLE_MARKET_CHART_API) return true;
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  });
  const forceApiChart = useMemo(
    () => API_ONLY_SYMBOLS.has(normalizedSymbol),
    [normalizedSymbol],
  );
  const shouldUseApiChart = apiRuntimeEnabled
    && (renderMode || useApiFallback || forceApiChart || isDateFixedMode);

  const gradientIdBase = useMemo(
    () => normalizedSymbol.replace(/[^a-z0-9_-]/gi, '-').toLowerCase(),
    [normalizedSymbol],
  );
  const chartPaths = useMemo(
    () => buildChartPaths(chartData?.points || []),
    [chartData?.points],
  );
  const trend = chartData?.trend || 'flat';

  useEffect(() => {
    if (!container.current || shouldUseApiChart) return;

    // Clear previous widget
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: embedSymbol,
      interval: 'D',
      timezone: 'America/New_York',
      theme: 'light',
      style: '1',
      locale: 'en',
      hide_top_toolbar: true,
      hide_legend: true,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    });
    script.onerror = () => {
      setUseApiFallback(true);
    };

    container.current.appendChild(script);

    const fallbackTimerId = window.setTimeout(() => {
      if (!container.current) return;
      const hasIframe = Boolean(container.current.querySelector('iframe'));
      if (!hasIframe) {
        setUseApiFallback(true);
      }
    }, 8000);

    return () => {
      window.clearTimeout(fallbackTimerId);
    };
  }, [embedSymbol, shouldUseApiChart]);

  useEffect(() => {
    if (!shouldUseApiChart) return;

    const controller = new AbortController();
    const timeoutMs = 10000;
    let didTimeout = false;
    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, timeoutMs);
    const fetchChart = async () => {
      setChartError(null);
      try {
        const query = new URLSearchParams({
          symbol: normalizedSymbol,
          range: '1mo',
          interval: '1d',
        });
        if (episodeAsOf) {
          query.set('asOf', episodeAsOf);
        }
        const response = await fetch(`/api/market-chart?${query.toString()}`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(body?.error || `HTTP ${response.status}`);
        }
        const body = await response.json() as MarketChartData;
        setChartData(body);
        onMarketData?.(body);
      } catch (error) {
        if (controller.signal.aborted && !didTimeout) return;
        const message = error instanceof Error ? error.message : 'unknown error';
        setChartError(didTimeout ? `request timeout (${timeoutMs}ms)` : message);
        setChartData(null);
        onMarketData?.(null);
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    void fetchChart();
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [normalizedSymbol, shouldUseApiChart, episodeAsOf, onMarketData]);

  if (shouldUseApiChart) {
    const renderMinHeight = Math.max(110, Math.min(minHeight, 170));
    const chartHeightClass =
      renderMinHeight <= 120 ? 'h-24' : renderMinHeight <= 150 ? 'h-28' : 'h-32';
    const trendTextClass =
      trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500';
    const lineStartColor = trend === 'up' ? '#14b8a6' : trend === 'down' ? '#fb7185' : '#94a3b8';
    const lineEndColor = trend === 'up' ? '#2563eb' : trend === 'down' ? '#e11d48' : '#64748b';
    const areaStartColor =
      trend === 'up' ? 'rgba(20,184,166,0.20)' : trend === 'down' ? 'rgba(251,113,133,0.20)' : 'rgba(148,163,184,0.20)';

    const hasChartData = Boolean(chartData && chartData.points.length >= 2);
    const trendLabel = hasChartData
      ? `${chartData.changePercent >= 0 ? '+' : ''}${chartData.changePercent.toFixed(2)}%`
      : '';
    const trendDeltaLabel = chartData
      ? `${chartData.change >= 0 ? '+' : ''}${formatMarketNumber(chartData.change)}`
      : '';

    const latestLabel = chartData
      ? formatMarketNumber(chartData.latest)
      : '—';
    const previousLabel = chartData
      ? formatMarketNumber(chartData.previous)
      : '—';
    const asOfLabel = chartData?.asOf || episodeAsOf;
    const apiStyle = {
      minHeight: `${renderMinHeight}px`,
      ...(aspectRatio ? { aspectRatio } : {}),
    };

    return (
      <div
        className="w-full rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3"
        style={apiStyle}
      >
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">{normalizedSymbol}</p>
              <p className="text-[11px] text-slate-500">
                {asOfLabel ? `As of ${asOfLabel} · ${latestLabel}` : `Latest ${latestLabel}`}
              </p>
            </div>
            <div className="text-right">
              {trendLabel && <p className={`text-xs font-semibold ${trendTextClass}`}>{trendLabel}</p>}
              {trendDeltaLabel && <p className="text-[11px] text-slate-500">{trendDeltaLabel}</p>}
            </div>
          </div>

          <div className={`${chartHeightClass} relative rounded-md border border-slate-200 bg-white px-3 py-2`}>
            {chartData && (
              <>
                <span className="absolute left-3 top-1 text-[10px] font-medium text-slate-500">
                  Prev {previousLabel}
                </span>
                <span className="absolute right-3 top-1 text-[10px] font-semibold text-slate-600">
                  Close {latestLabel}
                </span>
              </>
            )}
            <svg viewBox="0 0 100 24" className="h-full w-full pt-4">
              <defs>
                <linearGradient id={`${gradientIdBase}-line-gradient`} x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor={lineStartColor} />
                  <stop offset="100%" stopColor={lineEndColor} />
                </linearGradient>
                <linearGradient id={`${gradientIdBase}-area-gradient`} x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor={areaStartColor} />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
                </linearGradient>
              </defs>
              <polyline
                fill={`url(#${gradientIdBase}-area-gradient)`}
                stroke="none"
                points={chartPaths.area}
              />
              <polyline
                fill="none"
                stroke={`url(#${gradientIdBase}-line-gradient)`}
                strokeWidth="2"
                points={chartPaths.line}
              />
            </svg>
          </div>
          {chartError && !isDateFixedMode && !renderMode && (
            <p className="text-[10px] text-rose-600 truncate">
              Live market data unavailable: {chartError}
            </p>
          )}
          {/* Fallback status is intentionally hidden in UI to keep slide capture clean. */}
        </div>
      </div>
    );
  }

  return (
    <div
      className="tradingview-widget-container w-full"
      ref={container}
      style={{ aspectRatio: aspectRatio || undefined, minHeight: `${Math.max(110, minHeight)}px` }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

export const TradingViewWidget = memo(TradingViewWidgetComponent);
