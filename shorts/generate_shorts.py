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


DurationTarget = Literal[60, 90, 120]


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
        required_fields = ["date", "title", "script", "sources", "metadata"]
        missing = [f for f in required_fields if f not in result]
        if missing:
            raise ValueError(f"Missing required fields in response: {missing}")
        
        logger.info(f"✓ Generated shorts script: {result['title']}")
        logger.info(f"  - Characters: {result['metadata']['character_count']}")
        logger.info(f"  - Estimated duration: {result['metadata']['estimated_duration_seconds']}s")
        logger.info(f"  - Key points: {len(result['metadata']['key_points'])}")
        
        return result
        
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
        help="Output path for shorts script JSON (default: <podcast_dir>/shorts_script.json)",
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
    
    # Initialize LLM (Gemini 2.5 Pro)
    logger.info("Initializing Gemini 2.5 Pro...")
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
