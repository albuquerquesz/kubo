# Spec: yellow mosaic density and tile geometry for the Kubo hero

Status: proposed
Owner: Web / marketing home
Date: 2026-07-30
Scope: background renderer and its visual contract; preserve Kubo copy, controls, tokens, accessibility, and product identity.

## Objective

Tune the Kubo home hero so its background borrows the supplied reference's raster character while remaining unmistakably Kubo:

- keep a full-bleed field of rounded square tiles;
- replace large dead-black gaps with a quiet, continuous range of Kubo yellow/olive tones;
- keep the left copy pocket dark enough for the headline, without turning the rest of the frame into black voids;
- make every tile a rounded square with a narrow seam, never a circle, ring, radial edge halo, or glossy bevel;
- keep the reference's broad curved lightning rhythm, but express it through `--primary`, `--accent`, `--foreground`, `--card`, `--muted`, and `--background` only;
- make Canvas and the CSS fallback agree on cell size, radius, seam, palette, and band placement.

This is a visual implementation spec, not permission to copy the reference's logo, words, typeface, image, or brand colors. The earlier broad composition audit remains in [spec-hero-reference-comparison.md](spec-hero-reference-comparison.md), and the previous fix plan remains in [spec-hero-background-fidelity-fix.md](spec-hero-background-fidelity-fix.md).

## Evidence captured with Playwright

The reference was opened directly in a real browser at:

`https://pbs.twimg.com/media/HH912-UbAAAEL6M?format=jpg&name=4096x4096`

The Kubo page was opened at `http://127.0.0.1:3333/`. Captures were made with the Playwright CLI wrapper at 1908×1070, 1440×900, and 390×844. Screenshot paths below are repository-relative and should remain stable for review.

| Subject              |  Viewport | Browser measurement                                                                                             | Evidence                                                                                                  |
| -------------------- | --------: | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Reference            | 1908×1070 | natural image 4096×2913; rendered image x=202, y=0, 1504×1070; body gutter `rgb(14 14 14)`                      | [reference-hero-yellow-audit-1908.png](../output/playwright/reference-hero-yellow-audit-1908.png)         |
| Reference            |  1440×900 | rendered image x=87.5, y=0, 1265×900                                                                            | [reference-hero-yellow-audit-1440x900.png](../output/playwright/reference-hero-yellow-audit-1440x900.png) |
| Reference raw image  |   390×844 | image fits x=0, y≈283.5, 390×277; this is an image-page fit, not a responsive hero requirement                  | [reference-hero-yellow-audit-390x844.png](../output/playwright/reference-hero-yellow-audit-390x844.png)   |
| Kubo                 | 1908×1070 | hero x=0, y=0, 1893×1070; title x=64, y=646, 552.98×168; copy x=64, y=838, 576×56; CTA x=64, y=942, 200×56      | [current-hero-yellow-audit-1908.png](../output/playwright/current-hero-yellow-audit-1908.png)             |
| Kubo                 |  1440×900 | hero x=0, y=0, 1425×900; title x=64, y=476.97, 549.78×167.03; copy x=64, y=668, 576×56; CTA x=64, y=772, 200×56 | [current-hero-yellow-audit-1440x900.png](../output/playwright/current-hero-yellow-audit-1440x900.png)     |
| Kubo                 |   390×844 | hero x=0, y=0, 375×844; title x=16, y=498.41, 263.33×81.59; copy x=16, y=600, 343×84; CTA x=16, y=724, 176×56   | [current-hero-yellow-audit-390x844.png](../output/playwright/current-hero-yellow-audit-390x844.png)       |
| Tile-shape reference |   132×124 | supplied close-up shows square tiles, 2–3px seams, and visibly rounded but non-circular corners                 | [reference-yellow-tile-shape.png](../output/playwright/reference-yellow-tile-shape.png)                   |

![Reference background captured with Playwright](../output/playwright/reference-hero-yellow-audit-1908.png)

![Current Kubo hero captured with Playwright](../output/playwright/current-hero-yellow-audit-1908.png)

![Supplied tile-shape close-up](../output/playwright/reference-yellow-tile-shape.png)

### Current browser state

At all three Kubo viewports the settled DOM exposed:

- `canvas.mosaic-hero-canvas[data-mosaic-ready="false"]`;
- intrinsic Canvas dimensions `300×150`, despite the CSS canvas rect matching the hero (`1893×1070`, `1425×900`, or `375×844`);
- `.mosaic-hero-fallback` as the visible artwork;
- Kubo tokens resolved as `--background: #11110d`, `--card: #181814`, `--muted: #222118`, `--primary: #c49314`, `--accent: #d6a72b`, `--foreground: #f2ede0`;
- no horizontal overflow in the measured mobile state (`scrollWidth=375`, `innerWidth=390`).

The console noise in the development capture was repeated Next HMR WebSocket handshake errors. Treat that as tooling noise, but do not accept a silent Canvas failure as the visual contract: either the Canvas must paint after hydration or the fallback must satisfy the same contract on its own.

## Visual diagnosis

### What the supplied reference is doing

The reference image has an artwork ratio of approximately 1.406:1 and a regular field of roughly 52 columns × 37 rows at the desktop capture. At the 1908×1070 capture, the artwork itself is 1504px wide, so the tile pitch is approximately 28.9px. The close-up confirms:

- the fill occupies most of each pitch;
- seams are dark and narrow, approximately 7–10% of pitch;
- corner radius is approximately 16–18% of pitch;
- each fill is broadly colored, not shaded with a radial highlight toward its edge;
- color varies cell by cell across a continuous yellow/olive range;
- the field remains legible between the lightning bands instead of collapsing into pure black holes.

The reference still has a dark copy-safe zone. “Avoid black spaces” means remove unintended empty regions in the artwork, not remove all negative space behind the Kubo copy.

### What the current Kubo capture is doing

The current screenshot has the correct broad page structure and a good text hierarchy, but the fallback makes the field too binary: a few yellow ribbons are bright while much of the rest is crushed toward `--background`. Combined with the dark veil, this produces large contiguous black-looking areas that are visually different from the reference's quiet olive tile bed.

The implementation also has two renderer risks:

1. Canvas does not report readiness after hydration, so the intended per-cell palette and curved paths are not visible in the settled capture.
2. The CSS fallback uses one gradient stack plus a repeated SVG mask. It can reproduce the silhouette, but it cannot by itself create enough deterministic cell-level yellow variation unless the gradient field is quantized or the Canvas path is fixed.

## Requirements

### 1. Tile geometry: rounded squares, never circles

Use one opaque rounded rectangle per cell in Canvas and the same geometry in the fallback.

| Parameter            | Target at a 32px pitch |                 Acceptable range | Notes                         |
| -------------------- | ---------------------: | -------------------------------: | ----------------------------- |
| pitch                |                   32px | derived from frame height / rows | keep cells square             |
| seam                 |                  2.5px |                2.2–3.2px / 7–10% | seam reveals the dark base    |
| tile fill            |                 29.5px |                        28.8–30px | do not leave oversized holes  |
| corner radius        |                  5.4px |                 4.8–6px / 15–19% | corners remain visibly square |
| corner radius / fill |                    18% |                           15–21% | never approach 50%            |

Implementation rules:

- Keep `SEAM_RATIO` around `0.08–0.10` and `CORNER_RATIO` around `0.16–0.18` in `mosaic-hero-canvas.tsx`.
- Do not use a radial gradient, inner ring, bright edge, or per-cell shadow to fake the corners.
- Do not allow a CSS mask or fallback tile to use `rx` large enough to read as a pill/circle.
- The center and edge of a tile may differ slightly because of the broad field and final veil, but the tile itself must be one flat quantized fill.
- The grid must reach all four hero edges; there is no rounded-card crop around the artwork.

### 2. Yellow/olive palette density: no unintended black voids

Use the runtime tokens already read by `readThemeColors()`; the values below are only fallback anchors:

| Role            | Token                               | Approximate anchor | Use                              |
| --------------- | ----------------------------------- | ------------------ | -------------------------------- |
| quietest tile   | `--background`                      | `#11110d`          | seams, edge crush, copy veil     |
| quiet tile      | `--card`                            | `#181814`          | base cell bed                    |
| grid lift       | `--muted`                           | `#222118`          | visible but restrained low field |
| deep olive-gold | `mix(background, primary, .20–.35)` | `#2c2912–#4b3d17`  | quiet cells outside bands        |
| mid gold        | `mix(card, primary, .35–.60)`       | `#55431a–#85651d`  | broad band shoulders             |
| warm yellow     | `mix(primary, accent, .35–.70)`     | `#c09923–#cf9f2b`  | band body and variation          |
| pale hot cell   | `mix(accent, foreground, .55–.85)`  | `#ddc47b–#eadfb0`  | sparse cores only                |

Acceptance rules for density:

- The right 60–70% of the desktop hero must show a continuous field of distinguishable tile fills; no unintentional black rectangle may span more than approximately 5 columns × 4 rows between bands.
- In quiet regions, cells may be dark, but adjacent fills must differ enough to reveal the grid at 100% zoom. Use deterministic per-cell variation before the final veil.
- Preserve a darker left copy pocket across approximately the first 28–34% of the frame. It should read as dark olive/charcoal tiles, not as a blank unpainted layer.
- Keep the brightest cells sparse. The goal is more tonal yellow coverage, not a uniformly bright gold screen.
- Do not introduce cyan, blue, red, magenta, or reference-brand hex values. Separate the two lightning ribbons using yellow hue, luminance, opacity, curvature, and core temperature.
- The final veil may suppress luminance for text contrast, but it must not erase the tile bed underneath the headline and paragraph.

Recommended cell-color sequence:

```text
base = mix(background, card, 0.28…0.48 + deterministicNoise)
base = mix(base, muted, 0.06…0.16)
base = mix(base, broadBandColor, broadIntensity)
base = mix(base, warmOrPrimaryCore, coreIntensity)
base = quantize(base, 8…12 RGB units per channel)
base = applyVignetteAndCopyVeil(base)
```

The broad field must be applied before the final veil. Do not darken every non-band cell to `background` as a substitute for contrast.

### 3. Lightning direction and spacing

The reference reads as broad curved ribbons entering from the upper/right area, bending diagonally through the middle/right, and exiting toward the lower area. The Kubo adaptation should remain gold-only and retain the current reverse-sweep intent without creating a single merged eye-shaped bridge.

Use normalized paths so they survive resizing:

```text
primary:  p0=(0.92, 1.06), p1=(0.58, 0.52), p2=(0.34, -0.06)
warm:     p0=(1.12, 0.88), p1=(0.86, 0.42), p2=(0.62, -0.04)
lowerEcho:p0=(0.78, 1.10), p1=(0.52, 0.92), p2=(0.22, 0.78)
```

Tune from these anchors rather than hardcoding viewport pixels:

- broad widths: `0.11–0.15` normalized frame width;
- core widths: `0.035–0.05`;
- keep at least `0.12` normalized separation between the two main centerlines around mid-height;
- use the primary ribbon for deeper amber/olive-gold and the companion ribbon for warmer, lighter yellow;
- use the lower echo at no more than roughly 35% of the primary band's opacity;
- keep the top-left haze below the visual weight of either main ribbon;
- avoid any circular hotspot whose radius is comparable to a band width.

### 4. Renderer parity and first paint

In `mosaic-hero-canvas.tsx`:

- keep the height-driven square grid (`rows≈37` on desktop, responsive reduction only when necessary);
- derive `cell`, `seam`, `radius`, `columns`, and origin from the actual hero rect;
- after the first paint, set `data-mosaic-ready="true"`, non-zero intrinsic Canvas dimensions, `data-mosaic-columns`, `data-mosaic-rows`, and `--mosaic-pitch`;
- if the browser cannot paint Canvas, keep the fallback visible and make it satisfy the same density/geometry requirements rather than showing a smooth gradient plus sparse islands;
- keep the seed deterministic for screenshots and reduce motion to a fixed phase under `prefers-reduced-motion: reduce`;
- never fetch the reference image at runtime.

In `global.css`:

- keep the fallback's rounded mask aligned with Canvas's seam and radius;
- replace the current overly crushed gradient mix with a fuller base tile field and broader, lower-contrast yellow bands;
- keep the copy veil separate from the artwork so contrast can be tuned without changing tile geometry;
- avoid relying on `background-blend-mode: screen` alone to make cells visible; the fallback must have sufficient opaque tile tone before blending.

### 5. UI contract: preserve the current foreground

The requested change is a background correction. Keep the existing Kubo UI unless visual verification exposes a regression:

- hero remains full-bleed at x=0, y=0 with `min-height: 100svh`;
- desktop content uses a shared x=64px left edge in the current implementation; do not reintroduce a centered content block;
- desktop title remains approximately 84px, weight 400, 84px line-height, with the current two-line break;
- mobile title remains 40px / 40.8px, weight 400, x=16px;
- supporting copy remains 20px / 28px desktop and 18px / 28px mobile;
- CTA remains 200×56 desktop and 176×56 mobile, using Kubo primary gold;
- preserve the accessible semantic `h1` and the decorative `aria-hidden` visual title;
- preserve keyboard focus styles and the `/new` CTA;
- do not add the reference navigation, logo, or wording.

## Codebase map

| Area                        | Canonical source                                                                                                       | Current evidence / required work                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Grid constants and geometry | [`mosaic-hero-canvas.tsx`](<../apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx#L39-L44>) and `#L169-L190`   | `SEAM_RATIO=0.09`, `CORNER_RATIO=0.17`; keep the rounded-square contract and validate derived pitch.                                |
| Band paths                  | [`mosaic-hero-canvas.tsx`](<../apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx#L192-L274>)                  | Existing normalized paths are the starting direction; tune width, separation, and tonal roles.                                      |
| Per-cell palette            | [`mosaic-hero-canvas.tsx`](<../apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx#L276-L333>)                  | Current base/veil combination is too dark outside ribbons; increase quiet yellow/olive variation while retaining the copy pocket.   |
| Canvas paint and readiness  | [`mosaic-hero-canvas.tsx`](<../apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx#L363-L440>) and `#L448-L601` | Playwright currently sees `data-mosaic-ready=false`, intrinsic `300×150`; fix or make fallback equivalent.                          |
| CSS fallback mask and bands | [`global.css`](../apps/web/src/app/global.css#L404-L501)                                                               | Current SVG mask is close geometrically; revise the color field so large black gaps disappear without flattening the hierarchy.     |
| Copy veil                   | [`global.css`](../apps/web/src/app/global.css#L507-L534)                                                               | Keep separate from cells; do not use it to hide a missing base field.                                                               |
| Foreground geometry         | [`hero-section.tsx`](<../apps/web/src/app/(home)/_components/hero-section.tsx#L17-L85>)                                | Current Playwright measurements are the no-regression baseline recorded above.                                                      |
| Title semantics             | [`hero-display-title.tsx`](<../apps/web/src/app/(home)/_components/hero-display-title.tsx#L27-L71>)                    | Keep the hidden semantic h1 and visible decorative title.                                                                           |
| Header/layout offset        | [`layout.tsx`](<../apps/web/src/app/(home)/layout.tsx#L5-L10>)                                                         | The `pt-12` / hero `-mt-12` relationship keeps artwork behind the fixed header; preserve or simplify without introducing a top gap. |
| Focused tests               | [`hero-mosaic-background.test.ts`](../apps/web/test/hero-mosaic-background.test.ts)                                    | Extend assertions only if implementation changes the renderer contract; keep tests deterministic.                                   |

## Implementation sequence

1. Fix or explain the Canvas mount/paint path and capture `data-mosaic-ready="true"` with non-zero dimensions.
2. Make Canvas's quiet base a visible range of Kubo yellow/olive cells before adding the veil.
3. Tune the two main normalized paths for spacing and right-side energy; keep the lower echo weaker.
4. Align CSS fallback mask, pitch, radius, and color density with the Canvas renderer.
5. Run the viewport and reduced-motion checks below, then regenerate the three current Kubo screenshots under the same filenames.

## Playwright acceptance checks

Run the browser capture at 1440×900, 768px width, and 390×844. Also retain the 1908×1070 evidence for the wide composition.

At each viewport verify:

- [ ] `hero.getBoundingClientRect()` is full-bleed, starts at y=0, and is at least the viewport height.
- [ ] `canvas[data-mosaic-ready="true"]` exists with intrinsic dimensions matching the CSS rect, or the tested fallback mode is explicitly reported.
- [ ] Canvas/fallback pitch is derived from hero height and cells remain square.
- [ ] Tile corners read as rounded squares at 100% zoom; no circle, ring, or radial edge halo is visible.
- [ ] Seams are dark and narrow, roughly 7–10% of pitch.
- [ ] The right half has continuous yellow/olive tile variation instead of large black holes.
- [ ] The first 28–34% remains the darkest copy-safe zone, but still shows a faint tile bed.
- [ ] Main bands remain separated and do not form a circular bridge behind the title.
- [ ] No cyan, blue, red, magenta, or remote reference image appears in computed styles, requests, or source.
- [ ] Title, supporting copy, CTA, focus states, and accessible name remain unchanged.
- [ ] `document.documentElement.scrollWidth <= innerWidth` at 390px.

With `prefers-reduced-motion: reduce`:

- [ ] the same yellow mosaic remains visible;
- [ ] the field is deterministic between two settled screenshots;
- [ ] no time-based tile drift runs;
- [ ] no layout shift occurs while the renderer mounts.

## Definition of done

- [ ] The three supplied visual references are linked from the spec and stored in `output/playwright/`.
- [ ] The right/middle field no longer reads as large black empty areas.
- [ ] The tile close-up matches the supplied 132×124 geometry: square cells, narrow seams, rounded—not circular—corners.
- [ ] Kubo token colors remain authoritative and the result is yellow/olive rather than a copy of the reference palette.
- [ ] Canvas and fallback produce the same geometry and visual density.
- [ ] Playwright checks pass at desktop, tablet, mobile, and reduced motion.
- [ ] Only the requested documentation/artifacts change in this task; product implementation remains pending until explicitly requested.
