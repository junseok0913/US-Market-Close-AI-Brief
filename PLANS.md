# Plan

## 2026-03-05 - run_daily.sh TTS Round Retry

- [x] Inspect `run_daily.sh` step 2/3 execution flow and failure behavior.
- [x] Add retry helper for step rounds with max-attempt and delay controls.
- [x] Apply retry to step 2 (KO TTS + shorts chain) and step 3 (EN TTS).
- [x] Verify shell syntax and summarize usage.

## 2026-03-05 - run_youtube.sh Step1 Retry

- [x] Inspect `run_youtube.sh` step1 episode render flow and failure behavior.
- [x] Add step1-only retry wrapper (max 3 attempts by default).
- [x] Ensure failed attempts cleanup web process state before retry.
- [x] Verify shell syntax and summarize usage.

## 2026-03-05 - RSS Index Incremental Sync

- [x] Inspect `AWS/scripts/update_podcast_feed.py` bottlenecks and current S3 read pattern.
- [x] Add local+S3 index JSON (`rss_index_{lang}.json`) load/merge/sync flow.
- [x] Update only changed episodes using ETag/LastModified fingerprints; reuse cached entries for unchanged episodes.
- [x] Persist index locally and upload updated index to S3.
- [x] Verify script syntax and summarize operational behavior.

## 2026-03-06 - Shorts-Firm Upload Title Date (KST)

- [x] Inspect shorts-firm upload title override path.
- [x] Switch title date source to `resolve_display_date(..., lang)` before dotted formatting.
- [x] Verify script syntax.
