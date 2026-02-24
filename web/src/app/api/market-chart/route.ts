import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Trend = 'up' | 'down' | 'flat';

interface MarketChartPoint {
  t: number;
  c: number;
}

interface MarketChartResponse {
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
  trend: Trend;
}

const SYMBOL_TO_YAHOO: Record<string, string> = {
  'SP:SPX': '^GSPC',
  'NASDAQ:IXIC': '^IXIC',
  'NASDAQ:QQQ': 'QQQ',
  'DJ:DJI': '^DJI',
  'TVC:VIX': '^VIX',
  'TVC:RUT': '^RUT',
  'AMEX:IWM': 'IWM',
  'TVC:US10Y': '^TNX',
  'TVC:DXY': 'DX-Y.NYB',
  'AMEX:GLD': 'GLD',
  'COMEX:GC1!': 'GC=F',
  'COMEX:GCI': 'GC=F',
  'COMEX:GCI!': 'GC=F',
  'AMEX:XRT': 'XRT',
  'AMEX:XLI': 'XLI',
};

const SYMBOL_ALIASES: Record<string, string> = {
  '^GSPC': 'SP:SPX',
  SPX: 'SP:SPX',
  SP500: 'SP:SPX',
  SNP500: 'SP:SPX',
  '^IXIC': 'NASDAQ:IXIC',
  NASDAQ: 'NASDAQ:IXIC',
  IXIC: 'NASDAQ:IXIC',
  QQQ: 'NASDAQ:QQQ',
  '^DJI': 'DJ:DJI',
  DJI: 'DJ:DJI',
  DOW: 'DJ:DJI',
  '^RUT': 'TVC:RUT',
  RUT: 'TVC:RUT',
  RUSSELL2000: 'TVC:RUT',
  '^VIX': 'TVC:VIX',
  VIX: 'TVC:VIX',
  IWM: 'AMEX:IWM',
  '^TNX': 'TVC:US10Y',
  TNX: 'TVC:US10Y',
  US10Y: 'TVC:US10Y',
  'DX-Y.NYB': 'TVC:DXY',
  DXY: 'TVC:DXY',
  'GC=F': 'COMEX:GC1!',
  GC1: 'COMEX:GC1!',
  'GC1!': 'COMEX:GC1!',
  GCI: 'COMEX:GC1!',
  'GCI!': 'COMEX:GC1!',
  GLD: 'AMEX:GLD',
  XRT: 'AMEX:XRT',
  XLI: 'AMEX:XLI',
};

const ALLOWED_RANGES = new Set(['5d', '1mo', '3mo', '6mo', '1y']);
const ALLOWED_INTERVALS = new Set(['1d', '1h', '30m']);
const CACHE_TTL_MS = 15 * 60 * 1000;
const RANGE_LOOKBACK_DAYS: Record<string, number> = {
  '5d': 10,
  '1mo': 40,
  '3mo': 100,
  '6mo': 200,
  '1y': 390,
};

const responseCache = new Map<string, { expiresAt: number; payload: MarketChartResponse }>();

function normalizeSymbol(rawSymbol: string): string {
  const compact = (rawSymbol || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/&/g, '');
  return SYMBOL_ALIASES[compact] || compact;
}

function mapToYahooSymbol(symbol: string): string {
  return SYMBOL_TO_YAHOO[symbol] || symbol;
}

function isSafeSymbol(symbol: string): boolean {
  return /^[A-Z0-9:^._=!-]+$/.test(symbol);
}

function normalizeAsOf(rawAsOf: string | null): string | null {
  if (!rawAsOf) return null;
  const trimmed = rawAsOf.trim();
  const compact = trimmed.replace(/-/g, '');
  if (!/^\d{8}$/.test(compact)) return null;

  const year = Number(compact.slice(0, 4));
  const month = Number(compact.slice(4, 6));
  const day = Number(compact.slice(6, 8));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  const candidate = new Date(Date.UTC(year, month - 1, day));
  const isValid = (
    candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day
  );
  if (!isValid) return null;
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function parseSeries(data: unknown): MarketChartResponse {
  const root = data as {
    chart?: {
      result?: Array<{
        meta?: { currency?: string; exchangeName?: string };
        timestamp?: number[];
        indicators?: { quote?: Array<{ close?: Array<number | null> }> };
      }>;
      error?: { description?: string };
    };
  };

  const result = root.chart?.result?.[0];
  const providerError = root.chart?.error?.description;
  if (!result) {
    throw new Error(providerError || 'No chart result');
  }

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const points: MarketChartPoint[] = [];

  const size = Math.min(timestamps.length, closes.length);
  for (let i = 0; i < size; i += 1) {
    const t = timestamps[i];
    const c = closes[i];
    if (Number.isFinite(t) && Number.isFinite(c)) {
      points.push({ t: Number(t), c: Number(c) });
    }
  }

  if (points.length < 2) {
    throw new Error('Insufficient chart points');
  }

  const previous = points[0].c;
  const latest = points[points.length - 1].c;
  const change = latest - previous;
  const changePercent = previous === 0 ? 0 : (change / previous) * 100;
  const trend: Trend = Math.abs(change) < 1e-8 ? 'flat' : change > 0 ? 'up' : 'down';

  return {
    symbol: '',
    providerSymbol: '',
    asOf: null,
    currency: result.meta?.currency || null,
    exchangeName: result.meta?.exchangeName || null,
    points,
    latest,
    previous,
    change,
    changePercent,
    trend,
  };
}

export async function GET(request: NextRequest) {
  const rawSymbol = request.nextUrl.searchParams.get('symbol') || '';
  const rangeInput = request.nextUrl.searchParams.get('range') || '1mo';
  const intervalInput = request.nextUrl.searchParams.get('interval') || '1d';
  const asOfInput = request.nextUrl.searchParams.get('asOf');

  const symbol = normalizeSymbol(rawSymbol);
  if (!symbol) {
    return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
  }
  if (!isSafeSymbol(symbol)) {
    return NextResponse.json({ error: 'invalid symbol format' }, { status: 400 });
  }

  const range = ALLOWED_RANGES.has(rangeInput) ? rangeInput : '1mo';
  const interval = ALLOWED_INTERVALS.has(intervalInput) ? intervalInput : '1d';
  const asOf = normalizeAsOf(asOfInput);
  if (asOfInput && !asOf) {
    return NextResponse.json({ error: 'invalid asOf format (use YYYY-MM-DD or YYYYMMDD)' }, { status: 400 });
  }
  const providerSymbol = mapToYahooSymbol(symbol);
  const cacheKey = `${providerSymbol}|${range}|${interval}|${asOf || 'live'}`;

  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
    });
  }

  try {
    const endpoint = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(providerSymbol)}`);
    if (asOf) {
      const [year, month, day] = asOf.split('-').map(Number);
      const period2 = Date.UTC(year, month - 1, day + 1) / 1000;
      const lookbackDays = RANGE_LOOKBACK_DAYS[range] || RANGE_LOOKBACK_DAYS['1mo'];
      const period1 = period2 - (lookbackDays * 24 * 60 * 60);
      endpoint.searchParams.set('period1', String(Math.floor(period1)));
      endpoint.searchParams.set('period2', String(Math.floor(period2)));
    } else {
      endpoint.searchParams.set('range', range);
    }
    endpoint.searchParams.set('interval', interval);
    endpoint.searchParams.set('includePrePost', 'false');
    endpoint.searchParams.set('events', 'div,splits');

    const upstream = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'US-Market-Close-AI-Brief/1.0',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      throw new Error(`upstream status ${upstream.status}`);
    }

    const rawData = await upstream.json();
    const parsed = parseSeries(rawData);
    const payload: MarketChartResponse = {
      ...parsed,
      symbol,
      providerSymbol,
      asOf,
    };

    responseCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return NextResponse.json(
      { error: `market chart fetch failed: ${message}`, symbol, providerSymbol, asOf },
      { status: 502 },
    );
  }
}
