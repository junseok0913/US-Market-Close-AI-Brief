"""슬라이드 자동 생성 모듈

script.json을 LLM에 입력하여 web/src/landing/{date}/slides.ts 생성
"""

import json
import logging
import re
from pathlib import Path
from typing import Optional

from langchain_openai import ChatOpenAI

from shared.utils.llm import build_llm

logger = logging.getLogger(__name__)

# 프로젝트 루트
ROOT = Path(__file__).resolve().parent.parent.parent


class SlideGenerator:
    """슬라이드 생성기"""
    
    def __init__(self, prefix: str = "SLIDE"):
        """
        Args:
            prefix: 환경변수 prefix (예: SLIDE_OPENAI_MODEL)
                   기본값은 OPENAI_MODEL=gpt-5.1 사용
        """
        self.llm = build_llm(prefix, logger=logger)
        self.root = ROOT
    
    def generate_slides_for_date(
        self, 
        date: str,
        max_retries: int = 3
    ) -> Path:
        """
        특정 날짜의 슬라이드 생성
        
        Args:
            date: YYYYMMDD 형식
            max_retries: 최대 재시도 횟수
            
        Returns:
            생성된 slides.ts 파일 경로
            
        Raises:
            FileNotFoundError: script.json이 없을 때
            ValueError: LLM 응답 파싱 실패
        """
        logger.info(f"슬라이드 생성 시작: date={date}")
        
        # 1. 입력 파일 로드
        script_data = self._load_script_json(date)
        type_definitions = self._load_type_definitions()
        example_slides = self._load_example_slides()
        
        # 2. LLM으로 슬라이드 생성 (재시도 로직)
        for attempt in range(max_retries):
            try:
                logger.info(f"LLM 호출 시도 {attempt + 1}/{max_retries}")
                slides_code = self._generate_with_llm(
                    script_data, 
                    type_definitions, 
                    example_slides,
                    date
                )
                break
            except Exception as e:
                logger.warning(f"시도 {attempt + 1} 실패: {e}")
                if attempt == max_retries - 1:
                    raise ValueError(f"슬라이드 생성 실패 (최대 재시도 초과): {e}")
        
        # 3. 파일 저장
        output_path = self._save_slides_file(date, slides_code)
        
        logger.info(f"✅ 슬라이드 생성 완료: {output_path}")
        return output_path
    
    def _load_script_json(self, date: str) -> dict:
        """script.json 로드"""
        script_path = self.root / "podcast" / date / "ko" / "script.json"
        
        if not script_path.exists():
            raise FileNotFoundError(f"script.json을 찾을 수 없습니다: {script_path}")
        
        return json.loads(script_path.read_text(encoding='utf-8'))
    
    def _load_type_definitions(self) -> str:
        """TypeScript 타입 정의 로드"""
        type_path = self.root / "web" / "src" / "types" / "slide.ts"
        
        if not type_path.exists():
            logger.warning(f"타입 정의 파일 없음: {type_path}")
            return ""
        
        return type_path.read_text(encoding='utf-8')
    
    def _load_example_slides(self) -> str:
        """예제 슬라이드 로드 (20251222)"""
        example_path = self.root / "web" / "src" / "landing" / "20251222" / "slides.ts"
        
        if not example_path.exists():
            logger.warning(f"예제 슬라이드 파일 없음: {example_path}")
            return ""
        
        # 파일이 너무 크면 일부만 로드 (처음 5000자)
        content = example_path.read_text(encoding='utf-8')
        if len(content) > 5000:
            content = content[:5000] + "\n  // ... (생략)"
        
        return content
    
    def _generate_with_llm(
        self, 
        script_data: dict,
        type_definitions: str,
        example_slides: str,
        date: str
    ) -> str:
        """LLM으로 슬라이드 코드 생성"""
        
        # script_data를 간결하게 정리 (너무 길면 잘라냄)
        script_json = json.dumps(script_data, ensure_ascii=False, indent=2)
        if len(script_json) > 50000:
            # scripts 배열을 일부만 포함
            limited_data = {
                **script_data,
                "scripts": script_data["scripts"][:30] + [
                    {"note": "... (중간 생략, 총 {}개 scripts)".format(len(script_data["scripts"]))}
                ]
            }
            script_json = json.dumps(limited_data, ensure_ascii=False, indent=2)
        
        prompt = f"""당신은 주식 시장 브리핑 데이터를 시각화 슬라이드로 변환하는 전문가입니다.

# 입력 데이터
다음은 {date} 브리핑 스크립트입니다:

```json
{script_json}
```

# TypeScript 타입 정의
슬라이드는 다음 타입을 따라야 합니다:

```typescript
{type_definitions}
```

# 참고 예제
다음은 과거 날짜의 슬라이드 예제입니다 (구조 참고용):

```typescript
{example_slides}
```

# 작업 지시

1. **슬라이드 생성 규칙**:
   - 첫 슬라이드: `type: 'title'` (date, nutshell, description)
   - 시장 요약: `type: 'market-summary'` (지수, 상품 데이터 - text에서 수치 추출)
   - 테마별 뉴스: `type: 'headline'` (주요 섹션마다)
   - 종목 분석: `type: 'ticker-intro'`, `type: 'ticker-analysis'` (user_tickers 활용)
   - 마무리: `type: 'closing'`

2. **데이터 추출 방법**:
   - `scripts[].text`에서 핵심 수치와 내용 추출
   - `scripts[].sources`를 활용 (chart → charts, article → bullets)
   - `chapter` 정보로 슬라이드 그룹핑
   - **[중요] 투자의견(BUY/SELL) 대신 `outlook` 사용**:
     - `action` 필드는 삭제되었습니다. 절대 사용하지 마세요.
     - 대신 `outlook` 필드에 해당 종목의 현재 상황을 1-2단어로 요약하세요.
     - 예: "Earnings Surprise", "High Risk", "Stable Growth", "AI Momentum", "Margin Pressure"
     - `outlookColor`는 분위기에 맞춰 지정: 'emerald'(호재), 'rose'(악재), 'blue'(중립/안정), 'purple'(혁신/성장), 'amber'(주의)

7. **[법적 필터링] 텍스트 표현 가이드라인 (매우 중요)**:
   - **타이틀 금지:** "최종 투자 의견", "매수/매도 전략", "강력 추천" 같은 표현 절대 금지.
     - 대신 "종합 분석 요약", "핵심 관전 포인트", "주요 리스크 및 기회" 등으로 작성하세요.
   - **단정적 표현 금지:** "명백한", "확실한", "무조건", "과도한" 같은 확정적 형용사 사용 금지.
     - 대신 "~할 가능성이 있습니다", "~로 관찰됩니다", "~한 우려가 제기됩니다" 등 객관적/관찰자 시점으로 작성하세요.
   - **Hallucination 주의:** 대본에 없는 내용을 창작하지 마세요.

3. **티커 심볼 변환 (중요!)**:
   TradingView 위젯을 위해 Yahoo Finance 티커를 변환하세요:
   - `^TNX` → `TVC:US10Y` (미 10년물 국채 금리)
   - `^GSPC` → `SP:SPX` (S&P 500)
   - `^DJI` → `DJ:DJI` (다우존스)
   - `^IXIC` → `NASDAQ:IXIC` (나스닥)
   - `^RUT` → `TVC:RUT` (러셀2000)
   - `DX-Y.NYB` → `TVC:DXY` (달러 인덱스)
   - `GLD` → `AMEX:GLD` (금 ETF)
   - 기타 일반 주식: 그대로 사용 (예: `AAPL`, `GOOGL`)

4. **슬라이드 개수**: 최소 10개, 최대 25개 생성

5. **turnId 매핑**: 각 슬라이드의 `turnId`는 해당 `scripts[].id`와 일치해야 함

6. **출력 형식**: 완전한 TypeScript 파일 코드를 작성하세요.
   - `import type {{ Slide }} from '@/types/slide';` 포함
   - `export const slides: Slide[] = [...]` 형식

# 중요 사항
- JSON이 아닌 **완전한 TypeScript 코드**로 작성
- 따옴표는 **작은따옴표(')** 사용
- 들여쓰기는 **스페이스 2칸**
- 모든 슬라이드는 위의 타입 정의를 정확히 준수
- **`action` 필드 절대 사용 금지** -> `outlook` 사용
- **'최종 투자 의견' 사용 금지** -> '종합 요약' 등 중립적 표현 사용

이제 {date} 날짜의 slides.ts 파일 코드를 생성해주세요:
"""
        
        response = self.llm.invoke(prompt)
        slides_code = self._extract_typescript_code(response.content)
        
        # 후처리: 티커 변환 강제 적용
        slides_code = self._post_process_tickers(slides_code)
        
        return slides_code
    
    def _post_process_tickers(self, slides_code: str) -> str:
        """티커 심볼 후처리 (2차 안전장치)
        
        LLM이 놓친 Yahoo Finance 티커를 TradingView 형식으로 강제 변환
        """
        ticker_map = {
            "'^TNX'": "'TVC:US10Y'",
            "'^GSPC'": "'SP:SPX'",
            "'^DJI'": "'DJ:DJI'",
            "'^IXIC'": "'NASDAQ:IXIC'",
            "'^RUT'": "'TVC:RUT'",
            "'DX-Y.NYB'": "'TVC:DXY'",
            "'GLD'": "'AMEX:GLD'",
            # 더블 쿼트 버전도 처리
            '"^TNX"': '"TVC:US10Y"',
            '"^GSPC"': '"SP:SPX"',
            '"^DJI"': '"DJ:DJI"',
            '"^IXIC"': '"NASDAQ:IXIC"',
            '"^RUT"': '"TVC:RUT"',
            '"DX-Y.NYB"': '"TVC:DXY"',
            '"GLD"': '"AMEX:GLD"',
        }
        
        for yahoo_ticker, tv_ticker in ticker_map.items():
            slides_code = slides_code.replace(yahoo_ticker, tv_ticker)
        
        logger.info("티커 심볼 후처리 완료")
        return slides_code
    
    def _extract_typescript_code(self, llm_response: str) -> str:
        """LLM 응답에서 TypeScript 코드 추출"""
        
        # 코드 블록에서 추출
        if "```typescript" in llm_response:
            match = re.search(r'```typescript\s*\n(.*?)\n```', llm_response, re.DOTALL)
            if match:
                return match.group(1).strip()
        
        if "```ts" in llm_response:
            match = re.search(r'```ts\s*\n(.*?)\n```', llm_response, re.DOTALL)
            if match:
                return match.group(1).strip()
        
        if "```" in llm_response:
            match = re.search(r'```\s*\n(.*?)\n```', llm_response, re.DOTALL)
            if match:
                code = match.group(1).strip()
                # TypeScript 코드인지 확인
                if "import type" in code and "export const slides" in code:
                    return code
        
        # 코드 블록 없이 바로 코드만 있는 경우
        if "import type" in llm_response and "export const slides" in llm_response:
            return llm_response.strip()
        
        raise ValueError("LLM 응답에서 TypeScript 코드를 찾을 수 없습니다")
    
    def _save_slides_file(self, date: str, slides_code: str) -> Path:
        """slides.ts 파일 저장"""
        
        # 출력 디렉토리 생성
        output_dir = self.root / "web" / "src" / "landing" / date
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # 파일 저장
        output_path = output_dir / "slides.ts"
        output_path.write_text(slides_code, encoding='utf-8')
        
        logger.info(f"파일 저장됨: {output_path}")
        
        return output_path
    
    def update_landing_index(self, date: str):
        """landing/index.ts 자동 업데이트"""
        
        index_path = self.root / "web" / "src" / "landing" / "index.ts"
        
        if not index_path.exists():
            logger.warning(f"index.ts를 찾을 수 없습니다: {index_path}")
            return
        
        content = index_path.read_text(encoding='utf-8')
        
        # 이미 import가 있는지 확인
        import_line = f"import {{ slides as slides{date} }} from './{date}/slides';"
        if import_line in content:
            logger.info(f"index.ts에 이미 {date} import가 있습니다")
            return
        
        # import 추가 (마지막 import 다음에)
        import_pattern = r"(import\s+\{[^}]+\}\s+from\s+'.+';)"
        matches = list(re.finditer(import_pattern, content))
        
        if matches:
            last_import = matches[-1]
            insert_pos = last_import.end()
            content = (
                content[:insert_pos] + 
                f"\n{import_line}" + 
                content[insert_pos:]
            )
        else:
            # import가 없으면 맨 위에 추가
            content = import_line + "\n\n" + content
        
        # slidesMap에 항목 추가
        map_pattern = r'const slidesMap: Record<string, Slide\[\]> = \{'
        map_match = re.search(map_pattern, content)
        
        if map_match:
            # 기존 map에 추가
            insert_pos = map_match.end()
            
            # 이미 항목이 있는지 확인
            if f"'{date}':" in content:
                logger.info(f"index.ts에 이미 {date} 항목이 있습니다")
            else:
                entry = f"\n  '{date}': slides{date},"
                content = (
                    content[:insert_pos] + 
                    entry + 
                    content[insert_pos:]
                )
        
        # 파일 저장
        index_path.write_text(content, encoding='utf-8')
        logger.info(f"✅ index.ts 업데이트 완료")
