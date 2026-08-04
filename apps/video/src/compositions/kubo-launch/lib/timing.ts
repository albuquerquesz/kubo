/** Launch composition timing — square CLI-perch promo @ 30 fps → 6s total. */

export const LAUNCH_FPS = 30;
export const LAUNCH_DURATION_FRAMES = 6 * LAUNCH_FPS; // 180
export const LAUNCH_WIDTH = 1080;
export const LAUNCH_HEIGHT = 1080;

/** Scene ranges [from, duration] in frames (absolute). */
export const SCENES = {
  solution: { from: 0, duration: LAUNCH_DURATION_FRAMES }, // 0–6s
} as const;

/** Walk cycle length in frames (~1.9s full loop matching GSAP step feel). */
export const WALK_CYCLE_FRAMES = 58;

/**
 * Square layout tokens (1080 canvas), aligned with kubo-square-cli-perch grammar.
 * Panel top ≈ 31.5%; width ≈ 94% with ~6% left inset.
 */
export const SQUARE_LAYOUT = {
  /** Side inset for title + panel left (~6%). */
  insetX: 64,
  /** Title band top offset. */
  titleTop: 56,
  titleFontSize: 58,
  titleWidth: 920,
  /** Panel top Y (31.5% of 1080). */
  panelTop: 340,
  /** Mark width ≈ 12% of canvas. */
  markWidth: 130,
  /** Right inset of mark (~8.5% of 1080). */
  markRight: 92,
} as const;

/**
 * CLI session phase starts (local frames), compressed for 6s so project-type
 * selection is readable by mid-clip (~3s / frame 90).
 */
export const CLI_PHASES = {
  commandTypeEnd: 28,
  logoAt: 29,
  introAt: 46,
  nameAt: 59,
  nameTypeStart: 60,
  nameTypeEnd: 78,
  nameSubmitted: 90,
  projectTypeAt: 90,
  projectTypeSubmitted: 135,
  webAt: 135,
} as const;
