'use client';

import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  aspectRatio?: string;
}

const SYMBOL_FALLBACK_MAP: Record<string, string> = {
  // These index symbols are frequently blocked in embedded TradingView widgets.
  '^IXIC': 'NASDAQ:QQQ',
  'NASDAQ:IXIC': 'NASDAQ:QQQ',
  '^RUT': 'AMEX:IWM',
  'TVC:RUT': 'AMEX:IWM',
};

function normalizeTradingViewSymbol(rawSymbol: string): string {
  const symbol = (rawSymbol || '').trim();
  return SYMBOL_FALLBACK_MAP[symbol] || symbol;
}

function TradingViewWidgetComponent({ symbol, aspectRatio = '16/9' }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const normalizedSymbol = normalizeTradingViewSymbol(symbol);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: normalizedSymbol,
      interval: 'D',
      timezone: 'America/New_York',
      theme: 'light',
      style: '1',
      locale: 'en',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    });

    container.current.appendChild(script);
  }, [normalizedSymbol]);

  return (
    <div
      className="tradingview-widget-container w-full"
      ref={container}
      style={{ aspectRatio, minHeight: '300px' }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

export const TradingViewWidget = memo(TradingViewWidgetComponent);
