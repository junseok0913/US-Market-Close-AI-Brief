'use client';

import { createContext, useContext } from 'react';
import type { MarketChartData } from '@/types/market-chart';

const RenderChartDataContext = createContext<Record<string, MarketChartData>>({});

export function RenderChartDataProvider({
  value,
  children,
}: {
  value: Record<string, MarketChartData>;
  children: React.ReactNode;
}) {
  return (
    <RenderChartDataContext.Provider value={value}>
      {children}
    </RenderChartDataContext.Provider>
  );
}

export function useRenderChartDataMap() {
  return useContext(RenderChartDataContext);
}
