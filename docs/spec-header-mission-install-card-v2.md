# Spec: Shorter header, 3-line mission, install card shell v2

## Status

Ready for implementation

## Date

July 20, 2026

## Goal

Three focused polish decisions on the marketing shell and hero right rail:

1. **Shorter header** — reduce the fixed top bar height; enlarge type on the **right** utilities (GitHub + Build a stack).
2. **Mission copy** — replace the five-line right-rail sentence with a **three-line** phrase that fits the upper band without crowding.
3. **Install card shell v2** — restyle the hero install control to match a horizontal “featured news” card grammar (thumb + title/command + trailing action), in the **current dark tokens**, with a **copy button** where the reference uses up/down switchers. Drop the stacked PM tabs + separate command row from the hero card.

Brand remains **Kubo** / `create-kubots` display strings. No Mistral assets or copy.

Continues / supersedes pieces of:

| Spec                                                   | What this doc overrides                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `spec-hero-title-rail-install-card.md`                 | Hero install **UI shape** (horizontal shell + copy only); mission length |
| `spec-kubo-header-hero-aside.md` / home polish batches | Header **row height** and right-control type scale                       |
| `spec-home-editorial-system.md`                        | Header height token if still locked at 56 px                             |

Does **not** reopen: dual-title SEO, GSAP intro, soft-rule borders, SignalField, 2×2 hero grid alignment, or `CommandSection` as the full terminal PM experience.

---

## Visual references

| #   | Capture / description                                                                                                    | Role                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 1   | Current fixed header bar (mark · Product · System · … · GitHub · gold CTA)                                               | Baseline to compress                                                       |
| 2   | Current mission block (5 intentional lines, bottom of upper right band)                                                  | Baseline to replace                                                        |
| 3   | Current `HeroInstallCard` (BUN / PNPM / NPM tabs + Copy + `$ command` row)                                               | Baseline to replace                                                        |
| 4   | `docs/captures/hero-install-card-layout-ref.png` — light “FEATURED NEWS” horizontal card (thumb · title · chevron stack) | **Layout grammar only** — adapt to dark shell; **copy replaces switchers** |

---

## Scope

### In scope

| Surface                    | Path                                                                | Work                                              |
| -------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| Header height + right type | `apps/web/src/components/site/site-header.tsx`                      | Shorter row; larger GitHub / CTA type             |
| Header height dependents   | Hero / any `calc(100svh - …)` / layout offset using `3.5rem`        | Keep in sync with new header height               |
| Mission copy               | `apps/web/src/app/(home)/_components/hero-section.tsx`              | 3 lines + matching `sr-only` sentence             |
| Install card               | `hero-install-card.tsx` (+ `hero-rail-lower.tsx` spacing if needed) | Horizontal shell; copy action; no PM tabs in hero |

### Out of scope

- Changing left hero title copy/scale (`One command.` / `Every layer.`)
- Reworking the 2×2 hero grid (shared 60/40 rows) unless header height forces a min-height tweak
- Removing or redesigning `CommandSection` (full PM switcher + terminal stays there)
- Light-theme redesign; Mistral copy/assets
- Adding carousel / news / multi-item switchers to the install card
- Renaming routes or page section order

---

## 1. Header — shorter bar, larger right controls

### Current (repo)

| Token / element    | Value                                           |
| ------------------ | ----------------------------------------------- |
| Row height         | `h-14` (56 px / `3.5rem`) everywhere on the bar |
| Brand mark         | `size-12` / `sm:size-14` in `h-14` cell         |
| Primary nav labels | `font-mono text-xs` uppercase                   |
| GitHub             | `h-14`, `font-mono text-xs` uppercase           |
| Build a stack      | `buttonVariants({ size: "lg" })` + `h-14`       |
| Hero offset        | `min-h-[calc(100svh-3.5rem)]`                   |

### Target

| Property                          | Target                                                                                                                 | Notes                                                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Row height                        | **`h-12` (48 px / `3rem`)**                                                                                            | One step down from 56. Prefer a single shared class / constant so mark, nav, GitHub, CTA, and mobile trigger all match                       |
| Brand mark                        | Scale down to fit comfortably in `h-12` without overflow                                                               | Recommended: `size-9` / `sm:size-10` (36 / 40 px), or `size-10` if optical QA wants fuller fill; keep `overflow-hidden` on the image wrapper |
| Primary nav (Product / System)    | Keep `text-xs` or hold current scale                                                                                   | Not the focus of this pass; may tighten vertical centering only                                                                              |
| **GitHub** type                   | **Larger than `text-xs`** — prefer `text-sm` (and keep mono uppercase or match current casing system)                  | Icon may scale slightly (`size-4` → `size-4.5` / `size-5` if available)                                                                      |
| **Build a stack** type            | **Larger label** — prefer `text-sm` font-semibold (or one step above current button label), still gold primary surface | Keep arrow; maintain min hit area ~44 px width where practical; height stays bar-tall (`h-12`)                                               |
| Horizontal padding on right cells | May tighten slightly if type grows (`px-3` / `px-4`) so the bar doesn’t feel bloated                                   | Implementer QA                                                                                                                               |
| Focus rings                       | Unchanged visibility contract                                                                                          |                                                                                                                                              |
| Mobile menu trigger               | Same `h-12` as bar                                                                                                     |                                                                                                                                              |

### Header height cascade

Any layout that subtracts the fixed header must track the new height:

| Location                                          | Change                                      |
| ------------------------------------------------- | ------------------------------------------- |
| `hero-section.tsx` `min-h-[calc(100svh-3.5rem)]`  | → `calc(100svh - 3rem)` (or CSS variable)   |
| Docs / comments that say “56 px / `h-14` header”  | Update when touched                         |
| Optional: `--site-header-height: 3rem` on `:root` | Nice-to-have so hero and header don’t drift |

Do **not** leave hero at `3.5rem` while the bar is `3rem` — that leaves a dead gap under the header.

### Acceptance — header

- [ ] Fixed bar is visually shorter than the previous 56 px row at 1440 / 768 / 390
- [ ] GitHub + Build a stack labels read larger than Product / System (or clearly larger than pre-change right controls)
- [ ] Mark does not clip or overflow the bar
- [ ] Hero first screen still fills the viewport under the fixed header (no double gap)

---

## 2. Mission — three lines only

### Current

Five intentional line blocks (Mistral right-rail grammar: one phrase per line, `lg:text-nowrap`):

```text
We give you a full-stack
TypeScript app
from one command
with every layer typed
and every choice yours.
```

### Target

Exactly **three** visual lines. Same pattern: array of strings → mapped `<span className="block lg:text-nowrap">`, plus one `sr-only` full sentence.

### Recommended copy (ship this unless product swaps)

```text
A full-stack TypeScript app
from one command
with every layer typed.
```

**`sr-only` / accessibility sentence:**

```text
A full-stack TypeScript app from one command with every layer typed.
```

### Alternates (if product prefers a different voice)

| ID              | Lines                                                                               |
| --------------- | ----------------------------------------------------------------------------------- |
| A (recommended) | `A full-stack TypeScript app` / `from one command` / `with every layer typed.`      |
| B               | `Full-stack TypeScript` / `from one command` / `every layer typed.`                 |
| C               | `One command scaffolds` / `a full-stack TypeScript app` / `with every layer typed.` |

Rules for any final phrase:

1. **Max 3 lines** — no fourth wrap at the intended desktop rail width (~30% column at 1280–1440).
2. Keep product claims accurate (full-stack, TypeScript, one command, typed layers).
3. No Mistral-specific wording; no competitor brand names.
4. Type scale stays in the current mission range (`text-2xl` → `lg:text-[1.75rem]` class family) unless three lines still overflow — then reduce one step rather than adding a fourth line.
5. Upper band still `justify-end` with the same bottom padding as the left title band (shared 2×2 grid from the previous hero pass).

### Acceptance — mission

- [ ] Exactly three visible lines on desktop rail
- [ ] `sr-only` is a single coherent sentence matching the three lines
- [ ] No horizontal overflow / awkward wrap at 1024 / 1280 / 1440
- [ ] Bottom alignment with left title mid-rule still holds

---

## 3. Install card shell v2 — horizontal “news card” + copy

### Intent

Reference grammar (`docs/captures/hero-install-card-layout-ref.png`):

```text
┌─ rounded shell ──────────────────────────────────────┐
│  [ thumb ]   title / primary text          [ action ] │
│              (optional meta)               [ stack  ] │
└──────────────────────────────────────────────────────┘
```

Reference uses a **vertical switcher** (chevrons) as the trailing action.

**Our product mapping:**

| Reference                         | Kubo hero install                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Light surface + soft border       | Dark `bg-card` / `bg-background`, `border-rule`, soft-rule tokens                                      |
| “FEATURED NEWS” kicker (optional) | Optional quiet kicker: `Install` or omit entirely (prefer **omit** unless optical QA wants an eyebrow) |
| Square media thumb                | Kubo mark or small terminal/glyph tile (`/assets/kubo-mark.png` or monochrome icon in `bg-muted`)      |
| Title                             | Primary display of the **default create command** (readable, not a second nested terminal chrome box)  |
| Chevron switchers                 | **Single copy control** (icon button or stacked icon+label)                                            |

### What to remove from current `HeroInstallCard`

- Package manager tab group (`bun` | `pnpm` | `npm`) in the **hero** card
- Separate full-width command row that feels like a second nested panel (unless a single-line command is the title itself)

PM selection remains available in **`CommandSection`** lower on the page. Hero promotes one clear action: **copy the default create command**.

### Command string

- Source: `CREATE_COMMANDS` / `getCreateCommand()` from `apps/web/src/lib/create-commands.ts`
- Default manager: **`bun`** → `bun create kubots@latest`
- Do not hard-code a diverging string in the component

Optional prop for tests: `command?: string` or `defaultManager?: PackageManager` still OK, but **no PM UI** in this card.

### Suggested layout (implement this structure)

```text
┌─ rounded-xl border-rule bg-card ─────────────────────────┐
│  ┌──────┐                                                │
│  │ mark │   bun create kubots@latest           [ Copy ]  │
│  └──────┘   (mono or medium UI text)           or icon   │
└──────────────────────────────────────────────────────────┘
```

Compact / narrow rail:

```text
┌─ rounded-xl ─────────────────────────────────┐
│ [mark]  bun create kubots@latest      [⎘]    │
└──────────────────────────────────────────────┘
```

### Detailed UI rules

| Element         | Spec                                                                                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell           | `rounded-xl` (or `rounded-2xl` if QA prefers), `border border-rule`, `bg-card` or `bg-background`, horizontal flex, `items-center`, gap, padding `p-2`–`p-3`                           |
| Thumb           | Fixed square ~48–64 px, `rounded-md` or `rounded-lg`, `bg-muted`, image `object-contain` or `object-cover`; decorative `alt=""` if mark only                                           |
| Command text    | Single line preferred; `font-mono text-sm` (or `text-xs` if rail is tight); `truncate` or horizontal scroll as last resort; leading `$` optional (gold `text-primary` if kept)         |
| Copy control    | Trailing, vertically centered. Prefer a **button** with min ~44×44 hit target. Icon `Copy` → `Check` on success. Visible label “Copy” optional at `sm+`; always expose accessible name |
| Copied feedback | `aria-live="polite"`; temporary ~1.5–2 s; **no false success** on clipboard rejection (match `CommandSection` silent fail)                                                             |
| Focus           | Visible `focus-visible` rings on the copy control                                                                                                                                      |
| Motion          | No required animation; `motion-safe` only if hover on shell is added (prefer static shell)                                                                                             |
| Not a link      | Card is **not** a navigation link to `/new`. Copy only. Header still owns “Build a stack”                                                                                              |
| Switchers       | **Forbidden** in this component — no chevrons, no PM tabs, no carousel                                                                                                                 |

### Placement in rail

Unchanged relative order inside lower-right band (`HeroRailLower`):

```text
[ scroll arrows ]
[ install card v2 ]
```

Card stays `mt-auto` (or equivalent) so it sits on the bottom of the lower 40% band.

### Acceptance — install card

- [ ] Horizontal shell reads like the reference card (thumb · content · trailing action), not like a multi-row settings panel
- [ ] Dark tokens only (no light gray “news” chrome from the reference PNG)
- [ ] One primary string: default bun create command from shared map
- [ ] Copy works; live region / label updates; failure does not claim success
- [ ] No PM tabs or chevron switchers in the hero card
- [ ] `CommandSection` still offers full PM switching below the fold

---

## File checklist

| File                                                        | Action                                                |
| ----------------------------------------------------------- | ----------------------------------------------------- |
| `docs/spec-header-mission-install-card-v2.md`               | This document                                         |
| `docs/captures/hero-install-card-layout-ref.png`            | Layout reference (grammar only)                       |
| `apps/web/src/components/site/site-header.tsx`              | `h-12` cascade; larger right control type; mark scale |
| `apps/web/src/app/(home)/_components/hero-section.tsx`      | Header offset `3rem`; mission → 3 lines               |
| `apps/web/src/app/(home)/_components/hero-install-card.tsx` | Rewrite to horizontal shell + copy                    |
| `apps/web/src/app/(home)/_components/hero-rail-lower.tsx`   | Spacing tweaks only if card height changes            |
| `apps/web/src/lib/create-commands.ts`                       | Reuse as-is (no map change expected)                  |
| Global CSS / layout vars                                    | Optional `--site-header-height`                       |

---

## Implementation order

1. Header height + right type + mark fit; cascade hero `calc(100svh - …)`.
2. Mission three-line copy + `sr-only`.
3. Rewrite `HeroInstallCard` shell (thumb + command + copy); remove PM UI.
4. Visual pass 1440 / 768 / 390: header, mission band, install card.
5. `bun run check`.

### Suggested commits

```text
fix(web): shorten site header and enlarge right utilities
copy(web): compress hero mission to three lines
feat(web): restyle hero install card as horizontal copy shell
```

---

## Verification

| Check         | Pass criteria                                                                      |
| ------------- | ---------------------------------------------------------------------------------- |
| Header height | Bar is `h-12` / 48 px (or documented token); no mixed `h-14` cells on the same row |
| Right type    | GitHub + CTA clearly larger than pre-change / than quiet nav labels                |
| Hero fill     | First viewport uses matching header offset (`3rem`)                                |
| Mission       | Exactly 3 lines; sentence in `sr-only`                                             |
| Card grammar  | Thumb + command + copy; dark tokens; rounded shell                                 |
| Card behavior | Copies `bun create kubots@latest` (default); a11y name + live feedback             |
| No regression | Scroll cue, 2×2 mid-rule alignment, SignalField, CommandSection PM UI intact       |
| Lint          | `bun run check` clean                                                              |

---

## Acceptance criteria (roll-up)

- [ ] Fixed header is shorter (`h-12` / `3rem` system)
- [ ] GitHub and Build a stack use larger type than before
- [ ] Brand mark fits the shorter bar without overflow
- [ ] Mission is exactly three editorial lines (recommended copy or approved alternate)
- [ ] Install card is a horizontal dark shell with thumb, command text, and copy control
- [ ] No package-manager tabs or chevron switchers on the hero install card
- [ ] Command string comes from the shared create-command map (default bun)
- [ ] Header height and hero `100svh` offset stay in sync

## Relationship to prior specs

| Spec                                   | Relationship                                                                                                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spec-hero-title-rail-install-card.md` | Install card **content model** shifts from “PM tabs + command row” to “horizontal copy shell”; mission **length** reduced to 3 lines; title scale / 60/40 grid **kept** |
| `spec-mistral-hero-featured-rail.md`   | Right-rail grammar (mission / cue / lower card) kept; lower card again closer to a single horizontal media+action chip                                                  |
| `spec-home-editorial-system.md`        | Soft rules, dual-title, gold signal discipline still apply; header height note updates when this ships                                                                  |
| Layout ref PNG                         | **Structure only** — not palette, not “FEATURED NEWS” label, not chevron pagination                                                                                     |

When this ships, prefer not reintroducing a multi-row PM control in the hero lower-right slot without a new product decision; full install UX stays in `CommandSection`.
