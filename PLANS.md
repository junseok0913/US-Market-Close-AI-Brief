# PLANS.md

Use this for long or risky tasks. Keep it a living document.

## When to create a plan

- Multi-step refactors across multiple folders
- Data/model/schema changes with migration risk
- Tasks expected to take more than one focused session

## Plan Template

## 1) Objective

- What will change and why?
- What will not change?

## 2) Constraints

- Runtime, API, compatibility, and deployment constraints
- Rollback requirements

## 3) Affected Areas

- Files/modules/services touched
- External systems impacted (S3, RSS, web build, DB)

## 4) Execution Steps

- Step 1:
- Step 2:
- Step 3:

## 5) Verification

- Exact commands to run
- Expected artifacts/logs
- Failure signals and how to detect them

## 6) Progress Log

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## 7) Decisions and Gotchas

- Decision:
- Rationale:
- Follow-up:

---

## KO Display Date Offset (+1 Day) Without Path Changes (In Progress 2026-02-23)

## 1) Objective

- Keep all storage/output paths on market date (`podcast/{date}/...`) unchanged.
- Shift KO-facing display date fields to `market_date + 1 day` across podcast + shorts + shorts-firm payloads.
- Prevent EN script date from inheriting KO shifted date.

## 2) Constraints

- Do not rename/move folders by display date.
- Preserve existing render/upload contracts and file names.
- Apply root-cause fixes at date-origin points instead of ad-hoc output edits.

## 3) Affected Areas

- `shared/date_display.py` (new helper)
- `orchestrator.py`
- `AWS/translation/translate.py`
- `web/scripts/generate-podcast-metadata.py`
- `web/scripts/slide_generator.py`
- `shorts/generate_shorts_slides.py`
- `shorts/generate_shorts_tsx.py`
- `shorts-firm/generate_slide_script.py`
- `shorts-firm/generate_tsx.py`
- `shared/ops/scripts/youtube/upload_youtube_video.py`

## 4) Execution Steps

- Step 1: Add shared display-date helper and wire KO script date origin.
- Step 2: Propagate display date into KO-facing metadata/slides payload generators.
- Step 3: Ensure fallback TSX/upload metadata paths keep market-date filenames while preserving display date fields.
- Step 4: Run focused verification and summarize remaining gaps.

## 5) Progress Log

- [x] Step 1
- [x] Step 2
- [x] Step 3
- [x] Step 4
- Verification note (2026-02-23):
  - `uv run python -m py_compile ...` passed for all touched Python files.
  - Fallback TSX checks confirmed payload `date` follows script display date while `audioFile` keeps market-date filename:
    - `python shorts/generate_shorts_tsx.py ...` -> `date=20260224`, `audioFile=shorts20260223.mp3`
    - `python shorts-firm/generate_tsx.py ...` -> `date=20260224`, `audioFile=shorts20260223.mp3`
  - `uv run python shorts-firm/generate_slide_script.py ... --no-llm` sample run confirmed render payload keeps
    `date=20260224` with `audioFile=shorts20260223.mp3`.
  - Follow-up fix (2026-02-23): opening/theme/closing agent prompt date placeholders now use KO display date (+1 day),
    and metadata prompt includes explicit rule to keep narration date aligned to `{date}`.
  - Artifact backfill (2026-02-23): `podcast/20260223/ko/script.json`, `podcast/20260223/ko/metadata.json`,
    `podcast/20260223/ko/metadata.txt` literal `2월 23일` strings were updated to `2월 24일`.
  - Follow-up fix (2026-02-23): episode YouTube thumbnail flow is unified to thumbnail-route capture
    (`/youtube/thumbnail/{date}`) in `run_youtube.sh` (no first-frame fallback), and
    `generate_episode_thumbnail.sh` now starts Next.js with `--webpack` to avoid Turbopack instability.
  - Follow-up fix (2026-02-23): `run_youtube.sh --overwrite` now deletes existing episode thumbnail PNG too,
    so stale thumbnails are not reused after route/date logic changes.

---

## Shorts-Firm Shorts2 Render Integration (In Progress 2026-02-22)

## 1) Objective

- Reuse `shorty-script-studio` `shorts2` visual design in shorts-firm rendering.
- Keep existing `shorts/` pipeline unchanged.
- Use Gemini-generated slide copy (not hardcoded fallback text) for shorts-firm slide payload.
- Preserve shorts-firm 59-second compression contract during render.

## 2) Constraints

- Font family, sizing, colors, and animation timing should match shorts2 source components.
- Slide transition timing must follow TTS timing as naturally as possible.
- Shorts-firm remains independent from existing shorts path.

## 3) Affected Areas

- `shorts-firm/prompt/shorts_firm_pipeline.yaml`
- `shorts-firm/generate_slide_script.py`
- `shorts-firm/render_shorts_remotion.mjs`
- `web/remotion/Root.tsx`
- `web/remotion/ShortsFirmComposition.tsx` (new)

## 4) Execution Steps

- Step 1: Port shorts2 design into a dedicated Remotion composition for shorts-firm.
- Step 2: Add Gemini-driven slides generation in shorts-firm slide builder using unified YAML.
- Step 3: Improve section timing split logic (hook/company/closing) from company-based TTS timings.
- Step 4: Wire shorts-firm render command to the new composition.
- Step 5: Run syntax/build checks and perform an end-to-end shorts-firm render run.

## 5) Progress Log

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
- [ ] Step 4
- [ ] Step 5

---

## Shorts-Firm Independent Pipeline (In Progress 2026-02-22)

## 1) Objective

- Build a fully independent shorts pipeline under `shorts-firm/`.
- Keep existing `shorts/` behavior untouched.
- Produce the same artifact shape/path pattern under `podcast/{date}/{lang}/shorts-firm/`.

## 2) Constraints

- One YAML file should manage all prompt configs for this new pipeline.
- Script/TTS/slide-input generation should run independently before any integration.
- Do not modify `run_daily.sh` or `run_youtube.sh` yet.

## 3) Affected Areas

- `shorts-firm/prompt/shorts_firm_pipeline.yaml` (new)
- `shorts-firm/generate_script.py` (new)
- `shorts-firm/generate_audio.py` (new)
- `shorts-firm/generate_slide_script.py` (new)
- `shorts-firm/generate_tsx.py` (new)
- `shorts-firm/render_shorts_remotion.mjs` (new)
- `shorts-firm/run_shorts_firm.sh` (new)

## 4) Execution Steps

- Step 1: Create unified YAML prompt/config for script + TTS + slide template settings.
- Step 2: Implement independent script generator with company context inputs.
- Step 3: Implement independent section-based TTS generator.
- Step 4: Implement slide input/template placeholder generator.
- Step 5: Implement independent render/upload shell pipeline.
- Step 6: Run syntax/contract checks and report runnable commands.

## 5) Progress Log

- [x] Step 1
- [x] Step 2
- [x] Step 3
- [x] Step 4
- [x] Step 5
- [x] Step 6
- Verification note: `shorts-firm/run_shorts_firm.sh 20260220 --lang ko --start-from 3 --no-upload --preview-seconds 3 --overwrite`
  completed Step 3 (slide script/template + TSX), then failed at Step 4 in this sandbox with browser launch `SIGABRT` (Remotion Chromium/Chrome start restriction).
  This is environment-specific; script wiring and artifact paths were validated.
- Follow-up (2026-02-22): `shorts-firm/generate_slide_script.py` timing merge now enforces
  `hook=0~3s`, `closing=last 3s`, and clamps company slide windows to the remaining range while
  preserving company TTS timing boundaries for natural mid-section transitions.
- Follow-up (2026-02-22): `shorts-firm` script normalization now forces
  `closing=CTA only` (`구독과 좋아요 부탁드립니다.` / `Please like and subscribe.`),
  with title prefix separation for shorts-firm branding.
- Follow-up (2026-02-22): slides prompt was split into a dedicated file
  `shorts-firm/prompt/shorts_firm_slides.yaml` with detailed shorts2 hardcoded-style guidance
  (hook/company/closing copy rules, label patterns, and strict closing constraints).
- Follow-up (2026-02-22): `shorts-firm/run_shorts_firm.sh` now uses separate configs:
  `--prompt-config` (script/TTS) and `--slides-prompt-config` (slides).
- Follow-up (2026-02-22): post-render 59s speed-up now applies CFR output (`fps=30`) and
  audio resync (`aresample=async=1:first_pts=0`) in both `shorts-firm/run_shorts_firm.sh`
  and `run_youtube.sh` to reduce short stutter artifacts during forced speed-up.
- Follow-up (2026-02-22): `shorts-firm/generate_audio.py` switched from 4-section TTS to company-count TTS
  (one TTS call per company segment). Hook/closing CTA are included in narration but are not split criteria.
- Follow-up (2026-02-22): `shorts-firm` script/prompt/slide-template normalization was tightened to
  `hook -> company_1..N -> closing` only (no `data/story`), with per-company reason + metrics output
  (`1D/1M`, `market_cap`, `PER`, `spoken_text`, `slide_points`, `valuation_note`, `move_summary`).
- Follow-up (2026-02-22): `shorts-firm` metrics were expanded with `PBR` and `ROE` in
  prompt schema + company context + normalized `metadata.company_moves`.
- Follow-up (2026-02-22): restored `shorts-firm/prompt/shorts_firm_pipeline.yaml`
  `title_prefix` baseline and enforced hook headline=`script.title` in
  `shorts-firm/prompt/shorts_firm_slides.yaml` + `shorts-firm/generate_slide_script.py`;
  rerender verified with `run_shorts_firm.sh` output.
- Follow-up (2026-02-22): integrated `shorts-firm` into both orchestration entrypoints:
  `run_daily.sh` now generates shorts-firm script/audio/slides/tsx(+S3 mp3 upload),
  and `run_youtube.sh` now prepares/renders/uploads both `shorts` and `shorts-firm`
  in the same 5-step flow with Remotion concurrency forced to `1`.

---

## Shorts 4-Section Timing Sync (In Progress 2026-02-21)

## 1) Objective

- Make shorts pipeline section-aware with 4 fixed parts: `hook`, `data`, `story`, `closing`.
- Generate TTS per section (4 calls), merge audio, and persist section timing metadata.
- Generate slides from Gemini with section context and exact section start/end timing.

## 2) Constraints

- Keep existing daily/run_youtube entrypoints and file locations.
- Preserve backwards compatibility for old shorts script payloads that only have `script`.
- Keep JSON contracts machine-safe for downstream web render and ffmpeg timeline capture.

## 3) Affected Areas

- `shorts/prompt/shorts_script.yaml`
- `shorts/generate_shorts.py`
- `shorts/generate_shorts_audio.py`
- `shorts/prompt/shorts_slides.yaml`
- `shorts/generate_shorts_slides.py`
- `run_daily.sh`
- `run_youtube.sh`

## 4) Execution Steps

- Step 1: Update shorts script prompt/schema and normalizer to guarantee 4 sections.
- Step 2: Update shorts audio generator for 4-call section TTS + `sections.timing.json`.
- Step 3: Update slides prompt/generator to use section context and section timing.
- Step 4: Wire orchestration scripts to pass timing metadata in normal runs.
- Step 5: Run focused verification on one date and inspect generated artifacts.

## 5) Progress Log

- [x] Step 1
- [x] Step 2
- [x] Step 3
- [x] Follow-up: removed section-level text-length forcing from slide generation and prompt.
- [x] Follow-up: aligned Remotion font loading to shorty-style CSS import (`web/remotion/shorty-fonts.css`).
- [x] Follow-up: switched data bar height generation to `Math.random()`-based values (section-key cached).
- [x] Follow-up: story layout parity fix (4 key-points) + phase-specific copy-length clamps in slides generator.
- [x] Follow-up: Remotion 6s preview render re-validated after parity fix (`20260220_ko_preview_6s.mp4`).
- [x] Step 4
- Follow-up fix: Removed legacy shorts overlay UI (time/caption) and unified Remotion render to reuse `YouTubeShortsPlayer` so design no longer diverges by render engine.
- Follow-up fix 2: Replaced Remotion composition with a dedicated, global-CSS-independent shorts renderer (inline styles + section animations) to avoid black frames and keep shorts styling isolated.
- Verification note: `run_youtube.sh ... --render-engine remotion` reaches Remotion bundle stage, but this environment currently fails at browser attach with `TimeoutError ... connect to the browser (25s)`.
- Follow-up fix: added `--remotion-timeout-ms` / `YOUTUBE_REMOTION_TIMEOUT_MS` wiring and pass-through to Remotion `--timeout`; frame rendering now proceeds past frame 1.
- [x] Step 5

---

## Shorts UI Migration From `shorty-script-studio` (In Progress 2026-02-21)

## 1) Objective

- Migrate the 4-part shorts visual structure from `shorty-script-studio` into `web/src/components/YouTubeShortsPlayer.tsx`.
- Keep pipeline contract as 4-part timing (`hook`, `data`, `story`, `closing`) and render in strict 9:16.
- Ensure Gemini slide copy generation remains aligned to the 4-part UI.

## 2) Constraints

- Preserve existing shorts capture/render contract (`data-testid`, slide index, render mode metadata).
- Remove click-first playback overlay from the rendered shorts UI.
- Do not depend on existing `slides.json`; continue to use generated `slides.render.json`.

## 3) Affected Areas

- `web/src/components/YouTubeShortsPlayer.tsx`
- `shorts/prompt/shorts_slides.yaml`

## 4) Execution Steps

- Step 1: Port 4-part design layout into the shorts player.
- Step 2: Keep timing/slide switching/audio logic intact while removing interactive overlay UI.
- Step 3: Tighten Gemini prompt guidance to produce copy optimized for each of 4 sections.
- Step 4: Run syntax/type checks and validate render contracts.

## 5) Progress Log

- [x] Step 1
- [x] Step 2
- [x] Step 3
- [x] Step 4

---

## Remotion Shorts Render Engine (In Progress 2026-02-21)

## 1) Objective

- Add a production-grade Remotion rendering path for YouTube shorts.
- Keep existing browser-based `timeline/realtime` capture path intact.
- Expose simple CLI usage so user can render shorts MP4 directly.

## 2) Constraints

- Do not break existing `run_youtube.sh` behavior by default.
- Support `--shorts` flow first for Remotion.
- Generate a thumbnail without relying on live Next.js capture when using Remotion.

## 3) Affected Areas

- `run_youtube.sh`
- `web/scripts/render_shorts_remotion.mjs`
- `web/remotion/index.ts`
- `web/remotion/Root.tsx`
- `web/remotion/ShortsComposition.tsx`

## 4) Execution Steps

- Step 1: Add Remotion composition entry and shorts composition component.
- Step 2: Add Node wrapper script to call `npx remotion render`.
- Step 3: Wire `run_youtube.sh --render-engine remotion`.
- Step 4: Validate shell/script syntax and document run commands.

## 5) Progress Log

- [x] Step 1
- [x] Step 2
- [x] Step 3
- [x] Step 4

---

## Shorts Pixel-Parity Alignment (In Progress 2026-02-21)

## 1) Objective

- Match `shorty-script-studio` shorts visuals as closely as possible for Remotion output.
- Keep only text/content dynamic from generated shorts data.
- Remove visual drift in spacing, animation delays, decorative effects, and section composition.

## 2) Constraints

- Do not reintroduce old overlay UI (progress/script captions).
- Keep Remotion renderer isolated from app global CSS.
- Preserve existing shorts data contract and timing-driven section selection.

## 3) Affected Areas

- `web/src/components/YouTubeShortsPlayer.tsx`
- `web/remotion/ShortsComposition.tsx`

## 4) Execution Steps

- Step 1: Port section layouts 1:1 from `shorty-script-studio` with matching geometry.
- Step 2: Port motion timing/effects (pulse, decorative lines, bar growth sequence).
- Step 3: Validate Remotion preview render for non-black output and visual parity.

## 5) Progress Log

- [x] Step 1
- [x] Step 2
- [x] Step 3
- [x] Follow-up: synced browser player + Remotion to the same shorty-style data section structure (including bottom 2 metric cards).
- [x] Follow-up: switched browser sparkline bars to section/slide-scoped `Math.random()` generation for shorty-style visual behavior.
- [x] Follow-up: expanded story key-point rendering to 4 items and aligned fallback copy defaults to shorty-style wording while keeping Gemini text binding.
- [x] Follow-up: replaced remaining browser shorts color tokens with shorty-original HSL values and fixed root font family to `Noto Sans KR`.
- [x] Follow-up: aligned story key-point sourcing order to shorty-style (`meta.keyPoints` first, then slide fallback) for browser + Remotion parity.
- [x] Follow-up: changed browser data-bar generation back to shorty-original per-render `Math.random()` behavior for visual parity.
- [x] Follow-up: added UI-safe display-length clamps (hook/data/story/closing text fields) to prevent dynamic Gemini copy from breaking shorty spacing.
- [x] Follow-up: added Tailwind v4 semantic color tokens (`background/foreground/primary/...`) in `web/src/app/globals.css` while preserving existing light-theme app tokens.
- [x] Follow-up: replaced shorts browser UI arbitrary HSL classes with semantic utility classes (`text-foreground`, `bg-primary/15`, `border-border`, etc.) for token-consistent rendering.
- [x] Follow-up: set browser `realtime` shorts capture to 1080x1920 (9:16) by wiring `--width/--height` into `record_episode_video.mjs` and `run_youtube.sh`.

---

## YouTube Timeline Path Removal (Completed 2026-02-21)

## 1) Objective

- Remove unused `browser+timeline` render path from `run_youtube.sh`.
- Delete files used only by that path and ensure no runtime references remain.

## 2) Affected Areas

- `run_youtube.sh`
- `web/scripts/render_episode_slides.mjs` (delete)
- `web/scripts/render_shorts_slides.mjs` (delete)

## 3) Progress Log

- [x] Remove `--render-mode timeline/realtime` branching and keep browser path as realtime-only.
- [x] Remove timeline artifact variables/cleanup (`frames`, `concat`, `timeline meta`) from shell pipeline.
- [x] Delete timeline-only renderer scripts.
- [x] Verify shell syntax and non-markdown runtime references are clean.

---

## YouTube Fixed Sync Values (Completed 2026-02-21)

## 1) Objective

- Simplify `run_youtube.sh` CLI by removing low-frequency sync knobs.
- Pin proven sync values directly in script defaults.

## 2) Affected Areas

- `run_youtube.sh`

## 3) Progress Log

- [x] Reviewed git history for `--turn-lead-ms`, `--start-delay-seconds`, `--trim-start-seconds`.
- [x] Removed the three CLI options from usage/argument parsing/validation.
- [x] Pinned fixed values in script (`TURN_LEAD_MS=550`, `START_DELAY_SECONDS=1`, `TRIM_START_SECONDS=1`).

---

## YouTube Thumbnail Reuse-Only (Completed 2026-02-21)

## 1) Objective

- Remove duplicate thumbnail generation in `run_youtube.sh`.
- Reuse thumbnail generated by `run_daily.sh` and keep YouTube upload optional without thumbnail.

## 2) Affected Areas

- `run_youtube.sh`

## 3) Progress Log

- [x] Removed thumbnail capture options/validation (`--thumbnail-slide`, `--thumbnail-width`, `--thumbnail-height`).
- [x] Removed in-script thumbnail generation/capture branches.
- [x] Changed upload flow to pass `--thumbnail` only when PNG already exists.

---

## YouTube End-to-End Resume Pipeline (Completed 2026-02-21)

## 1) Objective

- Make `run_youtube.sh` run episode + shorts end-to-end in one command.
- Default to public upload and provide step-resume via `--start-from`.
- Keep logs explicit so failure location is obvious.

## 2) Affected Areas

- `run_youtube.sh`
- `AGENTS.md`

## 3) Progress Log

- [x] Reworked `run_youtube.sh` into 5 ordered steps: episode render/upload -> shorts prepare/render/upload.
- [x] Added `--start-from 1..5` resume semantics aligned with `run_daily.sh` usage style.
- [x] Set default upload behavior to enabled with privacy default `public`.
- [x] Added shorts thumbnail generation from the rendered MP4 first frame and included it in upload.
- [x] Updated repo-local command docs in `AGENTS.md` for the new `run_youtube.sh` contract.

---

## YouTube Episode/Shorts Data Integrity Fixes (In Progress 2026-02-24)

## 1) Objective

- Restore episode slide rendering when KO display date is shifted (+1 day) by using storage date for slide lookup.
- Fix shorts index sign/ticker mapping so DOW/S&P/NASDAQ values are not swapped or polarity-flipped.
- Render negative trend charts as down-sloping (red + down) for shorts and shorts-firm.
- Enforce shorts-firm metrics (1D/1M/시총/PER/PBR/ROE) to use yfinance-backed company context only.

## 2) Affected Areas

- `web/src/app/youtube/episode/[date]/page.tsx`
- `web/src/components/YouTubeEpisodePlayer.tsx`
- `web/src/components/YouTubeShortsPlayer.tsx`
- `web/remotion/ShortsComposition.tsx`
- `web/remotion/ShortsFirmComposition.tsx`
- `shorts-firm/generate_script.py`
- `shorts-firm/prompt/shorts_firm_pipeline.yaml`

## 3) Progress Log

- [x] Episode page now passes storage date to player for slide map lookup.
- [x] Shorts index parsing changed from positional parse to index-label parse with sign-context inference.
- [x] Shorts + shorts-firm chart paths now switch to downtrend variants for negative moves.
- [x] Shorts-firm metric normalization now ignores LLM numeric metrics and uses `company_context` values only.
- [ ] Run focused verification and one render pass (`run_youtube.sh --start-from 1/4`) in local runtime.
