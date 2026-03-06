#!/usr/bin/env python3
"""Select one large-cap US stock mover that is distinct from theme coverage.

Prototype flow:
1. Pull a broad US stock list from NASDAQ screener.
2. Sort by market cap and keep the top N names.
3. Fetch recent daily OHLCV from Yahoo Finance.
4. Load the existing theme script for the same date.
5. Ask Gemini to pick one mover that was not already covered in theme.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import warnings
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import pandas as pd
import requests
import yfinance as yf
import yaml
from dotenv import load_dotenv

CURRENT_FILE = Path(__file__).resolve()
ROOT_DIR = CURRENT_FILE.parents[4]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from shared.normalization import parse_json_from_response
from shared.utils.llm import build_llm

LOGGER = logging.getLogger("select_fallen_large_caps")
NASDAQ_SCREENER_URL = "https://api.nasdaq.com/api/screener/stocks"
PROMPT_PATH = CURRENT_FILE.parent / "prompt" / "select_theme_distinct_mover.yaml"
DEFAULT_HEADERS = {
    "user-agent": "Mozilla/5.0",
    "accept": "application/json, text/plain, */*",
    "origin": "https://www.nasdaq.com",
    "referer": "https://www.nasdaq.com/market-activity/stocks/screener",
}
INDEX_LIKE_TICKERS = {
    "^GSPC",
    "^IXIC",
    "^DJI",
    "^RUT",
    "^VIX",
    "^TNX",
    "VIX",
    "US10Y",
    "TNX",
    "DXY",
    "DX-Y.NYB",
    "SPY",
    "QQQ",
    "DIA",
}


@dataclass(frozen=True)
class StockRow:
    symbol: str
    yahoo_symbol: str
    name: str
    market_cap: float
    last_sale: float


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Select one large-cap US stock mover distinct from theme coverage.")
    parser.add_argument("date", help="Target date (YYYYMMDD or YYYY-MM-DD)")
    parser.add_argument("--lang", default="ko", choices=["ko", "en"], help="Script language used for theme context")
    parser.add_argument("--script-path", help="Existing script JSON path to inspect theme coverage")
    parser.add_argument("--universe-size", type=int, default=150, help="Top market-cap names to inspect")
    parser.add_argument(
        "--min-abs-change-pct",
        type=float,
        default=2.0,
        help="Minimum absolute daily return percentage required for candidates",
    )
    parser.add_argument("--max-pages", type=int, default=8, help="NASDAQ screener pages to load (1000 rows/page)")
    parser.add_argument("--batch-size", type=int, default=50, help="Yahoo Finance batch size")
    parser.add_argument("--max-candidates", type=int, default=10, help="How many candidate names to print")
    parser.add_argument("--prefix", default="MARKET_PICKER", help="LLM env prefix override")
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON output")
    return parser.parse_args()


def _parse_date(value: str) -> datetime.date:
    raw = value.strip()
    for fmt in ("%Y%m%d", "%Y-%m-%d"):
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Invalid date: {value}")


def _as_float(value: Any) -> float | None:
    if value in (None, "", "N/A"):
        return None
    try:
        cleaned = str(value).replace("$", "").replace(",", "").strip()
        if not cleaned:
            return None
        return float(cleaned)
    except ValueError:
        return None


def _compact_text(value: Any) -> str:
    return " ".join(str(value or "").replace("\r", " ").replace("\n", " ").split()).strip()


def _normalize_symbol(symbol: str) -> str:
    return symbol.strip().upper()


def _to_yahoo_symbol(symbol: str) -> str:
    return _normalize_symbol(symbol).replace(".", "-").replace("/", "-")


def _is_company_ticker(ticker: str) -> bool:
    if not ticker:
        return False
    if ticker in INDEX_LIKE_TICKERS:
        return False
    if ticker.startswith("^"):
        return False
    if "=" in ticker:
        return False
    if ticker.endswith("-USD"):
        return False
    if len(ticker) > 10:
        return False
    return True


def _load_prompt() -> dict[str, str]:
    if not PROMPT_PATH.exists():
        raise FileNotFoundError(f"Prompt file not found: {PROMPT_PATH}")
    raw = yaml.safe_load(PROMPT_PATH.read_text(encoding="utf-8")) or {}
    if not isinstance(raw, dict):
        raise ValueError(f"Invalid prompt format: {PROMPT_PATH}")
    system_prompt = _compact_text(raw.get("system"))
    user_template = raw.get("user_template")
    if not isinstance(user_template, str) or not user_template.strip():
        raise ValueError(f"Prompt user_template missing: {PROMPT_PATH}")
    return {"system": system_prompt, "user_template": user_template}


def _resolve_script_path(raw_date: str, lang: str, override: str | None) -> Path:
    if override:
        path = Path(override).expanduser()
        return path if path.is_absolute() else (ROOT_DIR / path).resolve()

    candidates = [
        ROOT_DIR / "podcast" / raw_date / lang / "script.json",
        ROOT_DIR / "podcast" / raw_date / lang / f"{raw_date}.json",
    ]
    for path in candidates:
        if path.exists():
            return path
    return candidates[0]


def _load_script_payload(script_path: Path) -> dict[str, Any]:
    if not script_path.exists():
        raise FileNotFoundError(f"Script file not found: {script_path}")
    payload = json.loads(script_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Script payload must be a JSON object: {script_path}")
    return payload


def _extract_theme_turns(script_payload: dict[str, Any]) -> list[dict[str, Any]]:
    chapter = script_payload.get("chapter")
    scripts = script_payload.get("scripts")
    if not isinstance(chapter, list) or not isinstance(scripts, list):
        return []

    start_id = -1
    end_id = -1
    for item in chapter:
        if not isinstance(item, dict):
            continue
        if _compact_text(item.get("name")).lower() != "theme":
            continue
        item_start = item.get("start_id")
        item_end = item.get("end_id")
        if isinstance(item_start, int) and isinstance(item_end, int) and item_end >= item_start:
            start_id = item_start
            end_id = item_end
            break
    if start_id < 0 or end_id < 0:
        return []

    out: list[dict[str, Any]] = []
    for turn in scripts:
        if not isinstance(turn, dict):
            continue
        turn_id = turn.get("id")
        if not isinstance(turn_id, int) or not (start_id <= turn_id <= end_id):
            continue
        source_tickers: list[str] = []
        sources = turn.get("sources")
        if isinstance(sources, list):
            for source in sources:
                if not isinstance(source, dict):
                    continue
                ticker = _normalize_symbol(str(source.get("ticker") or ""))
                if not _is_company_ticker(ticker):
                    continue
                source_tickers.append(ticker)
        out.append(
            {
                "id": turn_id,
                "speaker": _compact_text(turn.get("speaker")),
                "text": _compact_text(turn.get("text")),
                "source_tickers": sorted(set(source_tickers)),
            }
        )
    return out


def _collect_explicit_theme_tickers(theme_turns: list[dict[str, Any]]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for turn in theme_turns:
        source_tickers = turn.get("source_tickers")
        if not isinstance(source_tickers, list):
            continue
        for ticker in source_tickers:
            normalized = _normalize_symbol(str(ticker or ""))
            if not _is_company_ticker(normalized) or normalized in seen:
                continue
            seen.add(normalized)
            out.append(normalized)
    return out


def _fetch_screener_page(session: requests.Session, offset: int, limit: int) -> list[dict[str, Any]]:
    response = session.get(
        NASDAQ_SCREENER_URL,
        params={
            "tableonly": "true",
            "download": "true",
            "limit": str(limit),
            "offset": str(offset),
        },
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    rows = payload.get("data", {}).get("rows", [])
    return rows if isinstance(rows, list) else []


def _load_large_cap_universe(universe_size: int, max_pages: int) -> list[StockRow]:
    session = requests.Session()
    session.headers.update(DEFAULT_HEADERS)

    raw_rows: list[dict[str, Any]] = []
    page_size = 1000
    for page in range(max_pages):
        offset = page * page_size
        rows = _fetch_screener_page(session, offset=offset, limit=page_size)
        if not rows:
            break
        raw_rows.extend(rows)
        if len(rows) < page_size:
            break

    deduped: dict[str, StockRow] = {}
    for row in raw_rows:
        symbol = _normalize_symbol(str(row.get("symbol") or ""))
        if not symbol:
            continue
        market_cap = _as_float(row.get("marketCap"))
        last_sale = _as_float(row.get("lastsale"))
        country = str(row.get("country") or "").strip().lower()
        if market_cap is None or market_cap <= 0:
            continue
        if last_sale is None or last_sale <= 0:
            continue
        if country and country != "united states":
            continue
        deduped[symbol] = StockRow(
            symbol=symbol,
            yahoo_symbol=_to_yahoo_symbol(symbol),
            name=str(row.get("name") or "").strip(),
            market_cap=market_cap,
            last_sale=last_sale,
        )

    sorted_rows = sorted(deduped.values(), key=lambda item: item.market_cap, reverse=True)
    return sorted_rows[:universe_size]


def _extract_close_series(data: pd.DataFrame, yahoo_symbol: str) -> pd.Series:
    if data.empty:
        return pd.Series(dtype="float64")

    if isinstance(data.columns, pd.MultiIndex):
        if yahoo_symbol in data.columns.get_level_values(0):
            subset = data[yahoo_symbol]
        elif yahoo_symbol in data.columns.get_level_values(-1):
            subset = data.xs(yahoo_symbol, axis=1, level=-1)
        else:
            return pd.Series(dtype="float64")
    else:
        subset = data

    close_col = None
    for column in subset.columns:
        if str(column).lower() == "close":
            close_col = column
            break
    if close_col is None:
        return pd.Series(dtype="float64")

    series = pd.to_numeric(subset[close_col], errors="coerce").dropna()
    if isinstance(series.index, pd.DatetimeIndex):
        series = series.sort_index()
    return series


def _fetch_batch_history(symbols: list[str], start_date: datetime.date, end_date: datetime.date) -> pd.DataFrame:
    if not symbols:
        return pd.DataFrame()

    batch = yf.download(
        tickers=symbols,
        start=start_date.isoformat(),
        end=(end_date + timedelta(days=1)).isoformat(),
        interval="1d",
        progress=False,
        auto_adjust=False,
        threads=True,
        group_by="ticker",
    )
    if isinstance(batch, pd.DataFrame):
        return batch
    return pd.DataFrame()


def _compute_batch_changes(
    batch_rows: list[StockRow],
    target_date: datetime.date,
) -> list[dict[str, Any]]:
    if not batch_rows:
        return []

    start_date = target_date - timedelta(days=10)
    yahoo_symbols = [row.yahoo_symbol for row in batch_rows]
    history = _fetch_batch_history(yahoo_symbols, start_date=start_date, end_date=target_date)
    results: list[dict[str, Any]] = []

    for row in batch_rows:
        closes = _extract_close_series(history, row.yahoo_symbol)
        if len(closes) < 2:
            continue

        closes = closes[closes.index.date <= target_date]
        if len(closes) < 2:
            continue

        last_ts = closes.index[-1]
        prev_ts = closes.index[-2]
        last_close = float(closes.iloc[-1])
        prev_close = float(closes.iloc[-2])
        if prev_close == 0:
            continue

        change_pct = (last_close / prev_close - 1.0) * 100.0
        results.append(
            {
                "symbol": row.symbol,
                "yahoo_symbol": row.yahoo_symbol,
                "name": row.name,
                "market_cap": row.market_cap,
                "previous_close": round(prev_close, 4),
                "close": round(last_close, 4),
                "change_pct": round(change_pct, 4),
                "trade_date": last_ts.date().isoformat(),
                "previous_trade_date": prev_ts.date().isoformat(),
            }
        )

    return results


def _find_candidates(
    universe: list[StockRow],
    target_date: datetime.date,
    batch_size: int,
) -> list[dict[str, Any]]:
    batches = [universe[i : i + batch_size] for i in range(0, len(universe), batch_size)]
    out: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=min(4, len(batches) or 1)) as executor:
        futures = [executor.submit(_compute_batch_changes, batch, target_date) for batch in batches]
        for future in as_completed(futures):
            out.extend(future.result())
    return sorted(out, key=lambda item: abs(item["change_pct"]), reverse=True)


def _sanitize_selected_symbol(value: Any, allowed: set[str]) -> str:
    symbol = _normalize_symbol(str(value or ""))
    return symbol if symbol in allowed else ""


def _select_candidate_with_llm(
    *,
    date: str,
    prefix: str,
    theme_turns: list[dict[str, Any]],
    candidates: list[dict[str, Any]],
) -> tuple[str, str]:
    prompt_cfg = _load_prompt()
    user_prompt = prompt_cfg["user_template"].format(
        date=date,
        theme_turns_json=json.dumps(theme_turns, ensure_ascii=False, separators=(",", ":")),
        candidates_json=json.dumps(candidates, ensure_ascii=False, separators=(",", ":")),
    )
    full_prompt = f"{prompt_cfg['system']}\n\n{user_prompt}" if prompt_cfg["system"] else user_prompt
    llm = build_llm(prefix=prefix, logger=LOGGER)
    response = llm.invoke(full_prompt)
    parsed = parse_json_from_response(response.content)
    allowed = {item["symbol"] for item in candidates}
    selected_symbol = _sanitize_selected_symbol(parsed.get("selected_symbol"), allowed)
    reason = _compact_text(parsed.get("reason"))
    if not selected_symbol:
        raise ValueError("LLM did not return a valid candidate symbol")
    return selected_symbol, reason


def select_theme_distinct_large_cap_ticker(
    *,
    date: str,
    script_payload: dict[str, Any],
    universe_size: int = 150,
    min_abs_change_pct: float = 2.0,
    max_pages: int = 8,
    batch_size: int = 50,
    max_candidates: int = 10,
    prefix: str = "MARKET_PICKER",
) -> dict[str, Any]:
    target_date = _parse_date(date)
    min_abs_change_pct = abs(float(min_abs_change_pct))
    load_dotenv(ROOT_DIR / ".env", override=False)

    LOGGER.info("Loading top %d US large caps", universe_size)
    universe = _load_large_cap_universe(universe_size=universe_size, max_pages=max_pages)
    LOGGER.info("Loaded %d stocks into the universe", len(universe))

    theme_turns = _extract_theme_turns(script_payload)
    explicit_theme_tickers = _collect_explicit_theme_tickers(theme_turns)
    explicit_theme_ticker_set = set(explicit_theme_tickers)

    candidates = _find_candidates(universe, target_date=target_date, batch_size=batch_size)
    filtered_all = [item for item in candidates if abs(item["change_pct"]) >= min_abs_change_pct]
    filtered_all = [item for item in filtered_all if item["symbol"] not in explicit_theme_ticker_set]
    filtered_for_llm = filtered_all[: max(1, max_candidates)]

    selected_payload: dict[str, Any] | None = None
    if filtered_for_llm:
        selected_symbol, reason = _select_candidate_with_llm(
            date=target_date.isoformat(),
            prefix=prefix,
            theme_turns=theme_turns,
            candidates=filtered_for_llm,
        )
        selected_payload = next((item for item in filtered_for_llm if item["symbol"] == selected_symbol), None)
        if selected_payload is not None:
            selected_payload = {**selected_payload, "reason": reason}

    return {
        "date": target_date.isoformat(),
        "universe_size": len(universe),
        "min_abs_change_pct": min_abs_change_pct,
        "theme_turn_count": len(theme_turns),
        "explicit_theme_company_tickers": explicit_theme_tickers,
        "filtered_total_count": len(filtered_all),
        "selected": selected_payload,
        "candidates": filtered_for_llm,
    }


def main() -> int:
    warnings.filterwarnings("ignore", module=r"yfinance\.scrapers\.history")
    warnings.filterwarnings("ignore", module=r"yfinance\.scrapers\.quote")
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    args = _parse_args()
    target_date = _parse_date(args.date)
    raw_date = target_date.strftime("%Y%m%d")
    script_path = _resolve_script_path(raw_date=raw_date, lang=args.lang, override=args.script_path)
    script_payload = _load_script_payload(script_path)
    payload = select_theme_distinct_large_cap_ticker(
        date=raw_date,
        script_payload=script_payload,
        universe_size=args.universe_size,
        min_abs_change_pct=args.min_abs_change_pct,
        max_pages=args.max_pages,
        batch_size=args.batch_size,
        max_candidates=args.max_candidates,
        prefix=args.prefix,
    )

    payload = {"script_path": str(script_path), **payload}
    print(json.dumps(payload, ensure_ascii=False, indent=2 if args.pretty else None))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
