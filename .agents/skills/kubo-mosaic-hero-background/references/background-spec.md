# Mosaic hero background specification

## Reference capture

The supplied image was opened directly with Playwright on 2026-07-30:

`https://pbs.twimg.com/media/HH912-UbAAAEL6M?format=jpg&name=4096x4096`

The asset reports **4096×2913** (ratio ≈ **1.405:1**). In the Playwright capture, the browser viewport was **1908×1070** and the image rendered at **1504×1070**, centered with **202px** dark gutters on both sides. The source artwork itself fills its frame; the gutters belong to the image viewer page and are not part of the hero.

Treat these measurements as a composition reference, not a requirement to preserve the source aspect ratio on Kubo. A production hero should normally be full-bleed and use `min-height: 100svh`.

## Layer anatomy

From back to front:

1. **Viewer/canvas black** — near-black, matte, with no texture. The inspected viewer gutter was approximately `rgb(14 14 14)`.
2. **Mosaic field** — a regular grid of about 52 columns × 37 rows. The source image has about 78 source pixels per cell. At capture scale, cells were about 29 CSS pixels. Cells are near-square, individually rounded, and separated by a thin dark seam.
3. **Quiet tile variation** — most cells are only a little lighter or cooler than the base. Grid visibility comes from local tile edges and tiny luminance differences, not a bright outline.
4. **Broad color bands** — several overlapping, soft-edged diagonal/curved ribbons occupy the middle and right side. They are built from many colored cells with smooth changes in intensity across the grid.
5. **Hot cores** — sparse cells in the brightest band reach cyan-white or coral-cream in the source. Hotspots are localized and irregular enough to feel like energy moving through a raster field.
6. **Atmospheric suppression** — a translucent dark veil and edge vignette keep the artwork behind the navigation and headline. The left half is intentionally much quieter than the right.
7. **Hero UI** — logo/nav at the top, large headline in the lower-left, supporting text below, and a compact CTA. These are foreground reference elements only; do not reproduce their branding in Kubo.

## Spatial composition

- **Top-left:** a muted warm cloud bleeds in from the edge. It is visible but not a focal point.
- **Left-center:** mostly charcoal/navy-black negative space. This is the strongest copy-safe region.
- **Upper-middle:** a cool band enters from above and widens as it bends toward the center.
- **Middle-right:** the main cool band overlaps a warm red band; overlap produces pale desaturated intermediate cells rather than a flat hard boundary.
- **Right half:** the warm band becomes the most saturated, with a bright coral/cream core around the middle-to-lower right, then fades toward the edges.
- **Lower-left to lower-middle:** a secondary cool band and a weaker warm echo create depth below the headline without becoming a solid panel.
- **Edges:** the tile grid continues to the boundaries. Do not crop the grid into a rounded card unless the surrounding Kubo section explicitly requires a card.

For a Kubo hero, preserve the same hierarchy: quiet content zone on the left, energy concentrated to the right, and one or two diagonal arcs that lead the eye behind the copy. If the copy is centered or occupies a different zone, move or darken the field instead of letting bright cells reduce readability.

## Tile geometry

Use a normalized grid so it survives aspect-ratio changes:

```text
columns = 52
rows = 37
cell = min(frameWidth / columns, frameHeight / rows)
seam = cell × 0.07 … 0.12
cornerRadius = cell × 0.10 … 0.16
```

The source cells have soft corners, not circles. Keep the seam dark and narrow. A small inset shadow or darker edge on the bottom/right of each tile can provide the reference’s depth, but avoid glossy bevels and strong drop shadows.

When using Canvas, draw one rounded rectangle per cell and color the entire rectangle with a quantized result. When using DOM, use a small fixed grid only; never create hundreds of animated React elements that each own independent state. CSS gradients may provide the fallback atmosphere, but a smooth gradient alone does not satisfy the visual contract.

## Field recipe

Represent each band as a normalized curved polyline or quadratic Bezier path. For each cell center `p`:

```text
distance = distanceToPath(p, band.path)
broad = smoothstep(band.width, 0, distance)
core = smoothstep(band.coreWidth, 0, distance)
intensity = broad × band.opacity
hotness = core × band.coreOpacity
```

Mix in this order:

1. Start from the Kubo background/card mix.
2. Add the broad band color at `intensity`.
3. Add the band’s lighter `accent`/`foreground` core at `hotness`.
4. Add a low-amplitude deterministic per-cell variation so the field is not mechanically uniform.
5. Apply the dark veil and vignette after all cells are drawn.

Use several slow bands rather than one giant gradient. A useful starting arrangement is:

| Band         | Normalized path tendency                                                        | Role                             |
| ------------ | ------------------------------------------------------------------------------- | -------------------------------- |
| Cool/primary | enters near x=.65, bends through the center, exits near x=.45 at the bottom     | main leading ribbon              |
| Warm/accent  | enters near or beyond the upper-right, bows through x=.85, exits near x=.65–.75 | bright right-side counter-ribbon |
| Lower echo   | enters at lower-left and rises toward the lower-middle                          | depth behind the copy            |
| Edge haze    | broad, low-opacity warm/cool clouds near top-left and far-right                 | prevents a sterile rectangle     |

These are placement guides, not fixed pixels. Tune paths against the actual hero content and confirm the brightest cells do not sit beneath critical text.

## Kubo color translation

Use CSS custom properties or the same runtime token reader used by the existing ethereal-beams hero. The current editorial dark values in `apps/web/src/app/global.css` are useful fallbacks:

| Visual role                     | Kubo token           | Current approximate fallback |
| ------------------------------- | -------------------- | ---------------------------- |
| canvas / quietest cells         | `--background`       | `#11110d`                    |
| tile body / quiet lifted cells  | `--card`             | `#181814`                    |
| seam / low field                | `--muted`            | `#222118`                    |
| broad band                      | `--primary`          | `#c49314`                    |
| band variation / secondary band | `--accent`           | `#d6a72b`                    |
| hot core / text-safe light      | `--foreground`       | `#f2ede0`                    |
| subdued text/veil tuning        | `--muted-foreground` | `#b0a78d`                    |

The original reference separates its two main ribbons with cyan/blue versus red/magenta. Kubo should separate them with gold hue, luminance, curve, and opacity. Keep the broad fills mixed toward `--background`; reserve near-foreground values for a few hot cells. Avoid adding arbitrary cyan/red values just to match the screenshot.

## Motion and fallback

- Use a deterministic seed for tile variation so the first frame is stable across hydration and screenshots.
- If animating, vary path offset or intensity slowly over 12–24 seconds. Avoid per-tile random flicker.
- Cap device pixel ratio and pause or reduce work when the hero is off-screen if the renderer is expensive.
- With reduced motion, render the same field at a fixed time and remove drift. Keep the background present; do not replace it with a blank color.
- The static fallback should preserve base, grid impression, broad band placement, and the left copy-safe veil even when WebGL fails.

## Playwright fidelity checklist

1. Open the implementation at the canonical desktop viewport and capture a screenshot under `output/playwright/`.
2. Compare the frame, not the source viewer gutters: the hero should be full-bleed, the grid should reach the edges, and the content should remain in the foreground.
3. Confirm the grid reads as rounded squares at 100% zoom; if it reads as smooth blur, increase tile contrast/geometry before increasing glow.
4. Confirm the dominant energy stays on the right and the copy zone stays quiet.
5. Test 768px and 390px widths. Reduce cell count or band density if needed, but do not remove the grid entirely.
6. Emulate `prefers-reduced-motion: reduce` and confirm the first and settled screenshots are visually stable.
7. Inspect computed colors to ensure the implementation resolves Kubo tokens and does not introduce reference-brand hex values or remote image dependencies.
