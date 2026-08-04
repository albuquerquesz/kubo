/** Launch composition timing @ 30 fps → 12s total (no hook frame). */

export const LAUNCH_FPS = 30;
export const LAUNCH_DURATION_FRAMES = 12 * LAUNCH_FPS; // 360
export const LAUNCH_WIDTH = 1920;
export const LAUNCH_HEIGHT = 1080;

/** Scene ranges [from, duration] in frames (absolute). */
export const SCENES = {
  problem: { from: 0, duration: 90 }, // 0–3s
  solution: { from: 90, duration: 150 }, // 3–8s
  cta: { from: 240, duration: 120 }, // 8–12s
} as const;

/** Walk cycle length in frames (~1.9s full loop matching GSAP step feel). */
export const WALK_CYCLE_FRAMES = 58;
