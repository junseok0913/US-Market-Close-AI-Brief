"""
Generate Korean YouTube Shorts scripts from existing podcast data.

This script takes the full podcast script.json and metadata.txt and compresses
them into 1-2 minute shorts format using LLM, strictly based on existing content.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
from pathlib import Path
from typing import Any, Literal

import yaml
from dotenv import load_dotenv

# Add parent directory to path for imports
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from shared.yaml_config import load_env_from_yaml
from shared.utils.llm import build_llm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Constants
SHORTS_PROMPT_PATH = ROOT_DIR / "shorts" / "prompt" / "shorts_script.yaml"
DEFAULT_DURATION = 90  # seconds
MEASURED_CHARS_PER_SEC = 7.88
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
DEFAULT_FINAL_CTA = {
    "ko": "구독과 좋아요 부탁드립니다.",
    "en": "Please like and subscribe.",
}


DurationTarget = Literal[60, 90, 120]


def compact_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def detect_output_lang(*texts: Any) -> str:
    blob = " ".join(compact_text(text) for text in texts)
    return "ko" if re.search(r"[가-힣]", blob) else "en"


def ensure_sentence_end(text: str) -> str:
    normalized = compact_text(text)
    if not normalized:
        return ""
    if re.search(r"[.!?…]$", normalized):
        return normalized
    return f"{normalized}."


def resolve_final_cta(prompt_config: dict[str, Any], script_json: dict[str, Any]) -> str:
    script_cfg = prompt_config.get("script")
    if not isinstance(script_cfg, dict):
        lang = detect_output_lang(script_json.get("nutshell"), script_json.get("date"))
        return DEFAULT_FINAL_CTA.get(lang, DEFAULT_FINAL_CTA["en"])

    cta_config = script_cfg.get("final_cta")
    if not isinstance(cta_config, dict):
        lang = detect_output_lang(script_json.get("nutshell"), script_json.get("date"))
        return DEFAULT_FINAL_CTA.get(lang, DEFAULT_FINAL_CTA["en"])

    lang = detect_output_lang(script_json.get("nutshell"), script_json.get("date"))
    resolved = compact_text(cta_config.get(lang) or cta_config.get("ko") or cta_config.get("en"))
    if resolved:
        return ensure_sentence_end(resolved)
    return DEFAULT_FINAL_CTA.get(lang, DEFAULT_FINAL_CTA["en"])


def force_closing_cta(
    sections: list[dict[str, str]],
    final_cta: str,
) -> list[dict[str, str]]:
    cta = ensure_sentence_end(final_cta)
    if not cta:
        return sections

    out: list[dict[str, str]] = []
    for section in sections:
        if section.get("name") == "closing":
            out.append({"name": "closing", "text": cta})
            continue
        out.append({"name": section.get("name", ""), "text": compact_text(section.get("text"))})
    return out


def ensure_script_ends_with_cta(script_text: str, final_cta: str) -> str:
    script = compact_text(script_text)
    cta = ensure_sentence_end(final_cta)
    if not cta:
        return script
    if not script:
        return cta

    script_no_tail = re.sub(r"[.!?…\s]+$", "", script)
    cta_no_tail = re.sub(r"[.!?…\s]+$", "", cta)
    if script_no_tail.endswith(cta_no_tail):
        return script
    return compact_text(f"{script} {cta}")


def split_sentences(text: str) -> list[str]:
    normalized = compact_text(text)
    if not normalized:
        return []
    protected = re.sub(r"(?<=\d)\.(?=\d)", "__DOT__", normalized)
    raw = re.findall(r"[^.!?]+[.!?]?", protected)
    out = [token.strip().replace("__DOT__", ".") for token in raw if token.strip()]
    if out:
        return out
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


def fallback_sections_from_script(script_text: str) -> list[dict[str, str]]:
    sentences = split_sentences(script_text)
    if not sentences:
        return [{"name": name, "text": ""} for name in SECTION_ORDER]

    ranges = partition_ranges(len(sentences), len(SECTION_ORDER))
    by_name: dict[str, str] = {}
    for idx, (start, end) in enumerate(ranges):
        if idx >= len(SECTION_ORDER):
            break
        name = SECTION_ORDER[idx]
        by_name[name] = compact_text(" ".join(sentences[start:end]))

    return [
        {"name": name, "text": by_name.get(name, "")}
        for name in SECTION_ORDER
    ]


def normalize_section_name(value: Any) -> str:
    key = compact_text(value).lower()
    return SECTION_NAME_ALIASES.get(key, "")


def normalize_sections(raw_result: dict[str, Any], script_text: str) -> list[dict[str, str]]:
    fallback = fallback_sections_from_script(script_text)
    fallback_by_name = {item["name"]: item["text"] for item in fallback}

    collected: dict[str, str] = {}
    raw_sections = raw_result.get("sections")
    if isinstance(raw_sections, list):
        for item in raw_sections:
            if not isinstance(item, dict):
                continue
            section_name = normalize_section_name(item.get("name"))
            if not section_name:
                continue
            text = compact_text(item.get("text") or item.get("script") or item.get("body"))
            if not text:
                continue
            if section_name not in collected:
                collected[section_name] = text
    elif isinstance(raw_sections, dict):
        for key, value in raw_sections.items():
            section_name = normalize_section_name(key)
            if not section_name:
                continue
            text = compact_text(value)
            if text and section_name not in collected:
                collected[section_name] = text

    # Support legacy key style from LLM responses.
    for section_name in SECTION_ORDER:
        if section_name in collected:
            continue
        direct = compact_text(raw_result.get(f"{section_name}_text"))
        if direct:
            collected[section_name] = direct

    normalized: list[dict[str, str]] = []
    for section_name in SECTION_ORDER:
        text = collected.get(section_name) or fallback_by_name.get(section_name, "")
        normalized.append({"name": section_name, "text": compact_text(text)})

    return normalized


def normalize_sources(raw_sources: Any) -> list[dict[str, Any]]:
    if not isinstance(raw_sources, list):
        return []
    return [item for item in raw_sources if isinstance(item, dict)]


def unique_tickers_from_sources(sources: list[dict[str, Any]]) -> list[str]:
    out: list[str] = []
    seen = set()
    for source in sources:
        ticker = source.get("ticker")
        if not isinstance(ticker, str):
            continue
        cleaned = re.sub(r"[^A-Z0-9^.-]", "", ticker.upper())
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        out.append(cleaned)
    return out


def normalize_shorts_result(
    raw_result: dict[str, Any],
    *,
    script_json: dict[str, Any],
    duration: DurationTarget,
    final_cta: str,
) -> dict[str, Any]:
    script_text = compact_text(raw_result.get("script"))
    sections = normalize_sections(raw_result, script_text)
    sections = force_closing_cta(sections, final_cta)
    if not script_text:
        script_text = compact_text(" ".join(item["text"] for item in sections if item["text"]))
    script_text = ensure_script_ends_with_cta(script_text, final_cta)

    metadata = raw_result.get("metadata") if isinstance(raw_result.get("metadata"), dict) else {}
    key_points = metadata.get("key_points") if isinstance(metadata.get("key_points"), list) else []
    key_points = [compact_text(item) for item in key_points if compact_text(item)]
    if not key_points:
        key_points = [compact_text(item["text"][:68]) for item in sections if item["text"]][:4]

    sources = normalize_sources(raw_result.get("sources"))
    featured_tickers = metadata.get("featured_tickers") if isinstance(metadata.get("featured_tickers"), list) else []
    normalized_tickers = []
    seen = set()
    for ticker in featured_tickers:
        cleaned = re.sub(r"[^A-Z0-9^.-]", "", compact_text(ticker).upper())
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        normalized_tickers.append(cleaned)
    for ticker in unique_tickers_from_sources(sources):
        if ticker in seen:
            continue
        seen.add(ticker)
        normalized_tickers.append(ticker)

    estimated_duration = int(round(len(script_text) / MEASURED_CHARS_PER_SEC)) if script_text else int(duration)
    hook_text = compact_text(raw_result.get("hook")) or sections[0]["text"] or script_text[:90]

    return {
        "date": compact_text(raw_result.get("date")) or compact_text(script_json.get("date")),
        "title": compact_text(raw_result.get("title")) or compact_text(script_json.get("nutshell")) or "미국 증시 쇼츠",
        "duration_target": f"{int(duration)}초",
        "hook": hook_text,
        "sections": [
            {
                "id": idx,
                "name": item["name"],
                "text": item["text"],
            }
            for idx, item in enumerate(sections)
        ],
        "script": script_text,
        "sources": sources,
        "metadata": {
            "character_count": len(script_text),
            "estimated_duration_seconds": max(1, estimated_duration),
            "key_points": key_points[:4],
            "featured_tickers": normalized_tickers[:6],
        },
    }


def load_prompt_config(yaml_path: Path) -> dict[str, Any]:
    """Load YAML prompt configuration."""
    if not yaml_path.exists():
        raise FileNotFoundError(f"Prompt YAML not found: {yaml_path}")
    
    with open(yaml_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    
    return config


def load_podcast_data(podcast_dir: Path) -> tuple[dict, str]:
    """
    Load script.json and metadata.txt from podcast directory.
    
    Returns:
        (script_json_dict, metadata_txt_string)
    """
    script_path = podcast_dir / "script.json"
    metadata_path = podcast_dir / "metadata.txt"
    
    if not script_path.exists():
        raise FileNotFoundError(f"script.json not found: {script_path}")
    if not metadata_path.exists():
        raise FileNotFoundError(f"metadata.txt not found: {metadata_path}")
    
    # Load script.json
    with open(script_path, "r", encoding="utf-8") as f:
        script_json = json.load(f)
    
    # Load metadata.txt
    with open(metadata_path, "r", encoding="utf-8") as f:
        metadata_txt = f.read()
    
    logger.info(f"Loaded podcast data from {podcast_dir}")
    logger.info(f"  - Script entries: {len(script_json.get('scripts', []))}")
    logger.info(f"  - Metadata size: {len(metadata_txt)} chars")
    
    return script_json, metadata_txt


def generate_shorts_script(
    script_json: dict,
    metadata_txt: str,
    duration: DurationTarget,
    llm: Any,
) -> dict[str, Any]:
    """
    Generate shorts script using LLM.
    
    Args:
        script_json: Full podcast script dictionary
        metadata_txt: Metadata text content
        duration: Target duration in seconds (60, 90, or 120)
        llm: LangChain LLM instance
    
    Returns:
        Generated shorts script as dictionary
    """
    # Load prompt configuration
    config = load_prompt_config(SHORTS_PROMPT_PATH)
    final_cta = resolve_final_cta(config, script_json)
    
    system_prompt = config.get("system", "")
    user_template = config.get("user_template", "")
    
    # Format user prompt
    user_prompt = user_template.format(
        duration=duration,
        script_json=json.dumps(script_json, ensure_ascii=False, indent=2),
        metadata_txt=metadata_txt,
    )
    
    # Combine system and user prompts
    full_prompt = f"{system_prompt}\n\n{user_prompt}"
    
    logger.info(f"Generating {duration}s shorts script")
    logger.info(f"  - System prompt: {len(system_prompt)} chars")
    logger.info(f"  - User prompt: {len(user_prompt)} chars")
    
    try:
        # LLM 호출
        response = llm.invoke(full_prompt)
        raw_response = response.content.strip()
        
        # JSON 추출 (코드 블록 제거)
        json_str = raw_response
        if json_str.startswith("```json"):
            json_str = json_str.replace("```json", "").replace("```", "").strip()
        elif json_str.startswith("```"):
            json_str = json_str.replace("```", "").strip()
        
        logger.debug(f"Raw response: {json_str[:200]}...")
        
        # JSON 파싱
        try:
            result = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response text: {json_str[:500]}")
            raise ValueError(f"LLM returned invalid JSON: {e}")
        
        # Validate result
        required_fields = ["date", "title"]
        missing = [f for f in required_fields if f not in result]
        if missing:
            raise ValueError(f"Missing required fields in response: {missing}")

        normalized = normalize_shorts_result(
            result,
            script_json=script_json,
            duration=duration,
            final_cta=final_cta,
        )
        
        logger.info(f"✓ Generated shorts script: {normalized['title']}")
        logger.info(f"  - Characters: {normalized['metadata']['character_count']}")
        logger.info(f"  - Estimated duration: {normalized['metadata']['estimated_duration_seconds']}s")
        logger.info(f"  - Sections: {len(normalized.get('sections', []))}")
        logger.info(f"  - Key points: {len(normalized['metadata']['key_points'])}")
        
        return normalized
        
    except Exception as e:
        logger.error(f"Shorts script generation failed: {e}")
        raise


def save_shorts_script(shorts_script: dict, output_path: Path) -> None:
    """Save generated shorts script to JSON file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(shorts_script, f, ensure_ascii=False, indent=2)
    
    logger.info(f"✓ Saved shorts script to {output_path}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate Korean YouTube Shorts script from podcast data"
    )
    parser.add_argument(
        "podcast_dir",
        type=Path,
        help="Path to podcast directory containing script.json and metadata.txt",
    )
    parser.add_argument(
        "--duration",
        type=int,
        choices=[60, 90, 120],
        default=DEFAULT_DURATION,
        help="Target duration in seconds (default: 90)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output path for shorts script JSON (default: <podcast_dir>/shorts/script.json)",
    )
    parser.add_argument(
        "--prefix",
        type=str,
        default="SHORTS",
        help="Environment variable prefix (default: SHORTS)",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging",
    )
    
    args = parser.parse_args()
    
    if args.debug:
        logger.setLevel(logging.DEBUG)
    
    # Load .env file first
    load_dotenv(ROOT_DIR / ".env", override=False)
    
    # Load YAML config
    load_env_from_yaml(logger=logger)
    
    # Initialize LLM (Gemini/OpenAI auto-selected by build_llm)
    logger.info("Initializing shorts LLM client...")
    llm = build_llm(prefix=args.prefix, logger=logger)
    
    # Validate podcast directory
    if not args.podcast_dir.exists():
        logger.error(f"Podcast directory not found: {args.podcast_dir}")
        sys.exit(1)
    
    # Determine output path - save to shorts subfolder
    shorts_dir = args.podcast_dir / "shorts"
    shorts_dir.mkdir(exist_ok=True)
    output_path = args.output or (shorts_dir / "script.json")
    
    try:
        # Load podcast data
        script_json, metadata_txt = load_podcast_data(args.podcast_dir)
        
        # Generate shorts script
        shorts_script = generate_shorts_script(
            script_json=script_json,
            metadata_txt=metadata_txt,
            duration=args.duration,
            llm=llm,
        )
        
        # Save result
        save_shorts_script(shorts_script, output_path)
        
        logger.info("✓ Shorts generation completed successfully!")
        
    except Exception as e:
        logger.error(f"Failed to generate shorts: {e}", exc_info=args.debug)
        sys.exit(1)


if __name__ == "__main__":
    main()
