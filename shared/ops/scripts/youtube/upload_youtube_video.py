#!/usr/bin/env python3
"""
Upload rendered MP4 to YouTube using OAuth Desktop flow.

Usage:
    uv run python shared/ops/scripts/youtube/upload_youtube_video.py --file <mp4> --date YYYYMMDD --lang ko
"""

from __future__ import annotations

import argparse
import json
import logging
import mimetypes
import os
import re
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

ROOT_DIR = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT_DIR))

from shared.yaml_config import load_env_from_yaml

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

FIXED_DESCRIPTION_HASHTAGS = [
    "미국주식",
    "주식",
    "주식요약",
    "미장",
    "장마감브리핑",
]

CHAPTER_ORDER = ("opening", "theme", "ticker", "closing")
CHAPTER_LABELS: dict[str, dict[str, str]] = {
    "ko": {
        "opening": "오프닝",
        "theme": "핵심 테마",
        "ticker": "종목 포커스",
        "closing": "마무리",
    },
    "en": {
        "opening": "Opening",
        "theme": "Market Themes",
        "ticker": "Ticker Focus",
        "closing": "Closing",
    },
}


def parse_date_arg(date_str: str) -> str:
    date_str = date_str.replace("-", "")
    if len(date_str) != 8 or not date_str.isdigit():
        raise ValueError(f"Invalid date format: {date_str}. Expected YYYYMMDD or YYYY-MM-DD")
    return date_str


def _dedupe_keep_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        normalized = item.strip()
        if not normalized:
            continue
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(normalized)
    return result


def _parse_positive_int_env(env_name: str, default: int) -> int:
    raw_value = os.getenv(env_name, "").strip()
    if not raw_value:
        return default
    if raw_value.isdigit() and int(raw_value) > 0:
        return int(raw_value)
    logger.warning("%s must be a positive integer. Using default=%s", env_name, default)
    return default


def _parse_int(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float) and value.is_integer():
        return int(value)
    if isinstance(value, str):
        raw = value.strip()
        if raw.startswith("-"):
            body = raw[1:]
            if body.isdigit():
                return int(raw)
            return None
        if raw.isdigit():
            return int(raw)
    return None


def _format_seconds_to_timestamp(total_seconds: int) -> str:
    total_seconds = max(0, total_seconds)
    hours, rem = divmod(total_seconds, 3600)
    minutes, seconds = divmod(rem, 60)
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    return f"{minutes:02d}:{seconds:02d}"


def _parse_timestamp_text_to_seconds(value: str) -> int | None:
    parts = [part.strip() for part in value.split(":")]
    if len(parts) not in (2, 3):
        return None
    if any(not part.isdigit() for part in parts):
        return None
    numbers = [int(part) for part in parts]
    if len(numbers) == 2:
        minutes, seconds = numbers
        return minutes * 60 + seconds
    hours, minutes, seconds = numbers
    return hours * 3600 + minutes * 60 + seconds


def _normalize_tag_to_hashtag(tag: str) -> str:
    normalized = tag.strip().lstrip("#")
    # Keep letters/numbers/underscore and Korean characters, remove separators.
    normalized = re.sub(r"[^0-9A-Za-z_가-힣ㄱ-ㅎㅏ-ㅣ]+", "", normalized)
    if not normalized:
        return ""
    return f"#{normalized}"


def _build_description_hashtags(tags: list[str]) -> list[str]:
    max_dynamic_hashtags = _parse_positive_int_env(
        "YOUTUBE_DESCRIPTION_DYNAMIC_HASHTAG_LIMIT",
        _parse_positive_int_env("YOUTUBE_DESCRIPTION_HASHTAG_LIMIT", 3),
    )
    hashtags: list[str] = []
    seen: set[str] = set()

    for tag in FIXED_DESCRIPTION_HASHTAGS:
        hashtag = _normalize_tag_to_hashtag(tag)
        if not hashtag:
            continue
        key = hashtag.lower()
        if key in seen:
            continue
        seen.add(key)
        hashtags.append(hashtag)

    dynamic_count = 0
    for tag in tags:
        hashtag = _normalize_tag_to_hashtag(tag)
        if not hashtag:
            continue
        key = hashtag.lower()
        if key in seen:
            continue
        seen.add(key)
        hashtags.append(hashtag)
        dynamic_count += 1
        if dynamic_count >= max_dynamic_hashtags:
            break
    return hashtags


def _build_chapter_lines_from_metadata(metadata: dict[str, Any]) -> list[str]:
    raw_chapters = metadata.get("youtube_chapters")
    if not isinstance(raw_chapters, list):
        return []

    lines: list[str] = []
    for item in raw_chapters:
        if not isinstance(item, dict):
            continue
        label = str(item.get("title") or item.get("label") or "").strip()
        if not label:
            continue

        start_seconds = _parse_int(item.get("start_seconds"))
        if start_seconds is not None and start_seconds >= 0:
            start_text = _format_seconds_to_timestamp(start_seconds)
        else:
            start_text = str(item.get("start") or item.get("time") or "").strip()
            if start_text:
                parsed_seconds = _parse_timestamp_text_to_seconds(start_text)
                if parsed_seconds is None:
                    continue
                start_text = _format_seconds_to_timestamp(parsed_seconds)
        if not start_text:
            continue
        lines.append(f"{start_text} {label}")
    return lines


def _build_chapter_lines_from_episode_json(episode_json: dict[str, Any], lang: str) -> list[str]:
    raw_scripts = episode_json.get("scripts")
    raw_chapters = episode_json.get("chapter")
    if not isinstance(raw_scripts, list) or not isinstance(raw_chapters, list):
        return []

    start_ms_by_id: dict[int, int] = {}
    for item in raw_scripts:
        if not isinstance(item, dict):
            continue
        script_id = _parse_int(item.get("id"))
        raw_time = item.get("time")
        if script_id is None or script_id < 0 or not isinstance(raw_time, list) or not raw_time:
            continue
        start_ms = _parse_int(raw_time[0])
        if start_ms is None or start_ms < 0:
            continue
        start_ms_by_id[script_id] = start_ms

    if not start_ms_by_id:
        return []

    chapter_ranges: dict[str, tuple[int, int]] = {}
    for chapter in raw_chapters:
        if not isinstance(chapter, dict):
            continue
        name = str(chapter.get("name") or "").strip().lower()
        if name not in CHAPTER_ORDER:
            continue
        start_id = _parse_int(chapter.get("start_id"))
        end_id = _parse_int(chapter.get("end_id"))
        if start_id is None or end_id is None or start_id < 0 or end_id < start_id:
            continue
        chapter_ranges[name] = (start_id, end_id)

    labels = CHAPTER_LABELS.get(lang, CHAPTER_LABELS["en"])
    lines: list[str] = []
    for chapter_name in CHAPTER_ORDER:
        chapter_range = chapter_ranges.get(chapter_name)
        if not chapter_range:
            continue
        start_id, end_id = chapter_range
        chapter_start_ms: int | None = None
        for script_id in range(start_id, end_id + 1):
            if script_id in start_ms_by_id:
                chapter_start_ms = start_ms_by_id[script_id]
                break
        if chapter_start_ms is None:
            continue
        start_text = _format_seconds_to_timestamp(chapter_start_ms // 1000)
        lines.append(f"{start_text} {labels.get(chapter_name, chapter_name)}")
    return lines


def _build_chapter_lines(metadata: dict[str, Any], episode_json: dict[str, Any], lang: str) -> list[str]:
    manual_lines = _build_chapter_lines_from_metadata(metadata)
    if manual_lines:
        return manual_lines
    return _build_chapter_lines_from_episode_json(episode_json, lang)


def _prepend_hashtags_to_description(description: str, tags: list[str], chapter_lines: list[str]) -> str:
    hashtags = _build_description_hashtags(tags)
    blocks: list[str] = []
    if hashtags:
        blocks.append(" ".join(hashtags))
    if chapter_lines:
        blocks.append("\n".join(chapter_lines))
    clean_description = description.strip()
    if clean_description:
        blocks.append(clean_description)
    return "\n\n".join(blocks).strip()


def _is_shorts_upload(file_path: Path) -> bool:
    path_text = str(file_path).lower()
    return "/shorts/" in path_text or "_shorts" in file_path.name.lower()


def load_upload_metadata(date_yyyymmdd: str, lang: str) -> dict[str, Any]:
    episode_dir = ROOT_DIR / "podcast" / date_yyyymmdd / lang
    metadata_path = episode_dir / "metadata.json"
    episode_json_path = episode_dir / f"{date_yyyymmdd}.json"

    metadata: dict[str, Any] = {}
    episode_json: dict[str, Any] = {}

    if metadata_path.exists():
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        logger.info("Loaded metadata: %s", metadata_path)
    else:
        logger.warning("metadata.json not found, fallback will be used: %s", metadata_path)

    if episode_json_path.exists():
        episode_json = json.loads(episode_json_path.read_text(encoding="utf-8"))
    else:
        logger.warning("%s not found, fallback title/description may be generic.", episode_json_path.name)

    default_title = f"{date_yyyymmdd} US Market Close Briefing ({lang.upper()})"
    default_desc = "AI-generated market close briefing."

    nutshell = str(episode_json.get("nutshell", "")).strip()
    title = str(metadata.get("title") or nutshell or default_title).strip()
    description = str(metadata.get("description") or nutshell or default_desc).strip()

    keyword_raw = str(metadata.get("keywords", "")).strip()
    metadata_tags = [tag.strip() for tag in keyword_raw.split(",") if tag.strip()]

    env_tags_raw = os.getenv("YOUTUBE_DEFAULT_TAGS", "")
    env_tags = [tag.strip() for tag in env_tags_raw.split(",") if tag.strip()]

    tags = _dedupe_keep_order(FIXED_DESCRIPTION_HASHTAGS + metadata_tags + env_tags)
    chapter_lines = _build_chapter_lines(metadata, episode_json, lang)

    if len(title) > 100:
        logger.warning("Title longer than 100 chars; truncating.")
        title = title[:100]

    if len(description) > 5000:
        logger.warning("Description longer than 5000 chars; truncating.")
        description = description[:5000]

    return {
        "title": title,
        "description": description,
        "tags": tags,
        "chapter_lines": chapter_lines,
    }


def load_credentials(client_secrets_file: Path, token_file: Path) -> Credentials:
    creds: Credentials | None = None

    if token_file.exists():
        creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)

    if creds and creds.valid:
        return creds

    if creds and creds.expired and creds.refresh_token:
        logger.info("Refreshing YouTube OAuth token...")
        creds.refresh(Request())
    else:
        logger.info("Starting OAuth browser flow for YouTube upload...")
        flow = InstalledAppFlow.from_client_secrets_file(str(client_secrets_file), SCOPES)
        creds = flow.run_local_server(port=0)

    token_file.parent.mkdir(parents=True, exist_ok=True)
    token_file.write_text(creds.to_json(), encoding="utf-8")
    logger.info("Saved OAuth token: %s", token_file)
    return creds


def upload_video(
    file_path: Path,
    title: str,
    description: str,
    tags: list[str],
    privacy: str,
    category_id: str,
    credentials: Credentials,
    thumbnail_file: Path | None = None,
) -> str:
    youtube = build("youtube", "v3", credentials=credentials)

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": category_id,
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(str(file_path), chunksize=-1, resumable=True, mimetype="video/mp4")
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

    logger.info("Uploading video to YouTube...")
    response: dict[str, Any] | None = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            logger.info("Upload progress: %.1f%%", status.progress() * 100)

    video_id = response["id"]
    logger.info("Upload complete. videoId=%s", video_id)

    if thumbnail_file:
        mime_type, _ = mimetypes.guess_type(thumbnail_file.name)
        thumbnail_mime = mime_type or "image/png"
        logger.info("Setting video thumbnail: %s", thumbnail_file)
        youtube.thumbnails().set(
            videoId=video_id,
            media_body=MediaFileUpload(str(thumbnail_file), mimetype=thumbnail_mime, resumable=False),
        ).execute()
        logger.info("Thumbnail set successfully.")

    return video_id


def main(argv: list[str] | None = None) -> int:
    # Load env before parser defaults so --client-secrets/--token-file can
    # inherit values from app.yaml/.env automatically.
    load_env_from_yaml(logger=logger)
    load_dotenv(ROOT_DIR / ".env", override=False)

    env_client_secrets = os.getenv("YOUTUBE_CLIENT_SECRETS_FILE")
    if env_client_secrets:
        client_secrets_default = Path(env_client_secrets)
    else:
        client_secrets_default = ROOT_DIR / "shared" / "runtime" / "secrets" / "youtube" / "client_secret.json"
        legacy_client_secrets = ROOT_DIR / "secrets" / "youtube" / "client_secret.json"
        if not client_secrets_default.exists() and legacy_client_secrets.exists():
            client_secrets_default = legacy_client_secrets

    parser = argparse.ArgumentParser(description="Upload local MP4 to YouTube")
    parser.add_argument("--file", required=True, type=Path, help="Path to local MP4 file")
    parser.add_argument("--thumbnail", type=Path, default=None, help="Optional thumbnail PNG/JPG path")
    parser.add_argument("--date", required=True, type=str, help="Episode date (YYYYMMDD)")
    parser.add_argument("--lang", type=str, default="ko", choices=["ko", "en"], help="Language")
    parser.add_argument(
        "--privacy",
        type=str,
        default=os.getenv("YOUTUBE_PRIVACY_STATUS", "private"),
        choices=["private", "unlisted", "public"],
        help="YouTube privacy status",
    )
    parser.add_argument(
        "--client-secrets",
        type=Path,
        default=client_secrets_default,
        help="OAuth client secrets JSON path",
    )
    parser.add_argument(
        "--token-file",
        type=Path,
        default=Path(
            os.getenv(
                "YOUTUBE_TOKEN_FILE",
                ROOT_DIR / "shared" / "runtime" / "cache" / "youtube" / "token.json",
            )
        ),
        help="OAuth token cache path",
    )
    parser.add_argument(
        "--category-id",
        type=str,
        default=os.getenv("YOUTUBE_CATEGORY_ID", "25"),
        help="YouTube category id",
    )
    parser.add_argument("--debug", action="store_true", help="Enable debug logging")
    args = parser.parse_args(argv)

    if args.debug:
        logger.setLevel(logging.DEBUG)

    try:
        date_yyyymmdd = parse_date_arg(args.date)
    except ValueError as exc:
        logger.error("Date parsing failed: %s", exc)
        return 2

    file_path = args.file.resolve()
    if not file_path.exists():
        logger.error("MP4 file not found: %s", file_path)
        return 2

    thumbnail_path: Path | None = None
    if args.thumbnail:
        thumbnail_path = args.thumbnail.resolve()
        if not thumbnail_path.exists():
            logger.error("Thumbnail file not found: %s", thumbnail_path)
            return 2

    if not args.client_secrets.exists():
        logger.error(
            "YouTube OAuth client secrets file not found: %s. Set YOUTUBE_CLIENT_SECRETS_FILE or pass --client-secrets.",
            args.client_secrets,
        )
        return 2

    try:
        metadata = load_upload_metadata(date_yyyymmdd, args.lang)
        is_shorts = _is_shorts_upload(file_path)
        if is_shorts:
            metadata["tags"] = _dedupe_keep_order([*metadata["tags"], "shorts"])
            chapter_lines: list[str] = []
        else:
            chapter_lines = list(metadata.get("chapter_lines", []))
            if chapter_lines:
                logger.info("Detected chapter timestamps for description: %s", " | ".join(chapter_lines))
            else:
                logger.warning("No chapter timestamps detected. Upload description will omit chapter lines.")
        metadata["description"] = _prepend_hashtags_to_description(
            str(metadata["description"]),
            list(metadata["tags"]),
            chapter_lines,
        )
        if len(metadata["description"]) > 5000:
            logger.warning("Description longer than 5000 chars after hashtag prefix; truncating.")
            metadata["description"] = metadata["description"][:5000]

        creds = load_credentials(args.client_secrets, args.token_file)
        video_id = upload_video(
            file_path=file_path,
            title=metadata["title"],
            description=metadata["description"],
            tags=metadata["tags"],
            privacy=args.privacy,
            category_id=args.category_id,
            credentials=creds,
            thumbnail_file=thumbnail_path,
        )
        watch_url = f"https://www.youtube.com/watch?v={video_id}"
        logger.info("Watch URL: %s", watch_url)
        return 0
    except Exception as exc:
        logger.error("YouTube upload failed: %s", exc, exc_info=args.debug)
        return 1


if __name__ == "__main__":
    sys.exit(main())
