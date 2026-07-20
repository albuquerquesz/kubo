# Spec: Kubo Header Mark Scale & Hero Aside Trim

## Status

Implemented (July 19, 2026)

## Date

July 19, 2026

## Goal

Four follow-up polish items after `spec-kubo-home-ui-polish.md`, driven by rendered captures of the post-rebrand home shell:

1. **Header mark scale** — enlarge the Kubo logomark inside the fixed `h-14` site header.
2. **Header mark↔wordmark gap** — tighten horizontal spacing between the mark and the “Kubo” title.
3. **Transparent mark asset** — keep `kubo.png` (yellow on black) as source art; ship a **copy** with exterior black removed for use on dark UI chrome.
4. **Hero aside trim** — delete the bottom **Output / License** pair and shorten the right column so it hugs the build-stage stack instead of filling the viewport.

This pass does **not** change routes, mosaic IA, brand copy (“Kubo”), or the editorial left-hero type lockup.

## Visual evidence (source captures)

| Capture               | Surface                | Observed defect / intent                                                                                                                                                                                                                                                                                |
| --------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image #1 — hero shell | Full hero at desktop   | Left: `One command. / Every layer. / Yours.` on solid dark field (grid already removed). Right: stage cards 01–04 + **OUTPUT / Source code** and **LICENSE / MIT** foot cells. Aside stretches to match left viewport height, leaving empty chrome above/below the stack and a heavy bottom meta strip. |
| Asset `kubo.png`      | Brand art source       | Yellow pixel invader (antennae, square eyes, open base) on **solid black** plate, **1402×1122** RGB PNG. On dark header the black plate reads as a muddy square around the character.                                                                                                                   |
| Composite check       | `kubo-mark.png` on red | Exterior black is fully transparent; yellow body + solid black eye squares preserved (flood-fill from edges, not global color-key).                                                                                                                                                                     |

### Capture files (repo)

| Path                                                     | Role                                              |
| -------------------------------------------------------- | ------------------------------------------------- |
| `docs/captures/hero-aside-output-license-2026-07-19.png` | Image #1 — hero with Output/License cells visible |
| `docs/captures/kubo-source-black-bg.png`                 | Copy of source mark (black plate)                 |
| `docs/captures/kubo-mark-transparent.png`                | Transparent mark reference                        |
| `docs/captures/kubo-mark-on-red-check.png`               | QA composite proving exterior alpha               |

### Image #1 — measured structure (desktop)

```text
┌──────────────────────────────────────┬────────────────────────────┐
│  One command.                        │  ┌─ gold vertical guide ─┐ │
│  Every layer.   (primary gold)       │  │ 01 Frontend Next.js   │ │
│  Yours.                              │  │ 02 API Elysia         │ │
│                                      │  │ 03 Database Postgres  │ │
│  ───────────────── rule ───────────  │  │ 04 Auth Better Auth   │ │
│  body copy …   [Build] [Docs]        │  ├──────────┬────────────┤ │
│                                      │  │ OUTPUT   │ LICENSE    │ │  ← remove
│                                      │  │ Source…  │ MIT        │ │  ← remove
└──────────────────────────────────────┴──┴──────────┴────────────┘
        lg:col-span-8                         lg:col-span-4
        min-h ≈ 100svh - header               was matching full height
```

Observed issues on the right column:

| Symptom          | Evidence from Image #1                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Meta strip noise | Two-cell foot row labeled `OUTPUT` / `LICENSE` with values `Source code` / `MIT`            |
| Excess height    | Aside matches left full-viewport column; stage stack floats in a tall empty `bg-card` field |
| Redundant facts  | “Source code” / “MIT” already appear elsewhere in the product story (footer, copy)          |

### Header brand cluster — before (post-rebrand baseline)

```text
┌─ h-14 (56px) header ─────────────────────────────────────────┐
│ [ gap-3 (12px) ]                                              │
│ ┌──────┐                                                      │
│ │ 32px │  Kubo          ← size-8 mark, black-plate asset      │
│ │ mark │                                                      │
│ └──────┘                                                      │
└───────────────────────────────────────────────────────────────┘
```

Issues:

| Symptom        | Detail                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------- |
| Mark too small | `size-8` (32×32) under-reads next to wordmark and primary nav                               |
| Loose cluster  | `gap-3` (12px) between mark and “Kubo” feels disconnected                                   |
| Black plate    | `kubo.png` carries opaque black; on dark header becomes a soft square, not a pure character |

---

## Scope

### In scope

| Area                                              | Path(s)                                                                                |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Site header brand                                 | `apps/web/src/components/site/site-header.tsx`                                         |
| Hero aside                                        | `apps/web/src/app/(home)/_components/hero-section.tsx`                                 |
| Transparent mark asset                            | `apps/web/public/assets/kubo-mark.png` (new)                                           |
| Source mark retained                              | `apps/web/public/assets/kubo.png` (unchanged)                                          |
| Footer / docs chrome mark (use transparent asset) | `apps/web/src/app/(home)/_components/footer.tsx`, `apps/web/src/app/layout.config.tsx` |

### Out of scope

- Changing left hero headline, CTAs, or bottom “Web / API / Database / Infrastructure” strip.
- Removing stage cards or changing stage data.
- Mosaic, command section, stats, or other `ui-rule-grid` modules.
- Package/CLI rename, domains, OG hosts.
- Redesigning the pixel character (vector rewrite, recolor, animation).

---

## Issue 1 — Enlarge Kubo logo in header

### Current state

```tsx
<span aria-hidden className="relative size-8 overflow-hidden">
  <Image src="/assets/kubo.png" width={32} height={32} className="size-8 object-contain" />
</span>
```

### Target state

| Prop         | Before             | After                                                                |
| ------------ | ------------------ | -------------------------------------------------------------------- |
| Display size | `size-8` (32px)    | `size-10` (40px) mobile; `sm:size-11` (44px) desktop                 |
| Header bar   | `h-14` (56px)      | Unchanged — mark must stay inside bar with ≥6px vertical air at 44px |
| Object fit   | `object-contain`   | `object-contain`                                                     |
| Asset        | `/assets/kubo.png` | `/assets/kubo-mark.png` (see Issue 3)                                |

### Implementation rules

1. Keep the link `h-14` and `aria-label="Kubo home"`.
2. Do not scale the mark above ~44px in the header (breaks the 56px bar).
3. Image remains decorative (`alt=""`, wrapper `aria-hidden`) while wordmark or aria-label provides the name.

### Acceptance

- At 1440 and 390, mark reads larger than the 32px baseline without clipping the header border.
- Wordmark “Kubo” still aligns optically to the mark centerline.

---

## Issue 2 — Tighten logo ↔ title spacing

### Current state

Brand link uses `gap-3` (12px) between mark and wordmark.

### Target state

| Prop           | Before                      | After                                               |
| -------------- | --------------------------- | --------------------------------------------------- |
| Horizontal gap | `gap-3` (12px)              | `gap-1.5` (6px) base; `sm:gap-2` (8px) from `sm` up |
| Wordmark       | `hidden … sm:inline` “Kubo” | Unchanged copy and type                             |

### Visual intent

```text
Before:  [mark]····[Kubo]     (loose)
After:   [mark]·[Kubo]        (tight cluster, still legible)
```

### Acceptance

- Mark + wordmark read as one brand unit, not two floating pieces.
- No collision or overflow into the adjacent header border cell.

---

## Issue 3 — Transparent mark: copy of `kubo.png` without background

### Source asset

| Property | Value                                                                            |
| -------- | -------------------------------------------------------------------------------- |
| Path     | `apps/web/public/assets/kubo.png`                                                |
| Size     | 1402×1122                                                                        |
| Mode     | RGB, opaque black field                                                          |
| Motif    | Flat yellow pixel character; two black square eyes; open black base between legs |

### Operation

1. **Do not destroy** `kubo.png` — keep as archival / plate source.
2. Create **copy**: `apps/web/public/assets/kubo-mark.png`.
3. Remove **exterior** black only (flood-fill from corners), preserving:
   - yellow body (fully opaque)
   - black eye squares (opaque)
   - open mouth/base silhouette as true holes (transparent)
4. Output RGBA PNG; public URL `/assets/kubo-mark.png`.

Recommended shell (ImageMagick):

```bash
magick apps/web/public/assets/kubo.png \
  -alpha set \
  -bordercolor black -border 1 \
  -fuzz 3% -fill none \
  -draw "color 0,0 floodfill" \
  -draw "color 100%,0 floodfill" \
  -draw "color 0,100% floodfill" \
  -draw "color 100%,100% floodfill" \
  -shave 1x1 \
  apps/web/public/assets/kubo-mark.png
```

**Do not** use global `-transparent black` alone — that punches holes through the eyes unless eyes are refilled.

### Where to wire the mark

| Surface                                           | Asset                    |
| ------------------------------------------------- | ------------------------ |
| Site header `BrandMark`                           | `kubo-mark.png`          |
| Footer brand block                                | `kubo-mark.png`          |
| Docs `layout.config` logo                         | `kubo-mark.png`          |
| Future light-surface marketing that needs a plate | may still use `kubo.png` |

### Acceptance

- Corner sample alpha = 0; yellow body alpha = 1; eyes remain solid black.
- On dark header/footer, character sits without a black bounding square.
- Composite QA on a high-contrast color (e.g. red) shows only the invader silhouette.

---

## Issue 4 — Remove Output / License cards; shorten right column

### Current state (Image #1 + code)

Aside structure:

```text
aside (min-h-[38rem] / lg:min-h-[calc(100svh-3.5rem)])
├── stages stack (flex-1, centered)
└── grid 2-col border-t
    ├── Output / Source code
    └── License / MIT
```

### Target state

```text
aside (content height, lg:self-start — does not stretch to full hero)
└── stages stack only (01–04)
    gold guide line kept
```

### UI contract

| Element                         | Before                                             | After                                                                     |
| ------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| Output cell                     | Present                                            | **Deleted** from DOM                                                      |
| License cell                    | Present                                            | **Deleted** from DOM                                                      |
| Aside min-height                | `min-h-[38rem]` + `lg:min-h-[calc(100svh-3.5rem)]` | Removed; height = padding + stage cards                                   |
| Aside vertical align            | Stretches with left column                         | `lg:self-start` so right column is shorter than the left hero             |
| Stage cards                     | `min-h-24`, gap in wrapper                         | Keep four stages; optional slightly tighter mobile `min-h-20 sm:min-h-24` |
| Gold guide `w-px bg-primary/55` | Present                                            | Keep                                                                      |
| Left hero column                | Full viewport min-height                           | Unchanged                                                                 |
| Bottom layer strip (Web/API/…)  | Present                                            | Unchanged                                                                 |

### Implementation rules

1. Delete the entire bottom `grid grid-cols-2 border-rule border-t` block inside the aside.
2. Drop `flex-1` stretch requirements that only existed to fill space above that foot row.
3. Prefer `lg:self-start` on the aside over inventing a second grid row — left column may remain taller; empty area under the aside is the page background / shared section, not a second card stack.
4. Do not re-home “Source code” / “MIT” into the stage list for this pass.

### Acceptance

- At 1440×1000 (Image #1 viewport family): right column shows **only** the four stage cards; no OUTPUT/LICENSE labels.
- Right column height is visibly **shorter** than the left hero column on desktop.
- Structural column border (`lg:border-r` on left) and section bottom border remain.
- Keyboard/focus paths unchanged (those cells were not links).

---

## Implementation order

1. Generate `kubo-mark.png` from `kubo.png` (flood-fill exterior).
2. Wire mark + size + gap in `site-header.tsx`.
3. Point footer + docs logo at `kubo-mark.png`.
4. Trim hero aside (delete foot cards + `lg:self-start` / drop full-height min).
5. Visual QA + `bun run check`.

Suggested commit message:

```text
fix(web): enlarge Kubo header mark and trim hero aside meta
```

---

## Files checklist

| File                                                   | Actions                                   |
| ------------------------------------------------------ | ----------------------------------------- |
| `apps/web/public/assets/kubo.png`                      | Keep (source plate)                       |
| `apps/web/public/assets/kubo-mark.png`                 | Create transparent copy                   |
| `apps/web/src/components/site/site-header.tsx`         | Larger mark, tighter gap, `kubo-mark.png` |
| `apps/web/src/app/(home)/_components/hero-section.tsx` | Remove Output/License; shorten aside      |
| `apps/web/src/app/(home)/_components/footer.tsx`       | Use `kubo-mark.png`                       |
| `apps/web/src/app/layout.config.tsx`                   | Use `kubo-mark.png`                       |
| `docs/captures/*`                                      | Evidence images for this spec             |

---

## Responsive matrix

| Viewport    | Header mark                                                  | Hero aside                                          |
| ----------- | ------------------------------------------------------------ | --------------------------------------------------- |
| 1440 × 1000 | 44px mark, 8px gap, wordmark visible                         | Stages only; aside shorter than left                |
| 1280 × 800  | Same                                                         | Same                                                |
| 768 × 1024  | Same                                                         | Aside stacks under left (grid reflow); no meta foot |
| 390 × 844   | 40px mark; wordmark may hide (`sm:inline`); aria “Kubo home” | Stages only; compact min heights                    |

---

## Verification plan

1. `ls apps/web/public/assets/kubo.png apps/web/public/assets/kubo-mark.png` — both exist.
2. `rg "kubo-mark\\.png" apps/web/src` — header, footer, layout.config reference mark.
3. `rg "Output|License|Source code" apps/web/src/app/\\(home\\)/_components/hero-section.tsx` — no aside meta cells.
4. `bun run check`.
5. Visual: `bun dev`, open `/`:
   - Header: larger transparent character, tight cluster with “Kubo”.
   - Hero right: four stages only; shorter column; no Output/License.
6. Optional: re-export Image #1 after ship for before/after under `docs/captures/`.

---

## Acceptance criteria (roll-up)

- [x] Header mark ≥ 40px (44px from `sm`), still inside `h-14`.
- [x] Mark↔wordmark gap ≤ 8px (`gap-1.5` / `sm:gap-2`).
- [x] `kubo-mark.png` exists as RGBA copy with exterior black removed; `kubo.png` retained.
- [x] Shell brand surfaces use `kubo-mark.png` (header, footer, docs logo).
- [x] Hero aside has **no** Output / License cards.
- [x] Hero aside height is content-driven (`lg:self-start`), not full viewport match.
- [x] Left hero lockup and bottom type strip unchanged.
- [x] `bun run check` passes.

## Relationship to prior specs

| Spec                                   | Relationship                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `spec-kubo-home-ui-polish.md`          | Parent rebrand + hero grid removal + mosaic polish; this pass **refines** the mark presentation and **trims** residual hero aside chrome |
| `spec-home-editorial-system.md`        | Editorial frame kept; aside no longer carries a secondary meta foot row                                                                  |
| `spec-page-frame-and-aligned-rails.md` | Header height and outer rails untouched                                                                                                  |

When this lands, treat `kubo-mark.png` as the default chrome logomark; keep `kubo.png` for contexts that intentionally want the black plate.
