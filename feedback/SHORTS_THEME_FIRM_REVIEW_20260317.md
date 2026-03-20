# Shorts Theme-Firm Review - 2026-03-17

## Purpose

Capture the user's feedback on `shorts-theme-firm` so it can be promoted into the `shorts-creator` skill and future theme-based shorts pipelines.

This note is intentionally written as implementation guidance, not as a one-off design critique.

## What Worked

- The general direction of the redesign is acceptable: cleaner finance tone, more trustworthy feel, less toy-like than the earlier version.
- The pipeline separation goal is correct: `shorts-firm` must stay untouched and `shorts-theme-firm` must evolve independently.
- Rendering and end-to-end generation are functioning, so the remaining problem is mainly content binding and motion/design quality.

## What Failed

### 1. Do not pour the full generated script directly into the layout

The current approach still feels like the voiceover script was pushed into the slide UI too literally.

This is wrong for a reusable daily shorts pipeline because:

- company, market regime, and narrative density will change every day
- long script text collapses visual quality
- design review should not be blocked by imperfect script wording

Required rule:

- Every visual scene must use short, summarized, scene-specific copy.
- Hook, expert slides, and closing each need their own microcopy contract.
- In design-review mode, it is acceptable to use summarized placeholder text derived from the script rather than the raw script itself.

Recommended copy limits:

- Hook title: 8-18 Korean characters or 3-8 English words
- Hook body: 1 short sentence
- Expert headline: 1 takeaway line
- Expert support copy: 1 short summary line
- Closing: 1 recap line + 2-3 takeaway chips

## 2. Do not present subjective debate scores as exact facts

The debate-style numbers should not be shown as hard numeric truth in the UI.

Required rule:

- If a score is subjective or model-derived, display a category label instead of a printed exact score.
- Good label examples:
  - `High / Medium / Low`
  - `Strong / Mixed / Weak`
  - `Positive / Neutral / Negative`
  - `확장 / 중립 / 부담`

Allowed exception:

- Numeric values may still be used internally to drive bar heights, progress fills, or ranking order.
- If the chart uses the number only as a visual driver, that is acceptable.

Disallowed pattern:

- Large hero cards that print values like `78`, `63`, or `91` as if they were objective facts.

## 3. Each slide needs a clearly different scene grammar

The current expert slides still feel too similar.

Current repetition in `web/remotion/ShortsThemeFirmComposition.tsx`:

- `ThemeFirmFundamentalLayout`
- `ThemeFirmGrowthLayout`
- `ThemeFirmRiskLayout`
- `ThemeFirmSentimentLayout`

All four currently rely on a near-repeat of:

- ticker header
- summary card
- metric grid
- bar/progress section
- repeated point cards

Required rule:

- Each expert role must have a different visual grammar, not just different colors and labels.

Suggested scene grammar split:

- `fundamental`: statement card + balance sheet comparison bars + valuation ladder
- `growth`: rising timeline / capex ramp / segment growth bars
- `risk`: warning stack / downside scenario blocks / exposure map
- `sentiment`: price reaction card / positioning thermometer / reaction distribution
- `closing`: recap board + final verdict + watchlist CTA

## 4. Make the video feel more like a designed short, not a repeated dashboard

The user wants a finance/economy short that feels polished, trustworthy, dense, and animated.

Required rule:

- Repeating the same card motif across scenes is not enough.
- Add scene-to-scene contrast using layout, graph type, transition rhythm, and emphasis patterns.

Needed motion/design upgrades:

- stronger scene transitions between role sections
- at least 2-3 different chart families across one video
- one or two visually rich hero moments
- denser use of space so the screen does not feel empty
- more deliberate motion accents, not just fade-up cards

Good visual ingredients:

- bar charts
- ladder/ranking charts
- stacked comparison cards
- spotlight callouts
- ticker tape / market strip
- animated dividers
- card reflow transitions

## 5. "Toss-like" means trustworthy and systemized, not plain

The intended reference is Toss-style financial UI:

- high trust
- clean surfaces
- strong type hierarchy
- restrained but crisp motion
- compact information density
- obvious component system

Important nuance:

- "Clean" does not mean empty.
- The screen should feel intentional and premium, not sparse.

## 5A. Design rules for the next `theme-firm` rebuild

These are purely visual rules. They are separate from copy rules and implementation rules.

### A. Each scene needs a different silhouette

If a scene is blurred or viewed from far away, it should still be recognizable by shape alone.

Required rule:

- Hook, fundamental, growth, risk, sentiment, and closing must not all look like "rounded cards in a grid".
- Each scene should have one dominant silhouette:
  - `hook`: one hero board + support rail
  - `fundamental`: verdict slab + ladder bars
  - `growth`: large upward chart / timeline
  - `risk`: alert slab + stacked danger blocks
  - `sentiment`: circular or radial hero object
  - `closing`: poster-like final board

### B. One hero object per scene

The eye must know what to look at first.

Required rule:

- Every scene needs one dominant object that occupies the visual center of gravity.
- Secondary cards must support the hero object, not compete with it.

Good hero examples:

- giant ticker board
- large qualitative verdict chip
- full-height risk meter
- large line/area chart
- circular market-tilt gauge

### C. Vertical composition first

This is a shorts format, so the design must read top-to-bottom.

Required rule:

- Prefer vertical stacking and strong upper/middle/lower rhythm over desktop-style two-column balance.
- Use the full height of the 9:16 frame.
- Avoid leaving a neutral empty center area.

### D. White space must be purposeful

The current problem is not "too much white space" by itself, but weak white space.

Required rule:

- Empty areas must sharpen hierarchy or make a hero object feel bigger.
- Dead space that does not strengthen focus should be converted into structure, motion, or information.

### E. Reduce label noise

Too many small all-caps labels make the screen feel like a template instead of a designed short.

Required rule:

- Limit eyebrow / micro-label usage.
- In each scene, only one or two labels should visually matter.
- The main message should come from the hero headline and shape, not many small headers.

### F. Use stronger surface contrast

If all cards share the same weight, the page feels flat.

Required rule:

- Use a clearer hierarchy of surfaces:
  - hero surface
  - secondary surface
  - faint utility surface
- Not every card should have the same radius, border weight, fill strength, or shadow depth.

### G. Keep accent color discipline

Trustworthy finance UI is usually stricter than trendy UI.

Required rule:

- One scene should usually have one dominant accent color.
- Other colors should behave as support or alert signals, not as equal competitors.

### H. Build rhythm across scenes, not just inside scenes

Even if one frame is decent, the overall short still fails if all scenes feel equally weighted.

Required rule:

- Alternate between dense scenes and bold scenes.
- At least one scene should feel poster-like.
- At least one scene should feel chart-led.
- At least one scene should feel like a decisive warning or verdict.

## 6. Remotion implementation rules for future shorts work

These should be promoted into the shorts-making skill:

- Prefer frame-driven animation primitives for core scene timing.
- Use `interpolate()` with clamping for all time-based property mapping.
- Use `spring()` for hero entrances and important emphasis moments.
- Use `Sequence` to create hard scene identity changes instead of only restyling one persistent layout.
- Measure or fit text before rendering key headlines so daily script variation does not break layout.
- Load fonts in a shared place and keep the typography system stable across scenes.
- Treat charts and labels as separate layers: chart may be quantitative, label may remain qualitative.

## 7. Extra rules from `remotion-best-practices`

The Remotion skill suggests a few additional rules that are not strong enough in the current review yet.

### A. Core animation should be frame-driven, not `framer-motion`-driven

Current `theme-firm` still relies heavily on `AnimatePresence` and `motion.*` inside `web/remotion/ShortsThemeFirmComposition.tsx`.

Required rule:

- Core scene motion for render-critical shorts should be driven from `useCurrentFrame()`, `interpolate()`, and `spring()`.
- `framer-motion` should not be the primary timing engine for scene choreography in Remotion.

Why:

## 8. Follow-up visual correction from the latest review

The latest user feedback clarified a very specific failure mode:

- The problem is not "big text" by itself.
- The problem is dead space with too few visual objects.
- Making a text container taller does not increase visual density.

Required rule:

- Empty space should be consumed by a real visual object:
  - chart
  - ring / gauge
  - ladder bars
  - alert slab
  - price curve
  - poster board

Disallowed pattern:

- Expanding a headline or summary area vertically just to make the layout feel less empty.

Required thumbnail rule:

- The first rendered frame must already read like a thumbnail / poster.
- Do not rely on a later frame to become the "good" frame.
- Major hero objects should still be visible at frame `0`.

## 9. External references used for the redesign direction

Direct high-quality public examples of "Claude Code + Remotion shorts automation" were sparse, so the stronger references should be:

- official Remotion documentation
- official/public Remotion templates
- public short-form motion examples built around large hero objects, not repeated small cards

References:

- Remotion home: https://www.remotion.dev/
- `interpolate()`: https://www.remotion.dev/docs/interpolate
- `Sequence`: https://www.remotion.dev/docs/sequence
- `@remotion/paths`: https://www.remotion.dev/docs/paths
- TikTok template: https://github.com/remotion-dev/template-tiktok
- Audiogram template: https://github.com/remotion-dev/template-audiogram

Design implication:

- If an official vertical/social template leads with one giant object, the finance version should do the same.
- The scene should feel like a poster or motion graphic first, and like a dashboard second.

- Remotion rendering is timeline-based, so frame-derived motion is more deterministic.
- It is easier to reason about exact timing, overlaps, and retiming when animation is mapped from frame numbers.
- This matters more in a reusable daily pipeline than in a one-off interactive React UI.

### B. Thumbnail should be a dedicated still, not an accidental first frame

Current output still behaves like the thumbnail is whatever the first visible hook frame happens to be.

Required rule:

- Add a dedicated thumbnail composition or still for `shorts-theme-firm`.
- The thumbnail must have one dominant object, one dominant headline, and very limited supporting detail.

Why:

- A good shorts thumbnail is not the same thing as a good first animation frame.
- Remotion best practices explicitly support separate still compositions for this use case.

### C. Daily-changing copy needs measurement and fitting, not guesswork

Current review already says to summarize text, but the Remotion text-measurement rule makes the implementation requirement more specific.

Required rule:

- Use `fitText()`, `measureText()`, or `fillTextBox()` for dynamic headlines, chips, and key statistic labels.
- Font measurement must use the same font family, weight, size, and spacing as final render.

Why:

- Daily company shorts will produce variable ticker names, thesis lines, and Korean/English text lengths.
- A static font size strategy will keep breaking layout.

### D. Scene cuts should be designed explicitly with transition components

The review already asks for stronger scene identity, but Remotion gives a more concrete implementation path.

Required rule:

- Use `TransitionSeries` or clearly structured `Sequence` boundaries for major scene changes.
- Use transitions or overlays intentionally at cut points instead of relying on repeated fade-up cards.
- Premount scene sequences before they appear to avoid flicker and late asset/layout pop-in.

Why:

- Shorts need sharp section identity changes.
- If every scene enters with the same internal card animation, the video feels repetitive even if the content changes.

### E. Charts should become real hero graphics, not tiny dashboard widgets

The current chart critique should be expanded based on the chart rule.

Required rule:

- Build major charts as SVG or path-based hero visuals.
- Use staggered spring entrances for bar families.
- Use path-draw animation and moving markers for line or stock-style charts.
- Do not rely on third-party chart animation libraries inside Remotion scenes.

Why:

- Remotion is strong at frame-driven SVG animation.
- Tiny progress bars inside cards do not justify the vertical canvas.
- Finance shorts need at least one large, memorable visual proof object per expert scene.

### F. Fonts should be loaded with Remotion-aware font loading when possible

Current theme-firm styling imports CSS fonts, but the Remotion font rules suggest a stronger contract.

Required rule:

- Prefer `@remotion/fonts` or `@remotion/google-fonts` for primary title/body font loading.
- Load only the weights actually used.
- Perform text measurement only after fonts are known to be loaded.

Why:

- Font loading and text measurement are coupled.
- The current problem is not just aesthetic; it also affects layout stability across daily renders.

### G. Composition structure should reflect social-video outputs

The composition rule implies that shorts and thumbnails should not be treated as one generic render target.

Required rule:

- Keep the vertical shorts composition and the thumbnail still as separate render targets.
- Keep props JSON-serializable and structured so future scene variants can be swapped without changing the render contract.
- If scene timing becomes more data-dependent, prefer `calculateMetadata` rather than hidden magic constants.

Why:

- `theme-firm` is a repeatable production format, not a one-off animation.
- Composition boundaries are part of the product design, not just implementation detail.

## Promotion Candidates For `shorts-creator` Skill

Add rules like the following:

1. Never bind raw narration text directly into the main slide layout for reusable daily shorts.
2. Generate scene copy separately from narration, with strict per-scene length limits.
3. When a value is subjective/model-derived, render category labels by default and use numbers only to drive visuals.
4. Force scene grammar diversity across sections; color swaps alone do not count as differentiation.
5. For design review passes, optimize for visual quality first and use summarized placeholder copy when needed.
6. In finance shorts, target trust and density: clean surfaces, dark text, restrained accent color, compact cards, minimal dead space.
7. Require at least two distinct chart/graphic motifs per video and one hero transition moment.

## What The References Suggest

Remotion references imply a specific implementation pattern:

- `interpolate()` should be the base primitive for predictable timeline mapping.
- `Sequence` should be used to give each scene a hard timing boundary and a clear identity change.
- `fitText()` should be used on daily-changing headlines so copy length does not destroy layout.
- shared font loading should be centralized rather than improvised per scene.
- `Still` should be used for thumbnail-specific output instead of trusting the first animated frame.
- `TransitionSeries` should be considered when scene changes need stronger visual identity.
- charts should lean on SVG / path animation instead of repeated small dashboard bars.
- official templates show that social videos work best when they are built around strong scene concepts, not one reusable dashboard with recolored cards.

Inference for `theme-firm`:

- We should stop thinking in terms of "one expert page component with different accents".
- We should think in terms of "5 different short-form scenes that happen to share one finance brand system".

## Current Code Areas To Revisit

- `web/remotion/ShortsThemeFirmComposition.tsx`
- `ThemeFirmHookSection`
- `ThemeFirmFundamentalLayout`
- `ThemeFirmGrowthLayout`
- `ThemeFirmRiskLayout`
- `ThemeFirmSentimentLayout`
- `ThemeFirmClosingSection`

Specific current issue:

- the role layouts are too structurally similar, so the video feels like the same screen repeated with different accents
- current motion is still driven too much by `framer-motion` instead of Remotion-native frame logic
- there is no dedicated thumbnail still contract yet
- dynamic text fitting/measuring is not yet a first-class rule
- chart scenes are still closer to dashboard widgets than hero visuals

## External References Reviewed

Official Remotion:

- Remotion homepage: programmatic, parameterized videos and editor-app workflows
- `interpolate()`: clamp and easing patterns for timeline-safe animation
- `Sequence`: explicit scene timing and scene identity separation
- `TransitionSeries`: explicit transition and overlay control at scene boundaries
- `charts`: SVG/path-based animated chart patterns for bars and line charts
- `measuring-text`: `fitText()`, `measureText()`, and `fillTextBox()` for daily-changing copy
- `fitText()`: adapt text to changing copy length
- `Using fonts`: shared font loading guidance
- `Compositions / Stills`: separate still output for thumbnails
- official templates:
  - `template-tiktok`
  - `template-audiogram`
  - `template-next-app-dir`

Toss references:

- Toss brand color guidance
- Toss design system article
- Toss color system article

## Source Links

- https://www.remotion.dev/
- https://www.remotion.dev/docs/interpolate
- https://www.remotion.dev/docs/sequence
- https://www.remotion.dev/docs/transitions
- https://www.remotion.dev/docs/charts
- https://www.remotion.dev/docs/layout-utils/measuring-text
- https://www.remotion.dev/docs/fonts
- https://www.remotion.dev/docs/layout-utils/fit-text
- https://www.remotion.dev/docs/composition
- https://github.com/remotion-dev/template-tiktok
- https://github.com/remotion-dev/template-audiogram
- https://github.com/remotion-dev/template-next-app-dir
- https://brand.toss.im/
- https://toss.tech/article/toss-design-system
- https://toss.tech/article/tds-color-system-update
