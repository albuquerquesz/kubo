# Spec: Kubo Home UI Polish & Brand Swap

## Status

Ready for implementation

## Date

July 19, 2026

## Goal

Resolve four concurrent home/shell UI defects and rebrand the marketing surface from **Better T Stack** to **Kubo**, using visual evidence from the current rendered homepage:

1. **Hero grid noise** — remove the square grid (`ui-rule-grid`) from the entire hero section.
2. **Product mosaic overflow** — remove the horizontal rule above mosaic titles; keep all title + description content fully inside each tile at every breakpoint.
3. **Brand rename** — replace every user-facing **"Better T Stack"** string with **"Kubo"**.
4. **Brand mark** — rename `apps/web/public/assets/idk.png` → `kubo.png` and use it as the primary logo mark in place of the monogram `B_`.

This is a polish + rebrand pass on the existing editorial system (`spec-home-editorial-system.md`, `spec-home-product-mosaic.md`). It does **not** redesign layout grammar, routes, or the page frame.

## Visual evidence (source captures)

| Capture         | Surface                | Observed defect / intent                                                                                                                             |
| --------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image #1        | Hero headline          | Dark field with faint square grid behind `One command. / Every layer. / Yours.` — grid must disappear across the **whole** hero module               |
| Image #2        | Product mosaic         | Cards show a thin `border-t` rule above each title; descriptions on Analytics (`05`) and Catalog (`04`) clip or spill into adjacent structural cells |
| Image #3        | Site header brand mark | Gold square with monogram `B_` + wordmark `Better T Stack` — replace mark with `kubo.png` and wordmark with `Kubo`                                   |
| Asset `idk.png` | Brand art              | Yellow pixel-style character (Space Invader–like) on black, 1402×1122 PNG — becomes the official Kubo mark after rename                              |

## Scope

### In scope

| Area                           | Path(s)                                                                    |
| ------------------------------ | -------------------------------------------------------------------------- |
| Hero section                   | `apps/web/src/app/(home)/_components/hero-section.tsx`                     |
| Product mosaic                 | `apps/web/src/app/(home)/_components/product-mosaic-section.tsx`           |
| Site header brand              | `apps/web/src/components/site/site-header.tsx`                             |
| Footer brand                   | `apps/web/src/app/(home)/_components/footer.tsx`                           |
| Command section copy           | `apps/web/src/app/(home)/_components/command-section.tsx`                  |
| Manifest / PWA name            | `apps/web/src/app/manifest.ts`, `apps/web/public/favicon/site.webmanifest` |
| Docs layout brand (if visible) | `apps/web/src/app/layout.config.tsx`                                       |
| Brand asset                    | `apps/web/public/assets/idk.png` → `apps/web/public/assets/kubo.png`       |

### Out of scope

- Renaming CLI package (`kubojs`), npm package, monorepo package names, or GitHub repo URL.
- Changing domains (`better-t-stack.dev`), OG image hosts, Convex package imports, or `ICON_BASE_URL`.
- Redesigning mosaic asymmetric grid placement or adding new mosaic items.
- Removing `ui-rule-grid` from **non-hero** modules (command, stats, footer structural cells, mosaic idle cells) unless a follow-up explicitly expands scope.
- New design tokens, fonts, or color palette changes.

---

## Issue 1 — Hero: remove square grid background

### Current state (code)

In `hero-section.tsx`:

1. **Main headline column** (left, `lg:col-span-8`):

```tsx
<div
  aria-hidden
  className="ui-rule-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_72%)]"
/>
```

2. **Aside build-stages column** (right, `lg:col-span-4`):

```tsx
<div className="ui-rule-grid relative flex flex-1 flex-col justify-center gap-8 p-5 sm:p-8">
```

`.ui-rule-grid` (global.css) draws a 3 rem square lattice via dual linear-gradients on `--rule` at ~62% opacity.

### Target state (UI contract)

| Surface                                                  | Before                                     | After                                                      |
| -------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| Hero left column background                              | Faint square grid, faded via vertical mask | Solid `--background` only; no grid pattern                 |
| Hero aside (stages stack) background                     | `ui-rule-grid` under stage cards           | Solid `--card` (parent already `bg-card`); no grid pattern |
| Hero outer section, bottom layer row, borders            | Unchanged                                  | Unchanged — keep `border-rule` structural lines            |
| Vertical gold guide line in aside (`w-px bg-primary/55`) | Present                                    | Keep (not part of the square grid)                         |
| Stage cards, CTAs, footer strip of hero                  | Unchanged                                  | Unchanged                                                  |

### Implementation rules

1. **Delete** the absolute decorative `ui-rule-grid` node in the left column entirely (do not set `opacity-0` or hide with CSS — remove the DOM node).
2. **Strip** `ui-rule-grid` from the aside container class list. Keep `relative flex flex-1 flex-col justify-center gap-8 p-5 sm:p-8`.
3. Do **not** remove section-level `border-rule` / `border-b` / column `border-r` — those are the editorial frame, not the square grid.
4. Do **not** change the global `.ui-rule-grid` utility definition; other modules still use it.

### Acceptance

- At 1440 px and 390 px, hero shows **zero** square lattice behind the headline, body copy, CTAs, or stage cards.
- Structural 1 px rules between hero columns and the bottom “Web / API / Database / Infrastructure” strip remain.
- No layout shift vs. current hero spacing.

---

## Issue 2 — Product mosaic: title border + content overflow

### Visual diagnosis (Image #2)

| Symptom                                                       | Where                     | Root cause in code                                                                               |
| ------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| Thin horizontal rule above every title                        | All tiles (01–07)         | `MosaicTile` wraps title+description in `border-t pt-4`                                          |
| Description of `04 / Stack catalog` bleeds into idle cell A   | Bottom of catalog tile    | Fixed `lg:auto-rows-[9rem]` + content taller than allocated rows; overflow not clipped/contained |
| Description of `05 / Analytics` bleeds into structural cell B | Bottom of analytics tile  | Same: short single-row cells cannot fit kicker + title + multi-line description                  |
| Partial text visible over grid cells                          | Idle structural cells A/B | Overflowing sibling content paints into adjacent grid tracks                                     |

### Current mosaic structure (relevant)

```text
nav (lg: 12 cols, auto-rows: 9rem)
├── 02 Builder     (col 1–3, rows 1–2)  ← tall, usually OK
├── 01 Featured    (col 4–8, rows 1–2)  ← gold, usually OK
├── 03 Docs        (col 9–12, row 1)
├── 04 Catalog     (col 9–12, row 2)    ← overflow risk
├── 05 Analytics   (col 1–3, row 3)     ← overflow risk
├── 06 Showcase    (col 4–8, row 3)
├── Idle A         (col 9–12, row 3)    ← gets spill from 04/06
├── Idle B         (col 1–3, row 4)     ← gets spill from 05
└── 07 Sponsors    (col 4–12, row 4)
```

Each tile:

```tsx
className="… flex min-h-40 flex-col justify-between …"
// bottom block:
<span className={`mt-10 border-t pt-4 ${dividerClassName}`}>
  <span className="… text-2xl / sm:text-3xl …">{title}</span>
  <span className="mt-3 … text-sm …">{description}</span>
</span>
```

### Target visual (per tile)

```text
┌─────────────────────────────────────┐
│  0N / EYEBROW                    ↗  │  ← top row: kicker + arrow
│                                     │
│  Title line one.                    │  ← NO border-t above title
│  Title line two if needed.          │
│                                     │
│  Description stays fully inside     │  ← never paints outside tile
│  the tile padding box.              │
└─────────────────────────────────────┘
```

### UI contract — title divider

| Element               | Before                                               | After                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rule above title      | `border-t` + `pt-4` on title block                   | **Remove** `border-t` and the featured/muted `dividerClassName` usage for that rule                                                                                          |
| Spacing above title   | `mt-10` + `pt-4`                                     | Keep a single vertical gap: `mt-8` or `mt-10` (no extra `pt` for a missing border). Prefer `mt-auto` on the title block so content anchors to the bottom without a fake rule |
| Featured gold tile    | Dark rule `border-primary-foreground/25` above title | No rule; title/description contrast unchanged                                                                                                                                |
| Neutral / muted tiles | `border-rule` above title                            | No rule                                                                                                                                                                      |

Remove `dividerClassName` if it becomes unused after the border drop.

### UI contract — containment & overflow

Every mosaic tile must satisfy:

1. **Hard containment:** `overflow-hidden` on the tile `Link` (or an inner full-size wrapper). Adjacent idle cells never receive painted text from a neighbor.
2. **Content stays inside padding:** title + description must remain within the content box defined by `p-5 sm:p-6 lg:p-7`.
3. **Row sizing on desktop (`lg+`):** either:
   - **Preferred:** increase `lg:auto-rows` so single-row tiles comfortably fit kicker + title + ~2–3 lines of description (target floor ≈ `11rem`–`12.5rem`, validate visually), **or**
   - **Alternative:** keep `9rem` only if descriptions on short tiles are shortened to ≤ ~90 characters and still fully visible.
4. **Do not** use `absolute` positioning for title/description to “force” fit.
5. **Do not** clip mid-glyph without ellipsis: if clipping is unavoidable at extreme zoom, use line-clamp with ellipsis (`line-clamp-2` / `line-clamp-3`) rather than raw overflow cut-off. Prefer increasing row height so clamps are unnecessary at 1440 and 1280.
6. Featured tile (2-row span) and tall builder tile keep current generous space; do not shrink them to fix short tiles.

### Copy length budget (desktop short tiles)

For tiles that occupy a single auto-row at `lg`:

| Field       | Budget                                                                    |
| ----------- | ------------------------------------------------------------------------- |
| Title       | Prefer ≤ 2 lines at `text-2xl` / `sm:text-3xl` in the tile’s column width |
| Description | Prefer ≤ 2 lines at `text-sm leading-relaxed` inside `max-w-md`           |

If current Analytics description overflows after row-height bump, rewrite in place (and swap brand name — Issue 3):

- Before: `See public adoption and ecosystem activity around Better T Stack.`
- After: `See public adoption and ecosystem activity around Kubo.`

Keep meaning; trim only if layout still fails after height fix.

### Interaction (unchanged)

- Full-surface `Link`, hover ring/background, focus-visible outline, arrow motion under `motion-safe` — all stay per `spec-home-product-mosaic.md`.
- Removing the title border must not remove hover/focus feedback.

### Acceptance

- No `border-t` (or equivalent 1 px rule) between kicker and title on any mosaic tile.
- At 1440 × 1000, 1280 × 800, 768 × 1024, and 390 × 844: no title or description paints outside its tile; idle cells show only their own quiet marker/grid.
- Featured gold tile remains dominant; layout asymmetry preserved.
- Keyboard tab order and hrefs unchanged.

---

## Issue 3 — Rename brand: Better T Stack → Kubo

### Product language

| Context                   | Old                                              | New                                  |
| ------------------------- | ------------------------------------------------ | ------------------------------------ |
| Display name              | Better T Stack                                   | **Kubo**                             |
| Short / wordmark          | Better T Stack                                   | **Kubo**                             |
| Possessive / “around …”   | around Better T Stack                            | around **Kubo**                      |
| Navigate / Explore labels | Navigate Better T Stack / Explore Better T Stack | Navigate **Kubo** / Explore **Kubo** |
| Copyright                 | © {year} Better T Stack / MIT                    | © {year} **Kubo** / MIT              |
| Aria home                 | Better T Stack home                              | **Kubo** home                        |
| Aria GitHub               | Better T Stack on GitHub                         | **Kubo** on GitHub                   |
| PWA `name` / `short_name` | Better T Stack                                   | **Kubo**                             |

### Inventory (apps/web — must update)

| File                                                    | Occurrences to change                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/components/site/site-header.tsx`                   | `aria-label`, wordmark span, mobile “Navigate …”, GitHub `aria-label` |
| `src/app/(home)/_components/footer.tsx`                 | `aria-label`, wordmark, copyright line                                |
| `src/app/(home)/_components/product-mosaic-section.tsx` | Analytics description; `aria-label` on explore nav                    |
| `src/app/(home)/_components/command-section.tsx`        | Body sentence starting with product name                              |
| `src/app/manifest.ts`                                   | `name`, `short_name`                                                  |
| `apps/web/public/favicon/site.webmanifest`              | `name`, `short_name`                                                  |
| `src/app/layout.config.tsx`                             | Visible “Better T Stack” span in docs chrome                          |

### Explicit non-goals for this rename

Do **not** change in this pass (unless already part of a separate product decision):

- Package names: `kubojs`, `@kubo/*`
- CLI commands shown in docs/examples (`bun create better-t-stack@latest`) — product still generates via that CLI until a package rename ships
- External URLs: GitHub org/repo, Discord, npm, `better-t-stack.dev`, R2 icon host
- Content docs that describe the CLI package (`content/docs/...`) beyond pure display branding if they refer to the package name
- Code comments, git history, AGENTS.md monorepo identity

If a string is **user-visible brand** → Kubo.  
If a string is a **package/URL identifier** → leave as-is.

### Tone note

“Kubo” is a single short word. Prefer:

- “Kubo home” not “Kubo Stack home”
- “around Kubo” not “around the Kubo”
- Keep surrounding sentence grammar natural after the swap

### Acceptance

- Grep for `Better T Stack` under `apps/web/src` and user-facing manifests returns **zero** matches (package/CLI identifiers may still contain `better-t-stack`).
- Header, footer, mosaic aria labels, command blurb, and PWA names show **Kubo**.

---

## Issue 4 — Brand mark asset: `idk.png` → `kubo.png`

### Asset

| Property     | Value                                                                       |
| ------------ | --------------------------------------------------------------------------- |
| Current path | `apps/web/public/assets/idk.png`                                            |
| New path     | `apps/web/public/assets/kubo.png`                                           |
| Format       | PNG, RGB, ~1402×1122                                                        |
| Motif        | Flat yellow pixel character (two antennae, square eyes, open base) on black |
| Role         | Primary Kubo logomark                                                       |

### Rename operation

1. `git mv apps/web/public/assets/idk.png apps/web/public/assets/kubo.png` (preserve history).
2. Confirm no remaining references to `idk.png` (grep `public` + `src`).
3. Public URL becomes `/assets/kubo.png`.

### Where the mark appears (replace monogram `B_`)

#### Site header — `BrandMark` (`site-header.tsx`)

**Before (Image #3):**

```text
┌──────┐  Better T Stack
│  B_  │
└──────┘
  32×32 gold square, mono “B_”
```

**After:**

```text
┌──────┐  Kubo
│  👾  │   ← next/image or <img> of /assets/kubo.png
└──────┘
```

| Prop         | Spec                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container    | Keep `size-8` (32×32) box for layout stability with the 56 px (`h-14`) header                                                                                                                                                                                                                                                                                                                |
| Background   | Prefer transparent or `bg-primary` only if the PNG needs a gold plate; the asset is yellow-on-black — on dark header, use the image **without** the old gold plate **or** keep a primary square and mask/crop the character to sit cleanly. **Recommended default:** `size-8` container, `overflow-hidden`, image `object-contain` (or `object-cover` if crop is intentional), no “B\_” text |
| Border       | Optional 1 px `border-primary` only if contrast needs a frame; otherwise borderless to match a pure mark                                                                                                                                                                                                                                                                                     |
| Alt / a11y   | Decorative when adjacent wordmark “Kubo” is visible: `alt=""` + `aria-hidden` on the image; the `Link` keeps `aria-label="Kubo home"`. If wordmark is hidden on the smallest breakpoints, ensure the link still has the accessible name “Kubo home”                                                                                                                                          |
| Image import | Prefer `next/image` with static import or `src="/assets/kubo.png"`; width/height 32 display, intrinsic can stay full res                                                                                                                                                                                                                                                                     |

#### Footer brand block

Same swap: replace the `B_` monogram cell with `kubo.png` at `size-10` (footer currently uses 40×40), wordmark **Kubo**.

#### Docs layout (`layout.config.tsx`)

If the docs chrome still shows the old dual light/dark logos or a “Better T Stack” string, align the **visible product name** to Kubo. Prefer reusing `/assets/kubo.png` when practical; do not invent a second mark.

### Do not

- Leave `idk.png` on disk under the old name.
- Reference remote URLs for the mark when the local asset exists.
- Use the monogram `B_` anywhere in the marketing shell after this pass.
- Scale the image above the header cell so it breaks the 56 px header height.

### Acceptance

- File exists only as `apps/web/public/assets/kubo.png`.
- Header and footer show the yellow character mark + **Kubo** wordmark.
- No `B_` monogram remains in header/footer brand components.
- Image is crisp at 1× and 2× (PNG is large enough for retina at 32–40 px display).

---

## Implementation order

1. **Asset rename** (`idk.png` → `kubo.png`) — unblocks mark work.
2. **Hero grid removal** — isolated, low risk.
3. **Mosaic border + overflow** — visual QA-heavy.
4. **Brand string swap** — mechanical, grep-driven.
5. **Wire `kubo.png` into header + footer** (and docs chrome if in scope).
6. **Verification** (below).

Suggested single commit message:

```text
fix(web): rebrand home shell to Kubo and polish hero/mosaic UI
```

Or split:

```text
fix(web): remove hero rule-grid and contain mosaic tile content
feat(web): rebrand marketing shell to Kubo with kubo.png mark
```

---

## Files checklist

| File                                                             | Actions                                                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/web/public/assets/idk.png`                                 | Rename to `kubo.png`                                                        |
| `apps/web/src/app/(home)/_components/hero-section.tsx`           | Remove both hero `ui-rule-grid` usages                                      |
| `apps/web/src/app/(home)/_components/product-mosaic-section.tsx` | Drop title `border-t`; fix overflow/row height; brand string in copy + aria |
| `apps/web/src/components/site/site-header.tsx`                   | Mark image + Kubo strings                                                   |
| `apps/web/src/app/(home)/_components/footer.tsx`                 | Mark image + Kubo strings                                                   |
| `apps/web/src/app/(home)/_components/command-section.tsx`        | Brand sentence → Kubo                                                       |
| `apps/web/src/app/manifest.ts`                                   | name / short_name → Kubo                                                    |
| `apps/web/public/favicon/site.webmanifest`                       | name / short_name → Kubo                                                    |
| `apps/web/src/app/layout.config.tsx`                             | Visible brand string → Kubo; optional mark                                  |

No changes required to `global.css` `.ui-rule-grid` utility for this pass.

---

## Accessibility

- Hero: removing decorative grids reduces visual noise; no ARIA changes required beyond deleting `aria-hidden` grid nodes.
- Mosaic: full-card links keep single focus stop; focus-visible outline must remain outside clipped content (`outline-offset` already negative — verify `overflow-hidden` does not clip the focus ring; if it does, move `overflow-hidden` to an inner content wrapper and keep outline on the outer link).
- Brand link: always exposes accessible name “Kubo home”.
- Mark image: decorative when wordmark present (`alt=""`).

## Responsive matrix

| Viewport    | Hero                        | Mosaic                                         | Brand                                                                |
| ----------- | --------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| 1440 × 1000 | No grid; stages panel clean | No title rules; no spill into idle cells       | Mark 32 px + “Kubo”                                                  |
| 1280 × 800  | Same                        | Single-row tiles still contain copy            | Same                                                                 |
| 768 × 1024  | Single-column hero, no grid | 6-col recomposition; full descriptions visible | Same                                                                 |
| 390 × 844   | No grid; stacked stages     | One-column tiles ≥ 44 px targets; no clip      | Wordmark may hide (`sm:inline`); mark + aria-label still “Kubo home” |

## Verification plan

1. `rg "Better T Stack" apps/web` → zero intentional UI hits (document any remaining package/docs exceptions).
2. `rg "idk\\.png|B_" apps/web/src` → no brand monogram / old asset refs in shell.
3. `ls apps/web/public/assets/kubo.png` exists; `idk.png` gone.
4. `bun run check` from repo root.
5. Visual: `bun dev`, open `/` at 1440, 768, 390:
   - Hero: pure dark field behind type; aside without lattice.
   - Mosaic: no line above titles; descriptions fully inside cards; idle cells clean.
   - Header/footer: Kubo mark + wordmark.
6. Keyboard: Tab through mosaic tiles; focus ring fully visible; Enter navigates.
7. Optional Playwright screenshots for before/after under `docs/.playwright-cli/` if regression suite exists.

## Acceptance criteria (roll-up)

- [ ] Hero section has **no** `ui-rule-grid` square background anywhere (main column + aside).
- [ ] Mosaic tiles have **no** horizontal rule above titles.
- [ ] Mosaic title + description never render outside their tile at 1440 / 1280 / 768 / 390.
- [ ] All user-facing **Better T Stack** brand strings in the web app shell → **Kubo**.
- [ ] `kubo.png` is the only brand asset under `public/assets` for this mark; used in header (and footer).
- [ ] `B_` monogram removed from marketing brand components.
- [ ] Package/CLI identifiers and external URLs left intact.
- [ ] `bun run check` passes.

## Relationship to prior specs

| Spec                                   | Relationship                                                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `spec-home-editorial-system.md`        | Parent visual system; this pass **drops** hero grid decoration that earlier drafts allowed as optional texture                        |
| `spec-home-product-mosaic.md`          | Mosaic IA/routes unchanged; this pass tightens containment and removes the title divider not required by the original mosaic contract |
| `spec-page-frame-and-aligned-rails.md` | Untouched; outer rails and frame remain                                                                                               |

When this ship lands, treat “Kubo” as the canonical marketing name in future home specs; keep CLI package naming as a separate ADR if/when it changes.
