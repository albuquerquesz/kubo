---
name: mistral-motion-grammar
description: >
  Playwright-backed Mistral.ai motion grammar for text (dual-title, masked
  char rise) and scroll (sticky scale+translate, icon mask rise, scrub). Use
  when matching Kubo home marketing motion identically on mechanics. Never copy
  Mistral brand, assets, type, or copy.
---

# Mistral motion grammar (research skill)

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

| Piece                | Observation                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Hero host            | `mistral-section-hero-home` — `lg:min-h-[200dvh]` (probe: min-height **1800px** at 900px viewport)                      |
| Sticky shell         | `.js-sticky` — `sticky top-0`, `lg:min-h-dvh` (**900px**), pin travel ≈ **900px** (hero − sticky)                       |
| Right column content | `.js-right-top-content` — `origin-bottom-left`, `will-change-transform` — **this** node receives the scrubbed transform |
| Mission lines        | `.js-right-top-content-sentence` — intentional `lg:text-nowrap` line blocks (3 lines)                                   |

### Host transform (required mechanics)

**Not scale alone.** Live site scrubs a **compound transform** on `.js-right-top-content`:

| Axis / prop        | Start (scrollY≈0)   | End of scale phase (scrollY≈900)   | Notes                                               |
| ------------------ | ------------------- | ---------------------------------- | --------------------------------------------------- |
| `scale`            | **~0.4664** (~0.47) | **1.0**                            | locks at 1 after ~875–900                           |
| `translateX`       | **0**               | **~258px**                         | positive (content drifts right as it grows)         |
| `translateY`       | **0**               | **~−252px** (~−63% of host height) | negative (content lifts)                            |
| `transform-origin` | **bottom left**     | unchanged                          | probe: `0px 396px` (left edge, bottom of host box)  |
| Scrub ease         | progress-driven     | —                                  | use GSAP scrub with **`ease: "none"`** on the tween |

After scale locks at 1, **translate can keep adjusting** (e.g. at y=1000: `scale(1)` + `translate(258px, ~−199px)`). Treat post-1.0 motion as pure translate / sticky release — secondary to the scale phase.

**Scale is not linear in scrollY.** Sampled scale rises faster early, then eases into 1 (table below). Do not implement as `lerp(0.47, 1, y/900)` and expect visual match.

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

### Identical mechanics (implementer checklist)

1. Tall sticky hero (~**200dvh** host / ~**100dvh** sticky shell).
2. Scrub **scale 0.47→1** + **x/y translate** on mission/right-top host; **`transform-origin: bottom left`**.
3. Optional but recommended for parity: per-line **translateX** (outer lines move, middle fixed).
4. Desktop (`lg+`) only by default; reduced-motion → finals, no scrub.

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
- Shipping Mistral SVGs, ALTMistral, or `js-right-top-content-icon` as public API names
- Hard-coding mid-scroll icon Y% pixels instead of pin-relative ScrollTrigger

### QA checklist (mechanics)

- [ ] Family A: chars rise from `y:100%` under line mask; dual `h1` + decorative `aria-hidden`
- [ ] Family B: sticky shell; host **scale ~0.47→1** + **translate** scrubbed; origin bottom-left
- [ ] Family B (parity): mission outer lines get small scrubbed **translateX**; middle line ~0
- [ ] Family C: three icons, 56px masks, `yPercent` 100→0 scrub + stagger; done before scale locks
- [ ] All families: reduced-motion final state
- [ ] Zero requests to mistral.ai for media

---

## When to load this skill

- Matching home marketing motion to Mistral **mechanics**
- Writing or reviewing GSAP timelines for dual-title, sticky scale+translate, icon rise
- Updating `docs/spec-mistral-identical-home-motion.md`

For UI structure only (grids, rails), prefer `docs/spec-mistral-inspired-ui-skill.md` / editorial specs — not this file.
