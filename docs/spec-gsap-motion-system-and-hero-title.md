# Spec: GSAP Motion System + Hero Dual-Title

## Status

Ready for implementation

## Date

July 20, 2026

## Goal

1. Standardize **authored product and marketing animation** in `apps/web` on **GSAP**.
2. Implement the home hero **dual-title pattern**: a visually hidden semantic `h1` for SEO/accessibility and a decorative animated title for display.
3. Phase out ad-hoc CSS keyframe enters and new `motion` (Motion One) usage for marketing surfaces, without blocking the hero on a full charts rewrite.

This continues `spec-home-editorial-system.md`. It is original Kubo / Better T Stack work: **do not** ship Mistral’s typeface (ALTMistral), palette, wordmark, copy, or assets.

## Research evidence

Playwright inspection of `https://mistral.ai/` on July 20, 2026 (viewport 1440 and responsive probes):

| Concern        | Observed on Mistral (reference only)                                                               | Kubo target                                                 |
| -------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Semantic title | `<h1 class="hidden">Frontier AI. In your hands.</h1>`                                              | SEO `h1` with `sr-only`                                     |
| Visual title   | `<p class="text-display font-mistral … js-title" aria-hidden="true">`                              | Decorative `p` / display layer, `aria-hidden`               |
| Host           | Custom element `mistral-atom-text-hero-title` with `data-autoplay`, `data-randomness`, `data-grow` | React client component with equivalent props                |
| Engine         | GSAP **3.15** + SplitText (`lines, words, chars`)                                                  | GSAP 3 + split helper (GSAP SplitText or internal splitter) |
| Char motion    | `y: 100%` → `0%` (or `-50%` when glyph duplicated), `power4.inOut`, duration `1`                   | Same **grammar**; calmer defaults (grow off)                |
| Line motion    | Masks `overflow-hidden`; optional height grow from `0`                                             | Optional via `grow` prop                                    |
| Typography     | ALTMistral Medium 500, desktop `6rem` / lh `1`, tracking `−0.02em`                                 | Keep **Archivo** (`.ui-display`) and existing clamp sizes   |

Related prior research: `spec-home-editorial-system.md`, `spec-mistral-inspired-ui-skill.md`.

---

## Current state (repo)

| Surface          | Path                                                                   | Motion today                                        |
| ---------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| Home hero title  | `apps/web/src/app/(home)/_components/hero-section.tsx`                 | Single visible `<h1 class="ui-display ui-enter …">` |
| CSS enter        | `apps/web/src/app/global.css` (`.ui-enter`, `@keyframes ui-enter`)     | Opacity + `translateY(14px)`, 420 ms                |
| Marketing / misc | Home `FeatureCard`, `code-container`, stack builder, `shimmering-text` | `motion/react`                                      |
| Charts           | `apps/web/src/components/charts/**`                                    | Heavy `motion/react`                                |
| UI primitives    | Dialog, select, tooltip, etc.                                          | `tw-animate-css` / Base UI data-open animations     |
| GSAP             | —                                                                      | **Not installed**                                   |

Display type (keep):

```css
.ui-display {
  font-family: var(--font-archivo);
  font-weight: 600;
  letter-spacing: -0.065em;
}
```

Hero size remains `text-[clamp(3.5rem,8vw,8.5rem)] leading-[0.9]` (desktop editorial contract). Do not hard-code Mistral’s `6rem`.

---

## Scope

### In scope

| Area                | Work                                                         |
| ------------------- | ------------------------------------------------------------ |
| Motion policy       | GSAP as default for authored page/marketing animation        |
| Shared foundation   | `apps/web/src/lib/motion/**`                                 |
| Dependencies        | `gsap`, `@gsap/react` in `apps/web`                          |
| Hero dual-title     | SEO `h1` + animated decorative title                         |
| Hero intro timeline | Split + masked char rise; reduced-motion path                |
| Deprecation rules   | No new marketing `motion` / prefer GSAP over new `.ui-enter` |
| Phased migration    | Home → builder/misc → charts                                 |

### Out of scope (this program unless a later phase opens it)

- Copying Mistral font files, exact timings as brand identity, or custom element names.
- Forcing GSAP into Base UI open/close micro-interactions (`tw-animate-css` stays).
- Rewriting all charts in the same PR as the hero.
- Changing featured rail, mission lines, header, or routes.
- Applying dual-title SEO pattern to every `h2` on the page (pattern may be reused later).

---

# Part A — GSAP motion system

## A.1 Engine policy

| Layer                                                                              | Allowed engine                                  | Notes                                          |
| ---------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------- |
| Authored marketing / page motion (hero, section reveals, rails, decorative fields) | **GSAP only**                                   | Shared eases + timelines                       |
| **New** feature motion in `apps/web` outside charts                                | **GSAP only**                                   | Prefer `lib/motion` helpers over leaf one-offs |
| UI primitive chrome (dialog, select, tooltip, dropdown)                            | CSS / `tw-animate-css` / Base UI                | Do not GSAP every popup                        |
| Charts (`components/charts/**`)                                                    | **Phased** migration to GSAP                    | May keep `motion` until Phase 5                |
| Spinners / skeletons                                                               | CSS utilities (`animate-spin`, `animate-pulse`) | Allowed                                        |

**Hard rule after Phase 1 lands:** do not add new `from "motion/react"` imports outside `components/charts/**` unless Phase 5 is waived in writing.

## A.2 Dependencies

```text
apps/web:
  gsap
  @gsap/react
```

- Use the current GSAP 3 free/standard license path documented at install time.
- **Split text**
  - Prefer GSAP **SplitText** when the install path is clear and legal for this project.
  - **Fallback:** a small internal splitter in `split-display-text.ts` that produces the same DOM contract (line / word / char spans) and a `revert()` that restores original HTML.
- Do not add a second marketing animation library (e.g. anime.js, another full Motion stack) after GSAP is the standard.

## A.3 Module layout

```text
apps/web/src/lib/motion/
  gsap-client.ts           # client-only registerPlugin once
  eases.ts                 # project ease name constants
  reduced-motion.ts        # prefers-reduced-motion helpers
  use-gsap-context.ts      # thin useGSAP wrapper + conventions
  split-display-text.ts    # split + revert contract
  timelines/
    hero-display-intro.ts  # reusable hero intro recipe
```

Optional later:

```text
  timelines/
    section-reveal.ts      # shared section enter for home modules
```

## A.4 Engineering contracts

1. **Client-only** — Import GSAP only from `"use client"` modules (or dynamic client boundaries). Never run GSAP during RSC/SSR render of static HTML.
2. **Cleanup** — Every timeline/tween created in React must be killed/reverted on unmount (`useGSAP` context, `context.revert()`, or explicit `timeline.kill()` + split revert).
3. **Reduced motion** — If `prefers-reduced-motion: reduce`, skip intro timelines; show final visual state immediately; still render SEO `h1` + static decorative title.
4. **Transform-first** — Prefer `transform` and `opacity`. Line-mask `height` is allowed only for intentional grow. Do not animate page-frame grid tracks, rule borders, or layout that reflows the whole page.
5. **Content without JS** — Semantic heading text and the decorative title’s final copy must exist in the HTML before hydration. Animation enhances; it must not be the only source of the phrase.
6. **SEO** — Crawlers and the accessibility tree must see the real heading via the `h1`. The decorative layer may start with reduced opacity until play.
7. **Bundle discipline** — Register plugins once. Do not load ScrollTrigger (or other plugins) on routes that never use them.
8. **Brand** — Motion explains state; it does not become the product. Keep the editorial system’s “one visual signal at a time” rule.

## A.5 Default tokens (eases & timing)

Inspired by research; **not** a pixel-perfect clone mandate.

| Token                | Value                | Use                        |
| -------------------- | -------------------- | -------------------------- |
| `ease.standard`      | `power4.inOut`       | Hero char rise, line grow  |
| `ease.exit`          | `power4.out`         | Leave / dismiss            |
| `duration.intro`     | `1`                  | Char travel (seconds)      |
| `duration.lineGrow`  | `1.3`                | Line mask open when `grow` |
| `stagger.line`       | `0.7`                | Delay between lines        |
| `stagger.charFactor` | `0.005 * randomness` | Base for per-char jitter   |

Centralize in `eases.ts` / timeline factories so product surfaces do not invent conflicting eases.

## A.6 React usage pattern

```ts
// Conceptual — implement in use-gsap-context + leaf components
"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

useGSAP(
  () => {
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline();
    // …tweens
    return () => {
      tl.kill();
    };
  },
  {
    scope: rootRef,
    dependencies: [
      /* props that rebuild timeline */
    ],
  },
);
```

---

# Part B — Hero dual-title + intro

## B.1 Current → target

### Before

```tsx
<h1 className="ui-display ui-enter text-[clamp(3.5rem,8vw,8.5rem)] leading-[0.9]">
  One command.
  <br />
  <span className="text-primary">Every layer.</span>
  <br />
  Yours.
</h1>
```

### After (DOM contract)

```tsx
<div className="relative max-w-5xl">
  <h1 className="sr-only">One command. Every layer. Yours.</h1>
  <p
    className="ui-display js-hero-title text-[clamp(3.5rem,8vw,8.5rem)] leading-[0.9]"
    aria-hidden="true"
  >
    One command.
    <br />
    <span className="text-primary">Every layer.</span>
    <br />
    Yours.
  </p>
</div>
```

| Element           | Role                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| `h1.sr-only`      | Single hero heading for SEO + screen readers; plain text, no decorative spans required |
| `p.js-hero-title` | Visual display only; `aria-hidden="true"`; holds emphasis markup and animation target  |
| Wrapper           | Positions both; no extra interactive chrome                                            |

### Rules

1. **Exactly one** `h1` in the home hero (the `sr-only` node). The decorative node is **not** a heading.
2. Hide the SEO title with **`sr-only`** (project already uses this utility). Prefer not `display: none` alone as the long-term pattern.
3. Decorative layer keeps existing visual classes (`ui-display`, clamp, `text-primary` span).
4. Copy stays Kubo: **One command. Every layer. Yours.** unless product rewrites later.
5. On animation complete, **revert** the split so the decorative DOM returns to clean text/`br`/emphasis nodes (no permanent char span soup).
6. Remove **`.ui-enter`** from the hero title once GSAP intro ships (legacy CSS enter must not double-animate).

## B.2 Component API

**File:** `apps/web/src/app/(home)/_components/hero-display-title.tsx` (`"use client"`)

```ts
type HeroDisplayTitleProps = {
  /** Full plain string for the SEO h1 (no JSX). */
  title: string;
  /** Visual lines; may include emphasis nodes and <br />. */
  children: React.ReactNode;
  className?: string;
  /** Play when mounted / visible. Default true. */
  autoplay?: boolean;
  /** Char stagger jitter multiplier. Default 1. */
  randomness?: number;
  /**
   * Optional Mistral-style line height grow + selective glyph doubling.
   * Default false — Kubo ships the clean masked rise only.
   */
  grow?: boolean;
};
```

**Consumer** (`hero-section.tsx` may stay a server component):

```tsx
<HeroDisplayTitle
  title="One command. Every layer. Yours."
  className="text-[clamp(3.5rem,8vw,8.5rem)] leading-[0.9]"
>
  One command.
  <br />
  <span className="text-primary">Every layer.</span>
  <br />
  Yours.
</HeroDisplayTitle>
```

## B.3 Animation recipe (`hero-display-intro`)

### Split DOM contract (during animation)

```text
p.js-hero-title
└── span.line.overflow-hidden …     // one per visual line
    └── span.word …
        └── span.char …             // transform target
```

Class names may be BEM-free utilities; keep them stable for the timeline factory.

### Sequence

1. If `prefers-reduced-motion: reduce` → ensure decorative title is fully visible; do not split/animate.
2. Else split decorative root into lines, words, chars.
3. Each line: `overflow: hidden` (mask).
4. If `grow`: set line heights and optional translate compensation; duplicate selected glyphs (research technique: indices `% 5` / `% 8`, skip descenders `y/p/q`) and tween those chars to `y: -50%`; else chars end at `y: 0%`.
5. Timeline (paused until play):
   - `onStart`: remove initial hide class if used (`opacity-0`).
   - Per line: `fromTo(chars, { y: "100%" }, { y: endY, stagger, duration: 1, ease: power4.inOut }, lineIndex * 0.7 * 1.05)`.
   - If `grow`: parallel `from(lines, { height: 0, duration: 1.3, ease: power4.inOut, stagger: 0.7 }, 0)`.
   - `onComplete`: `split.revert()`; clear temporary height props on host if any.
6. `autoplay` (default true): play when in view (IntersectionObserver) or immediately if already visible on mount.

### Default hero configuration

| Prop         | Default | Reason                                               |
| ------------ | ------- | ---------------------------------------------------- |
| `autoplay`   | `true`  | First viewport statement                             |
| `randomness` | `1`     | Mild organic stagger                                 |
| `grow`       | `false` | Restrained editorial; grow remains documented opt-in |

## B.4 Accessibility & SEO acceptance

- [ ] Accessibility tree exposes one heading level 1 with text equivalent to “One command. Every layer. Yours.”
- [ ] Decorative title is `aria-hidden="true"` and is not announced as a second heading.
- [ ] Keyboard users are unaffected (title is not focusable chrome).
- [ ] With JS disabled or before hydration, `h1` text is still in the document.
- [ ] Reduced motion: no char/line tween; title visible without waiting for timeline.

## B.5 Visual acceptance

- [ ] 1440 / 768 / 390: clamp sizes match pre-change hero scale (no accidental 6rem lock).
- [ ] Gold emphasis on “Every layer.” preserved after revert.
- [ ] Intro plays once per mount (no infinite loop).
- [ ] No double fade from leftover `.ui-enter`.

---

# Part C — Migration phases

| Phase                  | Scope                                                                                                                      | Exit criteria                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **0 — Spec**           | This document                                                                                                              | Merged under `docs/`                                            |
| **1 — Foundation**     | Install `gsap` + `@gsap/react`; add `lib/motion/*` (eases, reduced-motion, client register, useGSAP wrapper, split helper) | `bun run check`                                                 |
| **2 — Hero**           | `HeroDisplayTitle` + intro timeline; wire `hero-section.tsx`; drop hero `.ui-enter`                                        | Visual QA; SEO h1; reduced-motion static                        |
| **3 — Home marketing** | Replace `motion` / CSS enters in `apps/web/src/app/(home)/_components` (e.g. `FeatureCard`, `code-container`)              | `rg 'motion/react' apps/web/src/app/(home)/_components` → empty |
| **4 — Builder / misc** | `new/_components/stack-builder`, `shimmering-text`: migrate or document exception                                          | Decision recorded in PR                                         |
| **5 — Charts**         | `components/charts/**` off `motion`                                                                                        | Separate PR series; remove `motion` dependency when unused      |

### Deprecations

| Artifact                            | Status after Phase 2+                                       |
| ----------------------------------- | ----------------------------------------------------------- |
| `.ui-enter` / `@keyframes ui-enter` | **Legacy** — do not use on new sections; remove when unused |
| New `motion/react` outside charts   | **Forbidden** until Phase 5 complete or waived              |
| `tw-animate-css` on primitives      | **Keep**                                                    |

### SignalField note

`spec-home-editorial-system.md` allows CSS grid or canvas for decorative fields. New **timeline-driven** decorative motion should use GSAP (Phase 3+). Pure CSS ambient loops that respect reduced-motion remain acceptable for low-complexity fields.

---

# Part D — Implementation order (code)

1. Phase 1 — foundation modules + dependencies.
2. Phase 2 — hero dual-title + intro.
3. `bun run check` + visual pass at 1440 / 768 / 390.
4. Phase 3+ as separate PRs.

### Suggested commits

```text
docs(web): add GSAP motion system and hero dual-title spec
feat(web): add shared GSAP motion foundation
feat(web): hero dual-title with GSAP display intro
refactor(web): migrate home marketing motion to GSAP
```

---

# Part E — Files checklist

| File                                                         | Action                                      |
| ------------------------------------------------------------ | ------------------------------------------- |
| `docs/spec-gsap-motion-system-and-hero-title.md`             | This document                               |
| `docs/spec-home-editorial-system.md`                         | Cross-link motion/hero dual-title           |
| `apps/web/package.json`                                      | Add `gsap`, `@gsap/react` (Phase 1)         |
| `apps/web/src/lib/motion/*`                                  | Create (Phase 1)                            |
| `apps/web/src/app/(home)/_components/hero-display-title.tsx` | Create (Phase 2)                            |
| `apps/web/src/app/(home)/_components/hero-section.tsx`       | Wire dual-title (Phase 2)                   |
| `apps/web/src/app/global.css`                                | Leave `.ui-enter` until unused; then delete |
| Home marketing components                                    | Phase 3                                     |
| `components/charts/**`                                       | Phase 5                                     |

---

# Part F — Verification plan

1. **A11y:** inspect home heading outline → single `h1` with full title string.
2. **Visual:** play intro at 1440; confirm mask rise and final emphasis color.
3. **Reduced motion:** OS/browser setting → static title, no char stagger.
4. **Grep (Phase 2):** hero no longer uses `ui-enter`.
5. **Grep (Phase 3):** no `motion/react` under `(home)/_components`.
6. **`bun run check`** after each phase.

---

## Acceptance criteria (roll-up)

- [ ] Spec merged; editorial system links here for GSAP + dual-title.
- [ ] GSAP is the documented standard for authored marketing/page motion.
- [ ] Foundation modules and deps defined (Phase 1).
- [ ] Hero uses `sr-only` `h1` + `aria-hidden` decorative title (Phase 2).
- [ ] Intro uses GSAP split/mask rise; `grow` default false; reduced-motion safe.
- [ ] Split reverted after complete.
- [ ] Migration phases 3–5 documented; charts not a hero blocker.
- [ ] No new marketing `motion/react` after foundation lands.
- [ ] Brand-safe: Archivo/tokens/copy; no Mistral typeface or assets.

## Relationship to prior specs

| Spec                                  | Relationship                                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `spec-home-editorial-system.md`       | Motion principle (“explains state”) remains; this spec names **GSAP** as the engine and dual-title hero structure |
| `spec-mistral-inspired-ui-skill.md`   | Interaction grammar only; this spec is the concrete web implementation contract                                   |
| `spec-mistral-hero-featured-rail.md`  | Right rail unchanged; left title structure updates only                                                           |
| `spec-kubo-home-ui-polish-batch-*.md` | Layout polish; no conflict                                                                                        |

When this ships, prefer not reintroducing page-level CSS keyframe enters or a second JS animation stack for marketing modules.
