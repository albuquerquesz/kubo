import { epochMilliseconds, toDate } from "@kubojs/datetime";

export function filterDataByXDomain(
  data: Record<string, unknown>[],
  xDomain: [Date, Date],
  xAccessor: (d: Record<string, unknown>) => Date,
): Record<string, unknown>[] {
  const start = epochMilliseconds(xDomain[0]);
  const end = epochMilliseconds(xDomain[1]);
  const minTime = Math.min(start, end);
  const maxTime = Math.max(start, end);

  return data.filter((d) => {
    const time = epochMilliseconds(xAccessor(d));
    return time >= minTime && time <= maxTime;
  });
}

export function resolveDataXExtent(
  data: Record<string, unknown>[],
  xAccessor: (d: Record<string, unknown>) => Date,
): [Date, Date] | null {
  if (data.length === 0) {
    return null;
  }

  let minTime = Number.POSITIVE_INFINITY;
  let maxTime = Number.NEGATIVE_INFINITY;

  for (const point of data) {
    const time = epochMilliseconds(xAccessor(point));
    if (time < minTime) {
      minTime = time;
    }
    if (time > maxTime) {
      maxTime = time;
    }
  }

  if (minTime === Number.POSITIVE_INFINITY) {
    return null;
  }

  return [toDate(minTime), toDate(maxTime)];
}

/** Brush track extent — optionally extends past the last data row (e.g. projections). */
export function resolveBrushTrackXExtent(
  data: Record<string, unknown>[],
  xAccessor: (d: Record<string, unknown>) => Date,
  xExtentMax?: Date,
): [Date, Date] | null {
  const extent = resolveDataXExtent(data, xAccessor);
  if (!extent) {
    return null;
  }
  if (!xExtentMax || epochMilliseconds(xExtentMax) <= epochMilliseconds(extent[1])) {
    return extent;
  }
  return [extent[0], xExtentMax];
}
