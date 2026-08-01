# Mosaic hero gradient spec

Updated 2026-07-31 from the supplied Kubo hero and the Fluxion-like reference image.

## Intent

The hero keeps Kubo’s dark, gold-only palette and rounded-square raster field. Six parallel gold lightning columns (bronze leading + mid + amber + gold + copper + warmer outer) descend gently toward the right (shallower Δx ≈ 0.28) in a frame-centered pack (starts ~0.28–0.73) with ~0.09 nx spacing and hairline rails; there is no counter-direction lower-echo rail. The copy-safe left field remains matte and quiet; pale ivory cells are localized at six focal points instead of forming a full-height rail.

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
- Corner radius: 22% of pitch.
- Primary column: normalized path `(0.28,-0.10) → (0.36,0.22) → (0.45,0.55) → (0.56,1.02)`.
- Mid column: normalized path `(0.37,-0.09) → (0.45,0.23) → (0.54,0.56) → (0.65,1.03)` (parallel offset ~0.09 nx).
- Amber column: normalized path `(0.46,-0.085) → (0.54,0.235) → (0.63,0.565) → (0.74,1.035)` (parallel offset ~0.09 nx).
- Gold column: normalized path `(0.55,-0.082) → (0.63,0.238) → (0.72,0.568) → (0.83,1.038)` (parallel offset ~0.09 nx).
- Copper column: normalized path `(0.64,-0.081) → (0.72,0.24) → (0.81,0.57) → (0.92,1.039)` (parallel offset ~0.09 nx).
- Warm column: normalized path `(0.73,-0.08) → (0.81,0.24) → (0.90,0.57) → (1.01,1.04)` (parallel offset ~0.09 nx).
- Band widths: primary `0.034` / mid `0.032` / amber `0.031` / gold `0.03` / copper `0.029` / warm `0.028` (hairline frame-centered rails).
- No lower-echo / opposite-direction lightning.
- Copy pocket: first 30–40% of the frame is darkened in the tile renderer; at ≤640px a stronger CSS veil extends the safe area to 76% of the frame.
- Pale-core focal points: primary near `(0.41,0.48)`, mid near `(0.50,0.49)`, amber near `(0.59,0.50)`, gold near `(0.68,0.50)`, copper near `(0.77,0.50)`, and warm near `(0.86,0.50)`; broad ribbon bodies stay bronze/amber and resolve through Kubo tokens.

Both Canvas and the hydration-independent boot renderer use the same path geometry. The CSS fallback mirrors the shallower right-descent with six negative-angle bands (`-14deg`, `-18deg`, `-22deg`, `-26deg`, `-30deg`, `-34deg`).

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
