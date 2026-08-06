/**
 * Multipartite Kubo mark paths (viewBox 0 0 763 678).
 * Rest pose composites to the same silhouette as the single evenodd brand path:
 * body closed at hip y=547; two legs under the side pillars with the center gap open.
 */

/** Full brand path — header / static `KuboMark` only. */
export const KUBO_MARK_FULL_PATH =
  "M100 678H665A8 8 0 0 1 673 670V328H755A8 8 0 0 1 763 320V134A8 8 0 0 1 755 126H673V8A8 8 0 0 1 665 0H561A8 8 0 0 1 553 8V126H213V8A8 8 0 0 1 205 0H100A8 8 0 0 1 92 8V126H10A8 8 0 0 1 2 134V320A8 8 0 0 1 10 328H92V670A8 8 0 0 1 100 678ZM213 292H298V378H213ZM468 292H553V378H468ZM213 547H553V678H213Z";

/**
 * Body + arms + towers + eyes. Closed along the hip line (y=547).
 * Side walls stay at x=92 / x=673 so they meet the leg columns cleanly.
 * Eye holes via evenodd.
 */
export const KUBO_MARK_BODY_PATH =
  "M92 547H673V328H755A8 8 0 0 1 763 320V134A8 8 0 0 1 755 126H673V8A8 8 0 0 1 665 0H561A8 8 0 0 1 553 8V126H213V8A8 8 0 0 1 205 0H100A8 8 0 0 1 92 8V126H10A8 8 0 0 1 2 134V320A8 8 0 0 1 10 328H92V547ZM213 292H298V378H213ZM468 292H553V378H468Z";

/** Left foot column under the left pillar (hip → ground). */
export const KUBO_MARK_LEG_LEFT_PATH = "M92 547H213V678H100A8 8 0 0 1 92 670V547Z";

/** Right foot column under the right pillar (hip → ground). */
export const KUBO_MARK_LEG_RIGHT_PATH = "M553 547H673V670A8 8 0 0 1 665 678H553V547Z";

export const KUBO_MARK_FILL = "#FBC80D";

/** Eye cutouts restored as solid dark eyes, matching the Remotion launch mark. */
export const KUBO_MARK_EYE_FILL = "#0a0a0a";
export const KUBO_MARK_EYE_LEFT = { x: 213, y: 292, width: 85, height: 86 };
export const KUBO_MARK_EYE_RIGHT = { x: 468, y: 292, width: 85, height: 86 };

/** Hip line — walk pivots. */
export const KUBO_MARK_HIP_Y = 547;
export const KUBO_MARK_HIP_CENTER = "381.5 547";
export const KUBO_MARK_HIP_LEFT = "152.5 547";
export const KUBO_MARK_HIP_RIGHT = "613 547";
