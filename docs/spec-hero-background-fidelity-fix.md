# Spec: Kubo Hero Background Fidelity Fix

## Status

Proposed; implementation not applied.

## Date

July 30, 2026

## Goal

Make the Kubo home hero visually closer to the supplied Fluxion-like mosaic reference while keeping Kubo’s copy, theme tokens, accessibility semantics, and product identity. This spec covers the requested background, composition, spacing, title, and scroll-affordance corrections; it does not copy the reference logo, wording, typeface, or image.

The earlier measurement audit remains available in [spec-hero-reference-comparison.md](spec-hero-reference-comparison.md). This document narrows the next pass to the visual corrections requested after comparing the latest live implementation with the same source image.

## Evidence captured with Playwright

Reference source:

`https://pbs.twimg.com/media/HH912-UbAAAEL6M?format=jpg&name=4096x4096`

The reference asset is 4096×2913. The raw-image viewer was opened with Playwright at the following viewports:

| Capture                          |  Viewport | Rendered reference image                                                                 | Artifact                                                                                            |
| -------------------------------- | --------: | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Reference desktop                | 1908×1070 | x=202, y=0, 1504×1070; 202px gutters are viewer chrome, not artwork                      | [reference-hero-fix-audit-1908.png](../output/playwright/reference-hero-fix-audit-1908.png)         |
| Reference desktop                |  1440×900 | x=87.5, y=0, 1265×900                                                                    | [reference-hero-fix-audit-1440x900.png](../output/playwright/reference-hero-fix-audit-1440x900.png) |
| Reference raw-image mobile check |   390×844 | x=0, y=283.5, 390×277; this is the browser’s raw-image fit, not a responsive hero layout | [reference-hero-fix-audit-390x844.png](../output/playwright/reference-hero-fix-audit-390x844.png)   |

Kubo source inspected at `http://127.0.0.1:3333/`:

| Capture      |                          Viewport / CSS layout width | Measured hero       | Artifact                                                                                        |
| ------------ | ---------------------------------------------------: | ------------------- | ----------------------------------------------------------------------------------------------- |
| Kubo desktop | 1908×1070 / 1893px because of the vertical scrollbar | x=0, y=0, 1893×1070 | [current-hero-fix-audit-1908.png](../output/playwright/current-hero-fix-audit-1908.png)         |
| Kubo desktop |                                    1440×900 / 1425px | x=0, y=0, 1425×900  | [current-hero-fix-audit-1440x900.png](../output/playwright/current-hero-fix-audit-1440x900.png) |
| Kubo mobile  |                                      390×844 / 375px | x=0, y=0, 375×844   | [current-hero-fix-audit-390x844.png](../output/playwright/current-hero-fix-audit-390x844.png)   |

Canonical comparison captures:

![Fluxion-like reference at 1908×1070](../output/playwright/reference-hero-fix-audit-1908.png)

![Kubo current hero at 1908×1070](../output/playwright/current-hero-fix-audit-1908.png)

## Current implementation measurements

Measurements below are Playwright DOM boxes and computed styles from the latest live page. They describe the current implementation, not the desired final state.

### Desktop

| Element             | Kubo at 1908×1070                                                                   | Kubo at 1440×900                 |
| ------------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| Header              | x=0, y=0, 1893×49                                                                   | x=0, y=0, 1425×49                |
| Hero                | x=0, y=0, 1893×1070                                                                 | x=0, y=0, 1425×900               |
| Visible title       | x=96, y=630, 617.61×184                                                             | x=96, y=460, 617.61×184          |
| Title style         | Archivo, 92px, 500 weight, 92px line-height, −5.98px tracking                       | Same                             |
| Supporting copy     | x=96, y=838, 576×56; 20px / 28px, 400 weight                                        | x=96, y=668, 576×56; 20px / 28px |
| Primary CTA         | x=96, y=942, 200×56; 16px / 24px, 600 weight                                        | x=96, y=772, 200×56              |
| Bottom scroll arrow | x=936.5, y=1030, 20×20                                                              | x=702.5, y=860, 20×20            |
| Settled renderer    | `canvas[data-mosaic-ready="false"]`, intrinsic canvas 300×150; CSS fallback visible | Same fallback state              |

### Mobile

At 390×844, Playwright reports a 375px CSS layout width because the page still has a 15px vertical scrollbar:

| Element             | Current measurement                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Header              | x=0, y=0, 375×49                                                                                                          |
| Hero                | x=0, y=0, 375×844                                                                                                         |
| Visible title       | x=16, y=498.41, 268.53×81.59; 40px / 40.8px, 500 weight                                                                   |
| Supporting copy     | x=16, y=600, 343×84; 18px / 28px                                                                                          |
| Primary CTA         | x=16, y=724, 176×56; 14px / 20px                                                                                          |
| Bottom scroll arrow | x=177.5, y=804, 20×20                                                                                                     |
| Document width      | `scrollWidth=375` for this capture; final acceptance must verify no horizontal overflow after all page content is settled |

## Reference geometry to preserve

The reference artwork ratio is 4096/2913 ≈ 1.406. At the 1908×1070 capture, the artwork itself is 1504×1070, which resolves to approximately 52 columns × 37 rows:

- tile pitch: approximately 28.9px;
- visible fill: approximately 26px square;
- seam: approximately 2.6–3px, or 7–10% of pitch;
- rounded corner radius: approximately 4.5–5.2px, or 16–18% of pitch;
- cells are opaque rounded squares with a narrow dark seam;
- there is no circular halo, ring, bevel, or radial “button” at each square edge.

The reference text is raster-measured rather than DOM-measured. At 1908×1070 its approximate bounds are:

- title ink: x=268–1087, y=649–823, two lines;
- supporting copy ink: x=266–838, y=847–892, two lines;
- primary action: x=265–439, y=945–1007, approximately 174×62px.

Because the Kubo copy and typeface are different, these are composition targets, not literal text dimensions. Use the same lower-left optical rhythm and dark copy pocket.

## Requested corrections

### P0 — Remove the per-cell circular edge effect

**Current problem:** The live fallback reads as a fine graph-paper field. The Canvas path is not settled in Playwright, so the fallback’s blended gradients and repeated SVG tile are the visual source of truth. Any radial edge treatment or glow around individual cells makes the tile field look circular/soft instead of like rounded squares.

**Required change:**

- Paint each cell as one opaque rounded rectangle with a flat or quantized fill.
- Keep only a narrow dark seam between cells.
- Remove per-cell radial gradients, circular rings, bevels, and edge halos.
- Keep broad light variation in the cell fill and band field, never attached to the perimeter of each tile.

**Acceptance:** At 100% screenshot scale, every tile reads as a rounded square; no circular spot is visible at the corners or edges of individual cells.

### P0 — Increase the tile corner radius

**Current evidence:** `SEAM_RATIO=0.09` and `CORNER_RATIO=0.13` in `mosaic-hero-canvas.tsx:39-42` produce roughly 3.6–3.8px corner radii at a 28.9px pitch. The fallback SVG at `global.css:446-461` uses `rx=4` in a 32px source tile, which resolves to the same optical range.

**Required target:**

- Canvas corner ratio: 0.16–0.18 of pitch;
- fallback SVG `rx`: 5–6 units in the 32-unit source tile;
- seam remains 0.07–0.10 of pitch so the field does not become a solid honeycomb.

At the 1908×1070 reference geometry this means approximately 4.6–5.2px radius and a 26px fill inside a 28.9px pitch.

**Acceptance:** The cells have visibly softer corners than the current capture but remain square, not circular.

### P0 — Reverse and separate the luminous bands

**Current problem:** The settled Kubo screenshot exposes radial fallback gradients at `global.css:419-445`, not discrete directional bands. The intended Canvas paths at `mosaic-hero-canvas.tsx:194-216` are too close to the existing visual direction and are never visible while `data-mosaic-ready` remains false.

**Required direction:** The Kubo field must follow the reference’s dominant sweep: bands enter from the upper-right/right edge and bend down-left toward the lower-center/left, rather than rising from lower-left toward upper-right. Use explicit sampled curves in both Canvas and fallback representations.

Recommended normalized path envelope:

| Band           | Start         | Control / bend | End          | Role                                |
| -------------- | ------------- | -------------- | ------------ | ----------------------------------- |
| Primary        | (0.82, −0.08) | (0.62, 0.28)   | (0.38, 1.08) | broad `primary` ribbon              |
| Warm companion | (1.10, 0.02)  | (0.90, 0.38)   | (0.64, 1.08) | right-side `accent`/foreground core |
| Lower echo     | (0.14, 1.08)  | (0.42, 0.84)   | (0.72, 0.68) | weak secondary echo                 |

The exact curve may vary by breakpoint, but the direction and order must remain stable. Keep the copy pocket at the lower-left darker than the right half.

### P0 — Spread the bands instead of merging them into one glow

**Required target:**

- broad band widths: 0.11–0.15 of the shorter frame dimension;
- core widths: 0.035–0.05;
- at the vertical midpoint, preserve at least 0.12 normalized horizontal separation between the primary and warm core;
- keep the warmest cells in the right third and a weaker lower echo crossing the lower half;
- quantize color per cell so the bands look like tile-level lightning, not smooth blurred CSS gradients.

At 1908×1070 the right third should clearly carry more luminance than the left third, while the lower-left title zone remains quiet enough for foreground text. Use `--primary`, `--accent`, `--foreground`, `--muted`, and `--background`; do not introduce the reference’s cyan/red palette.

### P1 — Reduce inline padding around content over the artwork

**Current evidence:** The desktop content starts at x=96 because `hero-section.tsx:39-41` ends at `xl:px-24`. The reference composition uses roughly 64px from its artwork edge before the copy begins.

**Required target:**

- desktop hero content inline padding: 64px, with a range of 56–80px accepted;
- tablet: 32–48px;
- mobile: 16px;
- title, paragraph, and CTA share one left edge;
- do not add a second wrapper gutter around the same content.

Keep the header above the background, but do not allow the header’s layout wrapper to create a second hero inset. The full-bleed artwork remains x=0 and starts at y=0.

### P1 — Reduce title size and weight

**Current evidence:** The live title is Archivo 92px, 500 weight, 92px line-height at both 1908×1070 and 1440×900. It is visually heavier and wider than the reference’s lighter display treatment.

**Required target:**

- desktop size: 80–88px, with 84px as the initial tuning value;
- desktop weight: 400–500, preferring the lightest available Kubo display weight that remains legible;
- line-height: 0.98–1.04;
- tracking: do not compound `.ui-display`’s −0.065em with another aggressive negative tracking utility; start near −0.03em;
- mobile remains responsive near 40px, but must inherit the lighter weight and avoid clipping.

The title remains the accessible `h1` plus decorative `aria-hidden` visual title provided by `hero-display-title.tsx:42-71`.

### P1 — Remove the bottom-center scroll arrow

Remove the `ArrowDown` button at `hero-section.tsx:95-102`, including its reserved visual presence. The primary CTA remains the hero action. Do not remove keyboard focus styles or accessible labeling from other controls.

### P1 — Make the full-viewport layering explicit

The artwork must remain behind the fixed 49px header and fill the first viewport:

- desktop hero: x=0, y=0, width=`100vw`, height=`100svh`;
- 1440×900 target: 1440×900;
- 390×844 target: 390×844, with no horizontal overflow;
- header: y=0, height≈49px, z-index above the artwork;
- content top padding may protect text from the header, but must not move the artwork down.

The current `layout.tsx:5-10` reserves `pt-12`, while `hero-section.tsx:26-30` compensates with `-mt-12`. Simplify or document that relationship so the background does not acquire a 48px top gap at any breakpoint.

### P1 — Make Canvas/fallback parity observable

The current Playwright capture settled with `canvas[data-mosaic-ready="false"]`, intrinsic canvas 300×150, and the CSS fallback visible. Fix the mount/paint path or make the fallback production-quality enough to meet the same contract.

Required browser evidence after implementation:

- `canvas[data-mosaic-ready="true"]` has non-zero `width` and `height` after hydration, or an explicitly tested fallback mode is active;
- Canvas and fallback use the same pitch, seam, radius, band direction, and copy-safe veil;
- no screenshot settles on a smooth gradient plus thin grid lines;
- `prefers-reduced-motion: reduce` freezes a deterministic frame without removing the mosaic.

## Canonical source paths

- Hero composition, copy, CTA, and scroll control: `apps/web/src/app/(home)/_components/hero-section.tsx:25-103`
- Display title semantics: `apps/web/src/app/(home)/_components/hero-display-title.tsx:42-71`
- Canvas geometry and band paths: `apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx:39-42,171-216,298-350,383-458,466-601`
- CSS fallback, seams, bands, and veil: `apps/web/src/app/global.css:404-523`
- Full-page/header relationship: `apps/web/src/app/(home)/layout.tsx:5-10`
- Header stacking: `apps/web/src/components/site/site-header.tsx:251-257`

## Implementation order

1. Remove the bottom scroll arrow and reduce the desktop/mobile hero inline gutters.
2. Set the lighter title size/weight/tracking and verify the shared left edge for title, copy, and CTA.
3. Make the artwork full-bleed behind the header.
4. Replace per-cell halos with flat rounded-square fills; increase the corner radius and align fallback/Canvas pitch.
5. Reverse and spread the directional bands; preserve a dark lower-left copy pocket and Kubo token mapping.
6. Fix or explicitly validate Canvas hydration, then run the responsive and reduced-motion checks.

## Acceptance and Playwright checklist

- [ ] At 1908×1070, the artwork is 1908×1070 and visible behind the 49px header.
- [ ] At 1440×900, the artwork is 1440×900 with no top gap.
- [ ] At 390×844, the document has no horizontal overflow and the hero is 390×844.
- [ ] Desktop inline content begins between 56px and 80px from the viewport edge; mobile begins at 16px.
- [ ] Title is approximately 84px / 400–500 weight on desktop and visibly lighter/smaller than the current 92px / 500 capture.
- [ ] Title, supporting copy, and CTA share the same left edge.
- [ ] The bottom-center `ArrowDown` control is absent.
- [ ] Cells are rounded squares with a 16–18% corner ratio and 7–10% seam; no circular edge halo is visible.
- [ ] Bands sweep from upper-right to lower-left/lower-center, are visibly separated, and are stronger on the right half.
- [ ] Lower-left copy pocket remains dark enough for Kubo foreground text.
- [ ] Canvas is painted after hydration or the fallback visibly satisfies the same tile/band contract.
- [ ] Reduced motion freezes the field without removing it.
- [ ] Capture paths in this spec remain valid and are regenerated after implementation as `hero-fixed-*.png` artifacts.
