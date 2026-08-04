/** Launch composition timing — square CLI-perch promo @ 30 fps → 6s total. */

export const LAUNCH_FPS = 30;
export const LAUNCH_DURATION_FRAMES = 6 * LAUNCH_FPS; // 180
export const LAUNCH_WIDTH = 1080;
export const LAUNCH_HEIGHT = 1080;

/** Scene ranges [from, duration] in frames (absolute). */
export const SCENES = {
  solution: { from: 0, duration: LAUNCH_DURATION_FRAMES }, // 0–6s
} as const;

/**
 * Square layout tokens (1080 canvas), aligned with kubo-square-cli-perch grammar.
 * Panel top ≈ 31.5%; width ≈ 94% with ~6% left inset.
 */
export const SQUARE_LAYOUT = {
  /** Side inset for title + panel left (~6%). */
  insetX: 64,
  /** Title band top offset. */
  titleTop: 48,
  /** Display size for serif title (two lines in upper plate). */
  titleFontSize: 96,
  titleWidth: 960,
  /** Panel top Y (31.5% of 1080). */
  panelTop: 340,
  /** Mark width ≈ 12% of canvas. */
  markWidth: 130,
  /** Left offset of the static mark relative to the panel. */
  markLeft: 560,
} as const;

/**
 * CLI session phase starts (local frames), compressed for 6s so project-type
 * selection is readable by mid-clip (~3s / frame 90).
 */
export const CLI_PHASES = {
  /** Type the shell command over 1.2s so each character reads clearly. */
  commandTypeEnd: 36,
  logoAt: 37,
  introAt: 52,
  nameAt: 65,
  nameTypeStart: 66,
  /** Type the project name over 0.8s. */
  nameTypeEnd: 90,
  nameSubmitted: 90,
  projectTypeAt: 90,
  projectTypeSubmitted: 135,
  webAt: 135,
} as const;
