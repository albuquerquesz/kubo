export const KUBO_PULSE = {
  cycleFrames: 48,
  minScale: 0.96,
  maxScale: 1.04,
  steps: [
    { scale: 0.96, duration: 8 },
    { scale: 0.98, duration: 4 },
    { scale: 1.02, duration: 4 },
    { scale: 1.04, duration: 8 },
    { scale: 1.02, duration: 4 },
    { scale: 0.98, duration: 4 },
    { scale: 0.96, duration: 16 },
  ],
} as const;

/**
 * Returns a deterministic, frame-stepped presence pulse for the Kubo mark.
 * Each value is held for several frames so the scale changes read as pixels,
 * rather than as a smooth tween.
 */
export function getKuboScale(frame: number): number {
  const cycleFrame =
    ((frame % KUBO_PULSE.cycleFrames) + KUBO_PULSE.cycleFrames) % KUBO_PULSE.cycleFrames;
  let elapsed = 0;

  for (const step of KUBO_PULSE.steps) {
    elapsed += step.duration;
    if (cycleFrame < elapsed) return step.scale;
  }

  return KUBO_PULSE.minScale;
}
