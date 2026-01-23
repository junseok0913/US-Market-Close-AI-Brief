#!/usr/bin/env python3
"""슬라이드 생성 CLI

Usage:
    python generate_slides.py 20260121
    uv run python generate_slides.py 20260121
"""

import argparse
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv

# 프로젝트 루트를 Python path에 추가
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from shared.utils.llm import build_llm
from shared.yaml_config import load_env_from_yaml
from slide_generator import SlideGenerator


def main():
    """CLI 엔트리포인트"""
    
    # 로깅 설정
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s"
    )
    
    # 인자 파싱
    parser = argparse.ArgumentParser(
        description="script.json을 읽어 슬라이드 생성",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예제:
  python generate_slides.py 20260121
  uv run python generate_slides.py 20260121
  
생성 위치:
  web/src/landing/{date}/slides.ts
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
        default="SLIDE",
        help="환경변수 prefix (기본값: SLIDE, 예: SLIDE_OPENAI_MODEL)"
    )
    parser.add_argument(
        "--no-index-update",
        action="store_true",
        help="landing/index.ts 자동 업데이트 비활성화"
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
        # 슬라이드 생성
        generator = SlideGenerator(prefix=args.prefix)
        
        print(f"\n🚀 슬라이드 생성 시작...")
        print(f"   날짜: {date}")
        print(f"   환경변수 prefix: {args.prefix}")
        print(f"   (모델은 {args.prefix}_OPENAI_MODEL 또는 OPENAI_MODEL 사용)\n")
        
        output_path = generator.generate_slides_for_date(date)
        
        print(f"\n✅ 슬라이드 생성 완료!")
        print(f"   파일: {output_path}")
        
        # index.ts 업데이트
        if not args.no_index_update:
            print(f"\n📝 landing/index.ts 업데이트 중...")
            generator.update_landing_index(date)
        
        print(f"\n🎉 모든 작업 완료!\n")
        print(f"웹 확인:")
        print(f"  cd web")
        print(f"  npm run dev:fresh")
        print(f"  http://localhost:3000/episode/{date}\n")
        
    except FileNotFoundError as e:
        print(f"\n❌ 파일을 찾을 수 없습니다:")
        print(f"   {e}")
        print(f"\n확인 사항:")
        print(f"  1. podcast/{date}/script.json 파일이 있는지 확인")
        print(f"  2. orchestrator.py를 먼저 실행했는지 확인\n")
        sys.exit(1)
    
    except ValueError as e:
        print(f"\n❌ 슬라이드 생성 실패:")
        print(f"   {e}")
        print(f"\n재시도:")
        print(f"  1. OpenAI API 키가 설정되었는지 확인 (.env)")
        print(f"  2. .env에서 OPENAI_MODEL 확인 (현재: gpt-5.1)")
        print(f"  3. SLIDE_OPENAI_MODEL로 별도 설정 가능\n")
        sys.exit(1)
    
    except Exception as e:
        print(f"\n❌ 예상치 못한 오류:")
        print(f"   {type(e).__name__}: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
