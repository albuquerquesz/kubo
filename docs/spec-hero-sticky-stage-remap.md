# Spec: Hero sticky stage remap (post occupancy false-positive)

## Status

**Implemented (2026-07-21 polish).**
In-flow type+pad host, title exit+fade, stage-clear (install/L2), host **centered** at pin end, reverse scrub verified. Absolute empty `%` stage host remains rejected.

## Date

2026-07-21

## Goal

Match Mistral **stage takeover** mechanics: large in-flow mission content scales out of the right-top rail, the **title exits upward**, content **centers on the sticky stage**, and lower rail content is **covered / cleared optically** — without cloning brand, typeface, or CMS assets.

### User description (validated 2026-07-21)

> As you scroll, the text container grows until it takes **100% of the viewport**. Icons appear; text **centers**. Scrolling **up reverses** — container shrinks back to original size and place.

**Playwright correction / precision:**

| User language                   | Measured mechanic                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Container takes 100% viewport” | **Sticky shell** is already ~100% viewport; mission host painted max is **~64%×44%** (924×396 on 1440×900). The _stage_ is full-bleed; the _host_ is the growing/centering content. |
| “Text centers”                  | Host center Δx: **+504 → ~0** over pin (probe).                                                                                                                                     |
| “Icons appear”                  | Family C yPercent 100→0 inside host (same pin).                                                                                                                                     |
| “Scroll up reverses”            | GSAP `scrub` is bidirectional — down/up samples **match** at y=0 and y=900.                                                                                                         |

Evidence: `docs/captures/mistral-container-grow-2026-07-21/` + `docs/.playwright-cli/probe-mistral-container-grow.mjs`.  
User frames: `user-rest-*.png`, `user-end-full-stage.png` in that folder.

## Artifacts (this session)

| Path                                          | Content                                                                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `docs/captures/hero-sticky-remap-2026-07-21/` | Screenshots y0/200/450/700/900 + clean Mistral + `remap-report.json` + `fade-report.json`                               |
| Probe scratch                                 | `/tmp/hero-remap-probe/` (same frames)                                                                                  |
| Parent occupancy gap-spec                     | `docs/spec-hero-sticky-scale-screen-occupancy.md` (metrics still useful; **strategy B absolute host is wrong vehicle**) |
| Skill                                         | `.agents/skills/kubo-motion-grammar/SKILL.md` (Family B + **B2 title exit** updated)                                    |

Viewport: **1440×900**. Sites: `https://mistral.ai/` + `http://localhost:3333/`.

---

## User-visible bug (Kubo after strategy B)

From product screenshot + local probe:

1. Mission text **left the right-top card** (absolute host floating over the grid).
2. Rest styling collapsed: small **28px** type scaled by 0.47 ≈ **13px** optical.
3. On scroll, text moves toward center (translate ok-ish) but **grid cards stay put** — install card remains fully legible; title never leaves.
4. Empty scaled host box scores high occupancy metrics while **ink/type occupancy is tiny**.

**Conclusion:** measuring host `getBoundingClientRect` area alone is insufficient. Stage takeover is **type size + in-flow host + title exit + z-index cover**, not an empty percentage box.

---

## Mistral model (revalidated 2026-07-21)

### Layout (not absolute stage layer)

```
sticky (.js-sticky, ~900px, overflow-x-hidden)
├── upper band (~60dvh)
│   ├── left ~70%  — title wrap (.js-main-title)  ← translateY exit
│   └── right ~30% — card shell (.js-col-right-top-inner, z-5, bg)
│                    └── .js-right-top-content     ← scale+translate host
│                         padding lg:p-20 (80px)
│                         type ~56px / weight 500 / nowrap lines
│                         icons 56px masks above sentences
└── lower band (~40dvh)
    ├── mosaic / media
    └── featured news (.js-right-bottom)
```

| Fact                      | Probe                                          |
| ------------------------- | ---------------------------------------------- |
| Host `position`           | **`relative`** (in-flow inside right-top card) |
| Host offset (layout)      | **924×396**                                    |
| Host padding              | **80px** (`lg:p-20`)                           |
| Sentence font             | **56px** constant (scale changes optical size) |
| Host z-index              | **5** (above lower band)                       |
| Card shell                | Stays fixed; **does not** scrub with the host  |
| Absolute empty stage host | **Not used**                                   |

Rest optical size ≈ `56px × 0.4664 ≈ 26px`. End optical size = **56px** full.

### Family B — host transform (unchanged axes)

|            | Rest        | End pin (~900) |
| ---------- | ----------- | -------------- |
| scale      | 0.4664      | 1.0            |
| translateX | 0           | ~258           |
| translateY | 0           | ~−252          |
| origin     | bottom left | bottom left    |

Painted host left: **1009 → 259** (claims center stage).  
Painted host size: **431×185 → 924×396**.

### Family B2 — title / left column exit (**missing on Kubo**)

Scrubbed on **title wrap / left column** (same pin window), **not** opacity:

| scrollY | title wrap `translateY` | title `top` (viewport) |
| ------- | ----------------------- | ---------------------- |
| 0       | 0                       | ~308                   |
| 150     | **−137.5**              | ~33                    |
| 300     | **−250**                | ~−192 (off-screen)     |
| 450     | **−337.5**              | ~−367                  |
| 600     | **−400**                | ~−492                  |
| 900     | **−450**                | ~−592                  |

Opacity stays **1**. Title is physically translated off the top of the sticky frame.

End magnitude ≈ **−450px ≈ −50% of sticky height** (900).

### How lower cards “leave”

| Mechanism          | Mistral                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| Lower card opacity | stays **1** (no fade tween required)                                          |
| Cover              | Growing host / right-top shell **elementFromPoint-covers** lower band mid-pin |
| Title              | Already off-screen via B2                                                     |
| Result             | End frame is **mission-only stage** (icons + 3 lines) on full-bleed sticky    |

Cards are not parented into the scale host. The **composition clears** via B2 + cover, not by animating the install card’s layout box as the scale target.

### Centering + reverse (must ship)

| Checkpoint     | Pass                                                                 |
| -------------- | -------------------------------------------------------------------- |
| Rest           | Mission in right-top card; host center far right (Δx large positive) |
| Mid pin        | Host growing; Δx decreasing toward 0; icons rising; title exiting    |
| End pin        | Host **visually centered** on sticky stage (Δx≈0); title off-top     |
| Scroll up to 0 | Scale/tx/ty and layout match rest (scrub reverse)                    |
| Do not         | Grow host layout to `100vw×100vh`; that is not what Mistral measures |

---

## Kubo delta (2026-07-21)

| Piece          | Mistral                      | Kubo (broken strategy B)           |
| -------------- | ---------------------------- | ---------------------------------- |
| Host position  | in-flow relative             | **`absolute` 64%×44%** over sticky |
| Mission font   | 56px                         | **28px**                           |
| Host padding   | 80px                         | modest cell padding                |
| Title exit     | translateY → −450            | **none** (title.top stuck ~395)    |
| Install card   | covered / composition clears | **always visible**                 |
| Occupancy area | real type+pad box            | empty transparent box (false pass) |

---

## Change map (implement this, not absolute stage)

### 1. Restore in-flow Family B host inside R1 card

|            |                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Paths**  | `apps/web/src/app/(home)/_components/hero-section.tsx`                                                                                                                |
| **Do**     | Remove `lg:absolute lg:w-[64%] lg:h-[44%] lg:left-[70%]`. Host is normal flow in right-top cell, `origin-bottom-left`, `relative z-10`, `overflow-visible` ancestors. |
| **Do not** | Keep empty percentage stage layer for metric gaming.                                                                                                                  |

### 2. Grow host via type + padding (true offset box)

|            |                                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Do**     | Desktop mission type ≈ **3–3.5rem (48–56px)** brand-safe Archivo; `lg:p-16`–`lg:p-20`; `lg:text-nowrap` lines. Target unscaled offset near **≥550×280** (prefer closer to 900×380 when copy allows). Rest optical ≈ type×0.47. |
| **Do not** | Fake size only with empty min-width/min-height and 28px type.                                                                                                                                                                  |

### 3. Host translate = host-box ratios (not stage left-share solver)

|            |                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Paths**  | `apps/web/src/lib/motion/timelines/hero-sticky-scale.ts`                                                                                               |
| **Do**     | End translate from **offset** box: x ≈ `0.279 × offsetWidth` (258/924), y ≈ `−0.636 × offsetHeight` (−252/396), ease `power2.out`, origin bottom-left. |
| **Do not** | Prefer `hostEndTranslateForStage` absolute left-share if it tears text out of the rail at rest. Stage solver was a patch for the wrong host model.     |

### 4. Family B2 — title exit translateY

|                    |                                                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Paths**          | `hero-sticky-scale.ts` + title wrapper ref in `hero-section.tsx` / `hero-display-title`                                                                                                                                                             |
| **Do**             | Same pin ScrollTrigger as host: title (or L1 column) `y: 0 → −0.5 × stickyHeight` (probe −450 on 900). Ease match host curve or linear scrub with same power2.out.                                                                                  |
| **Reduced motion** | Final off-stage or final rested product choice — prefer **final mission-forward** (title at end y) only if product wants end frame without title; else keep title visible when reduced. Recommend: reduced → no scrub, title visible, host scale 1. |

### 5. Cover / z-index

|              |                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------ |
| **Do**       | Host `z-10+`; R1 / sticky allow overflow visible so scaled host can paint over R2 install. |
| **Optional** | Soft opacity on install card late in pin (not required for Mistral parity).                |

### 6. Verification (visual + numeric)

| Checkpoint     | Pass                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| Rest           | Mission sits **inside** right-top card; optical type ~24–28px; not over install |
| Mid pin (~450) | Title largely off-top; mission large mid-stage; icons risen                     |
| End pin (~900) | Mission dominates center; install not the focus (covered or secondary)          |
| Scale          | 0.47 → 1                                                                        |
| Title wrap ty  | 0 → ~−50% sticky H                                                              |
| Brand          | no Mistral assets                                                               |
| Reduced motion | no scrub; readable finals                                                       |

---

## Relationship to occupancy gap-spec

| Doc                                          | Role after remap                                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `spec-hero-sticky-scale-screen-occupancy.md` | Explains **why** small shrink-wrap failed; targets (≥0.55 width share) remain **downstream checks** once type+pad host is correct |
| **This doc**                                 | Correct **structural** model + B2 title exit; supersedes strategy B absolute host                                                 |
| Skill                                        | Canonical mechanics                                                                                                               |

---

## Implementation order

1. Revert absolute host → in-flow R1.
2. Bump mission type + padding; measure offset W×H.
3. Host scale+translate via offset ratios; z-index cover.
4. Title exit translateY on same pin.
5. Re-probe; update fixture `familyB2_titleExit` + screenshots.
6. Contract tests for B2 + “mission inside card at rest”.

---

## Anti-patterns (this incident)

- Absolute empty host sized as % of sticky to pass area share.
- Treating occupancy of a transparent box as product success.
- Assuming cards parent into the scale target.
- Scale without **title exit** when matching Mistral end frame.
- 28px mission type under 0.47 scale (unreadable rest chip).
