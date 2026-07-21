# Spec: Kubo Home UI Polish — Batch 2

## Status

Ready for implementation

## Date

July 20, 2026

## Goal

Resolve six concurrent home/shell UI polish items from rendered captures, in one pass:

1. **Frame side rails** — darker lateral border, only on tablet-class viewports (not desktop).
2. **Featured rail mission band** — larger/heavier type, structural borders aligned with shell, more height taken from the band below.
3. **Scroll cue + featured card** — larger **arrows** (not chevrons), higher border-radius on the featured card.
4. **Hero layer strip** — remove the “01 WEB STAYS TYPED …” row entirely.
5. **CLI display rename** — all `apps/web` user-visible create commands → **`kubots` / `create-kubots`**.
6. **Community cards** — equal-width `flex-1 gap-4` row; drop CTA top border.
7. **Footer brand** — larger transparent Kubo mark, tighter gap to wordmark.

This pass sits on top of `spec-mistral-hero-featured-rail.md`, `spec-kubo-header-hero-aside.md`, and `spec-page-frame-and-aligned-rails.md`. It does **not** redesign mosaic IA, routes, or monorepo package names.

## Visual evidence (source captures)

| Capture  | File                                            | Surface / defect                                                                                  |
| -------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Image #2 | `docs/captures/batch2-featured-mission.png`     | Mission copy on dark field — type too light/small; band needs stronger presence and shell borders |
| Image #3 | `docs/captures/batch2-featured-scroll-card.png` | Three small chevrons + `FEATURED` card — enlarge arrows, round card more                          |
| Image #4 | `docs/captures/batch2-hero-layer-strip.png`     | Full-width `01 WEB / 02 API / 03 DATABASE / 04 INFRASTRUCTURE STAYS TYPED` — **delete**           |
| Image #5 | `docs/captures/batch2-community-cards.png`      | Three community cards — don’t fit; CTA has top hairline                                           |
| Image #6 | `docs/captures/batch2-footer-brand.png`         | Footer mark + “Kubo” — mark small, gap loose; must use transparent mark                           |

### Image #2 — mission (observed)

```text
┌─ right rail (dark) ─────────────────────────┐
│                                             │
│  (large empty field)                        │
│                                             │
│  Generate full-stack TypeScript apps        │
│  with one command—every layer               │
│  typed, every choice yours.                 │
└─────────────────────────────────────────────┘
```

### Image #3 — scroll + featured (observed)

```text
  ↓  (small chevron)
  ↓
  ↓

  FEATURED
  ┌────────────────────────────────────┐
  │ [kubo]  Compose your stack in the  │
  │         browser                    │
  └────────────────────────────────────┘
```

### Image #4 — strip to remove (observed)

```text
01 WEB STAYS TYPED | 02 API STAYS TYPED | 03 DATABASE STAYS TYPED | 04 INFRASTRUCTURE STAYS TYPED
```

### Image #5 — community cards (observed)

Three editorial cards in a row (Showcase / Analytics / Discord) with bottom CTAs (`OPEN SHOWCASE`, etc.) separated by a top rule — rule goes; widths must share the row.

### Image #6 — footer brand (observed)

```text
[ mark ]  Kubo
A source-first generator…
```

---

## Scope

### In scope

| Area                  | Path(s)                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| Page frame rails      | `apps/web/src/app/global.css` (`.ui-frame`, tokens)                                                  |
| Featured rail         | `apps/web/src/app/(home)/_components/featured-rail.tsx`                                              |
| Hero section          | `apps/web/src/app/(home)/_components/hero-section.tsx`                                               |
| Command / CLI display | `command-section.tsx`, `code-container.tsx`, `footer.tsx`, `src/lib/stack-utils.ts`, `src/app/og/**` |
| Community rail        | `apps/web/src/app/(home)/_components/testimonials.tsx`                                               |
| Footer brand          | `apps/web/src/app/(home)/_components/footer.tsx`                                                     |
| Spec captures         | `docs/captures/batch2-*.png`                                                                         |

### Out of scope

- Renaming monorepo packages, GitHub repo, or published CLI binary beyond **display strings** in `apps/web`.
- Changing domains, OG image hosts, or `ICON_BASE_URL`.
- Mosaic tile layout, header nav IA, or new design tokens beyond a frame-rail variant.
- Publishing the real `kubots` npm package (product/ops).

### Resolved product decision

**CLI display scope (2026-07-20):** every user-visible create-command string under `apps/web` — home, helpers, OG routes — uses the `kubots` naming. Package publish may lag; UI is the source of marketing truth for this pass.

---

## Issue 1 — Frame side border: darker, tablet-only

### Current state

```css
--rule: color-mix(in srgb, white 15%, var(--background));

.ui-frame {
  width: min(calc(100% - (var(--page-gutter) * 2)), 1600px);
  margin-inline: auto;
  border-inline: 1px solid var(--rule);
}
```

Rails paint on **all** widths where `.ui-frame` is used (header chrome, etc.).

### Target

| Viewport                | `.ui-frame` side rails                                                |
| ----------------------- | --------------------------------------------------------------------- |
| **&lt; 640px (mobile)** | Same as tablet: **show** darker rails (consistent small-screen frame) |
| **640–1023px (tablet)** | **Show** 1px rails, **darker** than current 15% white mix             |
| **≥ 1024px (desktop)**  | **No** side rails (`border-inline-width: 0` or transparent)           |

Do **not** recolor every `border-rule` divider on the page — only the **outer page frame** laterals.

### Implementation rules

1. Add a dedicated token, e.g. `--rule-frame: color-mix(in srgb, white 28%, var(--background))` (~2× current presence).
2. Gate `.ui-frame { border-inline }` with media queries; default desktop off.
3. Keep `--rule` for module grids, mosaic seams, header internal cells.

### Suggested CSS

```css
--rule-frame: color-mix(in srgb, white 28%, var(--background));

.ui-frame {
  width: min(calc(100% - (var(--page-gutter) * 2)), 1600px);
  margin-inline: auto;
  border-inline: 0 solid transparent;
}

@media (max-width: 1023px) {
  .ui-frame {
    border-inline: 1px solid var(--rule-frame);
  }
}
```

### Acceptance

- ~768×1024: side rails visible and clearly darker than pre-change.
- 1440×1000: no meaningful outer side rail on `.ui-frame`.
- Internal `border-rule` lines (hero, mosaic, cards) unchanged in color intent.

---

## Issue 2 — Featured rail mission band (Image #2)

### Current state (`featured-rail.tsx`)

| Prop         | Value                                             |
| ------------ | ------------------------------------------------- |
| Upper band   | `flex-3`, `min-h-[14rem]`, `justify-end`          |
| Lower band   | `flex-2`, `min-h-[16rem]`, `border-t border-rule` |
| Mission type | `text-xl` / `sm:text-[1.35rem]`, `font-normal`    |
| Aside edge   | `lg:border-l border-rule`                         |

### Target

| Prop             | Before                             | After                                                                                                                                                                                                               |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Font size        | `text-xl` / `1.35rem`              | **`text-2xl`** / **`sm:text-[1.65rem]`** / **`lg:text-[1.75rem]`** (or single `clamp(1.35rem, 1.2rem + 0.6vw, 1.75rem)`)                                                                                            |
| Font weight      | `400`                              | **`500` (`font-medium`)** — prefer over 600 for long mission                                                                                                                                                        |
| Leading          | snug                               | `leading-[1.3]` / keep snug                                                                                                                                                                                         |
| Upper flex share | `flex-3`                           | **`flex-[4]`** (or equivalent taller min-height)                                                                                                                                                                    |
| Lower flex share | `flex-2`                           | **`flex-[1.5]`** (or lower `min-h`) so featured still sits at bottom but consumes less vertical budget                                                                                                              |
| Borders          | left on aside; `border-t` on lower | Keep **same `border-rule` language** as header / left hero column: continuous **left** rail on aside; **one** horizontal rule between mission and scroll/featured (lower `border-t` is enough — no double hairline) |

### Copy (unchanged unless product edits)

```text
Generate full-stack TypeScript apps with one command—every layer typed, every choice yours.
```

### Acceptance

- At 1440, mission reads larger and heavier than the batch-1 rail.
- Upper band visibly taller; lower band shorter; featured card remains above the fold on desktop.
- Divider under mission matches other shell 1px rules (`border-rule`).

---

## Issue 3 — Scroll arrows + featured card radius (Image #3)

### Current state

- Lucide `ChevronDown`, `size-4` (16×16), stroke ~1.75.
- Card: `rounded-md border border-rule p-2`.
- Animations: `animate-fading-arrow-scroll-1|2|3`.

### Target

| Prop        | Before              | After                                            |
| ----------- | ------------------- | ------------------------------------------------ |
| Glyph       | `ChevronDown`       | **`ArrowDown`**                                  |
| Size        | `size-4` (16)       | **`size-6` (24)**                                |
| Stack gap   | `gap-2` (8)         | **`gap-2` or `gap-2.5`** (keep cascade readable) |
| Animation   | existing keyframes  | Keep; attach classes to `ArrowDown`              |
| Card radius | `rounded-md` (~6px) | **`rounded-xl` (12px)**                          |

### Motion

Respect `prefers-reduced-motion: reduce` — static opacity ~0.55, no pulse (already required by featured-rail spec).

### Acceptance

- Three stacked **arrows**, clearly larger than 16px.
- Featured card corners softer than square editorial cells around it.
- Reduced-motion path verified.

---

## Issue 4 — Remove hero layer strip (Image #4)

### Current state (`hero-section.tsx`)

```tsx
<div className="grid border-rule border-t sm:grid-cols-2 lg:grid-cols-4">
  {["Web", "API", "Database", "Infrastructure"].map((label, index) => (
    // 01 WEB STAYS TYPED …
  ))}
</div>
```

### Target

- **Delete** the entire strip from the DOM.
- Hero section ends after the 70/30 headline + `FeaturedRail` grid.
- Keep section `border-b` (or equivalent) so the next home module still separates cleanly — **one** boundary, not a double line left by a missing strip.

### Acceptance

- Grep / visual: zero “stays typed” cells under the hero at 390 / 768 / 1440.
- No layout hole; next section butts the hero bottom rule.

---

## Issue 5 — CLI strings → `kubots` (all `apps/web` displays)

### Product language

| Context             | Old                                 | New                             |
| ------------------- | ----------------------------------- | ------------------------------- |
| Bun (default shown) | `bun create better-t-stack@latest`  | **`bun create kubots@latest`**  |
| pnpm                | `pnpm create better-t-stack@latest` | **`pnpm create kubots@latest`** |
| npm                 | `npx kubojs@latest`                 | **`npx create-kubots@latest`**  |

### Inventory (must update)

| File                                                      | Notes                    |
| --------------------------------------------------------- | ------------------------ |
| `apps/web/src/app/(home)/_components/command-section.tsx` | `commands` map           |
| `apps/web/src/app/(home)/_components/code-container.tsx`  | package manager commands |
| `apps/web/src/app/(home)/_components/footer.tsx`          | terminal path `<code>`   |
| `apps/web/src/lib/stack-utils.ts`                         | default command builders |
| `apps/web/src/app/og/stack/route.tsx`                     | OG command text          |
| `apps/web/src/app/og/site/[page]/route.tsx`               | OG command text          |
| Any other match under `apps/web/src`                      | same swap                |

### Non-goals

- Do not rename workspace packages, GitHub repo, or npm publish config in this pass.
- Docs content under `content/docs` that describes the **historical** package may stay until a docs ADR — **except** if a string is pure marketing install copy mirrored from the site.

### Acceptance

```bash
rg "better-t-stack@latest|kubojs@latest" apps/web/src
```

→ **zero** intentional UI/OG hits. Copy-to-clipboard still copies the new string.

**Risk note:** if `kubots` / `create-kubots` is not on the registry yet, the UI will advertise a future install path. That is accepted for this pass.

---

## Issue 6 — Community cards: fit row + drop CTA rule (Image #5)

### Current state (`testimonials.tsx` → `CommunityCard`)

```tsx
article: "w-[86%] shrink-0 snap-start … sm:w-[58%] lg:w-[38%]";
Link: "… border-rule border-t pt-4 …";
```

### Target

| Prop                  | Before                  | After                                                                                                       |
| --------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| Desktop (`lg+`) width | fixed % carousel slides | Parent rail: **`flex gap-4`**; each card **`flex-1 min-w-0`** (drop `lg:w-[38%]` etc. at large breakpoints) |
| Mobile / tablet       | snap carousel OK        | May keep snap widths below `lg`; **at `lg` all three share one row**                                        |
| CTA top border        | `border-t pt-4`         | **Remove** `border-t` and border-only `pt`; keep spacing via `mt-10` / `mt-auto`                            |

### Acceptance

- 1440: three cards visible in one row with even `gap-4`.
- No hairline above “Open showcase” / “Explore analytics” / “Join Discord”.
- Titles wrap without overflowing the card.

---

## Issue 7 — Footer brand mark (Image #6)

### Current state (`footer.tsx`)

```tsx
className = "inline-flex items-center gap-3 …";
// mark: size-10, src="/assets/kubo-mark.png"
```

### Target

| Prop              | Before           | After                                                                                                |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| Mark size         | `size-10` (40px) | **`size-12` (48px)**                                                                                 |
| Gap mark ↔ “Kubo” | `gap-3` (12px)   | **`gap-1.5` or `gap-2`** (6–8px)                                                                     |
| Asset             | `kubo-mark.png`  | **Require** `/assets/kubo-mark.png` only (transparent). Never `kubo.png` black plate in footer brand |
| Image fit         | `object-contain` | keep                                                                                                 |

Header mark may stay as-is (`size-10` / `sm:size-11`) unless visual QA shows imbalance.

### Acceptance

- Footer mark larger and tighter to the wordmark.
- No black square behind the character (transparent PNG).

---

## Implementation order

1. Land this spec + `docs/captures/batch2-*.png`.
2. Issue 4 — remove hero strip (isolated, low risk).
3. Issue 1 — tablet frame rails CSS.
4. Issues 2–3 — featured rail type, flex shares, arrows, radius.
5. Issue 6 — testimonials flex + CTA.
6. Issue 7 — footer brand.
7. Issue 5 — CLI strings across `apps/web`.
8. `bun run check` + visual matrix 390 / 768 / 1440.

### Suggested commits

```text
docs(web): add home UI polish batch 2 specification
fix(web): darken tablet frame rails and drop hero layer strip
fix(web): polish featured rail type, arrows, and card radius
fix(web): fit community cards and drop CTA top rules
fix(web): enlarge footer Kubo mark spacing
feat(web): show kubots create commands across web displays
```

---

## Files checklist

| File                                                      | Actions       |
| --------------------------------------------------------- | ------------- |
| `docs/spec-kubo-home-ui-polish-batch-2.md`                | This document |
| `docs/captures/batch2-*.png`                              | Evidence      |
| `apps/web/src/app/global.css`                             | Issue 1       |
| `apps/web/src/app/(home)/_components/featured-rail.tsx`   | Issues 2–3    |
| `apps/web/src/app/(home)/_components/hero-section.tsx`    | Issue 4       |
| `apps/web/src/app/(home)/_components/command-section.tsx` | Issue 5       |
| `apps/web/src/app/(home)/_components/code-container.tsx`  | Issue 5       |
| `apps/web/src/app/(home)/_components/footer.tsx`          | Issues 5, 7   |
| `apps/web/src/lib/stack-utils.ts`                         | Issue 5       |
| `apps/web/src/app/og/stack/route.tsx`                     | Issue 5       |
| `apps/web/src/app/og/site/[page]/route.tsx`               | Issue 5       |
| `apps/web/src/app/(home)/_components/testimonials.tsx`    | Issue 6       |

---

## Responsive matrix

| Viewport    | Frame rails           | Featured rail                                                 | Community cards                        |
| ----------- | --------------------- | ------------------------------------------------------------- | -------------------------------------- |
| 1440 × 1000 | No outer side rail    | Mission large; arrows 24px; card `rounded-xl`; no layer strip | 3× `flex-1 gap-4`                      |
| 768 × 1024  | **Darker** side rails | Stacked rail OK                                               | Snap or flex per impl; CTA no border-t |
| 390 × 844   | Darker rails (mobile) | Mission readable; card full width                             | Snap OK                                |

---

## Verification plan

1. Visual: `bun dev`, `/` at 390, 768, 1440 against the five captures (structure/intent).
2. `rg "stays typed|STAYS TYPED" apps/web/src` → no hero strip.
3. `rg "better-t-stack@latest|kubojs@latest" apps/web/src` → zero intentional hits.
4. `rg "ChevronDown" apps/web/src/app/(home)/_components/featured-rail.tsx` → none (use `ArrowDown`).
5. Footer brand: only `kubo-mark.png`, size ≥ 48px, gap ≤ 8px.
6. `bun run check`.

---

## Acceptance criteria (roll-up)

- [ ] Tablet (and mobile) page-frame side rails darker; desktop without outer side rails.
- [ ] Mission type larger + medium weight; upper band taller; lower shorter; shell borders consistent.
- [ ] Three **ArrowDown** icons at ~24px with cascade animation; featured card `rounded-xl`.
- [ ] Hero “stays typed” strip removed.
- [ ] All `apps/web` create-command displays use `kubots` / `create-kubots`.
- [ ] Community cards share one row with `flex-1 gap-4` at lg; CTA has no top border.
- [ ] Footer mark larger, tight gap, transparent asset.
- [ ] Package/repo identifiers outside display strings left intact.
- [ ] `bun run check` passes.

## Relationship to prior specs

| Spec                                                             | Relationship                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `spec-mistral-hero-featured-rail.md`                             | Parent rail grammar; this pass **scales type/arrows/radius** and rebalances band flex |
| `spec-page-frame-and-aligned-rails.md`                           | Frame still exists; **visibility of side rails becomes breakpoint-scoped**            |
| `spec-kubo-home-ui-polish.md` / `spec-kubo-header-hero-aside.md` | Brand mark + shell; footer mark scale refined here                                    |

When this lands, treat `bun create kubots@latest` as the canonical **marketing** install line in the web app; track real registry publish separately.
