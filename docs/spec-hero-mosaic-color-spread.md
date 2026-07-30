# Spec: hero mosaic color spread and over-yellow correction

Status: proposed (issue / implementation brief)
Owner: Web / marketing home
Date: 2026-07-30
Scope: background renderer only — preserve Kubo copy, controls, tokens, accessibility, and product identity.

## Objective

The previous density pass ([spec-hero-yellow-mosaic-density.md](spec-hero-yellow-mosaic-density.md)) over-corrected black voids by flooding the field with continuous yellow/olive. The hero now reads as a monochrome gold grid wall rather than a dark mosaic with sparse, smooth luminous ribbons.

This spec re-aligns the Kubo hero with the Fluxion reference’s **spatial color hierarchy** while staying inside Kubo theme tokens:

- restore large dark negative space (especially left/center);
- concentrate energy into two curved, separated ribbons on the right half;
- spread luminance and core temperature **cell by cell** so bands feel smooth, not a flat wash;
- keep rounded-square tile geometry and narrow seams;
- fix Canvas first-paint so settled reviews show the intended per-cell field, not only the CSS fallback.

Do **not** copy Fluxion’s logo, wording, typeface, cyan/red brand palette, or remote artwork. Borrow composition and raster discipline only.

Related history:

- [spec-hero-reference-comparison.md](spec-hero-reference-comparison.md) — initial measurement audit
- [spec-hero-background-fidelity-fix.md](spec-hero-background-fidelity-fix.md) — first fidelity fix plan
- [spec-hero-yellow-mosaic-density.md](spec-hero-yellow-mosaic-density.md) — density/geometry pass that over-pushed yellow coverage
- Skill contract: [kubo-mosaic-hero-background](../.agents/skills/kubo-mosaic-hero-background/SKILL.md)

## Reference source

```text
https://pbs.twimg.com/media/HH912-UbAAAEL6M?format=jpg&name=4096x4096
```

Natural size: **4096×2913** (≈1.406:1). Viewer gutters are not part of the artwork.

## Evidence captured with Playwright

Script: [`scripts/overyellow-audit.mjs`](../scripts/overyellow-audit.mjs)  
Machine report: [`output/playwright/overyellow-audit-report.json`](../output/playwright/overyellow-audit-report.json)  
Captured: 2026-07-30 against `http://127.0.0.1:3333/` with `prefers-reduced-motion: reduce`.

### Full-frame captures

| Subject                              |       Viewport | Measurement                                                | Evidence                                                                                                        |
| ------------------------------------ | -------------: | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| User-supplied Kubo (complaint frame) |      ~1851×939 | Bright yellow wall across mid/right; dark left pocket only | [user-supplied-kubo-overyellow.jpg](../output/playwright/user-supplied-kubo-overyellow.jpg)                     |
| User-supplied Fluxion reference      | marketing crop | Dual cool+warm ribbons, large dark left, smooth mosaic     | [user-supplied-fluxion-reference.png](../output/playwright/user-supplied-fluxion-reference.png)                 |
| Kubo live                            |      1908×1070 | hero 1908×1070; Canvas **not ready**                       | [current-hero-overyellow-audit-1908.png](../output/playwright/current-hero-overyellow-audit-1908.png)           |
| Kubo live                            |       1440×900 | hero 1440×900; Canvas **not ready**                        | [current-hero-overyellow-audit-1440x900.png](../output/playwright/current-hero-overyellow-audit-1440x900.png)   |
| Kubo live                            |        390×844 | hero 390×844; no horizontal overflow                       | [current-hero-overyellow-audit-390x844.png](../output/playwright/current-hero-overyellow-audit-390x844.png)     |
| Fluxion raw image (viewer)           |      1908×1070 | image 1504×1070 @ x≈202                                    | [reference-fluxion-spread-audit-1908.png](../output/playwright/reference-fluxion-spread-audit-1908.png)         |
| Fluxion raw image (viewer)           |       1440×900 | image 1265×900 @ x≈87                                      | [reference-fluxion-spread-audit-1440x900.png](../output/playwright/reference-fluxion-spread-audit-1440x900.png) |

### Region close-ups

| Subject | Region                       | Evidence                                                                                                  |
| ------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| Kubo    | Right energy / tile geometry | [current-hero-overyellow-tile-closeup.png](../output/playwright/current-hero-overyellow-tile-closeup.png) |
| Fluxion | Right energy / tile geometry | [reference-fluxion-tile-closeup.png](../output/playwright/reference-fluxion-tile-closeup.png)             |
| Kubo    | Left copy pocket             | [current-hero-overyellow-left-copy.png](../output/playwright/current-hero-overyellow-left-copy.png)       |
| Fluxion | Left copy pocket             | [reference-fluxion-left-copy.png](../output/playwright/reference-fluxion-left-copy.png)                   |

![User-supplied Kubo — too much yellow](../output/playwright/user-supplied-kubo-overyellow.jpg)

![User-supplied Fluxion — target color spread](../output/playwright/user-supplied-fluxion-reference.png)

![Playwright Kubo 1440×900 (CSS fallback only)](../output/playwright/current-hero-overyellow-audit-1440x900.png)

![Playwright Fluxion reference 1440×900](../output/playwright/reference-fluxion-spread-audit-1440x900.png)

![Kubo tile close-up — monochrome olive wash](../output/playwright/current-hero-overyellow-tile-closeup.png)

![Fluxion tile close-up — dual cool/warm cell field](../output/playwright/reference-fluxion-tile-closeup.png)

## Quantitative color samples (1440×900)

Samples are average RGB / luminance / classification over normalized regions of the settled screenshot (Kubo full viewport vs Fluxion **image box only**). Source: `overyellow-audit-report.json`.

| Region       | Kubo avg RGB   | Kubo lum | Kubo % dark | Kubo % mid | Fluxion avg RGB | Fluxion lum | Fluxion % dark | Fluxion % mid | Diagnosis                                                                         |
| ------------ | -------------- | -------: | ----------: | ---------: | --------------- | ----------: | -------------: | ------------: | --------------------------------------------------------------------------------- |
| leftCopy     | 59, 54, 40     |       54 |        79.1 |        2.1 | 38, 38, 42      |          38 |           87.7 |           3.5 | Kubo left is warmer and slightly lighter than the cool charcoal reference pocket  |
| center       | **61, 40, 10** |       43 |        50.1 |   **49.6** | **30, 31, 41**  |          32 |       **85.9** |          14.1 | **Center is half mid-tone yellow-brown instead of mostly dark**                   |
| rightEnergy  | 66, 49, 14     |       50 |        21.7 |   **78.3** | 100, 105, 124   |         105 |            9.0 |          66.6 | Kubo right is a flat warm mid field; reference has higher contrast + cool channel |
| midRightBand | 71, 48, 10     |       50 |        22.6 |       77.4 | 65, 95, 107     |          90 |           29.0 |          50.1 | Reference mid-band is cool and varied; Kubo is mono amber                         |
| topLeft      | 28, 22, 11     |       22 |         100 |          0 | 32, 25, 31      |          27 |           98.5 |           1.3 | Both quiet; Kubo slightly warmer                                                  |
| full frame   | 54, 41, **16** |       42 |        61.1 |       35.8 | 49, 51, **63**  |          51 |           64.5 |          28.6 | Global hue: Kubo brown-yellow; reference cool slate                               |

Interpretation:

1. The density pass succeeded at eliminating black voids, but it did so by raising **most** non-left cells into the same olive-gold mid band.
2. The reference keeps the **majority of the canvas dark** and only spends luminance inside narrow curved ribbons.
3. Kubo’s center region alone is ~50% mid-tone vs the reference’s ~14% mid-tone — that is the over-yellow problem in numbers.

### Settled DOM state (all Kubo viewports)

| Check                                          | Observed                                                                          | Severity                                   |
| ---------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------ |
| `canvas.mosaic-hero-canvas[data-mosaic-ready]` | `"false"`                                                                         | **P0**                                     |
| Canvas intrinsic size                          | `300×150` (default, never painted)                                                | **P0**                                     |
| Canvas CSS opacity                             | `0`                                                                               | expected while not ready                   |
| `.mosaic-hero-fallback` opacity                | `1`                                                                               | fallback is the only artwork in Playwright |
| Tokens                                         | `--background #11110d`, `--primary #c49314`, `--accent #d6a72b`, `--card #181814` | OK                                         |
| Mobile overflow                                | `scrollWidth == innerWidth` at 390                                                | OK                                         |

The Canvas path never marks ready in the settled capture. Reviews and screenshots are evaluating the **CSS fallback**, while the intended per-cell band math lives only in `mosaic-hero-canvas.tsx`. Both paths currently over-apply yellow, but fixing Canvas is mandatory for a fair visual contract.

## Detailed issue list

### ISSUE-1 — Continuous yellow wall instead of sparse luminous ribbons (P0)

**Symptom.** Mid and right of the hero form a near-uniform olive/gold tile bed. Energy does not read as curved lightning; it reads as a tinted graph paper.

**Evidence.**

- User frame: [user-supplied-kubo-overyellow.jpg](../output/playwright/user-supplied-kubo-overyellow.jpg)
- Playwright 1908: [current-hero-overyellow-audit-1908.png](../output/playwright/current-hero-overyellow-audit-1908.png)
- Close-up: [current-hero-overyellow-tile-closeup.png](../output/playwright/current-hero-overyellow-tile-closeup.png)
- Contrast with [reference-fluxion-tile-closeup.png](../output/playwright/reference-fluxion-tile-closeup.png)

**Root causes in code.**

| Location                                                 | Problem                                                                                                                                                     |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `colorForCell()` deepOlive / midGold / `rightField`      | Quiet field is mixed toward primary across ~right 60–70% of the frame (`rightField = smoothstep(0.28, 0.75, nx)` + freckles). That is a wash, not a ribbon. |
| Band widths `0.12–0.13` + opacity `1` on both main bands | Broad bands overlap into one warm blob once the base is already gold.                                                                                       |
| Fallback CSS right-side gradient                         | `linear-gradient(to right, … primary 24% …)` lifts the entire right third before masking.                                                                   |

**Target.** Match Fluxion hierarchy: dark matrix is the default; luminous cells are the exception. Quiet non-band cells should stay near `mix(background, card)` with only tiny deterministic noise — **not** continuous primary olive.

### ISSUE-2 — No dual-temperature color spread (P0)

**Symptom.** Every lit cell is the same family of yellow. There is no cool/deep shoulder versus warm/pale core, so the mosaic cannot “spread color” the way the reference does (cyan→blue→magenta→coral cell by cell).

**Evidence.** Fluxion close-up shows cool cyan cores against blue shoulders against red/coral companions. Kubo close-up is one brown-gold step ladder.

**Kubo adaptation rule (from skill — do not invent brand cyan/red):**

| Visual role (Fluxion)        | Kubo token translation                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| Cool cyan/blue ribbon body   | Deeper, desaturated **primary mixed hard toward background/card** (low temperature, lower luminance) |
| Cool hot core                | `mix(primary, muted-foreground / foreground, modest)` — never neon                                   |
| Warm red/magenta ribbon body | Higher-temperature **accent** path, more saturated shoulders                                         |
| Warm pale core               | Sparse `mix(accent, foreground, 0.55–0.85)` cells only                                               |
| Overlap zone                 | Intermediate olive/cream quantization — not a third solid color                                      |

Bands must differ in **hue temperature, luminance, opacity, and path**, not only in “a bit more yellow.”

### ISSUE-3 — Missing dark negative space / copy atmosphere (P1)

**Symptom.** Fluxion leaves a large charcoal void behind the headline; the grid is barely visible. Kubo shows a continuous dim yellow grid under and around the title, which flattens hierarchy and makes the page feel “all yellow.”

**Evidence.**

|             | Kubo left                                                                                           | Fluxion left                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Pocket crop | [current-hero-overyellow-left-copy.png](../output/playwright/current-hero-overyellow-left-copy.png) | [reference-fluxion-left-copy.png](../output/playwright/reference-fluxion-left-copy.png) |
| Sample      | avg 59,54,40; 79% dark                                                                              | avg 38,38,42; 88% dark                                                                  |

**Target.** First ~32–40% of width: near-background tiles with ≤ subtle noise. Grid may be faintly present; gold freckles and band shoulders must not invade the title block.

### ISSUE-4 — Bands lack curved, separated ribbon structure (P1)

**Symptom.** Even when gradients exist in the fallback, they are broad soft glows, not quantized lightning. The two intended reverse-sweep paths collapse into one diagonal amber mass.

**Reference geometry (keep / retune, do not abandon):**

```text
primary (deep/cooler gold):  p0=(0.92, 1.06), p1=(0.58, 0.52), p2=(0.34, -0.06)
warm    (hotter accent):     p0=(1.12, 0.88), p1=(0.86, 0.42), p2=(0.62, -0.04)
lowerEcho (weak):            p0=(0.78, 1.10), p1=(0.52, 0.92), p2=(0.22, 0.78)
```

**Tuning required:**

| Parameter           | Current    | Target after over-yellow fix                    |
| ------------------- | ---------- | ----------------------------------------------- |
| Broad width         | 0.12–0.13  | **0.07–0.10** (narrower ribbons)                |
| Core width          | 0.04–0.042 | **0.025–0.035**                                 |
| Mid-height path gap | ≥0.12 nx   | **≥0.14 nx** (more dark matrix between ribbons) |
| Primary opacity     | 1.0        | **0.75–0.90** broad; core still punchy          |
| Warm opacity        | 1.0        | **0.70–0.85** broad; higher core temperature    |
| Lower echo          | 0.32       | **≤0.22**                                       |
| Top-left haze       | 0.14       | **≤0.10**, almost no primary                    |

### ISSUE-5 — Cell transitions not smooth along the field (P1)

**Symptom.** Fluxion’s mosaic feels continuous because adjacent cells step through many intermediate colors. Kubo’s quiet field is nearly isochromatic; only band cores jump.

**Required behavior:**

1. Start from near-black/card base.
2. Apply band falloff **before** any wide right-side primary lift (and remove that lift as a default).
3. Per-cell noise only modulates intensity **inside** band influence, plus a tiny ± luminance tick outside bands so seams remain readable.
4. Quantize to ~8–12 RGB units so steps read as tiles, not blur.
5. Do **not** use a full-frame soft gradient without per-cell quantization (fallback must still look tiled).

### ISSUE-6 — Canvas never settles ready in Playwright (P0)

**Symptom.** All three viewports report `data-mosaic-ready="false"`, intrinsic `300×150`, opacity `0`. Fallback is permanent.

**Impact.** Production may still hydrate Canvas in some browsers, but:

- visual QA cannot trust Canvas math;
- the density/color work in `colorForCell` is invisible in automated captures;
- FOUC/fallback and Canvas can diverge permanently.

**Acceptance.** Within 1s of load under reduced motion:

- `data-mosaic-ready="true"`
- non-zero `dataset.mosaicColumns` / `mosaicRows`
- intrinsic canvas size matches CSS rect × capped DPR
- fallback opacity transitions to 0

Investigate: client mount path, `useLayoutEffect` not firing in the test environment, zero-size first measure, missing `getContext`, or CSS stacking that hides a successful paint. Prefer fixing paint over hiding the bug behind a prettier fallback.

### ISSUE-7 — CSS fallback over-applies primary olive (P1)

**Symptom.** Even without Canvas, the fallback alone produces the yellow wall.

**Hotspots in `global.css` `.mosaic-hero-fallback::before`:**

1. Base `background-color: color-mix(card 58%, primary 16%…)` — already olive before bands.
2. Right-side continuous field gradient with `primary 24%` at 72% — full-height yellow lift.
3. Soft-light band gradients that re-amplify the same hue.

**Target fallback recipe:**

```text
base = near background/card (almost no primary)
+ narrow diagonal band layers (primary deep + accent warm), soft-light, low coverage
+ mask to rounded squares
+ strong left copy veil (::after)
```

Fallback does not need perfect dual-core cells, but it must not look like a gold wallpaper.

### ISSUE-8 — Previous density contract conflicts with this goal (P2 / doc debt)

[spec-hero-yellow-mosaic-density.md](spec-hero-yellow-mosaic-density.md) acceptance includes:

> The right 60–70% of the desktop hero must show a continuous field of distinguishable tile fills; no unintentional black rectangle may span more than approximately 5 columns × 4 rows between bands.

That sentence over-prescribes **coverage**. Black/charcoal spans **between** ribbons are desirable (Fluxion has large dark regions). This color-spread spec **supersedes** that coverage rule:

| Old density rule                             | New color-spread rule                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| Continuous yellow/olive on right 60–70%      | Continuous **grid**, not continuous **gold**                                          |
| No black span > ~5×4 between bands           | Dark spans **expected** outside band falloff; only seams/noise keep the grid readable |
| deepOlive/midGold freckles across rightField | Freckles only inside band influence + tiny global noise                               |

Geometry rules (rounded squares, seam 7–10%, radius 15–19%) from the density spec **remain in force**.

### ISSUE-9 — Tile corner softness vs reference (P2, minor)

Close-ups show Kubo tiles are slightly softer/rounder than Fluxion’s more squared cells. Current `CORNER_RATIO = 0.17` is still within the density range; if the field still feels “blob-like” after color fixes, consider `0.14–0.15`. Not the primary complaint.

## Visual contract (target)

```text
Back to front:
1. Matte --background canvas
2. Full-bleed rounded-square grid (≈37 rows desktop), dark seams
3. Quiet cells ≈ background/card (+ tiny noise) — NOT primary wash
4. Ribbon A (deep/cooler gold) — curved, mid-right → upper-center
5. Ribbon B (warmer accent) — further right, separated mid-gap
6. Sparse pale cores only on ribbon B / overlaps
7. Weak lower echo + faint top-left haze
8. Left copy veil + edge vignette
9. Kubo UI (unchanged)
```

### Luminance budget (desktop, post-veil)

Approximate share of hero pixels (visual QA, not hard unit tests):

| Class                    | Target share | Notes                      |
| ------------------------ | -----------: | -------------------------- |
| Near-dark (lum ≲ 35)     |   **55–70%** | matrix + left pocket       |
| Quiet mid (35–70)        |       15–25% | band shoulders, soft field |
| Bright / hot (≳ 70–140+) |    **8–18%** | ribbon cores only          |
| Near-foreground cream    |     **≪ 3%** | sparse hot cells           |

If mid+bright yellow exceeds ~45% of the frame, the field is still over-yellow.

### Token roles (authoritative)

| Role              | Token                | Use                     |
| ----------------- | -------------------- | ----------------------- |
| Canvas / quietest | `--background`       | seams, void, veil       |
| Quiet tile        | `--card`             | base cell body          |
| Low lift          | `--muted`            | tiny grid readability   |
| Deep ribbon       | `--primary`          | cooler/deeper band body |
| Warm ribbon       | `--accent`           | hotter companion        |
| Hot core          | `--foreground`       | sparse only             |
| Soft text/veil    | `--muted-foreground` | optional desat mix      |

No cyan, blue, red, magenta, or remote reference hex values.

## Codebase map

| Area                | File                                                                          | Required change                                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-cell palette    | `apps/web/src/app/(home)/_components/mosaic-hero-canvas.tsx` → `colorForCell` | Remove/reduce continuous `rightField` primary wash; base stays near background/card; band-driven color only                                                      |
| Band paths & widths | same → `buildBands`                                                           | Narrow widths, lower broad opacity, stronger temperature split, keep ≥0.14 mid separation                                                                        |
| Canvas readiness    | same → `useLayoutEffect` / paint path                                         | Guarantee first paint + `data-mosaic-ready="true"` under reduced motion                                                                                          |
| CSS fallback        | `apps/web/src/app/global.css` → `.mosaic-hero-fallback`                       | Kill right-side primary field gradient; quieter base; thinner band layers                                                                                        |
| Copy veil           | same → `.mosaic-hero-veil` / fallback `::after`                               | Keep strong left pocket without erasing faint grid                                                                                                               |
| Tests               | `apps/web/test/hero-mosaic-background.test.ts`                                | Drop assertions that **require** `deepOlive`/`midGold`/`rightField` as permanent density API; assert band-driven quiet base + no remote reference assets instead |
| Prior density spec  | `docs/spec-hero-yellow-mosaic-density.md`                                     | Mark coverage rule superseded by this document                                                                                                                   |

## Implementation sequence

1. **P0 Canvas:** make paint + readiness reliable; re-capture Playwright with `data-mosaic-ready=true`.
2. **P0 Palette:** strip continuous right-side olive wash in `colorForCell`; quiet base only.
3. **P0 Bands:** narrow ribbons, dual temperature, stronger mid-gap dark matrix.
4. **P1 Fallback:** match quiet base + thin diagonal energy so FOUC is not a gold wall.
5. **P1 Veil:** retune left pocket after the field is darker overall (may need less crush).
6. **P2:** optional corner ratio tweak; update tests and density-spec cross-links.
7. Re-run audit script; attach new `current-hero-color-spread-*.png` captures.

## Playwright acceptance checks

Re-run `node scripts/overyellow-audit.mjs` (or equivalent) at 1440×900, 1908×1070, 390×844 with reduced motion.

### Structural

- [ ] Hero full-bleed, y=0, height ≥ viewport
- [ ] `canvas[data-mosaic-ready="true"]` with intrinsic size ≈ CSS × DPR
- [ ] Square cells; seam ~7–10%; radius ~14–18% of pitch
- [ ] No horizontal overflow at 390
- [ ] No Fluxion/twimg remote assets or brand hex in source/network

### Color spread

- [ ] Center region ≥ **70% dark** (lum ≲ 45) — currently ~50%
- [ ] Full-frame average is not a strong brown-yellow cast (B channel no longer ≪ R,G by the current margin)
- [ ] Right energy shows **two** separable ribbons with dark matrix between them
- [ ] Bright/hot cells are localized to ribbon cores, not a full right half
- [ ] Left copy pocket remains darker than center/right; title contrast intact
- [ ] Within Kubo tokens only: deep primary vs warm accent temperature difference is visible without cyan/red

### Motion

- [ ] Reduced motion: deterministic field, no drift
- [ ] Default motion: slow drift only, no tile flicker

### UI regression

- [ ] Title, body, CTA geometry and copy unchanged
- [ ] Accessible `h1` + decorative title preserved
- [ ] Focus styles and `/new` CTA preserved

## Definition of done

- [ ] All Playwright evidence in this spec regenerated after the fix (or clearly marked before/after)
- [ ] ISSUE-1…6 closed with screenshots proving dual-ribbon dark-matrix composition
- [ ] Canvas ready in settled captures
- [ ] Fallback no longer presents a gold wallpaper
- [ ] Density-spec coverage language marked superseded
- [ ] Unit/source tests updated to the new palette contract
- [ ] No copy of Fluxion branding or remote mosaic image shipped

## Non-goals

- Recreating Fluxion cyan/red palette literally
- Changing Kubo marketing copy, type scale, or CTA
- Replacing Canvas with a static screenshot of the reference
- Animating individual tiles independently

## Appendix A — Side-by-side diagnosis (one-liner)

| Axis           | Fluxion reference                | Current Kubo                     |
| -------------- | -------------------------------- | -------------------------------- |
| Default cell   | Near-black charcoal              | Olive-gold mid                   |
| Energy shape   | Two curved ribbons               | Soft diagonal wash / wall        |
| Color spread   | Cool + warm families, many steps | Single yellow family             |
| Left pocket    | Large void, faint grid           | Dim gold grid under type         |
| Bright cells   | Sparse cores                     | Whole mid/right elevated         |
| Renderer in QA | N/A (static image)               | Fallback only (Canvas not ready) |

## Appendix B — Suggested `colorForCell` sequence (replacement)

```text
base = mix(background, card, 0.22…0.40 + tinyNoise)   // quiet matrix
base = mix(base, muted, 0.04…0.10)                    // barely lifted grid
// NO continuous rightField primary olive
for each band:
  base = mix(base, band.color, broad * opacity * noiseMod)
  base = mix(base, band.coreColor, core * coreOpacity * noiseMod)
  sparse foreground hot only if core high AND noise high
copyPocket crush on nx < ~0.34 toward background/card
edge vignette mild
quantize(8…12)
```

## Appendix C — Reproduction commands

```bash
# Dev server
bun dev   # http://127.0.0.1:3333/

# Capture + region samples
node scripts/overyellow-audit.mjs

# Source contract tests
cd apps/web && bun test test/hero-mosaic-background.test.ts
```
