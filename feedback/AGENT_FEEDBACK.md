# Agent Feedback Log

Single-file incident log + periodic summary for Codex mistakes.

<!-- AUTO-SUMMARY:START -->
## Periodic Summary

Generated: 2026-03-19 07:41:52Z (UTC)

### Incident Counts
- Total: 8
- Last 7 days: 6
- Last 30 days: 7

### Impact Distribution
- `medium`: 8

### Top Tags
- `shorts-theme-firm`: 5
- `remotion`: 3
- `nextjs`: 1
- `static-export`: 1
- `youtube-render`: 1
- `github-actions`: 1
- `ci`: 1
- `dependencies`: 1

### Actionable Feedback Rules
- `For static-export apps, keep route static and parse render query params in client components (window.location.search) instead of dynamic server searchParams.`: 1
- `In GitHub Actions, prefer command-existence checks with fallback installers or official setup actions over assuming apt package names are present on the hosted runner image.`: 1
- `Before editing a supposedly isolated pipeline, trace the render entrypoint and composition ID to confirm whether the renderer is actually separate from existing pipelines.`: 1
- `When values are subjective or model-derived, show qualitative categories by default and use numeric scores only to drive bars or relative visual fills.`: 1
- `For reusable shorts pipelines, generate per-scene summary copy with strict length limits and never bind raw narration directly into main slide UI.`: 1
<!-- AUTO-SUMMARY:END -->

## Incident Log

<!-- Append entries using feedback_loop.py log -->

### 2026-02-16 | Do not use dynamic route mode in Next static export
- Impact: medium
- Tags: nextjs, static-export, youtube-render
- Root Cause: Attempted to read searchParams on /youtube/episode/[date] and set force-dynamic, which conflicts with next.config output=export.
- Prevention Rule: For static-export apps, keep route static and parse render query params in client components (window.location.search) instead of dynamic server searchParams.
- Evidence: next-dev.log showed NEXT_STATIC_GEN_BAILOUT and route 500 until page reverted.

### 2026-03-07 | Assumed awscli apt package existed on GitHub Ubuntu runner
- Impact: medium
- Tags: github-actions, ci, dependencies
- Root Cause: Assumed awscli could be installed via apt on ubuntu-latest without checking the actual package availability on the runner image.
- Prevention Rule: In GitHub Actions, prefer command-existence checks with fallback installers or official setup actions over assuming apt package names are present on the hosted runner image.
- Evidence:

### 2026-03-14 | Modified shared ShortsFirmComposition while intending theme-firm isolation
- Impact: medium
- Tags: shorts-theme-firm, remotion, architecture
- Root Cause: I inferred that separate pipeline folders implied renderer isolation, but both render scripts still target the shared ShortsFirmComposition ID in Remotion.
- Prevention Rule: Before editing a supposedly isolated pipeline, trace the render entrypoint and composition ID to confirm whether the renderer is actually separate from existing pipelines.
- Evidence:

### 2026-03-18 | Displayed subjective debate scores as exact facts
- Impact: medium
- Tags: shorts-theme-firm, data-viz, trust
- Root Cause: I treated model-derived finance debate scores as display-ready metrics instead of separating qualitative labels from quantitative visual drivers.
- Prevention Rule: When values are subjective or model-derived, show qualitative categories by default and use numeric scores only to drive bars or relative visual fills.
- Evidence: 

e:

### 2026-03-18 | Bound raw narration into reusable shorts layout
- Impact: medium
- Tags: shorts-theme-firm, copy, ux
- Root Cause: I optimized the layout around the current generated script instead of defining a separate scene-copy contract for recurring daily shorts.
- Prevention Rule: For reusable shorts pipelines, generate per-scene summary copy with strict length limits and never bind raw narration directly into main slide UI.
- Evidence:

### 2026-03-18 | Reused one dashboard pattern across expert scenes
- Impact: medium
- Tags: shorts-theme-firm, design, motion
- Root Cause: I differentiated expert slides mainly with color and labels while keeping nearly identical layout grammar, which weakened scene contrast.
- Prevention Rule: Require distinct scene grammar per section in shorts: different chart families, card structures, and transition beats rather than color swaps on one repeated layout.
- Evidence:

### 2026-03-19 | BkngDebateShorts hook/finale scene structure mismatch
- Impact: medium
- Tags: remotion, scene-timing, shorts-theme-firm
- Root Cause: I converted standalone hook/finale scenes into overlays without preserving the user's required shorts-firm style fixed intro/outro scene structure.
- Prevention Rule: When refactoring Remotion scene timing, keep the scene inventory and standalone-vs-overlay structure explicit, and verify it against the user's requested reference pipeline before wiring timing.
- Evidence:

### 2026-03-19 | Changed BKNG middle scenes instead of only hook/finale
- Impact: medium
- Tags: remotion, design-scope, validation
- Root Cause: I inferred the BKNG shorts composition should be redesigned holistically instead of preserving scenes 2-5 exactly as requested, and I did not verify the user's visual reference against the local composition before editing.
- Prevention Rule: Before editing a multi-scene Remotion composition, compare the exact scenes the user named in localhost/current TSX and restate which scene indices will change. Preserve untouched scenes unless the user explicitly approves broader redesign.
- Evidence:
