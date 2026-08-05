---
name: claude-mascot-motion-grammar
description: >
  Reverse-engineer short social-video mascot performances into a pixel-stepped
  SVG motion grammar: discrete poses, holds, ground contact, stage parallax,
  and deterministic Remotion/GSAP playback. Use with svg-gsap-mascot for Kubo
  mascots; techniques only, never Claude or Anthropic assets.
---

# Pixel mascot motion grammar

Use this skill when a reference clip has a simple pixel mascot whose personality
comes from pose changes, timing, and composition staging rather than smooth
character interpolation. Load it together with
[`svg-gsap-mascot`](../svg-gsap-mascot/SKILL.md), which owns the SVG rig and
GSAP implementation details.

## Non-negotiable boundary

Reverse-engineer motion language, not brand expression. Redraw Kubo with its
own geometry and tokens (`#FBC80D`, cream, dark terminal). Do not copy Claude's
mascot, checker flag, orange palette, typography, screenshots, or sprites.

## Core grammar

Treat the shot as two coupled systems:

1. **Stage:** title, terminal, and side windows can slide, reveal, or parallax.
2. **Mascot:** a small discrete sprite sequence stays grounded relative to the
   stage and changes pose on hard pixel beats.

Keep their coordinate systems separate. A terminal reveal must not accidentally
move the mascot's feet; a leg pose must not resize or translate the whole SVG.

Prefer a frame sheet when a pose changes silhouette, limb topology, flag/prop
shape, or eye geometry. Use continuous tweening only for a stable parent
translation or a subtle stage camera move. Hybrid is allowed when the stage
slides continuously and the mascot swaps frames discretely.

## Reference observations: Claude-like social promo

The supplied 1080×1080, ~12-second X clip was inspected with Playwright at
quarter- and one-second intervals. The useful, transferable observations are:

- A warm cream plate and fixed editorial title establish the frame before the
  scene settles.
- A dark terminal is the visual anchor; white side panels enter/leave at the
  edges, creating horizontal parallax and a wider-than-frame workspace.
- The mascot is mostly a hard-edged pixel silhouette behind/above the terminal.
  It uses a few authored poses rather than fluid anatomy interpolation.
- The entrance is staged: the surrounding UI moves first/with the reveal, then
  the character holds a readable pose. This makes the mascot feel placed in a
  world instead of attached to the terminal.
- A prop/raised appendage reads as a stepped state change. Hold the peak longer
  than travel frames; do not use a smooth rotation when the reference reads as
  pixel art.
- The exit/repose is a discrete hold or frame swap, not a springy CSS-scale
  loop. Avoid continuous grow/shrink unless the reference clearly shows it.

These observations are a starting hypothesis, not a claim that every Claude
clip uses the same timeline. Re-sample the exact supplied clip before coding.

## Extraction workflow

1. Open the reference in a real browser with Playwright and confirm the video
   dimensions, duration, and whether it is a real `<video>` element.
2. Pause the video, seek at 0.25 s first, then densify around every visible
   change. Capture the video element, not the page chrome.
3. Make a table with `time`, `stage`, `mascot pose`, `prop state`, `x/y`, and
   `hold`. Mark each change as `tweenable`, `snap`, or `uncertain`.
4. Separate camera/stage motion from mascot motion by tracking a stable feature
   (terminal top edge or title baseline). Never estimate mascot translation
   from the full composite alone.
5. Implement the smallest frame sheet that reproduces the beats. A held frame
   is intentional; do not add in-between frames just to make playback busy.
6. Validate at 30 fps in Remotion and at 1× playback in Studio. Check the first
   loop boundary, reduced motion, and mascot ground contact.

Example Playwright extraction pattern:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
bash "$PWCLI" open "<reference-url>" --headed
bash "$PWCLI" run-code 'async page => {
  const video = page.locator("video");
  return await video.evaluate(v => ({
    duration: v.duration, width: v.videoWidth, height: v.videoHeight,
  }));
}'
```

For each sample, pause and set `currentTime`, then use `video.screenshot()`.
Store artifacts under `output/playwright/`; do not ship them as runtime assets.

## Timing recipe

Use a data table, not scattered delays:

```ts
type Beat = {
  at: number;
  pose: "rest" | "enter" | "raised" | "step" | "repose";
  hold: number;
  stageX?: number;
};

const beats: Beat[] = [
  { at: 0, pose: "enter", hold: 0.16, stageX: 0 },
  { at: 0.16, pose: "step", hold: 0.12, stageX: -24 },
  { at: 0.28, pose: "raised", hold: 0.42, stageX: -24 },
  { at: 0.7, pose: "raised", hold: 0.75, stageX: 0 },
  { at: 1.45, pose: "repose", hold: 0.5, stageX: 0 },
];
```

Tune the table from footage. Recommended shape: short snap into a pose,
longer readable hold, then a short exit. Effort/prop peaks commonly hold 2–4×
the neutral step. Do not add random easing or perpetual jitter.

## Implementation rules

- In Remotion, derive frame visibility and pose from `useCurrentFrame()`;
  deterministic frame swaps render reliably.
- In GSAP, use `tl.set()` for sprite visibility and `tl.to()` only for stable
  stage/root motion. Use one parent timeline when the stage and pose must land
  on the same beat.
- Give each sprite pose a stable `data-pose` or ref. Make visibility exclusive
  (`display: inline/none`) so old limbs cannot ghost.
- Keep the mascot's floor line constant across poses. If authored art changes
  height, compensate inside the sprite group instead of moving the wrapper.
- Use integer coordinates and hard edges for pixel art. Avoid blur, fractional
  transforms, CSS keyframes, and spring easing unless the source visibly has
  them.
- Reduced motion shows one readable rest pose, hides decorative props, and
  disables infinite loops.

## Validation checklist

- [ ] The stage may slide, but the mascot does not enter the terminal by accident.
- [ ] Every pose is a deliberate snap with a documented hold.
- [ ] Feet/ground contact and wrapper bounds remain stable across the loop.
- [ ] The prop is attached to the correct hand/group in every frame.
- [ ] No Claude/Anthropic assets, names, colors, or copied artwork shipped.
- [ ] Playwright screenshots cover entrance, peak, transition, exit, and loop.
- [ ] `bunx oxfmt`, `bunx oxlint`, relevant tests, and a Remotion build pass.
