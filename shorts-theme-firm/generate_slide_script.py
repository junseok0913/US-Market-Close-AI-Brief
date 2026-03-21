"""Prepare independent slide input/template artifacts for shorts-theme-firm."""

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

SLIDES_CONFIG_PATH = ROOT_DIR / "shorts-theme-firm" / "prompt" / "shorts_theme_firm_slides.yaml"
SECTION_ORDER = ("hook", "company_1", "company_2", "closing")
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
MAX_VISUAL_HEADLINE = 24
MAX_VISUAL_SUBHEADLINE = 42
MAX_VISUAL_BODY = 52
BKNG_ROLE_ORDER = ("fundamental", "growth", "risk", "sentiment")
BKNG_ROLE_LABELS = {
    "fundamental": "펀더멘털",
    "growth": "성장 포인트",
    "risk": "리스크",
    "sentiment": "시장 심리",
}
BKNG_ROLE_STANCES = {
    "fundamental": "적정 수준",
    "growth": "긍정적 시각",
    "risk": "주의 필요",
    "sentiment": "과열 경계",
}
BKNG_ROLE_CONFIDENCE = {
    "fundamental": 0.74,
    "growth": 0.82,
    "risk": 0.84,
    "sentiment": 0.8,
}


def compact_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def simplify_company_name(value: Any) -> str:
    text = compact_text(value)
    if not text:
        return ""
    simplified = re.sub(
        r",?\s+(?:incorporated|inc\.?|corporation|corp\.?|company|co\.?|holdings|holding|group|limited|ltd\.?|llc|plc)\s*$",
        "",
        text,
        flags=re.IGNORECASE,
    )
    simplified = re.sub(r"\s+class\s+[a-z]\s*$", "", simplified, flags=re.IGNORECASE)
    simplified = simplified.strip(" ,")
    return simplified or text


def resolve_company_name(script_payload: dict[str, Any]) -> str:
    metadata = script_payload.get("metadata") if isinstance(script_payload.get("metadata"), dict) else {}
    company_profile = metadata.get("company_profile") if isinstance(metadata.get("company_profile"), dict) else {}
    company_name = compact_text(company_profile.get("name"))
    if company_name:
        return company_name
    company_moves = metadata.get("company_moves") if isinstance(metadata.get("company_moves"), list) else []
    if company_moves and isinstance(company_moves[0], dict):
        company_name = compact_text(company_moves[0].get("name"))
        if company_name:
            return company_name
    return compact_text(script_payload.get("title"))


def build_analysis_title(script_payload: dict[str, Any], lang: str) -> str:
    base = simplify_company_name(resolve_company_name(script_payload)) or (
        "핵심 기업" if compact_text(lang).lower() != "en" else "Company"
    )
    suffix = "Analysis" if compact_text(lang).lower() == "en" else "분석"
    if re.search(r"(?:^|\s)(?:분석|analysis)$", base, flags=re.IGNORECASE):
        return base
    return f"{base} {suffix}".strip()


def default_cta_text(lang: str) -> str:
    if compact_text(lang).lower() == "en":
        return "Please like and subscribe"
    return "구독과 좋아요 부탁드립니다"


def parse_date_arg(value: str) -> str:
    token = value.replace("-", "").strip()
    if len(token) != 8 or not token.isdigit():
        raise ValueError(f"Invalid date format: {value}")
    return token


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


def resolve_upload_metadata_config_node(config: dict[str, Any]) -> dict[str, Any]:
    node = config.get("upload_metadata")
    return node if isinstance(node, dict) else {}


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


def load_debate_json(date: str, lang: str) -> dict[str, Any]:
    """Auto-find and load the intermediate debate JSON for the given date."""
    # First try to find debate JSONs for the selected date
    debate_dir = ROOT_DIR / "podcast" / date / "intermediate" / "debate"
    if debate_dir.exists():
        debate_files = sorted(debate_dir.glob("*_debate.json"), key=lambda p: p.name)
        if debate_files:
            # Prefer the first one (alphabetically sorted by ticker)
            payload = json.loads(debate_files[0].read_text(encoding="utf-8"))
            logger.info("Loaded debate JSON: %s", debate_files[0])
            return payload if isinstance(payload, dict) else {}
    logger.warning("No debate JSON found at %s; debate_json will be empty", debate_dir)
    return {}


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
            {"name": "company_2", "text": full_script},
            {"name": "company_3", "text": full_script},
            {"name": "company_4", "text": full_script},
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
            insert_at = len(ordered_sections) - 1
            for idx in range(4):
                ordered_sections.insert(insert_at + idx, {"name": f"company_{idx + 1}", "text": company_text})

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


def build_bkng_scene_timing(
    *,
    timing_payload: dict[str, Any] | None,
    sections: list[dict[str, Any]],
    duration_seconds: float,
) -> dict[str, dict[str, float]]:
    section_to_scene = {
        "company_1": "fundamental",
        "company_2": "growth",
        "company_3": "risk",
        "company_4": "sentiment",
    }
    out: dict[str, dict[str, float]] = {}

    raw_sections = timing_payload.get("sections") if isinstance(timing_payload, dict) else None
    if isinstance(raw_sections, list):
        for item in raw_sections:
            if not isinstance(item, dict):
                continue
            section_name = normalize_section_name(item.get("name"))
            scene_name = section_to_scene.get(section_name)
            start_sec = item.get("startSec")
            end_sec = item.get("endSec")
            if not scene_name or not isinstance(start_sec, (int, float)) or not isinstance(end_sec, (int, float)):
                continue
            if float(end_sec) <= float(start_sec):
                continue
            out[scene_name] = {
                "startSec": round(float(start_sec), 3),
                "endSec": round(float(end_sec), 3),
            }

    if len(out) == len(section_to_scene):
        return out

    for section in sections:
        section_name = normalize_section_name(section.get("name"))
        scene_name = section_to_scene.get(section_name)
        start_sec = section.get("startSec")
        end_sec = section.get("endSec")
        if not scene_name or not isinstance(start_sec, (int, float)) or not isinstance(end_sec, (int, float)):
            continue
        if float(end_sec) <= float(start_sec):
            continue
        out[scene_name] = {
            "startSec": round(float(start_sec), 3),
            "endSec": round(float(end_sec), 3),
        }

    if out:
        return out

    quarter = max(0.1, float(duration_seconds) / 4.0)
    cursor = 0.0
    for scene_name in ("fundamental", "growth", "risk", "sentiment"):
        next_cursor = min(float(duration_seconds), cursor + quarter)
        out[scene_name] = {
            "startSec": round(cursor, 3),
            "endSec": round(next_cursor, 3),
        }
        cursor = next_cursor

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


def normalize_multiline_text(value: Any, max_len: int) -> str:
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n")
    raw_lines = [re.sub(r"\s+", " ", line).strip() for line in text.split("\n")]
    out_lines: list[str] = []
    previous_blank = True
    for line in raw_lines:
        if not line:
            if not previous_blank:
                out_lines.append("")
            previous_blank = True
            continue
        out_lines.append(line)
        previous_blank = False
    normalized = "\n".join(out_lines).strip()
    return normalized[:max_len].rstrip()


def normalize_upload_tags(values: Any, limit: int, max_len: int) -> list[str]:
    if not isinstance(values, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        text = compact_text(value).lstrip("#")
        text = re.sub(r"\s+", "", text)
        if not text:
            continue
        if len(text) > max_len:
            text = text[:max_len].rstrip()
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


def strip_visual_lead(value: Any) -> str:
    text = compact_text(value)
    if not text:
        return ""
    text = re.sub(r"^(?:먼저|하지만|그리고|또한|반면)\s+", "", text, flags=re.IGNORECASE)
    text = re.sub(
        r"^(?:fundamental|growth|risk|sentiment)\s*관점(?:에서|에선|으로(?:\s*보면)?)?\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(r"^(?:시장(?:은)?\s*오늘|오늘\s*시장은)\s*", "", text)
    text = re.sub(r"^바로\s+", "", text)
    return compact_text(text)


def strip_visual_tone(value: Any) -> str:
    text = compact_text(value)
    if not text:
        return ""
    text = strip_visual_lead(text)
    text = re.sub(r"\s*(?:입니다|였습니다)(?:[.!?])?$", "", text)
    text = re.sub(r"[.!?]+$", "", text)
    text = text.strip(" ,")
    return compact_text(text)


def point_value(value: Any) -> str:
    text = strip_visual_tone(first_sentence(value))
    if not text:
        return ""
    if ":" in text:
        _, tail = text.split(":", 1)
        tail = strip_visual_tone(tail)
        if len(tail) >= 4:
            return tail
    return compact_text(text)


def join_short_texts(values: list[Any], *, max_len: int, separator: str) -> str:
    out = ""
    for value in values:
        text = strip_visual_tone(value)
        if not text:
            continue
        candidate = text if not out else f"{out}{separator}{text}"
        if len(candidate) <= max_len:
            out = candidate
            continue
        if not out:
            return truncate_text(text, max_len=max_len)
        break
    return out


def pick_visual_candidate(values: list[Any], *, max_len: int, exclude: str = "") -> str:
    excluded = strip_visual_tone(exclude)
    for value in values:
        text = strip_visual_tone(value)
        if not text:
            continue
        text = truncate_text(text, max_len=max_len)
        if excluded and compact_text(text) == excluded:
            continue
        return text
    return ""


def looks_like_narration(value: Any) -> bool:
    text = compact_text(value)
    if not text:
        return False
    if len(text) > MAX_VISUAL_BODY:
        return True
    if re.search(r"(?:fundamental|growth|risk|sentiment)\s*관점", text, flags=re.IGNORECASE):
        return True
    if re.match(r"^(?:먼저|하지만|그리고|또한|반면)\s+", text):
        return True
    return False


def choose_visual_text(candidate: Any, default: str, *, max_len: int, reject_narration: bool = False) -> str:
    text = compact_text(candidate)
    if not text:
        return truncate_text(strip_visual_tone(default), max_len=max_len)
    if reject_narration and looks_like_narration(text):
        return truncate_text(strip_visual_tone(default), max_len=max_len)
    return truncate_text(strip_visual_tone(text), max_len=max_len)


def build_company_visual_copy(
    *,
    company_move: dict[str, Any],
    company_profile: dict[str, Any],
    role: str,
    fallback: str = "",
) -> tuple[str, str]:
    points = normalize_company_point_lines(company_move.get("slide_points"), limit=3, max_len=44)
    point_values = [point_value(item) for item in points]
    business_model = strip_visual_tone(company_profile.get("business_model"))
    identity_summary = strip_visual_tone(company_profile.get("identity_summary"))
    why_now = strip_visual_tone(company_profile.get("why_now"))
    moat = strip_visual_tone(company_profile.get("moat"))
    summary_fallback = strip_visual_tone(company_move.get("move_summary") or company_move.get("reason") or fallback)
    body_fallback = strip_visual_tone(company_move.get("reason") or company_move.get("move_summary") or fallback)

    day_text = compact_text(company_move.get("day_change_display"))
    month_text = compact_text(company_move.get("month_change_display"))
    metric_bits: list[str] = []
    if day_text and day_text != "N/A":
        metric_bits.append(f"1D {day_text}")
    if month_text and month_text != "N/A":
        metric_bits.append(f"1M {month_text}")
    market_line = join_short_texts(metric_bits, max_len=MAX_VISUAL_SUBHEADLINE, separator=" / ")

    if role == "fundamental":
        summary_candidates = [business_model, identity_summary, points[0] if points else "", summary_fallback]
        body_candidates = [points[0] if points else "", points[1] if len(points) > 1 else "", moat, body_fallback]
    elif role == "growth":
        joined_growth = join_short_texts(point_values[:2], max_len=MAX_VISUAL_SUBHEADLINE, separator=" + ")
        summary_candidates = [joined_growth, points[0] if points else "", summary_fallback]
        body_candidates = [points[1] if len(points) > 1 else "", points[2] if len(points) > 2 else "", moat, body_fallback]
    elif role == "risk":
        joined_risk = join_short_texts(point_values[:2], max_len=MAX_VISUAL_SUBHEADLINE, separator=" / ")
        summary_candidates = [points[0] if points else "", joined_risk, summary_fallback]
        body_candidates = [points[1] if len(points) > 1 else "", points[2] if len(points) > 2 else "", body_fallback]
    elif role == "sentiment":
        summary_candidates = [points[0] if points else "", market_line, summary_fallback]
        body_candidates = [points[2] if len(points) > 2 else "", points[1] if len(points) > 1 else "", why_now, body_fallback]
    else:
        summary_candidates = [summary_fallback, points[0] if points else "", fallback]
        body_candidates = [body_fallback, points[1] if len(points) > 1 else "", summary_fallback]

    summary = pick_visual_candidate(summary_candidates, max_len=MAX_VISUAL_SUBHEADLINE)
    body = pick_visual_candidate(body_candidates, max_len=MAX_VISUAL_BODY, exclude=summary)

    if not summary:
        summary = truncate_text(strip_visual_tone(fallback), max_len=MAX_VISUAL_SUBHEADLINE)
    if not body:
        body = truncate_text(strip_visual_tone(summary or fallback), max_len=MAX_VISUAL_BODY)
    return summary, body


def normalize_company_point_lines(values: Any, *, limit: int, max_len: int | None = None) -> list[str]:
    if not isinstance(values, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        text = strip_visual_tone(first_sentence(value))
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


def resolve_expert_sections(script_payload: dict[str, Any]) -> dict[str, dict[str, Any]]:
    metadata = script_payload.get("metadata") if isinstance(script_payload.get("metadata"), dict) else {}
    company_profile = metadata.get("company_profile") if isinstance(metadata.get("company_profile"), dict) else {}
    raw_sections = company_profile.get("expert_sections") if isinstance(company_profile.get("expert_sections"), list) else []
    out: dict[str, dict[str, Any]] = {}
    for item in raw_sections:
        if not isinstance(item, dict):
            continue
        section_name = normalize_section_name(item.get("name"))
        if not section_name:
            continue
        out[section_name] = item
    return out


def expand_company_moves_for_sections(
    script_payload: dict[str, Any],
    sections: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    company_moves = resolve_company_moves(script_payload)
    if not company_moves:
        return []

    metadata = script_payload.get("metadata") if isinstance(script_payload.get("metadata"), dict) else {}
    company_profile = metadata.get("company_profile") if isinstance(metadata.get("company_profile"), dict) else {}
    expert_sections = resolve_expert_sections(script_payload)
    base_move = company_moves[0]
    expanded: list[dict[str, Any]] = []

    for section in sections:
        if not is_company_section_name(section.get("name")):
            continue
        section_name = normalize_section_name(section.get("name"))
        section_text = compact_text(section.get("text"))
        expert_section = expert_sections.get(section_name, {})
        expert_summary = compact_text(
            expert_section.get("summary")
            or expert_section.get("spoken_text")
            or section_text
        )
        expert_points = normalize_string_list(
            expert_section.get("slide_points"),
            limit=3,
            max_len=34,
        )
        move = dict(base_move)
        role = compact_text(expert_section.get("role"))
        visual_summary, visual_body = build_company_visual_copy(
            company_move={
                **move,
                "slide_points": expert_points or move.get("slide_points"),
                "move_summary": expert_summary or move.get("move_summary"),
                "reason": section_text or expert_summary or move.get("reason"),
            },
            company_profile=company_profile,
            role=role,
            fallback=section_text or expert_summary,
        )
        move["segment_role"] = role
        move["move_summary"] = compact_text(visual_summary or expert_summary or move.get("move_summary") or move.get("reason"))
        move["reason"] = compact_text(visual_body or visual_summary or section_text or expert_summary or move.get("reason"))
        if expert_points:
            move["slide_points"] = expert_points
        elif section_name == "company_1":
            identity_points = normalize_string_list(
                company_profile.get("key_products"),
                limit=2,
                max_len=34,
            )
            identity_points.extend(
                normalize_string_list(
                    [company_profile.get("moat"), company_profile.get("customer_base")],
                    limit=2,
                    max_len=34,
                )
            )
            move["slide_points"] = identity_points[:3] or normalize_string_list(move.get("slide_points"), limit=3, max_len=34)
        else:
            move["slide_points"] = normalize_string_list(move.get("slide_points"), limit=3, max_len=34)
        expanded.append(move)

    return expanded or company_moves


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
    company_moves = expand_company_moves_for_sections(script_payload, sections)
    title = build_analysis_title(script_payload, lang) or "US Market Close"
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
        company_ticker = truncate_text(company_move.get("ticker"), max_len=MAX_VISUAL_HEADLINE)

        default_headline = title if section_key == "hook" else company_ticker or expected_eyebrow
        if section_key == "closing":
            default_headline = compact_text(section.get("text")) or "Wrap Up"
        if is_company_section_name(section_name):
            default_subheadline = company_summary or compact_text(section.get("text")) or hook
            default_body = company_reason or default_subheadline
        else:
            default_subheadline = truncate_text(compact_text(section.get("text")) or hook, max_len=MAX_VISUAL_SUBHEADLINE)
            default_body = truncate_text(compact_text(section.get("text")) or default_subheadline, max_len=MAX_VISUAL_BODY)

        bullets = normalize_company_point_lines(llm_slide.get("bullets"), limit=MAX_COMPANY_BULLETS, max_len=34)
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

        llm_headline = compact_text(llm_slide.get("headline"))
        llm_subheadline = compact_text(llm_slide.get("subheadline"))
        llm_body = compact_text(llm_slide.get("body"))
        if is_company_section_name(section_name):
            headline = choose_visual_text(llm_headline, default_headline, max_len=MAX_VISUAL_HEADLINE, reject_narration=True)
            subheadline = choose_visual_text(llm_subheadline, default_subheadline, max_len=MAX_VISUAL_SUBHEADLINE, reject_narration=True)
            body = choose_visual_text(llm_body, default_body, max_len=MAX_VISUAL_BODY, reject_narration=True)
        else:
            headline = strip_visual_tone(llm_headline) or strip_visual_tone(default_headline)
            subheadline = choose_visual_text(llm_subheadline, default_subheadline, max_len=MAX_VISUAL_SUBHEADLINE)
            body = choose_visual_text(llm_body, default_body, max_len=MAX_VISUAL_BODY)
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
                "text": compact_text(strip_visual_tone(subheadline or body or headline)),
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
            "companyProfile": metadata.get("company_profile") if isinstance(metadata.get("company_profile"), dict) else {},
            "variant": "theme-firm",
        },
    }


def collect_text_fragments(value: Any) -> list[str]:
    out: list[str] = []

    def visit(item: Any) -> None:
        if isinstance(item, str):
            text = compact_text(item)
            if text:
                out.append(text)
            return
        if isinstance(item, list):
            for child in item:
                visit(child)
            return
        if isinstance(item, dict):
            for child in item.values():
                visit(child)

    visit(value)
    return out


def parse_float_token(value: str) -> float | None:
    token = compact_text(value).replace(",", "")
    if not token:
        return None
    try:
        return float(token)
    except ValueError:
        return None


def extract_close_price(texts: list[str]) -> float | None:
    priority_patterns = (
        r"([0-9][0-9,]*\.?[0-9]*)달러로 마감",
        r"종가(?:는|가)?\s*([0-9][0-9,]*\.?[0-9]*)달러",
        r"주가(?:는|가)?\s*(?:하루 만에\s*[+-]?\d+(?:\.\d+)?%\s*)?(?:급등하며|급락하며|상승하며|하락하며)?\s*([0-9][0-9,]*\.?[0-9]*)달러",
    )
    for pattern in priority_patterns:
        for text in texts:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if not match:
                continue
            value = parse_float_token(match.group(1))
            if value and value > 100:
                return value

    fallback_values: list[float] = []
    for text in texts:
        for match in re.finditer(r"(?:\$|USD\s*)?([0-9][0-9,]*\.?[0-9]*)\s*(?:달러|usd)?", text, flags=re.IGNORECASE):
            raw = match.group(0)
            if not raw or ("$" not in raw and "달러" not in raw.lower() and "usd" not in raw.lower()):
                continue
            value = parse_float_token(match.group(1))
            if value and 1 < value < 10000:
                fallback_values.append(value)
    if fallback_values:
        return max(fallback_values)
    return None


def format_hook_price(value: float | None, *, fallback: str) -> str:
    if value is None:
        return fallback
    rounded = int(round(value))
    return f"${rounded:,}"


def resolve_shorts_audio_src(date: str, audio_file: str) -> str:
    match = re.search(r"(\d{8})", compact_text(audio_file))
    asset_date = match.group(1) if match else parse_date_arg(date)
    return f"audio/shorts-theme-firm/{asset_date}.mp3"


def extract_company_display_name(
    *,
    ticker: str,
    company_profile: dict[str, Any],
    fallback_name: str,
) -> str:
    texts = collect_text_fragments(
        [
            company_profile.get("identity_expert_summary"),
            company_profile.get("today_expert_summary"),
            company_profile.get("expert_summaries"),
            company_profile.get("expert_sections"),
        ]
    )
    if ticker:
        pattern = re.compile(rf"([가-힣][가-힣\s]{{1,24}})\s*\(\s*{re.escape(ticker)}\s*\)")
        for text in texts:
            match = pattern.search(text)
            if match:
                return compact_text(match.group(1))
    simplified = simplify_company_name(fallback_name)
    return simplified or ticker


def build_hook_eyebrow(ticker: str) -> str:
    if ticker:
        return f"AI DEBATE / {ticker}"
    return "AI DEBATE"


def first_nonempty_text(values: list[Any], *, max_len: int) -> str:
    for value in values:
        text = strip_visual_tone(value)
        if text:
            return truncate_text(text, max_len=max_len)
    return ""


def extract_percentage(texts: list[str]) -> float | None:
    for text in texts:
        match = re.search(r"([+-]?\d+(?:\.\d+)?)%", text)
        if not match:
            continue
        value = parse_float_token(match.group(1))
        if value is not None:
            return value
    return None


def extract_percent_tokens(text: str) -> list[str]:
    values = re.findall(r"([+-]?\d+(?:\.\d+)?)%", compact_text(text))
    out: list[str] = []
    for raw in values:
        sign = "" if raw.startswith(("+", "-")) else "+"
        out.append(f"{sign}{raw}%")
    return out


def split_text_units(texts: list[str]) -> list[str]:
    out: list[str] = []
    for text in texts:
        normalized = compact_text(text)
        if not normalized:
            continue
        parts = re.split(r"(?:\n+|(?<=[.!?])\s+|•|\s+-\s+)", normalized)
        for part in parts:
            cleaned = compact_text(part)
            if cleaned:
                out.append(cleaned)
    return out


def find_text_with_keywords(texts: list[str], keywords: list[str]) -> str:
    lowered = [keyword.lower() for keyword in keywords if keyword]
    for text in texts:
        haystack = text.lower()
        if any(keyword in haystack for keyword in lowered):
            return text
    return ""


def format_numeric_token(text: str) -> str:
    source = compact_text(text)
    if not source:
        return ""

    arrow_match = re.search(r"([0-9]+(?:\.\d+)?)%\s*[→>-]+\s*([0-9]+(?:\.\d+)?)%", source)
    if arrow_match:
        return f"{arrow_match.group(1)}%→{arrow_match.group(2)}%"

    range_match = re.search(r"([0-9]+(?:\.\d+)?)~([0-9]+(?:\.\d+)?)%", source)
    if range_match:
        return f"{range_match.group(1)}~{range_match.group(2)}%"

    eur_suffix_match = re.search(r"([0-9][0-9,.]*)억 유로", source)
    if eur_suffix_match:
        return f"EUR {eur_suffix_match.group(1)}억"

    usd_suffix_match = re.search(r"([0-9][0-9,.]*)억 달러", source)
    if usd_suffix_match:
        return f"${usd_suffix_match.group(1)}억"

    usd_token_match = re.search(r"\$([0-9][0-9,.]*)([BMK])", source, flags=re.IGNORECASE)
    if usd_token_match:
        return f"${usd_token_match.group(1)}{usd_token_match.group(2).upper()}"

    eur_token_match = re.search(r"EUR\s*([0-9][0-9,.]*)([BMK])", source, flags=re.IGNORECASE)
    if eur_token_match:
        return f"EUR {eur_token_match.group(1)}{eur_token_match.group(2).upper()}"

    usd_plain_match = re.search(r"\$([0-9][0-9,.]*)", source)
    if usd_plain_match:
        return f"${usd_plain_match.group(1)}"

    percent_match = re.search(r"([+-]?\d+(?:\.\d+)?)%", source)
    if percent_match:
        value = percent_match.group(1)
        if value.startswith(("+", "-")):
            return f"{value}%"
        negative = re.search(r"(하락|급락|폭락|감소|축소|하방|리스크|충격)", source)
        positive = re.search(r"(상승|급등|반등|향상|개선|증가|확대|시너지|성장)", source)
        sign = "-" if negative and not positive else "+"
        return f"{sign}{value}%"

    month_match = re.search(r"([0-9]+(?:\.\d+)?)개월", source)
    if month_match:
        return f"{month_match.group(1)}개월"

    country_match = re.search(r"([0-9]+(?:\.\d+)?)개국", source)
    if country_match:
        return f"{country_match.group(1)}개국"

    multiplier_match = re.search(r"([0-9]+(?:\.\d+)?)배", source)
    if multiplier_match:
        return f"{multiplier_match.group(1)}배"

    dollar_match = re.search(r"([0-9][0-9,.]*)달러", source)
    if dollar_match:
        return f"${dollar_match.group(1)}"

    return ""


def extract_token_near_keyword(text: str, keywords: list[str]) -> str:
    source = compact_text(text)
    if not source:
        return ""
    token_pattern = r"(\$[0-9][0-9,.]*(?:[BMK])?|[0-9][0-9,.]*억 달러|[0-9][0-9,.]*억 유로|EUR\s*[0-9][0-9,.]*(?:[BMK])?|[0-9]+(?:\.\d+)?%\s*[→>-]+\s*[0-9]+(?:\.\d+)?%|[0-9]+(?:\.\d+)?~[0-9]+(?:\.\d+)?%|[+-]?\d+(?:\.\d+)?%|[0-9]+(?:\.\d+)?개월|[0-9]+(?:\.\d+)?개국|[0-9]+(?:\.\d+)?배|\$[0-9][0-9,.]*)"
    for keyword in keywords:
        pattern = re.compile(rf"{re.escape(keyword)}[^$0-9]{{0,18}}{token_pattern}", flags=re.IGNORECASE)
        match = pattern.search(source)
        if match:
            return format_numeric_token(match.group(1))
    return ""


def build_fundamental_metrics_from_texts(texts: list[str], company_move: dict[str, Any]) -> list[dict[str, Any]]:
    units = split_text_units(texts)
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    score_by_index = [88.0, 76.0, 64.0, 52.0]

    def add_metric(label: str, text: str, sub: str) -> None:
        token = extract_token_near_keyword(text, [label]) or format_numeric_token(text)
        if not token or label in seen:
            return
        seen.add(label)
        out.append(
            {
                "label": label,
                "value": truncate_text(token, max_len=10),
                "sub": truncate_text(sub, max_len=16),
                "pct": score_by_index[min(len(out), len(score_by_index) - 1)],
            }
        )

    revenue_text = find_text_with_keywords(units, ["매출"])
    if revenue_text:
        pcts = extract_percent_tokens(revenue_text)
        add_metric("매출", revenue_text, pcts[0] if pcts else "2025년 기준")

    income_text = find_text_with_keywords(units, ["순이익"])
    if income_text:
        pcts = extract_percent_tokens(income_text)
        add_metric("순이익", income_text, pcts[1] if len(pcts) > 1 else (pcts[0] if pcts else "이익 성장"))

    operating_cf_text = find_text_with_keywords(units, ["영업현금흐름"])
    if operating_cf_text:
        add_metric("영업현금흐름", operating_cf_text, "현금창출력")

    fcf_text = find_text_with_keywords(units, ["잉여현금흐름", "FCF"])
    if fcf_text:
        add_metric("잉여현금흐름", fcf_text, "FCF 기준")

    buyback_text = find_text_with_keywords(units, ["자사주 매입", "자사주매입"])
    if buyback_text:
        add_metric("자사주매입", buyback_text, "주주환원")

    dividend_text = find_text_with_keywords(units, ["배당"])
    if dividend_text and len(out) < 4:
        add_metric("배당", dividend_text, "현금 배당")

    if len(out) < 4 and company_move.get("roe_display"):
        add_metric("ROE", str(company_move.get("roe_display")), "수익성")
    if len(out) < 4 and company_move.get("market_cap_display"):
        add_metric("시가총액", str(company_move.get("market_cap_display")), "시장 가치")

    return out[:4]


def build_growth_columns_from_texts(texts: list[str]) -> list[dict[str, Any]]:
    units = split_text_units(texts)
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    score_by_index = [90.0, 76.0, 62.0, 48.0]
    joined = " ".join(units)

    def add_column(label: str, token: str) -> None:
        if not token or label in seen:
            return
        seen.add(label)
        out.append(
            {
                "label": label,
                "value": truncate_text(token, max_len=10),
                "pct": score_by_index[min(len(out), len(score_by_index) - 1)],
            }
        )

    synergy_match = re.search(r"연간\s*([0-9][0-9,.]*)억 달러\s*시너지", joined)
    if synergy_match:
        add_column("시너지", f"${synergy_match.group(1)}억")

    aisc_pct_match = re.search(r"AISC(?:를)?\s*([0-9]+(?:\.\d+)?)~([0-9]+(?:\.\d+)?)%\s*이상", joined)
    if aisc_pct_match:
        add_column("원가 개선", f"+{aisc_pct_match.group(2)}%")
    else:
        aisc_money_match = re.search(r"([0-9]+(?:\.\d+)?)~([0-9]+(?:\.\d+)?)달러\s*절감", joined)
        if aisc_money_match:
            add_column("원가 개선", f"${aisc_money_match.group(2)}")

    recovery_match = re.search(r"회수율(?:을)?\s*([0-9]+(?:\.\d+)?)%\s*향상", joined)
    if recovery_match:
        add_column("회수율", f"+{recovery_match.group(1)}%")

    rebound_match = re.search(r"([0-9]+(?:\.\d+)?)%\s*(?:의\s*)?반등", joined)
    if rebound_match:
        add_column("장중 반등", f"+{rebound_match.group(1)}%")

    upside_match = re.search(r"([0-9]+(?:\.\d+)?)배\s*이상의\s*상승", joined)
    if not upside_match:
        upside_match = re.search(r"([0-9]+(?:\.\d+)?)배\s*이상의\s*주가\s*상승", joined)
    if not upside_match:
        upside_match = re.search(r"([0-9]+(?:\.\d+)?)배\s*이상의\s*주가\s*상승은", joined)
    if not upside_match:
        upside_match = re.search(r"([0-9]+(?:\.\d+)?)배\s*이상", joined)
    if upside_match:
        add_column("상승 여력", f"{upside_match.group(1)}배")

    patterns = [
        ("시너지", ["시너지", "뉴크레스트"]),
        ("원가 개선", ["AISC", "절감"]),
        ("회수율", ["회수율", "향상"]),
        ("장중 반등", ["반등"]),
        ("상승 여력", ["배 이상의", "배 이상", "상승 여력"]),
    ]
    for label, keywords in patterns:
        if len(out) >= 4:
            break
        text = find_text_with_keywords(units, keywords)
        token = extract_token_near_keyword(text, keywords) or format_numeric_token(text)
        if not text or not token:
            continue
        add_column(label, token)

    return out[:4]


def build_risk_items_from_texts(texts: list[str]) -> list[dict[str, str]]:
    units = split_text_units(texts)
    out: list[dict[str, str]] = []
    joined = " ".join(units)

    def add_item(label: str, detail: str, token: str) -> None:
        if not token:
            return
        out.append(
            {
                "label": truncate_text(label, max_len=14),
                "detail": truncate_text(detail, max_len=16),
                "highlight": truncate_text(token, max_len=10),
            }
        )

    royalty_match = re.search(r"([0-9]+)%\s*→\s*([0-9]+)%", joined)
    if royalty_match:
        add_item("가나 로열티", "로열티 상향 압박", f"{royalty_match.group(1)}%→{royalty_match.group(2)}%")

    strike_match = re.search(r"([0-9]+)개월(?:간)?\s*(?:멈춰|중단|파업)", joined)
    if strike_match:
        add_item("멕시코 파업", "운영 전면 중단", f"{strike_match.group(1)}개월")

    cashflow_match = re.search(r"30(?:\.\d+)?%\s*(?:증발|감소|하락)", joined)
    if cashflow_match:
        drop_value = re.search(r"30(?:\.\d+)?", cashflow_match.group(0)).group(0)
        add_item("현금흐름 충격", "금값 하락 시 타격", f"-{drop_value}%")

    collapse_match = re.search(r"50(?:\.\d+)?%\s*이상\s*폭락", joined)
    if collapse_match:
        add_item("최악 시나리오", "주가 급락 가능", "-50%")

    if len(out) < 4:
        specs = [
            ("가나 로열티", ["로열티", "12%"], "로열티 상향 압박"),
            ("멕시코 파업", ["4개월", "파업"], "운영 전면 중단"),
            ("현금흐름 충격", ["30.1%", "30%"], "금값 하락 시 타격"),
            ("최악 시나리오", ["50% 이상", "폭락"], "주가 급락 가능"),
        ]
        for label, keywords, detail in specs:
            if len(out) >= 4:
                break
            text = find_text_with_keywords(units, keywords)
            token = extract_token_near_keyword(text, keywords) or format_numeric_token(text)
            if not text or not token or any(item["label"] == truncate_text(label, max_len=14) for item in out):
                continue
            add_item(label, detail, token)

    return out[:4]


def build_risk_total_exposure(texts: list[str], fallback: str) -> str:
    joined = " ".join(split_text_units(texts))
    risk_drop_match = re.search(r"20(?:\.\d+)?%\s*(?:하락|급락)", joined)
    cashflow_match = re.search(r"30(?:\.\d+)?%\s*(?:증발|감소|하락)", joined)
    if risk_drop_match and cashflow_match:
        left = "-20%"
        right = f"-{re.search(r'30(?:\\.\\d+)?', cashflow_match.group(0)).group(0)}%"
        return truncate_text(f"금값 {left} / CF {right}", max_len=22)
    direct = format_numeric_token(fallback)
    if direct:
        return truncate_text(direct, max_len=22)
    return truncate_text(fallback, max_len=22)


def extract_sentiment_price_range(texts: list[str], fallback_close: float | None, day_change_pct: float) -> dict[str, float]:
    joined = " ".join(split_text_units(texts))
    range_match = re.search(
        r"([0-9]+(?:\.\d+)?)달러(?:를)?\s*저점(?:으로)?\s*([0-9]+(?:\.\d+)?)달러(?:까지)?\s*반등",
        joined,
    )
    if range_match:
        low = float(range_match.group(1))
        high = float(range_match.group(2))
        close = high
        return {
            "low": round(low, 2),
            "high": round(high, 2),
            "close": round(close, 2),
            "dayChangePct": round(float(day_change_pct), 2),
        }

    if fallback_close:
        rounded = round(float(fallback_close), 2)
        return {
            "low": rounded,
            "high": rounded,
            "close": rounded,
            "dayChangePct": round(float(day_change_pct), 2),
        }

    return {
        "low": 0.0,
        "high": 0.0,
        "close": 0.0,
        "dayChangePct": round(float(day_change_pct), 2),
    }


def collect_debate_role_texts(debate_payload: dict[str, Any] | None, role: str) -> list[str]:
    if not isinstance(debate_payload, dict):
        return []
    out: list[str] = []
    rounds = debate_payload.get("rounds")
    if isinstance(rounds, list):
        for round_payload in rounds:
            if not isinstance(round_payload, dict):
                continue
            role_payload = round_payload.get(role)
            if isinstance(role_payload, dict):
                out.extend(collect_text_fragments(role_payload.get("text")))
            elif isinstance(role_payload, str):
                out.extend(collect_text_fragments(role_payload))
    conclusion = debate_payload.get("conclusion")
    if isinstance(conclusion, dict):
        out.extend(collect_text_fragments(conclusion.get("text")))
    elif isinstance(conclusion, str):
        out.extend(collect_text_fragments(conclusion))
    return out


def point_to_metric(point: str, *, index: int) -> dict[str, Any]:
    text = strip_visual_tone(point)
    label = ""
    remainder = text
    if ":" in text:
        label, remainder = [strip_visual_tone(part) for part in text.split(":", 1)]
    if not label:
        label = f"지표 {index + 1}"
    paren_match = re.search(r"\(([^)]+)\)", remainder)
    sub = strip_visual_tone(paren_match.group(1)) if paren_match else ""
    value = strip_visual_tone(re.sub(r"\([^)]*\)", "", remainder))
    value = truncate_text(value or label, max_len=18)
    pct = extract_percentage([remainder])
    if pct is None:
        pct = [88, 72, 58, 44][min(index, 3)]
    pct = max(10.0, min(100.0, abs(float(pct))))
    return {
        "label": truncate_text(label, max_len=18),
        "value": value,
        "sub": truncate_text(sub or value, max_len=28),
        "pct": round(pct, 1),
    }


def build_growth_columns(points: list[str]) -> list[dict[str, Any]]:
    columns: list[dict[str, Any]] = []
    seen: set[str] = set()
    for point in points:
        text = strip_visual_tone(point)
        for label, pct_value in re.findall(r"([가-힣A-Za-z][가-힣A-Za-z\s/']{0,16})\s*([+-]?\d+(?:\.\d+)?)%", text):
            clean_label = truncate_text(strip_visual_tone(label), max_len=16)
            key = clean_label.lower()
            if not clean_label or key in seen:
                continue
            seen.add(key)
            columns.append(
                {
                    "label": clean_label,
                    "value": f"{float(pct_value):+g}%",
                    "pct": max(10.0, min(100.0, abs(float(pct_value)))),
                }
            )
            if len(columns) >= 4:
                return columns
    for index, point in enumerate(points):
        if len(columns) >= 4:
            break
        text = strip_visual_tone(point)
        if not text:
            continue
        label = ""
        value = ""
        if ":" in text:
            label, value = [strip_visual_tone(part) for part in text.split(":", 1)]
        if not label:
            label = truncate_text(text, max_len=16)
        if not value:
            value = truncate_text(text, max_len=18)
        key = label.lower()
        if key in seen:
            continue
        seen.add(key)
        columns.append(
            {
                "label": truncate_text(label, max_len=16),
                "value": truncate_text(value, max_len=18),
                "pct": [90.0, 76.0, 62.0, 48.0][min(index, 3)],
            }
        )
    return columns[:4]


def build_risk_items(points: list[str]) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    for point in points[:4]:
        text = strip_visual_tone(point)
        if not text:
            continue
        label = ""
        detail = text
        if ":" in text:
            label, detail = [strip_visual_tone(part) for part in text.split(":", 1)]
        highlight_match = re.search(r"(EUR\s*[0-9.,]+M|\$[0-9.,]+[BM]?|[0-9]+개국|[0-9]+%)", text)
        highlight = compact_text(highlight_match.group(1)) if highlight_match else truncate_text(detail, max_len=10)
        out.append(
            {
                "label": truncate_text(label or detail, max_len=24),
                "detail": truncate_text(detail, max_len=30),
                "highlight": truncate_text(highlight, max_len=12),
            }
        )
    return out[:4]


def build_sentiment_keywords(texts: list[str]) -> list[str]:
    mapping = (
        ("fomo", "FOMO"),
        ("반사성", "반사성"),
        ("오버슈팅", "오버슈팅"),
        ("낙관", "낙관 우위"),
        ("규제", "규제 무시"),
        ("탐욕", "탐욕"),
    )
    out: list[str] = []
    seen: set[str] = set()
    haystack = " ".join(texts).lower()
    for token, label in mapping:
        if token.lower() not in haystack or label in seen:
            continue
        seen.add(label)
        out.append(label)
        if len(out) >= 4:
            break
    if out:
        return out
    return ["FOMO", "낙관 우위", "리스크 무시"][:4]


def is_generic_bkng_payload(payload: dict[str, Any]) -> bool:
    return isinstance(payload.get("slides"), list) and not isinstance(payload.get("hook"), dict)


def build_bkng_direct_props(
    *,
    generic_payload: dict[str, Any],
    date: str,
    lang: str,
    script_payload: dict[str, Any],
    sections: list[dict[str, Any]],
    duration_seconds: float,
    audio_file: str,
    scene_timing: dict[str, dict[str, float]],
    debate_payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    metadata = script_payload.get("metadata") if isinstance(script_payload.get("metadata"), dict) else {}
    company_profile = metadata.get("company_profile") if isinstance(metadata.get("company_profile"), dict) else {}
    company_moves = expand_company_moves_for_sections(script_payload, sections)
    expert_sections = resolve_expert_sections(script_payload)
    slides = generic_payload.get("slides") if isinstance(generic_payload.get("slides"), list) else []
    slide_by_section: dict[str, dict[str, Any]] = {}
    for idx, section in enumerate(sections):
        if idx < len(slides) and isinstance(slides[idx], dict):
            slide_by_section[normalize_section_name(section.get("name"))] = slides[idx]

    ticker = ""
    for candidate in [
        company_profile.get("ticker"),
        *(move.get("ticker") for move in company_moves if isinstance(move, dict)),
        script_payload.get("ticker"),
    ]:
        normalized = re.sub(r"[^A-Z0-9^.-]", "", str(candidate or "").upper())
        if normalized:
            ticker = normalized
            break

    fallback_name = resolve_company_name(script_payload) or ticker
    display_name = extract_company_display_name(
        ticker=ticker,
        company_profile=company_profile,
        fallback_name=fallback_name,
    )

    all_texts = collect_text_fragments(
        [
            generic_payload,
            metadata.get("company_profile"),
            metadata.get("key_points"),
            metadata.get("company_moves"),
            script_payload.get("hook"),
            script_payload.get("title"),
        ]
    )
    close_price = extract_close_price(all_texts)
    first_move = company_moves[0] if company_moves else {}
    day_change_text = compact_text(first_move.get("day_change_display"))
    if not day_change_text:
        day_change_value = extract_percentage(all_texts)
        if day_change_value is not None:
            sign = "+" if day_change_value >= 0 else ""
            day_change_text = f"{sign}{day_change_value:.2f}%"
    if not day_change_text:
        day_change_text = "+0.00%"

    hook_slide = slide_by_section.get("hook", {})
    hook_copy = first_nonempty_text(
        [
            generic_payload.get("hook"),
            hook_slide.get("subheadline"),
            hook_slide.get("body"),
            script_payload.get("hook"),
            company_profile.get("today_expert_summary"),
        ],
        max_len=MAX_VISUAL_BODY,
    )

    role_to_section = {
        "fundamental": "company_1",
        "growth": "company_2",
        "risk": "company_3",
        "sentiment": "company_4",
    }
    move_by_role = {compact_text(move.get("segment_role")): move for move in company_moves if isinstance(move, dict)}

    def role_slide(role: str) -> dict[str, Any]:
        return slide_by_section.get(role_to_section[role], {})

    def role_move(role: str, index: int) -> dict[str, Any]:
        if role in move_by_role:
            return move_by_role[role]
        return company_moves[index] if index < len(company_moves) else {}

    def role_context_texts(role: str, index: int) -> list[str]:
        move = role_move(role, index)
        section_name = role_to_section[role]
        expert_section = expert_sections.get(section_name, {})
        section_payload = next(
            (section for section in sections if normalize_section_name(section.get("name")) == section_name),
            {},
        )
        return collect_text_fragments(
            [
                expert_section,
                move,
                section_payload,
                company_profile.get("expert_summaries", {}).get(role) if isinstance(company_profile.get("expert_summaries"), dict) else "",
                company_profile.get("expert_points", {}).get(role) if isinstance(company_profile.get("expert_points"), dict) else [],
                collect_debate_role_texts(debate_payload, role),
            ]
        )

    closing_slide = slide_by_section.get("closing", {})

    fundamental_move = role_move("fundamental", 0)
    fundamental_texts = role_context_texts("fundamental", 0)
    fundamental_metrics = build_fundamental_metrics_from_texts(fundamental_texts, fundamental_move)
    if not fundamental_metrics:
        fundamental_points = normalize_company_point_lines(
            fundamental_move.get("slide_points"),
            limit=4,
            max_len=96,
        )
        fundamental_metrics = [point_to_metric(point, index=index) for index, point in enumerate(fundamental_points[:4])]
    if not fundamental_metrics:
        fundamental_metrics = [point_to_metric("핵심 지표: 데이터 확인", index=0)]

    growth_move = role_move("growth", 1)
    growth_texts = role_context_texts("growth", 1)
    growth_points = normalize_company_point_lines(growth_move.get("slide_points"), limit=4, max_len=96)
    growth_columns = build_growth_columns_from_texts(growth_texts)
    if not growth_columns:
        growth_columns = build_growth_columns(growth_points)
    if not growth_columns:
        growth_columns = [{"label": "성장", "value": "확인 필요", "pct": 72.0}]

    risk_move = role_move("risk", 2)
    risk_texts = role_context_texts("risk", 2)
    risk_points = normalize_company_point_lines(risk_move.get("slide_points"), limit=4, max_len=96)
    risk_items = build_risk_items_from_texts(risk_texts)
    if not risk_items:
        risk_items = build_risk_items(risk_points)
    if not risk_items:
        risk_items = [{"label": "리스크", "detail": "핵심 변수 확인", "highlight": "CHECK"}]

    sentiment_move = role_move("sentiment", 3)
    sentiment_texts = role_context_texts("sentiment", 3)
    day_change_pct = sentiment_move.get("day_change_pct")
    if not isinstance(day_change_pct, (int, float)):
        extracted_pct = extract_percentage(sentiment_texts)
        day_change_pct = extracted_pct if extracted_pct is not None else 0.0
    price_range = extract_sentiment_price_range(sentiment_texts, close_price, float(day_change_pct))
    close_value = price_range.get("close") or close_price or 0.0

    key_points = normalize_string_list(metadata.get("key_points"), limit=3, max_len=44)
    finale_headline = first_nonempty_text(
        [
            closing_slide.get("headline"),
            closing_slide.get("subheadline"),
        ],
        max_len=40,
    )
    if "구독과 좋아요" in finale_headline or "like and subscribe" in finale_headline.lower():
        finale_headline = ""
    if not finale_headline:
        finale_headline = f"4명의 전문가가 분석한\n{ticker}의 현재 위치"

    return {
        "date": date,
        "ticker": ticker,
        "durationSeconds": round(duration_seconds, 3),
        "audioSrc": resolve_shorts_audio_src(date, audio_file),
        "sceneTiming": scene_timing,
        "hook": {
            "eyebrow": build_hook_eyebrow(ticker),
            "headlineTop": display_name,
            "headlineBottom": format_hook_price(close_value, fallback=ticker),
            "subheadline": hook_copy,
            "dayChange": day_change_text,
        },
        "fundamental": {
            "label": expert_sections.get("company_1", {}).get("label") or BKNG_ROLE_LABELS["fundamental"],
            "stance": BKNG_ROLE_STANCES["fundamental"],
            "confidence": BKNG_ROLE_CONFIDENCE["fundamental"],
            "summary": first_nonempty_text(
                [
                    role_slide("fundamental").get("subheadline"),
                    role_slide("fundamental").get("body"),
                    fundamental_move.get("move_summary"),
                    expert_sections.get("company_1", {}).get("summary"),
                ],
                max_len=40,
            ),
            "metrics": fundamental_metrics[:4],
        },
        "growth": {
            "label": expert_sections.get("company_2", {}).get("label") or BKNG_ROLE_LABELS["growth"],
            "stance": BKNG_ROLE_STANCES["growth"],
            "confidence": BKNG_ROLE_CONFIDENCE["growth"],
            "summary": first_nonempty_text(
                [
                    role_slide("growth").get("subheadline"),
                    role_slide("growth").get("body"),
                    growth_move.get("move_summary"),
                    expert_sections.get("company_2", {}).get("summary"),
                ],
                max_len=40,
            ),
            "columns": growth_columns[:4],
            "footnote": first_nonempty_text(
                [
                    role_slide("growth").get("body"),
                    expert_sections.get("company_2", {}).get("summary"),
                    "성장 포인트 기준",
                ],
                max_len=64,
            ),
        },
        "risk": {
            "label": expert_sections.get("company_3", {}).get("label") or BKNG_ROLE_LABELS["risk"],
            "stance": BKNG_ROLE_STANCES["risk"],
            "confidence": BKNG_ROLE_CONFIDENCE["risk"],
            "summary": first_nonempty_text(
                [
                    role_slide("risk").get("subheadline"),
                    role_slide("risk").get("body"),
                    risk_move.get("move_summary"),
                    expert_sections.get("company_3", {}).get("summary"),
                ],
                max_len=40,
            ),
            "items": risk_items[:4],
            "totalExposure": build_risk_total_exposure(
                risk_texts,
                first_nonempty_text(
                    [
                        risk_move.get("valuation_note"),
                        risk_move.get("reason"),
                        role_slide("risk").get("body"),
                        "핵심 규제 리스크",
                    ],
                    max_len=24,
                ),
            ),
        },
        "sentiment": {
            "label": expert_sections.get("company_4", {}).get("label") or BKNG_ROLE_LABELS["sentiment"],
            "stance": BKNG_ROLE_STANCES["sentiment"],
            "confidence": BKNG_ROLE_CONFIDENCE["sentiment"],
            "summary": first_nonempty_text(
                [
                    role_slide("sentiment").get("subheadline"),
                    role_slide("sentiment").get("body"),
                    sentiment_move.get("move_summary"),
                    expert_sections.get("company_4", {}).get("summary"),
                ],
                max_len=40,
            ),
            "priceRange": price_range,
            "keywords": build_sentiment_keywords(sentiment_texts),
            "insight": first_nonempty_text(
                [
                    role_slide("sentiment").get("body"),
                    company_profile.get("today_expert_summary"),
                    sentiment_move.get("reason"),
                ],
                max_len=MAX_VISUAL_BODY,
            ),
        },
        "finale": {
            "headline": finale_headline,
            "bullets": key_points or normalize_string_list(closing_slide.get("bullets"), limit=3, max_len=44),
            "cta": default_cta_text(lang),
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
    debate_payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    slides_cfg = resolve_slides_config_node(config)
    system_prompt = compact_text(slides_cfg.get("system"))
    user_template = slides_cfg.get("user_template")
    if not isinstance(user_template, str) or not user_template.strip():
        raise ValueError("slides.user_template is missing in prompt config")

    expanded_company_moves = expand_company_moves_for_sections(script_payload, sections)
    format_kwargs: dict[str, Any] = dict(
        date=date,
        lang=lang,
        duration_seconds=round(duration_seconds, 3),
        shorts_script_json=json.dumps(script_payload, ensure_ascii=False, indent=2),
        sections_json=json.dumps(sections, ensure_ascii=False, indent=2),
        section_timing_json=json.dumps(timing_payload or {}, ensure_ascii=False, indent=2),
        company_moves_json=json.dumps(expanded_company_moves, ensure_ascii=False, indent=2),
        debate_json=json.dumps(debate_payload or {}, ensure_ascii=False, indent=2),
    )
    # Only pass keys that appear in the template to avoid KeyError with legacy templates
    import string
    template_keys = {field_name for _, field_name, _, _ in string.Formatter().parse(user_template) if field_name}
    filtered_kwargs = {k: v for k, v in format_kwargs.items() if k in template_keys}
    user_prompt = user_template.format(**filtered_kwargs)
    full_prompt = f"{system_prompt}\n\n{user_prompt}" if system_prompt else user_prompt
    response = llm.invoke(full_prompt)
    return extract_json_object(response_to_text(response.content))


def generate_llm_upload_metadata_payload(
    *,
    llm: Any,
    config: dict[str, Any],
    date: str,
    lang: str,
    duration_seconds: float,
    script_payload: dict[str, Any],
    render_payload: dict[str, Any],
    sections: list[dict[str, Any]],
    debate_payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    metadata_cfg = resolve_upload_metadata_config_node(config)
    system_prompt = compact_text(metadata_cfg.get("system"))
    user_template = metadata_cfg.get("user_template")
    if not isinstance(user_template, str) or not user_template.strip():
        raise ValueError("upload_metadata.user_template is missing in prompt config")

    format_kwargs: dict[str, Any] = dict(
        date=date,
        lang=lang,
        duration_seconds=round(duration_seconds, 3),
        shorts_script_json=json.dumps(script_payload, ensure_ascii=False, indent=2),
        render_payload_json=json.dumps(render_payload, ensure_ascii=False, indent=2),
        sections_json=json.dumps(sections, ensure_ascii=False, indent=2),
        debate_json=json.dumps(debate_payload or {}, ensure_ascii=False, indent=2),
    )
    import string

    template_keys = {field_name for _, field_name, _, _ in string.Formatter().parse(user_template) if field_name}
    filtered_kwargs = {k: v for k, v in format_kwargs.items() if k in template_keys}
    user_prompt = user_template.format(**filtered_kwargs)
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
    title = build_analysis_title(script_payload, lang)

    return {
        "date": date,
        "lang": lang,
        "title": title,
        "hook": compact_text(script_payload.get("hook")),
        "durationSeconds": round(duration_seconds, 3),
        "audioFile": audio_file,
        "sections": sections,
        "meta": {
            "keyPoints": [compact_text(item) for item in (metadata.get("key_points") or []) if compact_text(item)][:4],
            "featuredTickers": normalize_tickers(metadata.get("featured_tickers")),
            "companyMoves": expand_company_moves_for_sections(script_payload, sections),
            "companyProfile": metadata.get("company_profile") if isinstance(metadata.get("company_profile"), dict) else {},
            "variant": "theme-firm",
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
    title = build_analysis_title(script_payload, lang)

    defaults = resolve_slides_defaults(config) if isinstance(config, dict) else {}
    phase_by_section = defaults.get("phase_by_section") if isinstance(defaults.get("phase_by_section"), dict) else {}
    theme_by_section = defaults.get("theme_by_section") if isinstance(defaults.get("theme_by_section"), dict) else {}
    eyebrow_by_section = defaults.get("eyebrow_by_section") if isinstance(defaults.get("eyebrow_by_section"), dict) else {}

    slides: list[dict[str, Any]] = []
    captions: list[dict[str, Any]] = []
    company_moves = expand_company_moves_for_sections(script_payload, sections)
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
        company_ticker = truncate_text(company_move.get("ticker"), max_len=MAX_VISUAL_HEADLINE)

        headline = title
        subheadline = truncate_text(strip_visual_tone(text or compact_text(script_payload.get("hook"))), max_len=MAX_VISUAL_SUBHEADLINE)
        body = subheadline
        bullets = [sentence for sentence in re.split(r"(?<=[.!?])\s+", body) if compact_text(sentence)][:2]
        bullets = [truncate_text(item, max_len=44) for item in bullets if compact_text(item)]
        if not bullets:
            bullets = [truncate_text(body, max_len=44)]
        if is_hook:
            headline = title or "US Market Close"
            subheadline = truncate_text(strip_visual_tone(text or compact_text(script_payload.get("hook"))), max_len=MAX_VISUAL_SUBHEADLINE)
            body = subheadline
        if is_company:
            headline = company_ticker or headline
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
                "headline": strip_visual_tone(headline),
                "subheadline": strip_visual_tone(subheadline),
                "body": strip_visual_tone(body),
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
                "text": truncate_text(strip_visual_tone(text or subheadline), max_len=72),
            }
        )

    return {
        "date": date,
        "lang": lang,
        "title": title or "US Market Close",
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
            "companyMoves": company_moves,
            "companyProfile": metadata.get("company_profile") if isinstance(metadata.get("company_profile"), dict) else {},
            "variant": "theme-firm",
        },
    }


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def resolve_theme_firm_ticker(script_payload: dict[str, Any], render_payload: dict[str, Any]) -> str:
    candidates = [
        render_payload.get("ticker"),
    ]
    metadata = script_payload.get("metadata") if isinstance(script_payload.get("metadata"), dict) else {}
    company_profile = metadata.get("company_profile") if isinstance(metadata.get("company_profile"), dict) else {}
    candidates.append(company_profile.get("ticker"))
    company_moves = metadata.get("company_moves") if isinstance(metadata.get("company_moves"), list) else []
    if company_moves and isinstance(company_moves[0], dict):
        candidates.append(company_moves[0].get("ticker"))
    for candidate in candidates:
        ticker = re.sub(r"[^A-Z0-9^.-]", "", str(candidate or "").upper())
        if ticker:
            return ticker
    return ""


def resolve_theme_firm_display_name(script_payload: dict[str, Any], render_payload: dict[str, Any], lang: str) -> str:
    hook = render_payload.get("hook") if isinstance(render_payload.get("hook"), dict) else {}
    headline_top = compact_text(hook.get("headlineTop"))
    if headline_top and not re.fullmatch(r"[$0-9, .+-]+", headline_top):
        return headline_top
    company_name = simplify_company_name(resolve_company_name(script_payload))
    if company_name:
        return company_name
    return "핵심 종목" if compact_text(lang).lower() != "en" else "Focus Stock"


def trim_trailing_punctuation(value: Any) -> str:
    return compact_text(value).rstrip(" .!?")


def build_theme_firm_hook_lead(hook_text: str, company_name: str, ticker: str, lang: str) -> str:
    text = compact_text(hook_text)
    for token in filter(None, [company_name, ticker, f"({ticker})" if ticker else ""]):
        text = text.replace(token, " ")
    text = compact_text(text)

    if compact_text(lang).lower() == "en":
        lowered = text.lower()
        if "sell-off" in lowered or "drop" in lowered:
            return "Why did it sell off?"
        if "rebound" in lowered:
            return "Why did it rebound?"
        if "surge" in lowered:
            return "Why did it surge?"
        if "why" in lowered:
            return "What is the market missing?"
        return compact_text(text[:44]).rstrip(" ,")

    if "급등락" in text:
        return "왜 급등락했을까"
    if "급락" in text:
        return "왜 급락했을까"
    if "반등" in text:
        return "왜 반등했을까"
    if "왜" in text:
        return "시장이 놓친 건 뭘까"
    if "리스크" in text:
        return "지금 봐야 할 리스크"
    return compact_text(text[:24]).rstrip(" ,")


def build_theme_firm_fact_lead(render_payload: dict[str, Any], lang: str) -> str:
    risk = render_payload.get("risk") if isinstance(render_payload.get("risk"), dict) else {}
    risk_items = risk.get("items") if isinstance(risk.get("items"), list) else []
    negative_candidates: list[tuple[float, str]] = []
    for item in risk_items:
        if not isinstance(item, dict):
            continue
        highlight = compact_text(item.get("highlight"))
        label = trim_trailing_punctuation(item.get("label"))
        numeric = parse_float_token(highlight)
        if highlight.startswith("-") and numeric is not None:
            lead = (
                f"최악엔 {highlight} 가능성"
                if compact_text(lang).lower() != "en"
                else f"Downside risk: {highlight}"
            )
            negative_candidates.append((numeric, lead))
        elif "최악" in label and highlight:
            lead = (
                f"최악엔 {highlight} 가능성"
                if compact_text(lang).lower() != "en"
                else f"Worst case: {highlight}"
            )
            negative_candidates.append((-9999.0, lead))
    if negative_candidates:
        negative_candidates.sort(key=lambda item: item[0])
        return negative_candidates[0][1]

    for item in risk_items:
        if not isinstance(item, dict):
            continue
        highlight = compact_text(item.get("highlight"))
        label = trim_trailing_punctuation(item.get("label"))
        if compact_text(lang).lower() == "en":
            if "→" in highlight:
                return f"{label} shock: {highlight}"
            if "month" in highlight.lower():
                return f"{highlight} disruption risk"
        else:
            if "→" in highlight:
                return f"{label} {highlight} 충격"
            if "개월" in highlight:
                return f"{label} {highlight} 중단 리스크"

    growth = render_payload.get("growth") if isinstance(render_payload.get("growth"), dict) else {}
    growth_columns = growth.get("columns") if isinstance(growth.get("columns"), list) else []
    for column in growth_columns:
        if not isinstance(column, dict):
            continue
        label = trim_trailing_punctuation(column.get("label"))
        value = compact_text(column.get("value"))
        if "배" in value:
            return f"{label} {value} 시나리오" if compact_text(lang).lower() != "en" else f"{label} {value} scenario"
        if value.startswith("+"):
            numeric = parse_float_token(value)
            if numeric is not None and abs(numeric) >= 20:
                return f"{label} {value} 성장론" if compact_text(lang).lower() != "en" else f"{label} {value} growth case"

    sentiment = render_payload.get("sentiment") if isinstance(render_payload.get("sentiment"), dict) else {}
    price_range = sentiment.get("priceRange") if isinstance(sentiment.get("priceRange"), dict) else {}
    day_change = price_range.get("dayChangePct")
    if isinstance(day_change, (int, float)) and abs(float(day_change)) >= 5:
        if compact_text(lang).lower() == "en":
            return f"{float(day_change):+.2f}% and still rebounding?"
        return f"{float(day_change):+.2f}%에도 반등한 이유"

    return ""


def build_theme_firm_youtube_title(
    *,
    script_payload: dict[str, Any],
    render_payload: dict[str, Any],
    lang: str,
) -> str:
    ticker = resolve_theme_firm_ticker(script_payload, render_payload)
    company_name = resolve_theme_firm_display_name(script_payload, render_payload, lang)
    hook = render_payload.get("hook") if isinstance(render_payload.get("hook"), dict) else {}
    hook_text = compact_text(hook.get("subheadline") or script_payload.get("hook"))
    lead = build_theme_firm_fact_lead(render_payload, lang) or build_theme_firm_hook_lead(
        hook_text,
        company_name,
        ticker,
        lang,
    )
    suffix = f"{company_name} ({ticker})" if ticker else company_name
    title = f"{lead} | {suffix}" if lead else suffix
    return title[:100].rstrip()


def build_theme_firm_youtube_description(
    *,
    script_payload: dict[str, Any],
    render_payload: dict[str, Any],
    lang: str,
) -> str:
    metadata = script_payload.get("metadata") if isinstance(script_payload.get("metadata"), dict) else {}
    company_name = resolve_theme_firm_display_name(script_payload, render_payload, lang)
    ticker = resolve_theme_firm_ticker(script_payload, render_payload)
    company_label = f"{company_name} ({ticker})" if ticker else company_name
    hook = render_payload.get("hook") if isinstance(render_payload.get("hook"), dict) else {}
    hook_text = compact_text(hook.get("subheadline") or script_payload.get("hook"))
    key_points = normalize_string_list(metadata.get("key_points"), limit=4, max_len=110)

    section_map = [
        ("펀더멘털", render_payload.get("fundamental")),
        ("성장 포인트", render_payload.get("growth")),
        ("리스크", render_payload.get("risk")),
        ("시장 해석", render_payload.get("sentiment")),
    ]
    lines: list[str] = []
    if compact_text(lang).lower() == "en":
        lines.append(f"Today's AI debate short breaks down {company_label}.")
        if hook_text:
            lines.append(trim_trailing_punctuation(hook_text) + ".")
        lines.append("")
        lines.append("4 expert angles")
        for label, section in section_map:
            if not isinstance(section, dict):
                continue
            summary = trim_trailing_punctuation(section.get("summary"))
            if not summary:
                continue
            lines.append(f"- {label}: {summary}")
        if key_points:
            lines.append("")
            lines.append("Key debate points")
            for point in key_points[:3]:
                lines.append(f"- {trim_trailing_punctuation(point)}")
    else:
        lines.append(f"오늘의 AI debate 종목은 {company_label}입니다.")
        if hook_text:
            lines.append(trim_trailing_punctuation(hook_text) + ".")
        lines.append("")
        lines.append("4명의 전문가가 본 핵심 쟁점")
        for label, section in section_map:
            if not isinstance(section, dict):
                continue
            summary = trim_trailing_punctuation(section.get("summary"))
            if not summary:
                continue
            lines.append(f"- {label}: {summary}")
        if key_points:
            lines.append("")
            lines.append("핵심 debate 포인트")
            for point in key_points[:3]:
                lines.append(f"- {trim_trailing_punctuation(point)}")

    return "\n".join(line.rstrip() for line in lines).strip()[:5000]


def build_theme_firm_upload_tags(
    *,
    script_payload: dict[str, Any],
    render_payload: dict[str, Any],
    debate_payload: dict[str, Any] | None,
    lang: str,
) -> list[str]:
    company_name = resolve_theme_firm_display_name(script_payload, render_payload, lang)
    ticker = resolve_theme_firm_ticker(script_payload, render_payload)
    metadata = script_payload.get("metadata") if isinstance(script_payload.get("metadata"), dict) else {}
    company_profile = metadata.get("company_profile") if isinstance(metadata.get("company_profile"), dict) else {}
    thematic_texts = collect_text_fragments(
        [
            script_payload.get("hook"),
            metadata.get("key_points"),
            company_profile.get("why_now"),
            company_profile.get("business_model"),
            company_profile.get("expert_summaries"),
            render_payload.get("fundamental"),
            render_payload.get("growth"),
            render_payload.get("risk"),
            render_payload.get("sentiment"),
            debate_payload,
        ]
    )
    joined = " ".join(thematic_texts).lower()
    rules_ko = [
        ("지정학리스크", ["지정학", "중동", "정치적 불안정"]),
        ("금가격", ["금 가격", "금값", "gold"]),
        ("금광주", ["금광", "gold miner", "금광주"]),
        ("자율주행채굴", ["자율주행", "채굴 트럭"]),
        ("ai탐사", ["ai 탐사", "ai 기반 탐사", "머신러닝"]),
        ("환경규제", ["환경 규제", "epa", "환경"]),
        ("로열티리스크", ["로열티"]),
        ("저가매수", ["저가 매수", "과매도", "반등"]),
    ]
    rules_en = [
        ("geopoliticalrisk", ["geopolitical", "middle east", "political instability"]),
        ("goldprice", ["gold price", "gold"]),
        ("goldminer", ["gold miner", "mining"]),
        ("autonomousmining", ["autonomous", "haul truck"]),
        ("aiexploration", ["ai exploration", "machine learning"]),
        ("envregulation", ["environmental", "epa"]),
        ("royaltyrisk", ["royalty"]),
        ("dipbuying", ["oversold", "rebound", "dip buying"]),
    ]
    rules = rules_en if compact_text(lang).lower() == "en" else rules_ko
    tags: list[str] = []
    for tag, keywords in rules:
        if any(keyword in joined for keyword in keywords):
            tags.append(tag)
    tags.extend([company_name, ticker])
    out: list[str] = []
    seen: set[str] = set()
    for tag in tags:
        text = compact_text(tag)
        if not text:
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(text)
    return out


def build_theme_firm_upload_metadata_payload(
    *,
    script_payload: dict[str, Any],
    render_payload: dict[str, Any],
    debate_payload: dict[str, Any] | None,
    lang: str,
) -> dict[str, Any]:
    return {
        "title": build_theme_firm_youtube_title(
            script_payload=script_payload,
            render_payload=render_payload,
            lang=lang,
        ),
        "description": build_theme_firm_youtube_description(
            script_payload=script_payload,
            render_payload=render_payload,
            lang=lang,
        ),
        "tags": build_theme_firm_upload_tags(
            script_payload=script_payload,
            render_payload=render_payload,
            debate_payload=debate_payload,
            lang=lang,
        ),
    }


def merge_upload_metadata_payloads(
    *,
    fallback_payload: dict[str, Any],
    llm_payload: dict[str, Any],
) -> dict[str, Any]:
    merged = dict(fallback_payload)
    title = compact_text(llm_payload.get("title"))
    if title:
        merged["title"] = title[:100].rstrip()
    description = normalize_multiline_text(llm_payload.get("description"), max_len=5000)
    if description:
        merged["description"] = description
    tags = normalize_upload_tags(
        llm_payload.get("tags") or llm_payload.get("hashtags") or llm_payload.get("keywords"),
        limit=10,
        max_len=24,
    )
    if tags:
        merged["tags"] = tags
    return merged


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Prepare shorts-theme-firm slide script/template artifacts")
    parser.add_argument("date", type=str, help="Date in YYYYMMDD or YYYY-MM-DD")
    parser.add_argument("--lang", default="ko", choices=["ko", "en"])
    parser.add_argument("--script", type=Path, help="Path to shorts-theme-firm script.json")
    parser.add_argument("--timing", type=Path, help="Path to shorts-theme-firm sections.timing.json")
    parser.add_argument("--script-output", type=Path, help="Output path for slides.script.json")
    parser.add_argument("--template-output", type=Path, help="Output path for slides.render.template.json")
    parser.add_argument("--render-output", type=Path, help="Output path for slides.render.json")
    parser.add_argument("--upload-metadata-output", type=Path, help="Output path for upload.metadata.json")
    parser.add_argument("--overwrite-render", action="store_true", help="Overwrite slides.render.json")
    parser.add_argument("--config", type=Path, default=SLIDES_CONFIG_PATH, help="Slides prompt YAML path")
    parser.add_argument("--prefix", type=str, default="SHORTS_THEME_FIRM_SLIDES", help="LLM env prefix for slides generation")
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

    base_dir = ROOT_DIR / "podcast" / date / args.lang / "shorts-theme-firm"
    script_path = args.script or (base_dir / "script.json")
    timing_path = args.timing or (base_dir / "sections.timing.json")
    script_output_path = args.script_output or (base_dir / "slides.script.json")
    template_output_path = args.template_output or (base_dir / "slides.render.template.json")
    render_output_path = args.render_output or (base_dir / "slides.render.json")
    upload_metadata_output_path = args.upload_metadata_output or (base_dir / "upload.metadata.json")
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
    if not upload_metadata_output_path.is_absolute():
        upload_metadata_output_path = (ROOT_DIR / upload_metadata_output_path).resolve()

    logger.info("shorts-theme-firm slide preparation")
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
        audio_file = compact_text((timing_payload or {}).get("audioFile")) or f"shorts{date}.mp3"
        bkng_scene_timing = build_bkng_scene_timing(
            timing_payload=timing_payload,
            sections=sections,
            duration_seconds=duration_seconds,
        )

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
        debate_payload = load_debate_json(date, args.lang)
        asset_audio_src = resolve_shorts_audio_src(date, audio_file)
        render_payload = build_bkng_direct_props(
            generic_payload=template_payload,
            date=date,
            lang=args.lang,
            script_payload=script_payload,
            sections=sections,
            duration_seconds=duration_seconds,
            audio_file=audio_file,
            scene_timing=bkng_scene_timing,
            debate_payload=debate_payload,
        )

        llm = None
        if not args.no_llm:
            try:
                load_env_from_yaml(logger=logger)
                load_dotenv(ROOT_DIR / ".env", override=False)
                llm = build_llm(prefix=args.prefix, logger=logger)
            except Exception as llm_exc:
                logger.warning("LLM client setup failed, using fallback payloads: %s", llm_exc)
        else:
            logger.info("Gemini slides generation skipped (--no-llm)")

        if llm is not None:
            try:
                llm_payload = generate_llm_slides_payload(
                    llm=llm,
                    config=config,
                    date=display_date,
                    lang=args.lang,
                    duration_seconds=duration_seconds,
                    script_payload=script_payload,
                    sections=sections,
                    timing_payload=timing_payload,
                    debate_payload=debate_payload,
                )
                # Detect BkngDebateShortsProps format: has 'fundamental' key instead of 'slides'
                if isinstance(llm_payload.get("fundamental"), dict):
                    logger.info("Detected BkngDebateShortsProps format — using LLM output directly")
                    render_payload = llm_payload
                else:
                    normalized_payload = normalize_llm_render_payload(
                        llm_payload=llm_payload,
                        date=display_date,
                        lang=args.lang,
                        script_payload=script_payload,
                        sections=sections,
                        duration_seconds=duration_seconds,
                        audio_file=audio_file,
                        config=config,
                    )
                    render_payload = build_bkng_direct_props(
                        generic_payload=normalized_payload,
                        date=date,
                        lang=args.lang,
                        script_payload=script_payload,
                        sections=sections,
                        duration_seconds=duration_seconds,
                        audio_file=audio_file,
                        scene_timing=bkng_scene_timing,
                        debate_payload=debate_payload,
                    )
                logger.info("Generated slides.render payload via Gemini")
            except Exception as llm_exc:
                logger.warning("Gemini slides generation failed, using template fallback: %s", llm_exc)

        if isinstance(render_payload, dict):
            render_payload["date"] = date
            render_payload["audioSrc"] = asset_audio_src
            render_payload["sceneTiming"] = bkng_scene_timing
        upload_metadata_payload = build_theme_firm_upload_metadata_payload(
            script_payload=script_payload,
            render_payload=render_payload,
            debate_payload=debate_payload,
            lang=args.lang,
        )
        if llm is not None:
            try:
                llm_upload_metadata_payload = generate_llm_upload_metadata_payload(
                    llm=llm,
                    config=config,
                    date=display_date,
                    lang=args.lang,
                    duration_seconds=duration_seconds,
                    script_payload=script_payload,
                    render_payload=render_payload,
                    sections=sections,
                    debate_payload=debate_payload,
                )
                upload_metadata_payload = merge_upload_metadata_payloads(
                    fallback_payload=upload_metadata_payload,
                    llm_payload=llm_upload_metadata_payload,
                )
                logger.info("Generated upload metadata payload via Gemini")
            except Exception as llm_exc:
                logger.warning("Gemini upload metadata generation failed, using heuristic fallback: %s", llm_exc)

        write_json(script_output_path, slide_script_payload)
        write_json(template_output_path, template_payload)
        write_json(upload_metadata_output_path, upload_metadata_payload)
        logger.info("Saved slide script payload: %s", script_output_path)
        logger.info("Saved slide render template: %s", template_output_path)
        logger.info("Saved upload metadata JSON: %s", upload_metadata_output_path)

        if args.overwrite_render or not render_output_path.exists():
            write_json(render_output_path, render_payload)
            logger.info("Saved slide render JSON: %s", render_output_path)
        else:
            logger.info("Kept existing render JSON (no overwrite): %s", render_output_path)

        return 0
    except Exception as exc:
        logger.error("Failed to prepare shorts-theme-firm slide artifacts: %s", exc, exc_info=args.debug)
        return 1


if __name__ == "__main__":
    sys.exit(main())
