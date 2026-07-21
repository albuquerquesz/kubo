# Spec: Kubo home motion grammar (Mistral-researched)

## Status

**Implemented and verified — 2026-07-21.**

## Date

July 21, 2026

## Goal

Document the implemented home marketing **motion mechanics** that match the
researched Mistral grammar (masks, axes, scrub vs play-once, stagger,
dual-title), using Kubo tokens/assets only.

**Skill (source of parameters):** [`.agents/skills/kubo-motion-grammar/SKILL.md`](../.agents/skills/kubo-motion-grammar/SKILL.md)

**Identical ≠ brand clone.** Forbidden: ALTMistral, Mistral palette/logo/copy/CMS SVGs.

**Probe:** Playwright 1440×900, `https://mistral.ai/`, revalidated 2026-07-21
(see skill tables and `docs/.playwright-cli/probe-hero-parity.mjs`).

---

## Change map

Each row: **surface → current → required identical outcome**. No “make it nicer.”

### 1. Hero dual-title (Family A)

|                  |                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skill family** | A — dual-title masked char rise                                                                                                                                                          |
| **Paths**        | `apps/web/src/app/(home)/_components/hero-display-title.tsx`                                                                                                                             |
|                  | `apps/web/src/lib/motion/timelines/hero-display-intro.ts`                                                                                                                                |
|                  | `apps/web/src/lib/motion/split-display-text.ts`                                                                                                                                          |
|                  | `apps/web/src/lib/motion/eases.ts`                                                                                                                                                       |
|                  | `apps/web/src/app/(home)/_components/hero-section.tsx` (title props)                                                                                                                     |
| **Current**      | Dual title present (`h1.sr-only` + decorative `p`). Split + `y: 100%→0%`, duration **1s**, ease **`power4.inOut`**, charFactor **0.005**, line delay **0.7s**. `grow` default **false**. |
| **Delivered**    | Dual-title + mask + play-once match Family A numbers. Kubo keeps `grow` false as an intentional product delta; reduced motion does not split text.                                       |
| **Do not**       | Scrub title to scroll; use ALTMistral or 96px brand type.                                                                                                                                |

### 2. Sticky hero scale + mission column (Family B)

| Contract        | Implemented behavior                                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structure       | A `200dvh` desktop scroll track contains a viewport-height sticky shell; the mission host stays in flow inside the right-top card.                               |
| Host            | `scale: 0.4664 → 1`, co-scrubbed X/Y translation, and `transform-origin: bottom left`; the current curve is `power2.out` with ScrollTrigger scrub.               |
| End pose        | Destination translation is derived from host and sticky geometry on refresh, so `hostRect.center ≈ stickyRect.center`.                                           |
| Stage clear     | The title exits upward on the shared pin; late title and lower-rail fades leave the mission as the final focal point.                                            |
| Responsive/a11y | Desktop scrub only. Reduced motion is a readable scale-1 mission with title and icons visible.                                                                   |
| Never           | Do not use an empty absolute percentage-sized host, animate host layout to `100vw × 100vh`, or treat raw `translate(258px, -252px)` as a portable Kubo constant. |

The Mistral `translate(258px, -252px)` sample is valid for its right rail at
1440×900, but a different in-flow starting position can need negative X and
positive Y to land at the same visual center. The parity condition is painted
geometry, not matrix signs. Kubo's final live probe measured a host-center
delta below one pixel.

### 3. Scroll-reveal icons (Family C)

|                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skill family** | C — icon mask rise                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Paths**        | `apps/web/src/app/(home)/_components/scroll-reveal-icons.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|                  | `apps/web/src/lib/motion/timelines/scroll-reveal-icons.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|                  | Wired in `hero-section.tsx` above mission                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Current**      | **Module defaults** (`playScrollRevealIcons`): start `"top 75%"`, end `"top 35%"`, scrub **0.45**, stagger **0.12**, `yPercent 100→0`, `ease: "none"`. **Hero wiring** (when `triggerRef` is hero): pin window via `SCROLL_REVEAL_ICONS_HERO` / `HERO_STICKY_SCROLL` (start `"top top"`, end earlier than full scale — e.g. `"bottom 20%"`). Legacy docs mentioned `"center top"`; do not treat that as the pin-aligned end. UI: 3 Lucide icons, `size-14` + `overflow-hidden`, desktop-only. |
| **Delivered**    | Mask + yPercent scrub + stagger share the Family B sticky pin. Icons remain clipped through ~200px, settle by ~625–700 before scale locks, use 56px masks and `ease: "none"`, and are visible with reduced motion.                                                                                                                                                                                                                                                                            |
| **Do not**       | Load Mistral CMS SVGs; remove overflow mask; opacity-only fade; hard-code stale midpoints (e.g. ~55% at y=300 from old fixture).                                                                                                                                                                                                                                                                                                                                                              |

### 4. Mission line editorial breaks (supporting text)

|                  |                                                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skill family** | B (sentence blocks + per-line translateX)                                                                                                                 |
| **Paths**        | `apps/web/src/app/(home)/_components/hero-section.tsx` (`mission` array + `lg:text-nowrap` spans)                                                         |
| **Current**      | Intentional 3-line mission, `lg:text-nowrap`, bottom-aligned upper band.                                                                                  |
| **Delivered**    | The line-block strategy is retained. Outer lines scrub small **translateX** offsets (probe: line0 ~0→52px, line2 ~0→71px @900); the middle line stays ~0. |
| **Do not**       | Auto-reflow mission into paragraph on desktop.                                                                                                            |

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

|               |                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Paths**     | `apps/web/src/lib/motion/index.ts`, `gsap-client.ts`, `use-gsap-context.ts`, `reduced-motion.ts`                        |
| **Current**   | Exports hero intro + scroll icons; ScrollTrigger registered in icon timeline.                                           |
| **Delivered** | ScrollTrigger is registered for Family B, the sticky-scale helper is exported, and the reduced-motion helper is shared. |

---

## Implemented stage contract

The sticky shell, not the mission host, owns the full viewport. The mission
host grows from the right-top card into the centered visual stage; the title
exits on the same scrub; the lower rail is faded late so it cannot compete with
the end composition. The scrub is bidirectional, so scrolling back up restores
the card-scale rest state without a separate reverse timeline.

Mistral's measured end matrix (`translate(258px, -252px)`) is evidence of its
rail geometry, not a Kubo runtime constant. Kubo derives the end translation
from the unscaled host and sticky bounds. The browser acceptance condition is
`hostRect.center ≈ stickyRect.center`, not the sign of the transform matrix.

## Out of scope (this motion map)

- Install card / PM select / header height
- Community card join / footer height (separate specs)
- Product mosaic IA
- Charts / builder Motion One usage

---

## Verification

| Check        | Pass                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| Skill linked | This file links `kubo-motion-grammar` skill                                      |
| Family A     | Char mask rise play-once; dual title                                             |
| Family B     | Scale ~0.47→1 + translation; host center is within a few pixels of sticky center |
| Family B2    | Title exits the sticky composition; lower rail is secondary at pin end           |
| Family C     | yPercent 100→0 scrub + stagger; done before scale=1                              |
| Reverse      | Up-scroll restores the rest pose through the shared scrub                        |
| Brand        | No Mistral assets/type/copy or network media request                             |
| A11y         | Reduced-motion finals; decorative icons `aria-hidden`                            |

Run `node docs/.playwright-cli/probe-hero-parity.mjs` at 1440×900 alongside
the focused motion/documentation tests. The probe must pass sticky, host-center,
title, icon, dual-title, reverse, and no-Mistral-media checks.

## Relationship

| Doc                                               | Role                                                                    |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| `.agents/skills/kubo-motion-grammar/SKILL.md`     | Measurable grammar                                                      |
| `.agents/skills/scroll-reveal-icons/SKILL.md`     | Subset of Family C; prefer consolidated skill for full set              |
| `docs/spec-gsap-motion-system-and-hero-title.md`  | Earlier dual-title GSAP adoption                                        |
| `docs/spec-home-community-footer-scroll-icons.md` | Icons + non-motion polish; retune range via this spec                   |
| `docs/spec-hero-sticky-scale-screen-occupancy.md` | Historical occupancy measurements; superseded structurally by the remap |
