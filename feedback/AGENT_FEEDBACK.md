# Agent Feedback Log

Single-file incident log + periodic summary for Codex mistakes.

<!-- AUTO-SUMMARY:START -->
## Periodic Summary

Generated: 2026-02-16 05:07:48Z (UTC)

### Incident Counts
- Total: 1
- Last 7 days: 1
- Last 30 days: 1

### Impact Distribution
- `medium`: 1

### Top Tags
- `nextjs`: 1
- `static-export`: 1
- `youtube-render`: 1

### Actionable Feedback Rules
- `For static-export apps, keep route static and parse render query params in client components (window.location.search) instead of dynamic server searchParams.`: 1
<!-- AUTO-SUMMARY:END -->

## Incident Log

<!-- Append entries using feedback_loop.py log -->

### 2026-02-16 | Do not use dynamic route mode in Next static export
- Impact: medium
- Tags: nextjs, static-export, youtube-render
- Root Cause: Attempted to read searchParams on /youtube/episode/[date] and set force-dynamic, which conflicts with next.config output=export.
- Prevention Rule: For static-export apps, keep route static and parse render query params in client components (window.location.search) instead of dynamic server searchParams.
- Evidence: next-dev.log showed NEXT_STATIC_GEN_BAILOUT and route 500 until page reverted.
