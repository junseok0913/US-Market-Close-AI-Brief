from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


def load_module():
    root = Path(__file__).resolve().parents[1]
    module_path = root / "shorts-firm" / "generate_script.py"
    spec = importlib.util.spec_from_file_location("shorts_firm_generate_script", module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Failed to load shorts-firm/generate_script.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


mod = load_module()


class ExtractTickerReasonTests(unittest.TestCase):
    def test_multicompany_turn_extracts_target_clause_and_shared_catalyst(self) -> None:
        script_json = {
            "chapter": [{"name": "ticker", "start_id": 18, "end_id": 20}],
            "scripts": [
                {"id": 18, "speaker": "진행자", "text": "상황이 정말 심각하군요.", "sources": []},
                {
                    "id": 19,
                    "speaker": "해설자",
                    "text": (
                        "네, 시장 전반의 투매 속에서도 에너지 기업들은 축제를 벌였습니다. "
                        "대장주인 엑슨모빌이 1.29퍼센트 상승했고, 셰브론은 2.7퍼센트 올랐습니다. "
                        "코노코필립스 역시 2.76퍼센트 상승하며 강세를 보였고, 특히 옥시덴탈 페트롤리움은 5퍼센트 넘게 급등하며 가장โดดเด่น한 모습을 보였습니다. "
                        "이들 기업의 주가 상승은 단순히 유가 상승에 따른 이익 증가 기대감 때문만은 아닙니다. "
                        "지정학적 위기가 고조될수록 안정적인 에너지 공급망을 확보한 미국 기업들의 가치가 재평가받는, 이른바 에너지 안보 프리미엄이 주가에 반영된 결과로 분석됩니다. "
                        "실제로 에너지 섹터 ETF인 XLE는 이틀 연속 강세를 보이며 사상 최고치를 경신하기도 했습니다."
                    ),
                    "sources": [
                        {"type": "chart", "ticker": "XOM"},
                        {"type": "chart", "ticker": "CVX"},
                        {"type": "chart", "ticker": "COP"},
                        {"type": "chart", "ticker": "OXY"},
                        {"type": "chart", "ticker": "XLE"},
                    ],
                },
            ],
        }

        reason = mod.extract_ticker_reason(script_json, "COP")

        self.assertIn("코노코필립스", reason)
        self.assertIn("에너지 안보 프리미엄", reason)
        self.assertNotIn("엑슨모빌이 1.29퍼센트", reason)
        self.assertNotIn("셰브론은 2.7퍼센트", reason)
        self.assertNotIn("옥시덴탈", reason)

    def test_single_company_turn_still_uses_direct_sentences(self) -> None:
        script_json = {
            "chapter": [{"name": "ticker", "start_id": 22, "end_id": 29}],
            "scripts": [
                {
                    "id": 23,
                    "speaker": "해설자",
                    "text": (
                        "서던 코퍼는 최근 연차보고서에서 기록적인 실적을 발표했습니다. "
                        "하지만 모든 자산이 페루와 멕시코에 집중된 정치적 리스크가 부각됐습니다."
                    ),
                    "sources": [{"type": "chart", "ticker": "SCCO"}],
                }
            ],
        }

        reason = mod.extract_ticker_reason(script_json, "SCCO")

        self.assertIn("서던 코퍼", reason)
        self.assertIn("정치적 리스크", reason)


if __name__ == "__main__":
    unittest.main()
