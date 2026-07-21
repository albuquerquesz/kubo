---
name: scroll-reveal-icons
description: >
  Implement scroll-scrubbed icons that rise from a bottom overflow mask
  (Mistral home grammar). Use when building marketing scroll reveals,
  mission-adjacent icon rows, or “icons coming from under the text” motion.
  GSAP + overflow-hidden masks. Never copy Mistral assets or brand.
---

# Scroll-reveal icons (masked rise)

## When to use

- Marketing / product home sections where icons should **surface on scroll** next to a statement.
- User asks for “icons from under the text”, “Mistral-style icon reveal”, or scroll-linked icon rise.
- Kubo / Better T Stack home mission rail or similar editorial columns.

## When not to use

- Critical UI that must be visible without scrolling.
- Replacing text meaning with icons only.
- Copying Mistral SVGs, classnames as brand, or ALTMistral typography.

## Research source (grammar only)

Playwright + Chromium inspection of `https://mistral.ai/` (1440×900, 2026-07-20).

### Observed DOM pattern

```html
<div class="… hidden lg:flex gap-4">
  <div class="flex overflow-hidden size-14">
    <img class="block size-full …" src="…" alt="" />
  </div>
  <!-- repeated per icon -->
</div>
```

Placement on Mistral: **above** mission sentence lines in the right sticky hero column (`.js-right-top-content`). Desktop only.

### Observed motion

| Property          | Start (scrub)                                              | End (scrub)                           |
| ----------------- | ---------------------------------------------------------- | ------------------------------------- |
| Icon `translateY` | `100%` (below mask)                                        | `0%` (fully in view)                  |
| Wrapper           | `overflow-hidden` + fixed square (56px)                    | unchanged                             |
| Engine            | GSAP updates inline `transform` / `translate3d`            |                                       |
| Stagger           | First icon leads; later icons lag on same scrub range      |                                       |
| Parent (host)     | Family B host: **scale ~0.47→1 + translate** on sticky pin | Icons sit **inside** that scaled host |

Sample scrub progression at 1440×900 (live revalidation 2026-07-20 — **shape**, not hard pixels):

| scrollY | bag Y%  | robot Y% | earth Y% | notes               |
| ------- | ------- | -------- | -------- | ------------------- |
| 0–200   | 100     | 100      | 100      | fully clipped       |
| ~225    | &lt;100 | 100      | 100      | first leaves rest   |
| 300     | ~36     | ~49      | ~65      | mid-rise + stagger  |
| 450     | ~5      | ~8       | ~12      | near in             |
| 600     | ~0.2    | ~0.4     | ~0.8     | residual            |
| ≥800    | 0       | 0        | 0        | done before scale=1 |

Host scale still rises after icons settle (scale locks ~875–900). Prefer pin-relative `ScrollTrigger` so icons finish **before** Family B scale locks. Full grammar (scale+translate host): `.agents/skills/kubo-motion-grammar/SKILL.md`.

## Implementation recipe (Kubo)

### Stack

- GSAP 3 + ScrollTrigger (register once in client motion module).
- Prefer `apps/web/src/lib/motion` helpers + `@gsap/react` context cleanup.
- Original icons: Lucide or first-party assets under `public/assets` — **never** hotlink `mistral.ai` CMS media.

### Structure

```tsx
<div className="hidden gap-4 lg:flex" aria-hidden>
  {icons.map((Icon, i) => (
    <div key={i} className="flex size-14 overflow-hidden">
      <span ref={/* collect */} className="block size-full will-change-transform">
        <Icon className="size-full" />
      </span>
    </div>
  ))}
</div>
```

### GSAP sketch

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function playScrollRevealIcons(opts: {
  icons: HTMLElement[];
  trigger: HTMLElement;
  reducedMotion: boolean;
}) {
  if (opts.reducedMotion) {
    gsap.set(opts.icons, { yPercent: 0 });
    return;
  }

  gsap.set(opts.icons, { yPercent: 100 });

  gsap.to(opts.icons, {
    yPercent: 0,
    ease: "none",
    stagger: 0.12,
    scrollTrigger: {
      trigger: opts.trigger,
      start: "top 75%",
      end: "top 35%",
      scrub: 0.45,
    },
  });
}
```

### Rules

1. **Mask is mandatory** — without `overflow-hidden` on a fixed box, the effect is just a slide.
2. **`yPercent: 100 → 0`** is the core grammar (not opacity-only).
3. **Stagger** icons (0.08–0.15) so they don’t pop as one slab.
4. **`scrub`** preferred for “tied to scroll” feel; one-shot `toggleActions` is a weaker substitute.
5. **`prefers-reduced-motion: reduce`** → final state, no scrub.
6. **Desktop-first** (`hidden lg:flex`) unless product asks for mobile.
7. **Decorative only** — row `aria-hidden`; never sole carrier of meaning.
8. **Brand-safe** — Kubo gold/cream tokens; no Mistral orange palette or assets.

### Placement guidance (home)

- Prefer the **hero mission column** (upper-right band), icons **above** mission lines.
- Do not put inside the install script card.
- Keep clear of header fixed bar and soft-rule grid collisions.

### QA checklist

- [ ] Icons invisible / clipped at start of scrub range
- [ ] Fully visible at end of scrub range
- [ ] Stagger readable at 1440
- [ ] No layout shift; masks stay square
- [ ] Reduced motion: icons already visible
- [ ] No network requests to mistral.ai for media

## Anti-patterns

- Fading opacity without a mask (loses “from under the text” read).
- Animating `top` / `margin` (layout thrash).
- Shipping reference site class names as product API (`js-right-top-content-icon`) without renaming.
- Cloning Mistral’s full sticky scale hero when only the icon rise was requested.

## Related repo docs

- [`docs/spec-home-community-footer-scroll-icons.md`](../../../docs/spec-home-community-footer-scroll-icons.md) — product implementation scope
- [`docs/spec-gsap-motion-system-and-hero-title.md`](../../../docs/spec-gsap-motion-system-and-hero-title.md) — GSAP standard
- [`docs/spec-mistral-inspired-ui-skill.md`](../../../docs/spec-mistral-inspired-ui-skill.md) — broader UI grammar (non-motion)
