---
name: kubo-square-cli-perch
description: >
  X/LinkedIn square social promo grammar: 1080×1080 @30fps ~6s canvas, cream plate,
  stacked title + dark CLI select card, mascot perched on panel top-right with walk loop.
  Use when sizing Remotion launch/social cuts, choosing 1:1 vs 16:9, or matching mascot-on-CLI
  layout mechanics. Never ship Claude/Anthropic brand, mascot, shield, beta chrome, or security copy.
---

# Square CLI-perch promo grammar (reference-researched)

**Scope:** canvas **dimensions**, **layout hierarchy**, and **motion mechanics** for a short social cut where a brand mark sits on a dark CLI select panel.  
**Not in scope:** Claude Security product UI, Anthropic orange mascot, lavender beta pill, purple shield prop, serif “Claude Security…” title copy, or any Anthropic assets/colors as Kubo defaults.

**Reference post:** https://x.com/claudeai/status/2079990597973057691 (media `/video/1`)  
**Probe date:** 2026-08-04  
**Method:** public MP4 download (syndication/fxtwitter variants) + `ffprobe` + ffmpeg frame dumps + Playwright `<video>` metadata on data-URL MP4. X.com web player may be media-gated headless — prefer local MP4 path documented in [references/probe-notes.md](./references/probe-notes.md).

**Artifacts (measured):**

| File                                                                         | Content                                   |
| ---------------------------------------------------------------------------- | ----------------------------------------- |
| [references/canonical-meta.json](./references/canonical-meta.json)           | width/height/duration/fps/variants        |
| [references/ffprobe-summary.json](./references/ffprobe-summary.json)         | stream probe                              |
| [references/playwright-analysis.json](./references/playwright-analysis.json) | `videoWidth` / `videoHeight` / `duration` |
| [references/layout-bbox.json](./references/layout-bbox.json)                 | panel + mascot bboxes by time             |
| [references/motion-timeline.md](./references/motion-timeline.md)             | time-ordered beats                        |
| [references/probe-notes.md](./references/probe-notes.md)                     | download + analysis recipe                |

---

## Canvas (authoritative)

| Property           | Reference (highest quality) | Notes                                                   |
| ------------------ | --------------------------- | ------------------------------------------------------- |
| **Width × height** | **1080 × 1080**             | Source path segment `…/vid/avc1/1080x1080/…mp4`         |
| **Aspect**         | **1:1**                     | `display_aspect_ratio` 1:1; square social native        |
| **Duration**       | **6.000 s**                 | syndication `duration_millis: 6000`; ffprobe `6.000000` |
| **Frame rate**     | **30 fps**                  | `r_frame_rate` 30/1; **180** frames                     |
| **Other variants** | 320², 540², 720², 1080²     | Always square; use 1080 for design                      |

**Implication for agents:** for an X/LinkedIn **square** promo matching this grammar, Remotion should target **1080×1080** (or another 1:1 size), **not** a wide 16:9 plate unless the distribution target is deliberately landscape.

---

## Layout grammar (mechanics)

Single held composition for the full **6s** (no scene cuts). Layers bottom→top:

```text
┌──────────── cream / near-white full-bleed plate (1080²) ────────────┐
│  TITLE (left, multi-line, large display)                             │
│  optional chip/pill under title (left)                               │
│                                                                      │
│  ┌── dark CLI card (~94% width, top ≈ 31.5% of canvas) ──────────┐ │
│  │  badge  ·  question  ·  numbered options  ·  divider · footer │ │
│  │  (mascot FEET sit on card TOP edge, top-right)                  │ │
│  └──────────────────────────────────────────────[mascot perch]─────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Measured ratios (1080 canvas, see `layout-bbox.json`)

| Element                | Observation                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| **Plate**              | Solid light cream (`~#F9F9F4`), no gold radial                                            |
| **Panel top**          | **y ≈ 340** → **~31.5%** from top                                                         |
| **Panel height**       | **~68.4%** of canvas (to bottom, slight bottom bleed/shadow)                              |
| **Panel width**        | **~94%** painted dark band; **~64px** left inset (~6%)                                    |
| **Panel shape**        | Large corner radius (~24–32px visual), soft drop shadow                                   |
| **Title band**         | Upper cream zone only; ends before panel (~0–31% Y)                                       |
| **Mascot size**        | **~10–13%** canvas width (~111–145px on 1080)                                             |
| **Mascot seat**        | Top-**right** of panel; **feet on edge** (`overlapIntoPanel ≈ −1` / flush)                |
| **Mascot right inset** | **~85–113px** from canvas right                                                           |
| **CLI content**        | Badge → question → `>` selected option + descriptions → type-in → divider → footer option |

### Hierarchy rules (portable)

1. **Stack vertically on square** — title owns the top third; panel owns the lower ~⅔. Do **not** put title and panel in a wide side-by-side 16:9 row if the goal is this grammar.
2. **Mascot is a perch, not a hero** — small mark, anchored to **panel top edge**, not floating mid-cream with large gaps into the card.
3. **CLI is the product shot** — dark card, mono stack, selected row accent; light plate only as stage.
4. **Safe margins** — keep title and panel inside ~5–8% side inset; panel may feel “almost full width” on 1:1.

---

## Motion grammar

Full timeline: [references/motion-timeline.md](./references/motion-timeline.md).

### What moves (reference)

| System                             | Behavior                                                                 | Timing feel                                                      |
| ---------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **Plate / title / panel chrome**   | **Static** for all 6s                                                    | No fade-in of layout at t=0 in sampled frames (already composed) |
| **Mascot body**                    | Continuous **walk / bob** on the panel rim (leg cycle, slight body rock) | Full clip loop; period roughly multi-second walk cycle           |
| **Optional prop (reference only)** | Small shield enters, passes **left → behind → right** of mascot, exits   | ~0.5s appear → mid-clip both sides → gone by ~5.9s               |
| **CLI options**                    | Static selected state (option 1 accent)                                  | No option-index animation in this cut                            |

### What **not** to copy into Kubo

- Shield / security prop, beta pill, Claude orange mascot palette (`#C17E…` coral)
- Serif marketing title face from the reference
- Product-specific CLI labels (“Scope & effort”, “Whole repo…”)

### Portable Remotion recipe (Kubo)

| Beat                         | Implement with                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| Held layout                  | One `Sequence` / scene, full duration                                                |
| Mark perch                   | `position: absolute; top: -(markH − few px); right: ~8–10%` over panel; feet on edge |
| Walk                         | Existing frame-driven mark walk (`KuboMarkCharacter` mode walk) for full clip        |
| Enter (optional Kubo polish) | Short spring opacity/Y on whole stack **if** needed — **not** required by reference  |
| Prop                         | **Omit** for Kubo; personality is mark walk only                                     |

Easing: walk is continuous character motion (see `svg-gsap-mascot` / video mark walk), not a single CSS cubic-bezier on the panel.

---

## Delta vs current Kubo launch (`apps/video`)

Source of truth for current composition: `apps/video/src/compositions/kubo-launch/lib/timing.ts`.

|          | **Reference promo**              | **Current `kubo-launch`**                   | Status           |
| -------- | -------------------------------- | ------------------------------------------- | ---------------- |
| Size     | **1080 × 1080**                  | **1080 × 1080**                             | Match            |
| Aspect   | **1:1**                          | **1:1**                                     | Match            |
| Duration | **6 s**                          | **6 s** (180 frames)                        | Match            |
| FPS      | **30**                           | **30**                                      | Match            |
| Layout   | Stacked title **above** panel    | Stacked title **above** panel               | Match            |
| Plate    | Cream/white                      | White, no gold glow                         | Match            |
| Mascot   | Perch top-right of panel, ~11% W | Perch top-right, ~12% W, walk loop          | Match mechanics  |
| Brand    | Claude/security                  | Kubo gold mark + `create-kubojs` CLI phases | Kubo only (keep) |

CLI content remains a multi-step `@clack` playback (richer than the static reference list). Prop/shield and Claude chrome stay **omitted**.

---

## Brand / legal fence

- Mechanics and measurements only.
- **Never** commit Claude mascot SVGs, Anthropic product screenshots as brand, shield icon, beta lavender chip, or security scan copy as Kubo marketing defaults.
- Kubo mark: gold `#FBC80D`, solid black eyes on light plates, first-party CLI copy (`create-kubojs`, stack options).

Related skills:

- [svg-gsap-mascot](../svg-gsap-mascot/SKILL.md) — walk/celebrate part motion
- [kubo-motion-grammar](../kubo-motion-grammar/SKILL.md) — **web** scroll motion (not this social cut)

---

## When to load

- Designing or resizing **Remotion** launch / X / LinkedIn **square** promos
- User says resolution is wrong vs Claude/security-style terminal+mascot ad
- Choosing **1:1 1080** vs **16:9 1920** for `kubo-launch`
- Speccing mascot-on-CLI panel layout percentages

## When not to load

- Long-form YouTube 16:9 product videos (different grammar)
- Web page GSAP scroll sections → `kubo-motion-grammar`
- Implementing Claude Security product features

---

## QA checklist (mechanics)

- [ ] Canvas **1:1**; default design size **1080×1080** for this promo class
- [ ] Duration on the order of **6s @ 30fps** (or explicit intentional delta)
- [ ] Title in upper plate; dark CLI card lower ~⅔; **not** forced side-by-side on square
- [ ] Mascot **perched** on panel top-right, feet on edge, ~10–13% width
- [ ] Walk loop for clip length; no Anthropic prop/mascot
- [ ] Kubo CLI badge/options only; light plate without reference brand chrome
