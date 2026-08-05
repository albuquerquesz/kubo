/**
 * Multipartite Kubo mark paths (viewBox 0 0 763 678).
 * Copied from apps/web for Remotion isolation (no GSAP / Next imports).
 * Rest pose composites to the same silhouette as the single evenodd brand path.
 */

export const KUBO_MARK_BODY_PATH =
  "M92 547H673V328H755A8 8 0 0 1 763 320V134A8 8 0 0 1 755 126H673V8A8 8 0 0 1 665 0H561A8 8 0 0 1 553 8V126H213V8A8 8 0 0 1 205 0H100A8 8 0 0 1 92 8V126H10A8 8 0 0 1 2 134V320A8 8 0 0 1 10 328H92V547ZM213 292H298V378H213ZM468 292H553V378H468Z";

export const KUBO_MARK_LEG_LEFT_PATH = "M92 547H213V678H100A8 8 0 0 1 92 670V547Z";

export const KUBO_MARK_LEG_RIGHT_PATH = "M553 547H673V670A8 8 0 0 1 665 678H553V547Z";

export const KUBO_MARK_FILL = "#FBC80D";
/** Eye cutouts from body evenodd path — filled solid so they stay visible on light plates. */
export const KUBO_MARK_EYE_FILL = "#0a0a0a";
export const KUBO_MARK_EYE_LEFT = { x: 213, y: 292, width: 85, height: 86 };
export const KUBO_MARK_EYE_RIGHT = { x: 468, y: 292, width: 85, height: 86 };
export type KuboMarkEye = typeof KUBO_MARK_EYE_LEFT;

/** Hip line pivots (svgOrigin-style centers in viewBox coords). */
export const KUBO_MARK_HIP_Y = 547;
export const KUBO_MARK_VIEWBOX = { width: 763, height: 678 };
export const KUBO_MARK_HIP_CENTER = { x: 381.5, y: 547 };
export const KUBO_MARK_HIP_LEFT = { x: 152.5, y: 547 };
export const KUBO_MARK_HIP_RIGHT = { x: 613, y: 547 };
