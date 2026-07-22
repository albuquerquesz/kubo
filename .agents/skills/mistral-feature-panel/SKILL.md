---
name: mistral-feature-panel
description: Build bordered product feature panels with Mistral-inspired spacing, media framing, and responsive Kubo styling. Use when recreating the reference section with a title row, description row, large visual asset, and tag rail.
---

# Mistral Feature Panel

Use this skill for editorial product panels inspired by the Mistral homepage while keeping the Kubo design system as the source of truth for colors, typography, borders, and links.

## Visual contract

- Outer panel: 1px `border-rule`, near-background surface, and 14–16px page inset where the surrounding layout calls for it.
- Header row: roughly 104px on desktop; 24px horizontal padding; display title around 42–48px with tight tracking; action aligned right.
- Description row: roughly 76px; 24px horizontal padding; body text around 20px.
- Media: 24px inset on desktop, full-width on small screens; use an aspect ratio near 1.9/1; preserve the supplied visual with `object-cover` only when cropping is intentional.
- Tag rail: compact monospace labels below the media, wrapping with 8px gaps.
- Keep structural borders quiet. Use the Kubo `border-rule`, `bg-background`, `text-foreground`, `text-muted-foreground`, `primary`, and `accent` tokens rather than hard-coded brand colors.

## Implementation workflow

1. Inspect the supplied asset dimensions before choosing `object-contain` or `object-cover`.
2. Build the section as a semantic `<section>` with an `aria-labelledby` heading.
3. Keep the header and description in normal flow; do not use absolute positioning for core content.
4. Use `next/image` with `fill` inside a positioned media frame, or a fixed `width`/`height` image when the source ratio should remain exact.
5. Make the action a real `Link` and provide visible focus styles.
6. At `max-width: 767px`, stack the action below the heading, reduce the media inset to 16px, and let tags wrap.
7. Validate the page in Playwright at desktop and mobile widths. Capture a screenshot in `output/playwright/` and verify no text overlaps the visual.

## Kubo adaptation rules

- Prefer Kubo copy and routes over copying Mistral product names or brand colors.
- Reuse the provided Kubo image as the visual centerpiece when requested; do not recreate it with CSS.
- Preserve the visual rhythm (header → description → media → tags), not third-party markup or assets.
- Respect `prefers-reduced-motion`; the panel should remain fully usable without animation.

## Reference

See [measurements.md](references/measurements.md) for the observed desktop/mobile measurements and the Playwright inspection checklist.
