# Base CTA capture

Captured from `https://www.base.org/` on 2026-07-21 with Playwright/Chrome. This reference describes the observed layout and rendering mechanics; it is not permission to reuse Base branding, copy, assets, or source.

## Artifacts

- `../assets/base-list-wave-static-desktop.png` — the CTA at a 1,830 px desktop viewport with JavaScript disabled, exposing the content and layer geometry.
- `../assets/base-list-wave-static-mobile.png` — the same CTA at a 390 px viewport with JavaScript disabled.

The animated artwork is a WebGL canvas. In unrestricted live capture it saturated the headless renderer; the measurements below were taken with a throttled `requestAnimationFrame`. The canvas stayed at opacity `0` while its video/shader readiness was incomplete, so no exact per-particle trajectory, duration, or easing is claimed.

## Observed structure

```text
section[aria-label="Call to action"]  position: relative; overflow: hidden
├─ absolute background, z-index: 0
│  ├─ full-size blue wrapper
│  ├─ WebGL canvas host, overflow: hidden, opacity transition 0.4s ease-in-out
│  └─ pointer-events:none gradient: solid base → transparent, left to right
└─ content, position: relative; z-index: 10
   └─ max-width 1200 px CTA content and actions
```

The page renders a `<canvas>` with no authored size attributes. Its host is full-card, has `pointer-events: auto`, and the gradient above it has `pointer-events: none`. For an original list version, reverse that interaction model: the decoration should be `pointer-events: none` throughout.

## Measured geometry

| Viewport    | Card                | Content padding                                       | Title         | Actions               |
| ----------- | ------------------- | ----------------------------------------------------- | ------------- | --------------------- |
| 1,830 × 900 | 1,830 × 332.8125 px | 32 px inline, 80 px block; max content width 1,200 px | 28 px / 36 px | 48 px high; 12 px gap |
| 1,200 × 700 | 1,200 × 332.8125 px | 32 px inline, 80 px block                             | 28 px / 36 px | 48 px high; 12 px gap |
| 390 × 844   | 390 × 326 px        | 24 px inline, 80 px block                             | 24 px / 32 px | 48 px high; 12 px gap |

At 1,830 px, the content frame begins at x=315 and is 1,200 px wide. At 1,200 px it fills the viewport after 32 px side padding (1,136 px inner width). On mobile, two compact actions fit from x=24 to x=351.78 with a 12 px gap.

## Layer behavior

- Card background: solid `#0000FF` in the source.
- Left mask: `linear-gradient(to right, #0000FF 30%, transparent 70%)`.
- Artwork host: `opacity: 0` initially; `transition: opacity 0.4s ease-in-out`.
- The content layer is `z-index: 10`; the visual backdrop is `z-index: 0`.
- The active page's documented CSS animations did not describe this artwork; it is rendered inside the canvas. Treat its visible moving vertical dashes/capsules as an aesthetic observation, not a recoverable CSS keyframe specification.

## Original adaptation: lists instead of shader dashes

Preserve only the compositional grammar: a dense moving field toward the right edge, sparse left side, and an opaque-to-transparent mask protecting the text. Replace the source's vertical colored marks with simple yellow list rows:

```text
left/readable                     right/animated
solid warm background ─────────── mask begins ───── flowing capsule lists
heading + actions                 low visual density  high visual density
```

Build the list field with duplicated DOM items and independent CSS transforms. This is lighter, inspectable, keyboard-safe, and reliable in reduced-motion environments.
