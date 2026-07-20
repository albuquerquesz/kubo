# Spec: Install card eyebrow + PM select; larger header mark & CTA type

## Status

Ready for implementation

## Date

July 20, 2026

## Goal

Two product polish decisions, driven by the attached captures:

1. **Hero install card** — remove the Kubo mark thumb; add a **FEATURED NEWS–style eyebrow row** with left label **“Initialize with”** and a **package manager select** (`bun` | `npm` | `pnpm`) on the opposite side; keep the command line + **copy** control in the card body.
2. **Site header** — **enlarge** the top-left brand mark and **increase type size** on the gold **“Build a stack”** button (header height from the prior pass stays unless mark overflow forces a minimal bump).

Brand remains **Kubo** / `create-kubots`. Dark shell tokens only. No Mistral assets or copy.

---

## Visual references (source of truth)

| #   | Asset / attachment                                                                | Role                                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A   | `docs/captures/hero-install-card-layout-ref.png`                                  | **Eyebrow grammar** — left kicker (“FEATURED NEWS”) opposite a trailing control stack. Adapt structure only; not light palette, not chevrons, not news title.                                                |
| B   | `docs/captures/hero-install-card-current-with-logo.png` (this session’s Image #2) | **Current install card baseline** — dark rounded shell, left gold mark in muted square, truncated `$ bun create kubots@la…`, trailing **COPY** + icon. **Remove the mark.** Keep dark chrome + copy pattern. |

### Reference A — eyebrow grammar (structural)

```text
FEATURED NEWS                    [ ▴ ]
[ thumb ]  Introducing …         [ ▾ ]
```

Map for Kubo:

| Reference A                                      | Target                                                |
| ------------------------------------------------ | ----------------------------------------------------- |
| `FEATURED NEWS` (left, small uppercase / kicker) | **`Initialize with`**                                 |
| Trailing chevron stack                           | **Package manager `<select>`** (`bun`, `npm`, `pnpm`) |
| Thumb + article title                            | **No thumb**; body is create **command** + **Copy**   |
| Light gray shell                                 | Current dark: `bg-card` / `border-rule`               |

### Reference B — current card (what ships today)

```text
┌─────────────────────────────────────────────┐
│ [🟨 mark]  $ bun create kubots@la…  [COPY ⎘] │
└─────────────────────────────────────────────┘
```

Problems vs this pass:

- Mark duplicates header brand and steals width (command truncates early).
- No package manager control on the card (only default bun).
- No eyebrow row to mirror the featured-card grammar product wants.

### Target card (compose A + B)

Eyebrow + select sit **outside** the script shell (not inside the bordered command box):

```text
  Initialize with              [ bun        ▾ ]

┌─ rounded-xl border-rule bg-card ──────────────────────┐
│  $ bun create kubots@latest              [ COPY ⎘ ]   │
└───────────────────────────────────────────────────────┘
```

Narrow rail (acceptable collapse):

```text
  Initialize with          [ bun ▾ ]

┌────────────────────────────────────────────┐
│ $ bun create kubots@latest        [ ⎘ ]    │
└────────────────────────────────────────────┘
```

Command must prefer **full string visible** once the mark is gone; truncate only as last resort.

---

## Scope

### In scope

| Surface         | Path                                                        | Work                                                                |
| --------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| Install card    | `apps/web/src/app/(home)/_components/hero-install-card.tsx` | Remove logo; eyebrow + PM select; command updates with select; copy |
| Shared commands | `apps/web/src/lib/create-commands.ts`                       | Reuse map; no diverging hard-codes                                  |
| Header brand    | `apps/web/src/components/site/site-header.tsx` `BrandMark`  | Larger mark in current bar height                                   |
| Header CTA      | same file, “Build a stack” `Link`                           | Larger label type                                                   |

### Out of scope

- Changing mission copy, left hero title, SignalField, 2×2 grid
- Redesigning `CommandSection` (may stay as deeper install UX; hero now also has PM select)
- Chevron carousel / multi-news items
- Light theme; changing soft-rule tokens
- GitHub link type (unless needed for optical balance — not required)

### Relationship to prior specs

| Spec                                     | Relationship                                                                                                                                                                |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spec-header-mission-install-card-v2.md` | **Supersedes** install-card section: no thumb; PM select returns to the hero card; eyebrow required. Header height / mission from v2 remain unless this doc says otherwise. |
| `spec-hero-title-rail-install-card.md`   | PM set still bun/npm/pnpm; strings from shared map                                                                                                                          |
| Featured layout ref                      | Eyebrow + opposite control only                                                                                                                                             |

---

## 1. Hero install card

**File:** `hero-install-card.tsx` (`"use client"`)

### 1.1 Remove logo

- Delete the mark `Image` / muted square thumb entirely.
- Free horizontal space for the full create command.
- Do not replace with another decorative glyph unless product asks later.

### 1.2 Eyebrow row (outside the script shell)

Meta row **above** the bordered script box — not inside `border-rule` / `bg-card`. Full width, `flex items-center justify-between gap-3`:

| Side      | Content                    | Style                                                                                                                                                                                                         |
| --------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Start** | Text **`Initialize with`** | Kicker / eyebrow — prefer `ui-kicker` (mono, uppercase tracking) **or** sentence case matching product voice. **Ship copy exactly:** `Initialize with` (not “FEATURED NEWS”). Color: `text-muted-foreground`. |
| **End**   | Package manager control    | See §1.3                                                                                                                                                                                                      |

Do not put Copy on the eyebrow row. Do not wrap eyebrow + select in the script shell border.

### 1.3 Package manager select

| Rule     | Detail                                                                                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Options  | `bun`, `npm`, `pnpm` (order: **bun, npm, pnpm** or **bun, pnpm, npm** — prefer same order as `PACKAGE_MANAGERS` in `create-commands.ts` for one source of truth)                                                |
| Default  | **`bun`** (`DEFAULT_PACKAGE_MANAGER`)                                                                                                                                                                           |
| Control  | Native `<select>` **or** a compact custom listbox that looks like a select (chevron, single value). Native is fine if styled to dark tokens (`bg-background`, `border-rule`, `rounded-lg`, `ui-kicker` / mono). |
| A11y     | Visible or `aria-label="Package manager"`; keyboard operable; focus ring `focus-visible`                                                                                                                        |
| Behavior | Changing manager updates the displayed command via `getCreateCommand(manager)` / `CREATE_COMMANDS[manager]` and resets “copied” state                                                                           |
| Not      | Segmented tab group like the old multi-button PM strip (select is the product ask)                                                                                                                              |

### 1.4 Script shell — command + copy only

The **only** content inside the rounded bordered shell (`rounded-xl border-rule bg-card`). Single row: `flex items-center gap-2` (or gap-3):

| Element     | Spec                                                                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Command     | `$` optional in `text-primary`; monospace command string for **selected** manager                                                             |
| Strings     | From `CREATE_COMMANDS` — bun / pnpm / npm as already defined (`bun create kubots@latest`, etc.)                                               |
| Truncation  | Prefer no truncation at rail width after mark removal; `truncate` only if overflow at 390 px                                                  |
| Copy button | Same contract as current card: min ~44×44, label “Copy” / icon, `Check` when copied, `aria-live` feedback, silent fail on clipboard rejection |

### 1.5 Shell chrome

Applies **only** to the script (command + copy) box:

- `rounded-xl`, `border border-rule`, `bg-card` (or `bg-background` if card blends better)
- Internal padding for one row (`p-2.5`–`p-3`)
- Not a link to `/new`
- Outer wrapper is unbordered: column flex with gap between meta row and script shell

### 1.6 Component API (suggested)

```ts
type HeroInstallCardProps = {
  className?: string;
  defaultManager?: PackageManager; // default "bun"
};
```

Internal state: `selectedManager`, `copied`.

### 1.7 Acceptance — install card

- [ ] No logo / mark thumb in the component
- [ ] Eyebrow left reads **Initialize with**
- [ ] Opposite side is a PM select with bun, npm, pnpm
- [ ] Selecting a manager updates the command string before copy
- [ ] Copy places the **exact** selected command on the clipboard
- [ ] Dark tokens; no light “FEATURED NEWS” chrome
- [ ] Command less truncated than Image B at the same viewport (mark gone)
- [ ] `bun run check` clean

---

## 2. Header — larger mark, larger “Build a stack” type

**File:** `apps/web/src/components/site/site-header.tsx`

### 2.1 Current (post shorter-header pass)

| Element       | Approx current                                      |
| ------------- | --------------------------------------------------- |
| Bar           | `h-12` (48 px) via shared `headerRowClass`          |
| Brand mark    | `size-9` / `sm:size-10` (36 / 40 px)                |
| Build a stack | gold `buttonVariants`, bar height, prior type scale |

### 2.2 Brand mark — increase size

| Property               | Target                                                                                                                                                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display box            | **`size-11` / `sm:size-12`** (44 / 48 px) preferred; if that overflows `h-12`, either (a) allow mark to fill nearly full bar with `size-10` / `sm:size-11` and tight padding, or (b) bump bar to `h-13`/`h-14` **only if** needed — prefer (a) keep `h-12` and maximize mark inside it |
| Image `width`/`height` | Match largest box (48) for crispness                                                                                                                                                                                                                                                   |
| Padding on brand link  | Keep tight (`px-2`–`px-2.5`); reduce further if mark needs room                                                                                                                                                                                                                        |
| Overflow               | `overflow-hidden` on wrapper; mark must not spill outside the header cell                                                                                                                                                                                                              |
| A11y                   | Unchanged: `aria-label="Kubo home"`, decorative `alt=""`                                                                                                                                                                                                                               |

**Intent:** mark should read **clearly larger** than the current small `size-9` treatment in the top-left cell (user request: “Aumenta o tamanho da logo no header”).

### 2.3 “Build a stack” — increase font size

| Property          | Target                                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label type        | **At least one step up** from current button text — prefer `text-sm` → **`text-base`** on the CTA label, or explicit `text-[0.9375rem]` / `text-sm font-semibold` if `text-base` feels oversized in `h-12` |
| Icon              | Arrow may scale with label (`size-4` → `size-4.5` / `size-5`)                                                                                                                                              |
| Height            | Still fill header row (`h-12` / `headerRowClass`); do not grow the whole bar solely for type                                                                                                               |
| Color / placement | Unchanged gold primary, right cluster                                                                                                                                                                      |

GitHub control is **out of scope** for this pass unless the CTA change makes it look oddly small — optional follow-up only.

### 2.4 Header height cascade

If bar height stays `h-12` / `3rem`, no hero offset change.

If mark forces `h-14` again, update:

- `headerRowClass`
- Hero `calc(100svh - …)` / any `--site-header-height`
- Document the final token in the PR

### 2.5 Acceptance — header

- [ ] Top-left mark is visibly larger than pre-change
- [ ] Mark does not clip or overflow the bar
- [ ] “Build a stack” label is visibly larger
- [ ] Bar still aligns mark · nav · utilities on one baseline
- [ ] No regression to mobile menu trigger hit area

---

## File checklist

| File                                                        | Action                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| `docs/spec-hero-install-eyebrow-pm-select.md`               | This document                                          |
| `docs/captures/hero-install-card-layout-ref.png`            | Eyebrow grammar ref (A)                                |
| `docs/captures/hero-install-card-current-with-logo.png`     | Current card baseline (B)                              |
| `apps/web/src/app/(home)/_components/hero-install-card.tsx` | Rewrite layout per §1                                  |
| `apps/web/src/lib/create-commands.ts`                       | Import only (map unchanged)                            |
| `apps/web/src/components/site/site-header.tsx`              | §2 mark + CTA type                                     |
| `hero-rail-lower.tsx`                                       | Touch only if spacing needs a tweak after two-row card |

---

## Implementation order

1. `HeroInstallCard`: drop mark → eyebrow + select → wire command + copy.
2. Header: enlarge mark; enlarge Build a stack type; QA overflow.
3. Visual pass 1440 / 768 / 390 (card truncation, select usability, header).
4. `bun run check`.

### Suggested commits

```text
feat(web): hero install card eyebrow and package manager select
fix(web): enlarge header mark and Build a stack type
```

---

## Verification

| Check                   | Pass                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| No logo in install card | Mark square absent in DOM/UI                                       |
| Eyebrow                 | “Initialize with” left-aligned in card header row                  |
| Select                  | bun / npm / pnpm; updates `$ …` command                            |
| Copy                    | Exact selected string; live feedback; no false success             |
| Layout vs refs          | A = eyebrow opposite control; B = dark shell + copy, without thumb |
| Header mark             | Larger than `size-9`/`size-10` baseline                            |
| CTA type                | “Build a stack” larger than pre-change                             |
| Lint                    | `bun run check` clean                                              |

---

## Acceptance criteria (roll-up)

- [ ] Install card has **no** logo/thumb
- [ ] Eyebrow copy is **Initialize with**
- [ ] Opposite the eyebrow: package manager **select** (bun, npm, pnpm)
- [ ] Command + copy row below; command follows select
- [ ] Strings from shared `create-commands` map
- [ ] Header logo larger (top-left)
- [ ] “Build a stack” font size larger
- [ ] Dark mode only; no light news-card palette

## Non-goals reminder

Do not reintroduce a left mark on the install card, chevron news switchers, or “FEATURED NEWS” copy. Full terminal theater remains optional in `CommandSection`; the hero card is a compact **initialize + copy** control with PM choice.
