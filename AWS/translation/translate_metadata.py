#!/usr/bin/env python3
"""
한국어 팟캐스트 메타데이터를 영어로 번역

Usage:
    python AWS/translation/translate_metadata.py 20260123
    uv run python AWS/translation/translate_metadata.py 20260123 
"""

import argparse
import json
import logging
import sys
import yaml
from pathlib import Path

from dotenv import load_dotenv

# 프로젝트 루트를 Python path에 추가
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from shared.utils.llm import build_llm
from shared.yaml_config import load_env_from_yaml

logger = logging.getLogger(__name__)


def load_metadata_translation_prompt() -> tuple[str, str]:
    """
    메타데이터 번역 프롬프트 YAML 파일 로드
    
    Returns:
        (system_prompt, user_template) 튜플
    """
    prompt_path = Path(__file__).parent / "prompt" / "metadata_translation.yaml"
    
    if not prompt_path.exists():
        raise FileNotFoundError(f"Metadata translation prompt not found: {prompt_path}")
    
    with open(prompt_path, 'r', encoding='utf-8') as f:
        prompt_data = yaml.safe_load(f)
    
    system = prompt_data.get("system", "")
    guidelines = prompt_data.get("guidelines", "")
    user_template = prompt_data.get("user_template", "{title}\n{description}")
    
    # system + guidelines 합치기
    full_system = f"{system}\n\n{guidelines}"
    
    return full_system, user_template


def translate_metadata(
    korean_metadata_path: Path,
    output_path: Path,
    llm: any
) -> dict:
    """
    한국어 metadata.json을 영어로 번역
    
    Args:
        korean_metadata_path: 한국어 metadata.json 경로
        output_path: 영어 metadata.json 저장 경로
        llm: LangChain LLM instance
        
    Returns:
        번역된 metadata 딕셔너리
    """
    logger.info(f"Loading Korean metadata: {korean_metadata_path}")
    
    if not korean_metadata_path.exists():
        raise FileNotFoundError(f"Korean metadata not found: {korean_metadata_path}")
    
    # 한국어 메타데이터 로드
    with open(korean_metadata_path, 'r', encoding='utf-8') as f:
        korean_data = json.load(f)
    
    korean_title = korean_data.get("title", "")
    korean_description = korean_data.get("description", "")
    
    if not korean_title or not korean_description:
        raise ValueError("Korean metadata missing title or description")
    
    # 프롬프트 로드
    system_prompt, user_template = load_metadata_translation_prompt()
    
    # 프롬프트 생성
    user_message = user_template.format(
        title=korean_title,
        description=korean_description
    )
    
    full_prompt = f"{system_prompt}\n\n{user_message}"
    
    logger.info("Translating metadata...")
    logger.info(f"  KO Title: {korean_title}")
    
    try:
        # LLM 호출
        response = llm.invoke(full_prompt)
        raw_response = response.content.strip()
        
        # JSON 추출
        json_str = raw_response
        
        # 코드 블록 제거
        if json_str.startswith("```json"):
            json_str = json_str.replace("```json", "").replace("```", "").strip()
        elif json_str.startswith("```"):
            json_str = json_str.replace("```", "").strip()
        
        # JSON 파싱
        try:
            translated = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            logger.error(f"Response: {json_str[:500]}")
            raise ValueError(f"LLM returned invalid JSON: {e}")
        
        # 필수 필드 확인
        if "title" not in translated or "description" not in translated:
            raise ValueError("Translated metadata missing title or description")
        
        # keywords는 한국어 것을 그대로 유지 (ticker는 언어 무관)
        english_data = {
            "title": translated["title"],
            "description": translated["description"],
            "keywords": korean_data.get("keywords", "")
        }
        
        # 영어 메타데이터 저장
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(english_data, f, ensure_ascii=False, indent=2)
        
        # metadata.txt도 생성
        txt_path = output_path.parent / "metadata.txt"
        txt_content = f"""Title:
{english_data['title']}

Description:
{english_data['description']}

Keywords:
{english_data.get('keywords', '')}
"""
        txt_path.write_text(txt_content, encoding='utf-8')
        
        logger.info(f"✅ English metadata saved: {output_path}")
        logger.info(f"  EN Title: {english_data['title']}")
        
        return english_data
        
    except Exception as e:
        logger.error(f"Metadata translation failed: {e}")
        raise


def main():
    """CLI 엔트리포인트"""
    
    # 로깅 설정
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s"
    )
    
    parser = argparse.ArgumentParser(
        description="한국어 팟캐스트 메타데이터를 영어로 번역",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예제:
  python AWS/translation/translate_metadata.py 20260123
  uv run python AWS/translation/translate_metadata.py 20260123

입력:  podcast/{date}/ko/metadata.json
출력:  podcast/{date}/en/metadata.json
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
        help="환경변수 prefix (기본값: TRANSLATE)"
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
    
    # LLM 초기화
    logger.info("Initializing Gemini 2.5 Pro...")
    llm = build_llm(prefix=args.prefix, logger=logger)
    
    # 경로 설정
    korean_metadata = ROOT / "podcast" / date / "ko" / "metadata.json"
    english_metadata = ROOT / "podcast" / date / "en" / "metadata.json"
    
    print(f"\n🌏 메타데이터 한국어 → 영어 번역...")
    print(f"   날짜: {date}")
    print(f"   입력: {korean_metadata}")
    print(f"   출력: {english_metadata}\n")
    
    try:
        translate_metadata(
            korean_metadata_path=korean_metadata,
            output_path=english_metadata,
            llm=llm
        )
        
        print(f"\n✅ 메타데이터 번역 완료!")
        print(f"   파일: {english_metadata}\n")
        
    except FileNotFoundError as e:
        print(f"\n❌ 파일을 찾을 수 없습니다:")
        print(f"   {e}")
        print(f"\n확인 사항:")
        print(f"  1. podcast/{date}/ko/metadata.json 파일이 있는지 확인")
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
