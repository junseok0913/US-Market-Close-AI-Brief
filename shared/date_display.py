"""Helpers for separating storage date from language-specific display date."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any


def normalize_yyyymmdd(value: Any) -> str | None:
    raw = str(value or "").strip()
    if not raw:
        return None

    if "-" in raw:
        try:
            return datetime.strptime(raw, "%Y-%m-%d").strftime("%Y%m%d")
        except ValueError:
            return None

    if len(raw) == 8 and raw.isdigit():
        try:
            return datetime.strptime(raw, "%Y%m%d").strftime("%Y%m%d")
        except ValueError:
            return None
    return None


def shift_yyyymmdd(value: str, *, days: int) -> str:
    base = normalize_yyyymmdd(value)
    if not base:
        raise ValueError(f"Invalid date token: {value}")
    dt = datetime.strptime(base, "%Y%m%d") + timedelta(days=days)
    return dt.strftime("%Y%m%d")


def resolve_display_date(market_date: str, lang: str) -> str:
    base = normalize_yyyymmdd(market_date)
    if not base:
        raise ValueError(f"Invalid market date token: {market_date}")
    if str(lang or "").strip().lower() == "ko":
        return shift_yyyymmdd(base, days=1)
    return base

