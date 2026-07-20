# Spec: Community cards joined +1, taller footer, scroll-reveal icons

## Status

Ready for implementation

## Date

July 20, 2026

## Goal

Three home polish decisions:

1. **Community cards** — join all cards into one continuous rail (no air gap between cards) and **add one more** card.
2. **Footer** — increase overall vertical presence (taller CTA / brand / wordmark bands).
3. **Scroll-reveal icons** — on home scroll, reveal a short row of icons rising from behind a mask (Mistral-style grammar, **original Kubo icons/copy only**), driven by GSAP + scroll scrub.

Continues `spec-home-editorial-system.md`, `spec-gsap-motion-system-and-hero-title.md`, and community polish batches. Brand remains **Kubo**. Do **not** ship Mistral assets, SVGs, ALTMistral type, or Mistral copy.

---

## Visual / product references

| #   | Intent                                    | Current repo evidence                                                      |
| --- | ----------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Community cards with gaps; join + add one | `testimonials.tsx` — flex rail `gap-4`, three `fallbackEntries`            |
| 2   | Footer feels short                        | `footer.tsx` — CTA `min-h-[30rem]`, brand row, compact `KUBO_` band `py-8` |
| 3   | Icons rising on scroll near mission/text  | Mistral home (research only) — see §3 + skill                              |

External research target: `https://mistral.ai/` (Playwright, 1440×900, July 20, 2026).

---

## Scope

### In scope

| Surface        | Path                                                                                   | Work                                |
| -------------- | -------------------------------------------------------------------------------------- | ----------------------------------- |
| Community rail | `apps/web/src/app/(home)/_components/testimonials.tsx`                                 | Join cards; +1 fallback card        |
| Footer         | `apps/web/src/app/(home)/_components/footer.tsx`                                       | Raise min-heights / padding         |
| Scroll icons   | New component under `(home)/_components` + GSAP timeline in `apps/web/src/lib/motion/` | Masked icon rise scrubbed to scroll |
| Placement      | Home hero mission band **or** first post-hero text module                              | See §3.4                            |
| Agent skill    | `.agents/skills/scroll-reveal-icons/SKILL.md`                                          | Document pattern + anti-copy rules  |

### Out of scope

- Replacing product mosaic IA or filling mosaic structural cells (unless product later asks)
- Porting Mistral sticky hero scale (`scale(0.46→1)`) in full — only the **icon mask rise** is required this pass
- Light theme redesign; testimonials tweet/video pipeline changes beyond entry count
- Using Mistral CMS SVG paths (`bag.svg`, `robot.svg`, `earth.svg` from mistral.ai)

---

## 1. Community cards — join all + add one

**File:** `testimonials.tsx`

### Current

```tsx
// Rail
className = "… flex … gap-4 overflow-x-auto p-5 …";

// Card
className = "w-[86%] shrink-0 … border border-rule bg-card sm:w-[58%] lg:… lg:flex-1";

// fallbackEntries: 3 items (showcase, analytics, discord)
```

Cards sit with **16px gutters** (`gap-4`), so they read as separate islands.

### Target — joined rail

```text
┌──────────┬──────────┬──────────┬──────────┐
│  card 1  │  card 2  │  card 3  │  card 4  │  ← new
└──────────┴──────────┴──────────┴──────────┘
  shared 1px soft-rule seams · no gap-4 air
```

| Rule            | Detail                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Gap             | **`gap-0`** (or `gap-px` + `bg-rule` parent if easier for continuous seams)                                                                  |
| Borders         | Shared seams: prefer parent `bg-rule` + children `bg-card` with `gap-px`, **or** cards with only right/left borders without double thickness |
| Desktop         | Keep equal flex children (`lg:flex-1`); four cards share the row when space allows                                                           |
| Mobile / tablet | Horizontal snap rail may remain; joined cards still **touch** (no `gap-4`)                                                                   |
| Padding on rail | Outer padding on the scroll container may stay (`p-5` / `lg:p-10`); only **inter-card** gap goes away                                        |

### Target — +1 card

Add a fourth **fallback** entry when live entries are empty or as the last static tile in the fallback set. Recommended content (product may swap copy):

| Field       | Suggested value                                         |
| ----------- | ------------------------------------------------------- |
| eyebrow     | `Documentation` or `Open source`                        |
| title       | `Read how the layers fit.` / `Keep the generator open.` |
| description | Short line pointing to docs **or** sponsors/GitHub      |
| href        | `/docs` or `/sponsors`                                  |
| cta         | `Open docs` / `Meet sponsors`                           |
| kind        | `project` or `note`                                     |

If `liveEntries.length > 0`, still ensure at least one static “always on” card is available **or** append the new fallback so the rail never has fewer marketing destinations than today + 1 when using fallbacks only. Prefer: **`fallbackEntries` becomes length 4**; live prepend still works.

### Acceptance — community

- [ ] No visible air gap between adjacent community cards at lg
- [ ] Soft-rule seams only (editorial system)
- [ ] At least **four** cards when using fallback-only data
- [ ] Snap / keyboard scroll still usable on mobile
- [ ] Focus rings remain visible on CTAs

---

## 2. Footer — increase height

**File:** `footer.tsx`

### Current (approx.)

| Band                  | Current                             |
| --------------------- | ----------------------------------- |
| Final CTA left        | `min-h-[30rem]`                     |
| Final CTA right links | `min-h-60` / `min-h-44`             |
| Brand + nav row       | Content-driven padding `p-6`–`p-10` |
| Copyright             | `min-h-14`                          |
| Wordmark `KUBO_`      | `py-8`, display clamp up to `12rem` |

### Target

Increase vertical presence **without** bloating link density:

| Band                            | Target                                                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Final CTA left (`ui-rule-grid`) | **`min-h-[36rem]`** or **`min-h-[40rem]`** at `lg` (≈ +20–30% vs 30rem)                                                                |
| Right “Build your stack”        | **`min-h-72`** or **`min-h-80`** (was `min-h-60`)                                                                                      |
| Right terminal path             | **`min-h-52`** or **`min-h-56`** (was `min-h-44`)                                                                                      |
| Brand + nav columns             | Increase vertical padding: e.g. `lg:p-12` / `lg:py-14` and/or `min-h` on the brand column (`min-h-[16rem]`+) so the block reads taller |
| Wordmark band                   | Increase vertical padding: **`py-12`–`py-16`** (was `py-8`); optional slight bump to display clamp max if optical QA wants larger type |
| Copyright row                   | Optional `min-h-16`                                                                                                                    |

Do not add fake empty modules solely for height; prefer **padding + min-height** on existing bands.

### Acceptance — footer

- [ ] Desktop footer first screen of footer is clearly taller than pre-change
- [ ] CTA headline still fits; no overflow clip on the display line
- [ ] Mobile stacks remain usable (min-heights may be slightly lower than lg via responsive classes)

---

## 3. Scroll-reveal icons (Mistral grammar → Kubo)

### 3.1 Playwright research summary (`https://mistral.ai/`, 1440×900)

Evidence captured July 20, 2026 with Chromium/Playwright.

**DOM (reference only):**

```html
<div class="w-full justify-center gap-4 hidden lg:flex">
  <div class="flex overflow-hidden size-14">
    <img class="block size-full js-right-top-content-icon …" src="…/bag.svg" alt="" />
  </div>
  <!-- robot.svg, earth.svg — same mask pattern -->
</div>
```

Sits **above** mission sentence lines inside `.js-right-top-content` (right column of sticky hero). Desktop-only (`hidden lg:flex`).

**Mask mechanics:**

| Piece                       | Behavior                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrapper                     | `overflow-hidden` + fixed square (`size-14` = 56px)                                                                                          |
| Icon                        | `block size-full`; decorative `alt=""`                                                                                                       |
| Rest state (start of scrub) | `transform: translate(0, 100%)` — fully **below** the clip                                                                                   |
| End state                   | `translate(0, 0%)` — fully visible inside the mask                                                                                           |
| Motion engine               | GSAP (inline `transform` / `translate3d` updated on scroll; `_gsap` present)                                                                 |
| Scroll coupling             | Scrubbed: Y% eases from ~100% → 0% between roughly scrollY 200–1200 at 900px viewport                                                        |
| Stagger                     | Icons do **not** share one Y; leader advances first (bag), then robot, then earth — same scrub window, offset progress                       |
| Parent section              | Also scales/translates (`scale ~0.47→1`, origin bottom-left) over hero sticky height (`lg:min-h-[200dvh]`) — **optional** for Kubo this pass |

**Feel:** icons “surface from under” the text block — not a fade-in from opacity alone; the mask + `y: 100%→0%` is the signature.

Full agent-facing write-up: [`.agents/skills/scroll-reveal-icons/SKILL.md`](../.agents/skills/scroll-reveal-icons/SKILL.md).

### 3.2 Kubo product mapping

| Mistral                   | Kubo                                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| bag / robot / earth SVGs  | **Original** Lucide icons **or** Kubo mark variants / simple mono SVGs in `public/assets` — no hotlinked Mistral CMS files                   |
| 3 icons                   | **3** (default) or 3–4 if product wants parity with stack pillars                                                                            |
| Right sticky hero mission | Prefer attach to **hero mission column** (upper-right band) **or** a dedicated strip above mission lines — implementer places for optical QA |
| Full sticky scale hero    | **Out of scope** unless a follow-up reopens sticky hero                                                                                      |

Suggested icon concepts (replace freely):

1. Terminal / command
2. Layers / stack
3. Box / package

Gold (`text-primary`) or cream (`text-foreground`) on dark; keep SignalField separate.

### 3.3 Motion contract (GSAP)

Use existing stack: `gsap`, `@gsap/react`, `apps/web/src/lib/motion/*`.

```ts
// Conceptual timeline (scrubbed)
// each icon: from { yPercent: 100 } to { yPercent: 0 }
// stagger: 0.08–0.15 (or ScrollTrigger with staggered start offsets)
// ease: none when scrub: true (or power2.out if one-shot onEnter)
// prefers-reduced-motion: set yPercent: 0 immediately; no scrub
```

| Rule           | Detail                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Trigger        | `ScrollTrigger` on a home section trigger (hero or mission wrapper); `scrub: true` (or `scrub: 0.4`) |
| Start / end    | e.g. `start: "top 70%"`, `end: "top 30%"` — tune so icons fully appear while mission is in view      |
| Mask           | Parent **must** be `overflow-hidden` with fixed size (`size-12`–`size-14`)                           |
| GPU            | Prefer `yPercent` / `force3D`; avoid layout thrash                                                   |
| A11y           | Icons decorative (`aria-hidden` on row); no information only in icons                                |
| Reduced motion | Skip animation; icons visible at rest                                                                |
| Mobile         | Match Mistral: **hide row below `lg`** (`hidden lg:flex`) unless design asks otherwise               |

### 3.4 Suggested component shape

**File:** `apps/web/src/app/(home)/_components/scroll-reveal-icons.tsx` (`"use client"`)

```ts
type ScrollRevealIconsProps = {
  className?: string;
  /** Icon nodes or lucide components — 3 recommended */
  icons?: React.ReactNode[];
};
```

Timeline helper: `apps/web/src/lib/motion/timelines/scroll-reveal-icons.ts`.

Wire from `hero-section.tsx` (mission band) or a thin module under the title — **not** inside the install card.

### 3.5 Acceptance — icons

- [ ] At rest (top of scrub), icons are clipped away (not fully visible)
- [ ] On scroll through the trigger range, icons rise into the mask to full visibility
- [ ] Stagger between icons is perceptible
- [ ] `prefers-reduced-motion: reduce` shows final state without scrub
- [ ] No Mistral assets or classnames (`js-right-top-content-icon` naming optional; prefer Kubo names)
- [ ] Desktop-only by default; no layout shift on mobile

---

## File checklist

| File                                                                     | Action                                 |
| ------------------------------------------------------------------------ | -------------------------------------- |
| `docs/spec-home-community-footer-scroll-icons.md`                        | This document                          |
| `.agents/skills/scroll-reveal-icons/SKILL.md`                            | Pattern skill from Playwright research |
| `apps/web/src/app/(home)/_components/testimonials.tsx`                   | Join rail + 4th fallback card          |
| `apps/web/src/app/(home)/_components/footer.tsx`                         | Taller bands                           |
| `apps/web/src/app/(home)/_components/scroll-reveal-icons.tsx`            | **Create**                             |
| `apps/web/src/lib/motion/timelines/scroll-reveal-icons.ts`               | **Create**                             |
| `apps/web/src/app/(home)/_components/hero-section.tsx` (or mission host) | Compose icons row                      |
| `apps/web/src/lib/motion/index.ts`                                       | Re-export if needed                    |

---

## Implementation order

1. Community rail join + fourth fallback card.
2. Footer min-height / padding bumps.
3. GSAP scroll-reveal icons timeline + component; wire to hero mission.
4. Reduced-motion + 1440 / 768 / 390 visual pass.
5. `bun run check`.

### Suggested commits

```text
fix(web): join community cards and add fourth fallback
fix(web): increase home footer vertical scale
feat(web): add scroll-reveal icons for home mission
docs(agents): add scroll-reveal-icons skill from Mistral research
```

---

## Verification

| Check        | Pass                                              |
| ------------ | ------------------------------------------------- |
| Community    | Cards touch; ≥4 fallbacks; soft seams             |
| Footer       | Visibly taller CTA + wordmark bands               |
| Icons        | Mask rise on scroll; stagger; reduced-motion safe |
| Brand safety | No Mistral SVGs/copy/type                         |
| Lint         | `bun run check` clean                             |

---

## Acceptance criteria (roll-up)

- [ ] Community cards are joined (no `gap-4` air) and fallback set has **four** cards
- [ ] Footer height increased on CTA and wordmark regions
- [ ] Scroll-reveal icons implement overflow mask + `yPercent` 100→0 scrub with stagger
- [ ] Skill documents the pattern for future agents
- [ ] Editorial soft-rule / gold / dual-title contracts unchanged

## Relationship to prior specs

| Spec                                        | Relationship                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `spec-kubo-home-ui-polish-batch-3.md`       | Community card height/chrome kept; **gap** and **count** updated here  |
| `spec-gsap-motion-system-and-hero-title.md` | GSAP remains standard; this adds a **scroll-scrubbed** timeline family |
| `spec-home-editorial-system.md`             | Soft rules, decorative non-interactive icons, reduced motion           |
| `spec-mistral-inspired-ui-skill.md`         | Structural inspiration only; this adds a **focused motion** skill      |

When this ships, do not reintroduce large gutters between community cards without a product decision.
