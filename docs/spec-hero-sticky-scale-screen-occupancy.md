# Spec: Hero sticky scale must **take screen space** (Mistral occupancy gap)

## Status

**Implemented** (strategy B — sticky-stage host). Live probe 1440×900: end sticky width share **0.64**, area share **0.281**, painted growth **~4.59×**, host left **1008 → 260** (into stage). Scale scrub unchanged (~0.47→1).

## Date

July 20, 2026

## Goal

Keep the existing Family B **smooth scale scrub** (already shipping), and make the mission host **grow into a meaningful share of the sticky hero frame** the way Mistral’s `.js-right-top-content` does — not only scale a small text block in the right rail corner.

**Identical ≠ brand clone.** No ALTMistral, Mistral palette, CMS SVGs, or copy.

**Skill:** [`.agents/skills/mistral-motion-grammar/SKILL.md`](../.agents/skills/mistral-motion-grammar/SKILL.md) (Family B transform axes remain required).  
**Parent motion map:** [`docs/spec-mistral-identical-home-motion.md`](./spec-mistral-identical-home-motion.md)

**Probe:** Playwright Chromium, viewport **1440×900**, localhost `http://localhost:3333/` + `https://mistral.ai/`, 2026-07-20.  
**Artifacts:** `docs/.playwright-cli/probe-hero-occupancy.mjs`, fixture fields in `apps/web/test/fixtures/mistral-motion-probe-sample.json` (`occupancy` section when present).

---

## What already works (do not re-litigate)

| Mechanic                    | Local (probe)                          | Mistral (probe)   |
| --------------------------- | -------------------------------------- | ----------------- |
| Sticky pin shell            | h≈852 under header, `position: sticky` | h≈900, sticky     |
| Section pin track           | `200dvh` / 1800px                      | `200dvh` / 1800px |
| Scale scrub                 | **0.4664 → ~1.0**                      | **0.4664 → 1.0**  |
| Area growth ratio (painted) | **~4.59×** (matches 1/0.4664²)         | **~4.60×**        |
| Origin                      | bottom-left                            | bottom-left       |
| Icons / dual-title          | Family C/A already gated separately    | —                 |

**Conclusion:** GSAP scale scrub is fine. The gap is **layout host size + where the painted box lands in the sticky frame**, not the scale ease itself.

---

## Probe: occupancy (1440×900)

Definitions:

- **Offset box** = layout size (`offsetWidth` × `offsetHeight`) before visual scale.
- **Painted box** = `getBoundingClientRect()` after CSS/GSAP transform.
- **Sticky share** = painted host area / sticky shell area.
- **Sticky width share** = painted host width / sticky width.

### Rest (scrollY ≈ 0)

| Metric               | Kubo local    | Mistral       |
| -------------------- | ------------- | ------------- |
| Host **offset** W×H  | **351 × 189** | **924 × 396** |
| Host **painted** W×H | 164 × 88      | 431 × 185     |
| Painted area         | ~14.4k        | ~79.6k        |
| Sticky share (area)  | **1.2%**      | **6.1%**      |
| Sticky width share   | **11.4%**     | **29.9%**     |
| Host left (viewport) | ~1049         | ~1009         |

### End of scale phase (scrollY ≈ 900)

| Metric               | Kubo local                  | Mistral                              |
| -------------------- | --------------------------- | ------------------------------------ |
| Host painted W×H     | **351 × 189**               | **924 × 396**                        |
| Painted area         | ~66k                        | ~366k                                |
| Sticky share (area)  | **5.4%**                    | **28.2%**                            |
| Sticky width share   | **24.4%**                   | **64.2%**                            |
| Sticky height share  | **22.2%**                   | **44.0%**                            |
| Host left (viewport) | **~1259** (moves **right**) | **~259** (moves **left into frame**) |
| Host top             | ~124                        | ~252                                 |
| Transform sample     | scale~1, tx~210, ty~−120    | scale 1, tx~258, ty~−252             |

### Growth ratios (rest → end)

|                     | Kubo | Mistral |
| ------------------- | ---- | ------- |
| Painted width ratio | 2.14 | 2.14    |
| Painted area ratio  | 4.59 | 4.60    |

Scale multiplies both sites the same. Mistral still **owns ~5× more sticky area at the end** because its **layout host is ~2.6× wider and ~2.1× taller**.

### Geometry root cause

| Piece           | Kubo                                                                      | Mistral                                                                                                   |
| --------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Sticky shell    | 1440 × 852                                                                | 1440 × 900                                                                                                |
| Right rail cell | ~432 × 425 (grid ~30%)                                                    | host itself **924×396** (fills most of the right/top content band)                                        |
| Scale target    | Shrink-wrapped icons + 3 mission lines                                    | Large padded content host (`.js-right-top-content` with large padding / intrinsic width)                  |
| Optical path    | Grows **inside** the right 30% column; translate pushes **further right** | Grows into a **large share of the sticky stage**; painted box moves **into the center-left of the shell** |

**“Cresce mas não pega espaço da tela”** = scale works on a **small offset box**, so even at scale 1 the mission block remains a modest chip in the right rail (~5% of sticky area) instead of a dominant sticky-stage object (~28%+ area, ~64% width).

---

## Change map (what’s missing)

### 1. Enlarge the Family B **layout host** (primary gap)

|              |                                                                                                                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Paths**    | `apps/web/src/app/(home)/_components/hero-section.tsx`                                                                                                                                                    |
|              | Optionally a dedicated host wrapper component                                                                                                                                                             |
| **Current**  | `[data-hero-motion="right-top-host"]` wraps only icons + mission; offset ≈ **351×189** at 1440                                                                                                            |
| **Required** | Host **layout box** (unscaled) must be large enough that at scale 1 its painted size reaches occupancy targets below. Practical approaches (pick one, measure again):                                     |
|              | **A.** Make the host fill the **upper-right grid cell** (`w-full h-full` of R1) and bottom-left-align icons+mission inside it; scale the full cell.                                                       |
|              | **B.** Promote the scale target to a **right-rail stack** (R1+R2) or a sticky-stage layer sized ~**≥60% of sticky width** and ~**≥40% of sticky height** at scale 1 (probe Mistral ~924×396 on 1440×900). |
|              | **C.** Hybrid: keep type size, but host is a sized frame with min dimensions derived from sticky shell fractions.                                                                                         |
| **Do not**   | Only bump GSAP `scale` past 1 to fake size; only increase type clamp without growing the transform target.                                                                                                |

### 2. Restage **translate** so growth claims center stage (secondary)

|              |                                                                                                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Paths**    | `apps/web/src/lib/motion/timelines/hero-sticky-scale.ts`                                                                                                                                                                                                                                                                                                     |
|              | `HERO_HOST_X_END_RATIO` / `HERO_HOST_Y_END_RATIO` (or absolute end x/y from sticky metrics)                                                                                                                                                                                                                                                                  |
| **Current**  | End translate ratios from Mistral probe host; on Kubo’s small host + right rail, painted **left increases** (1049→1259) — block slides deeper into the right margin.                                                                                                                                                                                         |
| **Required** | After host box is enlarged, re-tune translate so end-of-pin painted box **occupies the intended sticky-stage region** (Mistral end: left ~259 on 1440, width ~924 — dominant mid/right stage). Prefer computing end `x`/`y` from **sticky or host layout metrics** (`ScrollTrigger` + `invalidateOnRefresh`), not only fixed ratios of a shrink-wrapped box. |
| **Do not**   | Copy Mistral’s absolute 258/−252 as the only success criterion without re-measuring occupancy.                                                                                                                                                                                                                                                               |

### 3. Clip / overflow of parents

|              |                                                                                                                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Paths**    | `hero-section.tsx` sticky shell + grid cells                                                                                                                                                        |
| **Current**  | Right cell ~432px; large scaled host may clip if overflow hidden                                                                                                                                    |
| **Required** | Sticky shell may use `overflow-x-hidden` like Mistral, but the scale host must not be clipped **before** it reaches occupancy targets. If host is cell-sized, overflow visible within sticky is OK. |
| **Do not**   | Clip the host to a tiny padding box.                                                                                                                                                                |

### 4. Verification metrics (checkable)

At **1440×900**, desktop, after implement:

| Checkpoint                           | Pass                                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Rest scale                           | ~0.47 on host transform                                                                                           |
| End scale                            | ~1.0 by end of pin                                                                                                |
| Host offset (layout) width           | **≥ 55% of sticky width** OR **≥ 90% of right-rail cell width if using full-cell host** (document which strategy) |
| End painted sticky **width** share   | **≥ 0.55** (Mistral ~0.64; floor for “takes the stage”)                                                           |
| End painted sticky **area** share    | **≥ 0.20** (Mistral ~0.28; Kubo today ~0.05)                                                                      |
| Rest→end painted area ratio          | ~**4.5–4.7** (unchanged scale physics)                                                                            |
| Host remains in sticky vertical band | bottom-left origin; not scrolled away mid-pin                                                                     |
| Reduced motion                       | scale 1, final occupancy (no scrub)                                                                               |
| Brand                                | no Mistral assets                                                                                                 |

### 5. Out of scope for this gap-spec

- Family A title type / grow glyphs
- Family C icon retune (unless host resize breaks mask QA)
- Install card / lower rail content rewrite
- Mobile sticky scale
- Brand clone

---

## Implementation order (when coding)

1. Resize Family B host layout (full R1 cell or larger stage frame) — **measure offset W×H**.
2. Re-run occupancy probe; confirm sticky width share at scale 1 jumps toward ≥0.55.
3. Re-tune translate end values from sticky metrics; confirm host moves into stage (not further into the margin).
4. Overflow QA at 1440 / 1920; reduced-motion finals.
5. Update fixture `occupancy` samples + contract tests.

### Shipped (strategy B)

| Piece                                                                | Location                                                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Sticky-stage host `lg:w-[64%] lg:h-[44%]`, `left-[70%] bottom-[40%]` | `apps/web/src/app/(home)/_components/hero-section.tsx` (`data-hero-occupancy-strategy="sticky-stage"`) |
| Stage end translate from sticky metrics                              | `hostEndTranslateForStage` in `hero-sticky-scale.ts`                                                   |
| Shell `lg:overflow-x-hidden`                                         | sticky-shell (host may extend past right edge at rest)                                                 |
| Fixture + contract tests                                             | `mistral-motion-probe-sample.json` → `occupancy.kuboLocalAfterFix`                                     |

---

## Relationship

| Doc                                             | Role                                                 |
| ----------------------------------------------- | ---------------------------------------------------- |
| `mistral-motion-grammar` skill                  | Axes: scale+translate, pin 200dvh                    |
| `spec-mistral-identical-home-motion.md`         | Original A/B/C change map (scale scrub done)         |
| **This spec**                                   | Remaining **screen occupancy** gap after scale works |
| `docs/.playwright-cli/probe-hero-occupancy.mjs` | Re-run dual-site occupancy                           |

---

## Probe command

```bash
# Dev server on :3333
node docs/.playwright-cli/probe-hero-occupancy.mjs
# Writes occupancy-report.json + screenshots (configure SCRATCH in script or cwd)
```
