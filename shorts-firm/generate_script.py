"""Generate independent shorts-firm script JSON from podcast inputs."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import logging
import math
import re
import sys
from pathlib import Path
from typing import Any

import yaml
from dotenv import load_dotenv
import yfinance as yf

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from shared.utils.llm import build_llm
from shared.yaml_config import load_env_from_yaml

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

PROMPT_CONFIG_PATH = ROOT_DIR / "shorts-firm" / "prompt" / "shorts_firm_pipeline.yaml"

SECTION_ORDER = ("hook", "closing")
SECTION_NAME_ALIASES = {
    "hook": "hook",
    "opening": "hook",
    "open": "hook",
    "intro": "hook",
    "closing": "closing",
    "finale": "closing",
    "outro": "closing",
    "watch": "closing",
}
INDEX_LIKE_TICKERS = {
    "^GSPC",
    "^IXIC",
    "^DJI",
    "^NDX",
    "^RUT",
    "^TNX",
    "^VIX",
    "DX-Y.NYB",
    "CL=F",
    "BZ=F",
    "GC=F",
    "SI=F",
    "HG=F",
    "ES=F",
    "NQ=F",
    "YM=F",
}
DEFAULT_DURATION = 90
MIN_DURATION = 45
MAX_DURATION = 180
MEASURED_CHARS_PER_SEC = 7.88
MIN_COMPANY_COUNT = 2
MAX_COMPANY_COUNT = 4
MAX_SLIDE_POINTS_PER_COMPANY = 3


def compact_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def compact_with_limit(value: Any, max_len: int) -> str:
    text = compact_text(value)
    if max_len <= 0 or len(text) <= max_len:
        return text
    return f"{text[: max_len - 1].rstrip()}…"


def ensure_sentence_end(value: Any) -> str:
    text = compact_text(value)
    if not text:
        return ""
    if text.endswith((".", "!", "?")):
        return text
    return f"{text}."


def split_sentences(text: str) -> list[str]:
    normalized = compact_text(text)
    if not normalized:
        return []
    protected = re.sub(r"(?<=\d)\.(?=\d)", "__DOT__", normalized)
    raw = re.findall(r"[^.!?]+[.!?]?", protected)
    tokens = [token.strip().replace("__DOT__", ".") for token in raw if token.strip()]
    return tokens or [normalized]


def parse_date_token(value: Any) -> dt.date | None:
    token = compact_text(value).replace("-", "")
    if len(token) != 8 or not token.isdigit():
        return None
    try:
        return dt.datetime.strptime(token, "%Y%m%d").date()
    except ValueError:
        return None


def normalize_float(value: Any) -> float | None:
    if value is None:
        return None
    if hasattr(value, "iloc"):
        try:
            value = value.iloc[-1]
        except Exception:
            return None
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(parsed) or math.isinf(parsed):
        return None
    return parsed


def normalize_ticker(value: Any) -> str:
    return re.sub(r"[^A-Z0-9^.=/-]", "", compact_text(value).upper())


def is_company_ticker(ticker: str) -> bool:
    if not ticker:
        return False
    if ticker in INDEX_LIKE_TICKERS:
        return False
    return not ticker.startswith("^")


def format_percent(value: float | None) -> str:
    if value is None:
        return "N/A"
    return f"{value:+.2f}%"


def format_market_cap(value: float | None) -> str:
    if value is None or value <= 0:
        return "N/A"
    units = (
        (1_000_000_000_000, "T"),
        (1_000_000_000, "B"),
        (1_000_000, "M"),
    )
    for threshold, suffix in units:
        if value >= threshold:
            return f"${value / threshold:.2f}{suffix}"
    return f"${value:,.0f}"


def format_pe_ratio(value: float | None) -> str:
    if value is None:
        return "N/A"
    return f"{value:.2f}"


def format_pbr(value: float | None) -> str:
    if value is None:
        return "N/A"
    return f"{value:.2f}"


def normalize_percent_like(value: Any) -> float | None:
    if value is None:
        return None
    text = compact_text(value)
    if not text:
        return None
    text = text.replace("%", "").replace(",", "").strip()
    try:
        parsed = float(text)
    except (TypeError, ValueError):
        return None
    if math.isnan(parsed) or math.isinf(parsed):
        return None
    return parsed


def normalize_roe_percent(value: Any) -> float | None:
    parsed = normalize_float(value)
    if parsed is None:
        parsed = normalize_percent_like(value)
    if parsed is None:
        return None
    if -2.0 <= parsed <= 2.0:
        parsed *= 100.0
    return parsed


def format_roe(value: float | None) -> str:
    if value is None:
        return "N/A"
    return f"{value:.2f}%"


def detect_output_lang(*candidates: Any) -> str:
    merged = " ".join(compact_text(item) for item in candidates if compact_text(item))
    return "ko" if re.search(r"[가-힣]", merged) else "en"


def normalize_string_list(values: Any, limit: int) -> list[str]:
    if not isinstance(values, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for item in values:
        text = compact_text(item)
        if not text:
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(text)
        if len(out) >= limit:
            break
    return out


def to_int(value: Any, default: int) -> int:
    try:
        parsed = int(round(float(value)))
    except (TypeError, ValueError):
        return default
    return parsed


def get_duration_char_guide(script_cfg: dict[str, Any], duration: int) -> dict[str, int]:
    raw = script_cfg.get("duration_char_guide")
    base = {
        "target": int(round(duration * MEASURED_CHARS_PER_SEC)),
        "min": max(1, int(round(duration * MEASURED_CHARS_PER_SEC * 0.9))),
        "max": int(round(duration * MEASURED_CHARS_PER_SEC * 1.1)),
    }
    if not isinstance(raw, dict) or not raw:
        return base

    selected: dict[str, Any] | None = None
    direct = raw.get(str(duration))
    if isinstance(direct, dict):
        selected = direct
    else:
        numeric_keys: list[tuple[int, dict[str, Any]]] = []
        for key, value in raw.items():
            if not isinstance(value, dict):
                continue
            try:
                numeric_keys.append((int(str(key)), value))
            except ValueError:
                continue
        if numeric_keys:
            numeric_keys.sort(key=lambda item: abs(item[0] - duration))
            selected = numeric_keys[0][1]

    if not selected:
        return base

    target = max(1, to_int(selected.get("target"), base["target"]))
    min_chars = max(1, to_int(selected.get("min"), base["min"]))
    max_chars = max(target, to_int(selected.get("max"), base["max"]))
    if min_chars > target:
        min_chars = target
    return {"target": target, "min": min_chars, "max": max_chars}


def get_section_char_guide(
    script_cfg: dict[str, Any],
    section_name: str,
    *,
    target_default: int,
    min_default: int,
    max_default: int,
) -> dict[str, int]:
    section_cfg = script_cfg.get("section_char_guide")
    if not isinstance(section_cfg, dict):
        return {"target": target_default, "min": min_default, "max": max_default}
    raw = section_cfg.get(section_name)
    if not isinstance(raw, dict):
        return {"target": target_default, "min": min_default, "max": max_default}

    target = max(1, to_int(raw.get("target"), target_default))
    min_chars = max(1, to_int(raw.get("min"), min_default))
    max_chars = max(target, to_int(raw.get("max"), max_default))
    if min_chars > target:
        min_chars = target
    return {"target": target, "min": min_chars, "max": max_chars}


def build_company_char_guide_by_count(
    script_cfg: dict[str, Any],
    *,
    duration: int,
    min_count: int,
    max_count: int,
) -> dict[int, dict[str, int]]:
    raw_company_guide = script_cfg.get("company_count_char_guide")
    selected_block: dict[str, Any] | None = None
    if isinstance(raw_company_guide, dict):
        direct = raw_company_guide.get(str(duration))
        if isinstance(direct, dict):
            selected_block = direct
        else:
            numeric_keys: list[tuple[int, dict[str, Any]]] = []
            for key, value in raw_company_guide.items():
                if not isinstance(value, dict):
                    continue
                try:
                    numeric_keys.append((int(str(key)), value))
                except ValueError:
                    continue
            if numeric_keys:
                numeric_keys.sort(key=lambda item: abs(item[0] - duration))
                selected_block = numeric_keys[0][1]

    output: dict[int, dict[str, int]] = {}
    if isinstance(selected_block, dict):
        for company_count in range(min_count, max_count + 1):
            raw_item = selected_block.get(str(company_count))
            if not isinstance(raw_item, dict):
                continue
            target = max(1, to_int(raw_item.get("target"), 0))
            min_chars = max(1, to_int(raw_item.get("min"), target))
            max_chars = max(target, to_int(raw_item.get("max"), target))
            if min_chars > target:
                min_chars = target
            output[company_count] = {"target": target, "min": min_chars, "max": max_chars}
    if output:
        return output

    duration_guide = get_duration_char_guide(script_cfg, duration)
    hook_guide = get_section_char_guide(
        script_cfg,
        "hook",
        target_default=40,
        min_default=20,
        max_default=80,
    )
    closing_guide = get_section_char_guide(
        script_cfg,
        "closing",
        target_default=20,
        min_default=12,
        max_default=40,
    )
    total_target = max(1, duration_guide["target"] - hook_guide["target"] - closing_guide["target"])
    total_min = max(1, duration_guide["min"] - hook_guide["max"] - closing_guide["max"])
    total_max = max(total_target, duration_guide["max"] - hook_guide["min"] - closing_guide["min"])

    for company_count in range(min_count, max_count + 1):
        target = max(1, int(round(total_target / company_count)))
        min_chars = max(1, int(math.floor(total_min / company_count)))
        max_chars = max(target, int(math.ceil(total_max / company_count)))
        if min_chars > target:
            min_chars = target
        output[company_count] = {"target": target, "min": min_chars, "max": max_chars}
    return output


def format_company_char_guide_lines(company_guides: dict[int, dict[str, int]], *, lang: str) -> str:
    lines: list[str] = []
    for company_count in sorted(company_guides.keys()):
        item = company_guides[company_count]
        target = item["target"]
        min_chars = item["min"]
        max_chars = item["max"]
        if lang == "en":
            lines.append(
                f"- {company_count} companies: target {target} chars each (range {min_chars}~{max_chars})"
            )
        else:
            lines.append(
                f"- {company_count}개 기업: 기업당 목표 {target}자 (허용 {min_chars}~{max_chars}자)"
            )
    return "\n".join(lines)


def build_company_spoken_text(move: dict[str, Any], *, lang: str) -> str:
    label = compact_text(move.get("name") or move.get("ticker") or "Company")
    day_text = compact_text(move.get("day_change_display"))
    month_text = compact_text(move.get("month_change_display"))
    reason_text = compact_text(move.get("reason"))
    if reason_text and not reason_text.endswith((".", "!", "?")):
        reason_text = f"{reason_text}."

    if lang == "en":
        parts: list[str] = []
        if day_text and day_text != "N/A":
            parts.append(f"1-day {day_text}")
        if month_text and month_text != "N/A":
            parts.append(f"1-month {month_text}")
        sentence = f"{label} moved {' and '.join(parts)}." if parts else f"{label} was one of the key movers."
        return compact_text(f"{sentence} {reason_text}")

    parts_ko: list[str] = []
    if day_text and day_text != "N/A":
        parts_ko.append(f"하루 {day_text}")
    if month_text and month_text != "N/A":
        parts_ko.append(f"한 달 {month_text}")
    sentence_ko = f"{label}는 {' / '.join(parts_ko)} 움직였습니다." if parts_ko else f"{label} 흐름이 핵심이었습니다."
    return compact_text(f"{sentence_ko} {reason_text}")


def build_company_slide_points(move: dict[str, Any], *, lang: str) -> list[str]:
    provided = normalize_string_list(move.get("slide_points"), MAX_SLIDE_POINTS_PER_COMPANY)
    if provided:
        return provided

    day_text = compact_text(move.get("day_change_display"))
    month_text = compact_text(move.get("month_change_display"))
    market_cap_text = compact_text(move.get("market_cap_display"))
    pe_text = compact_text(move.get("pe_ratio_display"))
    pbr_text = compact_text(move.get("pbr_display"))
    roe_text = compact_text(move.get("roe_display"))
    reason_text = compact_text(move.get("reason"))

    bullets: list[str] = []
    if lang == "en":
        metric_bits: list[str] = []
        if day_text and day_text != "N/A":
            metric_bits.append(f"1D {day_text}")
        if month_text and month_text != "N/A":
            metric_bits.append(f"1M {month_text}")
        if metric_bits:
            bullets.append(" / ".join(metric_bits))
        if (
            (market_cap_text and market_cap_text != "N/A")
            or (pe_text and pe_text != "N/A")
            or (pbr_text and pbr_text != "N/A")
            or (roe_text and roe_text != "N/A")
        ):
            valuation_bits = []
            if market_cap_text and market_cap_text != "N/A":
                valuation_bits.append(f"Market Cap {market_cap_text}")
            if pe_text and pe_text != "N/A":
                valuation_bits.append(f"PER {pe_text}")
            if pbr_text and pbr_text != "N/A":
                valuation_bits.append(f"PBR {pbr_text}")
            if roe_text and roe_text != "N/A":
                valuation_bits.append(f"ROE {roe_text}")
            bullets.append(", ".join(valuation_bits))
        if reason_text:
            bullets.append(reason_text)
    else:
        metric_bits_ko: list[str] = []
        if day_text and day_text != "N/A":
            metric_bits_ko.append(f"1일 {day_text}")
        if month_text and month_text != "N/A":
            metric_bits_ko.append(f"1개월 {month_text}")
        if metric_bits_ko:
            bullets.append(" / ".join(metric_bits_ko))
        if (
            (market_cap_text and market_cap_text != "N/A")
            or (pe_text and pe_text != "N/A")
            or (pbr_text and pbr_text != "N/A")
            or (roe_text and roe_text != "N/A")
        ):
            valuation_bits_ko = []
            if market_cap_text and market_cap_text != "N/A":
                valuation_bits_ko.append(f"시총 {market_cap_text}")
            if pe_text and pe_text != "N/A":
                valuation_bits_ko.append(f"PER {pe_text}")
            if pbr_text and pbr_text != "N/A":
                valuation_bits_ko.append(f"PBR {pbr_text}")
            if roe_text and roe_text != "N/A":
                valuation_bits_ko.append(f"ROE {roe_text}")
            bullets.append(", ".join(valuation_bits_ko))
        if reason_text:
            bullets.append(reason_text)

    return normalize_string_list(bullets, MAX_SLIDE_POINTS_PER_COMPANY)


def normalize_section_name(value: Any) -> str:
    key = compact_text(value).lower()
    return SECTION_NAME_ALIASES.get(key, "")


def normalize_sources(raw_sources: Any) -> list[dict[str, Any]]:
    if not isinstance(raw_sources, list):
        return []
    return [item for item in raw_sources if isinstance(item, dict)]


def response_to_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        segments: list[str] = []
        for part in content:
            if isinstance(part, dict):
                text = part.get("text")
                if text:
                    segments.append(str(text))
            else:
                segments.append(str(part))
        return "\n".join(segments)
    return str(content)


def extract_json_object(raw_text: str) -> dict[str, Any]:
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("LLM response does not contain valid JSON object")
    return json.loads(text[start : end + 1])


def fallback_sections_from_script(script_text: str) -> list[dict[str, str]]:
    sentences = split_sentences(script_text)
    if not sentences:
        return [{"name": section, "text": ""} for section in SECTION_ORDER]

    hook_text = compact_text(sentences[0])
    closing_text = compact_text(sentences[-1]) if len(sentences) > 1 else ""
    return [
        {"name": "hook", "text": hook_text},
        {"name": "closing", "text": closing_text},
    ]


def normalize_sections(raw_payload: dict[str, Any], script_text: str) -> list[dict[str, str]]:
    fallback = fallback_sections_from_script(script_text)
    fallback_by_name = {item["name"]: item["text"] for item in fallback}

    collected: dict[str, str] = {}
    raw_sections = raw_payload.get("sections")
    if isinstance(raw_sections, list):
        for item in raw_sections:
            if not isinstance(item, dict):
                continue
            section_name = normalize_section_name(item.get("name"))
            if not section_name:
                continue
            text = compact_text(item.get("text") or item.get("script") or item.get("body"))
            if text and section_name not in collected:
                collected[section_name] = text
    elif isinstance(raw_sections, dict):
        for key, value in raw_sections.items():
            section_name = normalize_section_name(key)
            if not section_name:
                continue
            text = compact_text(value)
            if text and section_name not in collected:
                collected[section_name] = text

    for section_name in SECTION_ORDER:
        if section_name == "hook":
            direct = compact_text(raw_payload.get("hook") or raw_payload.get("hook_text"))
        elif section_name == "closing":
            direct = compact_text(raw_payload.get("closing") or raw_payload.get("closing_text"))
        else:
            direct = compact_text(raw_payload.get(f"{section_name}_text"))
        if direct and section_name not in collected:
            collected[section_name] = direct

    normalized: list[dict[str, str]] = []
    for section_name in SECTION_ORDER:
        text = collected.get(section_name) or fallback_by_name.get(section_name, "")
        normalized.append({"name": section_name, "text": compact_text(text)})
    return normalized


def build_script_from_sections(sections: list[dict[str, str]]) -> str:
    return compact_text(" ".join(compact_text(section.get("text")) for section in sections))


def simplify_hook_text(value: Any, *, max_chars: int = 82) -> str:
    text = compact_text(value)
    if not text:
        return ""
    first_sentence = split_sentences(text)[0]
    return compact_with_limit(first_sentence, max_chars)


def normalize_cta_only(cta: Any) -> str:
    text = compact_text(cta)
    if not text:
        return ""
    return ensure_sentence_end(text)


def build_shorts_firm_title(raw_title: Any, fallback_title: Any, *, title_prefix: str) -> str:
    base = compact_text(raw_title) or compact_text(fallback_title) or "미국장 핵심 기업 쇼츠"
    prefix = compact_text(title_prefix)
    if not prefix:
        return base
    if base.startswith(prefix):
        return base
    joiner = ""
    if prefix.endswith(("|", "/", "-", "·", ":", "｜")):
        joiner = " "
    elif not prefix.endswith(" "):
        joiner = " "
    return f"{prefix}{joiner}{base}"


def iter_script_turns(script_json: dict[str, Any]) -> list[dict[str, Any]]:
    scripts = script_json.get("scripts")
    if not isinstance(scripts, list):
        return []
    return [item for item in scripts if isinstance(item, dict)]


def resolve_chapter_range(script_json: dict[str, Any], chapter_name: str) -> tuple[int, int] | None:
    chapters = script_json.get("chapter")
    if not isinstance(chapters, list):
        return None
    for chapter in chapters:
        if not isinstance(chapter, dict):
            continue
        name = compact_text(chapter.get("name")).lower()
        if name != chapter_name.lower():
            continue
        start_id = chapter.get("start_id")
        end_id = chapter.get("end_id")
        if isinstance(start_id, int) and isinstance(end_id, int) and end_id >= start_id:
            return start_id, end_id
    return None


def collect_source_tickers(turns: list[dict[str, Any]]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for turn in turns:
        sources = turn.get("sources")
        if not isinstance(sources, list):
            continue
        for source in sources:
            if not isinstance(source, dict):
                continue
            ticker = normalize_ticker(source.get("ticker"))
            if not ticker or not is_company_ticker(ticker) or ticker in seen:
                continue
            seen.add(ticker)
            out.append(ticker)
    return out


def extract_candidate_tickers(script_json: dict[str, Any], max_count: int) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()

    def add_ticker(value: Any) -> None:
        ticker = normalize_ticker(value)
        if not ticker or not is_company_ticker(ticker) or ticker in seen:
            return
        seen.add(ticker)
        out.append(ticker)

    for ticker in script_json.get("user_tickers") or []:
        add_ticker(ticker)
        if len(out) >= max_count:
            return out

    turns = iter_script_turns(script_json)
    ticker_chapter = resolve_chapter_range(script_json, "ticker")
    chapter_turns: list[dict[str, Any]] = []
    if ticker_chapter is not None:
        start_id, end_id = ticker_chapter
        for turn in turns:
            turn_id = turn.get("id")
            if isinstance(turn_id, int) and start_id <= turn_id <= end_id:
                chapter_turns.append(turn)

    for ticker in collect_source_tickers(chapter_turns):
        add_ticker(ticker)
        if len(out) >= max_count:
            return out

    for ticker in collect_source_tickers(turns):
        add_ticker(ticker)
        if len(out) >= max_count:
            return out

    return out


def turn_mentions_ticker(turn: dict[str, Any], ticker: str) -> bool:
    text = compact_text(turn.get("text")).upper()
    if text and re.search(rf"(?<![A-Z0-9]){re.escape(ticker)}(?![A-Z0-9])", text):
        return True
    sources = turn.get("sources")
    if not isinstance(sources, list):
        return False
    for source in sources:
        if not isinstance(source, dict):
            continue
        if normalize_ticker(source.get("ticker")) == ticker:
            return True
    return False


def extract_ticker_reason(script_json: dict[str, Any], ticker: str, max_len: int = 220) -> str:
    turns = iter_script_turns(script_json)
    ticker_chapter = resolve_chapter_range(script_json, "ticker")
    priority: list[dict[str, Any]] = []
    fallback: list[dict[str, Any]] = []
    for turn in turns:
        if not turn_mentions_ticker(turn, ticker):
            continue
        if ticker_chapter and isinstance(turn.get("id"), int):
            if ticker_chapter[0] <= turn["id"] <= ticker_chapter[1]:
                priority.append(turn)
                continue
        fallback.append(turn)

    candidate_turns = priority or fallback
    if not candidate_turns:
        return ""

    analyst_turns = [turn for turn in candidate_turns if compact_text(turn.get("speaker")) == "해설자"]
    if analyst_turns:
        candidate_turns = analyst_turns

    merged = compact_text(" ".join(compact_text(turn.get("text")) for turn in candidate_turns[:2]))
    summary = compact_text(" ".join(split_sentences(merged)[:2]))
    return compact_with_limit(summary, max_len)


def extract_history_points(frame: Any) -> list[tuple[dt.date, float]]:
    if frame is None or not hasattr(frame, "iterrows"):
        return []

    points: list[tuple[dt.date, float]] = []
    for index_value, row in frame.iterrows():
        date_value: dt.date | None = None
        if hasattr(index_value, "tz_convert"):
            try:
                if index_value.tzinfo is not None:
                    index_value = index_value.tz_convert("America/New_York")
            except Exception:
                pass
        if hasattr(index_value, "date"):
            try:
                date_value = index_value.date()
            except Exception:
                date_value = None
        if date_value is None:
            continue

        close_value = None
        if hasattr(row, "get"):
            close_value = row.get("Close")
            if close_value is None:
                close_value = row.get("Adj Close")
        close = normalize_float(close_value)
        if close is None or close <= 0:
            continue
        points.append((date_value, close))
    points.sort(key=lambda item: item[0])
    return points


def fetch_market_snapshot(ticker: str, target_date: dt.date | None) -> dict[str, Any]:
    as_of = target_date or dt.date.today()
    output = {
        "name": "",
        "as_of": as_of.isoformat(),
        "day_change_pct": None,
        "month_change_pct": None,
        "market_cap": None,
        "pe_ratio": None,
        "pbr": None,
        "roe": None,
    }

    ticker_obj = yf.Ticker(ticker)
    frame = None
    start = (as_of - dt.timedelta(days=120)).isoformat()
    end = (as_of + dt.timedelta(days=3)).isoformat()
    try:
        frame = ticker_obj.history(start=start, end=end, interval="1d", auto_adjust=False)
    except Exception as exc:
        logger.warning("yfinance history fetch failed: %s (%s)", ticker, exc)
    if frame is None or getattr(frame, "empty", True):
        try:
            frame = ticker_obj.history(period="6mo", interval="1d", auto_adjust=False)
        except Exception as exc:
            logger.warning("yfinance history(period=6mo) failed: %s (%s)", ticker, exc)
            frame = None

    points = extract_history_points(frame)
    if points:
        latest_idx = len(points) - 1
        if target_date is not None:
            valid = [idx for idx, (date_value, _) in enumerate(points) if date_value <= target_date]
            if valid:
                latest_idx = valid[-1]
        latest_date, latest_close = points[latest_idx]
        output["as_of"] = latest_date.isoformat()

        if latest_idx > 0:
            prev_close = points[latest_idx - 1][1]
            if prev_close > 0:
                output["day_change_pct"] = (latest_close / prev_close - 1.0) * 100.0

        month_anchor = (target_date or latest_date) - dt.timedelta(days=30)
        anchor_candidates = [item for item in points if item[0] <= month_anchor]
        anchor = anchor_candidates[-1] if anchor_candidates else points[0]
        if anchor[1] > 0 and latest_date > anchor[0]:
            output["month_change_pct"] = (latest_close / anchor[1] - 1.0) * 100.0

    fast_info = {}
    try:
        maybe_fast = ticker_obj.fast_info
        if isinstance(maybe_fast, dict):
            fast_info = maybe_fast
    except Exception:
        fast_info = {}

    info = {}
    try:
        maybe_info = ticker_obj.info
        if isinstance(maybe_info, dict):
            info = maybe_info
    except Exception as exc:
        logger.warning("yfinance info fetch failed: %s (%s)", ticker, exc)

    output["name"] = compact_text(info.get("shortName") or info.get("longName"))
    output["market_cap"] = normalize_float(fast_info.get("market_cap"))
    if output["market_cap"] is None:
        output["market_cap"] = normalize_float(info.get("marketCap"))
    output["pe_ratio"] = normalize_float(info.get("trailingPE"))
    if output["pe_ratio"] is None:
        output["pe_ratio"] = normalize_float(info.get("forwardPE"))
    output["pbr"] = normalize_float(info.get("priceToBook"))
    output["roe"] = normalize_roe_percent(info.get("returnOnEquity"))
    return output


def build_company_context(script_json: dict[str, Any], max_count: int) -> list[dict[str, Any]]:
    target_date = parse_date_token(script_json.get("date"))
    tickers = extract_candidate_tickers(script_json, max_count=max_count)
    rows: list[dict[str, Any]] = []
    for ticker in tickers:
        reason = extract_ticker_reason(script_json, ticker)
        snapshot = fetch_market_snapshot(ticker, target_date)
        day_change_pct = normalize_float(snapshot.get("day_change_pct"))
        month_change_pct = normalize_float(snapshot.get("month_change_pct"))
        market_cap = normalize_float(snapshot.get("market_cap"))
        pe_ratio = normalize_float(snapshot.get("pe_ratio"))
        pbr = normalize_float(snapshot.get("pbr"))
        roe = normalize_roe_percent(snapshot.get("roe"))
        rows.append(
            {
                "ticker": ticker,
                "name": compact_text(snapshot.get("name")),
                "as_of": compact_text(snapshot.get("as_of")),
                "day_change_pct": day_change_pct,
                "day_change_display": format_percent(day_change_pct),
                "month_change_pct": month_change_pct,
                "month_change_display": format_percent(month_change_pct),
                "market_cap": market_cap,
                "market_cap_display": format_market_cap(market_cap),
                "pe_ratio": pe_ratio,
                "pe_ratio_display": format_pe_ratio(pe_ratio),
                "pbr": pbr,
                "pbr_display": format_pbr(pbr),
                "roe": roe,
                "roe_display": format_roe(roe),
                "reason": reason,
            }
        )
    return rows


def build_company_context_summary(company_context: list[dict[str, Any]]) -> str:
    if not company_context:
        return "- 회사 컨텍스트를 확보하지 못했습니다. script.json 근거만 사용하세요."
    lines: list[str] = []
    for row in company_context:
        lines.append(
            "- {ticker} ({name}): 1D {day}, 1M {month}, 시총 {market_cap}, PER {pe}, PBR {pbr}, ROE {roe}, 이유 {reason}".format(
                ticker=row.get("ticker") or "N/A",
                name=row.get("name") or "N/A",
                day=row.get("day_change_display") or "N/A",
                month=row.get("month_change_display") or "N/A",
                market_cap=row.get("market_cap_display") or "N/A",
                pe=row.get("pe_ratio_display") or "N/A",
                pbr=row.get("pbr_display") or "N/A",
                roe=row.get("roe_display") or "N/A",
                reason=row.get("reason") or "N/A",
            )
        )
    return "\n".join(lines)


def normalize_company_moves(
    raw_values: Any,
    fallback_values: list[dict[str, Any]],
    *,
    lang: str,
) -> list[dict[str, Any]]:
    fallback_by_ticker = {
        normalize_ticker(item.get("ticker")): item
        for item in fallback_values
        if normalize_ticker(item.get("ticker"))
    }

    output: list[dict[str, Any]] = []
    seen: set[str] = set()
    values = raw_values if isinstance(raw_values, list) else []

    for value in values:
        if not isinstance(value, dict):
            continue
        ticker = normalize_ticker(value.get("ticker"))
        if not ticker or ticker in seen or not is_company_ticker(ticker):
            continue
        fallback = fallback_by_ticker.get(ticker)
        # Enforce data authority: pricing/valuation metrics must come from company_context (yfinance).
        if not fallback:
            continue
        seen.add(ticker)
        day_change_pct = normalize_float(fallback.get("day_change_pct"))
        month_change_pct = normalize_float(fallback.get("month_change_pct"))
        market_cap = normalize_float(fallback.get("market_cap"))
        pe_ratio = normalize_float(fallback.get("pe_ratio"))
        pbr = normalize_float(fallback.get("pbr"))
        roe = normalize_roe_percent(fallback.get("roe"))

        move = {
            "ticker": ticker,
            "name": compact_text(fallback.get("name") or value.get("name")),
            "as_of": compact_text(fallback.get("as_of") or value.get("as_of")),
            "day_change_pct": day_change_pct,
            "day_change_display": format_percent(day_change_pct),
            "month_change_pct": month_change_pct,
            "month_change_display": format_percent(month_change_pct),
            "market_cap": market_cap,
            "market_cap_display": format_market_cap(market_cap),
            "pe_ratio": pe_ratio,
            "pe_ratio_display": format_pe_ratio(pe_ratio),
            "pbr": pbr,
            "pbr_display": format_pbr(pbr),
            "roe": roe,
            "roe_display": format_roe(roe),
            "reason": compact_with_limit(value.get("reason") or fallback.get("reason"), 220),
        }
        move["spoken_text"] = compact_text(value.get("spoken_text") or value.get("tts_text")) or build_company_spoken_text(
            move, lang=lang
        )
        move["slide_points"] = build_company_slide_points(
            {
                **move,
                "slide_points": value.get("slide_points"),
            },
            lang=lang,
        )
        move["valuation_note"] = compact_text(
            value.get("valuation_note")
            or (
                f"시총 {move['market_cap_display']}, PER {move['pe_ratio_display']}, PBR {move['pbr_display']}, ROE {move['roe_display']}"
                if lang == "ko"
                else f"Market Cap {move['market_cap_display']}, PER {move['pe_ratio_display']}, PBR {move['pbr_display']}, ROE {move['roe_display']}"
            )
        )
        move["move_summary"] = compact_text(value.get("move_summary")) or compact_with_limit(move["reason"], 120)

        output.append(
            move
        )
        if len(output) >= MAX_COMPANY_COUNT:
            break

    for fallback in fallback_values:
        ticker = normalize_ticker(fallback.get("ticker"))
        if not ticker or ticker in seen or not is_company_ticker(ticker):
            continue
        seen.add(ticker)
        fallback_move = {
            "ticker": ticker,
            "name": compact_text(fallback.get("name")),
            "as_of": compact_text(fallback.get("as_of")),
            "day_change_pct": normalize_float(fallback.get("day_change_pct")),
            "day_change_display": format_percent(normalize_float(fallback.get("day_change_pct"))),
            "month_change_pct": normalize_float(fallback.get("month_change_pct")),
            "month_change_display": format_percent(normalize_float(fallback.get("month_change_pct"))),
            "market_cap": normalize_float(fallback.get("market_cap")),
            "market_cap_display": format_market_cap(normalize_float(fallback.get("market_cap"))),
            "pe_ratio": normalize_float(fallback.get("pe_ratio")),
            "pe_ratio_display": format_pe_ratio(normalize_float(fallback.get("pe_ratio"))),
            "pbr": normalize_float(fallback.get("pbr")),
            "pbr_display": format_pbr(normalize_float(fallback.get("pbr"))),
            "roe": normalize_roe_percent(fallback.get("roe")),
            "roe_display": format_roe(normalize_roe_percent(fallback.get("roe"))),
            "reason": compact_with_limit(fallback.get("reason"), 220),
        }
        fallback_move["spoken_text"] = build_company_spoken_text(fallback_move, lang=lang)
        fallback_move["slide_points"] = build_company_slide_points(fallback_move, lang=lang)
        fallback_move["valuation_note"] = (
            f"시총 {fallback_move['market_cap_display']}, PER {fallback_move['pe_ratio_display']}, PBR {fallback_move['pbr_display']}, ROE {fallback_move['roe_display']}"
            if lang == "ko"
            else f"Market Cap {fallback_move['market_cap_display']}, PER {fallback_move['pe_ratio_display']}, PBR {fallback_move['pbr_display']}, ROE {fallback_move['roe_display']}"
        )
        fallback_move["move_summary"] = compact_with_limit(fallback_move["reason"], 120)
        output.append(fallback_move)
        if len(output) >= MAX_COMPANY_COUNT:
            break

    return output


def unique_tickers_from_sources(sources: list[dict[str, Any]]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for source in sources:
        ticker = normalize_ticker(source.get("ticker"))
        if not ticker or ticker in seen:
            continue
        seen.add(ticker)
        out.append(ticker)
    return out


def normalize_result(
    raw_payload: dict[str, Any],
    *,
    script_json: dict[str, Any],
    duration: int,
    company_context: list[dict[str, Any]],
    final_cta: str,
    title_prefix: str,
) -> dict[str, Any]:
    raw_script = compact_text(raw_payload.get("script"))
    base_sections = normalize_sections(raw_payload, raw_script)
    if not raw_script:
        raw_script = build_script_from_sections(base_sections)

    metadata = raw_payload.get("metadata")
    if not isinstance(metadata, dict):
        metadata = {}

    lang = detect_output_lang(script_json.get("nutshell"), raw_script, raw_payload.get("title"))
    hook = simplify_hook_text(raw_payload.get("hook") or base_sections[0]["text"] or raw_script)
    closing = normalize_cta_only(final_cta)
    if not closing:
        closing = "구독과 좋아요 부탁드립니다."

    key_points = metadata.get("key_points")
    if not isinstance(key_points, list):
        key_points = []
    normalized_points = normalize_string_list(key_points, 8)

    sources = normalize_sources(raw_payload.get("sources"))
    company_moves = normalize_company_moves(metadata.get("company_moves"), company_context, lang=lang)
    if len(company_moves) < MIN_COMPANY_COUNT:
        supplemental_moves = normalize_company_moves([], company_context, lang=lang)
        existing_tickers = {normalize_ticker(item.get("ticker")) for item in company_moves}
        for move in supplemental_moves:
            ticker = normalize_ticker(move.get("ticker"))
            if ticker and ticker in existing_tickers:
                continue
            company_moves.append(move)
            if ticker:
                existing_tickers.add(ticker)
            if len(company_moves) >= MIN_COMPANY_COUNT:
                break
    if not company_moves:
        logger.warning("No company moves found from LLM. Falling back to company context only.")

    company_sections: list[dict[str, Any]] = []
    for idx, move in enumerate(company_moves):
        ticker = normalize_ticker(move.get("ticker"))
        spoken_text = compact_text(move.get("spoken_text")) or build_company_spoken_text(move, lang=lang)
        section_name = f"company_{idx + 1}"
        company_sections.append(
            {
                "id": idx + 1,
                "name": section_name,
                "ticker": ticker,
                "text": spoken_text,
            }
        )

    sections: list[dict[str, Any]] = [{"id": 0, "name": "hook", "text": hook}]
    sections.extend(company_sections)
    sections.append({"id": len(company_sections) + 1, "name": "closing", "text": closing})
    script_text = build_script_from_sections([{"name": item["name"], "text": item["text"]} for item in sections])

    if not normalized_points:
        inferred_points: list[str] = []
        for move in company_moves:
            summary = compact_text(move.get("move_summary")) or compact_text(move.get("reason"))
            if summary:
                inferred_points.append(compact_with_limit(summary, 80))
        if not inferred_points:
            inferred_points = [compact_with_limit(section["text"], 80) for section in sections if section["text"]]
        normalized_points = normalize_string_list(inferred_points, 6)

    featured_tickers = metadata.get("featured_tickers")
    candidates = featured_tickers if isinstance(featured_tickers, list) else []
    normalized_tickers: list[str] = []
    seen: set[str] = set()
    for ticker in candidates:
        cleaned = normalize_ticker(ticker)
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        normalized_tickers.append(cleaned)
    for ticker in unique_tickers_from_sources(sources):
        if ticker in seen:
            continue
        seen.add(ticker)
        normalized_tickers.append(ticker)
    for move in company_moves:
        ticker = normalize_ticker(move.get("ticker"))
        if not ticker or ticker in seen:
            continue
        seen.add(ticker)
        normalized_tickers.append(ticker)

    estimated_duration = int(round(len(script_text) / MEASURED_CHARS_PER_SEC))
    date_value = compact_text(raw_payload.get("date")) or compact_text(script_json.get("date"))

    return {
        "date": date_value,
        "title": build_shorts_firm_title(
            raw_payload.get("title"),
            script_json.get("nutshell"),
            title_prefix=title_prefix,
        ),
        "duration_target": f"{duration}초",
        "hook": hook,
        "sections": sections,
        "script": script_text,
        "sources": sources,
        "metadata": {
            "character_count": len(script_text),
            "estimated_duration_seconds": max(1, estimated_duration),
            "key_points": normalized_points[:6],
            "featured_tickers": normalized_tickers[:6],
            "company_moves": company_moves,
            "company_count": len(company_moves),
        },
    }


def load_prompt_config(config_path: Path) -> dict[str, Any]:
    if not config_path.exists():
        raise FileNotFoundError(f"Prompt config not found: {config_path}")
    payload = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid YAML structure: {config_path}")
    return payload


def load_podcast_inputs(podcast_dir: Path) -> tuple[dict[str, Any], str]:
    script_path = podcast_dir / "script.json"
    metadata_path = podcast_dir / "metadata.txt"
    if not script_path.exists():
        raise FileNotFoundError(f"script.json not found: {script_path}")
    if not metadata_path.exists():
        raise FileNotFoundError(f"metadata.txt not found: {metadata_path}")

    script_json = json.loads(script_path.read_text(encoding="utf-8"))
    metadata_txt = metadata_path.read_text(encoding="utf-8")
    logger.info("Loaded podcast input: %s", podcast_dir)
    logger.info("  - scripts: %d", len(script_json.get("scripts", []) if isinstance(script_json.get("scripts"), list) else []))
    logger.info("  - metadata chars: %d", len(metadata_txt))
    return script_json, metadata_txt


def resolve_final_cta(prompt_config: dict[str, Any], script_json: dict[str, Any]) -> str:
    script_cfg = prompt_config.get("script")
    if not isinstance(script_cfg, dict):
        return "구독과 좋아요 부탁드립니다."
    final_cta = script_cfg.get("final_cta")
    if not isinstance(final_cta, dict):
        return "구독과 좋아요 부탁드립니다."
    text_blob = compact_text(script_json.get("nutshell")) + " " + compact_text(script_json.get("date"))
    lang = "ko" if re.search(r"[가-힣]", text_blob) else "en"
    return compact_text(final_cta.get(lang) or final_cta.get("ko")) or "구독과 좋아요 부탁드립니다."


def resolve_title_prefix(prompt_config: dict[str, Any], script_json: dict[str, Any]) -> str:
    script_cfg = prompt_config.get("script")
    if not isinstance(script_cfg, dict):
        return ""
    title_prefix = script_cfg.get("title_prefix")
    if not isinstance(title_prefix, dict):
        return ""
    text_blob = compact_text(script_json.get("nutshell")) + " " + compact_text(script_json.get("date"))
    lang = "ko" if re.search(r"[가-힣]", text_blob) else "en"
    return compact_text(title_prefix.get(lang) or title_prefix.get("ko"))


def generate_shorts_firm_script(
    *,
    script_json: dict[str, Any],
    metadata_txt: str,
    duration: int,
    llm: Any,
    prompt_config: dict[str, Any],
) -> dict[str, Any]:
    script_cfg = prompt_config.get("script")
    if not isinstance(script_cfg, dict):
        raise ValueError("Invalid prompt config: missing script block")
    system_prompt = compact_text(script_cfg.get("system"))
    user_template = script_cfg.get("user_template")
    if not isinstance(user_template, str) or not user_template.strip():
        raise ValueError("Invalid prompt config: missing script.user_template")

    date_value = compact_text(script_json.get("date"))
    company_context = build_company_context(script_json, max_count=MAX_COMPANY_COUNT)
    company_summary = build_company_context_summary(company_context)
    final_cta = resolve_final_cta(prompt_config, script_json)
    title_prefix = resolve_title_prefix(prompt_config, script_json)
    prompt_lang = detect_output_lang(script_json.get("nutshell"), metadata_txt)
    company_char_guide_by_count = build_company_char_guide_by_count(
        script_cfg,
        duration=duration,
        min_count=MIN_COMPANY_COUNT,
        max_count=MAX_COMPANY_COUNT,
    )
    company_char_guide_lines = format_company_char_guide_lines(
        company_char_guide_by_count,
        lang=prompt_lang,
    )

    user_prompt = user_template.format(
        date=date_value,
        duration=duration,
        company_char_guide_by_count=company_char_guide_lines,
        script_json=json.dumps(script_json, ensure_ascii=False, indent=2),
        metadata_txt=metadata_txt,
        company_context_json=json.dumps(company_context, ensure_ascii=False, indent=2),
        company_context_summary=company_summary,
    )
    full_prompt = f"{system_prompt}\n\n{user_prompt}" if system_prompt else user_prompt

    logger.info("Generating shorts-firm script")
    logger.info("  - duration: %ss", duration)
    logger.info("  - company context rows: %d", len(company_context))

    response = llm.invoke(full_prompt)
    response_text = response_to_text(response.content)
    raw_payload = extract_json_object(response_text)

    normalized = normalize_result(
        raw_payload,
        script_json=script_json,
        duration=duration,
        company_context=company_context,
        final_cta=final_cta,
        title_prefix=title_prefix,
    )
    return normalized


def save_output(payload: dict[str, Any], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    logger.info("Saved shorts-firm script: %s", output_path)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate independent shorts-firm script JSON")
    parser.add_argument("podcast_dir", type=Path, help="Path containing script.json and metadata.txt")
    parser.add_argument(
        "--duration",
        type=int,
        default=DEFAULT_DURATION,
        help=f"Target duration seconds ({MIN_DURATION}~{MAX_DURATION}, default: {DEFAULT_DURATION})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output JSON path (default: <podcast_dir>/shorts-firm/script.json)",
    )
    parser.add_argument(
        "--prefix",
        type=str,
        default="SHORTS_FIRM",
        help="LLM env prefix for shared.utils.llm.build_llm (default: SHORTS_FIRM)",
    )
    parser.add_argument(
        "--prompt-config",
        type=Path,
        default=PROMPT_CONFIG_PATH,
        help=f"Prompt YAML path (default: {PROMPT_CONFIG_PATH})",
    )
    parser.add_argument("--debug", action="store_true", help="Enable debug logs")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.debug:
        logger.setLevel(logging.DEBUG)

    if args.duration < MIN_DURATION or args.duration > MAX_DURATION:
        logger.error("--duration must be between %d and %d seconds", MIN_DURATION, MAX_DURATION)
        return 2

    load_env_from_yaml(logger=logger)
    load_dotenv(ROOT_DIR / ".env", override=False)

    podcast_dir = args.podcast_dir
    if not podcast_dir.exists():
        logger.error("podcast_dir not found: %s", podcast_dir)
        return 2

    prompt_config_path = args.prompt_config
    if not prompt_config_path.is_absolute():
        prompt_config_path = (ROOT_DIR / prompt_config_path).resolve()

    output_path = args.output
    if output_path is None:
        output_path = podcast_dir / "shorts-firm" / "script.json"
    elif not output_path.is_absolute():
        output_path = (ROOT_DIR / output_path).resolve()

    try:
        prompt_config = load_prompt_config(prompt_config_path)
        script_json, metadata_txt = load_podcast_inputs(podcast_dir)
        llm = build_llm(prefix=args.prefix, logger=logger)
        payload = generate_shorts_firm_script(
            script_json=script_json,
            metadata_txt=metadata_txt,
            duration=args.duration,
            llm=llm,
            prompt_config=prompt_config,
        )
        save_output(payload, output_path)
        return 0
    except Exception as exc:
        logger.error("Failed to generate shorts-firm script: %s", exc, exc_info=args.debug)
        return 1


if __name__ == "__main__":
    sys.exit(main())
