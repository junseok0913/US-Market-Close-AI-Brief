from shared.fetchers.news import prefetch_news
import os
from pathlib import Path
from datetime import datetime

print("Testing DynamoDB connection...")
print(f"Current AWS configuration:")
print(f"- PROFILE: {os.getenv('AWS_PROFILE', 'Not Set')}")
print(f"- REGION: {os.getenv('AWS_REGION', 'Not Set')}")

try:
    # 2026-01-28 데이터 조회 시도 (캐시 디렉토리 임시 생성)
    # prefetch_news는 내부적으로 get_dynamo_table -> get_boto3_session을 호출함
    prefetch_news(today=datetime(2026, 1, 28), cache_dir=Path("./tmp_test"))
    print("✅ Success! DynamoDB connection is working.")
except Exception as e:
    print(f"❌ Failed: {e}")
