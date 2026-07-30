# Spec: Reference Hero Comparison and Fix Plan

## Status

Fixes applied (July 30, 2026). Re-verify with `output/playwright/hero-fixed-*.png` and `current-hero-1440x900.png`.

## Date

July 30, 2026

## Goal

Bring the Kubo home hero closer to the supplied Fluxion-like reference while keeping Kubo copy, tokens, accessibility, and product controls. The target is the reference’s composition and raster atmosphere—not its logo, wording, typeface, or brand identity.

## Evidence

The reference was opened directly with Playwright:

`https://pbs.twimg.com/media/HH912-UbAAAEL6M?format=jpg&name=4096x4096`

The inspected reference asset is 4096×2913. At the Playwright viewport of 1908×1070, the image rendered at x=202, y=0, width=1504, height=1070; the 202px side gutters belong to the image viewer, not the hero artwork.

Kubo was inspected at `http://127.0.0.1:3333/` at 1908×1070, 1440×900, and 390×844. Captures:

- [Reference capture](../output/playwright/hero-reference.png)
- [Kubo at 1908×1070](../output/playwright/current-hero-1908.png)
- [Kubo at 1440×900](../output/playwright/current-hero-1440x900.png)

Canonical implementation sources:

- `apps/web/src/app/(home)/_components/hero-section.tsx:28-79`
- `apps/web/src/app/(home)/layout.tsx:5-10`
- `apps/web/src/components/site/site-header.tsx:251-257`
- `apps/web/src/app/(home)/_components/hero-display-title.tsx:61-71`
- `apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx:366-601`
- `apps/web/src/app/global.css:404-520`

Reference text measurements are raster ink bounds, not DOM boxes. Font-size estimates are medium-confidence; positions and button dimensions are higher-confidence. Measurements can move by roughly 2–6px because of antialiasing, descenders, and bright mosaic cells behind the text.

## Measured comparison

| Element                | Reference at 1908×1070                                                                                  | Current Kubo at 1908×1070                                                                                                       | Assessment                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Artwork / hero frame   | Artwork x=202–1706, y=0–1070; nav overlays the artwork                                                  | Hero x=0–1893, y=48–1070; fixed header consumes the top 49px                                                                    | Current artwork starts too low and is not behind the header                                                    |
| Header/nav band        | Effective band y=25–72, about 47px; content sits over the art                                           | Fixed header height 49px, y=0–49px                                                                                              | Height is close; layering and navigation distribution differ                                                   |
| Headline               | Ink x=268–1087, y=649–823; two lines; estimated 86–90px serif-equivalent, 90–92px line advance          | Box x=569.7–1338.3, y=311–508; Archivo 112px, 600 weight, 98.56px line-height, −7.28px tracking                                 | Current is centered, about 338px too high, and optically heavier/larger                                        |
| 1440×900 desktop check | Same lower-left composition; artwork remains full-height under nav                                      | Hero x=0–1425, y=48–900, h=852; title x≈374, y≈236, 100.8px / 88.7px                                                            | The mismatch is present at the project’s canonical 1440px desktop width, not only at the wider capture         |
| Supporting copy        | Ink x=266–838, y=847–892; estimated 23–25px with about 28px line-height                                 | Box x=674–1218, y=544–609; Archivo 20px with 32.5px line-height                                                                 | Current is centered, too low relative to its headline, and uses a looser rhythm                                |
| Primary action         | x=265–439, y=945–1007; 174×62px compact button                                                          | Installer card x=682–1226, y=653–799; 544×146px                                                                                 | Current utility card dominates the conversion area and is not the same CTA shape                               |
| Background grid        | About 52×37 rounded cells; about 29px pitch in the captured artwork, narrow seams                       | Canvas intends 52×37, but the CSS fallback uses a fixed 22px SVG tile and the live capture exposed only `.mosaic-hero-fallback` | Current fallback reads as fine graph paper rather than chunky rounded cells                                    |
| Luminance distribution | Reference left third mean grayscale ≈0.111; right third ≈0.279; right-third pixels above luma 80 ≈30.9% | Kubo left third ≈0.066; right third ≈0.116; right-third pixels above luma 80 ≈0.31%                                             | Current right-side energy is materially too weak                                                               |
| Mobile frame           | No mobile reference supplied                                                                            | At 390×844: header 49px, hero x=0–375, y=48–844, headline 44px / 39.6px; document scrollWidth=503px                             | Hero itself fits, but the page has unrelated downstream horizontal overflow that must be fixed before sign-off |

## Prioritized errors and fixes

### P0 — Rebuild the desktop composition around the lower-left copy zone

**Error:** `hero-section.tsx:36-37` uses `items-center justify-center text-center`. At 1908px the headline begins around x=570, y=311, while the reference begins around x=268, y=649. The current copy occupies the visual center and sits over the field’s quiet center instead of using the lower-left negative space.

**Fix:** On desktop, make the hero content a left-aligned block anchored near the bottom-left of the full-bleed artwork. Keep the reference’s content rhythm:

- headline left edge: approximately 64–96px inside the artwork frame;
- headline top: approximately 60–64% of the viewport height;
- paragraph top: approximately 24px after headline ink bottom;
- CTA top: approximately 53px after paragraph ink bottom;
- CTA bottom: approximately 60–70px above the viewport bottom.

Use a responsive grid or flex alignment, not absolute positioning for the text itself. Absolute positioning is acceptable for the decorative field and the scroll affordance.

**Acceptance:** At 1908×1070, Kubo copy begins between x=260 and x=330, the headline top is between y=620 and y=680, and the copy is visibly left-aligned. The brightest field cells do not sit beneath the headline.

### P1 — Let the artwork run behind the header

**Error:** The home layout reserves `pt-12` before the hero, and the hero also uses `min-h-[calc(100svh-3rem)]`. The current hero begins at y=48 and has height 1022px at 1908×1070 (852px at 1440×900). The reference artwork occupies the complete viewport from y=0; its navigation is painted over the artwork.

**Fix:** Make the hero artwork a full-viewport layer (`min-height: 100svh`) and keep the fixed header above it. Either place the hero at the document top with header overlay, or offset only the readable content—not the artwork—below the header. Preserve the 49px header height if it remains the Kubo standard.

**Acceptance:** The mosaic is visible behind the header from y=0, the hero still fills the first viewport, and no copy is hidden beneath the header.

### P1 — Match the headline’s optical scale without copying the source typeface

**Error:** The current display title inherits `.ui-display` weight 600 and −0.065em tracking, then applies 112px at the 1908px viewport. The reference is a lighter, high-contrast display treatment with approximately 86–90px font-size-equivalent and 90–92px line advance.

**Fix:** Keep Kubo’s approved display family, but tune the optical metrics toward the reference: use a lighter display weight where available, reduce tracking compression, and set a desktop size around 86–92px with approximately 0.98–1.04 line-height. Keep the existing accessible visually hidden `h1` and decorative `aria-hidden` title split from `hero-display-title.tsx`.

**Acceptance:** The Kubo headline’s painted height and two-line advance are within roughly 10% of the reference at the canonical desktop viewport, while the text remains legible and does not depend on the reference’s font.

### P1 — Replace the oversized installer card with a compact hero action

**Error:** The current installer rail is 544×146px at 1908px (`hero-section.tsx:59-66`), while the reference presents a 174×62px primary CTA at the lower-left. The command card pulls the visual center downward and competes with the headline.

**Fix:** For the reference-like hero, use one compact Kubo primary CTA in the hero, approximately 174–210px wide and 56–64px high. Preserve the package-manager selector and copyable command in the next command/product module or expose them as a secondary control below the fold. Do not remove the functionality; relocate it out of the hero’s primary visual frame.

**Acceptance:** The hero has one clear action in the lower-left rhythm, and the full installer rail no longer determines the desktop hero’s visual center.

### P1 — Make the supporting copy denser and align it with the headline

**Error:** Current supporting copy is centered at x=674 and uses 20px / 32.5px. The reference uses a left-aligned two-line block at x=266 with roughly 23–25px / 28px. Current `mt-9` also creates a larger post-headline gap than the reference.

**Fix:** Align the paragraph to the headline block, set a max width around 570px, use a Kubo-approved 20–24px size with approximately 28px line-height, and tune the top margin to about 20–28px after the painted headline.

**Acceptance:** The paragraph occupies no more than two lines at the canonical desktop viewport, starts within 24–32px of the headline’s painted bottom, and remains readable over the quiet field.

### P1 — Ensure the actual rounded-cell renderer paints

**Error:** The source Canvas implementation is structurally correct in `mosaic-hero-canvas.tsx:366-454`, but the live Playwright DOM repeatedly exposed only `.mosaic-hero-fallback` under the hero; no `.mosaic-hero-canvas` was present after the page settled. The captured result therefore uses the CSS approximation and reads as a thin grid.

**Fix:** Add a deterministic browser check for the hero renderer after hydration. Verify that `canvas.mosaic-hero-canvas` mounts, has the hero’s CSS width/height, and has non-zero pixel dimensions. If Canvas is unavailable, strengthen the fallback so it uses the same chunky tile pitch, seam, corner radius, and band positions rather than a 22px repeating SVG approximation. Keep the fallback for first paint and failure cases.

**Acceptance:** After load at 1440×900 and 1908×1070, the hero contains a painted canvas with non-zero dimensions, or the fallback visibly passes the rounded-cell checklist. No settled capture may silently degrade to a smooth gradient plus graph-paper lines.

### P1 — Increase right-side band energy while protecting copy contrast

**Error:** The reference’s right third is about 2.5× the left-third grayscale mean and has approximately 30.9% of pixels above luma 80. Kubo’s captured right third is only about 1.75× the left-third mean and has approximately 0.31% of pixels above luma 80. The current field is too uniformly near-black.

**Fix:** Tune the Canvas band cores and CSS fallback independently. Keep Kubo’s `--primary`, `--accent`, and `--foreground` token mapping, but increase broad-band opacity and sparse core hotness on the right half. Move the primary and warm paths farther right, retain a lower echo, and keep the left content pocket dark with the veil. Do not introduce the reference’s cyan/red hues.

**Acceptance:** The right third clearly outshines the left third in a screenshot, with sparse gold/cream hot cells and no loss of headline contrast. A practical target is 12–20% right-third pixels above luma 80 after the Kubo palette is applied; validate visually rather than treating the threshold as a color requirement.

### P2 — Preserve square-cell geometry across aspect ratios

**Error:** `paintMosaic` currently derives `cell` with `Math.max(cssWidth / columns, cssHeight / rows)`. On the wide 1908×1022 hero this makes the 52×37 grid taller than the frame and crops rows. The fallback independently fixes its tile pitch at 22px. The two renderers therefore cannot match each other or the reference’s visible cell rhythm.

**Fix:** Choose one responsive geometry contract. Recommended: derive a target pitch from the height (`frameHeight / 37`), set `columns = ceil(frameWidth / pitch)`, and keep square rounded cells through the frame; at the reference aspect ratio this naturally resolves to approximately 52×37. Alternatively, use a fixed 52×37 composition inside a deliberate aspect-ratio frame and document the crop. Apply the same pitch, seam ratio, and corner ratio to Canvas and fallback.

**Acceptance:** At desktop, cells remain square, seams stay around 7–12% of pitch, corners around 10–16% of pitch, and the visible grid does not become a thin graph-paper texture or a vertically cropped partial grid.

### P2 — Fix page-level mobile overflow before final approval

**Error:** At 390×844, the document reports scrollWidth=503px. The overflowing elements are downstream product mosaic media containers around x=17–503, not the hero itself. This still creates horizontal page overflow and invalidates mobile visual comparison.

**Fix:** Constrain the downstream media/image containers to the available inline size (`min-width: 0; width: 100%; max-width: 100%`) and verify their intrinsic image sizing. Keep the hero’s own 375px frame and 16px content gutters.

**Acceptance:** `document.documentElement.scrollWidth <= innerWidth` at 390×844, the hero remains x=0–375 below the 49px header, and no horizontal scrollbar appears.

## Implementation order

1. Fix full-viewport artwork layering and desktop content anchoring.
2. Reduce headline/supporting-copy optical mismatch and replace the hero-sized installer rail with a compact action.
3. Make Canvas mount verification explicit; align Canvas and fallback geometry.
4. Increase right-side energy and validate against screenshot luma/visual hierarchy.
5. Fix the downstream mobile overflow.
6. Re-run Playwright at 1908×1070, 1440×900, 768px, and 390×844, including reduced-motion emulation.

## Verification checklist

- [ ] Reference and Kubo captures are taken at the same viewport before comparing positions.
- [ ] Desktop hero artwork starts at y=0 and is visible behind the header.
- [ ] Desktop copy is lower-left, left-aligned, and remains in a dark pocket.
- [ ] Headline, paragraph, and CTA match the measured size/spacing bands without copying the source font or brand.
- [ ] Canvas or a visually equivalent fallback is present after hydration.
- [ ] Rounded cells—not graph-paper lines—are visible at 100% zoom.
- [ ] Right-side energy is clearly stronger than the left while Kubo text contrast passes.
- [ ] Mobile page scrollWidth does not exceed the viewport width.
- [ ] `prefers-reduced-motion: reduce` produces a stable field and usable content.
