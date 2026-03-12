"""Generate company-count based TTS for shorts-firm script.

Audio strategy:
- TTS call count equals the number of company segments.
- Hook and closing CTA are merged into first/last company segments.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import random
import re
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

import yaml
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from shared.yaml_config import load_env_from_yaml
from tts.src.utils.audio import BYTES_PER_FRAME, _extract_pcm, _write_wav
from tts.src.utils.gemini_tts import gemini_generate_tts

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

PIPELINE_CONFIG_PATH = ROOT_DIR / "shorts-firm" / "prompt" / "shorts_firm_pipeline.yaml"

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
def compact_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def parse_date_arg(date_str: str) -> str:
    token = date_str.replace("-", "")
    if len(token) != 8 or not token.isdigit():
        raise ValueError(f"Invalid date format: {date_str}")
    return token


def shorts_firm_audio_basename(date: str, *, ext: str = ".mp3") -> str:
    suffix = ext if ext.startswith(".") else f".{ext}"
    return f"shortsfirm{date}{suffix}"


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


def normalize_ticker(value: Any) -> str:
    return re.sub(r"[^A-Z0-9^.=/-]", "", compact_text(value).upper())


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
    if parsed != parsed or parsed in (float("inf"), float("-inf")):
        return None
    return parsed


def is_company_ticker(ticker: str) -> bool:
    if not ticker:
        return False
    if ticker in INDEX_LIKE_TICKERS:
        return False
    return not ticker.startswith("^")


def format_percent(value: float | None) -> str:
    if value is None:
        return ""
    return f"{value:+.2f}%"


def ensure_sentence_end(text: str) -> str:
    normalized = compact_text(text)
    if not normalized:
        return ""
    if normalized.endswith((".", "!", "?")):
        return normalized
    return f"{normalized}."


def default_cta_text(lang: str) -> str:
    if compact_text(lang).lower() == "en":
        return "Please like and subscribe."
    return "구독과 좋아요 부탁드립니다."


def split_sentences(text: str) -> list[str]:
    normalized = compact_text(text)
    if not normalized:
        return []
    protected = re.sub(r"(?<=\d)\.(?=\d)", "__DOT__", normalized)
    raw = re.findall(r"[^.!?]+[.!?]?", protected)
    out = [token.strip().replace("__DOT__", ".") for token in raw if token.strip()]
    return out or [normalized]


def partition_ranges(item_count: int, bucket_count: int) -> list[tuple[int, int]]:
    if item_count <= 0 or bucket_count <= 0:
        return []
    bucket_count = min(item_count, bucket_count)
    base = item_count // bucket_count
    extra = item_count % bucket_count
    ranges: list[tuple[int, int]] = []
    cursor = 0
    for idx in range(bucket_count):
        size = base + (1 if idx < extra else 0)
        ranges.append((cursor, cursor + size))
        cursor += size
    return ranges


def fallback_sections(script_text: str) -> list[dict[str, str]]:
    sentences = split_sentences(script_text)
    if not sentences:
        return [
            {"name": "hook", "text": ""},
            {"name": "company_1", "text": ""},
            {"name": "closing", "text": ""},
        ]
    hook_text = compact_text(sentences[0])
    closing_text = compact_text(sentences[-1]) if len(sentences) > 1 else ""
    body_text = compact_text(" ".join(sentences[1:-1])) or compact_text(script_text)
    return [
        {"name": "hook", "text": hook_text},
        {"name": "company_1", "text": body_text},
        {"name": "closing", "text": closing_text},
    ]


def load_yaml_config(config_path: Path) -> dict[str, Any]:
    if not config_path.exists():
        raise FileNotFoundError(f"Pipeline config not found: {config_path}")
    payload = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid YAML structure: {config_path}")
    return payload


def load_tts_prompt(config: dict[str, Any], lang: str) -> str:
    tts = config.get("tts")
    if not isinstance(tts, dict):
        raise ValueError("Invalid pipeline config: missing tts block")
    prompts = tts.get("prompts")
    if not isinstance(prompts, dict):
        raise ValueError("Invalid pipeline config: missing tts.prompts")
    selected = prompts.get(lang) or prompts.get("ko") or prompts.get("en")
    if not isinstance(selected, str) or not compact_text(selected):
        raise ValueError("Invalid pipeline config: tts prompt text missing")
    return compact_text(selected)


def load_script(script_path: Path) -> dict[str, Any]:
    if not script_path.exists():
        raise FileNotFoundError(f"shorts-firm script not found: {script_path}")
    payload = json.loads(script_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid script JSON: {script_path}")
    return payload


def extract_sections(script_payload: dict[str, Any]) -> list[dict[str, str]]:
    script_text = compact_text(script_payload.get("script"))
    fallback = fallback_sections(script_text)
    fallback_by_name = {item["name"]: item["text"] for item in fallback}

    ordered_sections: list[dict[str, str]] = []
    seen_names: set[str] = set()
    raw_sections = script_payload.get("sections")
    if isinstance(raw_sections, list):
        for item in raw_sections:
            if not isinstance(item, dict):
                continue
            section_name = normalize_section_name(item.get("name"))
            if not section_name:
                continue
            text = compact_text(item.get("text") or item.get("script") or item.get("body"))
            if section_name in seen_names:
                continue
            seen_names.add(section_name)
            ordered_sections.append({"name": section_name, "text": text})
    elif isinstance(raw_sections, dict):
        for key, value in raw_sections.items():
            section_name = normalize_section_name(key)
            if not section_name:
                continue
            text = compact_text(value)
            if section_name in seen_names:
                continue
            seen_names.add(section_name)
            ordered_sections.append({"name": section_name, "text": text})

    if not ordered_sections:
        return fallback

    by_name = {item["name"]: item["text"] for item in ordered_sections}

    hook_text = compact_text(script_payload.get("hook")) or by_name.get("hook") or fallback_by_name.get("hook", "")
    if "hook" not in seen_names:
        ordered_sections.insert(0, {"name": "hook", "text": hook_text})
        seen_names.add("hook")
    else:
        for item in ordered_sections:
            if item["name"] == "hook":
                item["text"] = item["text"] or hook_text
                break

    closing_candidates = [
        compact_text(script_payload.get("closing")),
        compact_text(script_payload.get("closing_text")),
        by_name.get("closing", ""),
        fallback_by_name.get("closing", ""),
    ]
    closing_text = next((item for item in closing_candidates if compact_text(item)), "")
    if "closing" not in seen_names:
        ordered_sections.append({"name": "closing", "text": closing_text})
    else:
        for item in ordered_sections:
            if item["name"] == "closing":
                item["text"] = item["text"] or closing_text
                break

    return ordered_sections


def get_metric_display(value: Any, fallback_numeric: Any) -> str:
    displayed = compact_text(value)
    if displayed and displayed.upper() != "N/A":
        return displayed
    return format_percent(normalize_float(fallback_numeric))


def build_company_segment_text(
    *,
    lang: str,
    label: str,
    day_change_display: str,
    month_change_display: str,
    reason: str,
) -> str:
    day_text = compact_text(day_change_display)
    month_text = compact_text(month_change_display)
    if day_text.upper() == "N/A":
        day_text = ""
    if month_text.upper() == "N/A":
        month_text = ""

    reason_text = ensure_sentence_end(reason)
    fragments: list[str] = []

    if lang == "en":
        metric_parts: list[str] = []
        if day_text:
            metric_parts.append(f"1-day {day_text}")
        if month_text:
            metric_parts.append(f"1-month {month_text}")
        if metric_parts:
            fragments.append(f"{label} moved {' and '.join(metric_parts)}.")
        if reason_text:
            fragments.append(reason_text)
        if not fragments:
            fragments.append(f"{label} was one of the key movers.")
        return compact_text(" ".join(fragments))

    metric_parts = []
    if day_text:
        metric_parts.append(f"하루 {day_text}")
    if month_text:
        metric_parts.append(f"한 달 {month_text}")
    if metric_parts:
        fragments.append(f"{label}는 {' / '.join(metric_parts)} 움직였습니다.")
    if reason_text:
        fragments.append(reason_text)
    if not fragments:
        fragments.append(f"{label} 흐름이 핵심이었습니다.")
    return compact_text(" ".join(fragments))


def merge_hook_and_closing_into_segments(
    segments: list[dict[str, Any]],
    script_payload: dict[str, Any],
    *,
    lang: str,
) -> list[dict[str, Any]]:
    """Keep split criteria company-based while including hook/closing narration."""
    if not segments:
        return segments

    sections = extract_sections(script_payload)
    by_name = {item["name"]: compact_text(item["text"]) for item in sections if compact_text(item.get("name"))}
    hook_text = ensure_sentence_end(by_name.get("hook", ""))
    closing_text = ensure_sentence_end(default_cta_text(lang))

    merged = [dict(item) for item in segments]

    if hook_text:
        first_text = compact_text(merged[0].get("text"))
        if hook_text not in first_text:
            merged[0]["text"] = compact_text(f"{hook_text} {first_text}")

    if closing_text:
        last_text = compact_text(merged[-1].get("text"))
        if closing_text not in last_text:
            merged[-1]["text"] = compact_text(f"{last_text} {closing_text}")

    return merged


def extract_featured_company_tickers(script_payload: dict[str, Any]) -> list[str]:
    metadata = script_payload.get("metadata")
    if not isinstance(metadata, dict):
        return []
    raw_values = metadata.get("featured_tickers")
    if not isinstance(raw_values, list):
        return []
    output: list[str] = []
    seen: set[str] = set()
    for value in raw_values:
        ticker = normalize_ticker(value)
        if not ticker or ticker in seen or not is_company_ticker(ticker):
            continue
        seen.add(ticker)
        output.append(ticker)
    return output


def extract_company_segments(script_payload: dict[str, Any], lang: str) -> list[dict[str, Any]]:
    metadata = script_payload.get("metadata")
    metadata = metadata if isinstance(metadata, dict) else {}
    raw_moves = metadata.get("company_moves")
    moves = raw_moves if isinstance(raw_moves, list) else []

    output: list[dict[str, Any]] = []
    seen_tickers: set[str] = set()

    for move in moves:
        if not isinstance(move, dict):
            continue

        ticker = normalize_ticker(move.get("ticker"))
        if ticker:
            if ticker in seen_tickers or not is_company_ticker(ticker):
                continue
            seen_tickers.add(ticker)

        label = compact_text(move.get("name")) or ticker or f"Company {len(output) + 1}"
        reason = compact_text(move.get("reason"))
        day_display = get_metric_display(move.get("day_change_display"), move.get("day_change_pct"))
        month_display = get_metric_display(move.get("month_change_display"), move.get("month_change_pct"))
        explicit_tts = compact_text(move.get("spoken_text") or move.get("tts_text"))

        segment_text = explicit_tts or build_company_segment_text(
            lang=lang,
            label=label,
            day_change_display=day_display,
            month_change_display=month_display,
            reason=reason,
        )
        if not segment_text:
            continue

        segment_name = ticker.lower() if ticker else f"company-{len(output) + 1}"
        output.append(
            {
                "id": len(output),
                "name": segment_name,
                "ticker": ticker,
                "label": label,
                "text": segment_text,
            }
        )

    if output:
        return merge_hook_and_closing_into_segments(output, script_payload, lang=lang)

    # Fallback path for scripts that do not yet contain metadata.company_moves.
    sections = extract_sections(script_payload)
    featured_tickers = extract_featured_company_tickers(script_payload)

    company_sections = [section for section in sections if is_company_section_name(section.get("name")) and compact_text(section.get("text"))]
    if company_sections:
        for idx, section in enumerate(company_sections):
            ticker = featured_tickers[idx] if idx < len(featured_tickers) else ""
            label = ticker or f"Company {idx + 1}"
            output.append(
                {
                    "id": len(output),
                    "name": ticker.lower() if ticker else compact_text(section.get("name")) or f"company-{idx + 1}",
                    "ticker": ticker,
                    "label": label,
                    "text": ensure_sentence_end(section.get("text") or ""),
                }
            )
        return merge_hook_and_closing_into_segments(output, script_payload, lang=lang)

    body_text = compact_text(script_payload.get("script"))
    sentences = split_sentences(body_text)
    if not sentences:
        return []

    target_count = len(featured_tickers) if featured_tickers else 1
    ranges = partition_ranges(len(sentences), target_count)
    for idx, (start, end) in enumerate(ranges):
        text = ensure_sentence_end(" ".join(sentences[start:end]))
        if not text:
            continue
        ticker = featured_tickers[idx] if idx < len(featured_tickers) else ""
        label = ticker or f"Company {idx + 1}"
        output.append(
            {
                "id": len(output),
                "name": ticker.lower() if ticker else f"company-{idx + 1}",
                "ticker": ticker,
                "label": label,
                "text": text,
            }
        )
    return merge_hook_and_closing_into_segments(output, script_payload, lang=lang)


def generate_segment_with_retry(
    *,
    text: str,
    api_key: str,
    voice_name: str,
    temperature: float,
    system_instruction: str,
    timeout_seconds: float = 300.0,
    max_retries: int = 3,
    min_duration_ratio: float = 0.05,
) -> bytes:
    expected_min_seconds = len(text) * min_duration_ratio
    full_prompt = f"{system_instruction}\n\n{text}"

    for attempt in range(max_retries):
        try:
            logger.info("    Gemini TTS request (attempt %d/%d)", attempt + 1, max_retries)
            audio_bytes = gemini_generate_tts(
                prompt=full_prompt,
                api_key=api_key,
                temperature=temperature,
                voice_name=voice_name,
                timeout_s=timeout_seconds,
            )
            pcm = _extract_pcm(audio_bytes)
            duration = len(pcm) / BYTES_PER_FRAME / 24000
            if duration >= expected_min_seconds:
                return pcm
            logger.warning(
                "    Generated audio too short: %.2fs (expected >= %.2fs)",
                duration,
                expected_min_seconds,
            )
        except Exception as exc:
            logger.warning("    TTS generation error: %s", exc)

        if attempt < max_retries - 1:
            backoff = min(20.0, 2.0 * (2**attempt)) + random.uniform(0, 0.5)
            logger.info("    retry backoff %.2fs", backoff)
            time.sleep(backoff)

    raise RuntimeError("Failed to generate valid segment audio")


def make_silence_pcm(duration_seconds: float) -> bytes:
    if duration_seconds <= 0:
        return b""
    frame_count = int(round(duration_seconds * 24000))
    return b"\x00" * max(0, frame_count) * BYTES_PER_FRAME


def generate_company_audio(
    *,
    segments: list[dict[str, Any]],
    api_key: str,
    voice_name: str,
    temperature: float,
    system_instruction: str,
    segment_pause_seconds: float,
) -> tuple[bytes, list[dict[str, Any]], float]:
    if not segments:
        raise ValueError("No company segments found for TTS generation")

    combined_pcm = b""
    timeline: list[dict[str, Any]] = []
    cursor = 0.0

    for idx, segment in enumerate(segments):
        name = compact_text(segment.get("name")) or f"company-{idx + 1}"
        ticker = normalize_ticker(segment.get("ticker"))
        text = compact_text(segment.get("text"))
        label = compact_text(segment.get("label")) or ticker or f"Company {idx + 1}"

        if not text:
            text = ensure_sentence_end(f"{label} was a key mover today")

        logger.info("  Segment %d/%d [%s] chars=%d", idx + 1, len(segments), name, len(text))
        pcm = generate_segment_with_retry(
            text=text,
            api_key=api_key,
            voice_name=voice_name,
            temperature=temperature,
            system_instruction=system_instruction,
        )
        speech_duration = len(pcm) / BYTES_PER_FRAME / 24000

        start_sec = cursor
        combined_pcm += pcm
        cursor += speech_duration

        pause_after = 0.0
        if idx < len(segments) - 1 and segment_pause_seconds > 0:
            pause_after = segment_pause_seconds
            combined_pcm += make_silence_pcm(segment_pause_seconds)
            cursor += segment_pause_seconds

        timeline.append(
            {
                "id": idx,
                "name": name,
                "ticker": ticker,
                "kind": "company",
                "startSec": round(start_sec, 3),
                "speechEndSec": round(start_sec + speech_duration, 3),
                "endSec": round(cursor, 3),
                "speechDurationSec": round(speech_duration, 3),
                "pauseAfterSec": round(pause_after, 3),
                "charCount": len(text),
                "text": text,
            }
        )

    total_duration = len(combined_pcm) / BYTES_PER_FRAME / 24000
    return combined_pcm, timeline, total_duration


def save_timing_payload(
    *,
    output_path: Path,
    date: str,
    lang: str,
    audio_file: str,
    timeline: list[dict[str, Any]],
    total_duration_seconds: float,
) -> None:
    payload = {
        "date": date,
        "lang": lang,
        "audioFile": audio_file,
        "sectionOrder": [compact_text(item.get("name")) for item in timeline],
        "ttsCallCount": len(timeline),
        "totalDurationSeconds": round(total_duration_seconds, 3),
        "sections": timeline,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    logger.info("Saved section timing: %s", output_path)


def convert_wav_to_mp3(wav_path: Path, mp3_path: Path) -> None:
    logger.info("Converting WAV to MP3: %s", mp3_path)
    subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(wav_path),
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "192k",
            "-minrate",
            "192k",
            "-maxrate",
            "192k",
            "-bufsize",
            "192k",
            "-ac",
            "1",
            str(mp3_path),
        ],
        check=True,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate company-based TTS audio for shorts-firm")
    parser.add_argument("date", type=str, help="Date in YYYYMMDD or YYYY-MM-DD")
    parser.add_argument("--lang", type=str, default="ko", choices=["ko", "en"])
    parser.add_argument("--voice", type=str, default="Charon")
    parser.add_argument("--temperature", type=float, default=0.6)
    parser.add_argument(
        "--section-pause-seconds",
        type=float,
        default=float(os.getenv("SHORTS_FIRM_COMPANY_PAUSE_SECONDS", os.getenv("SHORTS_FIRM_SECTION_PAUSE_SECONDS", "0"))),
        help="Silence gap between company TTS segments (default: 0)",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=PIPELINE_CONFIG_PATH,
        help=f"Pipeline YAML config (default: {PIPELINE_CONFIG_PATH})",
    )
    parser.add_argument("--debug", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.debug:
        logger.setLevel(logging.DEBUG)
    if args.section_pause_seconds < 0:
        logger.error("--section-pause-seconds must be >= 0")
        return 2

    try:
        date = parse_date_arg(args.date)
    except ValueError as exc:
        logger.error("Date parsing failed: %s", exc)
        return 2

    load_env_from_yaml(logger=logger)
    load_dotenv(ROOT_DIR / ".env", override=False)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY not found")
        return 2

    config_path = args.config
    if not config_path.is_absolute():
        config_path = (ROOT_DIR / config_path).resolve()

    base_dir = ROOT_DIR / "podcast" / date / args.lang / "shorts-firm"
    script_path = base_dir / "script.json"
    wav_path = base_dir / shorts_firm_audio_basename(date, ext=".wav")
    mp3_path = base_dir / shorts_firm_audio_basename(date, ext=".mp3")
    timing_path = base_dir / "sections.timing.json"
    base_dir.mkdir(parents=True, exist_ok=True)

    logger.info("shorts-firm audio generation")
    logger.info("  - script: %s", script_path)
    logger.info("  - wav: %s", wav_path)
    logger.info("  - mp3: %s", mp3_path)

    try:
        config = load_yaml_config(config_path)
        system_instruction = load_tts_prompt(config, args.lang)
        script_payload = load_script(script_path)
        segments = extract_company_segments(script_payload, lang=args.lang)
        logger.info("  - company segments for TTS: %d", len(segments))
        pcm, timeline, total_duration = generate_company_audio(
            segments=segments,
            api_key=api_key,
            voice_name=args.voice,
            temperature=args.temperature,
            system_instruction=system_instruction,
            segment_pause_seconds=args.section_pause_seconds,
        )
        _write_wav(wav_path, pcm)
        save_timing_payload(
            output_path=timing_path,
            date=date,
            lang=args.lang,
            audio_file=mp3_path.name,
            timeline=timeline,
            total_duration_seconds=total_duration,
        )
        convert_wav_to_mp3(wav_path, mp3_path)
        logger.info("shorts-firm audio generation completed")
        return 0
    except Exception as exc:
        logger.error("Failed to generate shorts-firm audio: %s", exc, exc_info=args.debug)
        return 1


if __name__ == "__main__":
    sys.exit(main())
