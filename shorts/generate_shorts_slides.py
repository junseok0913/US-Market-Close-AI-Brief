"""Generate shorts slides JSON from shorts/full scripts using an LLM.

Inputs:
- podcast/{date}/{lang}/shorts/script.json (primary source)
- podcast/{date}/{lang}/{date}.json or script.json (fallback context)

Output:
- podcast/{date}/{lang}/shorts/slides.render.json
"""

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

PROMPT_PATH = ROOT_DIR / "shorts" / "prompt" / "shorts_slides.yaml"

ALLOWED_PHASES = {"hook", "market", "insight", "finale"}
ALLOWED_THEMES = {"alert", "bear", "bull", "neutral", "macro", "flash"}

SECTION_ORDER = ("hook", "data", "story", "closing")
SECTION_NAME_ALIASES = {
    "hook": "hook",
    "opening": "hook",
    "open": "hook",
    "intro": "hook",
    "data": "data",
    "market": "data",
    "stats": "data",
    "story": "story",
    "theme": "story",
    "insight": "story",
    "closing": "closing",
    "finale": "closing",
    "outro": "closing",
    "watch": "closing",
}
SECTION_TO_PHASE = {
    "hook": "hook",
    "data": "market",
    "story": "insight",
    "closing": "finale",
}

PHASE_LABELS_KO = {
    "hook": "장마감 쇼츠",
    "market": "시장 흐름",
    "insight": "핵심 인사이트",
    "finale": "한 줄 결론",
}

PHASE_DEFAULT_THEMES = {
    "hook": "alert",
    "market": "bear",
    "insight": "macro",
    "finale": "flash",
}


def parse_date_token(token: str) -> str:
    normalized = token.replace("-", "")
    if len(normalized) != 8 or not normalized.isdigit():
        raise ValueError(f"Invalid date: {token}")
    return normalized


def compact_text(text: Any, max_len: int) -> str:
    cleaned = re.sub(r"\s+", " ", str(text or "")).strip()
    if not cleaned:
        return ""
    if len(cleaned) <= max_len:
        return cleaned
    return f"{cleaned[: max(1, max_len - 1)].rstrip()}…"


def clean_text(text: Any) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip()


def normalize_section_name(value: Any) -> str:
    return SECTION_NAME_ALIASES.get(str(value or "").strip().lower(), "")


def split_sentences(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", text or "").strip()
    if not normalized:
        return []

    protected = re.sub(r"(?<=\d)\.(?=\d)", "__DOT__", normalized)
    raw = re.findall(r"[^.!?]+[.!?]?", protected)
    sentences = [token.strip() for token in raw if token.strip()]
    if sentences:
        return [token.replace("__DOT__", ".") for token in sentences]

    return [normalized]


def partition_ranges(item_count: int, bucket_count: int) -> list[tuple[int, int]]:
    if item_count <= 0 or bucket_count <= 0:
        return []
    bucket_count = min(item_count, bucket_count)

    ranges: list[tuple[int, int]] = []
    start = 0
    base = item_count // bucket_count
    extra = item_count % bucket_count
    for idx in range(bucket_count):
        size = base + (1 if idx < extra else 0)
        end = start + size
        ranges.append((start, end))
        start = end
    return ranges


def build_fallback_sections_from_script(script_text: str, duration_seconds: float) -> list[dict[str, Any]]:
    sentences = split_sentences(script_text)
    if not sentences:
        sentences = ["오늘 시장 핵심을 빠르게 정리합니다."]

    ranges = partition_ranges(len(sentences), len(SECTION_ORDER))
    if len(ranges) < len(SECTION_ORDER):
        while len(ranges) < len(SECTION_ORDER):
            ranges.append((ranges[-1][1], ranges[-1][1]))

    texts: list[str] = []
    for idx, name in enumerate(SECTION_ORDER):
        start, end = ranges[idx]
        content = " ".join(sentences[start:end]).strip()
        if not content:
            content = sentences[min(start, max(len(sentences) - 1, 0))]
        texts.append(compact_text(content, 240))

    spans = allocate_durations(texts, duration_seconds, min_sec=2.0)
    cursor = 0.0
    out: list[dict[str, Any]] = []
    for idx, name in enumerate(SECTION_ORDER):
        start_sec = cursor
        end_sec = duration_seconds if idx == len(SECTION_ORDER) - 1 else min(duration_seconds, start_sec + spans[idx])
        out.append(
            {
                "id": idx,
                "name": name,
                "startSec": round(start_sec, 3),
                "endSec": round(end_sec, 3),
                "text": texts[idx],
            }
        )
        cursor = end_sec
    if out:
        out[0]["startSec"] = 0.0
        out[-1]["endSec"] = round(duration_seconds, 3)
    return out


def normalize_shorts_sections(shorts_script: dict[str, Any], duration_seconds: float) -> list[dict[str, Any]]:
    script_text = str(shorts_script.get("script") or "").strip()
    fallback_sections = build_fallback_sections_from_script(script_text, duration_seconds)
    fallback_by_name = {item["name"]: item for item in fallback_sections}

    out_by_name: dict[str, dict[str, Any]] = {}
    raw_sections = shorts_script.get("sections")
    if isinstance(raw_sections, list):
        for item in raw_sections:
            if not isinstance(item, dict):
                continue
            name = normalize_section_name(item.get("name"))
            if not name:
                continue
            text = compact_text(item.get("text") or item.get("script") or item.get("body"), 240)
            if not text:
                continue
            out_by_name[name] = {
                "id": SECTION_ORDER.index(name),
                "name": name,
                "text": text,
            }
    elif isinstance(raw_sections, dict):
        for key, value in raw_sections.items():
            name = normalize_section_name(key)
            if not name:
                continue
            text = compact_text(value, 240)
            if not text:
                continue
            out_by_name[name] = {
                "id": SECTION_ORDER.index(name),
                "name": name,
                "text": text,
            }

    normalized = []
    for name in SECTION_ORDER:
        item = out_by_name.get(name)
        if item is None:
            fallback = fallback_by_name[name]
            item = {
                "id": fallback["id"],
                "name": name,
                "text": fallback["text"],
            }
        normalized.append(item)
    return normalized


def normalize_section_timing_payload(
    section_timing: dict[str, Any] | None,
    shorts_sections: list[dict[str, Any]],
    duration_seconds: float,
) -> list[dict[str, Any]]:
    if not section_timing:
        return build_fallback_sections_from_script(
            " ".join(section.get("text", "") for section in shorts_sections),
            duration_seconds,
        )

    raw_sections = section_timing.get("sections")
    if not isinstance(raw_sections, list):
        return build_fallback_sections_from_script(
            " ".join(section.get("text", "") for section in shorts_sections),
            duration_seconds,
        )

    parsed: dict[str, dict[str, Any]] = {}
    for raw in raw_sections:
        if not isinstance(raw, dict):
            continue
        name = normalize_section_name(raw.get("name"))
        if not name:
            continue
        start = raw.get("startSec")
        end = raw.get("endSec")
        if not isinstance(start, (int, float)) or not isinstance(end, (int, float)):
            continue
        if end <= start:
            continue
        parsed[name] = {
            "id": SECTION_ORDER.index(name),
            "name": name,
            "startSec": float(start),
            "endSec": float(end),
            "text": compact_text(raw.get("text"), 240),
        }

    if len(parsed) < len(SECTION_ORDER):
        return build_fallback_sections_from_script(
            " ".join(section.get("text", "") for section in shorts_sections),
            duration_seconds,
        )

    normalized: list[dict[str, Any]] = []
    for idx, name in enumerate(SECTION_ORDER):
        item = parsed[name]
        text = item.get("text") or shorts_sections[idx].get("text") or ""
        normalized.append(
            {
                "id": idx,
                "name": name,
                "startSec": round(float(item["startSec"]), 3),
                "endSec": round(float(item["endSec"]), 3),
                "text": compact_text(text, 240),
            }
        )

    normalized.sort(key=lambda section: section["startSec"])
    normalized[0]["startSec"] = 0.0
    for idx in range(1, len(normalized)):
        prev_end = normalized[idx - 1]["endSec"]
        current_start = normalized[idx]["startSec"]
        if current_start < prev_end:
            normalized[idx]["startSec"] = prev_end
        if normalized[idx]["endSec"] <= normalized[idx]["startSec"]:
            normalized[idx]["endSec"] = round(normalized[idx]["startSec"] + 0.2, 3)

    last_end = normalized[-1]["endSec"]
    if last_end < duration_seconds:
        normalized[-1]["endSec"] = round(duration_seconds, 3)
    duration_seconds = max(duration_seconds, normalized[-1]["endSec"])
    normalized[-1]["endSec"] = round(duration_seconds, 3)
    return normalized


def build_captions_from_sections(sections: list[dict[str, Any]]) -> list[dict[str, Any]]:
    captions: list[dict[str, Any]] = []
    for idx, section in enumerate(sections):
        text = compact_text(section.get("text"), 160)
        if not text:
            text = "오늘 시장 핵심을 빠르게 정리합니다."
        captions.append(
            {
                "id": idx,
                "startSec": round(float(section["startSec"]), 3),
                "endSec": round(float(section["endSec"]), 3),
                "text": text,
            }
        )
    return captions


def rebalance_sentence_count(sentences: list[str], target_count: int) -> list[str]:
    if not sentences:
        return []

    if target_count <= 0:
        return sentences

    if len(sentences) > target_count:
        merged: list[str] = []
        for start, end in partition_ranges(len(sentences), target_count):
            merged.append(" ".join(sentences[start:end]).strip())
        return merged

    if len(sentences) >= target_count:
        return sentences

    expanded: list[str] = []
    for sentence in sentences:
        if len(expanded) >= target_count:
            expanded.append(sentence)
            continue

        comma_tokens = [
            token.strip()
            for token in re.split(r",\s+(?=[^\d])", sentence)
            if token.strip()
        ]
        if len(comma_tokens) >= 2 and len(sentence) >= 54:
            for token in comma_tokens:
                if re.search(r"[.!?]$", token):
                    expanded.append(token)
                else:
                    expanded.append(f"{token}.")
        else:
            expanded.append(sentence)

    if len(expanded) > target_count:
        merged: list[str] = []
        for start, end in partition_ranges(len(expanded), target_count):
            merged.append(" ".join(expanded[start:end]).strip())
        return merged

    return expanded


def allocate_durations(texts: list[str], total_duration: float, *, min_sec: float = 2.2) -> list[float]:
    if not texts:
        return []

    total_duration = float(max(1.0, total_duration))
    n = len(texts)
    if min_sec * n >= total_duration:
        each = total_duration / n
        return [each for _ in texts]

    weights = [max(8, len(token)) for token in texts]
    free = total_duration - (min_sec * n)
    weight_sum = float(sum(weights)) or 1.0

    durations = [min_sec + (free * (w / weight_sum)) for w in weights]

    cap = 16.0
    overflow = 0.0
    for idx, value in enumerate(durations):
        if value > cap:
            overflow += value - cap
            durations[idx] = cap

    if overflow > 0:
        slots = [idx for idx, value in enumerate(durations) if value < cap - 0.01]
        if slots:
            slot_weight = float(sum(weights[idx] for idx in slots)) or 1.0
            for idx in slots:
                add = overflow * (weights[idx] / slot_weight)
                durations[idx] = min(cap, durations[idx] + add)

    current = sum(durations)
    if current <= 0:
        return [total_duration / n for _ in texts]

    scale = total_duration / current
    return [value * scale for value in durations]


def build_captions(script_text: str, duration_seconds: float, *, min_scene_count: int) -> list[dict[str, Any]]:
    sentences = split_sentences(script_text)
    if not sentences:
        sentences = ["오늘 시장 핵심을 빠르게 정리합니다."]

    target_caption_count = int(round(duration_seconds / 8.5))
    target_caption_count = max(min_scene_count, min(14, max(6, target_caption_count)))
    balanced = rebalance_sentence_count(sentences, target_caption_count)

    durations = allocate_durations(balanced, duration_seconds)

    captions: list[dict[str, Any]] = []
    cursor = 0.0
    for idx, (text, span) in enumerate(zip(balanced, durations, strict=False)):
        start = cursor
        end = duration_seconds if idx == len(balanced) - 1 else min(duration_seconds, start + span)
        captions.append(
            {
                "id": idx,
                "startSec": round(start, 3),
                "endSec": round(end, 3),
                "text": compact_text(text, 160),
            }
        )
        cursor = end

    if captions:
        captions[-1]["endSec"] = round(duration_seconds, 3)

    return captions


def extract_tickers_from_sources(full_script: dict[str, Any], shorts_script: dict[str, Any]) -> list[str]:
    tokens: list[str] = []

    for ticker in shorts_script.get("metadata", {}).get("featured_tickers", []) or []:
        if isinstance(ticker, str):
            tokens.append(ticker.upper())

    for ticker in full_script.get("user_tickers", []) or []:
        if isinstance(ticker, str):
            tokens.append(ticker.upper())

    for source in shorts_script.get("sources", []) or []:
        if not isinstance(source, dict):
            continue
        ticker = source.get("ticker")
        if isinstance(ticker, str) and ticker:
            tokens.append(ticker.upper())

    unique = []
    seen = set()
    for token in tokens:
        cleaned = re.sub(r"[^A-Z0-9^.-]", "", token)
        if not cleaned:
            continue
        if cleaned in seen:
            continue
        seen.add(cleaned)
        unique.append(cleaned)

    return unique[:6]


def extract_metrics(*texts: str) -> list[str]:
    merged = " ".join(texts)
    candidates = re.findall(r"[+-]?\d+(?:\.\d+)?%|[+-]?\$\d+(?:,\d{3})*(?:\.\d+)?", merged)

    unique: list[str] = []
    seen = set()
    for token in candidates:
        if token in seen:
            continue
        seen.add(token)
        unique.append(token)
    return unique[:3]


def normalize_string_list(values: Any, *, max_items: int, max_len: int) -> list[str]:
    if not isinstance(values, list):
        return []

    normalized: list[str] = []
    for value in values:
        text = compact_text(value, max_len)
        if not text:
            continue
        normalized.append(text)
        if len(normalized) >= max_items:
            break

    return normalized


def normalize_string_list_plain(values: Any, *, max_items: int) -> list[str]:
    if not isinstance(values, list):
        return []

    normalized: list[str] = []
    for value in values:
        text = clean_text(value)
        if not text:
            continue
        normalized.append(text)
        if len(normalized) >= max_items:
            break

    return normalized


def normalize_ticker_list(values: Any, fallback: list[str], *, max_items: int = 4) -> list[str]:
    tokens: list[str] = []
    if isinstance(values, list):
        for value in values:
            if isinstance(value, str):
                tokens.append(value.upper())

    tokens.extend(fallback)

    out: list[str] = []
    seen = set()
    for token in tokens:
        cleaned = re.sub(r"[^A-Z0-9^.-]", "", token)
        if not cleaned:
            continue
        if cleaned in seen:
            continue
        seen.add(cleaned)
        out.append(cleaned)
        if len(out) >= max_items:
            break

    return out


def load_prompt_yaml(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Prompt YAML not found: {path}")

    payload = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid YAML structure: {path}")
    return payload


def compact_full_script(full_script: dict[str, Any]) -> dict[str, Any]:
    scripts = full_script.get("scripts") or []
    if not isinstance(scripts, list) or len(scripts) <= 28:
        return full_script

    compacted = dict(full_script)
    compacted["scripts"] = scripts[:14] + [{"note": f"... omitted {len(scripts) - 28} entries ..."}] + scripts[-14:]
    return compacted


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
        raise ValueError("LLM response does not contain JSON")

    return json.loads(text[start : end + 1])


def pick_phase(index: int, total: int, raw_phase: Any) -> str:
    expected_by_index = ("hook", "market", "insight", "finale")
    fallback = expected_by_index[min(index, len(expected_by_index) - 1)]

    candidate = str(raw_phase or "").strip().lower()
    if candidate in ALLOWED_PHASES:
        if index == 0 and candidate != "hook":
            return "hook"
        if index == total - 1 and candidate != "finale":
            return "finale"
        return candidate

    return fallback


def pick_theme(phase: str, raw_theme: Any) -> str:
    candidate = str(raw_theme or "").strip().lower()
    if candidate in ALLOWED_THEMES:
        return candidate
    return PHASE_DEFAULT_THEMES.get(phase, "neutral")


def build_source_digest(shorts_script: dict[str, Any]) -> list[dict[str, str]]:
    digest: list[dict[str, str]] = []
    seen = set()

    for source in shorts_script.get("sources", []) or []:
        if not isinstance(source, dict):
            continue
        source_type = str(source.get("type") or "").strip()
        if not source_type:
            continue

        label = ""
        detail = ""
        if source_type == "chart":
            label = str(source.get("ticker") or "chart").strip()
            detail = str(source.get("end_date") or source.get("start_date") or "").strip()
        elif source_type == "article":
            label = str(source.get("title") or "기사").strip()
            detail = str(source.get("pk") or "").strip()
        elif source_type == "event":
            label = str(source.get("title") or "이벤트").strip()
            detail = str(source.get("date") or source.get("id") or "").strip()
        else:
            label = str(source.get("title") or source.get("ticker") or source_type).strip()
            detail = str(source.get("id") or source.get("pk") or "").strip()

        label = compact_text(label, 56)
        detail = compact_text(detail, 48)

        key = (source_type, label, detail)
        if key in seen:
            continue
        seen.add(key)

        item: dict[str, str] = {"type": source_type, "label": label}
        if detail:
            item["detail"] = detail
        digest.append(item)

    return digest


def parse_duration_seconds(
    shorts_script: dict[str, Any],
    explicit_duration: int | None,
    section_timing: dict[str, Any] | None = None,
) -> float:
    if explicit_duration and explicit_duration > 0:
        return float(explicit_duration)

    if section_timing and isinstance(section_timing.get("totalDurationSeconds"), (int, float)):
        candidate = float(section_timing["totalDurationSeconds"])
        if candidate > 0:
            return candidate

    metadata = shorts_script.get("metadata") or {}
    estimated = metadata.get("estimated_duration_seconds")
    if isinstance(estimated, (int, float)) and estimated > 0:
        return float(estimated)

    duration_target = str(shorts_script.get("duration_target") or "")
    match = re.search(r"(\d+)", duration_target)
    if match:
        return float(match.group(1))

    return 90.0


def invoke_slide_llm(
    *,
    llm: Any,
    prompt_cfg: dict[str, Any],
    date: str,
    lang: str,
    duration_seconds: float,
    shorts_script: dict[str, Any],
    full_script: dict[str, Any],
    section_timing: dict[str, Any],
) -> dict[str, Any]:
    system_prompt = str(prompt_cfg.get("system") or "").strip()
    user_template = str(prompt_cfg.get("user_template") or "").strip()

    if not system_prompt or not user_template:
        raise ValueError("shorts_slides.yaml requires system and user_template")

    user_prompt = user_template.format(
        date=date,
        lang=lang,
        duration_seconds=int(round(duration_seconds)),
        shorts_script_json=json.dumps(shorts_script, ensure_ascii=False, indent=2),
        full_script_json=json.dumps(compact_full_script(full_script), ensure_ascii=False, indent=2),
        section_timing_json=json.dumps(section_timing, ensure_ascii=False, indent=2),
    )

    response = llm.invoke(f"{system_prompt}\n\n{user_prompt}")
    return extract_json_object(response_to_text(response.content))


def ensure_slide_candidates(raw_payload: dict[str, Any]) -> list[dict[str, Any]]:
    slides = raw_payload.get("slides") if isinstance(raw_payload, dict) else None
    if isinstance(slides, list) and slides:
        out = [item for item in slides if isinstance(item, dict)]
        if out:
            return out

    raise ValueError("LLM response did not include valid slides[]")


def generate_shorts_slides(
    *,
    date: str,
    lang: str,
    shorts_script: dict[str, Any],
    full_script: dict[str, Any],
    llm: Any,
    prompt_cfg: dict[str, Any],
    explicit_duration: int | None,
    section_timing: dict[str, Any] | None,
) -> dict[str, Any]:
    defaults = prompt_cfg.get("defaults") or {}
    min_scene_count = int(defaults.get("min_scene_count", 4))
    max_scene_count = int(defaults.get("max_scene_count", 4))
    min_scene_count = max(4, min_scene_count)
    max_scene_count = max(min_scene_count, max_scene_count)

    duration_seconds = parse_duration_seconds(shorts_script, explicit_duration, section_timing=section_timing)
    script_text = str(shorts_script.get("script") or "").strip()
    if not script_text:
        raise ValueError("shorts/script.json is missing script text")

    fallback_tickers = extract_tickers_from_sources(full_script, shorts_script)
    hook_text = clean_text(shorts_script.get("hook") or script_text)
    shorts_sections = normalize_shorts_sections(shorts_script, duration_seconds)
    timeline_sections = normalize_section_timing_payload(section_timing, shorts_sections, duration_seconds)
    duration_seconds = max(duration_seconds, float(timeline_sections[-1]["endSec"]))
    captions = build_captions_from_sections(timeline_sections)

    section_timing_payload = {
        "date": date,
        "lang": lang,
        "totalDurationSeconds": round(duration_seconds, 3),
        "sections": timeline_sections,
    }

    raw_payload = invoke_slide_llm(
        llm=llm,
        prompt_cfg=prompt_cfg,
        date=date,
        lang=lang,
        duration_seconds=duration_seconds,
        shorts_script=shorts_script,
        full_script=full_script,
        section_timing=section_timing_payload,
    )

    candidates = ensure_slide_candidates(raw_payload)
    requested_scene_count = len(SECTION_ORDER)
    requested_scene_count = max(min_scene_count, min(max_scene_count, requested_scene_count))

    if len(candidates) < requested_scene_count:
        fill_source = candidates[-1] if candidates else {}
        while len(candidates) < requested_scene_count:
            candidates.append(dict(fill_source))
    elif len(candidates) > requested_scene_count:
        candidates = candidates[:requested_scene_count]

    slides: list[dict[str, Any]] = []
    for idx in range(requested_scene_count):
        candidate = candidates[idx] if idx < len(candidates) else {}
        section = timeline_sections[idx] if idx < len(timeline_sections) else timeline_sections[-1]
        section_name = section.get("name") if isinstance(section.get("name"), str) else SECTION_ORDER[idx]
        section_text = clean_text(section.get("text"))
        if not section_text:
            section_text = clean_text(shorts_sections[idx].get("text"))

        fallback_phase = SECTION_TO_PHASE.get(section_name, "insight")
        phase = pick_phase(idx, requested_scene_count, candidate.get("phase") or fallback_phase)
        theme = pick_theme(phase, candidate.get("theme"))

        phase_label = PHASE_LABELS_KO.get(phase, "핵심 포인트")
        caption_focus = section_text or captions[idx]["text"]

        fallback_headline = clean_text(caption_focus)
        headline_seed = clean_text(candidate.get("headline"))
        if idx > 0 and headline_seed == clean_text(hook_text):
            headline_seed = ""
        headline = headline_seed or fallback_headline
        subheadline = clean_text(
            candidate.get("subheadline")
            or section_text
            or shorts_script.get("title")
            or hook_text,
        )
        body = clean_text(candidate.get("body") or caption_focus)

        bullets = normalize_string_list_plain(candidate.get("bullets"), max_items=2)
        if not bullets:
            bullets = [clean_text(sentence) for sentence in split_sentences(section_text)[:2] if clean_text(sentence)]
        if not bullets:
            bullets = [clean_text(caption_focus)]

        highlights = normalize_string_list_plain(candidate.get("highlights"), max_items=2)
        if idx > 0 and highlights == [f"{int(round(duration_seconds))}초"]:
            highlights = []
        if not highlights:
            highlights = extract_metrics(headline, subheadline, *bullets)
        if not highlights and idx == 0:
            highlights = [f"{int(round(duration_seconds))}초"]

        tickers = normalize_ticker_list(candidate.get("tickers"), fallback_tickers, max_items=4)

        start_sec = float(section["startSec"])
        end_sec = float(section["endSec"])
        if idx == requested_scene_count - 1:
            end_sec = duration_seconds

        slide = {
            "id": idx,
            "phase": phase,
            "theme": theme,
            "startSec": round(start_sec, 3),
            "endSec": round(end_sec, 3),
            "eyebrow": clean_text(candidate.get("eyebrow") or phase_label),
            "headline": headline,
            "subheadline": subheadline,
            "body": body,
            "bullets": bullets,
            "tickers": tickers,
            "highlights": highlights,
        }
        slides.append(slide)

    # force exact boundary alignment
    if slides:
        slides[0]["startSec"] = 0.0
        slides[-1]["endSec"] = round(duration_seconds, 3)

    raw_meta = raw_payload.get("meta") if isinstance(raw_payload, dict) else {}
    if not isinstance(raw_meta, dict):
        raw_meta = {}

    key_points = normalize_string_list_plain(raw_meta.get("key_points"), max_items=4)
    if not key_points:
        key_points = normalize_string_list_plain(
            (shorts_script.get("metadata") or {}).get("key_points"),
            max_items=4,
        )
    if not key_points:
        story_bullets = slides[2].get("bullets") if len(slides) > 2 else []
        key_points = normalize_string_list_plain(story_bullets, max_items=4)
    if not key_points:
        key_points = [clean_text(slide["headline"]) for slide in slides[1:4]]

    # featured_tickers: support both string[] and object[{ticker,label,tag}]
    raw_ft = raw_meta.get("featured_tickers")
    if isinstance(raw_ft, list) and raw_ft and isinstance(raw_ft[0], dict):
        # Gemini returned object array — pass through as-is (with ticker normalization)
        featured_tickers_objects = []
        seen_ft = set()
        for item in raw_ft:
            if not isinstance(item, dict):
                continue
            tick = re.sub(r"[^A-Z0-9^.-]", "", str(item.get("ticker", "")).upper())
            if not tick or tick in seen_ft:
                continue
            seen_ft.add(tick)
            featured_tickers_objects.append({
                "ticker": tick,
                "label": clean_text(item.get("label", "")),
                "tag": clean_text(item.get("tag", "")),
            })
            if len(featured_tickers_objects) >= 5:
                break
        # Also add fallback tickers as strings for backward compatibility
        for fb in fallback_tickers:
            if fb not in seen_ft and len(featured_tickers_objects) < 5:
                seen_ft.add(fb)
                featured_tickers_objects.append({"ticker": fb, "label": "", "tag": ""})
        featured_tickers = featured_tickers_objects
    else:
        featured_tickers = normalize_ticker_list(
            raw_ft,
            fallback_tickers,
            max_items=5,
        )

    result = {
        "date": date,
        "lang": lang,
        "title": clean_text(shorts_script.get("title") or hook_text),
        "hook": clean_text(shorts_script.get("hook") or hook_text),
        "durationSeconds": round(duration_seconds, 3),
        "audioFile": str((section_timing or {}).get("audioFile") or f"shorts{date}.mp3"),
        "slides": slides,
        "captions": captions,
        "sourceDigest": build_source_digest(shorts_script),
        "meta": {
            "keyPoints": key_points,
            "featuredTickers": featured_tickers,
            "sceneCount": len(slides),
        },
    }

    return result


def load_json_file(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(path)
    return json.loads(path.read_text(encoding="utf-8"))


def load_optional_json_file(path: Path | None) -> dict[str, Any] | None:
    if path is None:
        return None
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_full_script_path(date: str, lang: str) -> Path:
    candidate_a = ROOT_DIR / "podcast" / date / lang / f"{date}.json"
    candidate_b = ROOT_DIR / "podcast" / date / lang / "script.json"

    if candidate_a.exists():
        return candidate_a
    if candidate_b.exists():
        return candidate_b

    raise FileNotFoundError(f"Full script not found: {candidate_a} or {candidate_b}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate shorts slides JSON")
    parser.add_argument("date", help="Date: YYYYMMDD or YYYY-MM-DD")
    parser.add_argument("--lang", default="ko", choices=["ko", "en"])
    parser.add_argument(
        "--shorts-script",
        type=Path,
        help="Path to existing shorts script JSON (default: podcast/{date}/{lang}/shorts/script.json)",
    )
    parser.add_argument(
        "--full-script",
        type=Path,
        help="Optional full script JSON path for fallback context",
    )
    parser.add_argument(
        "--section-timing",
        type=Path,
        help="Optional section timing JSON (default: podcast/{date}/{lang}/shorts/sections.timing.json)",
    )
    parser.add_argument("--duration", type=int, default=0, help="Override duration seconds")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--prefix", default="SHORTS_SLIDE")
    parser.add_argument("--debug", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.debug:
        logger.setLevel(logging.DEBUG)

    date = parse_date_token(args.date)
    lang = args.lang

    load_env_from_yaml(logger=logger)
    load_dotenv(ROOT_DIR / ".env", override=False)

    shorts_script_path = (
        args.shorts_script
        if args.shorts_script is not None
        else ROOT_DIR / "podcast" / date / lang / "shorts" / "script.json"
    )
    if not shorts_script_path.is_absolute():
        shorts_script_path = (ROOT_DIR / shorts_script_path).resolve()

    full_script_path: Path | None = None
    if args.full_script is not None:
        full_script_path = args.full_script
        if not full_script_path.is_absolute():
            full_script_path = (ROOT_DIR / full_script_path).resolve()
    else:
        try:
            full_script_path = resolve_full_script_path(date, lang)
        except FileNotFoundError:
            full_script_path = None

    section_timing_path = (
        args.section_timing
        if args.section_timing is not None
        else ROOT_DIR / "podcast" / date / lang / "shorts" / "sections.timing.json"
    )
    if section_timing_path is not None and not section_timing_path.is_absolute():
        section_timing_path = (ROOT_DIR / section_timing_path).resolve()

    output_path = args.output or (ROOT_DIR / "podcast" / date / lang / "shorts" / "slides.render.json")

    logger.info("Shorts slide generation start: date=%s lang=%s", date, lang)
    logger.info("  - shorts script: %s", shorts_script_path)
    logger.info("  - full script:   %s", full_script_path or "(none)")
    logger.info("  - section timing: %s", section_timing_path or "(none)")

    try:
        prompt_cfg = load_prompt_yaml(PROMPT_PATH)
        shorts_script = load_json_file(shorts_script_path)
        if full_script_path and full_script_path.exists():
            full_script = load_json_file(full_script_path)
        else:
            logger.warning(
                "Full script fallback not found. Generating slides from shorts script only."
            )
            full_script = {}
        section_timing = load_optional_json_file(section_timing_path)
        if section_timing is None:
            logger.warning("Section timing not found. Falling back to inferred section durations.")

        llm = build_llm(prefix=args.prefix, logger=logger)

        payload = generate_shorts_slides(
            date=date,
            lang=lang,
            shorts_script=shorts_script,
            full_script=full_script,
            llm=llm,
            prompt_cfg=prompt_cfg,
            explicit_duration=args.duration if args.duration > 0 else None,
            section_timing=section_timing,
        )

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

        logger.info("Saved shorts slides: %s", output_path)
        logger.info("  - scenes: %d", len(payload.get("slides") or []))
        logger.info("  - duration: %.2fs", float(payload.get("durationSeconds") or 0.0))
        return 0
    except Exception as exc:
        logger.error("Failed to generate shorts slides: %s", exc, exc_info=args.debug)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
