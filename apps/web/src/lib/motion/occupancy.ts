/**
 * Pure occupancy metrics for sticky-hero "takes screen space" checks.
 * Used by probes/tests — no DOM required when boxes are supplied.
 */

export type RectSize = { width: number; height: number };

export type OccupancyShares = {
  widthShare: number;
  heightShare: number;
  areaShare: number;
};

/** Painted host share of a container (sticky shell or rail cell). */
export function occupancyShares(host: RectSize, container: RectSize): OccupancyShares {
  const cw = Math.max(container.width, 1e-9);
  const ch = Math.max(container.height, 1e-9);
  const hw = Math.max(host.width, 0);
  const hh = Math.max(host.height, 0);
  return {
    widthShare: hw / cw,
    heightShare: hh / ch,
    areaShare: (hw * hh) / (cw * ch),
  };
}

/**
 * Expected painted size if layout box is scaled uniformly from origin
 * (ignores translate). area ratio ≈ 1 / scaleFrom² when scaleTo = 1.
 */
export function paintedSizeAtScale(layout: RectSize, scale: number): RectSize & { area: number } {
  const width = layout.width * scale;
  const height = layout.height * scale;
  return { width, height, area: width * height };
}

export function areaGrowthRatio(scaleFrom: number, scaleTo: number = 1): number {
  if (scaleFrom <= 0) return 0;
  return (scaleTo / scaleFrom) ** 2;
}
