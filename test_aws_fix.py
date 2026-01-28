import yaml
import os
import boto3
from shared.utils.aws import get_boto3_session

print('--- 1. YAML 파일 검증 ---')
try:
    with open('config/app.yaml', 'r') as f:
        config = yaml.safe_load(f)
        val = config.get("env", {}).get("AWS_PROFILE")
        if val is None:
            print("✅ AWS_PROFILE is NOT in yaml (GOOD)")
        else:
            print(f"❌ AWS_PROFILE found in yaml: {val} (BAD)")
except Exception as e:
    print(f"⚠️ Could not read yaml: {e}")

print('\n--- 2. AWS 세션 Fallback 테스트 ---')
try:
    # 1. 일부러 없는 프로필로 호출 (에러가 나야 정상이지만, 우리가 만든 코드가 잡아서 살려줘야 함)
    print('Testing with invalid profile...')
    session = get_boto3_session(profile_name='InvalidProfileTest', region_name='us-east-2')
    print(f'✅ Success! Created session: {session}')
    
    # 2. 프로필 없이 호출 (기본 동작 확인)
    print('\nTesting with None profile...')
    session_none = get_boto3_session(profile_name=None, region_name='us-east-2')
    print(f'✅ Success! Created session (None): {session_none}')
    
except Exception as e:
    print(f'❌ FAIL: Error occurred: {e}')
