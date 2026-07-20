# Spec: Hero title scale, left 60/40 rail, install card

## Status

Ready for implementation

## Date

July 20, 2026

## Goal

Polish the home hero (`HeroSection` + `FeaturedRail` + header brand) so it matches the editorial intent of the current screenshot, with these product decisions:

1. Drop the third headline line **“Yours.”**
2. **Substantially reduce** display type size
3. Mirror the right rail’s **60 / 40** vertical split on the **left** column and **bottom-align** the title in the upper band
4. Enlarge the top-left brand mark and tighten its horizontal padding
5. Remove the **“Featured”** kicker
6. Increase border-radius on the former featured card shell
7. Replace the featured link card with an **install snippet** card: package manager switcher (`npm` | `pnpm` | `bun`) + copyable create command

Home page composition stays:

```text
main.ui-frame
├── HeroSection          ← this spec
├── SponsorsSection
├── CommandSection
├── ProductMosaicSection
├── CapabilitySection
├── Testimonials
└── Footer
```

Source of truth for route wiring: `apps/web/src/app/(home)/page.tsx` (no page-level change required unless hero props move).

This continues `spec-home-editorial-system.md`, `spec-mistral-hero-featured-rail.md`, and `spec-gsap-motion-system-and-hero-title.md`. Brand remains **Kubo** / `create-kubots` display strings — not Mistral assets or copy.

---

## Visual reference (current state → target)

Screenshot under discussion (desktop ~1440): large three-line title flush-left, right rail with mission (top) + scroll cue + “FEATURED” kicker + horizontal image card.

| Area               | Current (repo)                                                           | Target                                                   |
| ------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------- |
| Title copy         | `One command.` / `Every layer.` / `Yours.`                               | `One command.` / `Every layer.` only                     |
| SEO `h1`           | `One command. Every layer. Yours.`                                       | `One command. Every layer.`                              |
| Display size       | Mobile `clamp(2.75rem,12vw,4.25rem)`; desktop `clamp(3.5rem,8vw,8.5rem)` | **Much smaller** — see §2                                |
| Left column layout | Single flex band, `justify-center`                                       | **60/40** vertical split; title **bottom of upper band** |
| Header mark        | `size-10` / `sm:size-11`, `px-4` / `sm:px-5`                             | Larger mark, **less** horizontal padding                 |
| Right lower card   | Kicker “Featured” + `Link` to builder                                    | **No kicker**; rounded install card with PM + copy       |
| Scroll arrows      | Keep                                                                     | Keep (above install card)                                |
| Mission copy       | Keep                                                                     | Keep                                                     |

---

## Scope

### In scope

| Surface         | Path                                                               | Work                                           |
| --------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| Hero title      | `hero-section.tsx`, `hero-display-title.tsx`                       | Copy, SEO string, type scale, left 60/40 shell |
| Right rail      | `featured-rail.tsx` (rename optional)                              | Drop kicker; swap card for install snippet     |
| Install card    | New or inlined client component under `(home)/_components`         | PM tabs + command + copy                       |
| Header brand    | `site-header.tsx` `BrandMark`                                      | Size + padding                                 |
| Shared commands | Prefer reuse of strings from `command-section.tsx` / `stack-utils` | Single source for create commands              |

### Out of scope

- Changing `page.tsx` section order or non-hero modules (`SponsorsSection`, mosaic, capabilities, testimonials, footer)
- Rewriting `CommandSection` (may **share** command map; do not delete the lower section in this pass)
- GSAP recipe changes beyond updating dual-title copy / split line count
- New package managers beyond npm / pnpm / bun
- Light theme redesign

---

## 1. Title copy — remove “Yours.”

### Visual (decorative `p`)

```tsx
One command.
<br />
<span className="text-primary">Every layer.</span>
```

No third line. No trailing “Yours.”

### SEO / a11y (`h1.sr-only`)

```text
One command. Every layer.
```

Pass as `HeroDisplayTitle` `title` prop. Keep dual-title contract from `spec-gsap-motion-system-and-hero-title.md` (one `h1`, decorative `aria-hidden`).

### GSAP note

Intro still splits on `<br />` → **two** lines. No change to ease/stagger tokens required; verify mask rise still looks correct with two lines.

---

## 2. Display type — substantially smaller

### Intent

The current desktop clamp tops out at **8.5rem** (~136 px). The screenshot still reads “billboard.” Target is a **strong but secondary** display: readable as the lead statement without dominating the entire left column.

### Recommended scales (implement these unless visual QA demands ±1 step)

| Breakpoint       | Class / token                                            | Approx range |
| ---------------- | -------------------------------------------------------- | ------------ |
| Default (mobile) | `text-[clamp(2rem,8vw,2.75rem)] leading-[1.02]`          | ~32–44 px    |
| `lg+`            | `lg:text-[clamp(2.5rem,4.5vw,4.5rem)] lg:leading-[0.95]` | ~40–72 px    |

Keep:

- `.ui-display` (Archivo, weight 600, tight tracking)
- Gold emphasis on **Every layer.** via `text-primary`
- No hard-coded Mistral `6rem`

### Acceptance

- At 1440 px, title is clearly smaller than pre-change hero (visual delta: roughly **half** the previous max size class).
- Two lines still fit without wrapping awkwardly inside the left column at 1024 / 768 / 390.
- Dual-title SEO string unchanged by size.

Cross-update note: this **supersedes** the larger clamps in `spec-home-editorial-system.md` § Hero and `spec-gsap-motion-system-and-hero-title.md` display size rows for the home hero only. Other sections keep their own scales.

---

## 3. Left column = same 60 / 40 as right; title at bottom of upper band

### Right rail contract (existing)

`FeaturedRail` already uses:

| Band  | Flex              | Role                                    |
| ----- | ----------------- | --------------------------------------- |
| Upper | `flex-[3]` (~60%) | Mission, `justify-end` (bottom of band) |
| Lower | `flex-[2]` (~40%) | Scroll cue + card, top border           |

### Left column target

Mirror structure inside the left grid cell of `hero-section.tsx`:

```text
left column (flex col, full height of hero row)
├── upper  flex-[3]   justify-end   → HeroDisplayTitle
└── lower  flex-[2]   border-t?     → empty structural band (or optional future CTA)
```

Rules:

1. Use the **same flex ratios** as the right rail (`flex-[3]` / `flex-[2]`), not a one-off percentage that drifts.
2. Upper band: `flex flex-col justify-end` so the title sits on the **bottom edge** of the upper band (aligned with the mission block’s vertical bias on the right).
3. Horizontal padding: keep title flush-left to the page frame edge if that is the current editorial choice (no extra side padding on the title wrapper unless the right rail’s `px-*` alignment is explicitly matched later). Prefer **matching right-rail horizontal padding** (`px-4 sm:px-5 lg:px-10`) if optical alignment with mission becomes necessary — implementer decides in visual QA; default **match right rail horizontal padding** for consistency.
4. Lower left band: **no fake featured content**. It may be empty. Optional soft `border-t border-rule` only if it improves grid rhythm without looking broken. Do **not** put a second install card on the left.
5. Mobile: stack remains title → right rail content; left 60/40 may collapse to a single compact title block with bottom bias (`justify-end` + min-heights) so the large empty lower band does not waste mobile viewport. Acceptable mobile behavior:
   - **Preferred:** keep 60/40 but with reduced min-heights so total left column stays ~22–28 rem.
   - **Allowed:** on `<lg`, single column title with `pb` spacing equivalent to bottom-of-upper-band, without a tall empty lower region.

### Grid columns (horizontal)

Keep the existing desktop split unless a later pass changes it:

```text
lg:grid-cols-[minmax(0,1fr)_minmax(0,30%)]
```

Item 3 is about **vertical** 60/40 inside the left cell, not changing the 70/30 column ratio.

---

## 4. Header logo — larger mark, less horizontal padding

**File:** `apps/web/src/components/site/site-header.tsx` → `BrandMark`

| Property               | Current                                               | Target                                                                          |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| Mark box               | `size-10` / `sm:size-11` (40 / 44 px)                 | `size-12` / `sm:size-14` (48 / 56 px) — fill the 56 px header height more fully |
| Image `width`/`height` | 44                                                    | Match display box (56) for crispness                                            |
| Link padding           | `px-4` / `sm:px-5`                                    | `px-2.5` / `sm:px-3` (tighter left/right around mark)                           |
| Header row height      | `h-14` (56 px)                                        | Unchanged                                                                       |
| Wordmark text          | None (mark only)                                      | Unchanged                                                                       |
| A11y                   | `aria-label="Kubo home"`, image `alt=""` + decorative | Unchanged                                                                       |

Do not let the mark overflow the header cell (`overflow-hidden` on the image wrapper is fine). Focus ring must remain visible (`outline-offset` already on the link).

---

## 5. Remove “Featured” kicker

- Delete the visible kicker node (`<p className="ui-kicker …">{kicker}</p>`).
- Remove the `kicker` prop from `FeaturedRail` (or stop passing it from `hero-section`).
- Do not replace with another eyebrow unless product asks later.
- Update `aria-label` on the aside if it still says “featured links” after the card becomes an install tool — e.g. `Mission and install command`.

---

## 6. Larger border-radius on the install card shell

Former featured `Link` used square `border border-rule` with only the **thumb** at `rounded-md`.

Target shell:

| Token          | Value                                                                                   |
| -------------- | --------------------------------------------------------------------------------------- |
| Card radius    | `rounded-xl` (preferred) or `rounded-2xl` if still too sharp at QA                      |
| Inner controls | May use slightly smaller radius (`rounded-lg`) so nested PM chips don’t fight the shell |
| Do not         | Round the entire right rail or the hero section                                         |

Radius applies to the **install card container**, not to mission text or scroll arrows.

---

## 7. Install snippet card (replaces featured link)

### Product behavior

Replace the horizontal image + title `Link` with a compact **create-command** control:

1. **Package manager control** — exclusive selection among `npm` | `pnpm` | `bun` (default **`bun`**, consistent with `CommandSection` and product defaults).
2. **Command display** — monospace string for the selected manager.
3. **Copy button** — copies the exact command string to the clipboard; temporary “copied” feedback (`aria-live`).

### Command map (canonical display strings)

Reuse the same strings as `CommandSection` / `generateStackCommand` base:

| Manager | Command                     |
| ------- | --------------------------- |
| bun     | `bun create kubots@latest`  |
| pnpm    | `pnpm create kubots@latest` |
| npm     | `npx create-kubots@latest`  |

**Implementation preference:** extract a shared module once, e.g. `apps/web/src/lib/create-commands.ts` (or export from an existing util), and import from both `CommandSection` and the new hero card. Avoid three diverging hard-coded maps.

### Suggested UI layout (within lower right band)

```text
[ ↓ ↓ ↓ scroll cue ]          ← existing arrows, unchanged

┌─ rounded-xl border-rule ─────────────────────────┐
│  [ bun ] [ pnpm ] [ npm ]          [ Copy ]      │
│  $ bun create kubots@latest                      │
└──────────────────────────────────────────────────┘
```

Compact alternate (if width is tight):

```text
┌─ rounded-xl ─────────────────────────────────────┐
│  bun | pnpm | npm                          copy  │
│  $ bun create kubots@latest                      │
└──────────────────────────────────────────────────┘
```

### Interaction / a11y

| Rule           | Detail                                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PM control     | `role="group"` + `aria-label="Package manager"`; selected control `aria-pressed="true"` (same pattern as `command-section.tsx`)                                    |
| Copy           | Button, min hit target 44×44 where practical; label “Copy command” / live region “Command copied”                                                                  |
| Keyboard       | Tab order: scroll cue → PM buttons → copy (or PM → copy if scroll is separate)                                                                                     |
| Focus          | Visible `focus-visible` rings on all controls                                                                                                                      |
| Failure        | Clipboard rejection: no false “copied”; optional silent fail or toast (match existing home patterns — `CommandSection` fails silent; either is fine if consistent) |
| Reduced motion | No required motion; copied state is state-only                                                                                                                     |
| No navigation  | Card is **not** a link to `/new` (header still has Build a stack). Optional secondary text link is out of scope                                                    |

### Component shape

**Recommended file:** `apps/web/src/app/(home)/_components/hero-install-card.tsx` (`"use client"`)

```ts
type PackageManager = "bun" | "pnpm" | "npm";

type HeroInstallCardProps = {
  className?: string;
  /** Default package manager. Default "bun". */
  defaultManager?: PackageManager;
};
```

`FeaturedRail` (or a renamed `HeroAside`) composes:

- mission upper band (unchanged)
- scroll cue (unchanged)
- `<HeroInstallCard />` instead of featured `Link` + items prop

### Cleanup of featured items

After swap:

- Remove `featuredItems` from `hero-section.tsx`.
- Remove `FeaturedRailItem` / `items` props if unused.
- Optionally rename `featured-rail.tsx` → `hero-aside.tsx` in the same PR if the name becomes misleading; not required if churn is high — at minimum update comments/aria that say “featured”.

---

## File checklist

| File                                                         | Action                                                                 |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `docs/spec-hero-title-rail-install-card.md`                  | This document                                                          |
| `apps/web/src/app/(home)/_components/hero-section.tsx`       | Two-line title; left 60/40; wire install card; drop featured items     |
| `apps/web/src/app/(home)/_components/hero-display-title.tsx` | No API change required (props already cover title + children)          |
| `apps/web/src/app/(home)/_components/featured-rail.tsx`      | Drop kicker/items; host install card; aria update                      |
| `apps/web/src/app/(home)/_components/hero-install-card.tsx`  | **Create**                                                             |
| `apps/web/src/lib/create-commands.ts` (or equivalent)        | **Create** shared command map; wire `command-section` optional same PR |
| `apps/web/src/components/site/site-header.tsx`               | BrandMark size + padding                                               |
| `docs/spec-home-editorial-system.md`                         | Optional follow-up: note hero type scale + install card (not blocking) |

---

## Implementation order

1. Shared create-command map (small extract).
2. `HeroInstallCard` + replace featured card; remove kicker; radius.
3. Hero title copy + type scale + left 60/40 layout.
4. Header `BrandMark` size/padding.
5. `bun run check` + visual pass at 1440 / 768 / 390.
6. Dual-title / reduced-motion smoke (two-line intro).

### Suggested commits

```text
feat(web): add shared create-command map for install UI
feat(web): replace hero featured card with PM install snippet
feat(web): tighten hero title scale and left 60/40 rail
fix(web): enlarge header brand mark, reduce padding
```

---

## Verification

| Check      | Pass criteria                                                               |
| ---------- | --------------------------------------------------------------------------- |
| Copy       | No “Yours.” in decorative or SEO title                                      |
| Type       | Desktop max ≈ 4.5rem; clearly smaller than previous 8.5rem billboard        |
| Left rail  | Upper ~60% bottom-aligns title; lower ~40% empty/structural                 |
| Right rail | Mission + arrows + install card; no “Featured”                              |
| Install    | Switching bun/pnpm/npm updates command; copy puts exact string on clipboard |
| Header     | Larger logo, tighter horizontal padding; still 56 px bar                    |
| A11y       | Single `h1`; install controls labeled; aside label not “featured links”     |
| Lint       | `bun run check` clean                                                       |

---

## Acceptance criteria (roll-up)

- [ ] Title is two lines: “One command.” + gold “Every layer.”
- [ ] SEO `h1` is `One command. Every layer.`
- [ ] Display type uses the reduced clamps in §2
- [ ] Left column mirrors right vertical 60/40; title bottom of upper band
- [ ] Brand mark enlarged; horizontal padding reduced
- [ ] “Featured” kicker removed
- [ ] Install card has larger radius (`rounded-xl`+)
- [ ] Install card supports bun / pnpm / npm + copy
- [ ] Command strings match product `create-kubots` display naming
- [ ] No regression to mission copy, scroll cue, SignalField, or page section order

## Relationship to prior specs

| Spec                                        | Relationship                                                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `spec-home-editorial-system.md`             | Hero type scale for home is **updated** by this doc; soft rules / dual-title / SignalField still apply                        |
| `spec-mistral-hero-featured-rail.md`        | Right-rail **grammar** (mission / cue / lower card) kept; lower card **content** becomes install snippet, not a featured link |
| `spec-gsap-motion-system-and-hero-title.md` | Dual-title + GSAP intro remain; copy becomes two lines; size tokens overridden by §2                                          |
| `spec-kubo-home-ui-polish*.md`              | Header mark guidance refined (larger, less padding)                                                                           |

When this ships, prefer not reintroducing a third title line or a non-interactive “Featured” marketing card in the hero lower-right slot without a new product decision.
