# Spec: Kubo launch video vs square CLI-perch grammar

## Status

**Square CLI-perch target implemented — 2026-08-04.**  
`kubo-launch` ships **1080×1080 @ 6s / 30fps** with stacked title-above-panel layout. Historical landscape measurements remain under [captures](./captures/kubo-launch-spec/) for comparison.

## Date

August 4, 2026

## Goal

1. Describe the **shipped** Remotion composition `kubo-launch` (canvas, layout, motion, CLI phases, mark).
2. Align it with the portable **square CLI-perch** grammar (skill, not Claude brand).
3. Keep a checkable contract + unit test so agents do not regress to 16:9 side-by-side.

**Skill (reference grammar):** [`.agents/skills/kubo-square-cli-perch/SKILL.md`](../.agents/skills/kubo-square-cli-perch/SKILL.md)

**App ops:** [`apps/video/LAUNCH.md`](../apps/video/LAUNCH.md)

**Identical ≠ brand clone.** Forbidden: Claude/Anthropic mascot, coral palette, lavender beta pill, purple shield prop, security scan copy, or Anthropic product chrome.

---

## Method

| Step         | What                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Codebase     | `apps/video/src/compositions/kubo-launch/**`, `root.tsx`, `test/square-cli-perch-delta.test.ts`      |
| Still export | `bunx remotion still kubo-launch … --frame=N` → 1080×1080 PNG                                        |
| Historical   | Pre-adaptation 1920×1080 stills in [`docs/captures/kubo-launch-spec/`](./captures/kubo-launch-spec/) |

---

## Source map

| Concern                  | Path                                                           |
| ------------------------ | -------------------------------------------------------------- |
| Composition shell        | `apps/video/src/compositions/kubo-launch/kubo-launch.tsx`      |
| Timing / canvas / layout | `…/lib/timing.ts` (`LAUNCH_*`, `SQUARE_LAYOUT`, `CLI_PHASES`)  |
| Props schema             | `…/lib/schema.ts`                                              |
| Solution layout (stack)  | `…/scenes/solution-scene.tsx`                                  |
| Plate / safe margins     | `…/components/scene-shell.tsx`                                 |
| CLI product shot         | `…/components/cli-select-panel.tsx`                            |
| Mark walk / eyes         | `…/components/kubo-mark-character.tsx` + `…/lib/mark-paths.ts` |
| Remotion registration    | `apps/video/src/root.tsx` (`id="kubo-launch"`)                 |
| Contract unit test       | `apps/video/test/square-cli-perch-delta.test.ts`               |

---

## Current canvas (authoritative — code)

From `lib/timing.ts` + `root.tsx`:

| Property           | Value                                             |
| ------------------ | ------------------------------------------------- |
| **Width × height** | **1080 × 1080**                                   |
| **Aspect**         | **1:1**                                           |
| **Duration**       | **6.000 s** (`LAUNCH_DURATION_FRAMES = 180`)      |
| **Frame rate**     | **30 fps**                                        |
| **Scenes**         | Single `solution` sequence, frames `0–179`        |
| **Audio**          | Optional bed (`musicFile`, default `null`); no VO |

Default props (`lib/schema.ts`): `command = "bun create kubojs"`, `musicVolume = 0.45`.

---

## Current layout (stacked square)

```text
┌──────────── white plate 1080×1080 ────────────────────────────┐
│  TITLE (upper band, left)                                      │
│  “Um comando. / Stack pronta.”  top≈56  left≈64  font 58       │
│                                                                │
│  ┌── dark CLI card  top≈340 (~31.5%)  left≈64  right 0 ─────┐ │
│  │  @clack session playback                                   │ │
│  │  mark perched top-right (~12% W, feet on rim)              │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Code constants (`SQUARE_LAYOUT` + panel)

| Token            | Code value                                                          |
| ---------------- | ------------------------------------------------------------------- |
| Plate background | `#ffffff` (`showGoldGlow={false}`)                                  |
| Title color      | `#0a0a0a`                                                           |
| Title position   | `top: 56`, `left: 64`, `width: 920`                                 |
| Title type       | `fontSize: 58`, `fontWeight: 700`, multi-line                       |
| Panel top        | `340` (**31.5%**)                                                   |
| Panel horizontal | `left: 64` (~6%), `right: 0` → width **~94%**                       |
| Panel chrome     | `background: #0d0d0d`, radius 28 (top-left; right edge flush)       |
| Mark             | `width: 130` (~12%), `mode: "walk"`, `right: 92`, feet flush on rim |
| Mark fill / eyes | gold `#FBC80D` / solid rects `#0a0a0a`                              |
| Enter            | spring (`damping: 18`, `stiffness: 110`) → opacity 0→1, Y 30→0      |

---

## Current motion / CLI timeline

### Global layers

| Layer                         | Behavior over 6s                                       |
| ----------------------------- | ------------------------------------------------------ |
| White plate                   | Held after enter                                       |
| Title + panel chrome position | Held after enter (no layout pan)                       |
| Mark                          | Continuous **walk** cycle for full composition         |
| CLI interior                  | **Phased** `@clack`-style playback (compressed for 6s) |

### Walk (`KuboMarkCharacter` + `WALK_CYCLE_FRAMES = 58`)

- Cycle length **58 frames ≈ 1.93 s** at 30fps.
- Modes: `idle` \| `walk` \| `celebrate` \| `static` — solution uses **`walk`**.

### CLI phases (`CLI_PHASES` in `timing.ts`)

| Frames  | t (s) ≈ | Content                                               |
| ------- | ------- | ----------------------------------------------------- |
| 0–28    | 0–0.9   | `$ bun create kubojs` type-on + blink cursor          |
| 29–45   | 1.0–1.5 | ASCII `KUBO` gradient title                           |
| 46–58   | 1.5–1.9 | Intro line                                            |
| 59–89   | 2.0–3.0 | Project name prompt + type-on `my-kubo-app`           |
| 90–134  | 3.0–4.5 | **Select project type** (Web selected) — mid-clip     |
| 135–179 | 4.5–6.0 | **Choose web** (TanStack Router selected + full list) |

Banner + intro collapse when web options show so the select list stays readable.

### Enter polish

Optional spring (&lt;1s settle). Reference held from t=0; Kubo keeps short enter.

---

## Reference grammar (skill summary)

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

## Contract matrix (shipped vs square target)

| Dimension               | **Shipped `kubo-launch`**         | **Square CLI-perch target**       | Status                 |
| ----------------------- | --------------------------------- | --------------------------------- | ---------------------- |
| Width × height          | 1080 × 1080                       | 1080 × 1080                       | **Match**              |
| Aspect                  | 1:1                               | 1:1                               | **Match**              |
| Duration                | 6 s                               | ~6 s                              | **Match**              |
| FPS                     | 30                                | 30                                | **Match**              |
| Layout grammar          | Title **above** + panel **below** | Title **above** + panel **below** | **Match**              |
| Plate                   | `#ffffff`                         | Cream/white OK                    | **Match**              |
| Gold glow               | Off                               | Off / none                        | **Match**              |
| Panel width % of canvas | ~94%                              | ~90–94%                           | **Match**              |
| Panel top %             | 31.5%                             | ~31.5%                            | **Match**              |
| Mascot perch            | Top-right of panel, walk          | Top-right of panel, walk          | **Match**              |
| Mascot width %          | ~12% of 1080                      | ~10–13% of 1080                   | **Match**              |
| Feet                    | Flush (~2px seat into rim)        | Flush (~0)                        | **Match**              |
| Eyes                    | Solid `#0a0a0a`                   | Kubo rule: black on light plate   | **Match**              |
| CLI content             | Animated multi-step create-kubojs | Static selected list in reference | **Kubo richer** (keep) |
| Prop / beta chrome      | None                              | Reference-only — **do not copy**  | **Match fence**        |
| Brand                   | Gold mark + PT title + Kubo CLI   | Kubo only                         | **Match**              |

---

## Non-goals

- Do not reintroduce dark gold-glow plate for this promo class unless product asks.
- Do not import Claude copy, mascot, shield, or beta chip.
- Do not treat 16:9 YouTube long-form as this grammar (`kubo-motion-grammar` is web scroll, not this cut).

---

## QA checklist

### Shipped square (`1080×1080` / 6s)

- [x] Composition id `kubo-launch` at 1080×1080 @ 30fps / 180 frames
- [x] White plate, no gold glow
- [x] Stacked title above dark CLI panel
- [x] Panel ~90%+ width; mark ~10–13% width; feet flush
- [x] Mark gold `#FBC80D`, walk cycle, perch top-right
- [x] Solid black eyes on light plate
- [x] CLI phases type-on → banner → name → project type → web framework (compressed)
- [x] Unit test asserts match vs square skill (`square-cli-perch-delta.test.ts`)

### Optional follow-up

- [ ] Re-run still probes into `docs/captures/kubo-launch-spec/` at 1080²
- [ ] Playwright canvas verify on new stills

---

## Verification commands

```bash
# unit contract vs skill fixture
cd apps/video && bun test test/square-cli-perch-delta.test.ts

# Studio
bun run dev:video

# still probes (example)
cd apps/video
bunx remotion still kubo-launch /tmp/kubo-f90.png --frame=90

# full render
cd apps/video && bun run render
```

---

## Related

- Skill: [kubo-square-cli-perch](../.agents/skills/kubo-square-cli-perch/SKILL.md)
- Mark motion patterns: [svg-gsap-mascot](../.agents/skills/svg-gsap-mascot/SKILL.md) (web GSAP; Remotion uses frame-driven walk)
- Web marketing motion (not this video): [kubo-motion-grammar](../.agents/skills/kubo-motion-grammar/SKILL.md) · [spec-mistral-identical-home-motion.md](./spec-mistral-identical-home-motion.md)
