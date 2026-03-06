"""Build a scene plan for the independent Pexels shorts demo.

Inputs (preferred):
- podcast/{date}/{lang}/{source_subdir}/slides.render.json

Fallback:
- podcast/{date}/{lang}/{source_subdir}/script.json

Output:
- podcast/{date}/{lang}/shorts-pexels-demo/scenes.json
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

DEFAULT_CONFIG_PATH = ROOT_DIR / "shorts-pexels-demo" / "prompt" / "shorts_pexels_demo_pipeline.yaml"


def compact_text(value: Any, *, max_len: int = 0) -> str:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    if max_len > 0 and len(text) > max_len:
        return f"{text[: max_len - 1].rstrip()}…"
    return text


def parse_date_token(value: str) -> str:
    token = value.replace("-", "").strip()
    if len(token) != 8 or not token.isdigit():
        raise ValueError(f"Invalid date: {value}")
    return token


def response_to_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for part in content:
            if isinstance(part, dict):
                text = part.get("text")
                if text:
                    parts.append(str(text))
            else:
                parts.append(str(part))
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
        raise ValueError("LLM response does not contain JSON")
    return json.loads(text[start : end + 1])


def load_yaml(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(path)
    payload = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid YAML: {path}")
    return payload


def load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(path)
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid JSON object: {path}")
    return payload


def parse_duration_from_target(value: Any) -> float:
    text = compact_text(value)
    match = re.search(r"(\d+)", text)
    if not match:
        return 90.0
    return float(match.group(1))


def normalize_scenes_from_slides(slides_payload: dict[str, Any]) -> tuple[list[dict[str, Any]], float, str]:
    raw_slides = slides_payload.get("slides")
    if not isinstance(raw_slides, list) or not raw_slides:
        raise ValueError("slides.render.json does not contain slides[]")

    title = compact_text(slides_payload.get("title")) or "US Market Close"
    scenes: list[dict[str, Any]] = []
    total_duration = 0.0

    for idx, item in enumerate(raw_slides):
        if not isinstance(item, dict):
            continue
        start_sec = float(item.get("startSec") or 0.0)
        end_sec = float(item.get("endSec") or start_sec)
        if end_sec < start_sec:
            end_sec = start_sec
        duration_sec = max(0.5, end_sec - start_sec)

        body = compact_text(item.get("body"), max_len=220)
        subheadline = compact_text(item.get("subheadline"), max_len=140)
        if not body:
            body = subheadline
        if not body:
            body = compact_text(item.get("headline"), max_len=160)

        scene = {
            "id": idx,
            "phase": compact_text(item.get("phase")) or "insight",
            "theme": compact_text(item.get("theme")) or "neutral",
            "startSec": round(start_sec, 3),
            "endSec": round(end_sec, 3),
            "durationSec": round(duration_sec, 3),
            "headline": compact_text(item.get("headline"), max_len=110),
            "body": body,
            "tickers": [compact_text(v) for v in (item.get("tickers") or []) if compact_text(v)],
            "highlights": [compact_text(v) for v in (item.get("highlights") or []) if compact_text(v)],
        }
        scenes.append(scene)
        total_duration = max(total_duration, end_sec)

    if not scenes:
        raise ValueError("Failed to normalize scenes from slides.render.json")

    if total_duration <= 0:
        total_duration = float(slides_payload.get("durationSeconds") or 90.0)

    return scenes, round(total_duration, 3), title


def normalize_scenes_from_script(script_payload: dict[str, Any]) -> tuple[list[dict[str, Any]], float, str]:
    raw_sections = script_payload.get("sections")
    sections: list[dict[str, Any]] = []

    if isinstance(raw_sections, list):
        for item in raw_sections:
            if isinstance(item, dict):
                sections.append(item)

    if not sections:
        text = compact_text(script_payload.get("script"))
        sections = [
            {"name": "hook", "text": compact_text(script_payload.get("hook")) or text},
            {"name": "story", "text": text},
            {"name": "closing", "text": "구독과 좋아요 부탁드립니다."},
        ]

    duration_seconds = parse_duration_from_target(script_payload.get("duration_target"))
    span = duration_seconds / max(1, len(sections))
    title = compact_text(script_payload.get("title")) or "US Market Close"

    scenes: list[dict[str, Any]] = []
    cursor = 0.0
    for idx, section in enumerate(sections):
        start_sec = cursor
        end_sec = duration_seconds if idx == len(sections) - 1 else cursor + span
        body = compact_text(section.get("text") or section.get("script") or section.get("body"), max_len=220)
        scene = {
            "id": idx,
            "phase": compact_text(section.get("name")) or "insight",
            "theme": "neutral",
            "startSec": round(start_sec, 3),
            "endSec": round(end_sec, 3),
            "durationSec": round(max(0.5, end_sec - start_sec), 3),
            "headline": compact_text(title, max_len=110),
            "body": body,
            "tickers": [],
            "highlights": [],
        }
        scenes.append(scene)
        cursor = end_sec

    return scenes, round(duration_seconds, 3), title


def fallback_query(scene: dict[str, Any]) -> str:
    phase = compact_text(scene.get("phase")).lower()
    tickers = [compact_text(v) for v in scene.get("tickers") or [] if compact_text(v)]
    headline = compact_text(scene.get("headline"))
    body = compact_text(scene.get("body"), max_len=90)

    if phase in {"finale", "closing", "watch"}:
        return "stock market closing scene smartphone trading app"

    if tickers:
        first = tickers[0]
        if first.startswith("^"):
            return "stock market chart traders monitor wall street"
        return f"{first} stock market trading screen portrait"

    if headline:
        return f"{headline} stock market news portrait"

    return f"{body} stock market portrait photo"


def invoke_query_llm(
    *,
    llm: Any,
    config: dict[str, Any],
    date: str,
    lang: str,
    title: str,
    scenes: list[dict[str, Any]],
) -> dict[int, dict[str, str]]:
    prompt_cfg = config.get("query_prompt")
    if not isinstance(prompt_cfg, dict):
        raise ValueError("Config missing query_prompt block")

    system_prompt = compact_text(prompt_cfg.get("system"))
    user_template = str(prompt_cfg.get("user_template") or "").strip()
    if not system_prompt or not user_template:
        raise ValueError("query_prompt requires system and user_template")

    scene_stub = [
        {
            "scene_id": scene["id"],
            "phase": scene.get("phase"),
            "headline": scene.get("headline"),
            "body": scene.get("body"),
            "tickers": scene.get("tickers"),
            "highlights": scene.get("highlights"),
        }
        for scene in scenes
    ]

    user_prompt = user_template.format(
        date=date,
        lang=lang,
        title=title,
        scenes_json=json.dumps(scene_stub, ensure_ascii=False, indent=2),
    )

    response = llm.invoke(f"{system_prompt}\n\n{user_prompt}")
    payload = extract_json_object(response_to_text(response.content))

    raw_queries = payload.get("queries")
    if not isinstance(raw_queries, list):
        raise ValueError("LLM response missing queries[]")

    out: dict[int, dict[str, str]] = {}
    for item in raw_queries:
        if not isinstance(item, dict):
            continue
        scene_id = item.get("scene_id")
        if not isinstance(scene_id, int):
            continue
        query = compact_text(item.get("query"), max_len=120)
        intent = compact_text(item.get("intent"), max_len=120)
        if not query:
            continue
        out[scene_id] = {"query": query, "intent": intent}
    return out


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate scene plan for shorts-pexels-demo")
    parser.add_argument("date", help="Date in YYYYMMDD or YYYY-MM-DD")
    parser.add_argument("--lang", default="ko", choices=["ko", "en"])
    parser.add_argument("--source-subdir", default="shorts", help="Source folder under podcast/{date}/{lang}")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG_PATH)
    parser.add_argument("--output", type=Path, help="Output scenes.json path")
    parser.add_argument("--prefix", default="PEXELS_QUERY", help="LLM env prefix for build_llm")
    parser.add_argument("--no-llm", action="store_true", help="Disable query LLM and use deterministic fallback")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    date = parse_date_token(args.date)
    lang = args.lang

    load_dotenv(override=False)

    config_path = args.config
    if not config_path.is_absolute():
        config_path = (ROOT_DIR / config_path).resolve()
    config = load_yaml(config_path)
    load_env_from_yaml(config_path, override=False, logger=logger)

    source_base = ROOT_DIR / "podcast" / date / lang / args.source_subdir
    if not source_base.exists():
        raise FileNotFoundError(f"Source folder not found: {source_base}")

    slides_path = source_base / "slides.render.json"
    script_path = source_base / "script.json"

    if slides_path.exists():
        scenes, duration_seconds, title = normalize_scenes_from_slides(load_json(slides_path))
        source_kind = "slides.render.json"
    elif script_path.exists():
        scenes, duration_seconds, title = normalize_scenes_from_script(load_json(script_path))
        source_kind = "script.json"
    else:
        raise FileNotFoundError(f"Neither slides.render.json nor script.json exists in: {source_base}")

    query_by_scene_id: dict[int, dict[str, str]] = {}
    llm_used = False

    if not args.no_llm:
        try:
            llm = build_llm(prefix=args.prefix, logger=logger)
            query_by_scene_id = invoke_query_llm(
                llm=llm,
                config=config,
                date=date,
                lang=lang,
                title=title,
                scenes=scenes,
            )
            llm_used = True
            logger.info("Scene query generation via LLM succeeded: prefix=%s", args.prefix)
        except Exception as exc:
            logger.warning("Scene query LLM failed. Falling back to deterministic queries: %s", exc)

    for scene in scenes:
        scene_id = int(scene["id"])
        chosen = query_by_scene_id.get(scene_id)
        if chosen:
            scene["query"] = chosen["query"]
            scene["queryIntent"] = chosen.get("intent") or ""
            scene["querySource"] = "llm"
        else:
            scene["query"] = fallback_query(scene)
            scene["queryIntent"] = ""
            scene["querySource"] = "fallback"

    output_path = args.output or (ROOT_DIR / "podcast" / date / lang / "shorts-pexels-demo" / "scenes.json")
    if not output_path.is_absolute():
        output_path = (ROOT_DIR / output_path).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "date": date,
        "lang": lang,
        "title": title,
        "durationSeconds": duration_seconds,
        "sourceSubdir": args.source_subdir,
        "sourceKind": source_kind,
        "llmUsed": llm_used,
        "scenes": scenes,
    }

    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    logger.info("Generated scene plan: %s", output_path)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Failed to generate scene plan: {exc}", file=sys.stderr)
        raise SystemExit(1)
