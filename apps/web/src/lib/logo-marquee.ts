/**
 * Geometry + drag math for the home logo marquee.
 * Contract: docs/spec-mistral-home-logo-marquee.md
 */

/** Unique BR integrations shown in the home logo marquee. */
export const LOGO_MARQUEE_CELL_COUNT = 3;

/** Compact (<768): 160px cells, no border overlap. */
export const LOGO_MARQUEE_COMPACT = {
  cell: 160,
  step: 160,
  logoMaxW: 80,
  logoMaxH: 40,
  sequenceWidth: 160 * LOGO_MARQUEE_CELL_COUNT, // 480
} as const;

/**
 * Desktop (≥768): 272px cells with −1px left margin on every cell so
 * origins land at −1, 270, 541… (step 271).
 */
export const LOGO_MARQUEE_DESKTOP = {
  cell: 272,
  step: 271,
  logoMaxW: 112,
  logoMaxH: 60,
  /** N × 271 — also N×272 − N×1 (every cell has margin-left: −1px) */
  sequenceWidth: 271 * LOGO_MARQUEE_CELL_COUNT, // 813
} as const;

export const LOGO_MARQUEE_BREAKPOINT_PX = 768;

/** Max pointer travel (px) still counted as a click, not a drag. */
export const LOGO_MARQUEE_CLICK_SLOP_PX = 6;

/**
 * Kubo product choice: continuous drift (px/s) while idle.
 * Spec allowed autoplay as a separate Kubo decision; Mistral rest had none.
 * ~one cell every ~6–7s on desktop (271px / 40 ≈ 6.8s).
 */
export const LOGO_MARQUEE_AUTOPLAY_PX_PER_SEC = 40;
export const LOGO_MARQUEE_MIN_TRACK_COPIES = 3;
export const LOGO_MARQUEE_INITIAL_TRACK_COPIES = 8;

export type LogoMarqueeMetrics = {
  cell: number;
  step: number;
  logoMaxW: number;
  logoMaxH: number;
  sequenceWidth: number;
};

export function logoMarqueeMetrics(viewportWidth: number): LogoMarqueeMetrics {
  return viewportWidth >= LOGO_MARQUEE_BREAKPOINT_PX ? LOGO_MARQUEE_DESKTOP : LOGO_MARQUEE_COMPACT;
}

/**
 * Keep drag offset in (−sequenceWidth, 0] so repeated absolute tracks spaced by
 * sequenceWidth can wrap seamlessly without changing the painted position.
 */
export function normalizeMarqueeOffset(offset: number, sequenceWidth: number): number {
  if (sequenceWidth <= 0) return 0;
  let x = offset % sequenceWidth;
  if (x > 0) x -= sequenceWidth;
  if (x === 0) return 0;
  // Map 0 remainder already handled; force (−W, 0]
  if (x <= -sequenceWidth) x += sequenceWidth;
  return x;
}

/**
 * Minimum copies needed to cover the viewport for any normalized offset in
 * (−sequenceWidth, 0]. Example: viewport 1830px with 813px sequence needs 4
 * copies because 3 only cover 1626px to the right of the leftmost origin.
 */
export function logoMarqueeTrackCopies(viewportWidth: number, sequenceWidth: number): number {
  if (sequenceWidth <= 0) return LOGO_MARQUEE_MIN_TRACK_COPIES;

  return Math.max(LOGO_MARQUEE_MIN_TRACK_COPIES, Math.ceil(viewportWidth / sequenceWidth) + 1);
}

/** Expected cell origin X (viewport-local) for index i when track is at rest (offset 0). */
export function cellOriginX(index: number, metrics: LogoMarqueeMetrics): number {
  // Desktop: every cell has margin-left −1 → first origin −1, then step 271.
  // Compact: origin 0, step 160.
  if (metrics.step === metrics.cell) {
    return index * metrics.step;
  }
  return -1 + index * metrics.step;
}
