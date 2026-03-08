import { NextRequest, NextResponse } from 'next/server';
import {
  fetchMarketChartData,
  MARKET_CHART_ALLOWED_INTERVALS,
  MARKET_CHART_ALLOWED_RANGES,
  normalizeMarketChartAsOf,
  normalizeMarketChartSymbol,
} from '@/lib/market-chart';
import type { MarketChartData } from '@/types/market-chart';

export const runtime = 'nodejs';
const CACHE_TTL_MS = 15 * 60 * 1000;

const responseCache = new Map<string, { expiresAt: number; payload: MarketChartData }>();

export async function GET(request: NextRequest) {
  const rawSymbol = request.nextUrl.searchParams.get('symbol') || '';
  const rangeInput = request.nextUrl.searchParams.get('range') || '1mo';
  const intervalInput = request.nextUrl.searchParams.get('interval') || '1d';
  const asOfInput = request.nextUrl.searchParams.get('asOf');

  const symbol = normalizeMarketChartSymbol(rawSymbol);
  if (!symbol) {
    return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
  }

  const range = MARKET_CHART_ALLOWED_RANGES.has(rangeInput) ? rangeInput : '1mo';
  const interval = MARKET_CHART_ALLOWED_INTERVALS.has(intervalInput) ? intervalInput : '1d';
  const asOf = normalizeMarketChartAsOf(asOfInput);
  if (asOfInput && !asOf) {
    return NextResponse.json({ error: 'invalid asOf format (use YYYY-MM-DD or YYYYMMDD)' }, { status: 400 });
  }
  const cacheKey = `${symbol}|${range}|${interval}|${asOf || 'live'}`;

  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
    });
  }

  try {
    const payload = await fetchMarketChartData({ symbol, range, interval, asOf });

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
      { error: `market chart fetch failed: ${message}`, symbol, asOf },
      { status: 502 },
    );
  }
}
