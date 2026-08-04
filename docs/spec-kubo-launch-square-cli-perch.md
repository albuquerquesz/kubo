# Spec: Kubo launch video vs square CLI-perch grammar

## Status

**Documented from implementation + still probes — 2026-08-04.**  
Not a redesign ticket: this spec freezes **what ships today** in `kubo-launch`, maps it to the researched square promo grammar, and lists an explicit **delta / target contract** for a future 1:1 cut.

## Date

August 4, 2026

## Goal

1. Describe the **current** Remotion composition `kubo-launch` (canvas, layout, motion, CLI phases, mark) from source of truth + measured stills.
2. Compare it to the portable **square CLI-perch** grammar (skill, not Claude brand).
3. Leave a checkable contract for agents when adapting to **1080×1080 @ ~6s** without re-litigating measurements.

**Skill (reference grammar):** [`.agents/skills/kubo-square-cli-perch/SKILL.md`](../.agents/skills/kubo-square-cli-perch/SKILL.md)

**App ops:** [`apps/video/LAUNCH.md`](../apps/video/LAUNCH.md)

**Identical ≠ brand clone.** Forbidden in any adaptation: Claude/Anthropic mascot, coral palette, lavender beta pill, purple shield prop, security scan copy, or Anthropic product chrome.

---

## Method

| Step         | What                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Codebase     | `apps/video/src/compositions/kubo-launch/**`, `root.tsx`, `test/square-cli-perch-delta.test.ts`                              |
| Still export | `bunx remotion still kubo-launch … --frame=N` → 1920×1080 PNG                                                                |
| Pixel bbox   | ImageMagick raw RGB dump + row/column dark-band / gold-fill scan                                                             |
| Playwright   | Chromium + local static PNG server + `canvas.getImageData` (confirms panel top, gold fill `#fbc80d`, eye black pixel counts) |
| Artifacts    | [`docs/captures/kubo-launch-spec/`](./captures/kubo-launch-spec/)                                                            |

### Captures

| File                                                                               | Role                                       |
| ---------------------------------------------------------------------------------- | ------------------------------------------ |
| [`frame-0.png`](./captures/kubo-launch-spec/frame-0.png)                           | t=0 — spring enter mostly transparent      |
| [`frame-30.png`](./captures/kubo-launch-spec/frame-30.png)                         | t=1s — held layout + walk                  |
| [`frame-90.png`](./captures/kubo-launch-spec/frame-90.png)                         | t=3s — CLI mid-session                     |
| [`frame-180.png`](./captures/kubo-launch-spec/frame-180.png)                       | t=6s — project-type select phase           |
| [`frame-239.png`](./captures/kubo-launch-spec/frame-239.png)                       | t≈8s — last frame, web options             |
| [`playwright-analysis.json`](./captures/kubo-launch-spec/playwright-analysis.json) | Full frame series bbox + code expectations |
| [`playwright-verify.json`](./captures/kubo-launch-spec/playwright-verify.json)     | Playwright canvas verify subset            |

---

## Source map (current implementation)

| Concern                   | Path                                                           |
| ------------------------- | -------------------------------------------------------------- |
| Composition shell         | `apps/video/src/compositions/kubo-launch/kubo-launch.tsx`      |
| Timing / canvas constants | `…/lib/timing.ts`                                              |
| Props schema              | `…/lib/schema.ts`                                              |
| Solution layout           | `…/scenes/solution-scene.tsx`                                  |
| Plate / safe margins      | `…/components/scene-shell.tsx`                                 |
| CLI product shot          | `…/components/cli-select-panel.tsx`                            |
| Mark walk / eyes          | `…/components/kubo-mark-character.tsx` + `…/lib/mark-paths.ts` |
| Remotion registration     | `apps/video/src/root.tsx` (`id="kubo-launch"`)                 |
| Delta unit test           | `apps/video/test/square-cli-perch-delta.test.ts`               |

---

## Current canvas (authoritative — code)

From `lib/timing.ts` + `root.tsx`:

| Property           | Value                                             |
| ------------------ | ------------------------------------------------- |
| **Width × height** | **1920 × 1080**                                   |
| **Aspect**         | **16:9**                                          |
| **Duration**       | **8.000 s** (`LAUNCH_DURATION_FRAMES = 240`)      |
| **Frame rate**     | **30 fps**                                        |
| **Scenes**         | Single `solution` sequence, frames `0–239`        |
| **Audio**          | Optional bed (`musicFile`, default `null`); no VO |

Default props (`lib/schema.ts`): `command = "bun create kubojs"`, `musicVolume = 0.45`.

---

## Current layout (code + measured)

### Hierarchy (landscape row)

```text
┌──────────────────── white plate 1920×1080 ────────────────────┐
│  TITLE (absolute left)          ┌── dark CLI panel (right) ──┐ │
│  “Um comando. Stack pronta.”    │  @clack session playback   │ │
│  top≈92  left≈120  w≈560        │  mark perched top-right    │ │
│  font 84 / weight 700           │  feet on panel top edge    │ │
│                                 └────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

This is a **side-by-side** grammar (title left · panel right), not the skill’s **stacked** square grammar (title above · panel below).

### Code constants (`solution-scene.tsx` + `scene-shell.tsx` + panel)

| Token                     | Code value                                                                       |
| ------------------------- | -------------------------------------------------------------------------------- |
| Plate background          | `#ffffff` (`showGoldGlow={false}`)                                               |
| Title color               | `#0a0a0a`                                                                        |
| Title position            | `top: 92`, `left: 120`, `width: 560`                                             |
| Title type                | `fontSize: 84`, `fontWeight: 700`, `letterSpacing: -0.035em`, `lineHeight: 1.05` |
| Title copy                | `Um comando. Stack pronta.`                                                      |
| Panel container           | `left: 608`, `right: 0`, `bottom: 8`                                             |
| Panel chrome              | `background: #0d0d0d`, `borderRadius: 28`, `minHeight: 680`, padding `44/48/40`  |
| Mark                      | `width: 112`, `mode: "walk"`, `top: -102` (relative to panel top), `right: 36`   |
| Mark fill / eyes          | gold `#FBC80D` / solid rects `#0a0a0a` (evenodd cutouts filled)                  |
| Enter                     | spring (`damping: 18`, `stiffness: 110`) → opacity 0→1, Y 30→0                   |
| SceneShell padding tokens | `SAFE_X=120`, `SAFE_Y=80` (absolute children ignore padding for inset math)      |

### Measured stills (settled frames ≥30)

Probe: Remotion still → RGB scan + Playwright canvas. Representative **frame 180** (and consistent across 30/90/239):

| Element                       | Measured                                            | Notes                                                |
| ----------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| Canvas                        | 1920 × 1080                                         | matches code                                         |
| Plate sample (200,100)        | `#ffffff`                                           | whiteRatio top-left ≈ 0.91 after enter               |
| **Panel top**                 | **y = 392** (**36.3%**)                             | `1080 − 8 − 680`                                     |
| **Panel box**                 | left **608**, right **1919**, h **680**, w **1312** | width **68.33%** of full canvas                      |
| Panel fill sample             | `#0d0d0d`                                           | matches CSS                                          |
| **Title ink bbox**            | ≈ (124,108)–(644,393)                               | multi-line paint; top near code `92`                 |
| **Mascot gold bbox**          | ≈ (1772–1773, 288–290) → (1882–1884, 388)           | **w ≈ 112**, **h ≈ 100**                             |
| Mascot **width %**            | **≈ 5.8%** of 1920                                  | skill target on 1:1 is **10–13%**                    |
| Mascot **right inset**        | **≈ 35–37 px**                                      | code `right: 36`                                     |
| Feet vs panel                 | `overlapIntoPanel ≈ −4`                             | feet **slightly above** panel top (small gap)        |
| Eye black pixels in mark bbox | **≈ 267–275**                                       | solid black eyes present (not plate-through cutouts) |
| Mark body sample              | `#fbc80d`                                           | Playwright fill sample                               |

**Frame 0:** spring opacity near 0 → panel/mascot/title not detectable as solid paint (white plate only). Treat enter as **&lt;1s** settle; layout contract applies from **t ≈ 1s** onward.

---

## Current motion / CLI timeline

### Global layers

| Layer                         | Behavior over 8s                                                     |
| ----------------------------- | -------------------------------------------------------------------- |
| White plate                   | Held after enter                                                     |
| Title + panel chrome position | Held after enter (no layout pan)                                     |
| Mark                          | Continuous **walk** cycle for full composition                       |
| CLI interior                  | **Phased** `@clack`-style playback (not a single static option list) |

### Walk (`KuboMarkCharacter` + `WALK_CYCLE_FRAMES = 58`)

- Cycle length **58 frames ≈ 1.93 s** at 30fps.
- Piecewise step / pass / rest (leg rotate + body bob); deterministic from `localFrame`.
- Modes available: `idle` \| `walk` \| `celebrate` \| `static` — solution uses **`walk`**.

### CLI phases (`cli-select-panel.tsx`, frame-local)

| Frames  | t (s) ≈ | Content                                               |
| ------- | ------- | ----------------------------------------------------- |
| 0–54    | 0–1.8   | `$ bun create kubojs` type-on + blink cursor          |
| 55–93   | 1.8–3.1 | ASCII `KUBO` gradient title                           |
| 94–117  | 3.1–3.9 | Intro line (“Creating a new…”)                        |
| 118–156 | 3.9–5.2 | Project name prompt + type-on `my-kubo-app`           |
| 157–207 | 5.2–6.9 | **Select project type** (Web selected)                |
| 208–239 | 6.9–8.0 | **Choose web** (TanStack Router selected + full list) |

Tokens: cyan `#89DCEB`, green selected `#A6E3A1`, dim `#686868`, magenta intro `#F5C2E7`, mono stack.

### Enter polish

Not required by the square reference (held from t=0), but **present** in Kubo as a short spring. After ~1s the layout matches the held product shot.

---

## Reference grammar (skill summary)

Authoritative numbers live in the skill; short copy for this spec:

| Property    | Square reference                                           |
| ----------- | ---------------------------------------------------------- |
| Canvas      | **1080 × 1080**, **1:1**, **6 s**, **30 fps** (180 frames) |
| Plate       | Cream / near-white full-bleed                              |
| Layout      | **Stacked**: title upper ~⅓ · dark CLI lower ~⅔            |
| Panel top   | **~31.5%** (y≈340 / 1080)                                  |
| Panel width | **~94%** with ~6% left inset                               |
| Mascot      | Top-**right** perch, feet flush on edge, **~10–13%** width |
| Motion      | Layout static; mascot walk; **no** required prop           |
| Brand fence | Mechanics only — no Claude assets                          |

---

## Delta matrix (current vs square target)

| Dimension               | **Current `kubo-launch`**         | **Square CLI-perch target**             | Status                                            |
| ----------------------- | --------------------------------- | --------------------------------------- | ------------------------------------------------- |
| Width × height          | 1920 × 1080                       | 1080 × 1080                             | **Mismatch**                                      |
| Aspect                  | 16:9                              | 1:1                                     | **Mismatch**                                      |
| Duration                | 8 s                               | ~6 s                                    | **Mismatch** (intentional longer CLI story today) |
| FPS                     | 30                                | 30                                      | Match                                             |
| Layout grammar          | Title **left** + panel **right**  | Title **above** + panel **below**       | **Mismatch**                                      |
| Plate                   | `#ffffff`                         | Cream/white OK                          | Match (Kubo white is fine)                        |
| Gold glow               | Off                               | Off / none                              | Match                                             |
| Panel role              | Product shot (dark card)          | Product shot                            | Match                                             |
| Panel width % of canvas | ~68% (right column)               | ~94% full width                         | **Mismatch** (aspect-driven)                      |
| Panel top %             | ~36%                              | ~31.5%                                  | Close on Y; different composition                 |
| Mascot perch            | Top-right of panel, walk          | Top-right of panel, walk                | **Match mechanics**                               |
| Mascot width %          | ~5.8% of 1920                     | ~10–13% of 1080                         | **Smaller** on landscape                          |
| Feet gap                | ~4 px above rim                   | Flush (~0)                              | Slightly lofted — optional tighten                |
| Eyes                    | Solid `#0a0a0a`                   | N/A (Kubo rule: black on light plate)   | **Match Kubo rule**                               |
| CLI content             | Animated multi-step create-kubojs | Static selected list in reference       | **Kubo richer** (keep)                            |
| Prop / beta chrome      | None                              | Reference-only shield — **do not copy** | Match fence                                       |
| Brand                   | Gold mark + PT title + Kubo CLI   | Kubo only                               | Match                                             |

**Why landscape feels “too wide” for X square posts:** shipping 1920×1080 forces side-by-side hierarchy; X square crop discards sides or letterboxes and loses the reference “title over CLI” read.

---

## Target contract (future square cut — not implemented)

When product prioritizes X/LinkedIn **1:1**, implement against this contract (mechanics from skill + Kubo brand):

### Canvas

```ts
// intended future timing.ts shape
LAUNCH_FPS = 30;
LAUNCH_WIDTH = 1080;
LAUNCH_HEIGHT = 1080;
LAUNCH_DURATION_FRAMES = 180; // 6s — or keep 8s explicitly if CLI story needs it
```

### Layout (stack)

| Token        | Target                                                           |
| ------------ | ---------------------------------------------------------------- |
| Plate        | `#ffffff` or soft cream; no gold radial                          |
| Title band   | Upper plate only; multi-line display; side inset ~5–8%           |
| Panel top    | **≈ 31–36%** of height                                           |
| Panel width  | **≈ 90–94%** of width                                            |
| Panel radius | ~24–32 visual (current 28 is fine)                               |
| Mark width   | **≈ 10–13%** of canvas width (~110–140 on 1080)                  |
| Mark seat    | `top: -(markH − few px)`, `right: ~6–10%`; feet on edge          |
| Eyes         | Keep solid `#0a0a0a` on light plate                              |
| CLI          | Keep Kubo `@clack` phases (may compress timing if duration → 6s) |
| Prop         | **Omit**                                                         |

### Motion

| Beat   | Contract                                                                  |
| ------ | ------------------------------------------------------------------------- |
| Layout | Held for most of the cut                                                  |
| Enter  | Optional spring **&lt;0.5–1s**                                            |
| Mark   | Walk for full duration                                                    |
| CLI    | Phase table may scale with duration; selection state readable by mid-clip |

### Non-goals

- Do not reintroduce dark gold-glow plate for this promo class unless product asks.
- Do not import Claude copy, mascot, shield, or beta chip.
- Do not treat 16:9 YouTube long-form as this grammar (`kubo-motion-grammar` is web scroll, not this cut).

---

## QA checklist

### Current ship (`1920×1080` / 8s)

- [x] Composition id `kubo-launch` at 1920×1080 @ 30fps / 240 frames
- [x] White plate, no gold glow
- [x] Title left + dark CLI panel right
- [x] Mark gold `#FBC80D`, walk cycle, perch top-right
- [x] Solid black eyes measurable in stills (~270 black pixels in mark bbox)
- [x] CLI phases type-on → banner → name → project type → web framework
- [x] Unit test documents delta vs square skill (`square-cli-perch-delta.test.ts`)

### Square adaptation (when built)

- [ ] Canvas **1:1** 1080×1080 (or documented intentional size)
- [ ] Duration **~6s** or explicit longer rationale
- [ ] Stacked title **above** panel
- [ ] Panel ~90%+ width; mark ~10–13% width; feet flush
- [ ] Still probes re-run into `docs/captures/kubo-launch-spec/` (or successor folder)
- [ ] Delta test updated so “current === square” only when constants change

---

## Verification commands

```bash
# unit delta vs skill fixture
cd apps/video && bun test test/square-cli-perch-delta.test.ts

# Studio
bun run dev:video

# still probes (example)
cd apps/video
bunx remotion still kubo-launch /tmp/kubo-f180.png --frame=180

# full render
cd apps/video && bun run render
```

Re-validate layout with Playwright: serve still PNGs over `http://127.0.0.1`, load into canvas, assert `panelTop`, gold fill `#fbc80d`, and `eyeBlackPixels > 0` on settled frames (see `docs/captures/kubo-launch-spec/playwright-verify.json`).

---

## Related

- Skill: [kubo-square-cli-perch](../.agents/skills/kubo-square-cli-perch/SKILL.md)
- Mark motion patterns: [svg-gsap-mascot](../.agents/skills/svg-gsap-mascot/SKILL.md) (web GSAP; Remotion uses frame-driven walk)
- Web marketing motion (not this video): [kubo-motion-grammar](../.agents/skills/kubo-motion-grammar/SKILL.md) · [spec-mistral-identical-home-motion.md](./spec-mistral-identical-home-motion.md)
