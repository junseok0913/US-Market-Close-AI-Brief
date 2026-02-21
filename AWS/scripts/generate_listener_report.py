#!/usr/bin/env python3
"""
Generate weekly listener analytics from CloudFront Standard Logs.

Outputs:
  - Markdown report: feedback/reports/weekly_listener_report_{from}_{to}.md
  - Daily CSV: feedback/reports/data/listener_daily_{from}_{to}.csv
  - Summary JSON: feedback/reports/data/listener_summary_{from}_{to}.json (when --write-json)
"""

from __future__ import annotations

import argparse
import csv
import gzip
import hashlib
import io
import json
import os
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib.parse import unquote
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import boto3
import botocore.exceptions
import yaml
from dotenv import load_dotenv

load_dotenv()

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_RULES_PATH = REPO_ROOT / "shared" / "ops" / "config" / "podcast" / "podcast_platform_rules.yaml"
LEGACY_RULES_PATH = REPO_ROOT / "config" / "podcast_platform_rules.yaml"
if not DEFAULT_RULES_PATH.exists() and LEGACY_RULES_PATH.exists():
    DEFAULT_RULES_PATH = LEGACY_RULES_PATH

MAIN_AUDIO_RE = re.compile(r"^/(?P<ymd>\d{8})/(?P<lang>ko|en)/(?P<filename>\d{8}\.mp3)$")
SHORTS_AUDIO_RE = re.compile(r"^/(?P<ymd>\d{8})/ko/shorts/shorts(?P<short_ymd>\d{8})\.mp3$")
KEY_DATE_RE = re.compile(r"(?P<date>\d{4}-\d{2}-\d{2})")

SUCCESS_STATUSES = {"200", "206"}
PLATFORM_ORDER = ("apple", "spotify", "amazon", "unknown")


@dataclass
class RuleSet:
    platform_patterns: list[tuple[str, list[re.Pattern[str]]]]
    bot_patterns: list[re.Pattern[str]]


@dataclass
class DayStats:
    audio_requests: int = 0
    successful_listens: int = 0
    error_requests: int = 0
    shorts_listens: int = 0
    platform_listens: Counter[str] = field(default_factory=Counter)
    language_listens: Counter[str] = field(default_factory=Counter)
    episode_listens: Counter[str] = field(default_factory=Counter)
    unique_fingerprints: set[str] = field(default_factory=set)

    def unique_estimate(self) -> int:
        return len(self.unique_fingerprints)


@dataclass
class AggregateStats:
    total_audio_requests: int
    total_listens: int
    total_errors: int
    shorts_listens: int
    platform_listens: Counter[str]
    language_listens: Counter[str]
    episode_listens: Counter[str]
    daily_unique_estimate: int

    @property
    def error_rate(self) -> float:
        if self.total_audio_requests == 0:
            return 0.0
        return (self.total_errors / self.total_audio_requests) * 100.0

    @property
    def unknown_ratio(self) -> float:
        if self.total_listens == 0:
            return 0.0
        return (self.platform_listens.get("unknown", 0) / self.total_listens) * 100.0


@dataclass
class ProcessingContext:
    warnings: list[str] = field(default_factory=list)
    scanned_log_objects: int = 0
    parsed_rows: int = 0
    malformed_rows: int = 0
    skipped_non_audio_rows: int = 0
    skipped_bot_rows: int = 0
    skipped_host_rows: int = 0
    object_read_failures: int = 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate weekly listener analytics report.")
    parser.add_argument("--from", dest="date_from", required=True, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--to", dest="date_to", required=True, help="End date (YYYY-MM-DD)")
    parser.add_argument("--tz", default="US/Eastern", help="Report timezone (default: US/Eastern)")
    parser.add_argument("--output-dir", default="feedback/reports", help="Output directory")
    parser.add_argument("--rules-file", default=str(DEFAULT_RULES_PATH), help="Rules YAML path")
    parser.add_argument("--include-shorts", action="store_true", help="Include shorts mp3 pattern")
    parser.add_argument("--write-json", action="store_true", help="Write JSON summary output")
    parser.add_argument("--log-bucket", default=os.getenv("CLOUDFRONT_LOG_BUCKET"), help="CloudFront log S3 bucket")
    parser.add_argument(
        "--log-prefix",
        default=os.getenv("CLOUDFRONT_LOG_PREFIX", "cloudfront/podcast/"),
        help="CloudFront log S3 prefix",
    )
    parser.add_argument(
        "--cloudfront-domain",
        default=os.getenv("CLOUDFRONT_DOMAIN"),
        help="CloudFront domain filter (optional)",
    )
    return parser.parse_args()


def parse_date_or_exit(value: str, flag_name: str) -> date:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise SystemExit(f"{flag_name} must be YYYY-MM-DD (got: {value})") from exc


def parse_log_datetime(date_text: str, time_text: str) -> datetime:
    event_date = datetime.strptime(date_text, "%Y-%m-%d").date()
    event_time = time.fromisoformat(time_text)
    return datetime.combine(event_date, event_time, tzinfo=timezone.utc)


def compile_regex_list(raw_values: Any, label: str) -> list[re.Pattern[str]]:
    if not isinstance(raw_values, list):
        raise ValueError(f"{label} must be a list")
    compiled: list[re.Pattern[str]] = []
    for pattern in raw_values:
        if not isinstance(pattern, str):
            raise ValueError(f"{label} contains non-string pattern: {pattern!r}")
        compiled.append(re.compile(pattern, re.IGNORECASE))
    return compiled


def load_rules(path: Path) -> RuleSet:
    if not path.exists():
        raise SystemExit(f"Rules file not found: {path}")

    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    if not isinstance(data, dict):
        raise SystemExit(f"Rules file must contain a YAML object: {path}")

    raw_platform = data.get("platform_patterns", {})
    raw_bots = data.get("bot_exclusion_patterns", [])
    if not isinstance(raw_platform, dict):
        raise SystemExit("`platform_patterns` must be a mapping")

    platform_patterns: list[tuple[str, list[re.Pattern[str]]]] = []
    for platform in ("spotify", "apple", "amazon"):
        patterns = raw_platform.get(platform, [])
        compiled = compile_regex_list(patterns, f"platform_patterns.{platform}")
        platform_patterns.append((platform, compiled))

    bot_patterns = compile_regex_list(raw_bots, "bot_exclusion_patterns")
    return RuleSet(platform_patterns=platform_patterns, bot_patterns=bot_patterns)


def get_s3_client() -> Any:
    return boto3.client(
        "s3",
        aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
        region_name=os.environ.get("AWS_REGION"),
    )


def extract_value(row: dict[str, str], keys: tuple[str, ...]) -> str:
    for key in keys:
        value = row.get(key)
        if value is not None:
            return value
    return ""


def hash_listener(ip: str, user_agent: str) -> str:
    payload = f"{ip}|{user_agent}".encode("utf-8", errors="ignore")
    return hashlib.sha256(payload).hexdigest()


def classify_platform(user_agent: str, rules: RuleSet) -> str:
    for platform, patterns in rules.platform_patterns:
        if any(pattern.search(user_agent) for pattern in patterns):
            return platform
    return "unknown"


def is_bot(user_agent: str, rules: RuleSet) -> bool:
    return any(pattern.search(user_agent) for pattern in rules.bot_patterns)


def normalize_user_agent(raw_ua: str) -> str:
    if not raw_ua or raw_ua == "-":
        return "unknown"
    return unquote(raw_ua)


def parse_audio_path(uri_stem: str, include_shorts: bool) -> tuple[str, str, bool] | None:
    """
    Return (episode_key, language, is_shorts) for supported audio paths.
    """
    match_main = MAIN_AUDIO_RE.match(uri_stem)
    if match_main:
        ymd = match_main.group("ymd")
        lang = match_main.group("lang")
        return f"/{ymd}/{lang}/{ymd}.mp3", lang, False

    if include_shorts:
        match_shorts = SHORTS_AUDIO_RE.match(uri_stem)
        if match_shorts:
            ymd = match_shorts.group("ymd")
            short_ymd = match_shorts.group("short_ymd")
            return f"/{ymd}/ko/shorts/shorts{short_ymd}.mp3", "ko", True

    return None


def key_matches_date_window(key: str, dt_start: date, dt_end: date) -> bool:
    """
    Fast pre-filter by date in object key when possible.
    Includes one-day buffer for timezone conversion boundaries.
    """
    buffered_start = dt_start - timedelta(days=1)
    buffered_end = dt_end + timedelta(days=1)
    match = KEY_DATE_RE.search(key)
    if not match:
        return True
    try:
        key_date = datetime.strptime(match.group("date"), "%Y-%m-%d").date()
    except ValueError:
        return True
    return buffered_start <= key_date <= buffered_end


def list_cloudfront_log_keys(
    s3_client: Any,
    bucket: str,
    prefix: str,
    dt_start: date,
    dt_end: date,
    ctx: ProcessingContext,
) -> list[str]:
    keys: list[str] = []
    paginator = s3_client.get_paginator("list_objects_v2")

    try:
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
            for item in page.get("Contents", []):
                key = item.get("Key", "")
                if not key:
                    continue
                if not key_matches_date_window(key, dt_start, dt_end):
                    continue
                if not (key.endswith(".gz") or key.endswith(".log") or key.endswith(".txt")):
                    continue
                keys.append(key)
    except botocore.exceptions.BotoCoreError as exc:
        ctx.warnings.append(f"S3 로그 목록 조회 실패: {exc}")
    except botocore.exceptions.ClientError as exc:
        ctx.warnings.append(f"S3 로그 목록 조회 실패: {exc}")

    keys.sort()
    if not keys:
        ctx.warnings.append("지정 기간에 해당하는 CloudFront 로그 파일을 찾지 못했습니다.")
    return keys


def iter_log_lines(body_stream: Any, key: str) -> Any:
    if key.endswith(".gz"):
        gz = gzip.GzipFile(fileobj=body_stream)
        return io.TextIOWrapper(gz, encoding="utf-8", errors="replace")
    return io.TextIOWrapper(body_stream, encoding="utf-8", errors="replace")


def process_log_object(
    s3_client: Any,
    bucket: str,
    key: str,
    ctx: ProcessingContext,
    stats_by_day: dict[date, DayStats],
    rules: RuleSet,
    tzinfo: ZoneInfo,
    analysis_start: date,
    analysis_end: date,
    include_shorts: bool,
    cloudfront_domain: str | None,
) -> None:
    ctx.scanned_log_objects += 1
    try:
        response = s3_client.get_object(Bucket=bucket, Key=key)
    except botocore.exceptions.BotoCoreError as exc:
        ctx.object_read_failures += 1
        ctx.warnings.append(f"로그 파일 읽기 실패 ({key}): {exc}")
        return
    except botocore.exceptions.ClientError as exc:
        ctx.object_read_failures += 1
        ctx.warnings.append(f"로그 파일 읽기 실패 ({key}): {exc}")
        return

    fields: list[str] = []
    body = response["Body"]
    text_stream = iter_log_lines(body, key)

    try:
        for raw_line in text_stream:
            line = raw_line.strip()
            if not line:
                continue

            if line.startswith("#Fields:"):
                fields = line.replace("#Fields:", "", 1).strip().split()
                continue

            if line.startswith("#"):
                continue

            if not fields:
                ctx.malformed_rows += 1
                continue

            parts = line.split("\t")
            if len(parts) != len(fields):
                parts = line.split()
            if len(parts) != len(fields):
                ctx.malformed_rows += 1
                continue

            row = dict(zip(fields, parts))
            if cloudfront_domain:
                host = extract_value(row, ("cs(Host)", "cs-host"))
                if host and host != "-" and host != cloudfront_domain:
                    ctx.skipped_host_rows += 1
                    continue

            uri_stem = extract_value(row, ("cs-uri-stem",))
            parsed_path = parse_audio_path(uri_stem, include_shorts=include_shorts)
            if parsed_path is None:
                ctx.skipped_non_audio_rows += 1
                continue
            episode_key, lang, is_shorts = parsed_path

            status = extract_value(row, ("sc-status",))
            try:
                status_code = int(status)
            except (TypeError, ValueError):
                ctx.malformed_rows += 1
                continue

            date_text = extract_value(row, ("date",))
            time_text = extract_value(row, ("time",))
            try:
                event_utc = parse_log_datetime(date_text, time_text)
            except ValueError:
                ctx.malformed_rows += 1
                continue

            local_day = event_utc.astimezone(tzinfo).date()
            if local_day < analysis_start or local_day > analysis_end:
                continue

            user_agent = normalize_user_agent(extract_value(row, ("cs(User-Agent)", "cs-user-agent")))
            if is_bot(user_agent, rules):
                ctx.skipped_bot_rows += 1
                continue

            day_stats = stats_by_day[local_day]
            day_stats.audio_requests += 1

            if 400 <= status_code <= 599:
                day_stats.error_requests += 1

            if status in SUCCESS_STATUSES:
                platform = classify_platform(user_agent, rules)
                listener_hash = hash_listener(extract_value(row, ("c-ip",)), user_agent)

                day_stats.successful_listens += 1
                day_stats.platform_listens[platform] += 1
                day_stats.language_listens[lang] += 1
                day_stats.episode_listens[episode_key] += 1
                day_stats.unique_fingerprints.add(listener_hash)
                if is_shorts:
                    day_stats.shorts_listens += 1

            ctx.parsed_rows += 1
    finally:
        try:
            text_stream.close()
        except Exception:
            pass


def make_day_map(start_day: date, end_day: date) -> dict[date, DayStats]:
    day_map: dict[date, DayStats] = {}
    current = start_day
    while current <= end_day:
        day_map[current] = DayStats()
        current += timedelta(days=1)
    return day_map


def aggregate_for_range(stats_by_day: dict[date, DayStats], start_day: date, end_day: date) -> AggregateStats:
    platform_totals: Counter[str] = Counter()
    language_totals: Counter[str] = Counter()
    episode_totals: Counter[str] = Counter()

    total_audio_requests = 0
    total_listens = 0
    total_errors = 0
    total_shorts = 0
    total_daily_uniques = 0

    day = start_day
    while day <= end_day:
        day_stats = stats_by_day.get(day, DayStats())
        total_audio_requests += day_stats.audio_requests
        total_listens += day_stats.successful_listens
        total_errors += day_stats.error_requests
        total_shorts += day_stats.shorts_listens
        total_daily_uniques += day_stats.unique_estimate()

        platform_totals.update(day_stats.platform_listens)
        language_totals.update(day_stats.language_listens)
        episode_totals.update(day_stats.episode_listens)
        day += timedelta(days=1)

    for platform in PLATFORM_ORDER:
        platform_totals.setdefault(platform, 0)

    return AggregateStats(
        total_audio_requests=total_audio_requests,
        total_listens=total_listens,
        total_errors=total_errors,
        shorts_listens=total_shorts,
        platform_listens=platform_totals,
        language_listens=language_totals,
        episode_listens=episode_totals,
        daily_unique_estimate=total_daily_uniques,
    )


def daily_rows_for_range(stats_by_day: dict[date, DayStats], start_day: date, end_day: date) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    day = start_day
    while day <= end_day:
        day_stats = stats_by_day.get(day, DayStats())
        unknown_count = day_stats.platform_listens.get("unknown", 0)
        error_rate = 0.0
        if day_stats.audio_requests:
            error_rate = (day_stats.error_requests / day_stats.audio_requests) * 100.0
        rows.append(
            {
                "date": day.isoformat(),
                "audio_requests_total": day_stats.audio_requests,
                "listen_requests_200_206": day_stats.successful_listens,
                "unique_estimate": day_stats.unique_estimate(),
                "error_requests_4xx_5xx": day_stats.error_requests,
                "error_rate_pct": round(error_rate, 2),
                "apple_listens": day_stats.platform_listens.get("apple", 0),
                "spotify_listens": day_stats.platform_listens.get("spotify", 0),
                "amazon_listens": day_stats.platform_listens.get("amazon", 0),
                "unknown_listens": unknown_count,
                "ko_listens": day_stats.language_listens.get("ko", 0),
                "en_listens": day_stats.language_listens.get("en", 0),
                "shorts_listens": day_stats.shorts_listens,
            }
        )
        day += timedelta(days=1)
    return rows


def format_wow(current: int, previous: int) -> tuple[str, float | None]:
    if previous <= 0:
        return "N/A (이전 기간 데이터 없음)", None
    pct = ((current - previous) / previous) * 100.0
    return f"{pct:+.2f}%", pct


def render_markdown(
    *,
    current_summary: AggregateStats,
    previous_summary: AggregateStats,
    daily_rows: list[dict[str, Any]],
    date_from: date,
    date_to: date,
    previous_from: date,
    previous_to: date,
    timezone_name: str,
    unknown_alert: bool,
    warnings: list[str],
) -> str:
    wow_text, _ = format_wow(current_summary.total_listens, previous_summary.total_listens)
    unknown_ratio = current_summary.unknown_ratio
    report_created_at = datetime.now(timezone.utc).astimezone(ZoneInfo(timezone_name))

    lines: list[str] = []
    lines.append(f"# 리스너 분석 리포트 ({date_from} ~ {date_to})")
    lines.append("")
    lines.append(f"- 생성 시각: {report_created_at.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    lines.append(f"- 기준 타임존: `{timezone_name}`")
    lines.append(f"- 비교 기간(WoW): {previous_from} ~ {previous_to}")
    lines.append("")

    if unknown_alert:
        lines.append("> [!WARNING]")
        lines.append(f"> Unknown 비중이 {unknown_ratio:.2f}%로 35%를 초과했습니다. UA 분류 규칙 점검이 필요합니다.")
        lines.append("")

    if warnings:
        lines.append("## 경고")
        lines.append("")
        for warning in warnings:
            lines.append(f"- {warning}")
        lines.append("")

    lines.append("## 1) 주간 총괄")
    lines.append("")
    lines.append(f"- 총 청취요청(200/206): **{current_summary.total_listens:,}**")
    lines.append(f"- WoW 증감: **{wow_text}**")
    lines.append(f"- 오류율((4xx+5xx)/오디오요청전체): **{current_summary.error_rate:.2f}%**")
    lines.append(f"- Unknown 비중: **{unknown_ratio:.2f}%**")
    lines.append("")

    lines.append("## 2) 플랫폼별 청취수")
    lines.append("")
    lines.append("| 플랫폼 | 청취수 | 비중 |")
    lines.append("|---|---:|---:|")
    for platform in PLATFORM_ORDER:
        count = current_summary.platform_listens.get(platform, 0)
        ratio = 0.0
        if current_summary.total_listens:
            ratio = (count / current_summary.total_listens) * 100.0
        lines.append(f"| {platform} | {count:,} | {ratio:.2f}% |")
    lines.append("")

    lines.append("## 3) 에피소드 TOP 10")
    lines.append("")
    lines.append("| 순위 | 에피소드 URI | 청취수 |")
    lines.append("|---:|---|---:|")
    for idx, (episode, count) in enumerate(current_summary.episode_listens.most_common(10), start=1):
        lines.append(f"| {idx} | `{episode}` | {count:,} |")
    if not current_summary.episode_listens:
        lines.append("| 1 | (데이터 없음) | 0 |")
    lines.append("")

    lines.append("## 4) 언어 비중 (ko/en)")
    lines.append("")
    ko_count = current_summary.language_listens.get("ko", 0)
    en_count = current_summary.language_listens.get("en", 0)
    ko_ratio = (ko_count / current_summary.total_listens * 100.0) if current_summary.total_listens else 0.0
    en_ratio = (en_count / current_summary.total_listens * 100.0) if current_summary.total_listens else 0.0
    lines.append(f"- ko: **{ko_count:,} ({ko_ratio:.2f}%)**")
    lines.append(f"- en: **{en_count:,} ({en_ratio:.2f}%)**")
    lines.append("")

    lines.append("## 5) 쇼츠 성과")
    lines.append("")
    shorts_ratio = (current_summary.shorts_listens / current_summary.total_listens * 100.0) if current_summary.total_listens else 0.0
    lines.append(f"- 쇼츠 청취수(200/206): **{current_summary.shorts_listens:,}**")
    lines.append(f"- 쇼츠 비중: **{shorts_ratio:.2f}%**")
    lines.append("")

    lines.append("## 6) 일별 부록")
    lines.append("")
    lines.append("| 날짜 | 오디오요청전체 | 청취요청(200/206) | 유니크추정 | 오류수(4xx+5xx) | 오류율 | unknown | ko | en | shorts |")
    lines.append("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|")
    for row in daily_rows:
        lines.append(
            "| {date} | {audio_requests_total:,} | {listen_requests_200_206:,} | {unique_estimate:,} | "
            "{error_requests_4xx_5xx:,} | {error_rate_pct:.2f}% | {unknown_listens:,} | "
            "{ko_listens:,} | {en_listens:,} | {shorts_listens:,} |".format(**row)
        )
    lines.append("")
    return "\n".join(lines)


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "date",
        "audio_requests_total",
        "listen_requests_200_206",
        "unique_estimate",
        "error_requests_4xx_5xx",
        "error_rate_pct",
        "apple_listens",
        "spotify_listens",
        "amazon_listens",
        "unknown_listens",
        "ko_listens",
        "en_listens",
        "shorts_listens",
    ]
    with path.open("w", encoding="utf-8", newline="") as fp:
        writer = csv.DictWriter(fp, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    args = parse_args()

    if not args.log_bucket:
        print("`--log-bucket` 또는 `CLOUDFRONT_LOG_BUCKET` 설정이 필요합니다.", file=sys.stderr)
        return 2

    date_from = parse_date_or_exit(args.date_from, "--from")
    date_to = parse_date_or_exit(args.date_to, "--to")
    if date_from > date_to:
        print("--from must be earlier than or equal to --to", file=sys.stderr)
        return 2

    try:
        tzinfo = ZoneInfo(args.tz)
    except ZoneInfoNotFoundError as exc:
        print(f"Unknown timezone: {args.tz}", file=sys.stderr)
        return 2

    rules = load_rules(Path(args.rules_file))

    report_days = (date_to - date_from).days + 1
    prev_from = date_from - timedelta(days=report_days)
    prev_to = date_from - timedelta(days=1)
    analysis_start = prev_from
    analysis_end = date_to

    ctx = ProcessingContext()
    s3_client = get_s3_client()
    stats_by_day = make_day_map(analysis_start, analysis_end)

    keys = list_cloudfront_log_keys(
        s3_client=s3_client,
        bucket=args.log_bucket,
        prefix=args.log_prefix,
        dt_start=analysis_start,
        dt_end=analysis_end,
        ctx=ctx,
    )

    for key in keys:
        process_log_object(
            s3_client=s3_client,
            bucket=args.log_bucket,
            key=key,
            ctx=ctx,
            stats_by_day=stats_by_day,
            rules=rules,
            tzinfo=tzinfo,
            analysis_start=analysis_start,
            analysis_end=analysis_end,
            include_shorts=args.include_shorts,
            cloudfront_domain=args.cloudfront_domain,
        )

    daily_rows = daily_rows_for_range(stats_by_day, date_from, date_to)
    current_summary = aggregate_for_range(stats_by_day, date_from, date_to)
    previous_summary = aggregate_for_range(stats_by_day, prev_from, prev_to)

    for row in daily_rows:
        if row["audio_requests_total"] == 0:
            ctx.warnings.append(f"{row['date']} 로그가 비어 있습니다. 일부 로그 누락 가능성을 확인하세요.")

    if ctx.object_read_failures:
        ctx.warnings.append(f"로그 파일 읽기 실패 {ctx.object_read_failures}건: 실패 파일을 확인하세요.")

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    data_dir = output_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    suffix = f"{date_from}_{date_to}"
    markdown_path = output_dir / f"weekly_listener_report_{suffix}.md"
    csv_path = data_dir / f"listener_daily_{suffix}.csv"
    json_path = data_dir / f"listener_summary_{suffix}.json"

    unknown_alert = current_summary.unknown_ratio > 35.0
    markdown_text = render_markdown(
        current_summary=current_summary,
        previous_summary=previous_summary,
        daily_rows=daily_rows,
        date_from=date_from,
        date_to=date_to,
        previous_from=prev_from,
        previous_to=prev_to,
        timezone_name=args.tz,
        unknown_alert=unknown_alert,
        warnings=ctx.warnings,
    )
    markdown_path.write_text(markdown_text, encoding="utf-8")
    write_csv(csv_path, daily_rows)

    wow_text, wow_pct = format_wow(current_summary.total_listens, previous_summary.total_listens)
    summary_payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "range": {
            "from": date_from.isoformat(),
            "to": date_to.isoformat(),
            "timezone": args.tz,
            "previous_from": prev_from.isoformat(),
            "previous_to": prev_to.isoformat(),
        },
        "kpi": {
            "total_audio_requests": current_summary.total_audio_requests,
            "total_listen_requests_200_206": current_summary.total_listens,
            "wow_change_text": wow_text,
            "wow_change_pct": wow_pct,
            "error_rate_pct": round(current_summary.error_rate, 4),
            "unknown_ratio_pct": round(current_summary.unknown_ratio, 4),
            "daily_unique_estimate": current_summary.daily_unique_estimate,
        },
        "platform_listens": {platform: current_summary.platform_listens.get(platform, 0) for platform in PLATFORM_ORDER},
        "language_listens": {
            "ko": current_summary.language_listens.get("ko", 0),
            "en": current_summary.language_listens.get("en", 0),
        },
        "shorts_listens": current_summary.shorts_listens,
        "top_episodes": [
            {"episode_uri": episode_uri, "listen_requests_200_206": count}
            for episode_uri, count in current_summary.episode_listens.most_common(10)
        ],
        "warnings": ctx.warnings,
        "processing": {
            "scanned_log_objects": ctx.scanned_log_objects,
            "parsed_rows": ctx.parsed_rows,
            "malformed_rows": ctx.malformed_rows,
            "skipped_non_audio_rows": ctx.skipped_non_audio_rows,
            "skipped_bot_rows": ctx.skipped_bot_rows,
            "skipped_host_rows": ctx.skipped_host_rows,
            "object_read_failures": ctx.object_read_failures,
        },
        "daily": daily_rows,
    }
    if args.write_json:
        write_json(json_path, summary_payload)

    print(f"[OK] Markdown: {markdown_path}")
    print(f"[OK] CSV: {csv_path}")
    if args.write_json:
        print(f"[OK] JSON: {json_path}")
    else:
        print("[SKIP] JSON output disabled (--write-json not set)")

    if ctx.warnings:
        print("[WARN] 아래 경고를 확인하세요:")
        for warning in ctx.warnings:
            print(f"  - {warning}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
