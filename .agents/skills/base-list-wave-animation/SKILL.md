---
name: base-list-wave-animation
description: Build an original yellow animated-list backdrop with the layered, right-weighted wave rhythm researched from Base's homepage CTA. Use when implementing or refining a marketing CTA/card that needs a continuous ambient list or bar animation behind content, especially when the request calls for a Base-like energy but explicitly requires different shapes, colors, copy, assets, and implementation.
---

# Yellow list-wave animation

Create a DOM/CSS animation of simple lists, never a Base asset, logo, copy, blue palette, video, or shader.

Read [the capture reference](references/base-capture.md) before implementing. It records the measured source structure, responsive geometry, visual layering, and capture limits. Inspect the two `assets/base-list-wave-static-*.png` captures only when a visual comparison is needed.

## Build contract

- Put semantic CTA content in a `position: relative; z-index: 1` layer. Keep decorative lists `aria-hidden="true"` and `pointer-events: none`.
- Make the backdrop a full-bleed, clipped layer with a left-to-right fade. Keep the copy legible by reserving the left 35–45% of the card for a solid background.
- Use 3–5 independent horizontal lists of rounded capsules or short rules. Vary each list's width, item count, vertical anchor, speed, and phase; do not create a single synchronized sine wave.
- Use an original yellow family: a dark warm base plus `#F4C430`, `#FFD84D`, `#FFE9A6`, and one restrained muted ochre. Do not use Base blue or its mixed-color palette.
- Move each list linearly in one direction, duplicate its items for a seamless wrap, and offset its `animation-delay` negatively. Prefer 14–26 s durations, 8–20 px vertical drift, and `linear` timing; the effect must read as ambient rather than an attention-grabbing loader.
- Keep all decorative movement below the text layer. Do not let it affect layout, capture pointer events, or flash beneath buttons.
- Respect `prefers-reduced-motion`: render a static, deliberately composed list arrangement and disable all infinite animation.

## Responsive baseline

Use the researched card as a spacing reference, not as a visual template:

- At `>= 768px`, start with 80 px vertical padding and 32 px inline padding inside a max-width 1200 px content frame.
- Below 768 px, use 80 px vertical and 24 px inline padding. Preserve a 48 px action height and let the action row wrap rather than collide with the decoration.
- Aim for a 326–333 px card height at these baselines. Let content grow the card if localization or accessibility settings require it.

## Validation

- Check desktop and 390 px wide mobile views for clipping, contrast, action accessibility, and a quiet left reading area.
- Verify the loop boundary by recording or watching at least two full cycles; no jump may be visible when a repeated list wraps.
- Test reduced motion, keyboard focus, and a 200% text zoom.
- Keep the implementation DOM/CSS-first. Introduce canvas/WebGL only if the requested visual cannot be expressed with simple lists and its performance cost is justified.
