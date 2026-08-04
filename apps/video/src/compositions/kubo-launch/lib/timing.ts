/** Launch composition timing @ 30 fps → 8s total. */

export const LAUNCH_FPS = 30;
export const LAUNCH_DURATION_FRAMES = 8 * LAUNCH_FPS; // 240
export const LAUNCH_WIDTH = 1920;
export const LAUNCH_HEIGHT = 1080;

/** Scene ranges [from, duration] in frames (absolute). */
export const SCENES = {
  solution: { from: 0, duration: 240 }, // 0–8s
} as const;

/** Walk cycle length in frames (~1.9s full loop matching GSAP step feel). */
export const WALK_CYCLE_FRAMES = 58;
