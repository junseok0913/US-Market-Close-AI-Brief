"""Theme scripts 기반 뉴스 티커 추출 유틸."""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import Any

import yaml

from shared.normalization import parse_json_from_response
from shared.utils.llm import build_llm

logger = logging.getLogger(__name__)
PROMPT_PATH = Path(__file__).resolve().parent / "prompt" / "theme_news_tickers.yaml"
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


def _compact_text(value: Any) -> str:
    return " ".join(str(value or "").replace("\r", " ").replace("\n", " ").split()).strip()


def _normalize_ticker(value: Any) -> str:
    return re.sub(r"[^A-Z0-9^.=/-]", "", _compact_text(value).upper())


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
        raise FileNotFoundError(f"뉴스 티커 추출 프롬프트 파일이 없습니다: {PROMPT_PATH}")
    raw = yaml.safe_load(PROMPT_PATH.read_text(encoding="utf-8")) or {}
    if not isinstance(raw, dict):
        raise ValueError(f"뉴스 티커 추출 프롬프트 형식이 잘못되었습니다: {PROMPT_PATH}")
    system_prompt = _compact_text(raw.get("system"))
    user_template = raw.get("user_template")
    if not isinstance(user_template, str) or not user_template.strip():
        raise ValueError(f"뉴스 티커 추출 프롬프트 user_template 누락: {PROMPT_PATH}")
    return {"system": system_prompt, "user_template": user_template}


def _extract_theme_turns(scripts: list[dict[str, Any]], chapter: list[dict[str, Any]]) -> list[dict[str, Any]]:
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
        out.append(turn)
    return out


def _collect_theme_source_tickers(theme_turns: list[dict[str, Any]]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for turn in theme_turns:
        sources = turn.get("sources")
        if not isinstance(sources, list):
            continue
        for source in sources:
            if not isinstance(source, dict):
                continue
            ticker = _normalize_ticker(source.get("ticker"))
            if not _is_company_ticker(ticker) or ticker in seen:
                continue
            seen.add(ticker)
            out.append(ticker)
    return out


def _sanitize_news_tickers(values: Any) -> list[str]:
    if not isinstance(values, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for item in values:
        ticker = _normalize_ticker(item)
        if not _is_company_ticker(ticker) or ticker in seen:
            continue
        seen.add(ticker)
        out.append(ticker)
    return out


def extract_news_tickers_from_theme(
    *,
    date: str,
    user_tickers: list[str],
    scripts: list[dict[str, Any]],
    chapter: list[dict[str, Any]],
) -> list[str]:
    """Theme 파트 turn을 기반으로 뉴스 티커를 추출한다."""
    theme_turns = _extract_theme_turns(scripts, chapter)
    fallback = _collect_theme_source_tickers(theme_turns)
    if not theme_turns:
        return fallback

    minimal_turns: list[dict[str, Any]] = []
    for turn in theme_turns:
        sources = turn.get("sources")
        source_tickers: list[str] = []
        if isinstance(sources, list):
            for source in sources:
                if not isinstance(source, dict):
                    continue
                ticker = _normalize_ticker(source.get("ticker"))
                if not ticker:
                    continue
                source_tickers.append(ticker)
        minimal_turns.append(
            {
                "id": turn.get("id"),
                "speaker": _compact_text(turn.get("speaker")),
                "text": _compact_text(turn.get("text")),
                "source_tickers": source_tickers,
            }
        )

    prompt_cfg = _load_prompt()
    user_prompt = prompt_cfg["user_template"].format(
        date=date,
        user_tickers_json=json.dumps(user_tickers, ensure_ascii=False, separators=(",", ":")),
        theme_turns_json=json.dumps(minimal_turns, ensure_ascii=False, separators=(",", ":")),
    )
    full_prompt = f"{prompt_cfg['system']}\n\n{user_prompt}" if prompt_cfg["system"] else user_prompt

    try:
        llm = build_llm(prefix="NEWS_TICKER", logger=logger)
        response = llm.invoke(full_prompt)
        parsed = parse_json_from_response(response.content)
        extracted = _sanitize_news_tickers(parsed.get("news_tickers"))
        if extracted:
            return extracted
    except Exception as exc:
        logger.warning("news_ticker extraction failed; using fallback: %s", exc)

    return fallback

