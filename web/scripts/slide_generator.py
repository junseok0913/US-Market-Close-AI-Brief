"""슬라이드 자동 생성 모듈

script.json을 LLM에 입력하여 web/src/landing/{date}/slides.ts 생성
"""

import json
import logging
import re
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

import pandas as pd
import yfinance as yf

from shared.utils.llm import build_llm
from shared.date_display import normalize_yyyymmdd

logger = logging.getLogger(__name__)

# 프로젝트 루트
ROOT = Path(__file__).resolve().parent.parent.parent
TARGET_SECONDS_PER_SLIDE = 70
SOFT_TURN_GAP_SECONDS = 50.0
HARD_TURN_GAP_SECONDS = 90.0
MIN_TARGET_SLIDES = 16
MAX_TARGET_SLIDES = 30
SLIDE_COUNT_MARGIN = 3
MIN_ALLOWED_SLIDES = 14
MAX_ALLOWED_SLIDES = 34


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
        max_retries: int = 3,
        max_repair_rounds: int = 2,
    ) -> Path:
        """
        특정 날짜의 슬라이드 생성

        다단계 전략:
        1) LLM 초안 생성
        2) 로컬 품질 검증(개수/분포/turnId)
        3) 이슈가 있으면 LLM 보정(repair) 반복
        """
        logger.info("슬라이드 생성 시작: date=%s", date)

        script_data = self._load_script_json(date)
        display_date = normalize_yyyymmdd(script_data.get("date")) or date
        type_definitions = self._load_type_definitions()
        example_slides = self._load_example_slides()

        target_slides = self._estimate_target_slide_count(script_data)
        quality_rules = self._build_quality_rules(script_data, target_slides)
        logger.info("슬라이드 목표 개수: %s", target_slides)

        last_error = ""
        for attempt in range(max_retries):
            try:
                logger.info("초안 생성 시도 %d/%d", attempt + 1, max_retries)
                slides_code = self._generate_with_llm(
                    script_data=script_data,
                    type_definitions=type_definitions,
                    example_slides=example_slides,
                    date=display_date,
                    target_slides=target_slides,
                    quality_rules=quality_rules,
                )
                slides_code = self._post_process_tickers(slides_code)
                slides_code = self._pin_title_slide_date(slides_code, display_date)
                slides_code = self._enrich_market_summary_indices(slides_code, date)
                slides_code = self._enrich_ticker_intro_prices(slides_code, date)

                analysis = self._analyze_slides_code(slides_code)
                issues = self._validate_slide_quality(script_data, analysis, quality_rules, slides_code)

                for repair_round in range(max_repair_rounds):
                    if not issues:
                        break

                    logger.warning(
                        "품질 보정 필요 (%d/%d): %s",
                        repair_round + 1,
                        max_repair_rounds,
                        "; ".join(issues),
                    )
                    slides_code = self._repair_with_llm(
                        script_data=script_data,
                        type_definitions=type_definitions,
                        existing_slides_code=slides_code,
                        date=display_date,
                        target_slides=target_slides,
                        quality_rules=quality_rules,
                        issues=issues,
                    )
                    slides_code = self._post_process_tickers(slides_code)
                    slides_code = self._pin_title_slide_date(slides_code, display_date)
                    slides_code = self._enrich_market_summary_indices(slides_code, date)
                    slides_code = self._enrich_ticker_intro_prices(slides_code, date)
                    analysis = self._analyze_slides_code(slides_code)
                    issues = self._validate_slide_quality(
                        script_data, analysis, quality_rules, slides_code
                    )

                if issues:
                    last_error = f"품질 기준 미달: {'; '.join(issues)}"
                    logger.warning("시도 %d 실패: %s", attempt + 1, last_error)
                    continue

                output_path = self._save_slides_file(date, slides_code)
                logger.info("✅ 슬라이드 생성 완료: %s", output_path)
                return output_path
            except Exception as e:
                last_error = str(e)
                logger.warning("시도 %d 실패: %s", attempt + 1, e)

        raise ValueError(f"슬라이드 생성 실패 (최대 재시도 초과): {last_error}")

    def _load_script_json(self, date: str) -> dict[str, Any]:
        """브리핑 JSON 로드 (time 정보가 포함된 {date}.json 우선)"""
        dated_path = self.root / "podcast" / date / "ko" / f"{date}.json"
        legacy_path = self.root / "podcast" / date / "ko" / "script.json"

        if dated_path.exists():
            logger.info("브리핑 입력 사용: %s", dated_path)
            return json.loads(dated_path.read_text(encoding="utf-8"))

        if legacy_path.exists():
            logger.info("브리핑 입력 사용: %s", legacy_path)
            return json.loads(legacy_path.read_text(encoding="utf-8"))

        raise FileNotFoundError(f"브리핑 JSON을 찾을 수 없습니다: {dated_path} or {legacy_path}")

    def _load_type_definitions(self) -> str:
        """TypeScript 타입 정의 로드"""
        type_path = self.root / "web" / "src" / "types" / "slide.ts"

        if not type_path.exists():
            logger.warning("타입 정의 파일 없음: %s", type_path)
            return ""

        return type_path.read_text(encoding="utf-8")

    def _load_example_slides(self) -> str:
        """예제 슬라이드 로드 (20251222)"""
        example_path = self.root / "web" / "src" / "landing" / "20251222" / "slides.ts"

        if not example_path.exists():
            logger.warning("예제 슬라이드 파일 없음: %s", example_path)
            return ""

        content = example_path.read_text(encoding="utf-8")
        if len(content) > 5000:
            content = content[:5000] + "\n  // ... (생략)"
        return content

    def _estimate_target_slide_count(self, script_data: dict[str, Any]) -> int:
        scripts = script_data.get("scripts", [])
        end_ms = 0
        for script in scripts:
            time_range = script.get("time", [])
            if isinstance(time_range, list) and len(time_range) == 2:
                end_ms = max(end_ms, int(time_range[1]))

        duration_sec = end_ms / 1000 if end_ms > 0 else max(300, len(scripts) * 25)
        target = round(duration_sec / TARGET_SECONDS_PER_SLIDE)
        return max(MIN_TARGET_SLIDES, min(MAX_TARGET_SLIDES, target))

    def _build_quality_rules(self, script_data: dict[str, Any], target_slides: int) -> dict[str, Any]:
        ticker_count = len(script_data.get("user_tickers") or [])
        min_ticker_analysis = 2 if ticker_count == 0 else min(4, ticker_count)

        return {
            "target_slides": target_slides,
            "min_total": max(MIN_ALLOWED_SLIDES, target_slides - SLIDE_COUNT_MARGIN),
            "max_total": min(MAX_ALLOWED_SLIDES, target_slides + SLIDE_COUNT_MARGIN),
            "max_headline_ratio": 0.40,
            "soft_turn_gap_seconds": SOFT_TURN_GAP_SECONDS,
            "hard_turn_gap_seconds": HARD_TURN_GAP_SECONDS,
            "min_type_counts": {
                "title": 1,
                "market-summary": 1,
                "headline": 2,
                "comparison": 2 if target_slides >= 18 else 1,
                "stats": 2 if target_slides >= 16 else 1,
                "events": 1,
                "ticker-intro": 1,
                "ticker-analysis": min_ticker_analysis,
                "closing": 1,
            },
            "min_unique_types": 8,
        }

    def _compact_script_json(self, script_data: dict[str, Any]) -> str:
        script_json = json.dumps(script_data, ensure_ascii=False, indent=2)
        if len(script_json) <= 50000:
            return script_json

        scripts = script_data.get("scripts", [])
        if len(scripts) <= 40:
            return script_json

        compact = {
            **script_data,
            "scripts": (
                scripts[:20]
                + [{"note": f"... (중간 생략, 총 {len(scripts)}개 scripts)"}]
                + scripts[-20:]
            ),
        }
        return json.dumps(compact, ensure_ascii=False, indent=2)

    def _format_rules_for_prompt(self, quality_rules: dict[str, Any]) -> str:
        min_type_counts = quality_rules["min_type_counts"]
        lines = [
            f"- 총 슬라이드: {quality_rules['min_total']}~{quality_rules['max_total']}개 (목표 {quality_rules['target_slides']}개)",
            f"- headline 비중: 전체의 {int(quality_rules['max_headline_ratio'] * 100)}% 이하",
            (
                f"- turnId 간격: 권장 {int(quality_rules.get('soft_turn_gap_seconds', SOFT_TURN_GAP_SECONDS))}초 이하, "
                f"절대 상한 {int(quality_rules.get('hard_turn_gap_seconds', HARD_TURN_GAP_SECONDS))}초 이하"
            ),
        ]
        lines.extend([f"- {key}: 최소 {value}개" for key, value in min_type_counts.items()])
        lines.append(f"- 고유 타입 수: 최소 {quality_rules['min_unique_types']}개")
        return "\n".join(lines)

    def _generate_with_llm(
        self,
        script_data: dict[str, Any],
        type_definitions: str,
        example_slides: str,
        date: str,
        target_slides: int,
        quality_rules: dict[str, Any],
    ) -> str:
        """LLM으로 슬라이드 코드 초안 생성"""
        script_json = self._compact_script_json(script_data)
        rule_text = self._format_rules_for_prompt(quality_rules)
        soft_turn_gap_seconds = int(
            quality_rules.get("soft_turn_gap_seconds", SOFT_TURN_GAP_SECONDS)
        )
        hard_turn_gap_seconds = int(
            quality_rules.get("hard_turn_gap_seconds", HARD_TURN_GAP_SECONDS)
        )

        prompt = f"""당신은 주식 시장 브리핑 데이터를 시각화 슬라이드로 변환하는 전문가입니다.

# 입력 데이터
다음은 {date} 브리핑 스크립트입니다:

```json
{script_json}
```

# TypeScript 타입 정의
```typescript
{type_definitions}
```

# 참고 예제 (구조 참고용)
```typescript
{example_slides}
```

# 품질 목표 (엄격히 준수)
{rule_text}

# 작업 지시
1. 슬라이드 구성:
   - 첫 슬라이드: `type: 'title'`
   - 시장 요약: `type: 'market-summary'`
   - 뉴스/매크로: `type: 'headline'`, `type: 'stats'`, `type: 'comparison'`
   - 종목 분석: `type: 'ticker-intro'`, `type: 'ticker-analysis'`
   - 일정/이벤트: `type: 'events'`
   - 마지막: `type: 'closing'`
2. `scripts[].text`, `scripts[].sources`, `chapter`를 사용해 turnId를 실제 대본 id와 매핑하세요.
   - turnId는 슬라이드 순서대로 엄격히 증가해야 합니다(중복/역순 금지).
   - 인접 슬라이드의 turnId 시작 시각 간격은 가능하면 {soft_turn_gap_seconds}초 이하로 유지하세요.
   - 불가피하더라도 {hard_turn_gap_seconds}초를 절대 넘기지 마세요.
3. `action` 필드는 절대 금지, `outlook`/`outlookColor`를 사용하세요.
4. 할루시네이션 금지: 제공된 script.json 밖의 사실/숫자 추가 금지.
5. 법적 가이드: '최종 투자 의견', '강력 추천' 같은 문구 금지.
6. 티커 변환:
   - `^TNX`→`TVC:US10Y`, `^GSPC`→`SP:SPX`, `^DJI`→`DJ:DJI`, `^IXIC`→`NASDAQ:IXIC`, `^RUT`→`TVC:RUT`, `DX-Y.NYB`→`TVC:DXY`, `GLD`→`AMEX:GLD`
7. market-summary의 지수/원자재 절대값을 모르면 `value: null`, `change: null`을 사용하고 `0` placeholder를 넣지 마세요.
   - 단, 핵심 지수(S&P 500, NASDAQ, DOW, Russell 2000)와 달러 인덱스/금 선물은 가능하면 실제 종가를 넣으세요.
   - `N/A` 문자열을 value/label로 쓰지 마세요.
8. 유튜브 시청 최적화(빈공간 최소화):
   - headline: bullets 최소 4개
   - comparison: items 최소 3개
   - stats: stats 최소 3개
   - events: events 최소 3개
   - 차트 섹션이 있으면 가능하면 2개 차트를 사용해 화면을 채우세요.

# 출력 형식
- JSON이 아닌 완전한 TypeScript 코드만 출력
- `import type {{ Slide }} from '@/types/slide';`
- `export const slides: Slide[] = [...]`
- 작은따옴표 사용, 2칸 들여쓰기

이제 목표 개수 {target_slides}를 중심으로 slides.ts 코드를 생성하세요.
"""

        response = self.llm.invoke(prompt)
        return self._extract_typescript_code(response.content)

    def _repair_with_llm(
        self,
        script_data: dict[str, Any],
        type_definitions: str,
        existing_slides_code: str,
        date: str,
        target_slides: int,
        quality_rules: dict[str, Any],
        issues: list[str],
    ) -> str:
        """품질 이슈를 해결하도록 기존 코드를 보정"""
        script_json = self._compact_script_json(script_data)
        rule_text = self._format_rules_for_prompt(quality_rules)
        issue_text = "\n".join([f"- {issue}" for issue in issues])

        prompt = f"""당신은 TypeScript 슬라이드 코드 리라이팅 전문가입니다.

# 목표 날짜
{date}

# 품질 목표
{rule_text}

# 현재 코드의 문제
{issue_text}

# 타입 정의
```typescript
{type_definitions}
```

# 원본 데이터 (검증용)
```json
{script_json}
```

# 현재 slides.ts 코드
```typescript
{existing_slides_code}
```

# 작업
1. 위 문제를 모두 해결하도록 slides.ts 코드를 수정하세요.
2. turnId는 반드시 script.json에 실제 존재하는 id만 사용하세요.
3. 기존 코드의 장점은 유지하고, 부족한 타입을 보강하세요.
4. `action` 필드 금지, `outlook` 사용.
5. `N/A` 문자열 사용 금지, 핵심 지수/달러 인덱스/금 선물 값 누락·0 금지.
6. 주요 차트 심볼은 표준 포맷으로 강제하세요 (`SP:SPX`, `NASDAQ:IXIC`, `DJ:DJI`, `TVC:RUT`, `TVC:US10Y`).
7. 출력은 전체 TypeScript 코드만 반환하세요.
"""

        response = self.llm.invoke(prompt)
        return self._extract_typescript_code(response.content)

    def _analyze_slides_code(self, slides_code: str) -> dict[str, Any]:
        slide_types = re.findall(r"type:\s*'([^']+)'", slides_code)
        turn_ids = [int(x) for x in re.findall(r"turnId:\s*([0-9]+)", slides_code)]
        slide_ids = [int(x) for x in re.findall(r"id:\s*([0-9]+)", slides_code)]

        type_counts: dict[str, int] = {}
        for slide_type in slide_types:
            type_counts[slide_type] = type_counts.get(slide_type, 0) + 1

        return {
            "slide_count": len(slide_types),
            "type_counts": type_counts,
            "turn_ids": turn_ids,
            "slide_ids": slide_ids,
            "unique_type_count": len(type_counts),
        }

    def _validate_slide_quality(
        self,
        script_data: dict[str, Any],
        analysis: dict[str, Any],
        quality_rules: dict[str, Any],
        slides_code: str,
    ) -> list[str]:
        issues: list[str] = []

        slide_count = analysis["slide_count"]
        min_total = quality_rules["min_total"]
        max_total = quality_rules["max_total"]
        if slide_count < min_total or slide_count > max_total:
            issues.append(f"슬라이드 개수 {slide_count}개 (허용 범위: {min_total}~{max_total})")

        type_counts: dict[str, int] = analysis["type_counts"]
        for slide_type, min_count in quality_rules["min_type_counts"].items():
            current = type_counts.get(slide_type, 0)
            if current < min_count:
                issues.append(f"`{slide_type}` 타입 부족: {current}/{min_count}")

        headline_count = type_counts.get("headline", 0)
        max_headline_ratio = quality_rules["max_headline_ratio"]
        if slide_count > 0 and (headline_count / slide_count) > max_headline_ratio:
            issues.append(
                f"headline 비중 과다: {headline_count}/{slide_count} ({headline_count / slide_count:.0%})"
            )

        if analysis["unique_type_count"] < quality_rules["min_unique_types"]:
            issues.append(
                f"고유 슬라이드 타입 부족: {analysis['unique_type_count']}/{quality_rules['min_unique_types']}"
            )

        chart_block_count = self._count_chart_blocks(slides_code)
        min_chart_blocks = max(4, int(quality_rules["target_slides"] / 5))
        if chart_block_count < min_chart_blocks:
            issues.append(
                f"차트 섹션 부족: {chart_block_count}/{min_chart_blocks}"
            )

        if not self._market_summary_has_chart(slides_code):
            issues.append("market-summary에 charts 섹션이 없습니다")

        script_ids = {int(script["id"]) for script in script_data.get("scripts", []) if "id" in script}
        invalid_turn_ids = sorted({turn_id for turn_id in analysis["turn_ids"] if turn_id not in script_ids})
        if invalid_turn_ids:
            issues.append(f"존재하지 않는 turnId 사용: {invalid_turn_ids[:5]}")

        turn_ids = analysis["turn_ids"]
        non_increasing = [
            (turn_ids[i - 1], turn_ids[i], i)
            for i in range(1, len(turn_ids))
            if turn_ids[i] <= turn_ids[i - 1]
        ]
        if non_increasing:
            preview = ", ".join([f"{a}->{b}@{idx}" for a, b, idx in non_increasing[:3]])
            issues.append(f"turnId 순서 오류(중복/역순): {preview}")

        script_start_seconds = {
            int(script["id"]): int(script["time"][0]) / 1000.0
            for script in script_data.get("scripts", [])
            if isinstance(script.get("id"), int)
            and isinstance(script.get("time"), list)
            and len(script.get("time")) == 2
        }
        soft_turn_gap_seconds = float(
            quality_rules.get("soft_turn_gap_seconds", SOFT_TURN_GAP_SECONDS)
        )
        hard_turn_gap_seconds = float(
            quality_rules.get("hard_turn_gap_seconds", HARD_TURN_GAP_SECONDS)
        )
        soft_gaps: list[tuple[int, int, float]] = []
        hard_gaps: list[tuple[int, int, float]] = []
        for i in range(1, len(turn_ids)):
            prev_id = turn_ids[i - 1]
            curr_id = turn_ids[i]
            prev_start = script_start_seconds.get(prev_id)
            curr_start = script_start_seconds.get(curr_id)
            if prev_start is None or curr_start is None:
                continue
            gap = curr_start - prev_start
            if gap > hard_turn_gap_seconds:
                hard_gaps.append((prev_id, curr_id, gap))
            elif gap > soft_turn_gap_seconds:
                soft_gaps.append((prev_id, curr_id, gap))

        if hard_gaps:
            preview = ", ".join([f"{a}->{b} ({gap:.1f}s)" for a, b, gap in hard_gaps[:3]])
            issues.append(f"turnId 간격 과다(>{hard_turn_gap_seconds:.0f}s): {preview}")
        elif soft_gaps:
            preview = ", ".join([f"{a}->{b} ({gap:.1f}s)" for a, b, gap in soft_gaps[:3]])
            logger.warning(
                "turnId 간격 경고(권장 >%.0fs): %s",
                soft_turn_gap_seconds,
                preview,
            )

        if len(set(analysis["slide_ids"])) != len(analysis["slide_ids"]):
            issues.append("중복 slide id가 존재합니다")

        zero_placeholder_pattern = r"value:\s*0\s*,\s*change:\s*0\s*,\s*changePercent:\s*-?\d"
        if re.search(zero_placeholder_pattern, slides_code):
            issues.append("market-summary에 0 placeholder(value/change=0) 사용")

        if re.search(r"\bN/?A\b", slides_code, re.IGNORECASE):
            issues.append("슬라이드 코드에 'N/A' 문자열 사용")

        expected_title_date = self._normalize_episode_date(script_data.get("date"))
        if expected_title_date:
            title_date_issues = self._find_title_date_issues(
                slides_code,
                expected_title_date,
            )
            if title_date_issues:
                issues.append(
                    "title 슬라이드 date 불일치: " + ", ".join(title_date_issues[:3])
                )

        missing_required_market_values = self._find_missing_required_market_values(slides_code)
        if missing_required_market_values:
            issues.append(
                "market-summary 필수 항목 value 누락/0: "
                + ", ".join(missing_required_market_values[:8])
            )

        unmapped_tickers = self._find_unmapped_tickers(slides_code)
        if unmapped_tickers:
            issues.append(
                "티커 포맷 보정 필요: " + ", ".join(unmapped_tickers[:8])
            )

        invalid_ticker_intro_values = self._find_invalid_ticker_intro_values(slides_code)
        if invalid_ticker_intro_values:
            issues.append(
                "ticker-intro 가격/변동 값 누락 또는 0: "
                + ", ".join(invalid_ticker_intro_values[:8])
            )

        return issues

    def _normalize_required_market_key(self, name: str) -> str | None:
        lowered = (name or "").strip().lower()
        if "달러" in lowered or "dollar" in lowered or "dxy" in lowered:
            return "Dollar Index"
        if "금 선물" in lowered or "gold" in lowered:
            return "Gold Futures"
        if "wti" in lowered or "원유" in lowered or "crude" in lowered or "oil" in lowered:
            return "WTI Crude"
        compact = re.sub(r"[^a-z0-9]+", "", lowered)
        if compact in {"sp500", "snp500", "sandp500"}:
            return "S&P 500"
        if compact in {"nasdaq", "nasdaqcomposite"}:
            return "NASDAQ"
        if compact in {"dow", "dowjones", "dji"}:
            return "DOW"
        if compact in {"russell2000", "rut"}:
            return "Russell 2000"
        return None

    def _find_missing_required_market_values(self, slides_code: str) -> list[str]:
        anchor = "type: 'market-summary'"
        anchor_positions = [m.start() for m in re.finditer(re.escape(anchor), slides_code)]
        if not anchor_positions:
            return []

        required_keys = {
            "S&P 500",
            "NASDAQ",
            "DOW",
            "Russell 2000",
            "Dollar Index",
            "Gold Futures",
            "WTI Crude",
        }
        missing: list[str] = []
        for pos in anchor_positions:
            bounds = self._find_enclosing_object_bounds(slides_code, pos)
            if not bounds:
                continue
            start, end = bounds
            block = slides_code[start:end]
            found_keys: set[str] = set()

            index_pattern = re.compile(
                r"name:\s*['\"](?P<name>[^'\"]+)['\"]\s*,\s*value:\s*(?P<value>null|[-+]?\d+(?:\.\d+)?)",
                re.IGNORECASE,
            )
            for match in index_pattern.finditer(block):
                normalized = self._normalize_required_market_key(match.group("name"))
                if not normalized:
                    continue
                found_keys.add(normalized)
                value_raw = match.group("value").strip().lower()
                if value_raw == "null":
                    missing.append(normalized)
                    continue
                try:
                    numeric = float(value_raw)
                except ValueError:
                    missing.append(normalized)
                    continue
                if numeric <= 0:
                    missing.append(normalized)

            for required_key in required_keys - found_keys:
                missing.append(required_key)

        return sorted(set(missing))

    def _count_chart_blocks(self, slides_code: str) -> int:
        return len(re.findall(r"\bcharts\s*:\s*\[", slides_code))

    def _market_summary_has_chart(self, slides_code: str) -> bool:
        anchor = "type: 'market-summary'"
        anchor_positions = [m.start() for m in re.finditer(re.escape(anchor), slides_code)]
        if not anchor_positions:
            return False

        for pos in anchor_positions:
            bounds = self._find_enclosing_object_bounds(slides_code, pos)
            if not bounds:
                continue
            block = slides_code[bounds[0]:bounds[1]]
            if re.search(r"charts\s*:\s*\[\s*\{", block):
                return True
        return False

    def _find_unmapped_tickers(self, slides_code: str) -> list[str]:
        ticker_pattern = re.compile(
            r"ticker\s*:\s*['\"](?P<ticker>[A-Za-z0-9:^._-]+)['\"]",
            re.IGNORECASE,
        )
        needs_mapping = {
            "^TNX",
            "US10Y",
            "TNX",
            "^IXIC",
            "IXIC",
            "^RUT",
            "RUT",
        }
        found: set[str] = set()
        for match in ticker_pattern.finditer(slides_code):
            ticker = match.group("ticker").strip().upper()
            if ticker in needs_mapping:
                found.add(ticker)
        return sorted(found)

    def _extract_primary_ticker(self, block: str) -> str | None:
        match = re.search(
            r"(?:ticker|\"ticker\"|'ticker')\s*:\s*['\"](?P<ticker>[A-Za-z0-9:^._-]+)['\"]",
            block,
            re.IGNORECASE,
        )
        if not match:
            return None
        return match.group("ticker").strip().upper()

    def _extract_numeric_field(self, block: str, field: str) -> float | None:
        pattern = re.compile(
            rf"(?:{field}|\"{field}\"|'{field}')\s*:\s*(?P<value>null|[+-]?\d+(?:\.\d+)?)",
            re.IGNORECASE,
        )
        match = pattern.search(block)
        if not match:
            return None
        raw = match.group("value").strip().lower()
        if raw == "null":
            return None
        try:
            return float(raw)
        except ValueError:
            return None

    def _replace_numeric_field_value(self, block: str, field: str, replacement: str) -> str:
        pattern = re.compile(
            rf"(?P<key>(?:^|[,\s])(?:{field}|'{field}'|\"{field}\")\s*:\s*)"
            r"(?P<value>null|[+-]?\d+(?:\.\d+)?)",
            re.IGNORECASE,
        )
        updated, replaced = pattern.subn(
            lambda match: f"{match.group('key')}{replacement}",
            block,
            count=1,
        )
        return updated if replaced else block

    def _find_invalid_ticker_intro_values(self, slides_code: str) -> list[str]:
        anchor = "type: 'ticker-intro'"
        anchor_positions = [m.start() for m in re.finditer(re.escape(anchor), slides_code)]
        if not anchor_positions:
            return []

        invalid: list[str] = []
        for pos in anchor_positions:
            bounds = self._find_enclosing_object_bounds(slides_code, pos)
            if not bounds:
                continue
            block = slides_code[bounds[0]:bounds[1]]
            ticker = self._extract_primary_ticker(block) or f"ticker-intro@{pos}"
            current_price = self._extract_numeric_field(block, "currentPrice")
            day_change = self._extract_numeric_field(block, "dayChange")
            day_change_pct = self._extract_numeric_field(block, "dayChangePercent")

            if current_price is None or current_price <= 0:
                invalid.append(ticker)
                continue
            if day_change is None and day_change_pct is None:
                invalid.append(ticker)
                continue
            if (
                day_change is not None
                and day_change_pct is not None
                and abs(day_change) < 1e-9
                and abs(day_change_pct) > 0.05
            ):
                invalid.append(ticker)

        return sorted(set(invalid))

    def _ticker_to_yahoo_candidates(self, ticker: str) -> list[str]:
        normalized = (ticker or "").strip().upper()
        if not normalized:
            return []

        map_to_yahoo = {
            "SP:SPX": "^GSPC",
            "NASDAQ:IXIC": "^IXIC",
            "DJ:DJI": "^DJI",
            "TVC:RUT": "^RUT",
            "TVC:US10Y": "^TNX",
            "TVC:DXY": "DX-Y.NYB",
            "AMEX:GLD": "GLD",
        }

        candidates: list[str] = []

        def add_candidate(symbol: str | None) -> None:
            if symbol and symbol not in candidates:
                candidates.append(symbol)

        add_candidate(map_to_yahoo.get(normalized))
        add_candidate(normalized)
        if ":" in normalized:
            add_candidate(normalized.split(":")[-1])
        if "." in normalized:
            add_candidate(normalized.replace(".", "-"))

        return candidates

    def _build_snapshot_from_frame(
        self,
        frame: pd.DataFrame,
        target_date: date,
    ) -> dict[str, float | str] | None:
        if frame.empty:
            return None

        idx = pd.to_datetime(frame.index)
        if idx.tz is not None:
            idx = idx.tz_convert("America/New_York").tz_localize(None)
        frame_with_date = frame.copy()
        frame_with_date["__date"] = idx.date

        candidates = frame_with_date[frame_with_date["__date"] <= target_date]
        if candidates.empty:
            candidates = frame_with_date

        latest = candidates.iloc[-1]
        close = latest.get("Close")
        if close is None or pd.isna(close):
            return None
        close_value = float(close)

        latest_pos = candidates.index[-1]
        try:
            loc = frame_with_date.index.get_loc(latest_pos)
            if isinstance(loc, slice):
                loc = loc.stop - 1
            prev_row = frame_with_date.iloc[loc - 1] if isinstance(loc, int) and loc > 0 else None
        except Exception:
            prev_row = None

        change = None
        change_pct = None
        if prev_row is not None and pd.notna(prev_row.get("Close")):
            prev_close = float(prev_row.get("Close"))
            if prev_close != 0:
                change = close_value - prev_close
                change_pct = (close_value / prev_close - 1.0) * 100.0

        return {
            "close": close_value,
            "change": change,
            "change_pct": change_pct,
            "as_of": str(latest.get("__date")),
        }

    def _fetch_ticker_snapshots(
        self,
        date: str,
        tickers: list[str],
    ) -> dict[str, dict[str, float | str]]:
        try:
            target_date = datetime.strptime(date, "%Y%m%d").date()
        except ValueError:
            logger.warning("잘못된 날짜 형식으로 ticker-intro 백필 생략: %s", date)
            return {}

        start = (target_date - timedelta(days=14)).isoformat()
        end = (target_date + timedelta(days=2)).isoformat()
        snapshots: dict[str, dict[str, float | str]] = {}

        for ticker in sorted({t.strip().upper() for t in tickers if t}):
            snapshot = None
            for candidate in self._ticker_to_yahoo_candidates(ticker):
                frame = self._download_index_frame(candidate, start=start, end=end)
                snapshot = self._build_snapshot_from_frame(frame, target_date)
                if snapshot:
                    break

            if snapshot:
                snapshots[ticker] = snapshot
            else:
                logger.warning("ticker-intro 스냅샷을 찾지 못함: %s", ticker)

        return snapshots

    def _post_process_tickers(self, slides_code: str) -> str:
        """티커 심볼 후처리 (2차 안전장치)"""
        ticker_map = {
            "'^TNX'": "'TVC:US10Y'",
            "'^GSPC'": "'SP:SPX'",
            "'^DJI'": "'DJ:DJI'",
            "'^IXIC'": "'NASDAQ:IXIC'",
            "'^RUT'": "'TVC:RUT'",
            "'US10Y'": "'TVC:US10Y'",
            "'TNX'": "'TVC:US10Y'",
            "'IXIC'": "'NASDAQ:IXIC'",
            "'RUT'": "'TVC:RUT'",
            "'DX-Y.NYB'": "'TVC:DXY'",
            "'GLD'": "'AMEX:GLD'",
            '"^TNX"': '"TVC:US10Y"',
            '"^GSPC"': '"SP:SPX"',
            '"^DJI"': '"DJ:DJI"',
            '"^IXIC"': '"NASDAQ:IXIC"',
            '"^RUT"': '"TVC:RUT"',
            '"US10Y"': '"TVC:US10Y"',
            '"TNX"': '"TVC:US10Y"',
            '"IXIC"': '"NASDAQ:IXIC"',
            '"RUT"': '"TVC:RUT"',
            '"DX-Y.NYB"': '"TVC:DXY"',
            '"GLD"': '"AMEX:GLD"',
        }

        for yahoo_ticker, tv_ticker in ticker_map.items():
            slides_code = slides_code.replace(yahoo_ticker, tv_ticker)

        slides_code = re.sub(
            r"value:\s*0\s*,\s*change:\s*0\s*,\s*changePercent:",
            "value: null, change: null, changePercent:",
            slides_code,
        )
        slides_code = re.sub(
            r"value:\s*['\"]N/?A['\"]",
            "value: null",
            slides_code,
            flags=re.IGNORECASE,
        )
        slides_code = re.sub(
            r"change:\s*['\"]N/?A['\"]",
            "change: null",
            slides_code,
            flags=re.IGNORECASE,
        )
        slides_code = re.sub(
            r"changePercent:\s*['\"]N/?A['\"]",
            "changePercent: 0",
            slides_code,
            flags=re.IGNORECASE,
        )

        logger.info("티커 심볼 후처리 완료")
        return slides_code

    def _normalize_episode_date(self, raw_date: Any) -> str | None:
        value = str(raw_date or "").strip()
        if re.fullmatch(r"\d{8}", value):
            return f"{value[:4]}-{value[4:6]}-{value[6:8]}"
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            return value
        return None

    def _pin_title_slide_date(self, slides_code: str, episode_date: str) -> str:
        target_date = self._normalize_episode_date(episode_date)
        if not target_date:
            return slides_code

        anchor_positions = [m.start() for m in re.finditer(r"type:\s*['\"]title['\"]", slides_code)]
        if not anchor_positions:
            return slides_code

        date_field_pattern = re.compile(
            r"(?P<key>(?:^|[,\s])(?:date|\"date\"|'date')\s*:\s*)(?P<quote>['\"])(?P<value>[^'\"]+)(?P=quote)",
            re.IGNORECASE,
        )
        pinned_count = 0
        updated = slides_code
        for pos in reversed(anchor_positions):
            bounds = self._find_enclosing_object_bounds(updated, pos)
            if not bounds:
                continue
            start, end = bounds
            block = updated[start:end]

            def replace_date(match: re.Match[str]) -> str:
                return f"{match.group('key')}{match.group('quote')}{target_date}{match.group('quote')}"

            replaced_block, count = date_field_pattern.subn(replace_date, block, count=1)
            if count == 0:
                replaced_block = re.sub(
                    r"(type:\s*['\"]title['\"],?)",
                    rf"\1\n    date: '{target_date}',",
                    block,
                    count=1,
                )
            else:
                pinned_count += 1

            updated = updated[:start] + replaced_block + updated[end:]

        logger.info("title 슬라이드 날짜 고정 완료: %s (updated=%d)", target_date, pinned_count)
        return updated

    def _find_title_date_issues(self, slides_code: str, expected_date: str) -> list[str]:
        issues: list[str] = []
        anchor_positions = [m.start() for m in re.finditer(r"type:\s*['\"]title['\"]", slides_code)]
        if not anchor_positions:
            return ["title slide missing"]

        date_field_pattern = re.compile(
            r"(?:^|[,\s])(?:date|\"date\"|'date')\s*:\s*['\"](?P<value>[^'\"]+)['\"]",
            re.IGNORECASE,
        )
        for pos in anchor_positions:
            bounds = self._find_enclosing_object_bounds(slides_code, pos)
            if not bounds:
                continue
            block = slides_code[bounds[0]:bounds[1]]
            match = date_field_pattern.search(block)
            if not match:
                issues.append("missing date field")
                continue
            value = match.group("value").strip()
            if value != expected_date:
                issues.append(f"{value} != {expected_date}")
        return issues

    def _enrich_market_summary_indices(self, slides_code: str, date: str) -> str:
        """market-summary.indices에 지수 종가/변동을 백필한다."""
        snapshots = self._fetch_index_snapshots(date)
        if not snapshots:
            logger.warning("지수 스냅샷 없음: market-summary 백필 생략")
            return slides_code

        anchor = "type: 'market-summary'"
        anchor_positions = [m.start() for m in re.finditer(re.escape(anchor), slides_code)]
        if not anchor_positions:
            return slides_code

        updated = slides_code
        for pos in reversed(anchor_positions):
            bounds = self._find_enclosing_object_bounds(updated, pos)
            if not bounds:
                continue
            start, end = bounds
            block = updated[start:end]
            replaced = self._replace_indices_with_snapshots(block, snapshots)
            updated = updated[:start] + replaced + updated[end:]

        logger.info("market-summary 지수 백필 완료")
        return updated

    def _enrich_ticker_intro_prices(self, slides_code: str, date: str) -> str:
        """ticker-intro의 currentPrice/dayChange/dayChangePercent를 종가 스냅샷으로 백필한다."""
        anchor = "type: 'ticker-intro'"
        anchor_positions = [m.start() for m in re.finditer(re.escape(anchor), slides_code)]
        if not anchor_positions:
            return slides_code

        ticker_candidates: list[str] = []
        for pos in anchor_positions:
            bounds = self._find_enclosing_object_bounds(slides_code, pos)
            if not bounds:
                continue
            block = slides_code[bounds[0]:bounds[1]]
            ticker = self._extract_primary_ticker(block)
            if ticker:
                ticker_candidates.append(ticker)

        if not ticker_candidates:
            return slides_code

        snapshots = self._fetch_ticker_snapshots(date, ticker_candidates)
        if not snapshots:
            logger.warning("ticker-intro 스냅샷 없음: 가격 백필 생략")
            return slides_code

        updated = slides_code
        updated_count = 0
        for pos in reversed(anchor_positions):
            bounds = self._find_enclosing_object_bounds(updated, pos)
            if not bounds:
                continue
            start, end = bounds
            block = updated[start:end]
            ticker = self._extract_primary_ticker(block)
            if not ticker:
                continue

            snapshot = snapshots.get(ticker)
            if not snapshot:
                continue

            close = snapshot.get("close")
            change = snapshot.get("change")
            change_pct = snapshot.get("change_pct")

            if close is None:
                continue

            block = self._replace_numeric_field_value(block, "currentPrice", f"{float(close):.2f}")
            if change is not None:
                block = self._replace_numeric_field_value(block, "dayChange", f"{float(change):.2f}")
            if change_pct is not None:
                block = self._replace_numeric_field_value(
                    block,
                    "dayChangePercent",
                    f"{float(change_pct):.2f}",
                )

            updated = updated[:start] + block + updated[end:]
            updated_count += 1

        if updated_count > 0:
            logger.info("ticker-intro 가격 백필 완료: %d개", updated_count)
        return updated

    def _find_enclosing_object_bounds(self, text: str, anchor_pos: int) -> tuple[int, int] | None:
        """anchor 위치를 포함하는 객체 리터럴의 시작/끝 인덱스를 찾는다."""
        start = text.rfind("{", 0, anchor_pos)
        while start != -1:
            segment = text[start:anchor_pos]
            if segment.count("{") > segment.count("}"):
                break
            start = text.rfind("{", 0, start)

        if start == -1:
            return None

        depth = 0
        for idx in range(start, len(text)):
            char = text[idx]
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    return start, idx + 1
        return None

    def _replace_indices_with_snapshots(
        self,
        block: str,
        snapshots: dict[str, dict[str, float | str]],
    ) -> str:
        pattern = re.compile(
            r"\{(?P<body>"
            r"[^{}]*?"
            r"(?:name|\"name\"|'name')\s*:\s*(?P<quote>['\"])(?P<name>[^'\"]+)(?P=quote)"
            r"[^{}]*?"
            r"(?:value|\"value\"|'value')\s*:\s*(?P<value>null|[+-]?\d+(?:\.\d+)?)"
            r"[^{}]*?"
            r"(?:change|\"change\"|'change')\s*:\s*(?P<change>null|[+-]?\d+(?:\.\d+)?)"
            r"[^{}]*?"
            r"(?:changePercent|\"changePercent\"|'changePercent')\s*:\s*(?P<pct>null|[+-]?\d+(?:\.\d+)?)"
            r"[^{}]*?)\}",
            re.IGNORECASE | re.DOTALL,
        )

        def replace_field_value(content: str, field: str, replacement: str) -> str:
            field_pattern = re.compile(
                rf"(?P<key>(?:^|[,\s])(?:{field}|'{field}'|\"{field}\")\s*:\s*)"
                r"(?P<value>null|[+-]?\d+(?:\.\d+)?)",
                re.IGNORECASE,
            )
            updated, replaced = field_pattern.subn(
                lambda m: f"{m.group('key')}{replacement}",
                content,
                count=1,
            )
            return updated if replaced else content

        def repl(match: re.Match[str]) -> str:
            name = match.group("name")
            symbol = self._map_index_name_to_symbol(name)
            if not symbol:
                return match.group(0)

            snapshot = self._get_snapshot_for_symbol(symbol, snapshots)
            if not snapshot:
                return match.group(0)

            close = snapshot.get("close")
            change = snapshot.get("change")
            change_pct = snapshot.get("change_pct")

            if close is None:
                return match.group(0)

            value_str = f"{float(close):.2f}"
            change_str = f"{float(change):.2f}" if change is not None else "null"
            pct_str = f"{float(change_pct):.2f}" if change_pct is not None else "null"

            body = match.group("body")
            body = replace_field_value(body, "value", value_str)
            body = replace_field_value(body, "change", change_str)
            body = replace_field_value(body, "changePercent", pct_str)
            return "{" + body + "}"

        return pattern.sub(repl, block)

    def _get_snapshot_for_symbol(
        self,
        symbol: str,
        snapshots: dict[str, dict[str, float | str]],
    ) -> dict[str, float | str] | None:
        snapshot = snapshots.get(symbol)
        if snapshot:
            return snapshot

        fallback_symbol_map = {
            "DX-Y.NYB": ["UUP"],
            "GC=F": ["GLD"],
            # WTI 선물(CL=F)이 비는 환경에서 원유 ETF/브렌트 선물로 순차 보완
            "CL=F": ["USO", "BZ=F", "BNO"],
            "^TNX": ["IEF"],
        }
        for fallback in fallback_symbol_map.get(symbol, []):
            fallback_snapshot = snapshots.get(fallback)
            if fallback_snapshot:
                return fallback_snapshot
        return None

    def _map_index_name_to_symbol(self, name: str) -> str | None:
        lowered = (name or "").strip().lower()
        if "달러" in lowered or "dollar" in lowered or "dxy" in lowered:
            return "DX-Y.NYB"
        if "wti" in lowered or "원유" in lowered or "crude" in lowered or "oil" in lowered:
            return "CL=F"
        if "금 선물" in lowered or "gold" in lowered:
            return "GC=F"
        if "10년물" in lowered or "10-year" in lowered or "us10y" in lowered:
            return "^TNX"
        if "russell" in lowered:
            return "^RUT"
        if "nasdaq" in lowered and "100" in lowered:
            return "^NDX"
        if "nasdaq" in lowered:
            return "^IXIC"
        if "dow" in lowered:
            return "^DJI"
        if "s&p" in lowered or "sp 500" in lowered or "s p 500" in lowered:
            return "^GSPC"
        return None

    def _normalize_ohlc_frame(self, df: pd.DataFrame) -> pd.DataFrame:
        if not isinstance(df, pd.DataFrame) or df.empty:
            return pd.DataFrame()

        normalized = df.copy()
        if isinstance(normalized.columns, pd.MultiIndex):
            columns = []
            for col in normalized.columns:
                if isinstance(col, tuple):
                    parts = [str(p) for p in col if p is not None]
                    fields = {"open", "high", "low", "close", "adj close", "volume"}
                    selected = next((p for p in reversed(parts) if p.lower() in fields), parts[-1] if parts else "")
                    columns.append(selected)
                else:
                    columns.append(str(col))
            normalized.columns = columns
        normalized.columns = [str(c).strip().title() for c in normalized.columns]

        if "Close" not in normalized.columns and "Adj Close" in normalized.columns:
            normalized = normalized.rename(columns={"Adj Close": "Close"})
        if "Close" not in normalized.columns:
            return pd.DataFrame()

        normalized = normalized.dropna(subset=["Close"])
        return normalized

    def _download_index_frame(self, symbol: str, start: str, end: str) -> pd.DataFrame:
        loaders: list[tuple[str, Any]] = [
            (
                "download",
                lambda: yf.download(
                    symbol,
                    start=start,
                    end=end,
                    interval="1d",
                    progress=False,
                    auto_adjust=False,
                    threads=False,
                ),
            ),
            (
                "history-range",
                lambda: yf.Ticker(symbol).history(
                    start=start,
                    end=end,
                    interval="1d",
                    auto_adjust=False,
                ),
            ),
            (
                "history-1mo",
                lambda: yf.Ticker(symbol).history(
                    period="1mo",
                    interval="1d",
                    auto_adjust=False,
                ),
            ),
        ]

        for label, loader in loaders:
            try:
                frame = self._normalize_ohlc_frame(loader())
            except Exception as exc:
                logger.warning("지수 다운로드 실패 (%s, %s): %s", symbol, label, exc)
                continue

            if not frame.empty:
                return frame

        return pd.DataFrame()

    def _fetch_index_snapshots(self, date: str) -> dict[str, dict[str, float | str]]:
        """시장 핵심 심볼(지수/금리/달러/금) 종가·변동을 가져온다."""
        try:
            target_date = datetime.strptime(date, "%Y%m%d").date()
        except ValueError:
            logger.warning("잘못된 날짜 형식으로 지수 백필 생략: %s", date)
            return {}

        symbols = [
            "^GSPC",
            "^IXIC",
            "^NDX",
            "^DJI",
            "^RUT",
            "^TNX",
            "DX-Y.NYB",
            "GC=F",
            "CL=F",
            "BZ=F",
            "UUP",
            "GLD",
            "USO",
            "BNO",
            "IEF",
        ]
        start = (target_date - timedelta(days=14)).isoformat()
        end = (target_date + timedelta(days=2)).isoformat()
        snapshots: dict[str, dict[str, float | str]] = {}

        for symbol in symbols:
            df = self._download_index_frame(symbol, start=start, end=end)
            if df.empty:
                logger.warning("지수 스냅샷 데이터 비어 있음: %s", symbol)
                continue
            snapshot = self._build_snapshot_from_frame(df, target_date)
            if not snapshot:
                logger.warning("지수 스냅샷 변환 실패: %s", symbol)
                continue
            snapshots[symbol] = snapshot

        return snapshots

    def _extract_typescript_code(self, llm_response: str) -> str:
        """LLM 응답에서 TypeScript 코드 추출"""
        if "```typescript" in llm_response:
            match = re.search(r"```typescript\s*\n(.*?)\n```", llm_response, re.DOTALL)
            if match:
                return match.group(1).strip()

        if "```ts" in llm_response:
            match = re.search(r"```ts\s*\n(.*?)\n```", llm_response, re.DOTALL)
            if match:
                return match.group(1).strip()

        if "```" in llm_response:
            match = re.search(r"```\s*\n(.*?)\n```", llm_response, re.DOTALL)
            if match:
                code = match.group(1).strip()
                if "import type" in code and "export const slides" in code:
                    return code

        if "import type" in llm_response and "export const slides" in llm_response:
            return llm_response.strip()

        raise ValueError("LLM 응답에서 TypeScript 코드를 찾을 수 없습니다")

    def _save_slides_file(self, date: str, slides_code: str) -> Path:
        """slides.ts 파일 저장"""
        output_dir = self.root / "web" / "src" / "landing" / date
        output_dir.mkdir(parents=True, exist_ok=True)

        output_path = output_dir / "slides.ts"
        output_path.write_text(slides_code, encoding="utf-8")
        logger.info("파일 저장됨: %s", output_path)
        return output_path

    def update_landing_index(self, date: str):
        """landing/index.ts 자동 업데이트"""
        index_path = self.root / "web" / "src" / "landing" / "index.ts"

        if not index_path.exists():
            logger.warning("index.ts를 찾을 수 없습니다: %s", index_path)
            return

        content = index_path.read_text(encoding="utf-8")

        import_line = f"import {{ slides as slides{date} }} from './{date}/slides';"
        if import_line in content:
            logger.info("index.ts에 이미 %s import가 있습니다", date)
            return

        import_pattern = r"(import\s+\{[^}]+\}\s+from\s+'.+';)"
        matches = list(re.finditer(import_pattern, content))

        if matches:
            last_import = matches[-1]
            insert_pos = last_import.end()
            content = content[:insert_pos] + f"\n{import_line}" + content[insert_pos:]
        else:
            content = import_line + "\n\n" + content

        map_pattern = r"const slidesMap: Record<string, Slide\[\]> = \{"
        map_match = re.search(map_pattern, content)

        if map_match:
            insert_pos = map_match.end()
            if f"'{date}':" in content:
                logger.info("index.ts에 이미 %s 항목이 있습니다", date)
            else:
                entry = f"\n  '{date}': slides{date},"
                content = content[:insert_pos] + entry + content[insert_pos:]

        index_path.write_text(content, encoding="utf-8")
        logger.info("✅ index.ts 업데이트 완료")
