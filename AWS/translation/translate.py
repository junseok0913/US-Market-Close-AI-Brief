#!/usr/bin/env python3
"""
한국어 팟캐스트 스크립트를 영어로 일괄 번역하는 모듈

Usage:
    python AWS/translation/translate.py 20260123
    uv run python AWS/translation/translate.py 20260123
"""

import argparse
import json
import logging
import re
import sys
import yaml
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv

# 프로젝트 루트를 Python path에 추가
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from shared.utils.llm import build_llm
from shared.yaml_config import load_env_from_yaml

logger = logging.getLogger(__name__)


def load_batch_translation_prompt() -> tuple[str, str]:
    """
    일괄 번역 프롬프트 YAML 파일 로드
    
    Returns:
        (system_prompt, user_template) 튜플
    """
    prompt_path = Path(__file__).parent / "prompt" / "translation_batch.yaml"
    
    if not prompt_path.exists():
        raise FileNotFoundError(f"Translation prompt not found: {prompt_path}")
    
    with open(prompt_path, 'r', encoding='utf-8') as f:
        prompt_data = yaml.safe_load(f)
    
    system = prompt_data.get("system", "")
    user_template = prompt_data.get("user_template", "{korean_script_json}")
    
    return system, user_template


def extract_json_from_response(response_text: str) -> str:
    """
    LLM 응답에서 JSON 추출 (마크다운 코드 블록 제거 등)
    
    Args:
        response_text: LLM의 원본 응답 텍스트
        
    Returns:
        추출된 JSON 문자열
    """
    text = response_text.strip()
    
    # 코드 블록 제거 (```json ... ``` 또는 ``` ... ```)
    if text.startswith("```") and text.endswith("```"):
        lines = text.split("\n")
        if len(lines) > 2:
            # 첫 줄(```json)과 마지막 줄(```) 제거
            text = "\n".join(lines[1:-1]).strip()
    
    # 앞뒤 따옴표 제거
    if text.startswith('"') and text.endswith('"'):
        text = text[1:-1]
    if text.startswith("'") and text.endswith("'"):
        text = text[1:-1]
    
    return text


def translate_script_batch(
    korean_script_path: Path,
    output_path: Path,
    llm: Any,
    system_prompt: str,
    user_template: str
) -> Dict[str, Any]:
    """
    한국어 script.json을 영어로 일괄 번역
    
    Args:
        korean_script_path: 한국어 script.json 경로
        output_path: 영어 script.json 저장 경로
        llm: LangChain LLM instance
        system_prompt: 시스템 프롬프트
        user_template: 사용자 메시지 템플릿
        
    Returns:
        번역된 script 딕셔너리
    """
    logger.info(f"Loading Korean script: {korean_script_path}")
    
    if not korean_script_path.exists():
        raise FileNotFoundError(f"Korean script not found: {korean_script_path}")
    
    # 한국어 스크립트 로드
    with open(korean_script_path, 'r', encoding='utf-8') as f:
        korean_data = json.load(f)
    
    # 번역 대상 데이터 준비 (nutshell + scripts)
    translation_input = {
        "nutshell": korean_data.get("nutshell", ""),
        "scripts": korean_data.get("scripts", [])
    }
    
    # JSON으로 직렬화
    korean_json_str = json.dumps(translation_input, ensure_ascii=False, indent=2)
    
    logger.info(f"Preparing batch translation...")
    logger.info(f"  Total turns: {len(translation_input['scripts'])}")
    logger.info(f"  Input size: {len(korean_json_str)} characters")
    
    # 프롬프트 생성
    user_message = user_template.format(korean_script_json=korean_json_str)
    full_prompt = f"{system_prompt}\n\n{user_message}"
    
    logger.info(f"Calling Gemini 2.5 Pro for batch translation...")
    
    try:
        # LLM 호출 (한 번에 전체 번역)
        response = llm.invoke(full_prompt)
        raw_response = response.content.strip()
        
        logger.info(f"Received response ({len(raw_response)} chars)")
        
        # JSON 추출
        json_str = extract_json_from_response(raw_response)
        
        # JSON 파싱
        try:
            translated_data = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response preview: {json_str[:500]}...")
            raise ValueError(f"LLM returned invalid JSON: {e}")
        
        # 검증
        if "scripts" not in translated_data:
            raise ValueError("Translated data missing 'scripts' field")
        
        if len(translated_data["scripts"]) != len(translation_input["scripts"]):
            logger.warning(
                f"Turn count mismatch: original={len(translation_input['scripts'])}, "
                f"translated={len(translated_data['scripts'])}"
            )
        
        # 최종 결과 조합 (원본 구조 유지)
        english_data = {
            "date": korean_data.get("date"),
            "nutshell": translated_data.get("nutshell", ""),
            "user_tickers": korean_data.get("user_tickers", []),
            "chapter": korean_data.get("chapter", []),
            "scripts": translated_data.get("scripts", [])
        }
        
        # 영어 스크립트 저장
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(english_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"✅ English script saved: {output_path}")
        logger.info(f"  Nutshell (KO): {translation_input['nutshell']}")
        logger.info(f"  Nutshell (EN): {english_data['nutshell']}")
        logger.info(f"  Translated turns: {len(english_data['scripts'])}")
        
        return english_data
        
    except Exception as e:
        logger.error(f"Batch translation failed: {e}")
        raise


def main():
    """CLI 엔트리포인트"""
    
    # 로깅 설정
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s"
    )
    
    parser = argparse.ArgumentParser(
        description="한국어 팟캐스트 스크립트를 영어로 일괄 번역 (Batch Translation)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예제:
  python AWS/translation/translate.py 20260123
  uv run python AWS/translation/translate.py 20260123

입력:  podcast/{date}/ko/script.json
출력:  podcast/{date}/en/script.json

특징:
  - 전체 스크립트를 한 번에 번역 (문맥 파악 최적화)
  - 47개 턴을 1회 API 호출로 처리 (속도/비용 절감)
  - 대화 흐름과 연결성 유지
        """
    )
    parser.add_argument(
        "date",
        type=str,
        help="날짜 (YYYYMMDD 형식, 예: 20260123)"
    )
    parser.add_argument(
        "--prefix",
        type=str,
        default="TRANSLATE",
        help="환경변수 prefix (기본값: TRANSLATE, 예: TRANSLATE_GOOGLE_API_KEY)"
    )
    
    args = parser.parse_args()
    date = args.date.replace("-", "")
    
    # 날짜 검증
    if len(date) != 8 or not date.isdigit():
        print(f"❌ 잘못된 날짜 형식: {args.date}")
        print("   YYYYMMDD 형식으로 입력하세요 (예: 20260123)")
        sys.exit(1)
    
    # 환경 변수 로드
    load_env_from_yaml()
    load_dotenv(ROOT / ".env", override=False)
    
    # 번역 프롬프트 로드
    logger.info("Loading batch translation prompt...")
    try:
        system_prompt, user_template = load_batch_translation_prompt()
        logger.info(f"  System prompt: {len(system_prompt)} chars")
        logger.info(f"  User template: {len(user_template)} chars")
    except Exception as e:
        print(f"❌ Failed to load translation prompt: {e}")
        sys.exit(1)
    
    # LLM 초기화 (Gemini 2.5 Pro)
    logger.info("Initializing Gemini 2.5 Pro...")
    llm = build_llm(prefix=args.prefix, logger=logger)
    
    # 경로 설정
    korean_script = ROOT / "podcast" / date / "ko" / "script.json"
    english_script = ROOT / "podcast" / date / "en" / "script.json"
    
    print(f"\n🌏 한국어 → 영어 일괄 번역 시작 (Batch Mode)...")
    print(f"   날짜: {date}")
    print(f"   입력: {korean_script}")
    print(f"   출력: {english_script}")
    print(f"   모델: Gemini 2.5 Pro (prefix={args.prefix})")
    print(f"   방식: 전체 스크립트 일괄 번역 (1회 API 호출)\n")
    
    try:
        translate_script_batch(
            korean_script_path=korean_script,
            output_path=english_script,
            llm=llm,
            system_prompt=system_prompt,
            user_template=user_template
        )
        
        print(f"\n✅ 번역 완료!")
        print(f"   파일: {english_script}")
        print(f"\n💡 문맥 파악 최적화: 전체 대화 흐름을 고려하여 번역되었습니다.\n")
        
    except FileNotFoundError as e:
        print(f"\n❌ 파일을 찾을 수 없습니다:")
        print(f"   {e}")
        print(f"\n확인 사항:")
        print(f"  1. podcast/{date}/ko/script.json 파일이 있는지 확인")
        print(f"  2. orchestrator.py를 먼저 실행했는지 확인\n")
        sys.exit(1)
    
    except Exception as e:
        print(f"\n❌ 번역 실패:")
        print(f"   {type(e).__name__}: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
