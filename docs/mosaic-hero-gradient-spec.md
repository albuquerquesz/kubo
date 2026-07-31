# Mosaic hero gradient spec

Updated 2026-07-31 from the supplied Kubo hero and the Fluxion-like reference image.

## Intent

The hero keeps Kubo’s dark, gold-only palette and rounded-square raster field, but reverses the motion of both luminous ribbons: each path enters from above and progresses toward the right as it descends. The copy-safe left field remains matte and quiet; the strongest overlap and hot cells stay on the right.

The reference image was used for structure only. No remote artwork, logo, wording, or reference-brand color is loaded at runtime.

## Measured implementation

| Property            | Desktop capture | Tablet capture |        Mobile capture |
| ------------------- | --------------: | -------------: | --------------------: |
| Viewport            |     1908 × 1070 |      768 × 900 |             390 × 844 |
| Layout width        |         1893 px |         753 px |                375 px |
| Hero height         |         1070 px |         900 px |                844 px |
| Mosaic rows         |              37 |             37 |                    37 |
| Mosaic columns      |              66 |             31 |                    16 |
| Tile pitch          |        28.92 px |       24.32 px | `height / 37`-derived |
| Canvas DPR cap      |             1.5 |            1.5 |                   1.5 |
| Horizontal overflow |            none |           none |                  none |

The 15px difference between viewport and layout width is the browser scrollbar, not hero padding. The canvas fills the hero layout box.

## Geometry contract

- Grid: 37 rows, square cells, columns derived from `ceil(frameWidth / cell)`.
- Seam: 9% of pitch.
- Corner radius: 17% of pitch.
- Primary ribbon: normalized path `(0.43,-0.08) → (0.62,0.18) → (0.86,0.48) → (1.08,0.98)`.
- Warm ribbon: normalized path `(0.71,-0.02) → (0.90,0.28) → (1.04,0.58) → (1.18,1.06)`.
- Lower echo: `(0.08,1.12) → (0.32,0.78) → (0.68,0.56)`.
- Copy pocket: first 30–40% of the frame is darkened in the tile renderer; at ≤640px a stronger CSS veil extends the safe area to 76% of the frame.

Both Canvas and the hydration-independent boot renderer use the same path geometry. The CSS fallback mirrors the direction with negative-angle bands.

## Validation screenshots

- [Before capture](../output/playwright/hero-before.png)
- [Desktop after](../output/playwright/hero-after-desktop.png)
- [Tablet after](../output/playwright/hero-after-tablet.png)
- [Mobile after](../output/playwright/hero-after-mobile.png)
- [Reduced-motion capture](../output/playwright/hero-after-reduced-motion.png)

The Canvas is decorative (`aria-hidden`, `pointer-events-none`), resolves colors from Kubo CSS tokens, caps DPR, and returns to a deterministic phase when `prefers-reduced-motion: reduce` is active.

## Verification

```bash
bun test apps/web/test/hero-mosaic-background.test.ts
bun run check
```
