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

INDEX_VERSION = 1


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


def _iso_or_empty(value):
    if not value:
        return ""
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def get_index_s3_key(lang):
    return f"rss_index_{lang}.json"


def get_local_index_path(lang):
    return Path(__file__).parent.parent / get_index_s3_key(lang)


def load_index_file(path):
    if not path.exists():
        return {"version": INDEX_VERSION, "episodes": {}}

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
        episodes = raw.get("episodes", {})
        if isinstance(episodes, list):
            episodes = {ep.get("date", ""): ep for ep in episodes if ep.get("date")}
        if not isinstance(episodes, dict):
            episodes = {}
        return {"version": INDEX_VERSION, "episodes": episodes}
    except Exception:
        return {"version": INDEX_VERSION, "episodes": {}}


def load_index_from_s3(s3, bucket_name, key):
    try:
        obj = s3.get_object(Bucket=bucket_name, Key=key)
    except Exception:
        return {"version": INDEX_VERSION, "episodes": {}}

    try:
        raw = json.loads(obj["Body"].read().decode("utf-8"))
        episodes = raw.get("episodes", {})
        if isinstance(episodes, list):
            episodes = {ep.get("date", ""): ep for ep in episodes if ep.get("date")}
        if not isinstance(episodes, dict):
            episodes = {}
        return {"version": INDEX_VERSION, "episodes": episodes}
    except Exception:
        return {"version": INDEX_VERSION, "episodes": {}}


def merge_indexes(local_index, s3_index):
    merged = {}
    merged.update(local_index.get("episodes", {}))
    merged.update(s3_index.get("episodes", {}))
    return merged


def list_date_folders(s3, bucket_name):
    folders = set()
    paginator = s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=bucket_name, Delimiter="/")
    for page in pages:
        for prefix in page.get("CommonPrefixes", []):
            date_folder = prefix.get("Prefix", "").strip("/")
            if len(date_folder) == 8 and date_folder.isdigit():
                folders.add(date_folder)
    return sorted(folders)


def safe_head_object(s3, bucket_name, key):
    try:
        return s3.head_object(Bucket=bucket_name, Key=key)
    except Exception:
        return None


def build_sync_fingerprint(audio_head, metadata_head, thumbnail_head):
    audio_etag = (audio_head or {}).get("ETag", "")
    audio_lm = _iso_or_empty((audio_head or {}).get("LastModified"))
    metadata_etag = (metadata_head or {}).get("ETag", "")
    thumbnail_etag = (thumbnail_head or {}).get("ETag", "")
    return f"{audio_etag}|{audio_lm}|{metadata_etag}|{thumbnail_etag}"


def read_metadata_json(s3, bucket_name, metadata_key, date_folder, lang):
    try:
        metadata_obj = s3.get_object(Bucket=bucket_name, Key=metadata_key)
        return json.loads(metadata_obj["Body"].read().decode("utf-8"))
    except Exception:
        print(f"⚠️  Metadata not found for {date_folder}/{lang}, using defaults")
        return {}


def get_duration_from_metadata(metadata):
    value = metadata.get("duration_seconds")
    if isinstance(value, int):
        return max(value, 0)
    if isinstance(value, float):
        return max(int(value), 0)
    return 0


def calculate_mp3_duration(s3, bucket_name, audio_key):
    duration_seconds = 0
    if not MP3:
        return duration_seconds
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            s3.download_fileobj(bucket_name, audio_key, tmp)
            tmp_path = tmp.name
        audio = MP3(tmp_path)
        duration_seconds = int(audio.info.length)
        os.unlink(tmp_path)
    except Exception:
        return 0
    return duration_seconds


def build_episode_entry(date_folder, lang, base_url, metadata, file_size, duration_seconds, thumbnail_exists):
    thumbnail_key = f"{date_folder}/{lang}/thumbnail.png"
    image_url = f"{base_url}/{thumbnail_key}" if thumbnail_exists else ""
    return {
        "date": date_folder,
        "title": metadata.get("title", ""),
        "description": metadata.get("description", ""),
        "file_size_bytes": file_size,
        "duration_seconds": duration_seconds,
        "image_url": image_url,
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
        description_html = description.replace('\n', '<br/>')
        duration = ep.get('duration_seconds', 0)
        file_size = ep.get('file_size_bytes', 0)
        item_image_url = ep.get('image_url', '').strip()
        item_image_tag = f'\n      <itunes:image href="{item_image_url}"/>' if item_image_url else ''
        
        rss_xml += f"""
    <item>
      <title>{title}</title>
      <link>{episode_link}</link>
      <description>{description}</description>
      <content:encoded><![CDATA[{description_html}]]></content:encoded>
      <itunes:author>Stock Daily</itunes:author>{item_image_tag}
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
    index_key = get_index_s3_key(lang)
    local_index_path = get_local_index_path(lang)
    
    # S3에서 에피소드 목록 가져오기
    print(f"\n📥 Fetching episodes from S3...")
    try:
        local_index = load_index_file(local_index_path)
        s3_index = load_index_from_s3(s3, bucket_name, index_key)
        merged_cached_entries = merge_indexes(local_index, s3_index)
        print(
            "🗂️  Index cache loaded:"
            f" local={len(local_index.get('episodes', {}))},"
            f" s3={len(s3_index.get('episodes', {}))},"
            f" merged={len(merged_cached_entries)}"
        )

        date_folders = list_date_folders(s3, bucket_name)
        episodes = []
        next_index_entries = {}
        cached_count = 0
        updated_count = 0
        duration_download_count = 0

        for date_folder in date_folders:
            metadata_key = f"{date_folder}/{lang}/metadata.json"
            audio_key = f"{date_folder}/{lang}/{date_folder}.mp3"
            thumbnail_key = f"{date_folder}/{lang}/thumbnail.png"

            audio_head = safe_head_object(s3, bucket_name, audio_key)
            if not audio_head:
                print(f"  ⏭️  {date_folder}/{lang} (MP3 not found)")
                continue

            metadata_head = safe_head_object(s3, bucket_name, metadata_key)
            thumbnail_head = safe_head_object(s3, bucket_name, thumbnail_key)
            sync_fingerprint = build_sync_fingerprint(audio_head, metadata_head, thumbnail_head)

            cached_entry = merged_cached_entries.get(date_folder, {})
            if cached_entry and cached_entry.get("sync_fingerprint") == sync_fingerprint:
                entry = build_episode_entry(
                    date_folder=date_folder,
                    lang=lang,
                    base_url=base_url,
                    metadata={
                        "title": cached_entry.get("title", ""),
                        "description": cached_entry.get("description", ""),
                    },
                    file_size=audio_head.get("ContentLength", cached_entry.get("file_size_bytes", 0)),
                    duration_seconds=int(cached_entry.get("duration_seconds", 0) or 0),
                    thumbnail_exists=bool(thumbnail_head),
                )
                episodes.append(entry)
                next_index_entries[date_folder] = {
                    **entry,
                    "sync_fingerprint": sync_fingerprint,
                    "audio_etag": audio_head.get("ETag", ""),
                    "audio_last_modified": _iso_or_empty(audio_head.get("LastModified")),
                    "metadata_etag": (metadata_head or {}).get("ETag", ""),
                    "thumbnail_etag": (thumbnail_head or {}).get("ETag", ""),
                }
                cached_count += 1
                print(f"  ✅ {date_folder}/{lang} (cached)")
                continue

            metadata = (
                read_metadata_json(s3, bucket_name, metadata_key, date_folder, lang)
                if metadata_head
                else {}
            )
            if not metadata_head:
                print(f"⚠️  Metadata not found for {date_folder}/{lang}, using defaults")

            file_size = audio_head.get("ContentLength", 0)
            duration_seconds = get_duration_from_metadata(metadata)

            if duration_seconds <= 0:
                same_audio_as_cache = (
                    cached_entry
                    and cached_entry.get("audio_etag", "") == audio_head.get("ETag", "")
                    and cached_entry.get("audio_last_modified", "") == _iso_or_empty(audio_head.get("LastModified"))
                )
                if same_audio_as_cache and cached_entry.get("duration_seconds"):
                    duration_seconds = int(cached_entry.get("duration_seconds", 0))
                else:
                    duration_seconds = calculate_mp3_duration(s3, bucket_name, audio_key)
                    if duration_seconds > 0:
                        duration_download_count += 1

            entry = build_episode_entry(
                date_folder=date_folder,
                lang=lang,
                base_url=base_url,
                metadata=metadata,
                file_size=file_size,
                duration_seconds=duration_seconds,
                thumbnail_exists=bool(thumbnail_head),
            )
            episodes.append(entry)
            next_index_entries[date_folder] = {
                **entry,
                "sync_fingerprint": sync_fingerprint,
                "audio_etag": audio_head.get("ETag", ""),
                "audio_last_modified": _iso_or_empty(audio_head.get("LastModified")),
                "metadata_etag": (metadata_head or {}).get("ETag", ""),
                "thumbnail_etag": (thumbnail_head or {}).get("ETag", ""),
            }
            updated_count += 1
            print(f"  ✅ {date_folder}/{lang} (updated)")
        
        print(f"\n📊 Total episodes: {len(episodes)}")
        print(
            "⚡ Index stats:"
            f" cached={cached_count}, updated={updated_count},"
            f" duration_downloads={duration_download_count}"
        )

        previous_entries = merged_cached_entries
        index_changed = previous_entries != next_index_entries
        new_index = {
            "version": INDEX_VERSION,
            "lang": lang,
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "episodes": next_index_entries,
        }

        local_index_path.write_text(
            json.dumps(new_index, ensure_ascii=False, indent=2, sort_keys=True),
            encoding="utf-8",
        )
        print(f"💾 Saved local index: {local_index_path}")

        if index_changed:
            print(f"📤 Uploading {index_key} to S3...")
            s3.put_object(
                Bucket=bucket_name,
                Key=index_key,
                Body=json.dumps(new_index, ensure_ascii=False, indent=2).encode("utf-8"),
                ContentType="application/json",
                CacheControl="max-age=60",
            )
            print(f"✅ Updated index uploaded: {index_key}")
        else:
            print(f"⏭️  Index unchanged: {index_key}")
        
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
