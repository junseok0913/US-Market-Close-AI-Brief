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
        """LLM으로 제목과 설명 생성"""
        
        # nutshell 추출
        nutshell = script_data.get("nutshell", "")
        
        # 주요 섹션/테마 추출
        scripts = script_data.get("scripts", [])
        chapters = script_data.get("chapter", [])
        
        # 간략한 스크립트 요약 (너무 길면 일부만)
        script_summary = self._extract_script_summary(scripts)
        
        prompt = f"""당신은 금융 뉴스 및 팟캐스트 메타데이터 작성 전문가입니다.

# 브리핑 정보 ({date})

**한줄 요약:**
{nutshell}

**스크립트 주요 내용:**
{script_summary}

---

# 작성 가이드

## 제목 작성 원칙:
1. **길이**: 최대 200자 (권장: 50-80자)
2. **명확성**: 핵심 내용을 즉시 파악 가능하게
3. **키워드**: "미국 증시", "장마감", "S&P500", "나스닥" 등 검색 키워드 포함
4. **날짜**: 날짜 명시 (예: "1월 21일" 또는 "2026.1.21")
5. **구체성**: 막연한 표현보다 구체적 수치/사건 언급

**좋은 제목 예시:**
- "2026.1.21 장마감 | 나스닥 2% 급락, 빅테크 실적 부진"
- "미국 증시 1월 21일 | S&P500 하락 전환, 기술주 랠리 종료"
- "장마감 브리핑 (1/21) | 연준 매파 발언에 증시 혼조세"

**피해야 할 것:**
- 클릭베이트성 과장 표현
- 이모티콘 사용
- 너무 짧거나 모호한 제목

---

## 설명 작성 원칙:
1. **길이**: 최대 4000자 (권장: 300-800자)
2. **구조**:
   - **첫 문단**: 핵심 요약 (1-3문장, 오늘의 가장 중요한 포인트)
   - **주요 지수**: 주요 지수 등락 정리
   - **주요 이슈/뉴스**: 섹션별 핵심 내용 (3-5개 불릿)
   - **주요 종목**: 언급된 개별 종목 분석 (있을 경우)
   - **마무리**: 시사점 또는 투자자 관점 (선택사항)

3. **톤**: 전문적이지만 이해하기 쉽게
4. **형식**: 
   - 불릿 포인트(-) 사용
   - 섹션 제목은 간결하게
   - 숫자/퍼센트는 명확하게 표시
5. **금지사항**:
   - 이모티콘 사용 금지
   - "여러분", "~합니다" 같은 구어체 최소화
   - 제목 내용 그대로 반복 금지

**좋은 설명 예시:**
```
나스닥이 2% 급락하며 기술주 랠리에 제동이 걸렸습니다. 주요 빅테크 기업의 실적 부진과 국채 금리 상승이 주요 원인으로 분석됩니다.

주요 지수
- S&P 500: -1.2% (5,234.56)
- 나스닥: -2.1% (16,789.23)
- 다우존스: -0.4% (43,567.89)
- 러셀2000: -0.8%

주요 이슈
- 테슬라 실적 쇼크: 4분기 매출 가이던스 하향 조정, 주가 -8%
- 10년물 국채 금리 4.5% 돌파, 달러 강세 지속
- 연준 위원들 긴축 기조 재확인, 금리 인하 기대 약화
- 중국 경기 둔화 우려 지속, 원자재 가격 혼조세

주요 종목
- NVDA: AI 반도체 수요 둔화 우려로 -3.2%
- AAPL: 중국 판매 부진 지속, -2.1%
- MSFT: 클라우드 성장 둔화 우려, -1.8%
- TSLA: 실적 가이던스 하향, -8.4%

이번 하락은 지난 3주간의 상승분을 일부 반납하는 조정으로 해석되며, 향후 연준의 통화정책 방향과 빅테크 실적 시즌이 시장의 방향성을 결정할 전망입니다.
```

---

# 작업 지시

위의 브리핑 정보를 바탕으로 **한국어**로 작성하세요:

1. **title**: 
   - 200자 이내
   - 날짜 포함
   - 핵심만 간결하게
   - 전문적인 톤

2. **description**:
   - 4000자 이내
   - 위의 구조 따르기
   - 이모티콘 사용 금지
   - 불릿 포인트로 구조화
   - 자연스럽고 전문적인 톤

**출력 형식 (JSON)**:
```json
{{
  "title": "여기에 제목",
  "description": "여기에 설명"
}}
```

순수 JSON만 출력하세요.
"""
        
        response = self.llm.invoke(prompt)
        
        # JSON 파싱
        metadata = self._parse_metadata_response(response.content)
        
        # 길이 검증
        self._validate_metadata(metadata)
        
        return metadata
    
    def _extract_script_summary(self, scripts: list) -> str:
        """스크립트에서 주요 내용 추출"""
        if not scripts:
            return "(스크립트 없음)"
        
        # 챕터별로 그룹핑
        chapters_summary = []
        current_chapter = None
        chapter_texts = []
        
        for script in scripts[:50]:  # 최대 50개만 (너무 길면 잘림)
            chapter = script.get("chapter")
            text = script.get("text", "")
            
            if chapter != current_chapter:
                if current_chapter and chapter_texts:
                    chapters_summary.append(f"[{current_chapter}] {' / '.join(chapter_texts[:3])}")
                current_chapter = chapter
                chapter_texts = []
            
            # 짧은 요약만 추가 (긴 텍스트는 앞부분만)
            if len(text) > 150:
                text = text[:150] + "..."
            chapter_texts.append(text)
        
        # 마지막 챕터 추가
        if current_chapter and chapter_texts:
            chapters_summary.append(f"[{current_chapter}] {' / '.join(chapter_texts[:3])}")
        
        return "\n".join(chapters_summary)
    
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
