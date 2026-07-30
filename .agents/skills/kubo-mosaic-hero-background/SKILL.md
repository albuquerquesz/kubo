---
name: kubo-mosaic-hero-background
description: Build or tune dark hero backgrounds made from rounded-square pixel mosaics, quiet grid seams, curved luminous bands, vignettes, and text-safe negative space using Kubo theme tokens. Use when recreating the supplied Fluxion-like hero background, designing a Kubo marketing hero with a tiled raster atmosphere, or reviewing visual fidelity of this background pattern in a web page.
---

# Kubo Mosaic Hero Background

Use this skill for the background system only. Preserve Kubo copy, typography, navigation, layout, and accessibility; borrow the reference’s spatial rhythm and raster treatment, never its logo, wording, or brand identity.

Read [references/background-spec.md](references/background-spec.md) before implementing or making a fidelity judgment. It contains the measured reference geometry, color translation, layer recipe, and Playwright checks.

## Workflow

1. Inspect the current hero at desktop and mobile widths with Playwright. Capture the page in `output/playwright/`, record the hero bounds, and check whether the background is a CSS layer, canvas, SVG, or image before changing it.
2. Keep the atmosphere in a `pointer-events-none`, `aria-hidden` layer behind content. Do not put essential text, contrast, or interaction inside the artwork.
3. Prefer a capped-DPR Canvas or WebGL layer for the per-tile color field when the hero needs many cells or animated drift. Reuse the theme-token reading pattern from `apps/web/src/app/(home)/_components/ethereal-beams-canvas.tsx`; do not hard-code a second Kubo palette in a component.
4. Use a CSS/static fallback that keeps the same dark canvas, broad bands, and grid impression when Canvas/WebGL is unavailable or `prefers-reduced-motion: reduce` is active.
5. Validate at 1440×900 (or the project’s canonical desktop viewport), 768px, and 390px widths. Check headline contrast, no horizontal scroll, no content overlap, stable first paint, and clean reduced-motion output.

## Visual contract

- Use roughly 52 columns × 37 rows at the reference aspect ratio. Each cell is a rounded square with a narrow dark seam; keep the grid visible even in quiet regions, but only barely.
- Make the base near-black and matte. Add wide, soft, curved diagonal bands underneath the content: a cool/electric band and a warm band that overlap toward the right half, plus a weaker lower echo. Color changes happen cell-by-cell, not as a smooth vector gradient.
- Keep the left-center/lower-left copy area materially darker than the luminous right half. Use a content-aware dark veil if the chosen Kubo copy lands over a bright band.
- Add a subtle edge vignette and low-opacity global veil. The reference is atmospheric and restrained: bright cells are exceptions, not the average tile state.
- Maintain rounded tile geometry at every breakpoint. Avoid a smooth blurred gradient, a conventional dot pattern, sharp square pixels, or a full-screen white glow.
- Animate only the field when requested: slow drift or intensity breathing, never distracting tile flicker. Freeze to a deterministic frame for reduced motion.

## Kubo adaptation

- Resolve `--background`, `--card`, `--muted`, `--foreground`, `--muted-foreground`, `--primary`, and `--accent` at runtime. The current editorial dark home palette is approximately `#11110d`, `#181814`, `#222118`, `#f2ede0`, `#b0a78d`, `#c49314`, and `#d6a72b`; tokens remain authoritative because theme order can change.
- Replace the reference’s cyan/blue band with `primary`/`accent` energy and replace the red/magenta band with a second warm mix of `accent` and `foreground`. Use `foreground` only for hot cores. Keep every glow mixed toward `background`; saturated rainbow colors are outside this skill’s Kubo adaptation.
- Keep the contrast and optical density of the reference, not its exact hue positions. In a gold-only Kubo theme, distinguish the two bands with luminance, opacity, curvature, and core temperature rather than inventing blue or red.
- Use `ui-display`/Archivo and existing Kubo content styles for text. The background must never force a third-party font or foreground color.

## Implementation guardrails

- Derive tile size from the hero frame rather than viewport width alone so the pattern does not stretch: at the reference ratio, `cell ≈ min(frameWidth / 52, frameHeight / 37)` with a 7–12% seam and a 10–16% corner radius.
- Build bands from normalized curves or distance-to-polyline fields. For each tile center, mix the base color toward a band color using a broad falloff plus a narrower core falloff; quantize the final result per cell. Do not blur the entire finished grid.
- Keep each cell’s fill opaque enough to read as a tile, then use opacity/luminance to create depth. A very faint 1px seam or shadow is preferable to a bright border.
- Clamp Canvas/WebGL DPR to project policy, listen for resize with passive handlers, and avoid allocating one DOM node per tile unless the grid is intentionally small.
- Do not fetch the reference image at runtime. Do not ship copied Fluxion branding, logo, copy, or a screenshot as the Kubo background.
- Respect `prefers-reduced-motion`; retain the visual field, remove time-based drift, and avoid a layout shift while the renderer mounts.
