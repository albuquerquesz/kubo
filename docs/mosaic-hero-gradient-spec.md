# Mosaic hero gradient spec

Updated 2026-07-31 from the supplied Kubo hero and the Fluxion-like reference image.

## Intent

The hero keeps Kubo’s dark, gold-only palette and rounded-square raster field. A bronze leading arc and a warmer outer-right counter-arc progress toward the right as they descend, with a softer lower echo beneath the headline. The copy-safe left field remains matte and quiet; pale ivory cells are localized at two focal points instead of forming a full-height rail.

The reference image was used for structure only. No remote artwork, logo, wording, or reference-brand color is loaded at runtime.

## Measured implementation

| Property            | Desktop capture | Tablet capture | Mobile capture |
| ------------------- | --------------: | -------------: | -------------: |
| Viewport            |      1440 × 900 |      768 × 900 |      390 × 844 |
| Hero frame          |      1440 × 900 |      768 × 900 |      390 × 844 |
| Mosaic rows         |              37 |             37 |             37 |
| Mosaic columns      |              60 |             32 |             18 |
| Tile pitch          |        24.32 px |       24.32 px |       22.81 px |
| Canvas DPR cap      |             1.5 |            1.5 |            1.5 |
| Horizontal overflow |            none |           none |           none |

The Canvas fills the hero frame at every measured viewport.

## Geometry contract

- Grid: 37 rows, square cells, columns derived from `ceil(frameWidth / cell)`.
- Seam: 9% of pitch.
- Corner radius: 17% of pitch.
- Primary ribbon: normalized path `(0.47,-0.08) → (0.63,0.18) → (0.82,0.49) → (1.06,0.98)`.
- Warm ribbon: normalized path `(0.72,-0.02) → (0.90,0.28) → (1.03,0.58) → (1.18,1.06)`.
- Lower echo: `(0.08,1.12) → (0.32,0.78) → (0.68,0.56)`.
- Copy pocket: first 30–40% of the frame is darkened in the tile renderer; at ≤640px a stronger CSS veil extends the safe area to 76% of the frame.
- Pale-core focal points: primary near `(0.73,0.47)` and warm near `(0.90,0.57)`; broad ribbon bodies stay bronze/amber and resolve through Kubo tokens.

Both Canvas and the hydration-independent boot renderer use the same path geometry. The CSS fallback mirrors the direction with negative-angle bands.

## Validation screenshots

- [Before capture](../output/playwright/hero-before.png)
- [Restored baseline](../output/playwright/hero-restored-baseline-1440x900.png)
- [Desktop after](../output/playwright/hero-reference-aligned-1440x900.png)
- [Tablet after](../output/playwright/hero-reference-aligned-768x900.png)
- [Mobile after](../output/playwright/hero-reference-aligned-390x844.png)
- [Reduced-motion capture](../output/playwright/hero-reference-aligned-reduced-motion.png)

The Canvas is decorative (`aria-hidden`, `pointer-events-none`), resolves colors from Kubo CSS tokens, caps DPR, and returns to a deterministic phase when `prefers-reduced-motion: reduce` is active.

## Verification

```bash
bun test apps/web/test/hero-mosaic-background.test.ts
bun run check
```
