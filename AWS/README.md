# AWS Integration

AWS S3 bucket configuration and RSS feed generation for **bilingual podcast** distribution (Korean + English).

## 📁 Structure

```
AWS/
├── README.md                      # This file
├── artwork.jpg                    # Podcast cover (Korean)
├── artwork_en.jpg                 # Podcast cover (English, 1400x1400)
├── podcast.xml                    # RSS feed (Korean)
├── podcast_en.xml                 # RSS feed (English)
├── scripts/
│   └── update_podcast_feed.py     # Bilingual RSS generator
└── translation/
    ├── translate_metadata.py      # Metadata translator (KO→EN)
    └── prompt/
        └── metadata_translation.yaml
```

## 🔄 Workflow

```
GitHub Actions → Generate Script (KO) → Translate (EN) → TTS (KO) → TTS (EN) 
                                                              ↓
                                            Upload to S3 (ko/*, en/*)
                                                              ↓
                                          Update RSS Feed (podcast.xml, podcast_en.xml)
```

## S3 Bucket Structure (Bilingual)

```
podcast-daily-stock/
├── 20260123/
│   ├── ko/
│   │   ├── 20260123.mp3
│   │   └── metadata.json
│   └── en/
│       ├── 20260123.mp3
│       └── metadata.json
├── artwork.jpg         # Korean cover
├── artwork_en.jpg      # English cover (1400x1400 for Spotify)
├── podcast.xml         # Korean RSS
└── podcast_en.xml      # English RSS
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
2. **Reads metadata** from language-specific `metadata.json` (ko/ or en/)
3. **Gets file info** (size, duration) from `.mp3` files
4. **Generates RSS XML** for each language
5. **Uploads** `podcast.xml` and `podcast_en.xml` to S3 root

**Usage:**
```bash
# Korean RSS
uv run python AWS/scripts/update_podcast_feed.py --lang ko

# English RSS
uv run python AWS/scripts/update_podcast_feed.py --lang en
```

## 📻 RSS Feed URLs

**Korean:**
```
https://d3kwqqx9p3861y.cloudfront.net/podcast.xml
```

**English:**
```
https://d3kwqqx9p3861y.cloudfront.net/podcast_en.xml
```

## CloudFront Setup (Optional)

CloudFront = CDN for faster global delivery

1. AWS Console → CloudFront → Create Distribution
2. Origin: Your S3 bucket
3. Copy **Distribution Domain** and **Distribution ID**
4. Add to GitHub Secrets

---

## 🆕 Recent Updates (2026-01-26)

- ✅ **Bilingual Support**: Added English podcast generation (TTS, metadata, RSS)
- ✅ **Separate Artwork**: `artwork_en.jpg` (1400x1400 for Spotify compliance)
- ✅ **Dual RSS Feeds**: `podcast.xml` (Korean), `podcast_en.xml` (English)
- ✅ **Translation Workflow**: Automated KO→EN metadata translation
- ✅ **Local Preview**: RSS files saved locally before S3 upload

**Last Updated**: 2026-01-26

