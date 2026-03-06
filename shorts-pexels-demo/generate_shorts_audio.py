"""Prepare audio artifacts for shorts-pexels-demo.

Default behavior:
- Reuse existing shorts audio from podcast/{date}/{lang}/{source_subdir}/
- Copy MP3 (+ section timing if available) into shorts-pexels-demo folder

Optional fallback:
- If source audio is missing and --generate-if-missing is set, invoke
  shorts/generate_shorts_audio.py first.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent


def parse_date_token(value: str) -> str:
    token = value.replace("-", "").strip()
    if len(token) != 8 or not token.isdigit():
        raise ValueError(f"Invalid date: {value}")
    return token


def first_mp3_in(path: Path) -> Path | None:
    files = sorted(path.glob("shorts*.mp3"))
    return files[0] if files else None


def run_generate_audio(date: str, lang: str) -> None:
    script_path = ROOT_DIR / "shorts" / "generate_shorts_audio.py"
    if not script_path.exists():
        raise FileNotFoundError(f"Missing script: {script_path}")

    cmd = [sys.executable, str(script_path), date, "--lang", lang]
    subprocess.run(cmd, cwd=str(ROOT_DIR), check=True)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Prepare audio for shorts-pexels-demo")
    parser.add_argument("date", help="Date in YYYYMMDD or YYYY-MM-DD")
    parser.add_argument("--lang", default="ko", choices=["ko", "en"])
    parser.add_argument("--source-subdir", default="shorts")
    parser.add_argument("--output-subdir", default="shorts-pexels-demo")
    parser.add_argument("--generate-if-missing", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    date = parse_date_token(args.date)
    lang = args.lang

    source_base = ROOT_DIR / "podcast" / date / lang / args.source_subdir
    if not source_base.exists():
        raise FileNotFoundError(f"Source folder not found: {source_base}")

    output_base = ROOT_DIR / "podcast" / date / lang / args.output_subdir
    output_base.mkdir(parents=True, exist_ok=True)

    source_audio = source_base / f"shorts{date}.mp3"
    if not source_audio.exists():
        alt = first_mp3_in(source_base)
        if alt is not None:
            source_audio = alt

    if not source_audio.exists() and args.generate_if_missing:
        run_generate_audio(date, lang)
        source_audio = source_base / f"shorts{date}.mp3"
        if not source_audio.exists():
            alt = first_mp3_in(source_base)
            if alt is not None:
                source_audio = alt

    if not source_audio.exists():
        raise FileNotFoundError(
            f"Source audio not found under {source_base}. "
            "Run shorts audio first or pass --generate-if-missing."
        )

    output_audio = output_base / f"shorts{date}.mp3"
    shutil.copy2(source_audio, output_audio)

    source_timing = source_base / "sections.timing.json"
    output_timing = output_base / "sections.timing.json"
    if source_timing.exists():
        shutil.copy2(source_timing, output_timing)

    print(f"Prepared audio: {output_audio}")
    if source_timing.exists():
        print(f"Prepared timing: {output_timing}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Failed to prepare shorts demo audio: {exc}", file=sys.stderr)
        raise SystemExit(1)
