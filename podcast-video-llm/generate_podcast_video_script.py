#!/usr/bin/env python3
"""Build a PodcastVideoComposition render plan from the existing timed episode."""

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


logger = logging.getLogger(__name__)

PROMPT_CONFIG_PATH = ROOT_DIR / "podcast-video-llm" / "prompt" / "podcast_video_composition.yaml"
CHAPTER_COLORS = [
    "#38bdf8",
    "#14b8a6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#22c55e",
]
CHAPTER_ICONS = ["◉", "▲", "◆", "■", "✦", "●"]
KNOWN_KO_LABELS = {
    "opening": "오프닝",
    "closing": "마무리",
    "theme": "핵심 테마",
    "ticker": "종목 포인트",
    "market": "시장 흐름",
    "macro": "매크로",
    "risk": "리스크",
    "sector": "섹터 흐름",
    "rotation": "순환매",
    "sentiment": "시장 심리",
    "earnings": "실적 포인트",
    "case": "케이스",
    "recap": "정리",
}
KNOWN_EN_LABELS = {
    "opening": "Opening",
    "closing": "Closing",
    "theme": "Theme",
    "ticker": "Ticker Focus",
    "market": "Market",
    "macro": "Macro",
    "risk": "Risk",
    "sector": "Sector",
    "rotation": "Rotation",
    "sentiment": "Sentiment",
    "earnings": "Earnings",
    "case": "Case",
    "recap": "Recap",
}
HEX_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")


def compact_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def response_to_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                text = item.get("text")
                if text:
                    parts.append(str(text))
            else:
                parts.append(str(item))
        return "\n".join(parts)
    return str(content)


def extract_json_object(raw_text: str) -> dict[str, Any]:
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("LLM response does not contain a valid JSON object")
    payload = json.loads(text[start : end + 1])
    if not isinstance(payload, dict):
        raise ValueError("LLM response JSON must be an object")
    return payload


def load_json(path: Path, *, required: bool = True) -> dict[str, Any]:
    if not path.exists():
        if required:
            raise FileNotFoundError(f"Required JSON file not found: {path}")
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"JSON root must be an object: {path}")
    return payload


def load_prompt_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Prompt config not found: {path}")
    payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Prompt config must be a mapping: {path}")
    return payload


def normalize_chapter_name(value: Any) -> str:
    text = compact_text(value).lower()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return text.strip("_")


def script_ids_from_episode(episode: dict[str, Any]) -> list[int]:
    scripts = episode.get("scripts")
    if not isinstance(scripts, list) or not scripts:
        raise ValueError("Episode JSON must contain non-empty scripts[]")
    ids: list[int] = []
    for index, script in enumerate(scripts):
        if not isinstance(script, dict):
            raise ValueError(f"scripts[{index}] must be an object")
        script_id = script.get("id")
        if not isinstance(script_id, int):
            raise ValueError(f"scripts[{index}].id must be an integer")
        ids.append(script_id)
    return ids


def is_valid_chapter_cover(chapters: list[dict[str, Any]], script_ids: list[int]) -> bool:
    if not chapters or not script_ids:
        return False
    expected_start = script_ids[0]
    last_id = script_ids[-1]
    for chapter in chapters:
        start_id = chapter.get("start_id")
        end_id = chapter.get("end_id")
        name = chapter.get("name")
        if not isinstance(start_id, int) or not isinstance(end_id, int):
            return False
        if not isinstance(name, str) or not name:
            return False
        if start_id != expected_start or end_id < start_id or end_id > last_id:
            return False
        expected_start = end_id + 1
    return expected_start == last_id + 1


def partition_ranges(total: int, parts: int) -> list[tuple[int, int]]:
    if total <= 0 or parts <= 0:
        return []
    base, remainder = divmod(total, parts)
    ranges: list[tuple[int, int]] = []
    cursor = 0
    for idx in range(parts):
        size = base + (1 if idx < remainder else 0)
        start = cursor
        end = cursor + size
        ranges.append((start, end))
        cursor = end
    return ranges


def build_fallback_chapters(script_ids: list[int]) -> list[dict[str, Any]]:
    if not script_ids:
        return []
    if len(script_ids) == 1:
        only = script_ids[0]
        return [{"name": "opening", "start_id": only, "end_id": only}]
    if len(script_ids) == 2:
        return [
            {"name": "opening", "start_id": script_ids[0], "end_id": script_ids[0]},
            {"name": "closing", "start_id": script_ids[1], "end_id": script_ids[1]},
        ]
    if len(script_ids) <= 6:
        chapters = [
            {"name": "opening", "start_id": script_ids[0], "end_id": script_ids[0]},
        ]
        if len(script_ids) > 2:
            chapters.append(
                {"name": "theme", "start_id": script_ids[1], "end_id": script_ids[-2]}
            )
        chapters.append(
            {"name": "closing", "start_id": script_ids[-1], "end_id": script_ids[-1]}
        )
        return chapters

    body_ids = script_ids[2:-2]
    middle_names = ["theme", "ticker"] if len(body_ids) < 10 else ["theme", "market", "ticker"]
    ranges = partition_ranges(len(body_ids), len(middle_names))

    chapters = [
        {"name": "opening", "start_id": script_ids[0], "end_id": script_ids[1]},
    ]
    for index, name in enumerate(middle_names):
        start_idx, end_idx = ranges[index]
        if end_idx <= start_idx:
            continue
        chapters.append(
            {
                "name": name,
                "start_id": body_ids[start_idx],
                "end_id": body_ids[end_idx - 1],
            }
        )
    chapters.append(
        {"name": "closing", "start_id": script_ids[-2], "end_id": script_ids[-1]}
    )
    return chapters


def normalize_chapters(raw: Any, script_ids: list[int], fallback: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not isinstance(raw, list):
        return fallback

    chapters: list[dict[str, Any]] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        name = normalize_chapter_name(item.get("name"))
        start_id = item.get("start_id")
        end_id = item.get("end_id")
        if not name or not isinstance(start_id, int) or not isinstance(end_id, int):
            continue
        chapters.append({"name": name, "start_id": start_id, "end_id": end_id})

    chapters.sort(key=lambda chapter: chapter["start_id"])
    if is_valid_chapter_cover(chapters, script_ids):
        return chapters
    return fallback


def humanize_chapter_name(name: str, lang: str) -> str:
    mapping = KNOWN_KO_LABELS if lang == "ko" else KNOWN_EN_LABELS
    tokens = [token for token in name.split("_") if token]
    if not tokens:
        return "챕터" if lang == "ko" else "Chapter"

    resolved = [mapping.get(token, token.upper() if len(token) <= 4 else token.title()) for token in tokens]
    return " ".join(resolved)


def normalize_color(value: Any, index: int) -> str:
    text = compact_text(value)
    if HEX_COLOR_RE.fullmatch(text):
        return text
    return CHAPTER_COLORS[index % len(CHAPTER_COLORS)]


def normalize_icon(value: Any, index: int) -> str:
    text = compact_text(value)
    if text:
        return text[:2]
    return CHAPTER_ICONS[index % len(CHAPTER_ICONS)]


def normalize_chapter_meta(
    raw: Any,
    chapters: list[dict[str, Any]],
    lang: str,
    fallback_raw: Any = None,
) -> dict[str, dict[str, str]]:
    raw_map = raw if isinstance(raw, dict) else {}
    fallback_map = fallback_raw if isinstance(fallback_raw, dict) else {}
    output: dict[str, dict[str, str]] = {}
    for index, chapter in enumerate(chapters):
        name = chapter["name"]
        source = raw_map.get(name)
        if not isinstance(source, dict):
            source = fallback_map.get(name)
        if not isinstance(source, dict):
            source = {}
        output[name] = {
            "label": compact_text(source.get("label")) or humanize_chapter_name(name, lang),
            "color": normalize_color(source.get("color"), index),
            "icon": normalize_icon(source.get("icon"), index),
        }
    return output


def build_render_payload(
    source_episode: dict[str, Any],
    raw_plan: dict[str, Any],
    *,
    lang: str,
) -> dict[str, Any]:
    script_ids = script_ids_from_episode(source_episode)
    base_chapters = normalize_chapters(
        source_episode.get("chapter"),
        script_ids,
        build_fallback_chapters(script_ids),
    )
    chapters = normalize_chapters(raw_plan.get("chapter"), script_ids, base_chapters)
    chapter_meta = normalize_chapter_meta(
        raw_plan.get("chapterMeta"),
        chapters,
        lang,
        fallback_raw=source_episode.get("chapterMeta"),
    )

    nutshell = compact_text(raw_plan.get("nutshell")) or compact_text(source_episode.get("nutshell"))
    if not nutshell:
        first_text = compact_text(source_episode["scripts"][0].get("text"))
        nutshell = first_text[:80] if first_text else "오늘 장마감 핵심 포인트"

    return {
        "date": compact_text(source_episode.get("date")) or compact_text(raw_plan.get("date")),
        "nutshell": nutshell,
        "user_tickers": source_episode.get("user_tickers") or raw_plan.get("user_tickers") or [],
        "news_tickers": source_episode.get("news_tickers") or raw_plan.get("news_tickers") or [],
        "chapter": chapters,
        "scripts": source_episode.get("scripts") or [],
        "chapterMeta": chapter_meta,
    }


def generate_with_llm(
    source_episode: dict[str, Any],
    metadata_json: dict[str, Any],
    *,
    date: str,
    lang: str,
    prompt_config: dict[str, Any],
    prefix: str,
) -> dict[str, Any]:
    system_prompt = compact_text(prompt_config.get("system"))
    user_template = prompt_config.get("user_template")
    if not isinstance(user_template, str) or not user_template.strip():
        raise ValueError("Prompt config must include user_template")

    llm = build_llm(prefix, logger=logger)
    user_prompt = user_template.format(
        date=date,
        lang=lang,
        timed_episode_json=json.dumps(source_episode, ensure_ascii=False, indent=2),
        metadata_json=json.dumps(metadata_json, ensure_ascii=False, indent=2),
    )
    full_prompt = f"{system_prompt}\n\n{user_prompt}" if system_prompt else user_prompt

    response = llm.invoke(full_prompt)
    raw_payload = extract_json_object(response_to_text(response.content))
    return build_render_payload(source_episode, raw_payload, lang=lang)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generate PodcastVideoComposition render.json from the existing timed episode JSON"
    )
    parser.add_argument("date", type=str, help="Date in YYYYMMDD format")
    parser.add_argument("--lang", type=str, default="ko", choices=["ko", "en"])
    parser.add_argument(
        "--output",
        type=Path,
        help="Output path (default: podcast/YYYYMMDD/{lang}/podcast-video-llm/render.json)",
    )
    parser.add_argument(
        "--prompt-config",
        type=Path,
        default=PROMPT_CONFIG_PATH,
        help=f"Prompt YAML path (default: {PROMPT_CONFIG_PATH})",
    )
    parser.add_argument(
        "--prefix",
        type=str,
        default="PODCAST_VIDEO_LLM",
        help="LLM env prefix for shared.utils.llm.build_llm",
    )
    parser.add_argument(
        "--source-episode-json",
        type=Path,
        help="Optional override for the existing timed episode JSON",
    )
    parser.add_argument(
        "--metadata-json",
        type=Path,
        help="Optional override for metadata.json",
    )
    parser.add_argument(
        "--no-llm",
        action="store_true",
        help="Skip LLM and build render.json from the existing chapter structure",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    load_env_from_yaml(logger=logger)
    load_dotenv(ROOT_DIR / ".env", override=False)

    if not re.fullmatch(r"\d{8}", args.date):
        raise ValueError(f"DATE must be in YYYYMMDD format: {args.date}")

    source_episode_path = args.source_episode_json or (
        ROOT_DIR / "podcast" / args.date / args.lang / f"{args.date}.json"
    )
    metadata_json_path = args.metadata_json or (
        ROOT_DIR / "podcast" / args.date / args.lang / "metadata.json"
    )
    output_path = args.output or (
        ROOT_DIR / "podcast" / args.date / args.lang / "podcast-video-llm" / "render.json"
    )
    if not source_episode_path.is_absolute():
        source_episode_path = (ROOT_DIR / source_episode_path).resolve()
    if not metadata_json_path.is_absolute():
        metadata_json_path = (ROOT_DIR / metadata_json_path).resolve()
    if not output_path.is_absolute():
        output_path = (ROOT_DIR / output_path).resolve()

    logger.info("PodcastVideoComposition source episode: %s", source_episode_path)
    logger.info("PodcastVideoComposition output: %s", output_path)

    source_episode = load_json(source_episode_path)
    metadata_json = load_json(metadata_json_path, required=False)
    prompt_config = load_prompt_config(args.prompt_config)

    if args.no_llm:
        logger.info("Skipping LLM and reusing the existing chapter structure")
        payload = build_render_payload(source_episode, {}, lang=args.lang)
    else:
        try:
            payload = generate_with_llm(
                source_episode,
                metadata_json,
                date=args.date,
                lang=args.lang,
                prompt_config=prompt_config,
                prefix=args.prefix,
            )
        except Exception as exc:
            logger.warning("LLM render-plan generation failed, falling back to source episode chapters: %s", exc)
            payload = build_render_payload(source_episode, {}, lang=args.lang)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    logger.info("Saved PodcastVideoComposition render plan: %s", output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
