'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MarketSummarySlide as MarketSummarySlideType } from '@/types/slide';
import { TradingViewWidget } from '../TradingViewWidget';

interface Props {
  slide: MarketSummarySlideType;
}

function hasNumericValue(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function hasNumericChange(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function inferIndexNameFromTicker(ticker: string): string | undefined {
  const symbol = ticker.toUpperCase();
  if (symbol.includes('SPX') || symbol.includes('SP500')) return 'S&P 500';
  if (symbol.includes('IXIC') || symbol.includes('QQQ') || symbol.includes('NASDAQ')) return 'NASDAQ';
  if (symbol.includes('DJI') || symbol.includes('DOW')) return 'DOW';
  if (symbol.includes('RUT') || symbol.includes('IWM')) return 'Russell 2000';
  return undefined;
}

function formatIndexValue(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: value >= 10000 ? 0 : 2,
    maximumFractionDigits: value >= 10000 ? 0 : 2,
  });
}

function derivePulseMetrics(indices: MarketSummarySlideType['indices']) {
  const sorted = [...indices].sort((a, b) => b.changePercent - a.changePercent);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const advancers = indices.filter((idx) => idx.changePercent > 0).length;
  const decliners = indices.filter((idx) => idx.changePercent < 0).length;
  const dispersion =
    strongest && weakest ? strongest.changePercent - weakest.changePercent : null;

  return {
    strongest,
    weakest,
    advancers,
    decliners,
    dispersion,
  };
}

export function MarketSummarySlide({ slide }: Props) {
  const showCommodities = slide.commodities.length > 0;
  const chartSources = (slide.charts ?? []).slice(0, 2);
  const indexByName = new Map(slide.indices.map((idx) => [idx.name.toLowerCase(), idx]));
  const pulse = derivePulseMetrics(slide.indices);
  const focusChart =
    chartSources.find((chart) => {
      const inferredName = inferIndexNameFromTicker(chart.ticker);
      return (
        inferredName
        && pulse.strongest
        && inferredName.toLowerCase() === pulse.strongest.name.toLowerCase()
      );
    }) ?? chartSources[0];
  const focusChartInferredName = focusChart ? inferIndexNameFromTicker(focusChart.ticker) : undefined;
  const focusIndex =
    focusChartInferredName
      ? indexByName.get(focusChartInferredName.toLowerCase())
      : undefined;
  const breadthLabel =
    pulse.advancers === pulse.decliners
      ? 'Balanced'
      : pulse.advancers > pulse.decliners
        ? 'Risk-On'
        : 'Risk-Off';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {slide.title || 'Market Overview'}
          </h2>
          {slide.description && (
            <p className="text-gray-600 leading-relaxed">{slide.description}</p>
          )}
        </motion.div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Major Indices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slide.indices.map((idx, i) => (
              <motion.div
                key={idx.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-xl p-5 border border-gray-100"
              >
                <p className="text-sm text-gray-500 mb-1">{idx.name}</p>
                {hasNumericValue(idx.value) ? (
                  <p className="text-3xl font-extrabold text-gray-900 mb-1 tabular-nums">
                    {formatIndexValue(idx.value)}
                  </p>
                ) : (
                  <p
                    className={`text-3xl font-extrabold mb-1 tabular-nums ${
                      idx.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {idx.changePercent >= 0 ? '+' : ''}
                    {idx.changePercent.toFixed(2)}%
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mb-2">
                  {hasNumericValue(idx.value) ? 'Closing level' : 'Closing level unavailable'}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {idx.changePercent >= 0 ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-600">
                        +{idx.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-lg">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-600">
                        {idx.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  )}
                  {hasNumericChange(idx.change) && (
                    <span className="text-sm text-gray-400">
                      {idx.changePercent >= 0 ? '+' : ''}
                      {idx.change.toFixed(2)}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {showCommodities ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Commodities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slide.commodities.map((com, i) => (
                <motion.div
                  key={com.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100"
                >
                  <p className="text-sm text-amber-700 font-medium mb-1">{com.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {hasNumericValue(com.value) ? `$${com.value.toLocaleString()}` : '—'}
                  </p>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg w-fit">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-600">
                      +{com.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : focusChart ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Market Pulse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="md:col-span-8 rounded-xl overflow-hidden border border-gray-200 bg-white"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {focusChart.title || focusChartInferredName || focusChart.ticker}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{focusChart.ticker}</p>
                    </div>
                    {focusIndex && (
                      <div className="text-right shrink-0">
                        <p
                          className={`text-xs font-semibold ${
                            focusIndex.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {focusIndex.changePercent >= 0 ? '+' : ''}
                          {focusIndex.changePercent.toFixed(2)}%
                        </p>
                        <p className="text-[11px] text-gray-500 tabular-nums">
                          {hasNumericValue(focusIndex.value) ? formatIndexValue(focusIndex.value) : 'level —'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <TradingViewWidget symbol={focusChart.ticker} aspectRatio="21/10" minHeight={190} />
              </motion.div>

              <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 }}
                  className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Top Gainer</p>
                  {pulse.strongest ? (
                    <>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{pulse.strongest.name}</p>
                      <p className="mt-1 text-lg font-bold text-emerald-600">
                        +{pulse.strongest.changePercent.toFixed(2)}%
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">No data</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.44 }}
                  className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Top Laggard</p>
                  {pulse.weakest ? (
                    <>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{pulse.weakest.name}</p>
                      <p className="mt-1 text-lg font-bold text-red-600">
                        {pulse.weakest.changePercent.toFixed(2)}%
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">No data</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Breadth</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">{breadthLabel}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Advancers {pulse.advancers} · Decliners {pulse.decliners}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.56 }}
                  className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Dispersion</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {pulse.dispersion !== null ? `${pulse.dispersion.toFixed(2)}%p` : '—'}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">Cross-index return spread</p>
                </motion.div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
