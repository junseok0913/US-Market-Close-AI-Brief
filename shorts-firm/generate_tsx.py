"""Generate TSX payload module for shorts-firm render artifacts.

Default input:
  podcast/{date}/{lang}/shorts-firm/slides.render.json

Default output:
  web/src/generated/shorts-firm/{date}_{lang}.generated.tsx
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parent.parent

SECTION_TO_PHASE = {
    "hook": "hook",
    "closing": "finale",
}


def parse_date_token(raw: str) -> str:
    token = raw.replace("-", "").strip()
    if len(token) != 8 or not token.isdigit():
        raise ValueError(f"Invalid date format: {raw}")
    return token


def parse_optional_date_token(raw: Any) -> str | None:
    token = str(raw or "").replace("-", "").strip()
    if len(token) != 8 or not token.isdigit():
        return None
    return token


def compact_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def resolve_phase(section_name: Any) -> str:
    key = compact_text(section_name).lower().replace("-", "_")
    if key == "company" or key.startswith("company_") or re.match(r"^company\d+$", key):
        return "insight"
    return SECTION_TO_PHASE.get(key, "insight")


def parse_duration_from_target(value: Any) -> float:
    text = compact_text(value)
    match = re.search(r"(\d+)", text)
    if not match:
        return 90.0
    return float(match.group(1))


def build_default_input_path(date: str, lang: str) -> Path:
    return ROOT_DIR / "podcast" / date / lang / "shorts-firm" / "slides.render.json"


def build_fallback_script_path(date: str, lang: str) -> Path:
    return ROOT_DIR / "podcast" / date / lang / "shorts-firm" / "script.json"


def build_default_output_path(date: str, lang: str) -> Path:
    return ROOT_DIR / "web" / "src" / "generated" / "shorts-firm" / f"{date}_{lang}.generated.tsx"


def to_export_name(date: str, lang: str) -> str:
    return f"shortsFirmEpisode{date}{lang.upper()}"


def normalize_from_script_payload(payload: dict[str, Any], *, date: str, lang: str) -> dict[str, Any]:
    episode_date = parse_optional_date_token(payload.get("date")) or date
    raw_sections = payload.get("sections")
    normalized_sections: list[dict[str, str]] = []

    if isinstance(raw_sections, list):
        for item in raw_sections:
            if not isinstance(item, dict):
                continue
            name = compact_text(item.get("name")).lower()
            text = compact_text(item.get("text") or item.get("script") or item.get("body"))
            if not name:
                continue
            normalized_sections.append({"name": name, "text": text})
    elif isinstance(raw_sections, dict):
        for key, value in raw_sections.items():
            name = compact_text(key).lower()
            text = compact_text(value)
            if not name:
                continue
            normalized_sections.append({"name": name, "text": text})

    if not normalized_sections:
        script_text = compact_text(payload.get("script"))
        normalized_sections = [
            {"name": "hook", "text": compact_text(payload.get("hook")) or script_text},
            {"name": "company_1", "text": script_text},
            {"name": "closing", "text": script_text},
        ]

    duration_seconds = parse_duration_from_target(payload.get("duration_target"))
    per_section = max(1.0, duration_seconds / max(1, len(normalized_sections)))

    slides: list[dict[str, Any]] = []
    captions: list[dict[str, Any]] = []
    cursor = 0.0

    for idx, section in enumerate(normalized_sections):
        name = compact_text(section["name"]).lower()
        phase = resolve_phase(name)
        text = section["text"] or "오늘 시장 핵심을 빠르게 정리합니다."
        start_sec = cursor
        end_sec = duration_seconds if idx == len(normalized_sections) - 1 else min(duration_seconds, start_sec + per_section)

        slides.append(
            {
                "id": idx,
                "phase": phase,
                "theme": "neutral",
                "startSec": round(start_sec, 3),
                "endSec": round(end_sec, 3),
                "eyebrow": name or f"section-{idx + 1}",
                "headline": compact_text(payload.get("title")) or "US Market Close",
                "subheadline": text,
                "body": text,
                "bullets": [text],
                "tickers": [],
                "highlights": [],
            }
        )
        captions.append(
            {
                "id": idx,
                "startSec": round(start_sec, 3),
                "endSec": round(end_sec, 3),
                "text": text,
            }
        )
        cursor = end_sec

    metadata = payload.get("metadata") if isinstance(payload.get("metadata"), dict) else {}
    featured_tickers = metadata.get("featured_tickers") if isinstance(metadata.get("featured_tickers"), list) else []
    audio_file = compact_text(payload.get("audioFile")) or f"shorts{date}.mp3"

    return {
        "date": episode_date,
        "lang": lang,
        "title": compact_text(payload.get("title")) or "US Market Close",
        "hook": compact_text(payload.get("hook")) or compact_text(payload.get("script")),
        "durationSeconds": round(duration_seconds, 3),
        "audioFile": audio_file,
        "slides": slides,
        "captions": captions,
        "sourceDigest": [],
        "meta": {
            "keyPoints": [compact_text(item) for item in (metadata.get("key_points") or []) if compact_text(item)][:4],
            "featuredTickers": featured_tickers,
            "sceneCount": len(slides),
            "companyMoves": metadata.get("company_moves") if isinstance(metadata.get("company_moves"), list) else [],
        },
    }


def load_episode_payload(input_path: Path, *, date: str, lang: str) -> dict[str, Any]:
    payload = json.loads(input_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Input JSON must be object: {input_path}")
    if isinstance(payload.get("slides"), list):
        return payload
    return normalize_from_script_payload(payload, date=date, lang=lang)


def save_tsx_payload(*, episode: dict[str, Any], output_path: Path, export_name: str, source_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    encoded = json.dumps(episode, ensure_ascii=False, indent=2)
    content = (
        "/* Auto-generated by shorts-firm/generate_tsx.py. */\n"
        f"/* Source: {source_path.as_posix()} */\n\n"
        "import type { ShortsEpisode } from '@/types/shorts';\n\n"
        f"export const {export_name}: ShortsEpisode = {encoded} as ShortsEpisode;\n\n"
        f"export default {export_name};\n"
    )
    output_path.write_text(content, encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate shorts-firm TSX payload module")
    parser.add_argument("date", help="Date in YYYYMMDD or YYYY-MM-DD")
    parser.add_argument("--lang", default="ko", choices=["ko", "en"])
    parser.add_argument(
        "--input",
        type=Path,
        help="Input JSON path (default: shorts-firm/slides.render.json; fallback: shorts-firm/script.json)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output TSX path (default: web/src/generated/shorts-firm/{date}_{lang}.generated.tsx)",
    )
    parser.add_argument(
        "--export-name",
        type=str,
        help="Named export identifier (default: shortsFirmEpisode{date}{LANG})",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    date = parse_date_token(args.date)
    lang = args.lang

    input_path = args.input or build_default_input_path(date, lang)
    if not input_path.is_absolute():
        input_path = (ROOT_DIR / input_path).resolve()

    if not input_path.exists():
        fallback_input = build_fallback_script_path(date, lang)
        if fallback_input.exists():
            input_path = fallback_input
        else:
            raise FileNotFoundError(f"shorts-firm input not found: {input_path} (fallback: {fallback_input})")

    output_path = args.output or build_default_output_path(date, lang)
    if not output_path.is_absolute():
        output_path = (ROOT_DIR / output_path).resolve()

    export_name = args.export_name or to_export_name(date, lang)
    episode = load_episode_payload(input_path, date=date, lang=lang)
    save_tsx_payload(episode=episode, output_path=output_path, export_name=export_name, source_path=input_path)
    print(f"Generated shorts-firm TSX payload: {output_path}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"Failed to generate shorts-firm TSX payload: {exc}", file=sys.stderr)
        sys.exit(1)
