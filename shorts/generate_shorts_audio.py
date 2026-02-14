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
import random
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
import yaml

# Add parent directory to path
ROOT_DIR = Path(__file__).resolve().parent.parent
SHORTS_PROMPT_CONFIG_PATH = ROOT_DIR / "shorts" / "config" / "gemini_shorts_tts.yaml"
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


DEFAULT_SHORTS_SYSTEM_INSTRUCTIONS = {
    "ko": (
        "Output audio only. Speed=1.10, Volume=1.00, "
        "YouTube Shorts style Korean U.S. stock market briefing: "
        "fast-paced, high energy, engaging, and clear narration. "
        "Read the following text completely without omission."
    ),
    "en": (
        "Output audio only. Speed=1.10, Volume=1.00, "
        "YouTube Shorts style U.S. stock market briefing: "
        "fast-paced, high energy, engaging, and clear narration. "
        "Read the following text completely without omission."
    ),
}


def load_shorts_system_instruction(lang: str, config_path: Path = SHORTS_PROMPT_CONFIG_PATH) -> str:
    """Load shorts TTS system instruction from YAML prompts.{lang}."""
    default_prompt = DEFAULT_SHORTS_SYSTEM_INSTRUCTIONS.get(lang, DEFAULT_SHORTS_SYSTEM_INSTRUCTIONS["en"])
    if not config_path.exists():
        logger.warning("Shorts prompt config not found. Using built-in prompt: %s", config_path)
        return default_prompt

    raw = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    if not isinstance(raw, dict):
        logger.warning("Invalid shorts prompt config. Using built-in prompt: %s", config_path)
        return default_prompt

    prompts = raw.get("prompts")
    if not isinstance(prompts, dict):
        logger.warning("No prompts map in shorts prompt config. Using built-in prompt: %s", config_path)
        return default_prompt

    selected = prompts.get(lang)
    if isinstance(selected, str) and selected.strip():
        logger.info("Loaded shorts prompt config: %s (lang=%s)", config_path, lang)
        return selected.strip()

    logger.warning("No prompts.%s in shorts prompt config. Using built-in prompt.", lang)
    return default_prompt


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






def generate_segment_with_retry(
    text: str,
    api_key: str,
    voice_name: str,
    temperature: float,
    system_instruction: str,
    timeout_seconds: float = 300.0,
    retry_backoff_base_seconds: float = 2.0,
    retry_backoff_multiplier: float = 2.0,
    retry_backoff_max_seconds: float = 20.0,
    retry_jitter_seconds: float = 0.5,
    min_duration_ratio: float = 0.05,
    max_retries: int = 3,
) -> bytes:
    """
    Generate audio segment with retry logic for short/incomplete generations.
    """
    from tts.src.utils.audio import _extract_pcm, BYTES_PER_FRAME
    
    expected_min_seconds = len(text) * min_duration_ratio

    
    full_prompt = f"{system_instruction}\n\n{text}"

    def _sleep_before_retry(attempt_idx: int, reason: str) -> None:
        if attempt_idx >= max_retries - 1:
            return
        delay = retry_backoff_base_seconds * (retry_backoff_multiplier ** attempt_idx)
        if retry_backoff_max_seconds > 0:
            delay = min(delay, retry_backoff_max_seconds)
        if retry_jitter_seconds > 0:
            delay += random.uniform(0, retry_jitter_seconds)
        logger.warning(
            "    Retry backoff (%s): sleeping %.2fs before attempt %d/%d",
            reason,
            delay,
            attempt_idx + 2,
            max_retries,
        )
        time.sleep(delay)

    for attempt in range(max_retries):
        try:
            logger.info(f"    Generating... (attempt {attempt+1}/{max_retries})")
            
            # Use full_prompt instead of just text
            audio_bytes = gemini_generate_tts(
                prompt=full_prompt,
                api_key=api_key,
                temperature=temperature,
                voice_name=voice_name,
                timeout_s=timeout_seconds,
            )
            
            pcm = _extract_pcm(audio_bytes)
            # trim_silence removed as per user request (prompt fixed the issue)
            
            duration = len(pcm) / BYTES_PER_FRAME / 24000
            
            # Validation: detailed check
            if duration >= expected_min_seconds:
                return pcm
            
            logger.warning(
                f"    ⚠️ Generated audio too short: {duration:.2f}s "
                f"(expected > {expected_min_seconds:.2f}s for {len(text)} chars). "
                f"Possible model truncation."
            )
            _sleep_before_retry(attempt, reason="short_audio")

        except Exception as e:
            logger.warning(f"    ⚠️ Error during generation: {e}")
            if attempt == max_retries - 1:
                raise
            _sleep_before_retry(attempt, reason="exception")

    logger.error("    ❌ Failed to generate valid audio after retries.")
    raise RuntimeError("Segment generation failed verification")


def generate_audio_with_gemini(
    text: str,
    output_path: Path,
    voice_name: str,
    temperature: float,
    api_key: str = None,
    system_instruction: str = "",
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
    if not system_instruction.strip():
        raise ValueError("system_instruction is required")
    
    # Normalize text to remove potential problematic characters
    text = text.replace("\r\n", " ").replace("\n", " ").strip()
    
    logger.info(f"Generating audio with Gemini TTS")
    logger.info(f"  Voice: {voice_name}")
    logger.info(f"  Text length: {len(text)} characters")
    logger.info(f"  Temperature: {temperature}")
    
    # Split text into 2 parts at sentence boundary
    part1, part2 = split_text_at_sentence(text, target_ratio=0.5)
    
    # Fallback to single generation if text is short
    if not part2 or len(part2) < 10:
        logger.info(f"  Text is short enough, generating in one go ({len(text)} chars)")
        try:
            pcm = generate_segment_with_retry(
                text,
                api_key,
                voice_name,
                temperature,
                system_instruction=system_instruction,
            )
            # Write WAV
            from tts.src.utils.audio import _write_wav
            output_path.parent.mkdir(parents=True, exist_ok=True)
            _write_wav(output_path, pcm)
            return
        except Exception as e:
            logger.error(f"Single generation failed: {e}")
            raise

    logger.info(f"  Split into 2 parts: {len(part1)} + {len(part2)} chars")
    
    # Generate both parts with retry
    logger.info(f"  Generating part 1/2 ({len(part1)} chars)...")
    pcm1 = generate_segment_with_retry(
        part1,
        api_key,
        voice_name,
        temperature,
        system_instruction=system_instruction,
    )
    
    logger.info(f"  Generating part 2/2 ({len(part2)} chars)...")
    pcm2 = generate_segment_with_retry(
        part2,
        api_key,
        voice_name,
        temperature,
        system_instruction=system_instruction,
    )
    
    from tts.src.utils.audio import _write_wav, BYTES_PER_FRAME
    
    logger.info(f"  Merging audio segments...")
    
    duration1 = len(pcm1) / BYTES_PER_FRAME / 24000
    duration2 = len(pcm2) / BYTES_PER_FRAME / 24000
    logger.info(f"    Part 1: {len(pcm1)} bytes ({duration1:.2f}s)")
    logger.info(f"    Part 2: {len(pcm2)} bytes ({duration2:.2f}s)")
    
    # Concatenate PCM data
    # Add a small pause between parts
    silence_padding = int(0.5 * 24000) * BYTES_PER_FRAME # 0.5s pause
    combined_pcm = pcm1 + (b'\x00' * silence_padding) + pcm2
    
    # Write as WAV file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    _write_wav(output_path, combined_pcm)
    
    total_duration = len(combined_pcm) / BYTES_PER_FRAME / 24000
    logger.info(f"✓ Saved merged audio to {output_path} ({total_duration:.2f}s)")



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
        default="Charon",
        help="Voice name (Aoede, Charon, Fenrir, Kore, Puck, default: Charon)",
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=0.6,
        help="Generation temperature (default: 0.6)",
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
    system_instruction = load_shorts_system_instruction(lang=lang)
    
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
            system_instruction=system_instruction,
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
