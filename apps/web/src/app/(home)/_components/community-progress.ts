export function parseScaleX(transform: string): number | null {
  if (!transform || transform === "none") {
    return null;
  }

  const matrix3d = /^matrix3d\(([^,]+)/i.exec(transform);
  if (matrix3d) {
    const scaleX = Number(matrix3d[1]);
    return Number.isFinite(scaleX) ? scaleX : null;
  }

  const matrix = /^matrix\(([^,]+)/i.exec(transform);
  if (!matrix) {
    return null;
  }

  const scaleX = Number(matrix[1]);
  return Number.isFinite(scaleX) ? scaleX : null;
}

export function readAnimationProgress(element: HTMLElement): number | null {
  const animation = element.getAnimations().at(0);
  if (!animation?.effect) {
    return parseScaleX(getComputedStyle(element).transform);
  }

  const timing = animation.effect.getComputedTiming();
  const duration = typeof timing.duration === "number" ? timing.duration : 0;
  if (duration <= 0) {
    return parseScaleX(getComputedStyle(element).transform);
  }

  const currentTime = typeof animation.currentTime === "number" ? animation.currentTime : 0;
  return Math.min(Math.max(currentTime / duration, 0), 1);
}
