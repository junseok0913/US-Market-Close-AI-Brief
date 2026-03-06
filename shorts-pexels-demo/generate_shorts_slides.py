"""Fetch Pexels images for scene plan and build render payload.

Input:
- podcast/{date}/{lang}/shorts-pexels-demo/scenes.json

Output:
- podcast/{date}/{lang}/shorts-pexels-demo/slides.render.json
- podcast/{date}/{lang}/shorts-pexels-demo/image_manifest.json
- podcast/{date}/{lang}/shorts-pexels-demo/images/*
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
from pathlib import Path
from typing import Any

import requests
import yaml
from dotenv import load_dotenv
from PIL import Image

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


def load_yaml(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(path)
    payload = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid YAML: {path}")
    return payload


def load_json(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid JSON object: {path}")
    return payload


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


def pexels_search(query: str, *, api_key: str, cfg: dict[str, Any]) -> list[dict[str, Any]]:
    pexels_cfg = cfg.get("pexels") if isinstance(cfg.get("pexels"), dict) else {}
    base_url = str(pexels_cfg.get("base_url") or "https://api.pexels.com/v1/search")
    orientation = str(pexels_cfg.get("orientation") or "portrait")
    size = str(pexels_cfg.get("size") or "large")
    per_page = int(pexels_cfg.get("per_page") or 12)
    timeout_seconds = float(pexels_cfg.get("timeout_seconds") or 25)

    response = requests.get(
        base_url,
        headers={"Authorization": api_key},
        params={
            "query": query,
            "orientation": orientation,
            "size": size,
            "per_page": max(1, min(80, per_page)),
        },
        timeout=timeout_seconds,
    )
    response.raise_for_status()
    payload = response.json()
    photos = payload.get("photos")
    if not isinstance(photos, list):
        return []

    out: list[dict[str, Any]] = []
    for photo in photos:
        if not isinstance(photo, dict):
            continue
        src = photo.get("src") if isinstance(photo.get("src"), dict) else {}
        image_url = (
            compact_text(src.get("portrait"))
            or compact_text(src.get("large2x"))
            or compact_text(src.get("large"))
            or compact_text(src.get("original"))
        )
        if not image_url:
            continue
        out.append(
            {
                "id": photo.get("id"),
                "alt": compact_text(photo.get("alt"), max_len=180),
                "photographer": compact_text(photo.get("photographer"), max_len=80),
                "photographer_url": compact_text(photo.get("photographer_url"), max_len=200),
                "source_page": compact_text(photo.get("url"), max_len=200),
                "image_url": image_url,
                "width": photo.get("width"),
                "height": photo.get("height"),
            }
        )
    return out


def choose_candidate_with_llm(
    *,
    llm: Any,
    config: dict[str, Any],
    scene: dict[str, Any],
    candidates: list[dict[str, Any]],
) -> tuple[int | None, float | None, str]:
    prompt_cfg = config.get("ranking_prompt")
    if not isinstance(prompt_cfg, dict):
        raise ValueError("Config missing ranking_prompt block")

    system_prompt = compact_text(prompt_cfg.get("system"))
    user_template = str(prompt_cfg.get("user_template") or "").strip()
    if not system_prompt or not user_template:
        raise ValueError("ranking_prompt requires system and user_template")

    scene_stub = {
        "scene_id": scene.get("id"),
        "phase": scene.get("phase"),
        "headline": scene.get("headline"),
        "body": scene.get("body"),
        "tickers": scene.get("tickers") or [],
        "query": scene.get("query") or "",
    }
    candidate_stub = [
        {
            "id": c.get("id"),
            "alt": c.get("alt") or "",
            "photographer": c.get("photographer") or "",
            "width": c.get("width"),
            "height": c.get("height"),
        }
        for c in candidates
    ]

    user_prompt = user_template.format(
        scene_json=json.dumps(scene_stub, ensure_ascii=False, indent=2),
        candidates_json=json.dumps(candidate_stub, ensure_ascii=False, indent=2),
    )

    response = llm.invoke(f"{system_prompt}\n\n{user_prompt}")
    payload = extract_json_object(response_to_text(response.content))

    selected_id = payload.get("selected_id")
    score_raw = payload.get("score")
    reason = compact_text(payload.get("reason"), max_len=180)

    selected = selected_id if isinstance(selected_id, int) else None
    if isinstance(score_raw, (int, float)):
        score = float(max(0.0, min(1.0, score_raw)))
    else:
        score = None
    return selected, score, reason


def download_image(url: str, output_path: Path, *, timeout_seconds: float) -> None:
    response = requests.get(url, timeout=timeout_seconds)
    response.raise_for_status()
    output_path.write_bytes(response.content)


def make_placeholder(output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGB", (1080, 1920), (20, 24, 36))
    image.save(output_path, format="JPEG", quality=90)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Fetch Pexels images for shorts-pexels-demo")
    parser.add_argument("date", help="Date in YYYYMMDD or YYYY-MM-DD")
    parser.add_argument("--lang", default="ko", choices=["ko", "en"])
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG_PATH)
    parser.add_argument("--scene-plan", type=Path, help="Input scenes.json path")
    parser.add_argument("--output", type=Path, help="Output slides.render.json path")
    parser.add_argument("--manifest", type=Path, help="Output image_manifest.json path")
    parser.add_argument("--images-dir", type=Path, help="Directory to save downloaded images")
    parser.add_argument("--prefix", default="PEXELS_RANKER", help="LLM env prefix for image ranking")
    parser.add_argument("--no-llm-ranker", action="store_true", help="Select first candidate without LLM ranking")
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

    pexels_api_key = compact_text(os.getenv("PEXELS_API_KEY"))
    if not pexels_api_key:
        raise EnvironmentError("PEXELS_API_KEY is required")

    base_dir = ROOT_DIR / "podcast" / date / lang / "shorts-pexels-demo"
    scene_plan_path = args.scene_plan or (base_dir / "scenes.json")
    if not scene_plan_path.is_absolute():
        scene_plan_path = (ROOT_DIR / scene_plan_path).resolve()

    output_path = args.output or (base_dir / "slides.render.json")
    if not output_path.is_absolute():
        output_path = (ROOT_DIR / output_path).resolve()

    manifest_path = args.manifest or (base_dir / "image_manifest.json")
    if not manifest_path.is_absolute():
        manifest_path = (ROOT_DIR / manifest_path).resolve()

    images_dir = args.images_dir or (base_dir / "images")
    if not images_dir.is_absolute():
        images_dir = (ROOT_DIR / images_dir).resolve()

    payload = load_json(scene_plan_path)
    scenes = payload.get("scenes")
    if not isinstance(scenes, list) or not scenes:
        raise ValueError(f"No scenes[] in: {scene_plan_path}")

    pexels_cfg = config.get("pexels") if isinstance(config.get("pexels"), dict) else {}
    max_candidates = int(pexels_cfg.get("max_candidates") or 6)
    timeout_seconds = float(pexels_cfg.get("timeout_seconds") or 25)
    fallback_suffix = compact_text(pexels_cfg.get("fallback_query_suffix")) or "vertical cinematic photo"

    ranker = None
    if not args.no_llm_ranker:
        try:
            ranker = build_llm(prefix=args.prefix, logger=logger)
        except Exception as exc:
            logger.warning("Image ranker LLM init failed. Falling back to first-candidate policy: %s", exc)

    images_dir.mkdir(parents=True, exist_ok=True)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

    slides: list[dict[str, Any]] = []
    captions: list[dict[str, Any]] = []
    manifest_entries: list[dict[str, Any]] = []

    total_duration = float(payload.get("durationSeconds") or 0.0)

    for raw_scene in scenes:
        if not isinstance(raw_scene, dict):
            continue
        scene_id = int(raw_scene.get("id") or 0)
        start_sec = float(raw_scene.get("startSec") or 0.0)
        end_sec = float(raw_scene.get("endSec") or start_sec)
        if end_sec < start_sec:
            end_sec = start_sec

        query = compact_text(raw_scene.get("query"), max_len=120)
        if not query:
            query = compact_text(raw_scene.get("headline"), max_len=100)

        candidates = pexels_search(query, api_key=pexels_api_key, cfg=config)
        if not candidates:
            fallback_query = compact_text(f"{query} {fallback_suffix}", max_len=140)
            candidates = pexels_search(fallback_query, api_key=pexels_api_key, cfg=config)
            if candidates:
                query = fallback_query

        candidates = candidates[: max(1, max_candidates)]
        selected: dict[str, Any] | None = None
        score: float | None = None
        reason = ""

        if candidates:
            if ranker is not None:
                try:
                    selected_id, score, reason = choose_candidate_with_llm(
                        llm=ranker,
                        config=config,
                        scene=raw_scene,
                        candidates=candidates,
                    )
                    selected = next((c for c in candidates if c.get("id") == selected_id), None)
                except Exception as exc:
                    logger.warning("Ranker failed for scene %s. Using first candidate: %s", scene_id, exc)
            if selected is None:
                selected = candidates[0]
                if score is None:
                    score = 0.5
                if not reason:
                    reason = "first candidate fallback"

        image_filename = f"scene_{scene_id:02d}.jpg"
        image_path = images_dir / image_filename

        provider = "pexels"
        selected_id = None
        selected_url = ""
        source_page = ""
        photographer = ""
        photographer_url = ""

        if selected is not None:
            selected_id = selected.get("id")
            selected_url = compact_text(selected.get("image_url"), max_len=500)
            source_page = compact_text(selected.get("source_page"), max_len=500)
            photographer = compact_text(selected.get("photographer"), max_len=120)
            photographer_url = compact_text(selected.get("photographer_url"), max_len=500)

            try:
                download_image(selected_url, image_path, timeout_seconds=timeout_seconds)
            except Exception as exc:
                logger.warning("Image download failed for scene %s. Using placeholder: %s", scene_id, exc)
                make_placeholder(image_path)
                provider = "placeholder"
        else:
            make_placeholder(image_path)
            provider = "placeholder"
            if score is None:
                score = 0.0
            if not reason:
                reason = "no candidates"

        relative_image_path = image_path.relative_to(output_path.parent).as_posix()

        slide = {
            "id": scene_id,
            "phase": compact_text(raw_scene.get("phase")) or "insight",
            "theme": compact_text(raw_scene.get("theme")) or "neutral",
            "startSec": round(start_sec, 3),
            "endSec": round(end_sec, 3),
            "eyebrow": compact_text(raw_scene.get("phase"), max_len=24),
            "headline": compact_text(raw_scene.get("headline"), max_len=110),
            "subheadline": compact_text(raw_scene.get("body"), max_len=140),
            "body": compact_text(raw_scene.get("body"), max_len=240),
            "bullets": [compact_text(raw_scene.get("body"), max_len=60)] if compact_text(raw_scene.get("body")) else [],
            "tickers": [compact_text(v) for v in (raw_scene.get("tickers") or []) if compact_text(v)],
            "highlights": [compact_text(v) for v in (raw_scene.get("highlights") or []) if compact_text(v)],
            "query": query,
            "imagePath": relative_image_path,
            "image": {
                "provider": provider,
                "pexelsId": selected_id,
                "url": selected_url,
                "sourcePage": source_page,
                "photographer": photographer,
                "photographerUrl": photographer_url,
                "score": score,
                "reason": reason,
            },
        }
        slides.append(slide)

        captions.append(
            {
                "id": scene_id,
                "startSec": round(start_sec, 3),
                "endSec": round(end_sec, 3),
                "text": compact_text(raw_scene.get("body") or raw_scene.get("headline"), max_len=180),
            }
        )

        manifest_entries.append(
            {
                "sceneId": scene_id,
                "query": query,
                "imagePath": relative_image_path,
                "provider": provider,
                "pexels": {
                    "id": selected_id,
                    "url": selected_url,
                    "sourcePage": source_page,
                    "photographer": photographer,
                    "photographerUrl": photographer_url,
                },
                "ranking": {
                    "score": score,
                    "reason": reason,
                },
                "candidates": candidates,
            }
        )

        total_duration = max(total_duration, end_sec)
        logger.info("Scene %s image prepared: %s", scene_id, image_path)

    if slides:
        slides.sort(key=lambda row: (float(row.get("startSec") or 0.0), int(row.get("id") or 0)))
        captions.sort(key=lambda row: (float(row.get("startSec") or 0.0), int(row.get("id") or 0)))

    render_payload = {
        "date": date,
        "lang": lang,
        "title": compact_text(payload.get("title")) or "US Market Close",
        "hook": compact_text(slides[0].get("body")) if slides else "",
        "durationSeconds": round(total_duration, 3),
        "audioFile": f"shorts{date}.mp3",
        "slides": slides,
        "captions": captions,
        "sourceDigest": [
            {
                "type": "image_search",
                "label": "Pexels",
                "detail": "free stock photos",
            }
        ],
        "meta": {
            "sceneCount": len(slides),
            "imageProvider": "pexels",
            "modelHint": compact_text((config.get("meta") or {}).get("model_hint")) if isinstance(config.get("meta"), dict) else "",
        },
    }

    output_path.write_text(json.dumps(render_payload, ensure_ascii=False, indent=2), encoding="utf-8")
    manifest_path.write_text(json.dumps(manifest_entries, ensure_ascii=False, indent=2), encoding="utf-8")

    logger.info("Generated render payload: %s", output_path)
    logger.info("Generated image manifest: %s", manifest_path)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Failed to generate Pexels shorts slides: {exc}", file=sys.stderr)
        raise SystemExit(1)
