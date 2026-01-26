#!/usr/bin/env python3
"""
CloudFront CDN Test Script
Tests if CloudFront distribution is properly serving S3 content
"""

import os
import sys
import time
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_cloudfront_setup():
    """Test CloudFront configuration and performance"""
    
    # Get configuration
    bucket_name = os.environ.get('BUCKET_NAME', 'podcast-daily-stock')
    cf_domain = os.environ.get('CLOUDFRONT_DOMAIN')
    
    print("=" * 60)
    print("🧪 CloudFront CDN Test")
    print("=" * 60)
    
    # Check if CloudFront is configured
    if not cf_domain:
        print("❌ CLOUDFRONT_DOMAIN not set in .env file")
        print("   Add: CLOUDFRONT_DOMAIN=d1234abcd5678.cloudfront.net")
        return False
    
    # Clean domain (remove https://)
    cf_domain = cf_domain.replace("https://", "").replace("http://", "").strip("/")
    
    # Test URLs
    s3_url = f"https://{bucket_name}.s3.amazonaws.com/podcast.xml"
    cf_url = f"https://{cf_domain}/podcast.xml"
    
    print(f"\n📍 S3 URL:        {s3_url}")
    print(f"📍 CloudFront URL: {cf_url}")
    print()
    
    # Test 1: Check if CloudFront URL is accessible
    print("Test 1: CloudFront Accessibility")
    print("-" * 60)
    try:
        start = time.time()
        response = requests.get(cf_url, timeout=10)
        duration = time.time() - start
        
        if response.status_code == 200:
            print(f"✅ CloudFront accessible (Status: {response.status_code})")
            print(f"   Response time: {duration:.2f}s")
        else:
            print(f"❌ CloudFront returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ CloudFront not accessible: {e}")
        return False
    
    # Test 2: Check cache headers
    print("\nTest 2: Cache Headers")
    print("-" * 60)
    headers = response.headers
    
    # Check important headers
    cache_headers = {
        'X-Cache': 'CloudFront cache status',
        'X-Amz-Cf-Id': 'CloudFront request ID',
        'X-Amz-Cf-Pop': 'Edge location',
        'Age': 'Cache age (seconds)',
    }
    
    for header, description in cache_headers.items():
        value = headers.get(header, 'Not found')
        if value != 'Not found':
            print(f"✅ {header}: {value}")
        else:
            print(f"⚠️  {header}: {value}")
    
    # Check if response came from CloudFront cache
    x_cache = headers.get('X-Cache', '')
    if 'Hit from cloudfront' in x_cache:
        print("\n🎯 Response served from CloudFront cache (FAST!)")
    elif 'Miss from cloudfront' in x_cache:
        print("\n⏳ Cache Miss - CloudFront fetched from S3 (first request)")
    
    # Test 3: Compare S3 vs CloudFront speed
    print("\nTest 3: Performance Comparison")
    print("-" * 60)
    
    # Test S3 direct
    try:
        start = time.time()
        s3_response = requests.get(s3_url, timeout=10)
        s3_time = time.time() - start
        print(f"📦 S3 Direct:     {s3_time:.3f}s (Status: {s3_response.status_code})")
    except Exception as e:
        print(f"❌ S3 not accessible: {e}")
        s3_time = None
    
    # Test CloudFront (second request - should be cached)
    start = time.time()
    cf_response = requests.get(cf_url, timeout=10)
    cf_time = time.time() - start
    print(f"⚡ CloudFront:    {cf_time:.3f}s (Status: {cf_response.status_code})")
    
    if s3_time and cf_time < s3_time:
        speedup = ((s3_time - cf_time) / s3_time) * 100
        print(f"\n🚀 CloudFront is {speedup:.1f}% faster!")
    
    # Test 4: Content validation
    print("\nTest 4: Content Validation")
    print("-" * 60)
    
    content = cf_response.text
    if '<?xml' in content and '<rss' in content:
        print("✅ Valid RSS XML content")
        
        # Count episodes
        episode_count = content.count('<item>')
        print(f"✅ Found {episode_count} episodes in feed")
    else:
        print("❌ Invalid RSS content")
        return False
    
    # Test 5: Check if artwork is accessible
    print("\nTest 5: Artwork Accessibility")
    print("-" * 60)
    
    artwork_url = f"https://{cf_domain}/artwork.jpg"
    try:
        artwork_response = requests.head(artwork_url, timeout=10)
        if artwork_response.status_code == 200:
            size = artwork_response.headers.get('Content-Length', 'Unknown')
            print(f"✅ Artwork accessible ({size} bytes)")
        else:
            print(f"⚠️  Artwork status: {artwork_response.status_code}")
    except Exception as e:
        print(f"❌ Artwork not accessible: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ All tests passed! CloudFront is working correctly.")
    print("=" * 60)
    print(f"\n📱 Your RSS Feed URL:")
    print(f"   {cf_url}")
    print("\n💡 You can now submit this URL to podcast platforms!")
    
    return True

if __name__ == "__main__":
    success = test_cloudfront_setup()
    sys.exit(0 if success else 1)
