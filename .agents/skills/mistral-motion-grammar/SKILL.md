---
name: mistral-motion-grammar
description: >
  Playwright-backed Mistral.ai motion grammar for text (dual-title, masked
  char rise) and scroll (sticky scale, icon mask rise, scrub). Use when
  matching Kubo home marketing motion identically on mechanics. Never copy
  Mistral brand, assets, type, or copy.
---

# Mistral motion grammar (research skill)

**Scope:** motion **mechanics** only (masks, axes, eases, scrub, stagger, dual-title a11y).  
**Not in scope:** ALTMistral, Mistral palette, logo, CMS SVGs (`bag.svg` / `robot.svg` / `earth.svg` from mistral.ai), copy, or shipping Mistral classnames as product API.

**Probe:** Chromium/Playwright, viewport **1440×900**, `https://mistral.ai/`, **2026-07-20**.  
**Engine on site:** GSAP **3.15.0** (`window.gsapVersions`; `_gsap` present).

**Identical means:** same transform axes, mask pattern, play-once vs scrub, stagger order, and dual-title SEO split — **not** pixel brand clone.

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

---

## Family B — Sticky hero scale + mission column

### Observed structure

| Piece                | Observation                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Hero host            | `mistral-section-hero-home` — `lg:min-h-[200dvh]` (probe: min-height **1800px** at 900px viewport) |
| Sticky shell         | `.js-sticky` — `sticky top-0`, `lg:min-h-dvh`                                                      |
| Right column content | `.js-right-top-content` — `origin-bottom-left`, `will-change-transform`                            |
| Mission lines        | `.js-right-top-content-sentence` — intentional `lg:text-nowrap` line blocks                        |

### Scroll-scrubbed section transform (probe map)

| scrollY | section scale (approx) | notes                                                        |
| ------- | ---------------------- | ------------------------------------------------------------ |
| 0       | **0.4664**             | `scale(0.4664)`                                              |
| 150     | **0.629**              | + translate                                                  |
| 300–800 | rising toward 1        | translateX positive, translateY negative                     |
| ≥900    | **1.0**                | then pure translate (e.g. `translate(258px, -63%)` at y=900) |

**Identical mechanics:** scrub `scale` from ~**0.47 → 1.0** with `transform-origin: bottom left` (or bottom of mission column) over a tall sticky hero (~**200dvh**). Ease for scrub: **`none`** (progress-driven).

Mission sentence lines may get small horizontal `translateX` offsets during the same scrub (optical alignment) — optional; secondary to scale.

**Reduced motion:** final scale **1**, no scrub.

---

## Family C — Scroll icon mask rise

### Observed DOM

```html
<div class="w-full justify-center gap-4 hidden lg:flex">
  <div class="flex overflow-hidden size-14">
    <!-- 56×56 -->
    <img class="block size-full js-right-top-content-icon" alt="" />
  </div>
  <!-- ×3 icons -->
</div>
```

Placement: **above** mission sentences inside `.js-right-top-content`. Desktop only (`hidden lg:flex`).

### Motion parameters

| Param          | Value                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| Mask           | parent `overflow: hidden` + fixed square **56px** (`size-14`)                                |
| Icon from      | `translateY(100%)` / `yPercent: 100` — fully below clip                                      |
| Icon to        | `translateY(0%)` / `yPercent: 0`                                                             |
| Coupling       | **scroll scrub** (not play-once)                                                             |
| Ease           | **`none`** while scrubbing                                                                   |
| Stagger        | sequential lag: first icon leads, third lags (same scrub window, different Y% at mid scroll) |
| Count          | **3** icons on reference                                                                     |
| Reduced motion | `yPercent: 0` immediately; no scrub                                                          |

### Probe samples (icon Y%)

| scrollY                               | icon0      | icon1  | icon2  | section scale     |
| ------------------------------------- | ---------- | ------ | ------ | ----------------- |
| 0–150                                 | 100%       | 100%   | 100%   | 0.47–0.63         |
| 900                                   | ~83%\*     | ~76%\* | ~67%\* | 1.0 (+ translate) |
| (earlier full rise windows ~300–1200) | decreasing | lag    | lag    | rising            |

\*At scrollY=900 icons may still be mid-rise depending on pin length; full **0%** is later in the sticky range. Implement with element-relative `ScrollTrigger` (`start`/`end` on host), not hard-coded px from this table.

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
- Shipping Mistral SVGs, ALTMistral, or `js-right-top-content-icon` as public API names

### QA checklist (mechanics)

- [ ] Family A: chars rise from `y:100%` under line mask; dual `h1` + decorative `aria-hidden`
- [ ] Family B: sticky column scale ~0.47→1 scrubbed over tall hero
- [ ] Family C: three icons, 56px masks, `yPercent` 100→0 scrub + stagger
- [ ] All families: reduced-motion final state
- [ ] Zero requests to mistral.ai for media

---

## When to load this skill

- Matching home marketing motion to Mistral **mechanics**
- Writing or reviewing GSAP timelines for dual-title, sticky scale, icon rise
- Updating `docs/spec-mistral-identical-home-motion.md`

For UI structure only (grids, rails), prefer `docs/spec-mistral-inspired-ui-skill.md` / editorial specs — not this file.
