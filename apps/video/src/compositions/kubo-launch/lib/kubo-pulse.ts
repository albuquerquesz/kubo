export const KUBO_PULSE = {
  cycleFrames: 48,
  minScale: 0.96,
  maxScale: 1.04,
} as const;

/**
 * Returns a deterministic, uniform presence pulse for the Kubo mark.
 * The cycle starts compressed, peaks halfway through, and returns smoothly.
 */
export function getKuboScale(frame: number): number {
  const phase = (frame % KUBO_PULSE.cycleFrames) / KUBO_PULSE.cycleFrames;
  const midpoint = (KUBO_PULSE.minScale + KUBO_PULSE.maxScale) / 2;
  const amplitude = (KUBO_PULSE.maxScale - KUBO_PULSE.minScale) / 2;

  return midpoint - amplitude * Math.cos(phase * Math.PI * 2);
}
