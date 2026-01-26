# AWS Integration

AWS S3 bucket configuration and RSS feed generation for podcast distribution.

## 📁 Structure

```
AWS/
├── README.md                      # This file
├── artwork.jpg                    # Podcast cover image
├── podcast.xml                    # RSS feed (auto-generated)
└── scripts/
    └── update_podcast_feed.py     # RSS generator script
```

## 🔄 Workflow

```
GitHub Actions → Generate Script → Generate Audio → Upload to S3 → Update RSS Feed
                                                                           ↓
                                                            update_podcast_feed.py
                                                                           ↓
                                                      1. Scan S3 for episodes
                                                      2. Generate RSS XML
                                                      3. Upload to S3
```

## S3 Bucket Structure

```
podcast-daily-stock/
├── 20260123/
│   ├── 20260123.mp3
│   └── metadata.json
├── 20260124/
│   ├── 20260124.mp3
│   └── metadata.json
├── artwork.jpg
└── podcast.xml
```

## 🔧 Required GitHub Secrets

| Variable | Example | Required |
|----------|---------|----------|
| `AWS_ACCESS_KEY_ID` | `AKIAI...` | ✅ Yes |
| `AWS_SECRET_ACCESS_KEY` | `wJalr...` | ✅ Yes |
| `AWS_REGION` | `us-east-2` | ✅ Yes |
| `BUCKET_NAME` | `podcast-daily-stock` | ✅ Yes |
| `CLOUDFRONT_DOMAIN` | `d123.cloudfront.net` | Optional |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E123...` | Optional |

## What `update_podcast_feed.py` Does

1. **Scans S3** for all episode folders (`YYYYMMDD` format)
2. **Reads metadata** from `metadata.json` files
3. **Gets file info** (size, duration) from `.mp3` files
4. **Generates RSS XML** with podcast standards
5. **Uploads** `podcast.xml` to S3 root

## 🚀 Usage

**Automatic (GitHub Actions):**
```yaml
- name: Update RSS Feed
  run: uv run python AWS/scripts/update_podcast_feed.py
```

**Manual (Local):**
```bash
uv run python AWS/scripts/update_podcast_feed.py
```

## � RSS Feed URL

**With CloudFront (faster):**
```
https://d1234abcd5678.cloudfront.net/podcast.xml
```

**Without CloudFront:**
```
https://podcast-daily-stock.s3.amazonaws.com/podcast.xml
```

## CloudFront Setup (Optional)

CloudFront = CDN for faster global delivery

1. AWS Console → CloudFront → Create Distribution
2. Origin: Your S3 bucket
3. Copy **Distribution Domain** and **Distribution ID**
4. Add to GitHub Secrets

---

**Last Updated**: 2026-01-25
