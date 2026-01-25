#!/usr/bin/env python3
"""Spotify 팟캐스트 메타데이터 생성기

script.json을 읽어 Spotify 에피소드용 제목과 설명을 자동 생성합니다.

Usage:
    python web/scripts/generate-podcast-metadata.py 20260121
    uv run python web/scripts/generate-podcast-metadata.py 20260121
"""

import argparse
import json
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv

# 프로젝트 루트를 Python path에 추가
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from shared.utils.llm import build_llm
from shared.yaml_config import load_env_from_yaml


logger = logging.getLogger(__name__)


class PodcastMetadataGenerator:
    """팟캐스트 메타데이터 (제목, 설명) 생성기"""
    
    # Spotify 팟캐스트 베스트 프랙티스
    TITLE_MAX_LENGTH = 200
    DESCRIPTION_MAX_LENGTH = 4000
    
    def __init__(self, prefix: str = "PODCAST_METADATA"):
        """
        Args:
            prefix: 환경변수 prefix
        """
        self.llm = build_llm(prefix, logger=logger)
        self.root = ROOT
    
    def generate_metadata(self, date: str) -> dict:
        """
        팟캐스트 에피소드 메타데이터 생성
        
        Args:
            date: YYYYMMDD 형식
            
        Returns:
            {"title": str, "description": str}
            
        Raises:
            FileNotFoundError: script.json이 없을 때
        """
        logger.info(f"팟캐스트 메타데이터 생성 시작: date={date}")
        
        # 1. script.json 로드
        script_data = self._load_script_json(date)
        
        # 2. LLM으로 메타데이터 생성
        metadata = self._generate_with_llm(script_data, date)
        
        # 3. 파일 저장
        self._save_metadata(date, metadata)
        
        logger.info(f"✅ 메타데이터 생성 완료")
        return metadata
    
    def _load_script_json(self, date: str) -> dict:
        """script.json 로드"""
        script_path = self.root / "podcast" / date / "script.json"
        
        if not script_path.exists():
            raise FileNotFoundError(f"script.json을 찾을 수 없습니다: {script_path}")
        
        return json.loads(script_path.read_text(encoding='utf-8'))
    
    def _generate_with_llm(self, script_data: dict, date: str) -> dict:
        """LLM으로 설명 생성 (제목은 nutshell 사용)"""
        
        # title은 nutshell에서 직접 가져오기
        nutshell = script_data.get("nutshell", "")
        if not nutshell:
            raise ValueError("script.json에 nutshell이 없습니다")
        
        # 날짜 포맷팅 (YYYYMMDD -> YYYY.M.D)
        from datetime import datetime
        try:
            dt = datetime.strptime(date, "%Y%m%d")
            formatted_date = f"{dt.year}.{dt.month}.{dt.day}"
        except:
            formatted_date = date
        
        # title = 날짜 + nutshell
        title = f"{formatted_date} 미국 증시 장마감 | {nutshell}"
        
        # YAML 프롬프트 로드
        prompt_config = self._load_prompt_yaml()
        
        # 전체 scripts
        scripts = script_data.get("scripts", [])
        script_summary = self._extract_script_summary(scripts)
        
        # keywords 추출
        keywords = self._extract_keywords(scripts)
        
        # 프롬프트 조립 (description만 생성)
        prompt = f"""{prompt_config.get('system', '')}

{prompt_config.get('critical_rules', '')}

{prompt_config.get('description_guide', '')}

{prompt_config.get('output_format', '')}

---

{prompt_config.get('user_template', '').format(date=date, nutshell=nutshell, script_summary=script_summary)}
"""
        
        response = self.llm.invoke(prompt)
        
        # JSON 파싱
        llm_output = self._parse_metadata_response(response.content)
        
        # title은 nutshell 기반으로 교체, description만 LLM 사용
        metadata = {
            "title": title,
            "description": llm_output.get("description", ""),
            "keywords": keywords
        }
        
        # 길이 검증
        self._validate_metadata(metadata)
        
        return metadata
    
    def _load_prompt_yaml(self) -> dict:
        """프롬프트 YAML 파일 로드"""
        import yaml
        prompt_path = self.root / "web" / "scripts" / "prompts" / "metadata.yaml"
        
        if not prompt_path.exists():
            raise FileNotFoundError(f"프롬프트 파일을 찾을 수 없습니다: {prompt_path}")
        
        return yaml.safe_load(prompt_path.read_text(encoding='utf-8'))
    
    def _extract_script_summary(self, scripts: list) -> str:
        """스크립트 전체를 JSON으로 반환 (Gemini 2.5 Pro는 context 충분)"""
        if not scripts:
            return "(스크립트 없음)"
        
        # 전체 scripts를 JSON으로 제공 (자르지 않음)
        import json
        return json.dumps(scripts, ensure_ascii=False, indent=2)
    
    def _extract_keywords(self, scripts: list) -> str:
        """script에서 키워드 추출 (티커, 회사명 등)"""
        keywords = set()
        
        # 기본 키워드
        keywords.add("미국증시")
        keywords.add("장마감")
        keywords.add("주식")
        
        # scripts에서 티커 추출
        for script in scripts:
            sources = script.get("sources", [])
            for source in sources:
                if source.get("type") == "chart":
                    ticker = source.get("ticker", "")
                    if ticker and not ticker.startswith("^"):  # 지수 제외
                        keywords.add(ticker)
        
        # 2-15자 검증 및 정렬
        valid_keywords = [kw for kw in keywords if 2 <= len(kw) <= 15]
        valid_keywords.sort()
        
        # 각 키워드 뒤에 쉼표
        return ", ".join(valid_keywords) + ","
    
    def _parse_metadata_response(self, llm_response: str) -> dict:
        """LLM 응답에서 JSON 파싱"""
        import re
        
        # JSON 블록 추출
        if "```json" in llm_response:
            match = re.search(r'```json\s*\n(.*?)\n```', llm_response, re.DOTALL)
            if match:
                json_str = match.group(1)
            else:
                raise ValueError("JSON 블록을 찾을 수 없습니다")
        elif "```" in llm_response:
            match = re.search(r'```\s*\n(.*?)\n```', llm_response, re.DOTALL)
            if match:
                json_str = match.group(1)
            else:
                json_str = llm_response
        else:
            json_str = llm_response
        
        # JSON 파싱
        try:
            metadata = json.loads(json_str.strip())
        except json.JSONDecodeError as e:
            logger.error(f"JSON 파싱 실패: {e}")
            logger.error(f"응답 내용: {llm_response[:500]}")
            raise ValueError(f"LLM 응답을 JSON으로 파싱할 수 없습니다: {e}")
        
        # 필수 필드 확인
        if "title" not in metadata or "description" not in metadata:
            raise ValueError("title 또는 description 필드가 없습니다")
        
        return metadata
    
    def _validate_metadata(self, metadata: dict):
        """메타데이터 길이 검증"""
        title = metadata.get("title", "")
        description = metadata.get("description", "")
        
        if len(title) > self.TITLE_MAX_LENGTH:
            logger.warning(f"제목이 {self.TITLE_MAX_LENGTH}자를 초과합니다 ({len(title)}자). 잘라냅니다.")
            metadata["title"] = title[:self.TITLE_MAX_LENGTH]
        
        if len(description) > self.DESCRIPTION_MAX_LENGTH:
            logger.warning(f"설명이 {self.DESCRIPTION_MAX_LENGTH}자를 초과합니다 ({len(description)}자). 잘라냅니다.")
            metadata["description"] = description[:self.DESCRIPTION_MAX_LENGTH]
    
    def _save_metadata(self, date: str, metadata: dict):
        """메타데이터 파일 저장"""
        
        # podcast/{date}/metadata.json 저장 (API용)
        podcast_dir = self.root / "podcast" / date
        podcast_dir.mkdir(parents=True, exist_ok=True)
        
        metadata_path = podcast_dir / "metadata.json"
        metadata_path.write_text(
            json.dumps(metadata, ensure_ascii=False, indent=2),
            encoding='utf-8'
        )
        
        logger.info(f"메타데이터 저장: {metadata_path}")
        
        # podcast/{date}/metadata.txt 저장 (복사-붙여넣기용, 실제 줄바꿈)
        txt_path = podcast_dir / "metadata.txt"
        txt_content = f"""제목:
{metadata['title']}

설명:
{metadata['description']}

키워드:
{metadata.get('keywords', '')}
"""
        txt_path.write_text(txt_content, encoding='utf-8')
        
        logger.info(f"텍스트 파일 저장: {txt_path}")


def main():
    """CLI 엔트리포인트"""
    
    # 로깅 설정
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s"
    )
    
    # 인자 파싱
    parser = argparse.ArgumentParser(
        description="Spotify 팟캐스트 에피소드 메타데이터 생성",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예제:
  python web/scripts/generate-podcast-metadata.py 20260121
  uv run python web/scripts/generate-podcast-metadata.py 20260121
  
생성 위치:
  podcast/{date}/metadata.json
        """
    )
    parser.add_argument(
        "date",
        type=str,
        help="날짜 (YYYYMMDD 형식, 예: 20260121)"
    )
    parser.add_argument(
        "--prefix",
        type=str,
        default="PODCAST_METADATA",
        help="환경변수 prefix (기본값: PODCAST_METADATA)"
    )
    
    args = parser.parse_args()
    
    # 환경 변수 로드
    load_env_from_yaml()
    load_dotenv(ROOT / ".env", override=False)
    
    # 날짜 검증
    date = args.date.replace("-", "")
    if len(date) != 8 or not date.isdigit():
        print(f"❌ 잘못된 날짜 형식: {args.date}")
        print("   YYYYMMDD 형식으로 입력하세요 (예: 20260121)")
        sys.exit(1)
    
    try:
        # 메타데이터 생성
        generator = PodcastMetadataGenerator(prefix=args.prefix)
        
        print(f"\n🚀 팟캐스트 메타데이터 생성 시작...")
        print(f"   날짜: {date}")
        print(f"   환경변수 prefix: {args.prefix}\n")
        
        metadata = generator.generate_metadata(date)
        
        print(f"\n✅ 메타데이터 생성 완료!\n")
        print(f"📌 제목 ({len(metadata['title'])}자):")
        print(f"   {metadata['title']}\n")
        print(f"📝 설명 ({len(metadata['description'])}자):")
        print(f"{metadata['description']}\n")
        print(f"🏷️  키워드:")
        print(f"   {metadata.get('keywords', '')}\n")
        print(f"💾 저장 위치:")
        print(f"   podcast/{date}/metadata.json (JSON)")
        print(f"   podcast/{date}/metadata.txt (Spotify 업로드용)\n")
        
    except FileNotFoundError as e:
        print(f"\n❌ 파일을 찾을 수 없습니다:")
        print(f"   {e}")
        print(f"\n확인 사항:")
        print(f"  1. podcast/{date}/script.json 파일이 있는지 확인")
        print(f"  2. orchestrator.py를 먼저 실행했는지 확인\n")
        sys.exit(1)
    
    except ValueError as e:
        print(f"\n❌ 메타데이터 생성 실패:")
        print(f"   {e}")
        print(f"\n재시도:")
        print(f"  1. OpenAI API 키가 설정되었는지 확인 (.env)")
        print(f"  2. .env에서 OPENAI_MODEL 확인\n")
        sys.exit(1)
    
    except Exception as e:
        print(f"\n❌ 예상치 못한 오류:")
        print(f"   {type(e).__name__}: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
