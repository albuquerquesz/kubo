# Animation modes — expanded recipes

Companion to `../SKILL.md`. Patterns distilled from the Codrops Claude-mascot
rebuild (technique only). Re-express with Kubo art and tokens.

## Mode A — Walking / continuous character

### Rig sketch

```xml
<svg viewBox="0 0 120 120">
  <defs>
    <clipPath id="ground-clip-unique">
      <rect x="-20" y="-50" width="160" height="136" />
    </clipPath>
  </defs>
  <g id="root">
    <g id="body"><!-- torso / face paths --></g>
    <g id="eyes"><!-- pupils --></g>
    <g id="left-hand" /><g id="right-hand" />
    <g clip-path="url(#ground-clip-unique)">
      <rect id="leg1" />
      <rect id="leg2" />
      <rect id="leg3" />
      <rect id="leg4" />
    </g>
  </g>
</svg>
```

Use unique `clipPath` ids when mounting multiple instances (suffix with React
id or `useId()`).

### Pivot (`svgOrigin`)

| Action           | Typical origin          | Notes                                                           |
| ---------------- | ----------------------- | --------------------------------------------------------------- |
| Lean into ground | body center / mid-torso | Legs stretch against clip                                       |
| Walk step        | hip line                | Switch with `tl.call(() => gsap.set(legs, { svgOrigin: "…" }))` |
| After walk       | feet / previous         | Restore so idle lean does not pivot from hip                    |

### Jump segment recipe

```
crouch (0.1s, power3.in): body y↓, hands y↓
label "jump":
  root x += dist (0.85s, power1.inOut)
  root y → peak (0.42s, sine.out) at "jump"
  root y → 0 (0.2s, power3.in) at "jump+=0.6"  // peak→land window
landing: hands y overshoot ~+extra for 0.05s, then settle
```

Tune peak Y and `jump+=` offset to match reference screenshots.

### Simultaneous beat pattern

Always attach secondary parts with `"<"`:

```ts
tl.to(primary, { …, duration: d, ease })
  .to(secondaryA, { …, duration: d, ease }, "<")
  .to(secondaryB, { …, duration: d, ease }, "<");
```

Mismatch duration/ease across parts of one beat → “three animations, not one
character.”

---

## Mode B — Gym / full redraw sequence

### Data model

```ts
type SpriteSheet = {
  /** DOM nodes for each drawn frame, index = frame id */
  frames: (SVGGElement | null)[];
  /** Playback order; may repeat ranges for extra reps */
  sequence: number[];
  delay: (seqIdx: number, frameId: number) => number;
};
```

### Visibility exclusive set

Prefer `display: "inline" | "none"` for hard swaps (no ghost alpha). If
filters/stacking need layout size, keep groups in flow and use `visibility` or
`opacity` with exclusive visibility still enforced.

### Hold design

| Moment               | Hold relative to step |
| -------------------- | --------------------- |
| Neutral step         | 1×                    |
| Effort peak          | ~3×                   |
| Between reps         | ~4–5×                 |
| End rest before loop | ~12–18×               |

Author holds from slowed footage, not from equal division of clip length.

### Second rep without new drawings

```ts
// drawings 0..35 exist; sequence length 48 because 13..24 play twice
const frameSequence = [
  ...range(0, 24),
  ...range(13, 24), // second rep
  ...range(25, 35),
];
```

---

## Mode C — Flag / un-tweenable prop

### Structure

```xml
<g id="hand-group">
  <rect id="right-hand" />
  <g class="flag-frame" data-frame="0">…</g>
  <g class="flag-frame" data-frame="1">…</g>
  <!-- … N frames, only one visible -->
</g>
```

### Per-frame tables (example shape)

```ts
// Index aligned with flag frame
handExtraX: number[]; // opposite the flag swing so wrist sticks
swayX: number[];      // body counter-mass
leftHandY: number[];  // free hand drop on lean frames
```

Drive with `tl.set` at absolute times; optional first-play `time` only includes
frames 0–2 (rise), then `repeat` segment starts at frame 3+.

### Building absolute time grid

```ts
const FRAME_MS = 80; // or per-frame table
let t = 0;
for (let i = 0; i < frames.length; i++) {
  const show = i; // or sequence[i]
  frames.forEach((el, j) => {
    tl.set(el, { display: j === show ? "inline" : "none" }, t);
  });
  tl.set(handGroup, { x: handExtraX[show] }, t);
  tl.set(body, { x: swayX[show] }, t);
  t += FRAME_MS / 1000;
}
```

---

## Multi-timeline confetti / secondary FX

```ts
const FRAME = 0.125;
const stomp = gsap.timeline({ repeat: -1 });
// … 8 character frames at FRAME …

const burstR = gsap.timeline({ repeat: -1, delay: FRAME });
// … 8 particle frames + yOffsets …

const burstL = gsap.timeline({ repeat: -1, delay: 6 * FRAME });
// same sprites, scaleX -1, origin left
```

Keep periods rational multiples so phases do not drift. If drift appears, one
parent timeline with nested positions is safer.

Particle Y example:

```ts
const particleYOffsets = [-65, -72, -76, -70, -58, -42, -22, 0];
```

## Blink recipe — pixel-stepped

Treat a pixel eye blink as a tiny sprite sequence: `closing → closed → closed →
opening → open`. The Claude reconstruction research uses discrete SVG frames for
changes that should not be interpolated; the same principle applies here, but
with Kubo's own `#FBC80D` mark and eye geometry. Keep the eye's center fixed:

```ts
const height = state === "open" || state === "opening" ? 86 : 8;
const y = 292 + (86 - height) / 2;
```

At 30 fps, a 4–5 frame blink is about 130–170 ms. Two sparse blinks per short
promo loop are enough to add personality without making the mascot look noisy.
The important pixel rule is that closing/opening are beat labels, not
interpolated eye sizes: the bar snaps to 8px, holds, then snaps back to 86px.
Drive the state from the Remotion frame, test the exact frame boundaries, and
verify the mascot bounding box is unchanged while the eye height changes.

## Idle recipe — alternating pixel leg poses

When the desired reference feels pixelated but the mascot body should stay
fixed, replace a full-character scale pulse with a frame lookup on the legs:

```ts
const steps = [
  { pose: "rest", duration: 18 },
  { pose: "left-step", duration: 6 },
  { pose: "rest", duration: 18 },
  { pose: "right-step", duration: 6 },
];
```

Resolve the current frame against cumulative durations and return the selected
pose without easing. Apply only small integer `translate(x y)` offsets to the
two leg groups, with opposite offsets for each step. Keep the body, root X,
SVG dimensions, and wrapper untouched so the character remains pixelated and
layout-stable.

---

## React / Kubo wiring notes

1. Collect frame refs with `useRef<(SVGGElement | null)[]>([])` and
   `ref={(el) => { frameRefs.current[i] = el; }}`.
2. Prefer timeline factories in `apps/web/src/lib/motion/timelines/` that accept
   plain elements + options; call from `useGsapContext`.
3. Always `tl.kill()` or rely on `useGSAP` context revert.
4. `prefersReducedMotion()` → show frame 0 or dedicated rest group; no
   `repeat: -1`.
5. Decorative mascot: `aria-hidden`; if the mark is brand-meaningful in header,
   keep static brand SVG accessible and animate a decorative duplicate if
   needed.

---

## Choosing mode quickly

```
Does the silhouette topology change every few frames?
  yes → Mode B (or C if only a prop changes)
  no  → Mode A

Is only the prop un-tweenable?
  yes → Mode C

Do two FX systems share a beat but different lengths?
  → Independent timelines + delay locks (or one parent)
```
