# Spec: Identical Mistral motion grammar on Kubo home

## Status

Ready for implementation (docs-only research pass complete)

## Date

July 20, 2026

## Goal

Make home marketing **motion mechanics identical** to the researched Mistral grammar (masks, axes, scrub vs play-once, stagger, dual-title), using Kubo tokens/assets only.

**Skill (source of parameters):** [`.agents/skills/mistral-motion-grammar/SKILL.md`](../.agents/skills/mistral-motion-grammar/SKILL.md)

**Identical ≠ brand clone.** Forbidden: ALTMistral, Mistral palette/logo/copy/CMS SVGs.

**Probe:** Playwright 1440×900, `https://mistral.ai/`, 2026-07-20 (see skill tables).

---

## Change map

Each row: **surface → current → required identical outcome**. No “make it nicer.”

### 1. Hero dual-title (Family A)

|                  |                                                                                                                                                                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skill family** | A — dual-title masked char rise                                                                                                                                                                                                                                                         |
| **Paths**        | `apps/web/src/app/(home)/_components/hero-display-title.tsx`                                                                                                                                                                                                                            |
|                  | `apps/web/src/lib/motion/timelines/hero-display-intro.ts`                                                                                                                                                                                                                               |
|                  | `apps/web/src/lib/motion/split-display-text.ts`                                                                                                                                                                                                                                         |
|                  | `apps/web/src/lib/motion/eases.ts`                                                                                                                                                                                                                                                      |
|                  | `apps/web/src/app/(home)/_components/hero-section.tsx` (title props)                                                                                                                                                                                                                    |
| **Current**      | Dual title present (`h1.sr-only` + decorative `p`). Split + `y: 100%→0%`, duration **1s**, ease **`power4.inOut`**, charFactor **0.005**, line delay **0.7s**. `grow` default **false**.                                                                                                |
| **Required**     | Keep dual-title + mask + play-once. Match Family A numbers (already aligned). Set **`grow` default true only if product wants glyph-double/line-height grow** (Mistral host `data-grow="true"`); otherwise keep grow false but document as intentional delta. Reduced motion: no split. |
| **Do not**       | Scrub title to scroll; use ALTMistral or 96px brand type.                                                                                                                                                                                                                               |

### 2. Sticky hero scale + mission column (Family B)

|                  |                                                                                                                                                                                                                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skill family** | B — sticky scale scrub                                                                                                                                                                                                                                                                                                            |
| **Paths**        | `apps/web/src/app/(home)/_components/hero-section.tsx`                                                                                                                                                                                                                                                                            |
|                  | New: `apps/web/src/lib/motion/timelines/hero-sticky-scale.ts` (recommended)                                                                                                                                                                                                                                                       |
|                  | Optionally wrap mission cell in a client host component                                                                                                                                                                                                                                                                           |
| **Current**      | CSS grid 2×2, `min-h-[calc(100svh-3rem)]` only — **no** sticky pin, **no** scale scrub on mission/title column. Mission is static type.                                                                                                                                                                                           |
| **Required**     | Desktop (`lg+`): sticky hero shell with scroll height ≈ **`min-h-[200dvh]`** (or equivalent pin distance). Scrub mission (and/or right-top content group) **`scale` from ~0.47 → 1.0**, **`transform-origin: bottom left`**, ease **`none`**, scrubbed. At end of range, scale locks at 1. Reduced motion: scale 1, no pin scrub. |
| **Do not**       | Apply scale on mobile by default; animate layout width/height properties.                                                                                                                                                                                                                                                         |

### 3. Scroll-reveal icons (Family C)

|                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skill family** | C — icon mask rise                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Paths**        | `apps/web/src/app/(home)/_components/scroll-reveal-icons.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                      |
|                  | `apps/web/src/lib/motion/timelines/scroll-reveal-icons.ts`                                                                                                                                                                                                                                                                                                                                                                                                                         |
|                  | Wired in `hero-section.tsx` above mission                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Current**      | **Module defaults** (`playScrollRevealIcons` in `scroll-reveal-icons.ts`): start `"top 75%"`, end `"top 35%"`, scrub **0.45**, stagger **0.12**, `yPercent 100→0`, `ease: "none"`. **Hero wiring** (`scroll-reveal-icons.tsx` when `triggerRef` is the hero section): overrides to start **`"top top"`**, end **`"center top"`** (without `triggerRef`, self-trigger keeps 75%/35%). UI: 3 Lucide icons, `size-14` + `overflow-hidden`, desktop-only, CSS `translate-y-full` rest. |
| **Required**     | Mechanics match Family C core (mask + yPercent scrub). **Retune the hero-wired** `start`/`end` (today `top top` → `center top`) so the rise window tracks the **Family B sticky pin** once that ships (probe: icons mostly done by scrollY≈800 while scale finishes ~1000). Do not document only module defaults (75%/35%) as current when hero always passes `triggerRef`. Keep mask 56px, 3 icons, `ease: "none"`, reduced motion → visible.                                     |
| **Do not**       | Load Mistral CMS SVGs; remove overflow mask; opacity-only fade.                                                                                                                                                                                                                                                                                                                                                                                                                    |

### 4. Mission line editorial breaks (supporting text)

|                  |                                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skill family** | B (sentence blocks)                                                                                                                                                             |
| **Paths**        | `apps/web/src/app/(home)/_components/hero-section.tsx` (`mission` array + `lg:text-nowrap` spans)                                                                               |
| **Current**      | Intentional 3-line mission, `lg:text-nowrap`, bottom-aligned upper band.                                                                                                        |
| **Required**     | Keep line-block strategy. Optional: scrub small **translateX** per line only if Family B host is implemented and optical QA needs it — not a blocker if scale host ships first. |
| **Do not**       | Auto-reflow mission into paragraph on desktop.                                                                                                                                  |

### 5. CSS section enters (non-Mistral sticky)

|                  |                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skill family** | E / none                                                                                                                                                                                 |
| **Paths**        | `apps/web/src/app/global.css` (`.ui-enter`, 420ms, `translateY(14px)`)                                                                                                                   |
|                  | Any remaining `ui-enter` class usage on home                                                                                                                                             |
| **Current**      | One-shot opacity + 14px rise; not scrubbed.                                                                                                                                              |
| **Required**     | **No change required for Mistral identity.** Do not replace Family A/B/C with `.ui-enter`. Optionally remove `.ui-enter` from hero if still applied alongside GSAP (avoid double intro). |
| **Do not**       | Use `.ui-enter` as substitute for dual-title split.                                                                                                                                      |

### 6. Scroll cue arrows

|                  |                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| **Skill family** | E                                                                                                    |
| **Paths**        | `apps/web/src/app/(home)/_components/hero-rail-lower.tsx`                                            |
|                  | `apps/web/src/app/global.css` (`.animate-fading-arrow-scroll-*`)                                     |
| **Current**      | CSS loop opacity on three arrows.                                                                    |
| **Required**     | **Out of Mistral identical set** — leave unless product asks. Reduced motion already disables loops. |

### 7. SignalField

|                  |                                                                                  |
| ---------------- | -------------------------------------------------------------------------------- |
| **Skill family** | E                                                                                |
| **Paths**        | `apps/web/src/app/(home)/_components/signal-field.tsx` + global signal keyframes |
| **Current**      | Decorative pulse; reduced-motion static.                                         |
| **Required**     | **No Mistral parity requirement.** Keep non-interactive / aria-hidden.           |

### 8. Motion module registration

|              |                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| **Paths**    | `apps/web/src/lib/motion/index.ts`, `gsap-client.ts`, `use-gsap-context.ts`, `reduced-motion.ts`            |
| **Current**  | Exports hero intro + scroll icons; ScrollTrigger registered in icon timeline.                               |
| **Required** | Register ScrollTrigger once for Family B timeline; export sticky-scale helper; share reduced-motion helper. |

---

## Implementation order (when coding)

1. Confirm Family A eases/duration (audit only; likely no code).
2. Family B sticky + scale scrub on hero (largest gap vs Mistral).
3. Retune Family C ScrollTrigger to the sticky pin range.
4. Reduced-motion pass + 1440/768 visual QA.
5. `bun run check` + focused motion tests.

## Out of scope (this motion map)

- Install card / PM select / header height
- Community card join / footer height (separate specs)
- Product mosaic IA
- Charts / builder Motion One usage

---

## Verification (implementer)

| Check        | Pass                                                  |
| ------------ | ----------------------------------------------------- |
| Skill linked | This file links `mistral-motion-grammar` skill        |
| Family A     | Char mask rise play-once; dual title                  |
| Family B     | scale ~0.47→1 scrub on sticky hero desktop            |
| Family C     | yPercent 100→0 scrub + stagger in pin window          |
| Brand        | No Mistral assets/type/copy                           |
| A11y         | reduced-motion finals; decorative icons `aria-hidden` |

## Relationship

| Doc                                               | Role                                                       |
| ------------------------------------------------- | ---------------------------------------------------------- |
| `.agents/skills/mistral-motion-grammar/SKILL.md`  | Measurable grammar                                         |
| `.agents/skills/scroll-reveal-icons/SKILL.md`     | Subset of Family C; prefer consolidated skill for full set |
| `docs/spec-gsap-motion-system-and-hero-title.md`  | Earlier dual-title GSAP adoption                           |
| `docs/spec-home-community-footer-scroll-icons.md` | Icons + non-motion polish; retune range via this spec      |
