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

## 2026-03-06 - GitHub Actions run_daily Alignment

- [x] Inspect `run_daily.sh` flow and current `.github/workflows/daily_podcast.yml` mismatch.
- [x] Rebuild workflow to execute `run_daily.sh` with manual inputs (`date`, `tickers`, `start_from`) and weekday schedule.
- [x] Add and verify commit-on-failure behavior (pipeline step can fail, commit still runs, final status reflects failure).

## 2026-03-06 - Theme-Distinct Large-Cap Ticker Prototype

- [x] Inspect theme script payload shape and existing Gemini wrapper usage.
- [x] Convert the market prototype from pure price ranking into `abs(change) >= 2%` candidate filtering.
- [x] Add theme-context loading and a single Gemini picker prompt that selects one candidate not already covered in theme.
- [x] Run one live end-to-end validation with market data + Gemini selection.

## 2026-03-06 - Auto Ticker Integration

- [x] Refactor the market picker into a reusable helper callable from orchestrator.
- [x] Wire orchestrator to auto-pick one ticker when no manual ticker is provided.
- [x] Expose the auto-picker behavior/config through `run_daily.sh` and GitHub Actions.
- [x] Run static verification for Python, shell, workflow YAML, and run_daily contract.

## 2026-03-06 - GitHub Schedule Gate Fix

- [x] Diagnose why scheduled runs were skipping even after the intended 13:10 window.
- [x] Remove the gate entirely and simplify to a single 20:10 UTC weekday cron for post-2026-03-08 BC time.
- [x] Verify workflow YAML after the schedule simplification.

## 2026-03-06 - GitHub Commit Step Fix

- [x] Diagnose why workflow commit steps failed with `cannot pull with rebase: You have unstaged changes`.
- [x] Reorder commit steps to stage/commit generated files before rebase, and include `web/src/landing/index.ts`.
- [x] Reduce default `DEBATE_MAX_ROUNDS` from 4 to 3.
- [x] Re-run static GitHub Actions validation after the workflow fix.
