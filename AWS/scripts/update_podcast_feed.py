
import boto3
import email.utils
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape
from dotenv import load_dotenv

# .env 파일 로드 (로컬 테스트용)
# GitHub Actions에서는 Secrets가 환경변수로 주입되므로 이 줄이 있어도 무시되거나 덮어씌워짐
load_dotenv()

def get_s3_client():
    return boto3.client(
        's3',
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        region_name=os.environ.get('AWS_REGION', 'us-east-2')
    )

def generate_rss_xml(base_url, episodes):
    # RSS 헤더 (채널 정보)
    # 실제 운영 시에는 이 부분을 본인 팟캐스트 정보로 수정하세요
    rss_header = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>서학개미를 위한 Daily 미국시장 아침 브리핑</title>
    <link>{base_url}</link>
    <language>ko-kr</language>
    <itunes:author>Stock Daily</itunes:author>
    <itunes:image href="{base_url}/artwork.jpg"/>
    <itunes:category text="Business">
      <itunes:category text="Investing"/>
    </itunes:category>
    <description>[매일 아침 7시 업데이트] AI agent가 분석하는 팩트체크를 거친 가장 정확하고 빠른 미국 주식 마감 시황.

밤사이 뉴욕 증시, 왜 올랐을까요? 최신 랭그래프(LangGraph) 기술을 활용하여 방대한 뉴스 데이터와 시장 지표를 분석하고 팩트 검증 과정까지 거쳐 핵심을 정리해 드립니다.</description>
"""
    
    rss_items = ""
    # 최신 에피소드가 위로 오도록 정렬 (날짜 내림차순)
    sorted_episodes = sorted(episodes, key=lambda x: x['date'], reverse=True)

    for ep in sorted_episodes:
        date_str = ep['date'] # YYYYMMDD
        
        # 날짜 파싱 및 RFC 2822 포맷 변환 (Sat, 24 Jan 2026 05:00:00 +0000)
        try:
            dt = datetime.strptime(date_str, "%Y%m%d")
            pub_date = email.utils.format_datetime(dt)
        except:
            pub_date = date_str

        audio_url = f"{base_url}/{date_str}/{date_str}.mp3"
        
        # 메타데이터가 있으면 사용, 없으면 기본값
        title = escape(ep.get('title', f"{date_str} 미국 증시 브리핑"))
        description = escape(ep.get('description', "AI가 정리한 오늘의 미국 증시 마감 시황입니다."))
        duration = ep.get('duration_seconds', 0) # 초 단위 (선택사항)
        
        # 파일 크기 (바이트) - 필수
        file_size = ep.get('file_size_bytes', 0) 

        item = f"""
    <item>
      <title>{title}</title>
      <description>{description}</description>
      <enclosure url="{audio_url}" length="{file_size}" type="audio/mpeg"/>
      <guid>{audio_url}</guid>
      <pubDate>{pub_date}</pubDate>
      <itunes:duration>{duration}</itunes:duration>
    </item>"""
        rss_items += item

    rss_footer = """
  </channel>
</rss>
"""
    return rss_header + rss_items + rss_footer

def main():
    bucket_name = os.environ.get('BUCKET_NAME')
    target_date = sys.argv[1] if len(sys.argv) > 1 else None

    if not bucket_name:
        print("Error: BUCKET_NAME environment variable is required")
        sys.exit(1)

    print(f"📡 Updating RSS Feed for bucket: {bucket_name}")
    s3 = get_s3_client()
    
    # 0. 도메인 결정 (CloudFront 우선, 없으면 S3)
    # .env 파일 혹은 Secret에 CLOUDFRONT_DOMAIN 정의 권장 (예: d1234abcd.cloudfront.net)
    cf_domain = os.environ.get('CLOUDFRONT_DOMAIN')
    if cf_domain:
        # https:// 없이 도메인만 입력된 경우 처리
        cf_domain = cf_domain.replace("https://", "").replace("http://", "").strip("/")
        base_url = f"https://{cf_domain}"
        print(f"🌍 Using CloudFront URL: {base_url}")
    else:
        # S3 직접 링크 (비권장, fallback)
        base_url = f"https://{bucket_name}.s3.amazonaws.com"
        print(f"⚠️ Using S3 Direct URL (CloudFront recommended): {base_url}")

    # 1. 기존 RSS 파일 가져오기 (혹은 새로 시작하기)
    # 실제로는 S3를 스캔해서 에피소드 목록을 재구성하는 것이 안전합니다.
    # 여기서는 S3의 폴더들을 스캔합니다.
    
    episodes = []
    
    # S3 내의 모든 폴더(오브젝트 접두사) 조회
    # '2026'으로 시작하는 폴더만 에피소드로 간주
    paginator = s3.get_paginator('list_objects_v2')
    
    # 루트 경로의 폴더들을 찾기 위해 delimiter 사용
    response_iterator = paginator.paginate(Bucket=bucket_name, Delimiter='/')

    for page in response_iterator:
        if 'CommonPrefixes' not in page:
            continue
            
        for prefix in page['CommonPrefixes']:
            folder_name = prefix['Prefix'].strip('/') # 예: '20260123'
            
            # 날짜 형식인지 확인 (YYYYMMDD)
            if not (len(folder_name) == 8 and folder_name.isdigit() and folder_name.startswith('20')):
                continue
                
            print(f"🔍 Found episode folder: {folder_name}")
            
            # 해당 폴더 내의 mp3 파일 확인
            mp3_key = f"{folder_name}/{folder_name}.mp3"
            metadata_key = f"{folder_name}/metadata.json"
            
            try:
                # MP3 메타데이터(크기 등) 가져오기
                head = s3.head_object(Bucket=bucket_name, Key=mp3_key)
                file_size = head['ContentLength']
                
                episode_data = {
                    'date': folder_name,
                    'file_size_bytes': file_size
                }
                
                # metadata.json이 있으면 내용 읽기
                try:
                    meta_obj = s3.get_object(Bucket=bucket_name, Key=metadata_key)
                    meta_content = json.loads(meta_obj['Body'].read().decode('utf-8'))
                    episode_data['title'] = meta_content.get('title')
                    episode_data['description'] = meta_content.get('description')
                except:
                    print(f"   (No metadata.json for {folder_name}, using defaults)")
                
                episodes.append(episode_data)
                
            except Exception as e:
                print(f"   ⚠️ Skipping {folder_name}: No mp3 found or error ({e})")

    # 2. RSS XML 생성
    rss_xml = generate_rss_xml(base_url, episodes)
    
    # 3. 로컬에 저장 (디버깅용) - AWS 폴더 내에 저장
    output_path = Path("AWS/podcast.xml")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(rss_xml)
        
    # 4. S3 업로드
    # Content-Type을 text/xml로 설정해야 브라우저/팟캐스트 앱이 인식함
    s3.put_object(
        Bucket=bucket_name,
        Key='podcast.xml',
        Body=rss_xml.encode('utf-8'),
        ContentType='application/rss+xml'
        # ACL='public-read' 제거: 최신 S3 버킷 권장 설정(Bucket Policy 사용)을 따름
    )
    
    print(f"✅ Success! RSS feed updated: https://{bucket_name}.s3.amazonaws.com/podcast.xml")

if __name__ == "__main__":
    main()
