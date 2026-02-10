#!/usr/bin/env python3
"""
RSS Feed Generator for Bilingual Podcast (Korean + English)

Usage:
    python AWS/scripts/update_podcast_feed.py --lang ko
    python AWS/scripts/update_podcast_feed.py --lang en
"""

import argparse
import boto3
import email.utils
import json
import os
import tempfile
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape
from dotenv import load_dotenv

try:
    from mutagen.mp3 import MP3
except ImportError:
    MP3 = None

load_dotenv()


def get_s3_client():
    return boto3.client(
        's3',
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        region_name=os.environ.get('AWS_REGION', 'us-east-2')
    )


def get_channel_info(lang):
    """언어별 채널 정보 반환"""
    if lang == "en":
        return {
            "title": "Daily US Market Close Briefing",
            "language": "en-us",
            "description": "[Updated daily at 7 AM KST] AI-powered, fact-checked analysis of US stock market close.\n\nWhat moved the markets overnight? Using cutting-edge LangGraph technology, we analyze vast news data and market indicators with fact-checking to deliver key insights.\n\nInvestment Disclaimer: This content is for informational purposes only and is not investment advice. All investment decisions are your own responsibility."
        }
    else:  # ko
        return {
            "title": "서학개미를 위한 Daily 미국시장 아침 브리핑",
            "language": "ko-kr",
            "description": "[매일 아침 7시 업데이트] AI agent가 분석하는 팩트체크를 거친 가장 정확하고 빠른 미국 주식 마감 시황.\n\n밤사이 뉴욕 증시, 왜 올랐을까요? 최신 랭그래프(LangGraph) 기술을 활용하여 방대한 뉴스 데이터와 시장 지표를 분석하고 팩트 검증 과정까지 거쳐 핵심을 정리해 드립니다.\n\n투자 유의사항: 본 콘텐츠는 정보 제공 목적이며, 투자 권유가 아닙니다. 모든 투자 결정은 본인의 책임입니다."
        }


def generate_rss_xml(base_url, episodes, lang="ko"):
    """RSS XML 생성 (언어별)"""
    
    channel_info = get_channel_info(lang)
    
    # 언어별 아트워크 이미지
    artwork_filename = "artwork_en.jpg" if lang == "en" else "artwork.jpg"
    
    # RSS 헤더
    rss_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>{channel_info['title']}</title>
    <link>{base_url}</link>
    <language>{channel_info['language']}</language>
    <copyright>© 2026 Stock Daily. All rights reserved.</copyright>
    <itunes:author>Stock Daily</itunes:author>
    <itunes:owner>
      <itunes:name>Stock Daily</itunes:name>
      <itunes:email>ehddus416@gmail.com</itunes:email>
    </itunes:owner>
    <itunes:image href="{base_url}/{artwork_filename}"/>
    <itunes:explicit>no</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <itunes:category text="Business">
      <itunes:category text="Investing"/>
    </itunes:category>
    <itunes:category text="News"/>
    <description>{channel_info['description']}</description>
"""
    
    # 에피소드 정렬 (최신순)
    sorted_episodes = sorted(episodes, key=lambda x: x['date'], reverse=True)
    
    for ep in sorted_episodes:
        date_str = ep['date']  # YYYYMMDD
        
        # 날짜 RFC 2822 포맷
        try:
            dt = datetime.strptime(date_str, "%Y%m%d")
            pub_date = email.utils.format_datetime(dt)
        except:
            pub_date = date_str
        
        # 언어별 경로
        audio_url = f"{base_url}/{date_str}/{lang}/{date_str}.mp3"
        episode_link = f"{base_url}/{date_str}/"
        
        # 메타데이터
        if lang == "en":
            default_title = f"{date_str} US Market Close Briefing"
            default_desc = "AI-powered summary of today's US market close."
        else:
            default_title = f"{date_str} 미국 증시 브리핑"
            default_desc = "AI가 정리한 오늘의 미국 증시 마감 시황입니다."
        
        title = escape(ep.get('title', default_title))
        description = escape(ep.get('description', default_desc))
        duration = ep.get('duration_seconds', 0)
        file_size = ep.get('file_size_bytes', 0)
        
        rss_xml += f"""
    <item>
      <title>{title}</title>
      <link>{episode_link}</link>
      <description>{description}</description>
      <content:encoded><![CDATA[{description.replace('\n', '<br/>')}]]></content:encoded>
      <itunes:author>Stock Daily</itunes:author>
      <enclosure url="{audio_url}" length="{file_size}" type="audio/mpeg"/>
      <guid>{audio_url}</guid>
      <pubDate>{pub_date}</pubDate>
      <itunes:duration>{duration}</itunes:duration>
    </item>"""
    
    rss_xml += """
  </channel>
</rss>
"""
    
    return rss_xml


def main():
    parser = argparse.ArgumentParser(description="Generate bilingual RSS podcast feed")
    parser.add_argument("--lang", choices=["ko", "en"], default="ko", help="Language (ko or en)")
    args = parser.parse_args()
    
    lang = args.lang
    bucket_name = os.environ.get('BUCKET_NAME', 'podcast-daily-stock')
    cloudfront_domain = os.environ.get('CLOUDFRONT_DOMAIN', 'your-cloudfront-domain.cloudfront.net')
    base_url = f"https://{cloudfront_domain}"
    
    print(f"🌍 Generating RSS feed for language: {lang}")
    print(f"📦 Bucket: {bucket_name}")
    print(f"🔗 Base URL: {base_url}")
    
    s3 = get_s3_client()
    
    # S3에서 에피소드 목록 가져오기
    print(f"\n📥 Fetching episodes from S3...")
    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Delimiter='/')
        
        episodes = []
        if 'CommonPrefixes' in response:
            for prefix in response['CommonPrefixes']:
                date_folder = prefix['Prefix'].strip('/')
                
                # YYYYMMDD 형식 검증
                if len(date_folder) == 8 and date_folder.isdigit():
                    # 언어별 metadata.json 로드
                    metadata_key = f"{date_folder}/{lang}/metadata.json"
                    audio_key = f"{date_folder}/{lang}/{date_folder}.mp3"
                    
                    # metadata 가져오기
                    try:
                        metadata_obj = s3.get_object(Bucket=bucket_name, Key=metadata_key)
                        metadata = json.loads(metadata_obj['Body'].read().decode('utf-8'))
                    except Exception as e:
                        print(f"⚠️  Metadata not found for {date_folder}/{lang}, using defaults")
                        metadata = {}
                    
                    # MP3 파일 크기 및 duration 가져오기
                    try:
                        audio_obj = s3.head_object(Bucket=bucket_name, Key=audio_key)
                        file_size = audio_obj['ContentLength']
                        
                        # Duration 계산 (mutagen 사용)
                        duration_seconds = 0
                        if MP3:
                            try:
                                with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp:
                                    s3.download_fileobj(bucket_name, audio_key, tmp)
                                    tmp_path = tmp.name
                                
                                audio = MP3(tmp_path)
                                duration_seconds = int(audio.info.length)
                                os.unlink(tmp_path)
                            except:
                                pass
                        
                        episodes.append({
                            'date': date_folder,
                            'title': metadata.get('title', ''),
                            'description': metadata.get('description', ''),
                            'file_size_bytes': file_size,
                            'duration_seconds': duration_seconds
                        })
                        
                        print(f"  ✅ {date_folder}/{lang}")
                    
                    except Exception as e:
                        # Skip if MP3 file doesn't exist (404, NoSuchKey, etc.)
                        print(f"  ⏭️  {date_folder}/{lang} (MP3 not found)")
        
        print(f"\n📊 Total episodes: {len(episodes)}")
        
        # RSS XML 생성
        rss_xml = generate_rss_xml(base_url, episodes, lang)
        
        # 파일명 결정
        rss_filename = "podcast_en.xml" if lang == "en" else "podcast.xml"
        
        # 로컬에도 저장 (미리보기용)
        local_path = Path(__file__).parent.parent / rss_filename
        local_path.write_text(rss_xml, encoding='utf-8')
        print(f"\n💾 Saved locally: {local_path}")
        
        # S3에 업로드
        print(f"📤 Uploading {rss_filename} to S3...")
        s3.put_object(
            Bucket=bucket_name,
            Key=rss_filename,
            Body=rss_xml.encode('utf-8'),
            ContentType='application/xml',
            CacheControl='max-age=300'  # 5분 캐시
        )
        
        print(f"✅ Successfully uploaded {rss_filename}")
        print(f"🔗 Feed URL: {base_url}/{rss_filename}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
