/** Launch composition timing — square CLI-perch promo @ 30 fps → 5s total. */

export const LAUNCH_FPS = 30;
export const LAUNCH_DURATION_FRAMES = 5 * LAUNCH_FPS; // 150
export const LAUNCH_WIDTH = 1080;
export const LAUNCH_HEIGHT = 1080;

/** Scene ranges [from, duration] in frames (absolute). */
export const SCENES = {
  solution: { from: 0, duration: LAUNCH_DURATION_FRAMES }, // 0–5s
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
  markLeft: 820,
} as const;

/**
 * Title intro — same grammar as LP hero word blur-in, slowed for a 7s social cut
 * (LP is 0.8s / 0.055s stagger; here intentionally slower so each word reads
 * clearly on-camera).
 */
export const TITLE_BLUR_INTRO = {
  /** Soft hold before first word. */
  delayFrames: 14,
  /** Per-word blur-in (~1.8s; LP blurIn is 0.8s). */
  durationFrames: 55,
  /** Gap between words (~0.2s; LP stagger.word is 0.055s). */
  wordStaggerFrames: 6,
  /** WORD_FROM.y */
  fromY: 10,
  /** WORD_FROM.filter blur */
  fromBlur: 10,
} as const;

/**
 * CLI session phase starts (local frames), compressed so project-type
 * selection is readable by mid-clip (~3s / frame 90). Final web select holds
 * through the remaining duration (~frames 135–210 on a 7s cut).
 */
export const CLI_PHASES = {
  /** Type the shell command over 1.2s so each character reads clearly. */
  commandTypeEnd: 24,
  logoAt: 25,
  introAt: 36,
  nameAt: 45,
  nameTypeStart: 46,
  /** Type the project name over 0.7s. */
  nameTypeEnd: 66,
  nameSubmitted: 66,
  projectTypeAt: 66,
  projectTypeSubmitted: 105,
  webAt: 105,
} as const;
