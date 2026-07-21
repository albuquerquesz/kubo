---
name: kubo-motion-grammar
description: >
  Playwright-backed Mistral.ai motion grammar for text (dual-title, masked
  char rise) and scroll (sticky scale+translate, icon mask rise, scrub). Use
  when matching Kubo home marketing motion identically on mechanics. Never copy
  Mistral brand, assets, type, or copy.
---

# Kubo motion grammar (Mistral-researched)

**Scope:** motion **mechanics** only (masks, axes, eases, scrub, stagger, dual-title a11y).  
**Not in scope:** ALTMistral, Mistral palette, logo, CMS SVGs (`bag.svg` / `robot.svg` / `earth.svg` from mistral.ai), copy, or shipping Mistral classnames as product API.

**Probe:** Chromium/Playwright, viewport **1440×900**, `https://mistral.ai/`, **2026-07-20** (revalidated live same day).  
**Engine on site:** GSAP **3.15.0** (`window.gsapVersions`). `window.gsap` is not always exposed globally — sample via computed `transform` / DOM.

**Identical means:** same transform axes, mask pattern, play-once vs scrub, stagger order, and dual-title SEO split — **not** pixel brand clone.

**Artifacts:**

- Fixture: `apps/web/test/fixtures/mistral-motion-probe-sample.json`
- Live probe scripts: `docs/.playwright-cli/probe-mistral-motion.mjs`
- Live dumps: `docs/.playwright-cli/mistral-motion-live-probe.json`, `mistral-motion-fine-curve.json`

Related prior docs (superseded for agent routing by **this** skill for motion):

- `.agents/skills/scroll-reveal-icons/SKILL.md` (icons subset)
- `docs/spec-gsap-motion-system-and-hero-title.md`
- `docs/spec-home-community-footer-scroll-icons.md`

Product change map: `docs/spec-mistral-identical-home-motion.md`.

---

## Family A — Hero dual-title (SEO + decorative)

### Observed DOM

| Layer           | Observation                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| SEO             | `<h1 class="hidden">Frontier AI. In your hands.</h1>` — in accessibility tree as heading, not painted                |
| Visual          | `<p class="text-display font-mistral block js-title" aria-hidden="true">`                                            |
| Host            | Custom element `mistral-atom-text-hero-title` with `data-autoplay="true"`, `data-randomness="1"`, `data-grow="true"` |
| Type (computed) | ALTMistral, **96px**, weight **500**, line-height **96px** (1.0), letter-spacing **−1.92px** (−0.02em)               |

Chars may be absent after intro (SplitText revert). Host props + prior GSAP SplitText research define the recipe.

### Motion parameters (identical mechanics)

| Param          | Value                                                                         |
| -------------- | ----------------------------------------------------------------------------- |
| Split          | lines → words → chars; line wrappers `overflow: hidden`                       |
| Char from      | `y: 100%` (below mask)                                                        |
| Char to        | `y: 0%` (or `y: -50%` when grow-dup glyph)                                    |
| Duration       | **1s** per char tween                                                         |
| Ease           | **`power4.inOut`**                                                            |
| Char stagger   | ~**0.005 × randomness** (randomness default **1**)                            |
| Line delay     | ~**0.7s** between lines                                                       |
| Grow mode      | optional line `height: 0 → auto` ~**1.3s**, same ease; selective glyph double |
| Play           | once on enter / autoplay (not scrubbed to scroll)                             |
| Reduced motion | no split/tween; final HTML visible                                            |

### Kubo type (brand-safe)

Keep Archivo `.ui-display` and product clamps — **do not** use ALTMistral or hard-code 96px as brand identity. Mechanics only.

Kubo intentional delta: `grow` default **false** (Mistral host ships `data-grow="true"`). Masked play-once rise still matches without grow.

---

## Family B — Sticky hero scale + mission column

### Observed structure

| Piece                | Observation                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Hero host            | `mistral-section-hero-home` — `lg:min-h-[200dvh]` (probe: min-height **1800px** at 900px viewport)                     |
| Sticky shell         | `.js-sticky` — `sticky top-0`, `lg:min-h-dvh` (**900px**), pin travel ≈ **900px** (hero − sticky)                      |
| Right column card    | `.js-col-right-top-inner` — **fixed shell** (bg + border, z-5); does **not** receive the scale tween                   |
| Right column content | `.js-right-top-content` — **`position: relative` in-flow**, `origin-bottom-left`, `lg:p-20`, z-5 — **scale+translate** |
| Mission type         | **~56px** constant (scale changes optical size: rest ≈26px, end 56px)                                                  |
| Mission lines        | `.js-right-top-content-sentence` — intentional `lg:text-nowrap` line blocks (3 lines)                                  |
| Host offset box      | **~924×396** from **type + padding**, not an absolute % of sticky                                                      |

**Critical (2026-07-21 remap):** do **not** implement Family B as an empty absolute layer (`w-[64%] h-[44%]`) over the sticky shell. That passes bbox occupancy while the mission text leaves its card. See `docs/spec-hero-sticky-stage-remap.md`.

### Host transform (required mechanics)

**Not scale alone.** Live site scrubs a **compound transform** on `.js-right-top-content`:

| Axis / prop        | Start (scrollY≈0)   | End of scale phase (scrollY≈900) | Notes                                               |
| ------------------ | ------------------- | -------------------------------- | --------------------------------------------------- |
| `scale`            | **~0.4664** (~0.47) | **1.0**                          | locks at 1 after ~875–900                           |
| `translateX`       | **0**               | **~258px**                       | ≈ **0.279 × offsetWidth** (258/924)                 |
| `translateY`       | **0**               | **~−252px**                      | ≈ **−0.636 × offsetHeight** (−252/396)              |
| `transform-origin` | **bottom left**     | unchanged                        | probe: `0px 396px` (left edge, bottom of host box)  |
| Scrub ease         | progress-driven     | —                                | use GSAP scrub with **`ease: "none"`** on the tween |

After scale locks at 1, **translate can keep adjusting** (e.g. at y=1000: `scale(1)` + `translate(258px, ~−199px)`). Treat post-1.0 motion as pure translate / sticky release — secondary to the scale phase.

**Scale is not linear in scrollY.** Sampled scale rises faster early, then eases into 1 (table below). Do not implement as `lerp(0.47, 1, y/900)` and expect visual match.

### Family B2 — Title / left column exit (required for stage clear)

Scrubbed on **title wrap** (`.js-main-title` / left upper column), **same pin** as host. Opacity stays **1** — pure `translateY`:

| scrollY | title wrap `translateY` (px)         |
| ------- | ------------------------------------ |
| 0       | **0**                                |
| 150     | **~−137.5**                          |
| 300     | **~−250**                            |
| 450     | **~−337.5**                          |
| 600     | **~−400**                            |
| 900     | **~−450** (≈ **−50% sticky height**) |

This is how the end frame becomes mission-only: title leaves upward; host grows and **covers** lower rail (z-index). Lower cards do **not** need an opacity tween for parity.

**Reduced motion:** no title exit scrub; keep title readable; host at scale 1.

### Probe map — host scale + translate (1440×900)

Canonical settled samples (jump-scroll + short settle). Fixture: `mistral-motion-probe-sample.json` → `familyB_hostTransform`.

| scrollY | scale      | translateX (px) | translateY (px) | notes                         |
| ------- | ---------- | --------------- | --------------- | ----------------------------- |
| 0       | **0.4664** | 0               | 0               | rest                          |
| 150     | **0.6294** | ~79             | ~−77            |                               |
| 300     | **0.7628** | ~143            | ~−140           |                               |
| 450     | **0.8666** | ~194            | ~−189           |                               |
| 600     | **0.9407** | ~229            | ~−224           |                               |
| 800     | **0.9934** | ~255            | ~−249           | near scale lock               |
| 900     | **1.0**    | **~258**        | **~−252**       | scale locked; ~−63% of height |
| 1000    | **1.0**    | ~258            | ~−199           | pure translate drift          |

### Mission sentence `translateX` (same scrub window)

**Active on the reference site** — not an optional polish-only step.

| Line index | Behavior (probe)                                     |
| ---------- | ---------------------------------------------------- |
| 0 (first)  | scrubbed **positive** `translateX` (~0 → ~52px @900) |
| 1 (middle) | **stays ~0**                                         |
| 2 (last)   | scrubbed **positive** `translateX` (~0 → ~71px @900) |

Use for optical alignment of nowrap lines as the host scales. Secondary to host scale+translate, but **expected** for identical mechanics.

**Reduced motion:** final scale **1**, translate identity (or final rested layout), no scrub.

### Stage takeover (user language vs measured bbox) — revalidated 2026-07-21

Users correctly describe: _“as you scroll, the text container grows until it takes the whole screen; icons appear; text centers; scrolling up reverses.”_

**Playwright evidence** (1440×900, jump-scroll + settle, dual down/up passes):

| scrollY | scale | painted host W×H | host center Δx (vs vp center) | title wrap ty | notes                        |
| ------- | ----- | ---------------- | ----------------------------- | ------------- | ---------------------------- |
| 0       | 0.466 | 431×185          | **+504** (right rail)         | 0             | rest chip in right-top card  |
| 300     | 0.763 | 705×302          | **+224**                      | −250          | growing + moving center      |
| 500     | 0.895 | 827×354          | **+100**                      | −361          | icons in; mosaic fringe only |
| 700     | 0.974 | 900×386          | **+26**                       | −428          | nearly centered              |
| 900     | 1.000 | 924×396          | **+1 ≈ 0**                    | −450          | **fully centered** stage     |
| up→0    | 0.466 | 431×185          | +504                          | 0             | **exact reverse** of rest    |

Artifacts: `docs/captures/mistral-container-grow-2026-07-21/` (`down-y*.png`, `up-y*.png`, `grow-summary.json`), script `docs/.playwright-cli/probe-mistral-container-grow.mjs`.

#### What “100% of the viewport” means (important)

| Layer                                        | Measured at end (y≈900)              | Role                                                         |
| -------------------------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| Sticky shell `.js-sticky`                    | **~1440×900 = 100% viewport**        | Full-bleed stage background (cream/white)                    |
| Mission host `.js-right-top-content` painted | **~924×396 ≈ 64% × 44%** of viewport | Scaled content block — **not** a 100vw×100vh box             |
| Host center                                  | Δx≈0, Δy≈0                           | **Optical center** of the stage                              |
| Title / mosaic / featured                    | off-screen or out of composition     | Cleared by B2 exit + cover, not by resizing the host to 100% |

So: **the sticky stage owns 100% of the viewport**; the mission **content** grows (scale 0.47→1) and **translates into the center** of that stage. Do **not** implement a literal `width/height: 100%` expanding layout box as the scale target — that mis-models the site and breaks reverse scrub.

#### Coordinate-remap rule (when applying the grammar to another rail layout)

The reference's raw matrix ends at roughly `translate(258px, -252px)` because its
unscaled host begins in a particular right-rail location. Those **signs and pixel
values are not portable** to a product whose in-flow card begins somewhere else.
The portable contract is the painted end pose:

```text
hostRect.center ≈ stickyRect.center
```

At the reference viewport, both deltas are within about 1px. Derive the destination
translation from the current unscaled layout box and sticky bounds on refresh, with
the same `transform-origin: bottom left`; do not copy `+258/-252` blindly. A Kubo
host beginning farther down/right can correctly use negative X / positive Y matrix
translation while landing at the identical visual center.

Probe this using `getBoundingClientRect()` at the rest and end samples. Comparing
only matrix signs will produce a false failure for a structurally different grid.

#### Reverse scrub (scroll up)

Same pin ScrollTrigger with `scrub` is **bidirectional**:

- down y=0 and up y=0: scale **0.4664**, tx/ty **0** (match)
- down y=900 and up y=900: scale **1**, tx **258**, ty **−252** (match)

No separate reverse timeline. If Kubo’s end state does not reverse cleanly, the scrub binding or `invalidateOnRefresh` is wrong — not a missing “scroll up” animation.

### Identical mechanics (implementer checklist)

1. Tall sticky hero (~**200dvh** host / ~**100dvh** sticky shell that **fills the viewport** as the stage).
2. Host **in-flow** in right-top card with **large type + padding** (offset box from content, not absolute empty % stage).
3. Scrub **scale 0.47→1** + **x/y translate** on mission host; **`transform-origin: bottom left`** — end pose **centers** content on the sticky stage.
4. Family B2: scrub **title wrap `translateY` 0 → ~−50% sticky H** on the same pin (clears left column).
5. Per-line **translateX** (outer lines move, middle fixed).
6. Host z-index above lower rail so growth can cover install/featured.
7. **Reverse for free** via scrub — verify y=0 and y=end match on scroll-up.
8. Desktop (`lg+`) only by default; reduced-motion → finals, no scrub.

---

## Family C — Scroll icon mask rise

### Observed DOM

```html
<div class="w-full justify-center gap-4 hidden lg:flex">
  <div class="flex overflow-hidden size-14">
    <!-- CSS 56×56; painted size smaller while parent host is scaled -->
    <img class="block size-full js-right-top-content-icon" alt="" />
  </div>
  <!-- ×3 icons -->
</div>
```

Placement: **above** mission sentences inside `.js-right-top-content`. Desktop only (`hidden lg:flex`). Icons live **inside** the Family B scaled host — their masks scale with the parent.

### Motion parameters

| Param          | Value                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| Mask           | parent `overflow: hidden` + fixed square **56px** (`size-14`)                                |
| Icon from      | `translateY(100%)` / `yPercent: 100` — fully below clip                                      |
| Icon to        | `translateY(0%)` / `yPercent: 0`                                                             |
| Coupling       | **scroll scrub** (not play-once), **same sticky pin** as Family B                            |
| Ease           | **`none`** while scrubbing                                                                   |
| Stagger        | sequential lag: first icon leads, third lags (same scrub window, different Y% at mid scroll) |
| Count          | **3** icons on reference                                                                     |
| Reduced motion | `yPercent: 0` immediately; no scrub                                                          |

### Rise window (shape, not hard pixels)

Live revalidation (1440×900, 2026-07-20):

| Phase              | scrollY (approx) | icon Y%                    |
| ------------------ | ---------------- | -------------------------- |
| Fully clipped      | **0 – ~200**     | **100 / 100 / 100**        |
| Leave rest         | **~225**         | first icon drops below 100 |
| Mid-rise           | **250 – 450**    | staggered drop (see table) |
| Near done (&lt;5%) | **~500 – 525**   | all icons nearly in        |
| Done (~0)          | **~625 – 700**   | residual ≈ 0               |
| Scale locks ~1     | **~875 – 900**   | icons already settled      |

**Contract for implementers:** endpoints + stagger + pin coupling. Mid Y% values are **shape samples** — scrub lag and continuous vs jump-scroll change midpoints. Prefer element-relative `ScrollTrigger` on the tall hero so icons finish **before** host scale locks at 1 (icons done ~60–75% of pin; scale ends ~100% of scale phase).

### Probe samples (icon Y% + host scale)

Revalidated live 2026-07-20 (settled jump-scroll). Icon order: bag → robot → earth. Y% from computed matrix `ty / 56 * 100` (GSAP yPercent equivalent).

| scrollY | icon0 Y%  | icon1 Y%  | icon2 Y%  | host scale |
| ------- | --------- | --------- | --------- | ---------- |
| 0       | 100       | 100       | 100       | **0.4664** |
| 150     | 100       | 100       | 100       | **0.6294** |
| 250     | **64.84** | **84.55** | **100**   | **0.7217** |
| 300     | **36.40** | **48.99** | **64.84** | **0.7628** |
| 400     | **10.24** | **14.97** | **21.31** | **0.8353** |
| 450     | **5.03**  | **7.78**  | **11.60** | **0.8666** |
| 600     | **0.19**  | **0.42**  | **0.84**  | **0.9407** |
| 800     | **0**     | **0**     | **0**     | **0.9934** |
| 900     | 0         | 0         | 0         | **1.0**    |
| 1000    | 0         | 0         | 0         | **1.0**    |

Do **not** treat an older slower curve (icons still ~55% at y=300, residual at y=1000) as current truth — that mid-curve is **stale**.

Fixture: `apps/web/test/fixtures/mistral-motion-probe-sample.json`.

**Assets:** original Kubo/Lucide only — never hotlink Mistral CMS files.

---

## Family D — Mobile nav / panels (secondary)

Observed off-canvas panels: `transform: translateX(100%)` when closed (full viewport width slide).

**Identical mechanics if Kubo mobile nav uses slide:** enter from `x: 100%` → `0`, ease-out exponential; not required for home hero parity unless header menu is in scope of a follow-up.

---

## Family E — Decorative continuous loops (out of hero sticky)

CSS/looping effects (arrow fade stack, signal field pulse) are **not** the Mistral sticky grammar. Keep project-specific; do not force-map to Mistral.

---

## Implementation stack (Kubo)

| Concern        | Use                                                                   |
| -------------- | --------------------------------------------------------------------- |
| Engine         | GSAP 3 + ScrollTrigger + `@gsap/react` cleanup                        |
| Module root    | `apps/web/src/lib/motion/`                                            |
| Eases tokens   | `eases.ts` — align Family A to `power4.inOut` / 1s / charFactor 0.005 |
| Reduced motion | `prefersReducedMotion()` → final state, no scrub/split                |

### Anti-patterns

- Opacity-only fades without overflow mask for “from under” text/icons
- Animating `top` / `margin` / layout props
- Scrubbing the hero char intro (Family A is play-once)
- Play-once icons that should scrub (Family C)
- **Scale-only** Family B host (missing co-scrubbed **translateX/Y**)
- **Absolute empty stage host** sized as % of sticky to fake occupancy (mission leaves its card)
- Small mission type (e.g. 28px) under 0.47 scale without large end type
- Shipping Mistral SVGs, ALTMistral, or `js-right-top-content-icon` as public API names
- Hard-coding mid-scroll icon Y% pixels instead of pin-relative ScrollTrigger

### QA checklist (mechanics)

- [ ] Family A: chars rise from `y:100%` under line mask; dual `h1` + decorative `aria-hidden`
- [ ] Family B: host **in-flow** in rail card; large type+pad; **scale ~0.47→1** + **translate**; origin bottom-left
- [ ] Family B2: title wrap **translateY** exits up (~−50% sticky H) on same pin
- [ ] Family B (parity): mission outer lines get small scrubbed **translateX**; middle line ~0
- [ ] Family C: three icons, 56px masks, `yPercent` 100→0 scrub + stagger; done before scale locks
- [ ] Rest: mission readable **inside** right-top card (not floating over install)
- [ ] End: mission dominates stage; title off-top; lower rail covered/secondary
- [ ] End geometry: painted mission host center is within a few pixels of sticky-stage center (do not assert raw translate signs outside the reference DOM)
- [ ] All families: reduced-motion final state
- [ ] Zero requests to mistral.ai for media

---

## When to load this skill

- Matching home marketing motion to Mistral **mechanics**
- Writing or reviewing GSAP timelines for dual-title, sticky scale+translate, icon rise
- Updating `docs/spec-mistral-identical-home-motion.md`

For UI structure only (grids, rails), prefer `docs/spec-mistral-inspired-ui-skill.md` / editorial specs — not this file.
