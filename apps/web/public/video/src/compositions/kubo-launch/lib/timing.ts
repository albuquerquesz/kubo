/** Launch composition timing @ 30 fps → 15s total. */

export const LAUNCH_FPS = 30;
export const LAUNCH_DURATION_FRAMES = 15 * LAUNCH_FPS; // 450
export const LAUNCH_WIDTH = 1920;
export const LAUNCH_HEIGHT = 1080;

/** Scene ranges [from, duration] in frames (absolute). */
export const SCENES = {
  hook: { from: 0, duration: 90 }, // 0–3s
  problem: { from: 90, duration: 90 }, // 3–6s
  solution: { from: 180, duration: 150 }, // 6–11s
  cta: { from: 330, duration: 120 }, // 11–15s
} as const;

/** Walk cycle length in frames (~1.9s full loop matching GSAP step feel). */
export const WALK_CYCLE_FRAMES = 58;
