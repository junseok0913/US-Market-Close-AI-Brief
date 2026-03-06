"""Render shorts-pexels-demo MP4 from downloaded still images and narration audio."""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parent.parent

TARGET_SECONDS = 59.0
TARGET_TOLERANCE = 0.02


def parse_date_token(value: str) -> str:
    token = value.replace("-", "").strip()
    if len(token) != 8 or not token.isdigit():
        raise ValueError(f"Invalid date: {value}")
    return token


def load_json(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Invalid JSON object: {path}")
    return payload


def run_cmd(cmd: list[str]) -> None:
    subprocess.run(cmd, cwd=str(ROOT_DIR), check=True)


def ffprobe_duration_seconds(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "csv=p=0",
            str(path),
        ],
        cwd=str(ROOT_DIR),
        check=True,
        capture_output=True,
        text=True,
    )
    raw = (result.stdout or "").strip()
    return float(raw)


def atempo_chain(speed_ratio: float) -> str:
    filters: list[str] = []
    remaining = speed_ratio

    while remaining > 2.0:
        filters.append("atempo=2.0")
        remaining /= 2.0
    while remaining < 0.5:
        filters.append("atempo=0.5")
        remaining /= 0.5

    filters.append(f"atempo={remaining:.6f}")
    return ",".join(filters)


def ffmpeg_safe_path(path: Path) -> str:
    return path.as_posix().replace("'", "'\\''")


def retime_to_target(mp4_path: Path, target_seconds: float = TARGET_SECONDS) -> None:
    original_duration = ffprobe_duration_seconds(mp4_path)
    if math.isclose(original_duration, target_seconds, abs_tol=TARGET_TOLERANCE):
        return

    speed_ratio = original_duration / target_seconds
    video_pts = 1.0 / speed_ratio
    audio_filter = atempo_chain(speed_ratio)

    temp_path = mp4_path.with_name(f"{mp4_path.stem}_retime.mp4")
    run_cmd(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(mp4_path),
            "-filter:v",
            f"setpts={video_pts:.6f}*PTS,fps=30",
            "-af",
            f"{audio_filter},aresample=async=1:first_pts=0",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "20",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-t",
            f"{target_seconds:.3f}",
            "-movflags",
            "+faststart",
            str(temp_path),
        ]
    )
    shutil.move(temp_path, mp4_path)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Render shorts-pexels-demo video")
    parser.add_argument("date", help="Date in YYYYMMDD or YYYY-MM-DD")
    parser.add_argument("--lang", default="ko", choices=["ko", "en"])
    parser.add_argument("--input", type=Path, help="Input slides.render.json path")
    parser.add_argument("--audio", type=Path, help="Narration MP3 path")
    parser.add_argument("--output", type=Path, help="Output MP4 path")
    parser.add_argument("--thumbnail", type=Path, help="Output thumbnail PNG path")
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--keep-temp", action="store_true", help="Keep render_tmp intermediates")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    date = parse_date_token(args.date)
    lang = args.lang
    fps = max(24, min(60, int(args.fps)))

    base_dir = ROOT_DIR / "podcast" / date / lang / "shorts-pexels-demo"

    input_path = args.input or (base_dir / "slides.render.json")
    if not input_path.is_absolute():
        input_path = (ROOT_DIR / input_path).resolve()

    audio_path = args.audio or (base_dir / f"shorts{date}.mp3")
    if not audio_path.is_absolute():
        audio_path = (ROOT_DIR / audio_path).resolve()

    output_dir = base_dir / "youtube"
    output_path = args.output or (output_dir / f"{date}_{lang}_shorts_pexels_demo.mp4")
    if not output_path.is_absolute():
        output_path = (ROOT_DIR / output_path).resolve()

    thumbnail_path = args.thumbnail or (output_dir / f"{date}_{lang}_shorts_pexels_demo_thumbnail.png")
    if not thumbnail_path.is_absolute():
        thumbnail_path = (ROOT_DIR / thumbnail_path).resolve()

    if not input_path.exists():
        raise FileNotFoundError(f"Missing render input: {input_path}")
    if not audio_path.exists():
        raise FileNotFoundError(f"Missing audio file: {audio_path}")

    payload = load_json(input_path)
    raw_slides = payload.get("slides")
    if not isinstance(raw_slides, list) or not raw_slides:
        raise ValueError(f"No slides[] in: {input_path}")

    slides = [slide for slide in raw_slides if isinstance(slide, dict)]
    slides.sort(key=lambda row: (float(row.get("startSec") or 0.0), int(row.get("id") or 0)))

    render_tmp = base_dir / "render_tmp"
    segments_dir = render_tmp / "segments"
    segments_dir.mkdir(parents=True, exist_ok=True)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    segment_paths: list[Path] = []

    for idx, slide in enumerate(slides):
        start_sec = float(slide.get("startSec") or 0.0)
        end_sec = float(slide.get("endSec") or start_sec)
        duration_sec = max(0.5, end_sec - start_sec)

        image_path_raw = slide.get("imagePath") or (slide.get("image") or {}).get("localPath")
        if not image_path_raw:
            raise ValueError(f"Slide {idx} missing imagePath")

        image_path = Path(str(image_path_raw))
        if not image_path.is_absolute():
            image_path = (input_path.parent / image_path).resolve()

        if not image_path.exists():
            raise FileNotFoundError(f"Slide image not found: {image_path}")

        segment_path = segments_dir / f"segment_{idx:03d}.mp4"

        run_cmd(
            [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-loop",
                "1",
                "-t",
                f"{duration_sec:.3f}",
                "-i",
                str(image_path),
                "-vf",
                "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p",
                "-r",
                str(fps),
                "-c:v",
                "libx264",
                "-preset",
                "veryfast",
                "-crf",
                "20",
                "-pix_fmt",
                "yuv420p",
                str(segment_path),
            ]
        )

        segment_paths.append(segment_path)

    concat_file = render_tmp / "segments.concat.txt"
    concat_lines = [f"file '{ffmpeg_safe_path(path)}'" for path in segment_paths]
    concat_file.write_text("\n".join(concat_lines) + "\n", encoding="utf-8")

    run_cmd(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_file),
            "-i",
            str(audio_path),
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "20",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(output_path),
        ]
    )

    retime_to_target(output_path, TARGET_SECONDS)

    run_cmd(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(output_path),
            "-frames:v",
            "1",
            str(thumbnail_path),
        ]
    )

    final_duration = ffprobe_duration_seconds(output_path)
    if not args.keep_temp and render_tmp.exists():
        shutil.rmtree(render_tmp)
    print(f"Rendered video: {output_path}")
    print(f"Thumbnail: {thumbnail_path}")
    print(f"Duration: {final_duration:.3f}s")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Failed to render shorts-pexels-demo video: {exc}", file=sys.stderr)
        raise SystemExit(1)
