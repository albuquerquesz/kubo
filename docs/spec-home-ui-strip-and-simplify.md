# Spec: Home UI strip & simplify (batch)

## Status

Ready for implementation

## Date

July 20, 2026

## Goal

One home polish batch driven by product captures (July 20, 2026). Nine decisions, one ship:

1. **Community cards** — drop per-card eyebrow + bottom CTA link; top-left **icon** + title + description (Mistral-style tile grammar, original Kubo icons only).
2. **Display titles** — no gold/`text-primary` on dual-line display titles; cream/white (`text-foreground`) only.
3. **Hero install shell** — remove filled shell background and the `$` prompt glyph.
4. **Command section** — remove internal diagram / tile eyebrows called out in capture.
5. **Product mosaic** — **remove the entire section** from the home page.
6. **Community intro band** — **remove** the section header band (kicker + display title + lead); keep the redesigned card rail.
7. **Footer brand row** — substantially taller; larger mark; mark vertically aligned with the “Kubo” wordmark.
8. **Footer CTA eyebrows** — remove kickers on the final CTA band.

Brand remains **Kubo**. Soft-rule grid and gold on true CTAs / primary surfaces may stay. Do **not** ship Mistral assets, type, or copy.

Continues `spec-home-editorial-system.md`, `spec-home-community-footer-scroll-icons.md`, `spec-hero-install-eyebrow-pm-select.md`, and prior home polish batches.

---

## Visual / product references

| #   | Capture intent                                                   | Current repo evidence                                                        |
| --- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Community cards: eyebrow + bottom gold CTA                       | `testimonials.tsx` — `CommunityCard` with `entry.eyebrow`, bottom `Link` CTA |
| 2   | Tile grammar reference (icon top, title bottom)                  | External light-theme reference only — structure, not palette                 |
| 3   | Hero dual title still gold on second line                        | `hero-section.tsx` / `HeroDisplayTitle` children; enforce cream only         |
| 4   | Install shell `bg-card` + gold `$`                               | `hero-install-card.tsx` — `bg-card` shell, `$` span                          |
| 5   | Command body kickers (PROMPT, RESULT, GENERATED ARCHITECTURE, …) | `command-section.tsx`                                                        |
| 6   | Product mosaic full section                                      | `product-mosaic-section.tsx` + `page.tsx` compose                            |
| 7   | Community intro (kicker + “The work leaves a trail”)             | `testimonials.tsx` header grid                                               |
| 8   | Footer brand row short; small mark                               | `footer.tsx` brand column `size-12` mark                                     |
| 9   | Footer CTA kickers                                               | `footer.tsx` — Ready / Interactive path / Terminal path / One command        |

---

## Scope

### In scope

| Surface               | Path                                                        | Work                                                             |
| --------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- |
| Community cards       | `apps/web/src/app/(home)/_components/testimonials.tsx`      | Icon tile layout; remove eyebrow + bottom CTA                    |
| Community intro       | same                                                        | Remove kicker + display title + lead band                        |
| Display titles (home) | Hero, footer CTA display, remaining section titles if gold  | Cream/white only                                                 |
| Hero install          | `apps/web/src/app/(home)/_components/hero-install-card.tsx` | Transparent shell; no `$`                                        |
| Command section       | `apps/web/src/app/(home)/_components/command-section.tsx`   | Strip called-out eyebrows                                        |
| Product mosaic        | `product-mosaic-section.tsx`, `page.tsx`                    | Unmount from home; delete file **or** leave unused until cleanup |
| Footer                | `apps/web/src/app/(home)/_components/footer.tsx`            | Height, mark size/align, remove CTA kickers                      |
| Home page compose     | `apps/web/src/app/(home)/page.tsx`                          | Drop mosaic import/usage                                         |

### Out of scope

- Rebuilding product mosaic IA elsewhere (unless a follow-up reopens navigate IA)
- Light theme / multi-theme
- Changing create-command strings or PM list
- Porting Mistral pixel icons or brand
- Sponsors bar, SignalField, scroll-reveal icons motion contract (already shipped)
- Capability section (not in this capture set — **leave** unless product reopens)

---

## 1. Community cards → icon tiles

**File:** `testimonials.tsx`

### Current

```text
┌ eyebrow (kicker) ─────────────────────┐
│ Title                                 │
│ Description                           │
│                                       │
│ OPEN SHOWCASE                      ↗  │  ← gold CTA link
└───────────────────────────────────────┘
```

### Target (reference grammar, Kubo chrome)

```text
┌ icon (top-left) ──────────────────────┐
│                                       │
│                                       │
│ Title                                 │
│ Description (optional, muted)         │
└───────────────────────────────────────┘
  whole card is the hit target (Link)
```

| Rule              | Detail                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Remove            | Per-card `eyebrow` UI; bottom CTA row (`cta` label + `ArrowUpRight`)                            |
| Add               | Decorative icon top-left (Lucide or first-party); map per destination                           |
| Interaction       | Entire card is a single `Link` (or `Link` wrapping `article`); focus ring on card               |
| Description       | Keep short body under title (reference allows description; Kubo already has copy)               |
| Joined rail       | Keep joined rail from prior pass (`gap-px` + `bg-rule`); four fallbacks stay                    |
| Icons (suggested) | Showcase → layout/gallery; Analytics → chart; Discord → message; Docs → book — product may swap |
| Data model        | `eyebrow` / `cta` may drop from type if unused; keep `href`, `title`, `description`, `kind`     |

### Suggested icon map

| Card      | `href`       | Suggested Lucide                  |
| --------- | ------------ | --------------------------------- |
| Showcase  | `/showcase`  | `LayoutGrid` or `PanelsTopLeft`   |
| Analytics | `/analytics` | `ChartNoAxesColumn` or `Activity` |
| Discord   | Discord URL  | `MessagesSquare`                  |
| Docs      | `/docs`      | `BookOpen`                        |

### Acceptance — community cards

- [ ] No per-card eyebrow kicker
- [ ] No bottom gold “OPEN …” link row
- [ ] Icon visible top-left on each card
- [ ] Whole card keyboard-focusable and activatable
- [ ] Joined seams / four fallbacks preserved

---

## 2. Community intro band — remove

**File:** `testimonials.tsx`

### Current

Left: `Community / Field notes` kicker. Right: display title “The work / leaves a trail.” + lead paragraph.

### Target

Remove that **entire header grid**. Section becomes the card rail only (still a `<section>` with a concise `aria-label` / `aria-labelledby` if needed for a11y — e.g. visually hidden title “Community”).

### Acceptance — community intro

- [ ] No “Community / Field notes” kicker on home
- [ ] No “The work leaves a trail.” display block on home
- [ ] Card rail still present and reachable

---

## 3. Display titles — cream only (no gold second line)

### Rule

Home **display dual-titles** (`ui-display` multi-line statements) use **`text-foreground` only**. Do **not** paint the second line with `text-primary` / gold.

### Surfaces to verify / fix

| Surface                       | Example line                                  | File                     |
| ----------------------------- | --------------------------------------------- | ------------------------ |
| Hero                          | “Every layer.”                                | `hero-section.tsx`       |
| Footer CTA display            | “Start shipping.”                             | `footer.tsx`             |
| Capability (if still mounted) | “Boring to own.” / “anywhere.”                | `capability-section.tsx` |
| Any residual                  | second-line `<span className="text-primary">` | grep home `_components`  |

Kickers, primary buttons, gold mosaic featured tiles (until mosaic is removed), and `$` elsewhere are **not** “display titles” — but install `$` is removed in §4.

### Acceptance — titles

- [ ] Hero display both lines cream/white at rest
- [ ] No dual-title second line still gold on home after pass
- [ ] Primary CTA blocks (e.g. gold “Build your stack” panel) unchanged

---

## 4. Hero install shell — no fill, no `$`

**File:** `hero-install-card.tsx`

### Current

- Shell: `rounded-[12px] border border-rule bg-card …`
- Prompt: `<span className="text-primary">$ </span>` before `<code>`

### Target

| Piece            | Target                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Shell background | **No fill** — drop `bg-card` (transparent over parent). Keep border + radius + padding + copy button |
| `$` glyph        | **Remove** entirely; command is only the bare create string                                          |
| Eyebrow row      | Keep “Initialize with” + PM icon select (prior pass)                                                 |
| Copy control     | Keep                                                                                                 |

```text
  Initialize with                    [pm icon ▾]

┌─ border-rule · transparent ──────────────────┐
│  bun create kubojs@latest         [ COPY ⎘ ] │
└──────────────────────────────────────────────┘
```

### Acceptance — install

- [ ] Shell does not read as a filled card over the hero background
- [ ] No `$` before the command
- [ ] Copy still works; PM select still switches command

---

## 5. Command section — strip called-out eyebrows

**File:** `command-section.tsx`

### Remove (capture-highlighted)

| Label                    | Location                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `PROMPT`                 | Guided tile                                                                               |
| `RESULT`                 | Editable tile                                                                             |
| `GENERATED ARCHITECTURE` | Right column top-left kicker                                                              |
| `TYPE GRAPH INTACT`      | Right column top-right kicker                                                             |
| `CLIENT`                 | Architecture node kicker (and for consistency: `CONTRACT`, `SERVER`, `DATA` node kickers) |

### Keep (unless optical QA later asks)

- Section header kicker `01 / Compose` (not circled in this batch)
- “Start from your terminal” chrome + PM switcher
- Node **titles** (App Router, Typed API, Runtime, Schema)
- Guided / Editable **values** (strong text) without PROMPT/RESULT labels
- Bottom cards (“Compatible combinations”, “Open the visual builder”)

### Acceptance — command

- [ ] Circled kickers gone
- [ ] Diagram still readable via node titles alone
- [ ] Terminal command + copy still work

---

## 6. Product mosaic — remove entire section

**Files:** `product-mosaic-section.tsx`, `page.tsx`

### Target

1. Remove `<ProductMosaicSection />` from `apps/web/src/app/(home)/page.tsx`.
2. Remove the import.
3. Prefer **delete** `product-mosaic-section.tsx` in the same PR if nothing else imports it; otherwise leave file with a short deprecation comment and open a cleanup follow-up.
4. Update any in-page anchors that pointed at `#explore` (header/nav/scroll targets) so nothing 404s or scrolls to a missing id.

### Acceptance — mosaic

- [ ] Home no longer renders mosaic grid or “One stack. / Your next move.”
- [ ] No dead import / lint
- [ ] No nav item scrolls to a missing `#explore` without a replacement decision

---

## 7. Footer brand row — taller, larger mark, aligned

**File:** `footer.tsx` brand + nav grid (not only the final CTA).

### Current (approx.)

- Brand column: `lg:min-h-[16rem]`, mark `size-12` (48px), `inline-flex items-center gap-2` with “Kubo”
- Nav columns: `lg:p-12 lg:py-14`

### Target

| Piece          | Target                                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vertical scale | **Clearly taller** than post–scroll-icons pass — e.g. brand column `min-h-[20rem]`–`min-h-[24rem]` at `lg`, and/or `lg:py-20`+ on brand + nav cells |
| Mark size      | **Larger** — e.g. `size-16` or `size-20` (64–80px); update `Image` width/height props                                                               |
| Alignment      | Mark and “Kubo” wordmark share one horizontal baseline/center: `items-center` (and avoid mismatched line-height that drops the glyph)               |
| Tagline        | Keep under the brand row; more top margin if mark grows                                                                                             |

Do not fake empty modules; prefer padding + min-height.

### Acceptance — footer brand

- [ ] Brand/nav band reads substantially taller at desktop
- [ ] Mark is obviously larger than 48px
- [ ] Mark and “Kubo” sit on one optical row (centered)

---

## 8. Footer final CTA — remove eyebrows

**File:** `footer.tsx` final CTA section

### Remove

| Current kicker                  | Where                             |
| ------------------------------- | --------------------------------- |
| `Ready / Generate locally`      | Left CTA column top               |
| `Interactive path`              | Gold “Build your stack” panel top |
| `Terminal path`                 | Terminal panel top                |
| `One command` (+ copy icon row) | Terminal panel bottom label       |

### Keep

- Display title “Stop assembling. / Start shipping.” (cream only — §3)
- “Build your stack” link content + arrow
- Terminal command string `bun create kubojs@latest` (or shared helper)
- Layout / min-heights from prior taller-footer pass; may bump further if brand row alone is not enough “height” product wants

### Acceptance — footer CTA

- [ ] No READY / INTERACTIVE PATH / TERMINAL PATH / ONE COMMAND kickers
- [ ] Primary actions still obvious
- [ ] Display title remains cream/white

---

## File checklist

| File                                                             | Action                                          |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| `docs/spec-home-ui-strip-and-simplify.md`                        | **This document**                               |
| `apps/web/src/app/(home)/_components/testimonials.tsx`           | Icon tiles; remove intro band                   |
| `apps/web/src/app/(home)/_components/hero-install-card.tsx`      | Transparent shell; no `$`                       |
| `apps/web/src/app/(home)/_components/hero-section.tsx`           | Ensure display title cream-only                 |
| `apps/web/src/app/(home)/_components/command-section.tsx`        | Strip called-out kickers                        |
| `apps/web/src/app/(home)/_components/product-mosaic-section.tsx` | Delete or unwire                                |
| `apps/web/src/app/(home)/page.tsx`                               | Drop mosaic                                     |
| `apps/web/src/app/(home)/_components/footer.tsx`                 | Height, mark, align; strip CTA kickers          |
| `apps/web/src/app/(home)/_components/capability-section.tsx`     | Only if dual-title still gold — cream-only pass |
| Header / in-page links to `#explore`                             | Fix if present                                  |

---

## Implementation order

1. Unmount product mosaic from `page.tsx` (+ delete/cleanup file, fix `#explore`).
2. Community: remove intro band; redesign cards to icon tiles + whole-card links.
3. Hero install: transparent shell, remove `$`.
4. Command section: remove called-out eyebrows.
5. Display titles cream-only sweep on home.
6. Footer: strip CTA kickers; enlarge mark + height + align.
7. Visual pass 1440 / 768 / 390; `bun run check`.

### Suggested commits

```text
feat(web): remove home product mosaic section
feat(web): restyle community cards as icon tiles
fix(web): simplify hero install shell and command kickers
fix(web): enlarge footer brand and strip footer kickers
fix(web): keep home display titles cream-only
```

---

## Verification

| Check        | Pass                                                          |
| ------------ | ------------------------------------------------------------- |
| Community    | Icon top-left; no eyebrow/CTA row; no intro band; rail intact |
| Titles       | Display dual-lines cream only                                 |
| Install      | No shell fill; no `$`                                         |
| Command      | Circled kickers gone                                          |
| Mosaic       | Not on home                                                   |
| Footer       | Taller brand; larger aligned mark; CTA kickers gone           |
| Brand safety | No Mistral assets/copy                                        |
| Lint         | `bun run check` clean                                         |

---

## Acceptance criteria (roll-up)

- [ ] Community cards match icon-tile grammar (no eyebrow, no bottom link text)
- [ ] Community intro header band removed
- [ ] Product mosaic not rendered on home
- [ ] Install shell transparent; command has no `$`
- [ ] Command-section capture kickers removed
- [ ] Home display titles are not gold on second lines
- [ ] Footer brand taller + larger mark aligned with “Kubo”
- [ ] Footer final CTA has no READY / INTERACTIVE / TERMINAL / ONE COMMAND kickers
- [ ] Soft-rule / gold CTA surfaces that product still wants (gold builder panel, primary buttons) remain intentional

## Relationship to prior specs

| Spec                                         | Relationship                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| `spec-home-community-footer-scroll-icons.md` | Joined rail + fourth card **kept**; card **chrome** and community **intro** change here |
| `spec-hero-install-eyebrow-pm-select.md`     | Eyebrow + PM select **kept**; shell fill + `$` **removed** here                         |
| `spec-home-product-mosaic.md`                | Mosaic **removed** from home by this batch                                              |
| `spec-home-editorial-system.md`              | Soft rules retained; display dual-title gold emphasis **revoked** on home               |
| `spec-kubo-home-ui-polish-batch-3.md`        | Superseded where this batch strips kickers / sections                                   |

When this ships, do not reintroduce mosaic tiles or community intro dual-title without a product decision.
