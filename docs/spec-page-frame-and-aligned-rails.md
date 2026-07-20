# Spec: Page Frame, Side Gutters & Aligned Rails

## Status

Ready for implementation

## Date

July 19, 2026

## Goal

Make the Better T Stack marketing shell (header + full page) read as a single framed surface:

1. **Side spacing** that matches the _structural grammar_ measured on [mistral.ai](https://mistral.ai/) — shared max-width frame for header and body, outer gutters only when the viewport exceeds the frame.
2. **Continuous vertical rails** that match the _border alignment grammar_ measured on [efferd.com](https://efferd.com/) — 1 px left/right lines that run through stacked modules so components share one border column, not disconnected boxes.

This is an original Better T Stack system. Keep the existing dark palette (`--background`, `--rule`, `--border`, `--primary`). Do **not** copy Mistral/Efferd colors, copy, assets, navigation labels, or exact decorative content.

## Why the previous attempt felt like “nothing changed”

A prior tweak only adjusted `.ui-frame` to:

```css
width: min(calc(100% - (var(--page-gutter) * 2)), 1600px);
```

That failed the intent for three reasons:

| Gap                       | What happened                                      | What the references actually do                                                                         |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Wrong primary cue         | Always shrank the frame by a small fluid gutter    | Mistral’s frame is **full-bleed until max-width**; outer gutters appear only past **1728 px**           |
| Broken rail continuity    | Header chrome and body borders were not one system | Header inner width and body frame share the **same max-width origin**; side rails are continuous        |
| No Efferd-style alignment | `border-inline` on isolated wrappers creates seams | Efferd draws **pseudo rails** (`before`/`after` 1 px, `-inset-y-full`) so lines span section boundaries |

Implementation must replace the ad-hoc gutter math with the contracts below.

## Research evidence (Playwright, July 19, 2026)

Artifacts under `docs/.playwright-cli/`:

- Screenshots: `mistral-1440-now.png`, `mistral-1920.png`, `mistral-390.png`, `efferd-1440.png`, `efferd-1920.png`, `deep-*.png`, `measure-*.png`
- JSON: `mistral-1920-data.json`, `efferd-1440-data.json`, `efferd-1920-data.json`, `layout-measure-mistral-efferd.json`

### Mistral — exact measured values

Viewport tooling: Chromium headless, Playwright.

| Surface                                   |                   390 × 844 |                 1440 × 1000 |                               1920 × 1080 |
| ----------------------------------------- | --------------------------: | --------------------------: | ----------------------------------------: |
| Header outer                              |          full bleed `w=390` |         full bleed `w=1440` |                       full bleed `w=1920` |
| Header height                             |                   **49 px** |                   **49 px** |                                 **49 px** |
| Header bottom border                      |         `1px solid #e4e3de` |                        same |                                      same |
| Header **inner** frame (`.max-w-432`)     |         `w=390`, gutter `0` |        `w=1440`, gutter `0` |            **`w=1728`, gutter `96 / 96`** |
| Body sticky frame (`.max-w-432.border-x`) | full width + `border-x 1px` | full width + `border-x 1px` | **`1728` + gutter `96` + `border-x 1px`** |
| Logo left edge                            |                         `0` |               `0` (at 1440) |               **`96`** (aligned to frame) |
| Rightmost header control right edge       |                        edge |                        edge |                    **`96` from viewport** |
| Content inset (title column)              |          `pl-4` → **16 px** |      `lg:pl-10` → **40 px** |                                 **40 px** |
| Hero column split                         |               single column |              ~**70% / 30%** |                            ~**70% / 30%** |

Structural classes (observed, not to copy as brand):

```text
header.fixed.top-0.w-full.border-b.border-border-primary.divide-x
  > div.max-w-432.mx-auto.w-full.divide-x     /* inner chrome shares frame */

main / sticky shell
  .max-w-432.w-full.mx-auto.border-x.border-border-primary
```

CSS tokens observed:

| Token / utility          | Computed                                                     |
| ------------------------ | ------------------------------------------------------------ |
| `--spacing`              | `0.25rem` (4 px)                                             |
| `.max-w-432`             | **`max-width: 1728px`** (= 432 × 4 px)                       |
| `--color-border-primary` | **`#e4e3de`** → `rgb(228, 227, 222)`                         |
| Side rails               | real `border-left` + `border-right` **1 px**, not box-shadow |

**Mistral grammar (portable):**

1. One **frame max-width** shared by header inner and page body.
2. Outer side space = `max(0, (100vw - frameMax) / 2)` — **not** a constant padding on every breakpoint.
3. Frame edges carry **1 px vertical rules** (`border-x`) for the page body.
4. Header is full-bleed background, but its **interactive row** is width-locked to the same frame so logo/CTA align with content rails.
5. Internal reading padding (`16 / 40`) is separate from outer gutters.

### Efferd — exact measured values

| Surface                        |                                                       1440 × 1000 |             1920 × 1080 |
| ------------------------------ | ----------------------------------------------------------------: | ----------------------: |
| `.site-container` max-width    |                                                       **1408 px** |             **1408 px** |
| Side gutter (frame → viewport) |                                                 **16 px / 16 px** |     **256 px / 256 px** |
| Header height                  |                                                **56 px** (`h-14`) |               **56 px** |
| Header inner                   | `cpx site-container`, **`padding-inline: 24px`**, same 1408 frame |                    same |
| Logo left (includes inner pad) |                                  **40 px** (= 16 gutter + 24 pad) | **280 px** (= 256 + 24) |

Continuous rail technique on `main` (observed class string):

```text
site-container relative grow
  before:absolute before:-inset-y-full before:-left-px before:w-px before:bg-border
  after:absolute  after:-inset-y-full  after:-right-px  after:w-px  after:bg-border
```

Computed `::before` on main @ 1440:

- `content: ""`
- `position: absolute`
- `width: 1px`
- `left: -1px` (sits on the outer edge of the frame)
- `top/bottom` extended via `-inset-y-full` so the line **continues across stacked siblings**
- `background` = border color (not `border-left` on the box itself)

**Efferd grammar (portable):**

1. Shared **site container** max-width for header row and main.
2. Minimum inline breathing room when viewport ≈ container (measured **16 px** floor at 1440 with max 1408).
3. **Pseudo rails** (1 px, absolute, extended on Y) so modules stacked inside the frame inherit one vertical alignment column — borders of cards/sections meet the same left/right rule.
4. Optional inner content pad (`.cpx` → **24 px**) inside the frame; rails stay on the frame edge, not on the padded content edge.

## Better T Stack contract

### Tokens

Add (or replace the previous ad-hoc gutter) in `apps/web/src/app/global.css`:

| Token                | Value                        | Role                                                                                                                                                                           |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--frame-max`        | `1728px`                     | Shared header/body max width (Mistral-equivalent scale; BTS previously used 1600 — **raise to 1728** unless design review prefers keeping 1600; default this spec to **1728**) |
| `--frame-gutter-min` | `16px`                       | Floor side space when `100vw` is only slightly above content needs (Efferd floor). Applied as **padding on a shell**, not by inventing a second max-width.                     |
| `--frame-inline-pad` | `clamp(1rem, 2.5vw, 2.5rem)` | Internal content pad inside the frame (Mistral `16→40`, Efferd header `24`). Maps roughly to existing section `px-5` / `lg:px-12` — converge, don’t double-pad.                |
| `--frame-rail`       | `1px solid var(--rule)`      | Side rail stroke; always `--rule`, never Mistral `#e4e3de`                                                                                                                     |
| `--header-height`    | `3.5rem` (56 px)             | Keep BTS header (already `h-14`); Mistral’s 49 is reference-only                                                                                                               |

`DESIGN.md` should list the same tokens. Remove the misleading always-on `page-gutter` width subtraction as the primary mechanism.

### Layout architecture

```text
body
└── (home) layout
    ├── SiteHeader                    /* position: fixed; full-bleed bg optional */
    │   └── .ui-frame.ui-frame--chrome  /* max-width + mx-auto; NO side border required */
    │       └── header cells (divide-x / border-rule)
    └── .pt-[var(--header-height)]
        └── main.ui-frame.ui-frame--page  /* max-width + mx-auto + side rails */
            ├── section  /* modules share rail column; prefer border-y + internal rules */
            ├── section
            └── footer
```

Optional outer shell when a minimum gutter is desired below `--frame-max`:

```text
.ui-shell {
  /* Only if product wants always-visible side margin below 1728 */
  padding-inline: var(--frame-gutter-min); /* 16px */
}
.ui-frame {
  width: 100%;
  max-width: var(--frame-max);
  margin-inline: auto;
}
```

**Preferred (Mistral-faithful) default:**

```css
.ui-frame {
  width: 100%;
  max-width: var(--frame-max); /* 1728px */
  margin-inline: auto;
}

.ui-frame--page {
  position: relative;
  border-inline: none; /* rails drawn by pseudos — see below */
}

/* Efferd-style continuous rails */
.ui-frame--page::before,
.ui-frame--page::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--rule);
  pointer-events: none;
  z-index: 2;
}
.ui-frame--page::before {
  left: 0;
}
.ui-frame--page::after {
  right: 0;
}
```

If modules are **siblings of** the frame rather than children, move rails to a wrapper that wraps all home sections, or use Efferd’s `-inset-y-full` on each section’s shared container so rails stitch together.

### Header rules

File: `apps/web/src/components/site/site-header.tsx`

1. Outer `<header>` may be `fixed inset-x-0` with background.
2. Inner row **must** use `.ui-frame` (same max-width as `main`).
3. Do **not** put full-viewport `border-b` that extends into the outer gutter past the frame on wide screens — put `border-b border-rule` on the **inner** `.ui-frame` row so the bottom rule stops at the vertical rails (Mistral: bottom rule is full-bleed, but logo/CTA align to frame; BTS should prefer **rule stops at frame** for cleaner wide-screen gutters, unless QA prefers full-bleed hairline).
4. Header cell dividers stay `border-rule` / `divide` inside the frame only.
5. Mobile full-screen nav dialog remains `fixed inset-0` (full viewport) — **not** constrained by the frame.

### Page / module rules

Files: `apps/web/src/app/(home)/layout.tsx`, `page.tsx`, section components, `global.css`

1. `main` (home) uses `.ui-frame.ui-frame--page` (or a single wrapper around all home sections).
2. Sections are full width **of the frame** (edge to rail). Horizontal padding for copy uses `--frame-inline-pad` or existing `px-5 sm:px-8 lg:px-12` — one system only.
3. Module separators are `border-t border-rule` (or grid rules) that **meet** the vertical rails. Avoid `rounded-*` outer chrome on page modules.
4. Nested cards inside a module may use their own borders; when a grid of cells touches the frame edge, the outer cell border should **coincide** with the rail (collapse double borders via shared parent `gap-px bg-rule` or by omitting the outer edge border on edge cells — Efferd often uses `gap-px bg-border` grids).
5. Full-bleed decorative backgrounds (grids, signal fields) stay **inside** the rails, not under the outer gutter.

### What not to do

- Do not apply random `px-*` on `body` without updating the fixed header the same way.
- Do not use a different max-width for header vs main.
- Do not color rails with `--primary` / gold.
- Do not copy Mistral `max-w-432` class names, cream `#e4e3de`, or Efferd light theme.
- Do not animate rail positions.

## Implementation plan

### PR 1 — Tokens + frame primitive

1. Define `--frame-max`, `--frame-gutter-min`, `--frame-inline-pad`, `--frame-rail` in `global.css` (+ `DESIGN.md`).
2. Rewrite `.ui-frame` to `width: 100%; max-width: var(--frame-max); margin-inline: auto`.
3. Add `.ui-frame--page` continuous rails (pseudo or explicit).
4. Remove the previous `calc(100% - page-gutter * 2)` approach.
5. Point home `main` and header inner at the shared primitive.

### PR 2 — Header alignment

1. Ensure header inner is `.ui-frame` and bottom rule aligns with rails.
2. Verify logo left edge and primary CTA right edge share the frame at 1440 and 1920.
3. Keep mobile drawer full-bleed.

### PR 3 — Section seam cleanup

1. Walk hero, sponsors, command, mosaic, capability, stats, testimonials, footer.
2. Guarantee horizontal rules and grids meet the vertical rails (no 1 px gap, no double 2 px stack on the outer edge).
3. Normalize inline padding to one token scale.

## Acceptance criteria

- [ ] At **1920 × 1080**, header inner and main frame are **1728 px** wide (±1 px), centered, with **~96 px** outer gutter each side.
- [ ] At **1440 × 1000**, frame is effectively full content width (minus optional `--frame-gutter-min` if enabled); logo and body content share the same left origin (±1 px).
- [ ] At **390 × 844**, no horizontal scroll; frame is full width; rails either sit on the viewport edge or inset by at most `--frame-gutter-min`.
- [ ] Vertical rails are **1 px**, color `var(--rule)`, continuous from the top of the home main through the footer (visually unbroken at section joins).
- [ ] Header controls and hero content columns align to the same left/right frame edges.
- [ ] No Mistral/Efferd palette values, assets, or copy introduced.
- [ ] `bun run check` passes.

## Verification plan

1. Playwright measure script (reuse pattern from this research) at **390 / 1440 / 1920**:
   - `header .ui-frame` → `getBoundingClientRect()` left/right
   - `main.ui-frame` → same
   - assert `abs(headerLeft - mainLeft) <= 1` and same for right
   - assert `mainWidth === min(viewport - 2*gutterMin, frameMax)` within 1 px
2. Screenshots of `/` desktop + wide + mobile; compare rail continuity at section boundaries.
3. Keyboard: tab header → first in-page CTA; focus rings remain visible against rails.
4. Reduced motion: no change required for static rails.
5. `bun run check`.

## Mapping to existing files

| Concern                 | File                                           |
| ----------------------- | ---------------------------------------------- |
| Tokens + `.ui-frame`    | `apps/web/src/app/global.css`                  |
| Design tokens doc       | `DESIGN.md`                                    |
| Header shell            | `apps/web/src/components/site/site-header.tsx` |
| Home layout padding top | `apps/web/src/app/(home)/layout.tsx`           |
| Home main frame         | `apps/web/src/app/(home)/page.tsx`             |
| Section edges           | `apps/web/src/app/(home)/_components/*`        |
| Editorial context       | `docs/spec-home-editorial-system.md`           |

## Decision log

| Decision           | Choice                                                          | Rationale                                                                                                      |
| ------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Frame max          | **1728 px** (Mistral-measured) over old 1600                    | Matches reference scale; gutters appear on common ultrawide; product may pin 1600 in review if density prefers |
| Outer gutter model | max-width centering first; optional 16 px floor                 | Faithful to Mistral; Efferd floor only if design wants always-on side air below max                            |
| Rail technique     | Prefer **pseudo 1 px rails** (Efferd) over only `border-inline` | Continuity across modules; easier to extend with `-inset-y-full` if sections are siblings                      |
| Header height      | Keep **56 px** BTS                                              | Spec is about frame/rails, not shrinking chrome to Mistral’s 49                                                |
| Border color       | `--rule`                                                        | Existing system manual identity                                                                                |

## Out of scope

- Restyling docs (`fumadocs`) chrome to this frame (can share tokens later).
- Changing stack builder (`/new`) dense workspace layout.
- Pixel-perfect recreation of Mistral hero canvas or Efferd marketing cards.
- New animation libraries.
