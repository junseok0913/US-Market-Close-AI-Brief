# English Version Implementation Plan

**Goal:** Add English language support to the US Market Close AI Brief podcast system using a translation pipeline approach.

**Strategy:** Translation Pipeline (KO → EN) instead of Native Localization
- Generate Korean script first (existing workflow)
- Translate the completed Korean script to English
- Generate English TTS and deploy to S3 under `en/` prefix

---

## 📐 Architecture Overview

### Current Structure
```
podcast/{date}/
  ├── script.json          (Korean)
  ├── script.wav           (Korean TTS)
  └── metadata.json

S3: s3://bucket/
  ├── rss.xml              (Korean RSS)
  └── {date}/
      ├── script.json
      └── script.wav
```

### Target Structure
```
podcast/{date}/
  ├── ko/
  │   ├── script.json      (Korean - Source of Truth)
  │   ├── script.wav       (Korean TTS)
  │   └── metadata.json
  └── en/
      ├── script.json      (English - Translated)
      ├── script.wav       (English TTS)
      └── metadata.json

S3: s3://bucket/
  ├── ko/
  │   ├── rss_ko.xml       (Korean RSS)
  │   └── {date}/...
  └── en/
      ├── rss_en.xml       (English RSS)
      └── {date}/...
```

---

## 🗺️ Implementation Roadmap

### Phase 1: Core Translation System
**Deliverable:** Working translation pipeline (KO script → EN script)

#### Step 1.1: Create Translation Script
**File:** `translate_script.py` (new)
**Location:** Root directory

**Requirements:**
- Load Korean `script.json`
- Translate each turn's `text` field to English using LLM
- Preserve all other fields (speaker, sources, id)
- Apply financial terminology glossary
  - "연준" → "the Fed"
  - "장마감" → "market close"
  - "매출" → "revenue"
- Output to `podcast/{date}/en/script.json`

**LLM Prompt Template:**
```
You are translating a U.S. stock market closing briefing podcast script from Korean to natural American English.

Context:
- This is a formal financial news podcast
- Target audience: English-speaking investors
- Maintain professional broadcast tone
- Use common financial terms (e.g., "the Fed" not "Federal Reserve Board")

Translate the following Korean text:
{korean_text}
```

**Testing:**
```bash
python orchestrator.py 20260123  # Generate Korean
python translate_script.py 20260123  # Translate to English
```

---

#### Step 1.2: Update Directory Structure
**Files to modify:**
- `orchestrator.py`
- `shared/config.py`

**Changes:**
1. Add language parameter to orchestrator CLI
2. Modify output paths to include `/ko/` or `/en/` subdirectories
3. Update `ensure_podcast_dir()` function to create language-specific folders

**New Functions in `shared/config.py`:**
```python
def get_podcast_script_path(date: str, lang: str = "ko") -> Path:
    """Returns: podcast/{date}/{lang}/script.json"""
    return ROOT / "podcast" / date / lang / "script.json"

def get_podcast_audio_path(date: str, lang: str = "ko") -> Path:
    """Returns: podcast/{date}/{lang}/script.wav"""
    return ROOT / "podcast" / date / lang / "script.wav"
```

---

### Phase 2: TTS Integration
**Deliverable:** English audio generation

#### Step 2.1: Update TTS Pipeline
**File:** `tts/generate_tts.py` (if exists) or orchestrator TTS section

**Changes:**
- Accept `--lang en` parameter
- Configure OpenAI TTS with English voice (e.g., `alloy`, `nova`)
- Save output to `podcast/{date}/en/script.wav`

**Voice Selection:**
- Korean: `alloy` (current)
- English: `nova` (professional American English female voice)

---

### Phase 3: RSS Feed & S3 Deployment
**Deliverable:** Separate RSS feeds for KO/EN with proper S3 structure

#### Step 3.1: Update RSS Generator
**File:** `AWS/scripts/update_podcast_feed.py`

**Changes:**
1. Add `--lang` CLI parameter
2. Generate `rss_{lang}.xml` instead of `rss.xml`
3. Update S3 upload paths to include `/{lang}/` prefix
4. Modify podcast metadata:
   - English title: "US Market Close AI Brief"
   - English description: "AI-powered daily briefing on US stock market closing trends."
   - Korean title: "미국 장마감 AI 브리핑"

**S3 Upload Structure:**
```python
# Korean
s3://bucket/ko/rss_ko.xml
s3://bucket/ko/{date}/script.json
s3://bucket/ko/{date}/script.wav

# English
s3://bucket/en/rss_en.xml
s3://bucket/en/{date}/script.json
s3://bucket/en/{date}/script.wav
```

---

#### Step 3.2: Update GitHub Actions Workflow
**File:** `.github/workflows/generate-podcast.yml`

**Changes:**
Add English generation step after Korean:
```yaml
- name: Generate Korean Podcast
  run: |
    python orchestrator.py ${{ env.DATE }} --lang ko
    python tts/generate_tts.py ${{ env.DATE }} --lang ko

- name: Translate to English
  run: |
    python translate_script.py ${{ env.DATE }}

- name: Generate English Podcast
  run: |
    python tts/generate_tts.py ${{ env.DATE }} --lang en

- name: Deploy Korean RSS
  run: |
    python AWS/scripts/update_podcast_feed.py --lang ko

- name: Deploy English RSS
  run: |
    python AWS/scripts/update_podcast_feed.py --lang en
```

---

### Phase 4: Testing & Quality Assurance

#### Test Checklist
- [ ] Korean generation still works unchanged
- [ ] Translation produces natural English
- [ ] Financial terms are correctly translated
- [ ] Legal compliance language preserved
- [ ] S3 folder structure is correct
- [ ] Both RSS feeds validate (Spotify RSS checker)
- [ ] Audio files play correctly
- [ ] CloudFront URLs work:
  - `https://xxx.cloudfront.net/ko/rss_ko.xml`
  - `https://xxx.cloudfront.net/en/rss_en.xml`

#### Translation Quality Metrics
1. **Terminology Accuracy**: Financial terms correctly translated
2. **Naturalness**: Sounds like native English broadcast
3. **Tone Consistency**: Professional yet accessible
4. **Legal Compliance**: No investment advice language in English either

---

### Phase 5: Documentation & Maintenance

#### Update Documentation
**Files to update:**
- `README.md`: Add English version instructions
- `LEGAL_COMPLIANCE.md`: Confirm English version follows same rules
- `.env.example`: Add English-specific environment variables if needed

#### New Documentation
- `TRANSLATION_GLOSSARY.md`: Financial term translation reference

---

## 🛠️ Development Order

**Recommended sequence:**
1. ✅ Create this plan document (DONE)
2. ⬜ Implement `translate_script.py` (Core translation logic)
3. ⬜ Test translation on one historical episode (20260123)
4. ⬜ Update `orchestrator.py` to support `--lang` parameter
5. ⬜ Modify directory structure and paths
6. ⬜ Update `update_podcast_feed.py` for bilingual RSS
7. ⬜ Test S3 upload manually
8. ⬜ Update GitHub Actions workflow
9. ⬜ End-to-end test (full automation)
10. ⬜ Submit English RSS to Spotify

---

## 💰 Cost Impact

**Storage (S3):**
- Current: ~500MB/month (Korean only)
- Projected: ~1GB/month (Korean + English)
- Cost: Still within Free Tier (5GB)

**TTS (OpenAI):**
- Current: ~$X/month
- Projected: 2X (double audio generation)

**Translation (LLM):**
- Text is cheap (~$0.01 per episode for GPT-4)
- Negligible cost increase

**Total:** Approximately 2X current costs, but still minimal for podcast scale.

---

## 🚀 Deployment Strategy

**Phase A: Manual Testing**
1. Generate one English episode manually
2. Upload to S3 manually
3. Validate RSS feed
4. Test on Spotify for Podcasters (private link)

**Phase B: Automation**
1. Enable GitHub Actions workflow
2. Monitor first automated run
3. Confirm both languages deploy correctly

**Phase C: Public Release**
1. Submit English RSS to Spotify
2. Announce English version availability
3. Monitor listener analytics

---

## ⚠️ Risk Mitigation

**Risk 1: Translation Quality Issues**
- **Mitigation:** Review first 5 episodes manually before automation
- **Fallback:** Add human review step in workflow

**Risk 2: Legal Compliance in English**
- **Mitigation:** Translation prompt explicitly preserves informational tone
- **Fallback:** Add post-translation compliance filter

**Risk 3: S3 Path Confusion**
- **Mitigation:** Careful testing of folder structure before full deployment
- **Fallback:** Keep Korean files in root as backup during transition

---

## 📊 Success Metrics

1. **Technical:**
   - [ ] Both RSS feeds validate without errors
   - [ ] Audio quality matches Korean version
   - [ ] Translation accuracy >95% (spot check)

2. **User Experience:**
   - [ ] English listeners rate podcast 4+ stars
   - [ ] No confusion about investment advice (legal safety)

3. **Operational:**
   - [ ] Fully automated pipeline (no manual steps)
   - [ ] Build time <30 minutes for both languages

---

**Status:** 📝 Planning Complete
**Next Action:** Implement Step 1.1 (Create `translate_script.py`)

---

**Last Updated:** 2026-01-26
**Owner:** Development Team
