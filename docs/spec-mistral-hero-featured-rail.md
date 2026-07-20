# Spec: Mistral Hero Featured Rail (mission + scroll cue + news card)

## Status

Ready for implementation

## Date

July 20, 2026

## Goal

Port the **grammar** of the Mistral homepage **right-hand featured rail** into the Kubo home shell — not the Mistral brand.

The rail is the vertical strip on the right of the hero that stacks three ideas:

1. **Mission band (top)** — large empty field with a short multi-line mission sentence anchored near the bottom.
2. **Scroll cue (middle)** — three stacked chevron-down icons with a staggered fade pulse (“keep scrolling”).
3. **Featured card (bottom)** — mono kicker + compact horizontal card (thumbnail · title · prev/next controls).

Source of truth: [https://mistral.ai/](https://mistral.ai/) measured with Playwright (Chromium headless), July 20, 2026.

This is a **layout + interaction contract** for a future Kubo implementation (copy, routes, and palette stay Kubo). Do **not** ship Mistral assets, orange brand, “FEATURED NEWS” copy, or Robostral content.

## Visual evidence

| Capture                                                | Surface                                                                                                                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User Image #1 (session)                                | Crop of the rail: cream mission band, horizontal rule, triple down-chevrons, `FEATURED NEWS` kicker, rounded news card with thumb + title + stacked chevron controls |
| `docs/captures/mistral-right-rail-clean-1440.png`      | Full right column under header at 1440×1000                                                                                                                          |
| `docs/captures/mistral-right-upper-1440.png`           | Upper mission band only                                                                                                                                              |
| `docs/captures/mistral-right-lower-1440.png`           | Lower scroll cue + featured card band                                                                                                                                |
| `docs/captures/mistral-user-ref-featured-rail.png`     | User-supplied reference (if present)                                                                                                                                 |
| `docs/.playwright-cli/mistral-right-rail-compact.json` | Compact measured boxes + keyframes                                                                                                                                   |
| `docs/.playwright-cli/mistral-right-rail-measure.json` | Multi-viewport raw dump                                                                                                                                              |
| `docs/.playwright-cli/mistral-rail-*.png`              | Full-page context shots                                                                                                                                              |

### Annotated structure (desktop)

```text
┌────────────────────────── max-w frame (≤1728) ──────────────────────────┐
│ header ~49px                                                            │
├──────────────────────────────────────────────┬──────────────────────────┤
│                                              │  UPPER RIGHT (30%)       │
│   LEFT ~70%                                  │  h ≈ 600 @ 1440          │
│   “Frontier AI…”                             │                          │
│   (out of scope for this module)             │          (empty field)   │
│                                              │                          │
│                                              │  Mission copy            │
│                                              │  bottom-biased           │
├──────────────────────────────────────────────┼──────────────────────────┤
│                                              │  LOWER RIGHT (30%)       │
│   mosaic / color field ~70%                  │  h ≈ 400 @ 1440          │
│                                              │   ↓                      │
│                                              │   ↓  scroll cue (3×)     │
│                                              │   ↓                      │
│                                              │                          │
│                                              │  FEATURED NEWS           │
│                                              │  ┌────────────────────┐  │
│                                              │  │ 🖼  Title…    ▶ │  │
│                                              │  │              ◀ │  │
│                                              │  └────────────────────┘  │
└──────────────────────────────────────────────┴──────────────────────────┘
```

User Image #1 is the **right column only** (upper + lower stacked). On Mistral it sits on the **right**; for Kubo the same grammar may pin to **left or right** — pick during implementation, keep the internal vertical stack.

---

## Research evidence (Playwright)

Tooling: Chromium headless, `deviceScaleFactor: 1`, cookie overlay forced hidden when present.

### Column split (viewport 1440 × 1000)

| Token                      | Measured                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Content frame width        | ≈ **1438–1440** px (full width under `max-w-432` / 1728 only kicks in past that)                                                 |
| Header height              | **48–49** px (`--nav-height: 48px`)                                                                                              |
| Upper band height          | **600** px                                                                                                                       |
| Lower band height          | **400** px                                                                                                                       |
| Upper + lower              | **1000** px (= viewport height; sticky hero fills `100dvh` under nav on large screens via layout, content bands sum to viewport) |
| Right column width         | **431.4** px = **30%** (`max-w-[30%]` / `w-full max-w-[30%]`)                                                                    |
| Right column `x`           | **1007.6**                                                                                                                       |
| Left column width          | **1006.6** px ≈ **69.9%**                                                                                                        |
| DOM hooks (reference only) | `.js-col-right-top`, `.js-col-right-middle` — `hidden lg:block`                                                                  |

At **1920 × 1080** (frame still full until 1728):

| Token              | Measured                                                          |
| ------------------ | ----------------------------------------------------------------- |
| Right column width | **517.8** px ≈ **27%** of viewport (still ~30% of the 1728 frame) |
| Upper band height  | **432** px (scales with viewport)                                 |
| Lower band height  | remaining sticky column                                           |

**Portable grammar:** desktop hero is a **2×2**: top/bottom rows × left/right columns, right column fixed at **~30%** of the framed content width, not a hard px width.

### Horizontal insets (content inside right column @ 1440)

| Edge                         | Math                                | Value                                         |
| ---------------------------- | ----------------------------------- | --------------------------------------------- |
| Column left                  | —                                   | `x = 1007.6`                                  |
| Mission / kicker / card left | `1047.6 − 1007.6`                   | **40 px** (`lg:pl-10` with `--spacing = 4px`) |
| Inner content width          | card / kicker                       | **351.4** px                                  |
| Right inset                  | `1007.6 + 431.4 − (1047.6 + 351.4)` | **40 px**                                     |

**Contract:** horizontal padding of the rail content stack is **40 px** on desktop (16 px on small screens where the rail becomes full-bleed).

### 1) Mission band (upper right)

| Prop            | Measured / observed                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Column box      | `431.4 × 600` @ `(1007.6, 0)` (under header the visible top is ~49)                                |
| Mission cluster | `356.4 × 84` @ `(1045.9, 477.7)` — bottom-biased inside the upper band                             |
| Layout          | `flex flex-col items-start`; vertical free space **above** the copy                                |
| Copy length     | ~3 lines: “We help organizations build tailored AI systems to solve the world’s hardest problems.” |
| Type (Mistral)  | Inter family; treat as **body-large / ~20–24 px**, weight **400–500**, tight-normal leading        |
| Color           | near-black primary text                                                                            |
| Background      | cream / `surface-brand-primary` `#fbfbf8` (inherits page surface)                                  |

**UI contract for Kubo:**

- Upper cell is a **flex column** with `justify-end` (or spacer + content) so mission copy sits on the **lower third**, not vertically centered.
- Leave **generous empty field** above the sentence (the quiet “air” is the design).
- Do not place CTAs in this band (CTAs live elsewhere on Kubo).

### 2) Scroll cue (triple chevron)

Measured nodes:

| #   | Class                                                 | Box @ 1440                  | Animation                                   |
| --- | ----------------------------------------------------- | --------------------------- | ------------------------------------------- |
| 1   | `relative size-4 block animate-fading-arrow-scroll-1` | **16×16** @ `(1047.6, 640)` | `fading-arrow-scroll 2s 0s linear infinite` |
| 2   | `…-scroll-2`                                          | **16×16** @ `(1047.6, 664)` | `… 2s 0.2s linear infinite`                 |
| 3   | `…-scroll-3`                                          | **16×16** @ `(1047.6, 688)` | `… 2s 0.4s linear infinite`                 |

| Prop         | Value                                                |
| ------------ | ---------------------------------------------------- |
| Icon size    | **16×16** (`size-4`)                                 |
| Stack gap    | **8 px** between icons (24 px center-to-center − 16) |
| Stack height | **64 px** (16 + 8 + 16 + 8 + 16)                     |
| Left inset   | **40 px** (aligned with kicker/card)                 |
| Color        | solid black / foreground                             |
| Keyframes    | see below                                            |

```css
@keyframes fading-arrow-scroll {
  0%,
  40% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  60%,
  100% {
    opacity: 0.2;
  }
}

/* staggered cascade down the stack */
.scroll-1 {
  animation: fading-arrow-scroll 2s 0s linear infinite;
}
.scroll-2 {
  animation: fading-arrow-scroll 2s 0.2s linear infinite;
}
.scroll-3 {
  animation: fading-arrow-scroll 2s 0.4s linear infinite;
}
```

**UI contract:**

- Exactly **three** chevron-down glyphs, same size, same x.
- Cascade delay **0 / 200 / 400 ms**, duration **2s**, linear, infinite.
- Respect `prefers-reduced-motion: reduce` → static opacity ~0.55, no animation.
- Optional: whole stack is a control that smooth-scrolls to the next section (`#product` / next `ui-scroll-target`). If not interactive, mark decorative (`aria-hidden`).

### 3) Featured kicker + card

#### Kicker

| Prop          | Measured                                                                                |
| ------------- | --------------------------------------------------------------------------------------- |
| Text          | `FEATURED NEWS` (Mistral) → Kubo equivalent e.g. `FEATURED` / `FROM THE LOG` / `LATEST` |
| Class grammar | `font-mono text-[13px] uppercase text-text-tertiary`                                    |
| Font          | **Space Mono** (Mistral) → map to Kubo mono / `ui-kicker`                               |
| Size          | **13 px**                                                                               |
| Line-height   | **19.5 px**                                                                             |
| Weight        | **400**                                                                                 |
| Color         | tertiary gray `oklch(0.37 0.013 285.805)` ≈ zinc-700                                    |
| Box           | `351.4 × 19.5` @ `(1047.6, 850.5)`                                                      |

Gap kicker → card top: `878 − (850.5 + 19.5) ≈ **8 px**`.

#### Card shell

| Prop          | Measured                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Class grammar | `w-full bg-surface-brand-secondary lg:bg-surface-brand-primary border border-border-primary rounded-md flex` |
| Box           | **351.4 × 82** @ `(1047.6, 878)`                                                                             |
| Background    | `#fbfbf8` (`surface-brand-primary`)                                                                          |
| Border        | **1 px solid `#e4e3de`** (`border-primary`)                                                                  |
| Radius        | **6 px** (`rounded-md`)                                                                                      |
| Layout        | horizontal flex row                                                                                          |

#### Slide row (inner)

| Prop          | Measured                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| Class grammar | `js-slider-item p-2 w-full flex items-center gap-4 justify-between`         |
| Box           | **309 × 80** @ `(1048.6, 879)` (inside shell; nav column sits to the right) |
| Padding       | **8 px** (`p-2`)                                                            |
| Gap           | **16 px** (`gap-4`)                                                         |
| Align         | `items-center`, `justify-between`                                           |

#### Thumbnail

| Prop     | Measured                                                                |
| -------- | ----------------------------------------------------------------------- |
| Size     | **64 × 64**                                                             |
| Position | left of title, inside padded row (`x ≈ 1056.6`, `y ≈ 887`)              |
| Fit      | `object-cover`                                                          |
| Radius   | **0** on the image itself (shell clips / optional `rounded-sm` on Kubo) |

#### Title

| Prop     | Observed                                                              |
| -------- | --------------------------------------------------------------------- |
| Content  | single short headline (1–2 lines), Inter 16 px / 400 on Mistral       |
| Behavior | truncates / wraps inside remaining width between thumb and nav column |

#### Prev / next controls

| Prop       | Measured                                                              |
| ---------- | --------------------------------------------------------------------- |
| Next       | **40 × 40** @ `(1359, 879)` — `aria-label="Next slide"`               |
| Previous   | **40 × 40** @ `(1359, 919)` — `aria-label="Previous slide"`           |
| Stack      | **vertical**, right edge of shell, total **80 px** tall matching card |
| Hit target | `min-w-10` / `h-10` (40 px)                                           |
| Icons      | chevron-right (top) / chevron-left (bottom) ≈ **20 px** glyphs        |
| Hover      | ghost fill (`hover:bg-action-ghost-1` ≈ 5% black)                     |
| Disabled   | muted text + `pointer-events-none` when at ends (if finite list)      |

**Card anatomy:**

```text
┌── shell 351×82, r=6, border 1px ─────────────────────┐
│  ┌ slide p-2 gap-4 ──────────────┐ ┌ nav 40 wide ──┐ │
│  │ [64² thumb]  Title text…      │ │   ›  next     │ │
│  │                               │ │   ‹  prev     │ │
│  └───────────────────────────────┘ └───────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## Scope for Kubo

### In scope

| Area                             | Intent                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| New home module (suggested path) | `apps/web/src/app/(home)/_components/featured-rail.tsx` (name free)                 |
| Wire into home hero / shell      | Compose with existing editorial grid (`lg:grid-cols-12` or dedicated 70/30 split)   |
| Scroll cue CSS                   | Small utility or local keyframes in `global.css` / module CSS                       |
| Featured items data              | 1–N entries: `{ href, title, image, eyebrow? }`                                     |
| a11y                             | Labels for carousel controls; decorative arrows hidden from AT when non-interactive |

### Out of scope

- Cloning Mistral colors, fonts (Space Mono / ALTMistral), or logo.
- Porting Swiper / their CMS news feed.
- Changing Kubo package/CLI naming.
- Rebuilding the left 70% mosaic / “Frontier AI” display type (separate specs).

### Relationship to existing specs

| Spec                                                             | Relationship                                                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `spec-page-frame-and-aligned-rails.md`                           | Outer frame, gutters, continuous rails — this rail lives **inside** that frame                               |
| `spec-home-editorial-system.md`                                  | Parent visual language; use `--rule`, `--background`, `--card`, `ui-kicker`                                  |
| `spec-kubo-home-ui-polish.md` / `spec-kubo-header-hero-aside.md` | Current Kubo hero is dark editorial; this module is a **new optional band** or a redesign of the right aside |

---

## Kubo mapping (recommended tokens)

Do not hard-code Mistral hex values in production components. Map:

| Mistral                     | Kubo                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `#fbfbf8` surface           | `--background` or `--card`                                                                          |
| `#e4e3de` border            | `--rule` / `border-rule`                                                                            |
| 13 px mono uppercase kicker | existing `.ui-kicker` + `text-muted-foreground`                                                     |
| 16 px body title            | `text-sm` / `text-base` font-medium                                                                 |
| 6 px radius                 | `rounded-md` if product allows soft corners; else square for pure editorial (document choice in PR) |
| Primary text                | `text-foreground`                                                                                   |
| Ghost hover                 | `hover:bg-muted`                                                                                    |

**Dark shell note:** Kubo home is dark. Prefer:

- Rail background: `bg-card` or `bg-background`
- Card: `border-rule bg-background` (slightly elevated vs rail)
- Chevrons: `text-primary` or `text-muted-foreground` with the same opacity keyframes
- Thumb: keep photographic; no forced invert

---

## Layout contract (implementation)

### Desktop (`lg+`)

```text
hero sticky / min-h-[100svh - header]
└─ grid rows: minmax(0, 3fr) minmax(0, 2fr)   /* ~60/40 like 600/400 */
   └─ each row: grid-cols [1fr_minmax(0,30%)] or 70/30
      right cells share one column track
```

Right column stack (single grid column spanning both rows **or** two cells in the same column):

1. **Upper:** mission (`flex flex-col justify-end`, padding 40 px)
2. **Lower:**
   - top: scroll cue (padding-top ~40 px, padding-inline 40 px)
   - bottom: kicker + card (`mt-auto`, padding 40 px, gap 8 px)

### Mobile

Mistral hides `.js-col-right-*` below `lg`. For Kubo choose one:

| Option              | Behavior                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| **A (recommended)** | Stack rail **below** primary hero headline: mission → chevrons → featured card, full width, padding 16–20 px |
| **B**               | Omit scroll cue on mobile; keep featured card under hero CTAs                                                |

Minimum touch targets for prev/next remain **40×40**.

---

## Interaction

| Control            | Behavior                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Featured card body | `Link` to item `href`; hover may tint background (`hover:bg-muted`)                                    |
| Next / Previous    | Cycle featured items; `aria-label` required; disable or wrap at ends (pick one, document in code)      |
| Scroll cue         | Optional button: `scrollIntoView` next section; if pure decoration, `aria-hidden`                      |
| Keyboard           | Tab order: card link → next → prev (or prev → next). Focus ring `focus-visible:outline-2 outline-ring` |
| Reduced motion     | No chevron pulse; no slide transitions longer than 0.01 ms                                             |

---

## Content model (Kubo)

```ts
type FeaturedRailItem = {
  id: string;
  href: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
};

type FeaturedRailProps = {
  mission: string; // 1–3 lines
  kicker?: string; // default "Featured"
  items: readonly FeaturedRailItem[]; // ≥1
};
```

Copy rules:

- Mission ≤ ~120 characters so it stays ≤3 lines at rail width.
- Title ≤ ~48 characters (avoids crushing the 64 px thumb).
- Do not use Mistral headlines.

---

## Implementation order

1. Add compact JSON + captures under `docs/` (this research) — done with this spec.
2. Implement `FeaturedRail` presentational component against the measurement table (desktop first).
3. Wire into home page grid (decide left vs right column).
4. Add scroll keyframes + `prefers-reduced-motion`.
5. Hook carousel state (client component island if needed).
6. Visual QA at 1440 / 1280 / 768 / 390 against captures.
7. `bun run check`.

Suggested commit when implementing:

```text
feat(web): add Mistral-grammar featured rail to home hero
```

---

## Acceptance criteria

- [ ] Desktop rail width ≈ **30%** of framed content (not a magic 431 px hardcode — use `%` / `fr`).
- [ ] Mission copy is **bottom-biased** with empty field above.
- [ ] Exactly **three** 16×16 chevrons, 8 px gaps, staggered 0/200/400 ms opacity pulse.
- [ ] Kicker is mono/uppercase ~13 px, muted.
- [ ] Card is bordered, **~6 px** radius (or documented square alternative), ~80 px tall, **64×64** thumb, title, vertical 40×40 prev/next.
- [ ] Content inset **40 px** desktop / **16 px** mobile.
- [ ] No Mistral brand assets or copy in production UI.
- [ ] Keyboard and reduced-motion paths verified.
- [ ] `bun run check` passes.

## Non-goals / anti-patterns

- Filling the upper band with dense UI (kills the “air”).
- Replacing the triple pulse with a single bouncing arrow (different grammar).
- Horizontal prev/next under the card (Mistral stacks them on the **right edge** of the card).
- Stretching the card to full rail height.

---

## Verification plan

1. Re-open captures: upper mission, lower chevrons, card shell.
2. `bun dev` → `/` at 1440: compare column ratio and card proportions to `mistral-right-rail-clean-1440.png` (structure only).
3. Pause animations in DevTools; confirm three discrete icons still layout correctly.
4. Tab through featured controls; confirm focus rings not clipped by `overflow-hidden`.
5. `prefers-reduced-motion: reduce` → chevrons static.

## Appendix — key measured numbers @ 1440×1000

| Element            | x      | y     | w     | h    |
| ------------------ | ------ | ----- | ----- | ---- |
| Right upper column | 1007.6 | 0     | 431.4 | 600  |
| Right lower column | 1007.6 | 600   | 431.4 | 400  |
| Mission cluster    | 1045.9 | 477.7 | 356.4 | 84   |
| Chevron 1          | 1047.6 | 640   | 16    | 16   |
| Chevron 2          | 1047.6 | 664   | 16    | 16   |
| Chevron 3          | 1047.6 | 688   | 16    | 16   |
| Kicker             | 1047.6 | 850.5 | 351.4 | 19.5 |
| Card shell         | 1047.6 | 878   | 351.4 | 82   |
| Thumb              | 1056.6 | 887   | 64    | 64   |
| Next control       | 1359   | 879   | 40    | 40   |
| Prev control       | 1359   | 919   | 40    | 40   |

Border color reference (Mistral): `#e4e3de`. Map to Kubo `--rule`.
