"""
상위 LangGraph 오케스트레이터.

OpeningAgent → ThemeAgent → (UserTicker Pipeline) → ClosingAgent 순서로 에이전트를 실행하는 그래프를 구성한다.
--stage 옵션으로 어느 에이전트까지 실행할지 제어할 수 있다.

Usage:
    python orchestrator.py 20251125                # ClosingAgent까지 실행 (기본값)
    python orchestrator.py 2025-11-25 --stage 0    # OpeningAgent만 실행
    python orchestrator.py 20251125 --stage 1      # ThemeAgent까지 실행
    python orchestrator.py 20251125 --stage 2      # UserTicker Pipeline까지 실행 (Closing 제외)
    python orchestrator.py 20251125 --stage 3      # ClosingAgent까지 실행
    python orchestrator.py 20251125 --agent theme  # ThemeAgent만 실행 (temp/opening.json 필요)
    python orchestrator.py 20251125 --agent ticker # Ticker Pipeline만 실행 (temp/theme.json 필요)
    python orchestrator.py 20251125 --agent closing # ClosingAgent만 실행 (temp/ticker_pipeline.json 우선, 없으면 temp/theme.json)
    python orchestrator.py 20251125 -t NVDA AAPL   # 사용자 티커 전달
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Literal, TypedDict

from dotenv import load_dotenv
from langgraph.graph import END, StateGraph

from agents.closing import graph as closing_graph
from agents.opening import graph as opening_graph
from agents.theme import graph as theme_graph
from agents.theme.news_ticker_extractor import extract_news_tickers_from_theme
from podcast_db import get_default_db_path, upsert_script_row, utc_iso_from_timestamp
from shared.config import (
    cleanup_cache_dir,
    ensure_cache_dir,
    ensure_temp_dir,
    get_temp_opening_path,
    get_temp_theme_path,
    get_temp_ticker_pipeline_path,
    set_briefing_date,
)
from shared.fetchers import prefetch_all
from shared.ops.scripts.market.select_fallen_large_caps import select_theme_distinct_large_cap_ticker
from shared.date_display import resolve_display_date
from shared.types import ScriptTurn, Theme
from shared.utils.tracing import configure_tracing
from shared.yaml_config import load_env_from_yaml

ROOT = Path(__file__).parent
logger = logging.getLogger(__name__)


def parse_date_arg(date_str: str) -> str:
    """날짜 문자열을 YYYYMMDD 형식으로 정규화한다.
    
    Args:
        date_str: 입력 날짜 (YYYYMMDD 또는 YYYY-MM-DD 형식)
    
    Returns:
        YYYYMMDD 형식의 날짜 문자열
    
    Raises:
        ValueError: 잘못된 날짜 형식
    """
    # YYYY-MM-DD 형식 시도
    if "-" in date_str:
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            return dt.strftime("%Y%m%d")
        except ValueError:
            pass
    
    # YYYYMMDD 형식 시도
    try:
        dt = datetime.strptime(date_str, "%Y%m%d")
        return dt.strftime("%Y%m%d")
    except ValueError:
        raise ValueError(f"잘못된 날짜 형식입니다: {date_str}. YYYYMMDD 또는 YYYY-MM-DD 형식을 사용하세요.")


def parse_tickers(raw_tickers: List[str]) -> List[str]:
    """티커 리스트를 정규화한다 (쉼표 구분 허용)."""
    out: List[str] = []
    for token in raw_tickers:
        parts = str(token).split(",")
        for part in parts:
            normalized = part.strip()
            if normalized:
                out.append(normalized)
    return out


def _env_flag_enabled(name: str, default: bool = True) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() not in {"", "0", "false", "no", "off"}


def _auto_select_ticker_from_theme(
    *,
    date_str: str,
    base_scripts: list[dict[str, Any]],
    chapter: list[ChapterRange],
) -> list[str]:
    if not _env_flag_enabled("AUTO_THEME_DISTINCT_TICKER_ENABLED", True):
        return []

    script_payload = {
        "date": resolve_display_date(date_str, "ko"),
        "chapter": chapter,
        "scripts": base_scripts,
    }

    try:
        picker_payload = select_theme_distinct_large_cap_ticker(
            date=date_str,
            script_payload=script_payload,
            universe_size=int(os.getenv("AUTO_THEME_DISTINCT_TICKER_UNIVERSE_SIZE", "150") or "150"),
            min_abs_change_pct=float(os.getenv("AUTO_THEME_DISTINCT_TICKER_MIN_ABS_CHANGE_PCT", "2.0") or "2.0"),
            max_candidates=int(os.getenv("AUTO_THEME_DISTINCT_TICKER_MAX_CANDIDATES", "10") or "10"),
            prefix=os.getenv("AUTO_THEME_DISTINCT_TICKER_LLM_PREFIX", "MARKET_PICKER") or "MARKET_PICKER",
        )
    except Exception as exc:
        logger.warning("Auto ticker picker failed; continuing without ticker selection: %s", exc)
        return []

    selected = picker_payload.get("selected")
    if not isinstance(selected, dict):
        logger.info("Auto ticker picker found no eligible candidate.")
        return []

    symbol = str(selected.get("symbol") or "").upper().strip()
    if not symbol:
        logger.info("Auto ticker picker returned an empty symbol.")
        return []

    reason = str(selected.get("reason") or "").strip()
    logger.info("Auto-selected ticker %s via theme-distinct market picker", symbol)
    if reason:
        logger.info("Auto-selection reason: %s", reason)
    return [symbol]


def format_date_korean(date_yyyymmdd: str) -> str:
    """YYYYMMDD를 '11월 25일' 형식의 한국어로 변환한다."""
    dt = datetime.strptime(date_yyyymmdd, "%Y%m%d")
    return f"{dt.month}월 {dt.day}일"


ChapterName = Literal["opening", "theme", "ticker", "closing"]
AgentName = Literal["opening", "theme", "ticker", "closing"]


class ChapterRange(TypedDict):
    name: ChapterName
    start_id: int
    end_id: int


def _empty_chapter(name: ChapterName) -> ChapterRange:
    return {"name": name, "start_id": -1, "end_id": -1}


def _init_chapter() -> List[ChapterRange]:
    return [_empty_chapter("opening"), _empty_chapter("theme"), _empty_chapter("ticker"), _empty_chapter("closing")]


def _set_chapter_range(
    chapter: List[ChapterRange],
    name: ChapterName,
    start_id: int,
    end_id: int,
) -> List[ChapterRange]:
    # start/end가 유효하지 않으면 -1/-1로 통일
    if start_id < 0 or end_id < 0 or end_id < start_id:
        updated: ChapterRange = _empty_chapter(name)
    else:
        updated = {"name": name, "start_id": start_id, "end_id": end_id}

    out = list(chapter) if isinstance(chapter, list) else _init_chapter()
    for idx, item in enumerate(out):
        if item.get("name") == name:
            out[idx] = updated
            return out

    # 방어적 처리: name이 없으면 append
    out.append(updated)
    return out


class BriefingState(TypedDict, total=False):
    # 날짜 (EST 기준, YYYYMMDD 형식)
    date: str
    
    # User input
    user_tickers: List[str]

    # Agent 1 (Opening) output
    nutshell: str
    themes: List[Theme]

    # Accumulated scripts
    scripts: List[ScriptTurn]

    # Metadata
    current_section: str

    # scripts[].id 기준 챕터 구간 (opening/theme/ticker/closing, inclusive)
    chapter: List[ChapterRange]


def global_prefetch_node(state: BriefingState) -> BriefingState:
    """모든 Agent가 사용할 데이터를 한 번에 프리페치한다."""
    date_str = state.get("date")
    if not date_str:
        raise ValueError("date 필드가 state에 없습니다.")

    date_norm = set_briefing_date(date_str)
    date_obj = datetime.strptime(date_norm, "%Y%m%d").date()

    cache_dir = ensure_cache_dir(date_norm)
    prefetch_all(date_obj, cache_dir=cache_dir)

    return {**state, "date": date_norm}


def cleanup_cache_node(state: BriefingState) -> BriefingState:
    """cache/{date} 디렉토리를 정리한다 (temp/는 유지)."""
    date_str = state.get("date")
    if date_str:
        cleanup_cache_dir(date_str)
    return state


def opening_node(state: BriefingState) -> BriefingState:
    """OpeningAgent를 실행해 BriefingState 필드를 채운다."""
    # state에서 날짜를 가져와 OpeningAgent에 전달
    date_str = state.get("date")
    if not date_str:
        raise ValueError("date 필드가 state에 없습니다. orchestrator 실행 시 날짜를 지정하세요.")

    set_briefing_date(date_str)

    oa_graph = opening_graph.build_graph()
    # OpeningAgent에 date를 전달
    oa_result = oa_graph.invoke({"date": date_str})

    themes = oa_result.get("themes", [])
    scripts = list(state.get("scripts", []))
    scripts.extend(oa_result.get("scripts", []))

    chapter = _init_chapter()
    if scripts:
        chapter = _set_chapter_range(chapter, "opening", 0, len(scripts) - 1)
    else:
        chapter = _set_chapter_range(chapter, "opening", -1, -1)

    return {
        **state,
        "nutshell": oa_result.get("nutshell", ""),
        "themes": themes,
        "scripts": scripts,
        "current_section": "theme",
        "chapter": chapter,
    }


def theme_node(state: BriefingState) -> BriefingState:
    """ThemeAgent를 실행해 테마별 심층 스크립트를 생성한다."""
    date_str = state.get("date")
    if not date_str:
        raise ValueError("date 필드가 state에 없습니다. orchestrator 실행 시 날짜를 지정하세요.")

    set_briefing_date(date_str)

    base_scripts = state.get("scripts")
    opening_len: int | None = len(base_scripts) if isinstance(base_scripts, list) else None

    ta_graph = theme_graph.build_theme_graph()
    result = ta_graph.invoke(
        {
            "date": date_str,
            "nutshell": state.get("nutshell", ""),
            "themes": state.get("themes"),
            "base_scripts": base_scripts,
        }
    )

    scripts = result.get("scripts", [])
    total_len = len(scripts) if isinstance(scripts, list) else 0

    if opening_len is None:
        result_base = result.get("base_scripts", [])
        opening_len = len(result_base) if isinstance(result_base, list) else 0

    chapter = state.get("chapter")
    if not isinstance(chapter, list):
        chapter = _init_chapter()
    chapter = _set_chapter_range(chapter, "opening", 0, opening_len - 1 if opening_len > 0 else -1)
    if total_len > opening_len:
        chapter = _set_chapter_range(chapter, "theme", opening_len, total_len - 1)
    else:
        chapter = _set_chapter_range(chapter, "theme", -1, -1)
    chapter = _set_chapter_range(chapter, "ticker", -1, -1)

    return {
        **state,
        "nutshell": state.get("nutshell") or result.get("nutshell", ""),
        "themes": state.get("themes") or result.get("themes", []),
        "scripts": scripts if isinstance(scripts, list) else [],
        "current_section": "ticker",
        "chapter": chapter,
    }


def ticker_pipeline_node(state: BriefingState) -> BriefingState:
    """UserTicker 기반: (ticker별 debate → ticker script worker/refiner) 를 실행해 scripts를 확장한다."""
    date_str = state.get("date")
    if not date_str:
        raise ValueError("date 필드가 state에 없습니다. orchestrator 실행 시 날짜를 지정하세요.")

    set_briefing_date(date_str)

    # Ensure we have (opening+theme) base scripts.
    scripts_input = state.get("scripts")
    if not isinstance(scripts_input, list):
        theme_path = get_temp_theme_path()
        if not theme_path.exists():
            raise FileNotFoundError(f"Theme 결과가 없습니다: {theme_path}")
        payload = json.loads(theme_path.read_text(encoding="utf-8"))
        scripts_input = payload.get("scripts", [])

    base_scripts = scripts_input if isinstance(scripts_input, list) else []
    base_len = len(base_scripts)

    # Ensure nutshell/themes exist when running standalone.
    if not state.get("nutshell") or not state.get("themes"):
        opening_path = get_temp_opening_path()
        if opening_path.exists():
            try:
                opening_payload = json.loads(opening_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                opening_payload = {}
            state = {
                **state,
                "nutshell": state.get("nutshell") or opening_payload.get("nutshell", ""),
                "themes": state.get("themes") or opening_payload.get("themes", []),
            }

    # Normalize tickers (order preserved)
    raw_tickers = state.get("user_tickers") or []
    tickers = [str(t).upper().strip() for t in raw_tickers if str(t).strip()]

    chapter = state.get("chapter")
    if not isinstance(chapter, list):
        chapter = _init_chapter()

    # If chapter ranges are missing (standalone run), try reconstruct opening/theme boundaries.
    opening_has_range = any(
        isinstance(c, dict) and c.get("name") == "opening" and int(c.get("start_id", -1)) >= 0 for c in chapter
    )
    if not opening_has_range:
        opening_path = get_temp_opening_path()
        if opening_path.exists():
            try:
                opening_payload = json.loads(opening_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                opening_payload = {}
            opening_scripts = opening_payload.get("scripts", [])
            opening_len = len(opening_scripts) if isinstance(opening_scripts, list) else 0
            chapter = _set_chapter_range(chapter, "opening", 0, opening_len - 1 if opening_len > 0 else -1)
            if base_len > opening_len:
                chapter = _set_chapter_range(chapter, "theme", opening_len, base_len - 1)
            else:
                chapter = _set_chapter_range(chapter, "theme", -1, -1)

    if not tickers:
        auto_tickers = _auto_select_ticker_from_theme(
            date_str=date_str,
            base_scripts=[item for item in base_scripts if isinstance(item, dict)],
            chapter=[item for item in chapter if isinstance(item, dict)],
        )
        if auto_tickers:
            tickers = auto_tickers
            state = {**state, "user_tickers": tickers}

    if not tickers:
        # Persist a "no-op" ticker pipeline artifact for debuggability/consistency.
        pipeline_path = get_temp_ticker_pipeline_path()
        pipeline_path.write_text(
            json.dumps(
                {
                    "date": date_str,
                    "user_tickers": [],
                    "ticker_scripts": [],
                    "ticker_sections": [],
                    "refiner_edits": [],
                    "scripts": base_scripts,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        chapter = _set_chapter_range(chapter, "ticker", -1, -1)
        return {**state, "user_tickers": [], "scripts": base_scripts, "current_section": "closing", "chapter": chapter}

    # Fan-out: run debate per ticker, always persist debate artifacts.
    from concurrent.futures import ThreadPoolExecutor, as_completed

    from debate.graph import run_debate
    from debate.ticker_script import run_ticker_script_pipeline

    ensure_temp_dir()
    debate_out_dir = ROOT / "temp" / "debate" / date_str
    debate_out_dir.mkdir(parents=True, exist_ok=True)

    try:
        max_rounds = int(os.getenv("DEBATE_MAX_ROUNDS", "2") or "2")
    except Exception:
        max_rounds = 2

    debate_outputs: list[dict[str, Any]] = [None] * len(tickers)  # type: ignore[list-item]

    def _run_one(ticker: str) -> dict[str, Any]:
        return run_debate(date=date_str, ticker=ticker, max_rounds=max_rounds, prefetch=False, cleanup=False)

    with ThreadPoolExecutor(max_workers=min(4, len(tickers))) as ex:
        future_to_idx = {ex.submit(_run_one, t): i for i, t in enumerate(tickers)}
        for fut in as_completed(future_to_idx):
            idx = future_to_idx[fut]
            ticker = tickers[idx]
            out = fut.result()
            debate_outputs[idx] = out
            (debate_out_dir / f"{ticker}_debate.json").write_text(
                json.dumps(out, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

    # Fan-out: ticker_script worker per ticker -> fan-in merge -> refiner
    pipeline_out = run_ticker_script_pipeline(
        date=date_str,
        user_tickers=tickers,
        base_scripts=base_scripts,
        debate_outputs=debate_outputs,  # type: ignore[arg-type]
    )

    pipeline_path = get_temp_ticker_pipeline_path()
    pipeline_path.write_text(json.dumps(pipeline_out, ensure_ascii=False, indent=2), encoding="utf-8")

    scripts = pipeline_out.get("scripts", [])
    total_len = len(scripts) if isinstance(scripts, list) else 0
    if total_len > base_len:
        chapter = _set_chapter_range(chapter, "ticker", base_len, total_len - 1)
    else:
        chapter = _set_chapter_range(chapter, "ticker", -1, -1)

    return {
        **state,
        "user_tickers": tickers,
        "scripts": scripts if isinstance(scripts, list) else [],
        "current_section": "closing",
        "chapter": chapter,
    }


def closing_node(state: BriefingState) -> BriefingState:
    """ClosingAgent를 실행해 클로징(마무리) 파트를 생성한다."""
    date_str = state.get("date")
    if not date_str:
        raise ValueError("date 필드가 state에 없습니다. orchestrator 실행 시 날짜를 지정하세요.")

    set_briefing_date(date_str)

    scripts_input = state.get("scripts")
    pre_len: int | None = len(scripts_input) if isinstance(scripts_input, list) else None

    if not state.get("nutshell") or not state.get("themes"):
        temp_opening_path = get_temp_opening_path()
        if temp_opening_path.exists():
            try:
                opening_payload = json.loads(temp_opening_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                opening_payload = {}
            state = {
                **state,
                "nutshell": state.get("nutshell") or opening_payload.get("nutshell", ""),
                "themes": state.get("themes") or opening_payload.get("themes", []),
            }

    ca_graph = closing_graph.build_graph()
    result = ca_graph.invoke(
        {
            "date": date_str,
            "scripts": scripts_input,
        }
    )

    scripts = result.get("scripts", [])
    total_len = len(scripts) if isinstance(scripts, list) else 0
    closing_turns = result.get("closing_turns", [])
    if pre_len is None:
        pre_len = max(0, total_len - len(closing_turns)) if isinstance(closing_turns, list) else 0

    chapter = state.get("chapter")
    if not isinstance(chapter, list):
        chapter = _init_chapter()

    # closing은 항상 마지막에 append된다고 가정하고 길이로 범위 계산
    if total_len > pre_len:
        chapter = _set_chapter_range(chapter, "closing", pre_len, total_len - 1)
    else:
        chapter = _set_chapter_range(chapter, "closing", -1, -1)

    return {
        **state,
        "scripts": scripts if isinstance(scripts, list) else [],
        "current_section": "closing",
        "chapter": chapter,
    }


def build_orchestrator(stage: int = 3, agent: AgentName | None = None):
    """상위 그래프를 컴파일한다.
    
    Args:
        stage: 실행할 에이전트 단계
            0 - OpeningAgent만 실행
            1 - ThemeAgent까지 실행
            2 - UserTicker Pipeline까지 실행 (Closing 제외)
            3 - ClosingAgent까지 실행 (기본값)
        agent: 단일 에이전트만 실행할 때 지정
            "opening" - OpeningAgent만 실행 (global_prefetch/cleanup 포함)
            "theme" - ThemeAgent만 실행 (global_prefetch/cleanup 포함, temp/opening.json 필요)
            "ticker" - Ticker Pipeline만 실행 (global_prefetch/cleanup 포함, temp/theme.json 필요)
            "closing" - ClosingAgent만 실행 (global_prefetch/cleanup 포함, temp/ticker_pipeline.json 우선, 없으면 temp/theme.json)
    """
    load_env_from_yaml()
    load_dotenv(ROOT / ".env", override=False)
    configure_tracing()
    graph = StateGraph(BriefingState)
    graph.add_node("global_prefetch", global_prefetch_node)
    graph.add_node("opening", opening_node)
    graph.add_node("theme", theme_node)
    graph.add_node("ticker", ticker_pipeline_node)
    graph.add_node("closing", closing_node)
    graph.add_node("cleanup_cache", cleanup_cache_node)
    graph.set_entry_point("global_prefetch")

    if agent == "opening":
        graph.add_edge("global_prefetch", "opening")
        graph.add_edge("opening", "cleanup_cache")
    elif agent == "theme":
        graph.add_edge("global_prefetch", "theme")
        graph.add_edge("theme", "cleanup_cache")
    elif agent == "ticker":
        graph.add_edge("global_prefetch", "ticker")
        graph.add_edge("ticker", "cleanup_cache")
    elif agent == "closing":
        graph.add_edge("global_prefetch", "closing")
        graph.add_edge("closing", "cleanup_cache")
    else:
        if stage >= 1:
            graph.add_edge("opening", "theme")
            if stage >= 2:
                graph.add_edge("theme", "ticker")
                if stage >= 3:
                    graph.add_edge("ticker", "closing")
                    graph.add_edge("closing", "cleanup_cache")
                else:
                    graph.add_edge("ticker", "cleanup_cache")
            else:
                graph.add_edge("theme", "cleanup_cache")
        else:
            graph.add_edge("opening", "cleanup_cache")

        graph.add_edge("global_prefetch", "opening")
    graph.add_edge("cleanup_cache", END)

    return graph.compile()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="장마감 브리핑 오케스트레이터",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
    python orchestrator.py 20251125
    python orchestrator.py 2025-11-25
    python orchestrator.py 20251125 --stage 0  # OpeningAgent만 실행
    python orchestrator.py 20251125 --stage 1  # ThemeAgent까지 실행
    python orchestrator.py 20251125 --stage 2  # UserTicker Pipeline까지 실행 (Closing 제외)
    python orchestrator.py 20251125 --stage 3  # ClosingAgent까지 실행
        
날짜는 EST(미국 동부 시간) 기준입니다.
        """
    )
    parser.add_argument(
        "date",
        type=str,
        help="브리핑 날짜 (YYYYMMDD 또는 YYYY-MM-DD 형식, EST 기준)"
    )
    parser.add_argument(
        "--stage",
        type=int,
        default=3,
        choices=[0, 1, 2, 3],
        help="실행할 에이전트 단계 (0: Opening만, 1: Theme까지, 2: Ticker까지, 3: Closing까지, 기본값: 3)"
    )
    parser.add_argument(
        "--agent",
        type=str,
        default=None,
        choices=["opening", "theme", "ticker", "closing"],
        help="단일 에이전트만 실행 (stage를 무시, global_prefetch/cleanup 포함)",
    )
    parser.add_argument(
        "--tickers",
        "-t",
        nargs="*",
        default=[],
        help="사용자 티커 목록 (공백 또는 쉼표로 구분, 예: -t NVDA AAPL 또는 -t NVDA,AAPL)",
    )
    args = parser.parse_args()
    
    # 날짜 파싱 및 검증
    try:
        date_yyyymmdd = parse_date_arg(args.date)
    except ValueError as e:
        print(f"오류: {e}", file=sys.stderr)
        sys.exit(1)
    
    stage_names = {0: "OpeningAgent", 1: "ThemeAgent", 2: "TickerPipeline", 3: "ClosingAgent"}
    date_korean = format_date_korean(date_yyyymmdd)
    print(f"=== {date_korean} 장마감 브리핑 시작 ===")
    print(f"날짜: {date_yyyymmdd} (EST)")
    if args.agent:
        print(f"실행 모드: agent={args.agent} (단독 실행)")
    else:
        print(f"실행 단계: {args.stage} ({stage_names.get(args.stage, 'Unknown')}까지)")
    
    # ========================================
    # 0. 한국어 스크립트 존재 여부 체크 (그래프 실행 전)
    # ========================================
    podcast_dir = ROOT / "podcast" / date_yyyymmdd
    ko_script_path = podcast_dir / "ko" / "script.json"
    
    if ko_script_path.exists():
        print(f"\n[SKIP] 한국어 스크립트 이미 존재: {ko_script_path}")
        print(f"       (영어 번역 및 후처리만 진행합니다)\n")
        
        # 기존 파일에서 로드
        final_payload = json.loads(ko_script_path.read_text(encoding="utf-8"))
        skip_korean_generation = True
        
    else:
        print(f"\n[INFO] 한국어 스크립트 생성 시작...\n")
        
        # 그래프 실행
        user_tickers = parse_tickers(args.tickers)
        app = build_orchestrator(stage=args.stage, agent=args.agent)
        try:
            result = app.invoke({
                "date": date_yyyymmdd,
                "user_tickers": user_tickers,
            })
        finally:
            cleanup_cache_dir(date_yyyymmdd)

        scripts = result.get("scripts", [])
        chapter = result.get("chapter", _init_chapter())
        result_user_tickers = result.get("user_tickers", user_tickers)
        if not isinstance(result_user_tickers, list):
            result_user_tickers = user_tickers
        scripts_list = scripts if isinstance(scripts, list) else []
        chapter_list = chapter if isinstance(chapter, list) else _init_chapter()
        news_tickers = extract_news_tickers_from_theme(
            date=resolve_display_date(result.get("date", date_yyyymmdd), "ko"),
            user_tickers=result_user_tickers,
            scripts=[item for item in scripts_list if isinstance(item, dict)],
            chapter=[item for item in chapter_list if isinstance(item, dict)],
        )

        # 최종 산출물 생성
        final_payload = {
            "date": resolve_display_date(result.get("date", date_yyyymmdd), "ko"),
            "nutshell": result.get("nutshell", ""),
            "user_tickers": result_user_tickers,
            "news_tickers": news_tickers,
            "chapter": chapter_list,
            "scripts": scripts_list,
        }
        final_json = json.dumps(final_payload, ensure_ascii=False, indent=2)
        
        # 한국어 스크립트 저장
        ko_script_path.parent.mkdir(parents=True, exist_ok=True)
        ko_script_path.write_text(final_json, encoding="utf-8")
        print(f"\n[OK] 한국어 스크립트 저장: {ko_script_path}")
        skip_korean_generation = False
        
        # DB 업데이트 (한국어만)
        upsert_script_row(
            db_path=get_default_db_path(ROOT),
            date=date_yyyymmdd,
            nutshell=str(final_payload.get("nutshell") or ""),
            user_tickers=final_payload.get("user_tickers") or [],
            script_saved_at=utc_iso_from_timestamp(ko_script_path.stat().st_mtime),
        )

    # ========================================
    # 2. 영어 번역 (한국어 스크립트 기반)
    # ========================================
    en_script_path = podcast_dir / "en" / "script.json"
    
    if en_script_path.exists():
        print(f"[SKIP] 영어 스크립트 이미 존재: {en_script_path}")
    else:
        print(f"\n=== 영어 번역 시작 ===")
        try:
            import subprocess
            translate_script = ROOT / "AWS" / "translation" / "translate.py"
            
            translate_result = subprocess.run(
                ["uv", "run", "python", str(translate_script), date_yyyymmdd],
                cwd=ROOT,
                capture_output=True,
                text=True,
                timeout=300  # 5분
            )
            
            if translate_result.returncode == 0:
                print(f"[OK] 영어 번역 완료: {en_script_path}")
            else:
                print(f"[FAIL] 영어 번역 실패 (exit code {translate_result.returncode})")
                if translate_result.stderr:
                    print(f"       Error: {translate_result.stderr[:300]}")
                print(f"       수동 실행: uv run python AWS/translation/translate.py {date_yyyymmdd}")
        
        except Exception as e:
            print(f"[FAIL] 영어 번역 실패: {e}")
            print(f"       수동 실행: uv run python AWS/translation/translate.py {date_yyyymmdd}")
    
    # ========================================
    # 3. 슬라이드 생성 (한국어만, web frontend용)
    # ========================================
    if not skip_korean_generation:
        print(f"\n=== Generating Slides for Web ===")
        try:
            # web/scripts를 sys.path에 추가
            import sys
            web_scripts_path = ROOT / "web" / "scripts"
            if str(web_scripts_path) not in sys.path:
                sys.path.insert(0, str(web_scripts_path))
            
            from slide_generator import SlideGenerator
            
            generator = SlideGenerator(prefix="SLIDE")
            slides_path = generator.generate_slides_for_date(date_yyyymmdd)
            generator.update_landing_index(date_yyyymmdd)
            
            print(f"[OK] Slides generated: {slides_path}")
        except Exception as e:
            print(f"[FAIL] Slide generation failed: {e}")
            print("       (Script is saved, but slides need to be generated manually)")
            print(f"       Run: python web/scripts/generate-slides.py {date_yyyymmdd}")
    else:
        print(f"\n[SKIP] 슬라이드 생성 건너뜀 (한국어 스크립트 재사용)")
    
    # ========================================
    # 4. 팟캐스트 메타데이터 생성 (언어별)
    # ========================================
    print(f"\n=== Generating Podcast Metadata ===")
    
    # 한국어 메타데이터
    if not skip_korean_generation:
        try:
            import subprocess
            metadata_script = ROOT / "web" / "scripts" / "generate-podcast-metadata.py"
            
            ko_metadata_result = subprocess.run(
                ["uv", "run", "python", str(metadata_script), date_yyyymmdd, "ko"],
                cwd=ROOT,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if ko_metadata_result.returncode == 0:
                print(f"[OK] 한국어 메타데이터 생성:")
                print(f"     - {podcast_dir / 'ko' / 'metadata.json'}")
            else:
                print(f"[FAIL] 한국어 메타데이터 생성 실패 (exit code {ko_metadata_result.returncode})")
                if ko_metadata_result.stderr:
                    print(f"       Error: {ko_metadata_result.stderr[:500]}")
                if ko_metadata_result.stdout:
                    print(f"       Output: {ko_metadata_result.stdout[:200]}")
            
        except Exception as e:
            print(f"[FAIL] 한국어 메타데이터 생성 실패: {e}")
            print(f"       Run: uv run python web/scripts/generate-podcast-metadata.py {date_yyyymmdd} ko")
    else:
        print(f"[SKIP] 한국어 메타데이터 생성 건너뜀")
    
    # 영어 메타데이터 (한국어 메타데이터에서 번역)
    ko_metadata_path = podcast_dir / "ko" / "metadata.json"
    if ko_metadata_path.exists() and en_script_path.exists():
        try:
            import subprocess
            translate_metadata_script = ROOT / "AWS" / "translation" / "translate_metadata.py"
            
            en_metadata_result = subprocess.run(
                ["uv", "run", "python", str(translate_metadata_script), date_yyyymmdd],
                cwd=ROOT,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if en_metadata_result.returncode == 0:
                print(f"[OK] 영어 메타데이터 번역 완료:")
                print(f"     - {podcast_dir / 'en' / 'metadata.json'}")
            else:
                print(f"[FAIL] 영어 메타데이터 번역 실패 (exit code {en_metadata_result.returncode})")
                if en_metadata_result.stderr:
                    print(f"       Error: {en_metadata_result.stderr[:200]}")
        
        except Exception as e:
            print(f"[FAIL] 영어 메타데이터 번역 실패: {e}")
            print(f"       Run: uv run python AWS/translation/translate_metadata.py {date_yyyymmdd}")
    
    print("\n=== Orchestrator Result ===")
    print("nutshell:", final_payload.get("nutshell"))
    print("user_tickers:", final_payload.get("user_tickers"))
    print("scripts len:", len(final_payload.get("scripts", [])))


if __name__ == "__main__":
    main()
