"""Prepare independent slide input/template artifacts for shorts-firm."""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Any

import yaml
from dotenv import load_dotenv

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

SLIDES_CONFIG_PATH = ROOT_DIR / "shorts-firm" / "prompt" / "shorts_firm_slides.yaml"
SECTION_ORDER = ("hook", "company_1", "closing")
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
ALLOWED_PHASES = {"hook", "market", "insight", "finale", "watch"}
ALLOWED_THEMES = {"alert", "bear", "bull", "neutral", "macro", "flash"}
MAX_COMPANY_BULLETS = 3


def compact_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def default_cta_text(lang: str) -> str:
    if compact_text(lang).lower() == "en":
        return "Please like and subscribe."
    return "구독과 좋아요 부탁드립니다."


def parse_date_arg(value: str) -> str:
    token = value.replace("-", "").strip()
    if len(token) != 8 or not token.isdigit():
        raise ValueError(f"Invalid date format: {value}")
    return token


def default_audio_file_name(date: str) -> str:
    return f"shortsfirm{date}.mp3"


def resolve_display_date(script_payload: dict[str, Any], fallback_date: str) -> str:
    try:
        return parse_date_arg(str(script_payload.get("date") or ""))
    except ValueError:
        return fallback_date


def normalize_section_name(value: Any) -> str:
    key = compact_text(value).lower().replace("-", "_")
    aliased = SECTION_NAME_ALIASES.get(key)
    if aliased:
        return aliased
    if key == "company":
        return "company_1"
    if re.match(r"^company_[a-z0-9]+$", key):
        return key
    if re.match(r"^company\d+$", key):
        return f"company_{key[len('company') :]}"
    return ""


def is_company_section_name(value: Any) -> bool:
    return normalize_section_name(value).startswith("company_")


def section_group_name(value: Any) -> str:
    name = normalize_section_name(value)
    if name.startswith("company_"):
        return "company"
    return name


def load_yaml_config(config_path: Path) -> dict[str, Any]:
    if not config_path.exists():
        raise FileNotFoundError(f"Slides config not found: {config_path}")
    payload = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid YAML structure: {config_path}")
    return payload


def resolve_slides_config_node(config: dict[str, Any]) -> dict[str, Any]:
    slides_cfg = config.get("slides") if isinstance(config.get("slides"), dict) else None
    if isinstance(slides_cfg, dict):
        return slides_cfg
    return config


def resolve_slides_defaults(config: dict[str, Any]) -> dict[str, Any]:
    node = resolve_slides_config_node(config)
    defaults = node.get("defaults")
    return defaults if isinstance(defaults, dict) else {}


def load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(path)
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid JSON object: {path}")
    return payload


def parse_duration_seconds(script_payload: dict[str, Any], timing_payload: dict[str, Any] | None) -> float:
    if timing_payload and isinstance(timing_payload.get("totalDurationSeconds"), (int, float)):
        duration = float(timing_payload["totalDurationSeconds"])
        if duration > 0:
            return duration
    metadata = script_payload.get("metadata")
    if isinstance(metadata, dict) and isinstance(metadata.get("estimated_duration_seconds"), (int, float)):
        duration = float(metadata["estimated_duration_seconds"])
        if duration > 0:
            return duration
    target = compact_text(script_payload.get("duration_target"))
    match = re.search(r"(\d+)", target)
    if match:
        return float(match.group(1))
    return 90.0


def extract_sections(script_payload: dict[str, Any], duration_seconds: float) -> list[dict[str, Any]]:
    raw_sections = script_payload.get("sections")
    ordered_sections: list[dict[str, str]] = []
    seen_names: set[str] = set()

    if isinstance(raw_sections, list):
        for item in raw_sections:
            if not isinstance(item, dict):
                continue
            name = normalize_section_name(item.get("name"))
            if not name:
                continue
            text = compact_text(item.get("text") or item.get("script") or item.get("body"))
            if name in seen_names:
                continue
            seen_names.add(name)
            ordered_sections.append({"name": name, "text": text})
    elif isinstance(raw_sections, dict):
        for key, value in raw_sections.items():
            name = normalize_section_name(key)
            if not name:
                continue
            if name in seen_names:
                continue
            seen_names.add(name)
            ordered_sections.append({"name": name, "text": compact_text(value)})

    if not ordered_sections:
        full_script = compact_text(script_payload.get("script"))
        fallback_hook = compact_text(script_payload.get("hook"))
        ordered_sections = [
            {"name": "hook", "text": fallback_hook},
            {"name": "company_1", "text": full_script},
            {"name": "closing", "text": compact_text(script_payload.get("closing"))},
        ]
    else:
        by_name = {item["name"]: item["text"] for item in ordered_sections}
        if "hook" not in by_name:
            ordered_sections.insert(0, {"name": "hook", "text": compact_text(script_payload.get("hook"))})
            by_name = {item["name"]: item["text"] for item in ordered_sections}
        if "closing" not in by_name:
            closing_text = compact_text(script_payload.get("closing") or script_payload.get("closing_text"))
            ordered_sections.append({"name": "closing", "text": closing_text})
            by_name = {item["name"]: item["text"] for item in ordered_sections}
        company_sections = [item for item in ordered_sections if is_company_section_name(item.get("name"))]
        if not company_sections:
            company_text = compact_text(script_payload.get("script"))
            ordered_sections.insert(len(ordered_sections) - 1, {"name": "company_1", "text": company_text})

    span = duration_seconds / max(1, len(ordered_sections))
    sections: list[dict[str, Any]] = []
    cursor = 0.0
    for idx, item in enumerate(ordered_sections):
        start_sec = cursor
        end_sec = duration_seconds if idx == len(ordered_sections) - 1 else cursor + span
        sections.append(
            {
                "id": idx,
                "name": item["name"],
                "startSec": round(start_sec, 3),
                "endSec": round(end_sec, 3),
                "text": compact_text(item.get("text")),
            }
        )
        cursor = end_sec
    return sections


def merge_timing(sections: list[dict[str, Any]], timing_payload: dict[str, Any] | None, duration_seconds: float) -> list[dict[str, Any]]:
    out = [dict(section) for section in sections]
    timing_entries: list[dict[str, Any]] = []

    if timing_payload:
        raw_sections = timing_payload.get("sections")
        if isinstance(raw_sections, list):
            for item in raw_sections:
                if not isinstance(item, dict):
                    continue
                name = normalize_section_name(item.get("name"))
                if not name:
                    name = compact_text(item.get("name")).lower()
                start_sec = item.get("startSec")
                end_sec = item.get("endSec")
                if not isinstance(start_sec, (int, float)) or not isinstance(end_sec, (int, float)):
                    continue
                if float(end_sec) <= float(start_sec):
                    continue
                timing_entries.append(
                    {
                        "name": name,
                        "startSec": float(start_sec),
                        "endSec": float(end_sec),
                    }
                )
    timing_entries.sort(key=lambda row: float(row["startSec"]))

    timing_by_name = {compact_text(item["name"]): item for item in timing_entries if compact_text(item["name"])}
    for section in out:
        name = compact_text(section.get("name"))
        timing = timing_by_name.get(name)
        if not timing:
            continue
        section["startSec"] = round(float(timing["startSec"]), 3)
        section["endSec"] = round(float(timing["endSec"]), 3)

    company_indexes = [idx for idx, item in enumerate(out) if is_company_section_name(item.get("name"))]
    hook_index = next((idx for idx, item in enumerate(out) if normalize_section_name(item.get("name")) == "hook"), None)
    closing_index = next((idx for idx, item in enumerate(out) if normalize_section_name(item.get("name")) == "closing"), None)

    company_timing_entries = [item for item in timing_entries if item["name"].startswith("company_")]
    if not company_timing_entries:
        company_timing_entries = [item for item in timing_entries if item["name"] not in {"hook", "closing"}]

    def pick_timing_entry(idx: int, total: int) -> dict[str, Any]:
        if not company_timing_entries:
            return {"startSec": 0.0, "endSec": duration_seconds}
        if len(company_timing_entries) == total:
            return company_timing_entries[idx]
        if total <= 1:
            return company_timing_entries[min(idx, len(company_timing_entries) - 1)]
        mapped = round(idx * (len(company_timing_entries) - 1) / (total - 1))
        mapped = max(0, min(mapped, len(company_timing_entries) - 1))
        return company_timing_entries[mapped]

    if company_indexes and company_timing_entries:
        for idx, section_idx in enumerate(company_indexes):
            timing = pick_timing_entry(idx, len(company_indexes))
            out[section_idx]["startSec"] = round(float(timing["startSec"]), 3)
            out[section_idx]["endSec"] = round(float(timing["endSec"]), 3)

    fixed_hook_seconds = min(3.0, max(0.0, float(duration_seconds)))
    remaining_after_hook = max(0.0, float(duration_seconds) - fixed_hook_seconds)
    fixed_closing_seconds = min(3.0, remaining_after_hook)
    company_window_start = fixed_hook_seconds
    company_window_end = max(company_window_start, float(duration_seconds) - fixed_closing_seconds)

    if hook_index is not None:
        out[hook_index]["startSec"] = 0.0
        out[hook_index]["endSec"] = round(company_window_start, 3)
    if closing_index is not None:
        out[closing_index]["startSec"] = round(company_window_end, 3)
        out[closing_index]["endSec"] = round(float(duration_seconds), 3)

    if company_indexes:
        for idx, section_idx in enumerate(company_indexes):
            start_sec = float(out[section_idx].get("startSec", company_window_start))
            end_sec = float(out[section_idx].get("endSec", company_window_end))

            start_sec = max(company_window_start, start_sec)
            end_sec = min(company_window_end, end_sec)

            if idx == 0:
                start_sec = company_window_start
            if idx == len(company_indexes) - 1:
                end_sec = company_window_end
            if end_sec < start_sec:
                end_sec = start_sec

            out[section_idx]["startSec"] = round(start_sec, 3)
            out[section_idx]["endSec"] = round(end_sec, 3)

        cursor = company_window_start
        last_company_idx = company_indexes[-1]
        for section_idx in company_indexes:
            start_sec = max(cursor, float(out[section_idx]["startSec"]))
            end_sec = float(out[section_idx]["endSec"])
            if section_idx == last_company_idx:
                end_sec = company_window_end
            if end_sec < start_sec:
                end_sec = start_sec
            out[section_idx]["startSec"] = round(start_sec, 3)
            out[section_idx]["endSec"] = round(end_sec, 3)
            cursor = end_sec

    out.sort(key=lambda item: float(item["startSec"]))
    if out:
        out[0]["startSec"] = 0.0
        cursor = 0.0
        for item in out:
            start_sec = max(cursor, float(item["startSec"]))
            end_sec = float(item["endSec"])
            if end_sec < start_sec:
                end_sec = start_sec
            item["startSec"] = round(start_sec, 3)
            item["endSec"] = round(end_sec, 3)
            cursor = end_sec
        out[-1]["endSec"] = round(float(duration_seconds), 3)
    return out


def normalize_tickers(values: Any) -> list[str]:
    if not isinstance(values, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        ticker = re.sub(r"[^A-Z0-9^.-]", "", str(value).upper())
        if not ticker or ticker in seen:
            continue
        seen.add(ticker)
        out.append(ticker)
    return out


def normalize_string_list(values: Any, limit: int, max_len: int) -> list[str]:
    if not isinstance(values, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        text = compact_text(value)
        if not text:
            continue
        text = text if len(text) <= max_len else f"{text[: max_len - 1].rstrip()}…"
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(text)
        if len(out) >= limit:
            break
    return out


def response_to_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        out: list[str] = []
        for item in content:
            if isinstance(item, dict):
                text = item.get("text")
                if text:
                    out.append(str(text))
            else:
                out.append(str(item))
        return "\n".join(out)
    return str(content)


def extract_json_object(raw_text: str) -> dict[str, Any]:
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("LLM response does not contain valid JSON")
    payload = json.loads(text[start : end + 1])
    if not isinstance(payload, dict):
        raise ValueError("LLM response root must be JSON object")
    return payload


def section_to_phase(section_name: str) -> str:
    name = normalize_section_name(section_name)
    if name == "hook":
        return "hook"
    if name == "closing":
        return "finale"
    if is_company_section_name(name):
        return "insight"
    return "insight"


def split_bullets_from_text(text: str, limit: int) -> list[str]:
    if not text:
        return []
    parts = [compact_text(item) for item in re.split(r"(?<=[.!?])\s+", text) if compact_text(item)]
    return normalize_string_list(parts, limit=limit, max_len=72)


def truncate_text(value: Any, max_len: int) -> str:
    text = compact_text(value)
    if not text:
        return ""
    if len(text) <= max_len:
        return text
    return f"{text[: max_len - 1].rstrip()}…"


def first_sentence(value: Any) -> str:
    text = compact_text(value)
    if not text:
        return ""
    parts = [compact_text(item) for item in re.split(r"(?<=[.!?])\s+", text) if compact_text(item)]
    return parts[0] if parts else text


def normalize_company_point_lines(values: Any, *, limit: int, max_len: int | None = None) -> list[str]:
    if not isinstance(values, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        text = first_sentence(value)
        if max_len is not None:
            text = truncate_text(text, max_len=max_len)
        else:
            text = compact_text(text)
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


def build_company_default_text(company_move: dict[str, Any], *, fallback: str = "") -> tuple[str, str]:
    summary = truncate_text(
        compact_text(company_move.get("move_summary")) or first_sentence(company_move.get("reason")),
        max_len=58,
    )
    reason = truncate_text(first_sentence(company_move.get("reason")) or summary, max_len=72)
    if not summary:
        summary = truncate_text(fallback, max_len=58)
    if not reason:
        reason = truncate_text(fallback or summary, max_len=72)
    return summary, reason


def build_company_bullets(company_move: dict[str, Any], *, lang: str, limit: int = MAX_COMPANY_BULLETS) -> list[str]:
    provided = normalize_company_point_lines(company_move.get("slide_points"), limit=limit, max_len=44)

    day_text = compact_text(company_move.get("day_change_display"))
    month_text = compact_text(company_move.get("month_change_display"))
    market_cap_text = compact_text(company_move.get("market_cap_display"))
    pe_text = compact_text(company_move.get("pe_ratio_display"))
    pbr_text = compact_text(company_move.get("pbr_display"))
    roe_text = compact_text(company_move.get("roe_display"))
    summary, reason = build_company_default_text(company_move)

    metric_line = ""
    metric_bits: list[str] = []
    if day_text and day_text != "N/A":
        metric_bits.append(f"1D {day_text}" if lang == "en" else f"1일 {day_text}")
    if month_text and month_text != "N/A":
        metric_bits.append(f"1M {month_text}" if lang == "en" else f"1개월 {month_text}")
    if metric_bits:
        metric_line = " / ".join(metric_bits)

    valuation_bits: list[str] = []
    if market_cap_text and market_cap_text != "N/A":
        valuation_bits.append(f"Market Cap {market_cap_text}" if lang == "en" else f"시총 {market_cap_text}")
    if pe_text and pe_text != "N/A":
        valuation_bits.append(f"PER {pe_text}")
    if pbr_text and pbr_text != "N/A":
        valuation_bits.append(f"PBR {pbr_text}")
    if roe_text and roe_text != "N/A":
        valuation_bits.append(f"ROE {roe_text}")
    valuation_line = ", ".join(valuation_bits)

    fallback_pool = (
        [
            metric_line,
            valuation_line,
            summary,
            reason,
            "Track the next catalyst",
        ]
        if lang == "en"
        else [
            metric_line,
            valuation_line,
            summary,
            reason,
            "추가 촉매와 리스크 확인",
        ]
    )

    out: list[str] = []
    seen: set[str] = set()
    for value in provided + fallback_pool:
        text = truncate_text(first_sentence(value), max_len=44)
        if not text:
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(text)
        if len(out) >= limit:
            break
    return out[:limit]


def normalize_featured_tickers(values: Any) -> list[str | dict[str, str]]:
    if not isinstance(values, list):
        return []
    out: list[str | dict[str, str]] = []
    seen: set[str] = set()
    for value in values:
        if isinstance(value, dict):
            ticker = re.sub(r"[^A-Z0-9^.-]", "", str(value.get("ticker") or "").upper())
            if not ticker or ticker in seen:
                continue
            seen.add(ticker)
            out.append(
                {
                    "ticker": ticker,
                    "label": compact_text(value.get("label"))[:24] if compact_text(value.get("label")) else "",
                    "tag": compact_text(value.get("tag"))[:16] if compact_text(value.get("tag")) else "",
                }
            )
            continue
        ticker = re.sub(r"[^A-Z0-9^.-]", "", str(value or "").upper())
        if not ticker or ticker in seen:
            continue
        seen.add(ticker)
        out.append(ticker)
    return out


def resolve_company_moves(script_payload: dict[str, Any]) -> list[dict[str, Any]]:
    metadata = script_payload.get("metadata")
    if not isinstance(metadata, dict):
        return []
    raw = metadata.get("company_moves")
    if not isinstance(raw, list):
        return []
    return [item for item in raw if isinstance(item, dict)]


def normalize_llm_render_payload(
    *,
    llm_payload: dict[str, Any],
    date: str,
    lang: str,
    script_payload: dict[str, Any],
    sections: list[dict[str, Any]],
    duration_seconds: float,
    audio_file: str,
    config: dict[str, Any],
) -> dict[str, Any]:
    metadata = script_payload.get("metadata") if isinstance(script_payload.get("metadata"), dict) else {}
    company_moves = resolve_company_moves(script_payload)
    title = compact_text(script_payload.get("title")) or "US Market Close"
    hook = compact_text(script_payload.get("hook"))

    defaults = resolve_slides_defaults(config) if isinstance(config, dict) else {}
    phase_by_section = defaults.get("phase_by_section") if isinstance(defaults.get("phase_by_section"), dict) else {}
    theme_by_section = defaults.get("theme_by_section") if isinstance(defaults.get("theme_by_section"), dict) else {}
    eyebrow_by_section = defaults.get("eyebrow_by_section") if isinstance(defaults.get("eyebrow_by_section"), dict) else {}

    llm_meta = llm_payload.get("meta") if isinstance(llm_payload.get("meta"), dict) else {}
    raw_slides = llm_payload.get("slides") if isinstance(llm_payload.get("slides"), list) else []
    llm_slides = [item for item in raw_slides if isinstance(item, dict)]

    normalized_slides: list[dict[str, Any]] = []
    captions: list[dict[str, Any]] = []
    company_idx = 0

    for idx, section in enumerate(sections):
        section_name = compact_text(section.get("name"))
        section_key = normalize_section_name(section_name)
        section_group = section_group_name(section_name)
        expected_phase = compact_text(phase_by_section.get(section_name) or phase_by_section.get(section_group)) or section_to_phase(section_name)
        expected_theme = compact_text(theme_by_section.get(section_name) or theme_by_section.get(section_group)) or "neutral"
        expected_eyebrow = compact_text(eyebrow_by_section.get(section_name) or eyebrow_by_section.get(section_group)) or section_name

        llm_slide = llm_slides[idx] if idx < len(llm_slides) else {}
        if not isinstance(llm_slide, dict):
            llm_slide = {}

        phase = compact_text(llm_slide.get("phase")).lower()
        if phase not in ALLOWED_PHASES:
            phase = expected_phase

        theme = compact_text(llm_slide.get("theme")).lower()
        if theme not in ALLOWED_THEMES:
            theme = expected_theme

        company_move = company_moves[company_idx] if company_idx < len(company_moves) else {}
        if is_company_section_name(section_name):
            company_idx += 1

        company_summary, company_reason = build_company_default_text(
            company_move,
            fallback=compact_text(section.get("text")) or hook,
        )

        default_headline = title if section_key == "hook" else company_summary or expected_eyebrow
        if section_key == "closing":
            default_headline = compact_text(section.get("text")) or "Wrap Up"
        if is_company_section_name(section_name):
            default_subheadline = company_summary or compact_text(section.get("text")) or hook
            default_body = company_reason or default_subheadline
        else:
            default_subheadline = compact_text(section.get("text")) or hook
            default_body = compact_text(section.get("text")) or default_subheadline

        bullets = normalize_company_point_lines(llm_slide.get("bullets"), limit=MAX_COMPANY_BULLETS)
        if not bullets:
            if is_company_section_name(section_name):
                bullets = build_company_bullets(company_move, lang=lang, limit=MAX_COMPANY_BULLETS)
            if not bullets:
                bullets = split_bullets_from_text(default_body, limit=MAX_COMPANY_BULLETS)
        if not bullets:
            bullets = [truncate_text(default_body, 44)]
        if section_key == "closing":
            bullets = []

        tickers = normalize_tickers(llm_slide.get("tickers"))
        if not tickers and is_company_section_name(section_name):
            ticker = re.sub(r"[^A-Z0-9^.-]", "", str(company_move.get("ticker") or "").upper())
            if ticker:
                tickers = [ticker]
        highlights = normalize_string_list(llm_slide.get("highlights"), limit=3, max_len=40)

        headline = compact_text(llm_slide.get("headline")) or default_headline
        llm_subheadline = compact_text(llm_slide.get("subheadline"))
        llm_body = compact_text(llm_slide.get("body"))
        subheadline = llm_subheadline or truncate_text(default_subheadline, max_len=72)
        body = llm_body or truncate_text(default_body, max_len=72)
        if section_key == "hook":
            # Hook screen title must always match script title.
            headline = title
        if section_key == "closing":
            cta_text = default_cta_text(lang)
            headline = cta_text
            subheadline = cta_text
            body = cta_text
            tickers = []
            highlights = []

        slide = {
            "id": int(section.get("id", idx)),
            "phase": phase,
            "theme": theme,
            "startSec": round(float(section.get("startSec", 0.0)), 3),
            "endSec": round(float(section.get("endSec", 0.0)), 3),
            "eyebrow": compact_text(llm_slide.get("eyebrow")) or expected_eyebrow,
            "headline": headline,
            "subheadline": subheadline,
            "body": body,
            "bullets": bullets,
            "tickers": tickers[:4],
            "highlights": highlights,
        }
        normalized_slides.append(slide)
        captions.append(
            {
                "id": slide["id"],
                "startSec": slide["startSec"],
                "endSec": slide["endSec"],
                "text": compact_text(subheadline or body or headline),
            }
        )

    key_points = normalize_string_list(llm_meta.get("key_points"), limit=4, max_len=80)
    if not key_points:
        key_points = normalize_string_list(metadata.get("key_points"), limit=4, max_len=80)

    featured_tickers = normalize_featured_tickers(llm_meta.get("featured_tickers"))
    if not featured_tickers:
        featured_tickers = normalize_featured_tickers(metadata.get("featured_tickers"))

    return {
        "date": date,
        "lang": lang,
        "title": title,
        "hook": hook,
        "durationSeconds": round(duration_seconds, 3),
        "audioFile": audio_file,
        "slides": normalized_slides,
        "captions": captions,
        "sourceDigest": [],
        "meta": {
            "keyPoints": key_points[:4],
            "featuredTickers": featured_tickers[:5],
            "sceneCount": len(normalized_slides),
            "companyMoves": company_moves,
        },
    }


def generate_llm_slides_payload(
    *,
    llm: Any,
    config: dict[str, Any],
    date: str,
    lang: str,
    duration_seconds: float,
    script_payload: dict[str, Any],
    sections: list[dict[str, Any]],
    timing_payload: dict[str, Any] | None,
) -> dict[str, Any]:
    slides_cfg = resolve_slides_config_node(config)
    system_prompt = compact_text(slides_cfg.get("system"))
    user_template = slides_cfg.get("user_template")
    if not isinstance(user_template, str) or not user_template.strip():
        raise ValueError("slides.user_template is missing in prompt config")

    user_prompt = user_template.format(
        date=date,
        lang=lang,
        duration_seconds=round(duration_seconds, 3),
        shorts_script_json=json.dumps(script_payload, ensure_ascii=False, indent=2),
        sections_json=json.dumps(sections, ensure_ascii=False, indent=2),
        section_timing_json=json.dumps(timing_payload or {}, ensure_ascii=False, indent=2),
        company_moves_json=json.dumps(resolve_company_moves(script_payload), ensure_ascii=False, indent=2),
    )
    full_prompt = f"{system_prompt}\n\n{user_prompt}" if system_prompt else user_prompt
    response = llm.invoke(full_prompt)
    return extract_json_object(response_to_text(response.content))


def build_slide_script_payload(
    *,
    date: str,
    lang: str,
    script_payload: dict[str, Any],
    sections: list[dict[str, Any]],
    duration_seconds: float,
    audio_file: str,
) -> dict[str, Any]:
    metadata = script_payload.get("metadata")
    if not isinstance(metadata, dict):
        metadata = {}

    return {
        "date": date,
        "lang": lang,
        "title": compact_text(script_payload.get("title")),
        "hook": compact_text(script_payload.get("hook")),
        "durationSeconds": round(duration_seconds, 3),
        "audioFile": audio_file,
        "sections": sections,
        "meta": {
            "keyPoints": [compact_text(item) for item in (metadata.get("key_points") or []) if compact_text(item)][:4],
            "featuredTickers": normalize_tickers(metadata.get("featured_tickers")),
            "companyMoves": metadata.get("company_moves") if isinstance(metadata.get("company_moves"), list) else [],
        },
        "notes": {
            "description": "Replace slides.render.json with your custom slide design payload when ready.",
            "requiredSchema": [
                "slides[]: phase/theme/startSec/endSec/eyebrow/headline/subheadline/body/bullets/tickers/highlights",
                "captions[]: id/startSec/endSec/text",
                "meta.keyPoints/meta.featuredTickers/meta.sceneCount",
            ],
        },
    }


def build_slide_render_template(
    *,
    date: str,
    lang: str,
    script_payload: dict[str, Any],
    sections: list[dict[str, Any]],
    duration_seconds: float,
    audio_file: str,
    config: dict[str, Any],
) -> dict[str, Any]:
    metadata = script_payload.get("metadata")
    if not isinstance(metadata, dict):
        metadata = {}

    defaults = resolve_slides_defaults(config) if isinstance(config, dict) else {}
    phase_by_section = defaults.get("phase_by_section") if isinstance(defaults.get("phase_by_section"), dict) else {}
    theme_by_section = defaults.get("theme_by_section") if isinstance(defaults.get("theme_by_section"), dict) else {}
    eyebrow_by_section = defaults.get("eyebrow_by_section") if isinstance(defaults.get("eyebrow_by_section"), dict) else {}

    slides: list[dict[str, Any]] = []
    captions: list[dict[str, Any]] = []
    company_moves = resolve_company_moves(script_payload)
    company_idx = 0

    for section in sections:
        section_name = section["name"]
        text = compact_text(section.get("text"))
        section_group = section_group_name(section_name)
        phase = compact_text(phase_by_section.get(section_name) or phase_by_section.get(section_group)) or "insight"
        theme = compact_text(theme_by_section.get(section_name) or theme_by_section.get(section_group)) or "neutral"
        eyebrow = compact_text(eyebrow_by_section.get(section_name) or eyebrow_by_section.get(section_group)) or section_name

        is_hook = normalize_section_name(section_name) == "hook"
        is_closing = normalize_section_name(section_name) == "closing"
        is_company = is_company_section_name(section_name)
        company_move = company_moves[company_idx] if is_company and company_idx < len(company_moves) else {}
        if is_company:
            company_idx += 1

        company_summary, company_reason = build_company_default_text(company_move, fallback=text)

        headline = compact_text(script_payload.get("title"))
        subheadline = truncate_text(text or compact_text(script_payload.get("hook")), max_len=72)
        body = subheadline
        bullets = [sentence for sentence in re.split(r"(?<=[.!?])\s+", body) if compact_text(sentence)][:2]
        bullets = [truncate_text(item, max_len=44) for item in bullets if compact_text(item)]
        if not bullets:
            bullets = [truncate_text(body, max_len=44)]
        if is_hook:
            headline = compact_text(script_payload.get("title")) or "US Market Close"
            subheadline = truncate_text(text or compact_text(script_payload.get("hook")), max_len=72)
            body = subheadline
        if is_company:
            headline = company_summary or compact_text(company_move.get("ticker")) or headline
            subheadline = company_summary or subheadline
            body = company_reason or subheadline
            bullets = build_company_bullets(company_move, lang=lang, limit=MAX_COMPANY_BULLETS) or bullets
        if is_closing:
            cta = default_cta_text(lang)
            headline = cta
            subheadline = cta
            body = cta
            bullets = []

        tickers = normalize_tickers(metadata.get("featured_tickers"))[:4]
        if is_company:
            ticker = re.sub(r"[^A-Z0-9^.-]", "", str(company_move.get("ticker") or "").upper())
            tickers = [ticker] if ticker else tickers

        slides.append(
            {
                "id": section["id"],
                "phase": phase,
                "theme": theme,
                "startSec": section["startSec"],
                "endSec": section["endSec"],
                "eyebrow": eyebrow,
                "headline": headline,
                "subheadline": subheadline,
                "body": body,
                "bullets": bullets,
                "tickers": tickers,
                "highlights": [],
            }
        )
        captions.append(
            {
                "id": section["id"],
                "startSec": section["startSec"],
                "endSec": section["endSec"],
                "text": truncate_text(text or subheadline, max_len=72),
            }
        )

    return {
        "date": date,
        "lang": lang,
        "title": compact_text(script_payload.get("title")) or "US Market Close",
        "hook": compact_text(script_payload.get("hook")),
        "durationSeconds": round(duration_seconds, 3),
        "audioFile": audio_file,
        "slides": slides,
        "captions": captions,
        "sourceDigest": [],
        "meta": {
            "keyPoints": [compact_text(item) for item in (metadata.get("key_points") or []) if compact_text(item)][:4],
            "featuredTickers": normalize_tickers(metadata.get("featured_tickers"))[:5],
            "sceneCount": len(slides),
            "companyMoves": metadata.get("company_moves") if isinstance(metadata.get("company_moves"), list) else [],
        },
    }


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Prepare shorts-firm slide script/template artifacts")
    parser.add_argument("date", type=str, help="Date in YYYYMMDD or YYYY-MM-DD")
    parser.add_argument("--lang", default="ko", choices=["ko", "en"])
    parser.add_argument("--script", type=Path, help="Path to shorts-firm script.json")
    parser.add_argument("--timing", type=Path, help="Path to shorts-firm sections.timing.json")
    parser.add_argument("--script-output", type=Path, help="Output path for slides.script.json")
    parser.add_argument("--template-output", type=Path, help="Output path for slides.render.template.json")
    parser.add_argument("--render-output", type=Path, help="Output path for slides.render.json")
    parser.add_argument("--overwrite-render", action="store_true", help="Overwrite slides.render.json")
    parser.add_argument("--config", type=Path, default=SLIDES_CONFIG_PATH, help="Slides prompt YAML path")
    parser.add_argument("--prefix", type=str, default="SHORTS_FIRM_SLIDES", help="LLM env prefix for slides generation")
    parser.add_argument("--no-llm", action="store_true", help="Skip Gemini slides generation and use template fallback only")
    parser.add_argument("--debug", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.debug:
        logger.setLevel(logging.DEBUG)

    try:
        date = parse_date_arg(args.date)
    except ValueError as exc:
        logger.error("Date parsing failed: %s", exc)
        return 2

    base_dir = ROOT_DIR / "podcast" / date / args.lang / "shorts-firm"
    script_path = args.script or (base_dir / "script.json")
    timing_path = args.timing or (base_dir / "sections.timing.json")
    script_output_path = args.script_output or (base_dir / "slides.script.json")
    template_output_path = args.template_output or (base_dir / "slides.render.template.json")
    render_output_path = args.render_output or (base_dir / "slides.render.json")
    config_path = args.config

    if not config_path.is_absolute():
        config_path = (ROOT_DIR / config_path).resolve()
    if not script_path.is_absolute():
        script_path = (ROOT_DIR / script_path).resolve()
    if not timing_path.is_absolute():
        timing_path = (ROOT_DIR / timing_path).resolve()
    if not script_output_path.is_absolute():
        script_output_path = (ROOT_DIR / script_output_path).resolve()
    if not template_output_path.is_absolute():
        template_output_path = (ROOT_DIR / template_output_path).resolve()
    if not render_output_path.is_absolute():
        render_output_path = (ROOT_DIR / render_output_path).resolve()

    logger.info("shorts-firm slide preparation")
    logger.info("  - script: %s", script_path)
    logger.info("  - timing: %s", timing_path)
    logger.info("  - slides config: %s", config_path)

    try:
        config = load_yaml_config(config_path)
        script_payload = load_json(script_path)
        display_date = resolve_display_date(script_payload, date)
        timing_payload = load_json(timing_path) if timing_path.exists() else None
        duration_seconds = parse_duration_seconds(script_payload, timing_payload)
        sections = extract_sections(script_payload, duration_seconds)
        sections = merge_timing(sections, timing_payload, duration_seconds)
        for section in sections:
            if normalize_section_name(section.get("name")) == "closing":
                section["text"] = default_cta_text(args.lang)
        audio_file = compact_text((timing_payload or {}).get("audioFile")) or default_audio_file_name(date)

        slide_script_payload = build_slide_script_payload(
            date=display_date,
            lang=args.lang,
            script_payload=script_payload,
            sections=sections,
            duration_seconds=duration_seconds,
            audio_file=audio_file,
        )
        template_payload = build_slide_render_template(
            date=display_date,
            lang=args.lang,
            script_payload=script_payload,
            sections=sections,
            duration_seconds=duration_seconds,
            audio_file=audio_file,
            config=config,
        )
        render_payload = template_payload

        if not args.no_llm:
            try:
                load_env_from_yaml(logger=logger)
                load_dotenv(ROOT_DIR / ".env", override=False)
                llm = build_llm(prefix=args.prefix, logger=logger)
                llm_payload = generate_llm_slides_payload(
                    llm=llm,
                    config=config,
                    date=display_date,
                    lang=args.lang,
                    duration_seconds=duration_seconds,
                    script_payload=script_payload,
                    sections=sections,
                    timing_payload=timing_payload,
                )
                render_payload = normalize_llm_render_payload(
                    llm_payload=llm_payload,
                    date=display_date,
                    lang=args.lang,
                    script_payload=script_payload,
                    sections=sections,
                    duration_seconds=duration_seconds,
                    audio_file=audio_file,
                    config=config,
                )
                logger.info("Generated slides.render payload via Gemini")
            except Exception as llm_exc:
                logger.warning("Gemini slides generation failed, using template fallback: %s", llm_exc)
        else:
            logger.info("Gemini slides generation skipped (--no-llm)")

        write_json(script_output_path, slide_script_payload)
        write_json(template_output_path, template_payload)
        logger.info("Saved slide script payload: %s", script_output_path)
        logger.info("Saved slide render template: %s", template_output_path)

        if args.overwrite_render or not render_output_path.exists():
            write_json(render_output_path, render_payload)
            logger.info("Saved slide render JSON: %s", render_output_path)
        else:
            logger.info("Kept existing render JSON (no overwrite): %s", render_output_path)

        return 0
    except Exception as exc:
        logger.error("Failed to prepare shorts-firm slide artifacts: %s", exc, exc_info=args.debug)
        return 1


if __name__ == "__main__":
    sys.exit(main())
