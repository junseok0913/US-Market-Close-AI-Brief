export type MarketChartTrend = 'up' | 'down' | 'flat';

export interface MarketChartPoint {
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
  trend: MarketChartTrend;
}
