"""
Generate TTS audio for YouTube Shorts from shorts_script.json.

Unlike the main podcast (which has turn-based dialogue), shorts have a single 
continuous narration, so we generate one audio file directly.

Usage:
    python shorts/generate_shorts_audio.py 20260206 --lang ko
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import subprocess
import sys
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

# Add parent directory to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from shared.yaml_config import load_env_from_yaml
from tts.src.utils.gemini_tts import gemini_generate_tts

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def parse_date_arg(date_str: str) -> str:
    """Parse date argument to YYYYMMDD format."""
    date_str = date_str.replace("-", "")
    if len(date_str) != 8 or not date_str.isdigit():
        raise ValueError(f"Invalid date format: {date_str}. Expected YYYYMMDD or YYYY-MM-DD")
    return date_str


def load_shorts_script(shorts_script_path: Path) -> dict:
    """Load shorts_script.json."""
    if not shorts_script_path.exists():
        raise FileNotFoundError(f"Shorts script not found: {shorts_script_path}")
    
    with open(shorts_script_path, "r", encoding="utf-8") as f:
        shorts_data = json.load(f)
    
    return shorts_data


def split_text_at_sentence(text: str, target_ratio: float = 0.5) -> tuple[str, str]:
    """
    Split text into two parts at a sentence boundary near the target ratio.
    
    Args:
        text: Text to split
        target_ratio: Where to aim for the split (0.5 = middle)
    
    Returns:
        Tuple of (first_part, second_part)
    """
    import re
    
    # Korean sentence endings: . ! ?
    sentences = re.split(r'([.!?]\s+)', text)
    
    # Reconstruct sentences with their punctuation
    full_sentences = []
    for i in range(0, len(sentences) - 1, 2):
        sentence = sentences[i]
        if i + 1 < len(sentences):
            sentence += sentences[i + 1].rstrip()
        if sentence.strip():
            full_sentences.append(sentence)
    
    # Handle last sentence if it doesn't end with punctuation
    if len(sentences) % 2 == 1 and sentences[-1].strip():
        full_sentences.append(sentences[-1])
    
    if not full_sentences:
        # No sentence boundaries found, split in half
        mid = len(text) // 2
        return text[:mid], text[mid:]
    
    # Find split point closest to target ratio
    target_pos = len(text) * target_ratio
    best_idx = 0
    best_diff = float('inf')
    
    current_pos = 0
    for idx, sentence in enumerate(full_sentences):
        current_pos += len(sentence)
        diff = abs(current_pos - target_pos)
        if diff < best_diff:
            best_diff = diff
            best_idx = idx
    
    # Split at the best position
    first_part = ''.join(full_sentences[:best_idx + 1])
    second_part = ''.join(full_sentences[best_idx + 1:])
    
    return first_part.strip(), second_part.strip()


def generate_audio_with_gemini(
    text: str,
    output_path: Path,
    voice_name: str = "Aoede",
    temperature: float = 0.0,
    api_key: str = None,
) -> None:
    """
    Generate audio using Gemini TTS API, splitting into 2 parts to avoid API errors.
    
    Args:
        text: Text to convert to speech
        output_path: Where to save the audio file
        voice_name: Voice to use (Aoede, Charon, Fenrir, Kore, Puck)
        temperature: Generation temperature (0.0 for most consistent)
        api_key: Gemini API key
    """
    if not api_key:
        raise ValueError("GEMINI_API_KEY is required")
    
    logger.info(f"Generating audio with Gemini TTS")
    logger.info(f"  Voice: {voice_name}")
    logger.info(f"  Text length: {len(text)} characters")
    logger.info(f"  Temperature: {temperature}")
    
    # Split text into 2 parts at sentence boundary
    part1, part2 = split_text_at_sentence(text, target_ratio=0.5)
    logger.info(f"  Split into 2 parts: {len(part1)} + {len(part2)} chars")
    
    # Generate both parts
    logger.info(f"  Generating part 1/2 ({len(part1)} chars)...")
    audio_bytes_1 = gemini_generate_tts(
        prompt=part1,
        api_key=api_key,
        temperature=temperature,
        voice_name=voice_name,
        timeout_s=300.0,
    )
    
    logger.info(f"  Generating part 2/2 ({len(part2)} chars)...")
    audio_bytes_2 = gemini_generate_tts(
        prompt=part2,
        api_key=api_key,
        temperature=temperature,
        voice_name=voice_name,
        timeout_s=300.0,
    )
    
    # Import TTS audio utilities to handle PCM properly
    from tts.src.utils.audio import _extract_pcm, _write_wav, BYTES_PER_FRAME
    import wave
    import tempfile
    
    logger.info(f"  Merging audio segments...")
    
    # Extract PCM from both parts (Gemini returns PCM or WAV)
    pcm1 = _extract_pcm(audio_bytes_1)
    pcm2 = _extract_pcm(audio_bytes_2)
    
    # Validate PCM sizes
    if len(pcm1) % BYTES_PER_FRAME != 0:
        raise ValueError(f"Part 1 PCM size not aligned to frame: {len(pcm1)} bytes")
    if len(pcm2) % BYTES_PER_FRAME != 0:
        raise ValueError(f"Part 2 PCM size not aligned to frame: {len(pcm2)} bytes")
    
    # Concatenate PCM data
    combined_pcm = pcm1 + pcm2
    
    # Write as WAV file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    _write_wav(output_path, combined_pcm)
    
    logger.info(f"✓ Saved merged audio to {output_path}")


def convert_to_mp3(wav_path: Path, mp3_path: Path) -> None:
    """Convert WAV to MP3 using ffmpeg with CBR (Constant Bit Rate)."""
    logger.info(f"Converting to MP3: {mp3_path.name}")
    
    try:
        result = subprocess.run(
            [
                "ffmpeg",
                "-i", str(wav_path),
                "-codec:a", "libmp3lame",
                "-b:a", "192k",  # Constant Bit Rate (CBR) 192k
                "-minrate", "192k",
                "-maxrate", "192k",
                "-bufsize", "192k",
                "-ac", "1",      # Mono (optional, but good for voice)
                "-y",            # Overwrite output file
                str(mp3_path),
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        logger.info(f"✓ Converted to MP3: {mp3_path}")
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg conversion failed: {e.stderr}")
        raise
    except FileNotFoundError:
        logger.error("ffmpeg not found. Please install ffmpeg.")
        raise


def main(argv: Optional[list[str]] = None) -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate TTS audio for YouTube Shorts"
    )
    parser.add_argument(
        "date",
        type=str,
        help="Date in YYYYMMDD or YYYY-MM-DD format",
    )
    parser.add_argument(
        "--lang",
        type=str,
        default="ko",
        choices=["ko", "en"],
        help="Language (ko=Korean, en=English, default: ko)",
    )
    parser.add_argument(
        "--voice",
        type=str,
        default="Aoede",
        help="Voice name (Aoede, Charon, Fenrir, Kore, Puck, default: Aoede)",
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=0.0,
        help="Generation temperature (default: 0.0)",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging",
    )
    
    args = parser.parse_args(argv)
    
    if args.debug:
        logger.setLevel(logging.DEBUG)
    
    # Parse date
    try:
        date_yyyymmdd = parse_date_arg(args.date)
    except ValueError as e:
        logger.error(f"Date parsing failed: {e}")
        return 2
    
    # Load environment
    load_env_from_yaml(logger=logger)
    load_dotenv(ROOT_DIR / ".env", override=False)
    
    # Get API key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment")
        return 2
    
    # Set paths
    lang = args.lang
    
    # New structure: podcast/{date}/{lang}/shorts/
    shorts_dir = ROOT_DIR / "podcast" / date_yyyymmdd / lang / "shorts"
    shorts_dir.mkdir(parents=True, exist_ok=True)
    
    shorts_script_path = shorts_dir / "script.json"
    
    # Fallback for old structure if new script doesn't exist yet but old one does
    if not shorts_script_path.exists():
        old_script_path = ROOT_DIR / "podcast" / date_yyyymmdd / lang / "shorts_script.json"
        if old_script_path.exists():
            logging.info(f"Moving old script file to new location: {old_script_path} -> {shorts_script_path}")
            old_script_path.rename(shorts_script_path)

    # New filename: shorts{date}.mp3 (no underscore)
    output_wav = shorts_dir / f"shorts{date_yyyymmdd}.wav"
    output_mp3 = shorts_dir / f"shorts{date_yyyymmdd}.mp3"
    
    logger.info(f"📅 Date: {date_yyyymmdd}")
    logger.info(f"🌐 Language: {lang}")
    logger.info(f"📄 Input: {shorts_script_path}")
    logger.info(f"🎵 Output: {output_mp3}")
    
    try:
        # Load shorts script
        shorts_data = load_shorts_script(shorts_script_path)
        script_text = shorts_data.get("script", "")
        
        if not script_text:
            logger.error("No script text found in shorts_script.json")
            return 1
        
        logger.info(f"📝 Script: {len(script_text)} characters")
        
        # Generate audio
        generate_audio_with_gemini(
            text=script_text,
            output_path=output_wav,
            voice_name=args.voice,
            temperature=args.temperature,
            api_key=api_key,
        )
        
        # Convert to MP3
        convert_to_mp3(output_wav, output_mp3)
        
        logger.info("✅ Shorts audio generation completed successfully!")
        return 0
        
    except Exception as e:
        logger.error(f"Failed to generate shorts audio: {e}", exc_info=args.debug)
        return 1


if __name__ == "__main__":
    sys.exit(main())
