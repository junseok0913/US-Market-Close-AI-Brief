#!/usr/bin/env node

import fs from "fs";
import path from "path";

const SYMBOL_TO_YAHOO = {
  "SP:SPX": "^GSPC",
  "NASDAQ:IXIC": "^IXIC",
  "NASDAQ:QQQ": "QQQ",
  "DJ:DJI": "^DJI",
  "TVC:VIX": "^VIX",
  "TVC:RUT": "^RUT",
  "AMEX:IWM": "IWM",
  "TVC:US10Y": "^TNX",
  "TVC:DXY": "DX-Y.NYB",
  "AMEX:GLD": "GLD",
  "COMEX:GC1!": "GC=F",
  "COMEX:GCI": "GC=F",
  "COMEX:GCI!": "GC=F",
  "AMEX:XRT": "XRT",
  "AMEX:XLI": "XLI",
};

const SYMBOL_ALIASES = {
  "^GSPC": "SP:SPX",
  SPX: "SP:SPX",
  SP500: "SP:SPX",
  SNP500: "SP:SPX",
  "^IXIC": "NASDAQ:IXIC",
  NASDAQ: "NASDAQ:IXIC",
  IXIC: "NASDAQ:IXIC",
  QQQ: "NASDAQ:QQQ",
  "^DJI": "DJ:DJI",
  DJI: "DJ:DJI",
  DOW: "DJ:DJI",
  "^RUT": "TVC:RUT",
  RUT: "TVC:RUT",
  RUSSELL2000: "TVC:RUT",
  "^VIX": "TVC:VIX",
  VIX: "TVC:VIX",
  IWM: "AMEX:IWM",
  "^TNX": "TVC:US10Y",
  TNX: "TVC:US10Y",
  US10Y: "TVC:US10Y",
  "DX-Y.NYB": "TVC:DXY",
  DXY: "TVC:DXY",
  "GC=F": "COMEX:GC1!",
  GC1: "COMEX:GC1!",
  "GC1!": "COMEX:GC1!",
  GCI: "COMEX:GC1!",
  "GCI!": "COMEX:GC1!",
  GLD: "AMEX:GLD",
  XRT: "AMEX:XRT",
  XLI: "AMEX:XLI",
};

const RANGE_LOOKBACK_DAYS = {
  "5d": 10,
  "1mo": 40,
  "3mo": 100,
  "6mo": 200,
  "1y": 390,
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function normalizeSymbol(rawSymbol) {
  const compact = String(rawSymbol || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/&/g, "");
  return SYMBOL_ALIASES[compact] || compact;
}

function normalizeAsOf(rawAsOf) {
  if (!rawAsOf) return null;
  const compact = String(rawAsOf).trim().replace(/-/g, "");
  if (!/^\d{8}$/.test(compact)) return null;
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function compactDateToIso(raw) {
  const compact = String(raw || "").replace(/[^0-9]/g, "");
  if (compact.length !== 8) return null;
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function mapToYahooSymbol(symbol) {
  return SYMBOL_TO_YAHOO[symbol] || symbol;
}

function extractSymbols(episode) {
  const symbols = new Set();
  const add = (raw) => {
    if (!raw) return;
    const normalized = normalizeSymbol(raw);
    if (normalized) symbols.add(normalized);
  };

  add("^GSPC");
  add("^IXIC");
  add("^DJI");

  for (const ticker of episode.user_tickers || []) {
    add(ticker);
  }

  for (const script of episode.scripts || []) {
    for (const source of script.sources || []) {
      add(source.ticker);
    }
  }

  return [...symbols];
}

async function fetchMarketChartData({ symbol, asOf, range = "1mo", interval = "1d" }) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const providerSymbol = mapToYahooSymbol(normalizedSymbol);
  const endpoint = new URL(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(providerSymbol)}`,
  );

  if (asOf) {
    const [year, month, day] = asOf.split("-").map(Number);
    const period2 = Date.UTC(year, month - 1, day + 1) / 1000;
    const lookbackDays = RANGE_LOOKBACK_DAYS[range] || RANGE_LOOKBACK_DAYS["1mo"];
    const period1 = period2 - lookbackDays * 24 * 60 * 60;
    endpoint.searchParams.set("period1", String(Math.floor(period1)));
    endpoint.searchParams.set("period2", String(Math.floor(period2)));
  } else {
    endpoint.searchParams.set("range", range);
  }

  endpoint.searchParams.set("interval", interval);
  endpoint.searchParams.set("includePrePost", "false");
  endpoint.searchParams.set("events", "div,splits");

  const upstream = await fetch(endpoint.toString(), {
    method: "GET",
    headers: {
      "User-Agent": "US-Market-Close-AI-Brief/1.0",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    throw new Error(`upstream status ${upstream.status}`);
  }

  const raw = await upstream.json();
  const result = raw?.chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const closes = result?.indicators?.quote?.[0]?.close || [];
  const points = [];

  for (let i = 0; i < Math.min(timestamps.length, closes.length); i += 1) {
    const t = timestamps[i];
    const c = closes[i];
    if (Number.isFinite(t) && Number.isFinite(c)) {
      points.push({ t: Number(t), c: Number(c) });
    }
  }

  if (points.length < 2) {
    throw new Error("Insufficient chart points");
  }

  const previous = points[0].c;
  const latest = points[points.length - 1].c;
  const change = latest - previous;
  const changePercent = previous === 0 ? 0 : (change / previous) * 100;

  return {
    symbol: normalizedSymbol,
    providerSymbol,
    asOf,
    currency: result?.meta?.currency || null,
    exchangeName: result?.meta?.exchangeName || null,
    points,
    latest,
    previous,
    change,
    changePercent,
    trend: Math.abs(change) < 1e-8 ? "flat" : change > 0 ? "up" : "down",
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const episodeJsonPath = args["episode-json"] ? path.resolve(args["episode-json"]) : "";
  const outputPath = args.output ? path.resolve(args.output) : "";
  const range = typeof args.range === "string" ? args.range : "1mo";
  const interval = typeof args.interval === "string" ? args.interval : "1d";

  if (!episodeJsonPath) {
    throw new Error("Missing --episode-json");
  }
  if (!outputPath) {
    throw new Error("Missing --output");
  }
  if (!fs.existsSync(episodeJsonPath)) {
    throw new Error(`Episode JSON not found: ${episodeJsonPath}`);
  }

  const episode = JSON.parse(fs.readFileSync(episodeJsonPath, "utf-8"));
  const asOf = normalizeAsOf(args["as-of"] || compactDateToIso(episode.date || ""));
  const symbols = extractSymbols(episode);
  const chartDataMap = {};

  console.log(`[chart-prefetch] episode-json: ${episodeJsonPath}`);
  console.log(`[chart-prefetch] output: ${outputPath}`);
  console.log(`[chart-prefetch] as-of: ${asOf || "live"}`);
  console.log(`[chart-prefetch] symbols: ${symbols.join(", ") || "(none)"}`);

  for (const symbol of symbols) {
    try {
      const data = await fetchMarketChartData({ symbol, asOf, range, interval });
      chartDataMap[data.symbol] = data;
      console.log(
        `[chart-prefetch] ok: ${data.symbol} (${data.points.length} points, ${data.changePercent.toFixed(2)}%)`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[chart-prefetch] warn: ${symbol} -> ${message}`);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(chartDataMap, null, 2));
  console.log(`[chart-prefetch] saved: ${outputPath}`);
}

main().catch((error) => {
  console.error(`[chart-prefetch] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
