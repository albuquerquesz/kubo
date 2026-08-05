---
name: svg-gsap-mascot
description: >
  Animate character/mascot SVGs with GSAP (tween, frame sprite, hybrid).
  Use when building mascot loops, pixel-character motion, SVG part pivots,
  flag/wave props, confetti sync, gym/walk cycles, or reverse-engineering
  short social clips into SVG+GSAP. Stack: apps/web lib/motion + React refs.
  Never ship Claude/Anthropic mascot assets or brand.
---

# SVG + GSAP mascot animation (Kubo)

**Scope:** character / logo / prop motion built from **SVG + GSAP timelines**
(tweened parts, discrete frames, or hybrid).  
**Not in scope:** page scroll grammar (sticky scale, dual-title) — use
`kubo-motion-grammar` / `scroll-reveal-icons`. Mosaic hero tiles —
`kubo-mosaic-hero-background`.

**Primary research:** Codrops / Ayotomiwa — _Reverse-Engineering Claude AI’s
Mascot Animations with SVG and GSAP_ (2026-05-05)
https://tympanus.net/codrops/2026/05/05/reverse-engineering-claude-ais-mascot-animations-with-svg-and-gsap/  
**Demo (technique only):** https://ayotomcs.me/claude-mascot

**Legal / brand:** techniques and GSAP patterns only. **Never** copy Claude
sprites, palette (`#DD775B` character orange), or Anthropic assets. Use Kubo
mark gold `#FBC80D`, cream/dark tokens, and first-party art under
`apps/web/public/assets` / `components/brand`.

---

## When to load

- Hero / header mascot idle loops, celebrate, walk, wave, confetti
- User asks for “SVG mascot animation”, “pixel character GSAP”, “frame
  sequence SVG”, “animate Kubo mark with personality”
- Reverse-engineering a short video/GIF into code (no video runtime)
- Choosing tween vs sprite-frame vs hybrid for an SVG character

## When not to load

- Scroll-scrubbed icons / mission column → `scroll-reveal-icons`
- Full home sticky stage → `kubo-motion-grammar`
- CSS-only micro-hovers with no character anatomy

---

## Decision: three animation modes

Pick **one primary mode** per shot. Mixing is allowed only as **hybrid**
(Mode C).

| Mode                     | Use when                                                                                | GSAP tools                                     | Draw cost         |
| ------------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------- |
| **A — Continuous tween** | Parts keep topology (body, eyes, legs, hands); lean, walk, jump arcs                    | `to` / `timeline`, `svgOrigin`, `"<"` sync     | Low (one rig)     |
| **B — Frame sprite**     | Shape changes every beat (silhouette, lift, stomp pose); cannot interpolate rects/paths | `set` + `display` / visibility, variable holds | High (N drawings) |
| **C — Hybrid**           | Prop is un-tweenable (flag pixels) but body sways are continuous                        | Frame array on prop + `set`/`to` on body/hand  | Medium            |

**Rule of thumb:** if you cannot draw a continuous intermediate with
`x`/`y`/`rotation`/`scale` alone, stop tweening that part — **draw frames**.

### Mode A — Continuous tween (walk / jump / lean)

1. **Rig** the SVG into named groups: `root`, `body`, `eyes`, `hands`, `legs[]`.
2. **Ground clip** legs when lean uses `scaleY` so limbs do not punch through
   the floor (`clipPath` on the legs group).
3. **One beat, many parts:** fire body + eyes + legs with position `"<"` and
   the **same** ease so it reads as one action.
4. **Per-part functional values** for weight (outer legs lean more than inner).
5. **Pivot switches:** walk needs hip `svgOrigin`; idle lean may need feet.
   Use timeline `.call()` to swap origin before/after the walk segment.
6. **Jump grammar:** short crouch → launch → parabolic Y + separate X →
   landing overshoot on hands/body.

```ts
// Lean: simultaneous body / eyes / legs
tl.to(eyes, { x: -3, duration: 0.4, ease: "power2.out" })
  .to(
    body,
    { rotation: -3, x: -3, y: -5, svgOrigin: "53 65", duration: 0.4, ease: "power2.out" },
    "<",
  )
  .to(
    legs,
    {
      rotation: (i) => [-7, -8, -8, -9][i],
      scaleY: (i) => [1.35, 1.3, 1.2, 1.15][i],
      duration: 0.4,
      ease: "power2.out",
    },
    "<",
  );

// Jump: crouch snap → labeled multi-axis arc
tl.to(body, { y: 8, duration: 0.1, ease: "power3.in" })
  .to(hands, { y: 10, duration: 0.1, ease: "power3.in" }, "<")
  .to(root, { x: `+=${jumpDist}`, duration: 0.85, ease: "power1.inOut" }, "jump")
  .to(root, { y: -90, duration: 0.42, ease: "sine.out" }, "jump")
  .to(root, { y: 0, duration: 0.2, ease: "power3.in" }, "jump+=0.6");
// Then micro-bounce hands y overshoot ~0.05s and settle
```

**Gravity feel:** rise = soft (`sine.out`); fall = hard (`power3.in`);
horizontal = separate ease. Never one shared ease for both axes of a jump.

### Mode B — Frame sprite (gym / stomp / full redraw poses)

1. Illustrate **every** pose as its own `<g>` (or path set). No morph shortcut.
2. Stack frames in the SVG; only one visible at a time (`display: none|inline`
   or `visibility` / `opacity` with exclusive visibility).
3. Build a **sequence array** that may **replay a range** (e.g. second rep =
   frames 13–24 twice → more beats than drawings).
4. **Variable holds** — flat 1/12s feels like a slideshow. Hold effort peaks
   and end poses longer.

```ts
function getDelay(seqIdx: number, frame: number, seqLen: number): number {
  if (seqIdx === seqLen - 1) return 1.5; // rest before loop
  if (frame === 6 || frame === 7) return 0.27; // top of lift
  if (frame === 15 || frame === 21) return 0.4; // between reps
  return 0.085; // default step
}

const tl = gsap.timeline({ repeat: -1 });
let time = 0;
for (let i = 0; i < frameSequence.length; i++) {
  const frame = frameSequence[i];
  frames.forEach((el, j) => {
    if (el) tl.set(el, { display: j === frame ? "inline" : "none" }, time);
  });
  time += getDelay(i, frame, frameSequence.length);
}
```

**First-play vs loop (optional):** intro frames (flag rising) run once; loop
restarts mid-sheet so the prop does not re-rise every cycle.

### Mode C — Hybrid (flag wave + body)

1. Draw **N** discrete prop frames (e.g. 12 flag poses as 5×5 rect grids).
2. Parent **prop frames + hand** under one `<g>` so hand transforms carry the
   prop.
3. Map each frame index → compensatory hand offset so the prop stays “stuck”
   to the wrist as the wave geometry changes.
4. Map each frame → body sway / free hand Y (often **opposite** the prop swing).
5. Drive visibility + `set({ x })` on the shared hand group on the same time
   grid as frame changes; tween only what stays topologically stable.

```ts
const handExtraX = [0, -6, -12, -14, -8, -2, 0, 0, -4, -10, -16, -18];
const swayX = [0, 0, -5, -5, 0, 4, 4, 4, 0, 0, -5, -5];
// For each frame at time t: show frame i, set hand x, set body x, left hand y
```

### Blink — short pixel-stepped eye cycle

A blink is a small Mode B sprite sequence, even when the rest of the mascot is
continuous. Keep the eye boxes centered and change only their height so the
character does not shift or resize:

```ts
type EyeState = "open" | "closing" | "closed" | "opening";

// State labels mark the beat; the rendered geometry still snaps.
const eyeHeight = state === "open" || state === "opening" ? 86 : 8;
const eyeY = 292 + (86 - eyeHeight) / 2;
```

Use a 4–5 frame beat at the project FPS: snap closed, hold the closed bar, then
snap open. Do not render a transitional 42px eyelid when the reference is
pixelated. Place one or two blinks at meaningful idle moments rather than
looping continuously. In Remotion, derive the state from `useCurrentFrame()`;
this keeps renders deterministic and avoids layout-shift from CSS or wall-clock
animation. A centered height change works for Kubo's rectangular eye cutouts; a
different SVG anatomy should use dedicated eyelid groups or drawn frames
instead.

### Static pixel idle

When a mascot should remain planted, keep the entire SVG pose fixed. For Kubo,
do not apply transforms to the root, body, eyes, legs, wrapper, or SVG
dimensions. Personality effects such as blinking may still be driven by the
render frame, but the feet must remain in their authored position so the mascot
cannot enter the terminal or cause visual drift.

- Render one stable leg pose with no frame lookup or idle transform.
- Keep blink geometry centered and pixel-snapped independently from the body.
- Validate that the root and both leg groups have no transform and that the
  mascot bounding box remains unchanged across the loop.

### Multi-timeline sync (confetti + stomp)

Independent timelines with **delays aligned to the character cycle** beat
better than one mega-timeline when systems differ in length:

- Character loop: period `N * FRAME_DURATION`
- Burst A: `delay: FRAME_DURATION` (fires when hand peaks on first stomp)
- Burst B: `delay: 6 * FRAME_DURATION` (opposite stomp)
- Mirror second burst with `scaleX: -1` (or SVG `scale(-1, 1)`) instead of
  redrawing

Particle burst frames can also carry a Y table (rise then fall) via
`set({ y })` per frame index.

---

## Reverse-engineering workflow

Use this when the user supplies a clip or wants “exact feel”:

1. Slow source to **~0.3×**; capture **every** distinct pose.
2. Classify each beat: tweenable vs redraw.
3. Write a **timing table** (frame index → hold ms, simultaneous parts).
4. Build SVG rig **or** frame sheet first; motion second.
5. Match eases by feel: crouch snaps (`power3.in`, ~0.1s); lean
   (`power2.out`, ~0.4s); jump up `sine.out` / down `power3.in`.
6. Loop polish: rest hold on last frame; first-play-only intro frames if needed.
7. Ship with **reduced-motion** → static readable pose, no infinite loops.

Do **not** embed video/GIF at runtime for production mascot — goal is pure SVG

- GSAP.

---

## SVG authoring rules

| Rule                                                            | Why                                                                                      |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Prefer **groups with stable IDs/refs** for Mode A               | GSAP targets parts, not whole bitmap                                                     |
| **`clipPath` ground** when legs `scaleY` / rotate into floor    | Weight without clipping through ground                                                   |
| **`svgOrigin`** (not CSS transform-origin alone) for SVG pivots | Hip vs foot changes motion completely                                                    |
| One parent `<g>` for hand + prop frames                         | Prop follows wrist                                                                       |
| Pixel/rect mascots: all `<rect>` OK                             | Claude tutorial style; Kubo may stay path-based                                          |
| Kubo mark today is **one evenodd path** (`KuboMark`)            | Simple bob/scale OK; full character acts need a **rigged** multi-part SVG or frame sheet |
| Escape / avoid conflicting IDs if multiple instances on page    | `clipPath` ids must be unique per instance                                               |

### Kubo mark options

| Intent                          | Approach                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------- |
| Subtle hero idle                | Mode A on whole mark: soft `y` + `rotation` micro loop                        |
| Celebrate CTA                   | Mode A root scale punch + optional confetti from `cta-confetti` patterns      |
| Walk / wave / stomp personality | New multi-part SVG or Mode B sheet — **do not** fake anatomy on a single path |
| Brand color                     | `#FBC80D` fill; respect dark/light plate behind                               |

Component home: `apps/web/src/components/brand/kubo-mark.tsx`  
Asset: `apps/web/public/assets/kubo-mark.svg`

---

## Kubo implementation stack

| Concern          | Use                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------- |
| Engine           | `gsap` 3.15 + `@gsap/react` (already in `apps/web`)                                 |
| Import           | `@/lib/motion/gsap-client` (`gsap`, `ScrollTrigger`, `SplitText`)                   |
| Cleanup          | `useGsapContext` from `@/lib/motion/use-gsap-context`                               |
| A11y motion      | `prefersReducedMotion()` from `@/lib/motion/reduced-motion`                         |
| New timelines    | Prefer `apps/web/src/lib/motion/timelines/*` pure functions + client component refs |
| Decorative loops | `aria-hidden` on decorative mascot; do not hide meaning-only content                |

### Client component sketch

```tsx
"use client";

import { useRef } from "react";
import { gsap } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

export function KuboMascotLoop() {
  const rootRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);

  useGsapContext(
    () => {
      if (prefersReducedMotion() || !rootRef.current || !bodyRef.current) return;

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.inOut" } });
      tl.to(bodyRef.current, { y: -4, duration: 0.55 }).to(bodyRef.current, {
        y: 0,
        duration: 0.55,
      });

      return () => {
        tl.kill();
      };
    },
    { dependencies: [] },
  );

  return (
    <svg viewBox="0 0 120 120" aria-hidden className="h-14 w-auto">
      <g ref={rootRef}>
        <g ref={bodyRef}>{/* rigged parts or mark path */}</g>
      </g>
    </svg>
  );
}
```

### Reduced motion contract

- Infinite loops **off**
- Show a single clear rest frame (not mid-jump / mid-stomp)
- Prefer `gsap.set` final pose; skip `repeat: -1`

---

## Timing personality cheat-sheet

| Beat                   | Duration ballpark | Ease                   |
| ---------------------- | ----------------- | ---------------------- |
| Crouch before jump     | ~0.1s             | `power3.in`            |
| Lean / look            | ~0.4s             | `power2.out`           |
| Jump rise              | ~0.4s             | `sine.out`             |
| Jump fall              | ~0.2s             | `power3.in`            |
| Jump travel X          | ~0.85s            | `power1.inOut`         |
| Landing hand bounce    | ~0.05s overshoot  | snappy out then settle |
| Sprite default step    | ~0.085s           | n/a (`set`)            |
| Effort hold (lift top) | ~0.27s            | n/a                    |
| Rest between reps      | ~0.4s             | n/a                    |
| Loop rest              | ~1.0–1.5s         | n/a                    |
| Stomp frame            | ~125ms            | n/a                    |

Tune to source footage; table is a starting grammar from the Codrops rebuild,
not a brand law.

---

## Anti-patterns

- Tweening pixel-art silhouettes that must change topology (use Mode B)
- Stretching legs with `scaleY` **without** floor `clipPath`
- One ease for jump X and Y (kills gravity)
- Flat frame rate for gym/stomp (slideshow feel)
- Missing landing overshoot (stiff impact)
- Blinking by moving the whole mascot or changing layout position
- Using a generic scale pulse when the intended character action is an idle step
- Moving the complete SVG when only a leg or appendage should change
- Using layout or wrapper scaling that changes the terminal composition bounds
- Prop not parented to hand group (flag drifts)
- Re-playing “rise” frames every loop when prop should stay up
- Copying Claude orange / official mascot drawings
- Animating layout CSS (`top`, `margin`) instead of SVG transforms
- Leaving loops on under `prefers-reduced-motion: reduce`
- Putting heavy infinite timelines on every route without cleanup

---

## QA checklist

- [ ] Mode chosen deliberately (A / B / C) and matches topology
- [ ] Ground clip if legs scale into floor
- [ ] Simultaneous multi-part beats use `"<"` + shared ease
- [ ] Jump: crouch → multi-ease arc → bounce
- [ ] Sprite holds vary at effort / rest
- [ ] Loop entry (first-play vs mid-loop) correct for props
- [ ] Multi-system delays locked to character period
- [ ] Reduced motion: static rest, no `repeat: -1`
- [ ] Unique clip/filter ids if multiple instances
- [ ] No Anthropic/Claude assets in repo
- [ ] Timeline killed / context reverted on unmount

---

## Related

- Deeper recipes: [`references/animation-modes.md`](./references/animation-modes.md)
- Page motion grammar: [`.agents/skills/kubo-motion-grammar/SKILL.md`](../kubo-motion-grammar/SKILL.md)
- GSAP client: `apps/web/src/lib/motion/gsap-client.ts`
- Brand mark: `apps/web/src/components/brand/kubo-mark.tsx`
- Codrops source (technique): article linked in frontmatter description era above
