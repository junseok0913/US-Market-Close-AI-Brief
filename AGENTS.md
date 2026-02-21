# AGENTS.md (US-Market-Close-AI-Brief)

Keep this file brief and operational. Prefer commands and checks the agent can run.

## Scope

- Repo: US market close briefing pipeline (Python + LangGraph + Next.js).
- Primary runtime entrypoint: `run_daily.sh`.
- Goal: produce podcast/shorts artifacts, publish assets, keep web data in sync.

## Core Paths

- `run_daily.sh`: end-to-end daily automation (orchestrator -> TTS -> upload -> RSS -> cleanup).
- `orchestrator.py`: script generation pipeline.
- `shorts/` and `tts/`: audio generation.
- `podcast/`: generated artifacts and DB.
- `web/`: frontend + data build pipeline.

## Fast Start Commands

- Full daily run: `./run_daily.sh [YYYYMMDD] [TICKERS...] [--start-from N]`
- Example (full): `./run_daily.sh 20260214 NVDA AAPL`
- Example (resume at upload): `./run_daily.sh 20260214 --start-from 4`
- YouTube full pipeline: `./run_youtube.sh YYYYMMDD --lang ko|en [--start-from N] [--no-upload]`
- Orchestrator only: `uv run orchestrator.py YYYYMMDD [-t TICKER ...]`
- TTS only: `uv run python -m tts.src.tts YYYYMMDD --lang ko|en`
- Web checks: `cd web && npm run build:data && npm run lint`

## `run_daily.sh` Execution Map

- Step 1: Orchestrator (script/metadata/slides)
- Step 2: Korean TTS + shorts generation
- Step 3: English TTS
- Step 4: S3 upload (`podcast-daily-stock`)
- Step 5: RSS refresh (`AWS/scripts/update_podcast_feed.py`)
- Step 6: Cleanup (`podcast/{date}/*/tts`, wav files)

## Agentic Verification Loop

- For pipeline changes:
- Run at least one date with `--start-from 1` and verify outputs under `podcast/{date}/`.
- For upload/feed changes:
- Run `--start-from 4` and verify S3 + feed update logs.
- For YouTube render/upload changes:
- Run `./run_youtube.sh YYYYMMDD --lang ko --overwrite --no-upload` and verify both:
- `podcast/{date}/ko/youtube/{date}_ko_episode.mp4`
- `podcast/{date}/ko/shorts/youtube/{date}_ko_shorts.mp4`
- If upload is enabled, verify `videoId` and watch URL are printed for episode and shorts.
- For web/data changes:
- Run `cd web && npm run build:data && npm run lint`.
- Always report what was not run and why.

## Gotchas Codex Has Hit

- `run_daily.sh` uses `AWS_PROFILE=Nam` for most steps, but Step 4 unsets `AWS_PROFILE` and loads `.env` creds for S3 upload.
- `--start-from` skips earlier prerequisites; confirm needed artifacts already exist before resume.
- Do not edit `web/node_modules/` or generated files as a primary fix.
- Keep date input explicit (`YYYYMMDD`) in scripts and paths.
- `run_youtube.sh` runs a 5-step pipeline (episode render/upload, shorts prepare/render/upload) and supports `--start-from` resume.
- YouTube upload requires OAuth client secrets file (`YOUTUBE_CLIENT_SECRETS_FILE`) and token cache (`YOUTUBE_TOKEN_FILE`).

## Task-Specific Docs

- `README.md`: architecture overview.
- `ORCHESTRATOR.md`: pipeline internals and stages.
- `WEB.md`: web build/data behavior.
- `LAMBDA.md`: AWS news collection path.
- `PLANS.md`: template for multi-step or multi-hour implementation plans.

## Mistake Feedback Loop

- Single file: `feedback/AGENT_FEEDBACK.md`
- Log a mistake right after it happens:
- `python ~/.codex/skills/mistake-feedback-loop/scripts/feedback_loop.py --repo-root . log --title \"...\" --impact medium --tags \"path,validation\" --root-cause \"...\" --prevention \"...\"`
- Refresh periodic summary:
- `python ~/.codex/skills/mistake-feedback-loop/scripts/feedback_loop.py --repo-root . summarize`
- Weekly: review the summary's `Actionable Feedback Rules` and move stable rules into this file's `Gotchas Codex Has Hit` section.
