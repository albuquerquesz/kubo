"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

type Rgb = { r: number; g: number; b: number };

type ThemeColors = {
  background: Rgb;
  card: Rgb;
  muted: Rgb;
  foreground: Rgb;
  mutedForeground: Rgb;
  primary: Rgb;
  accent: Rgb;
};

type Band = {
  points: Array<{ x: number; y: number }>;
  width: number;
  coreWidth: number;
  opacity: number;
  coreOpacity: number;
  color: Rgb;
  coreColor: Rgb;
  /** Peak tile color at the band hotspot (cream yellow / amber). */
  hotColor?: Rgb;
  /** A localized pale core prevents a continuous, evenly-lit rail. */
  hotspot?: { x: number; y: number; radiusX: number; radiusY: number };
};

/**
 * Two-temperature gold field (bright yellow S + dark yellow/amber bow).
 * Anchors track Kubo primary/accent (~#c49314 / #d6a72b). Atmosphere only.
 */
const FIELD: Record<string, Rgb> = {
  // Bed — near-black with slight warm olive
  baseDark: { r: 14, g: 14, b: 12 },
  tileQuiet: { r: 24, g: 22, b: 16 },
  tileLift: { r: 36, g: 32, b: 22 },
  // Light yellow ribbon (primary S-curve)
  yellowDeep: { r: 90, g: 65, b: 12 },
  yellowMid: { r: 160, g: 115, b: 18 },
  yellowCore: { r: 214, g: 167, b: 43 },
  // Cream-white peaks for hot cores
  yellowHot: { r: 255, g: 245, b: 200 },
  // Dark yellow / bronze ribbon (outer bow + weave)
  amberDeep: { r: 70, g: 48, b: 10 },
  amberCore: { r: 150, g: 105, b: 18 },
  amberHot: { r: 196, g: 147, b: 20 },
  amberFade: { r: 180, g: 130, b: 30 },
  topLeftHaze: { r: 55, g: 40, b: 18 },
  // Pale cream where bright∩dark yellow meet
  overlapPale: { r: 210, g: 185, b: 120 },
};

type GridGeometry = {
  columns: number;
  rows: number;
  cell: number;
  seam: number;
  radius: number;
  originX: number;
  originY: number;
};

/** Fewer rows → larger square pitch (width and height of each tile). */
const REFERENCE_ROWS = 32;
/** 5% of pitch — tighter dark seam between opaque cells. */
const SEAM_RATIO = 0.05;
/** 34% of pitch — more rounded squares, still not circular (circle ≈ 45% of pitch). */
const CORNER_RATIO = 0.34;
const MAX_DPR = 1.5;
const DRIFT_PERIOD_SEC = 18;
const SEED = 0x6b75626f; // "kubo"

const FALLBACK_HEX = {
  background: "#000000",
  card: "#0c0c0c",
  muted: "#161616",
  foreground: "#f1f1f1",
  mutedForeground: "#a0a0a0",
  primary: "#c49314",
  accent: "#d6a72b",
} as const;

function parseCssColor(value: string, fallback: string): Rgb {
  const raw = (value || fallback).trim();
  const hex = raw.startsWith("#") ? raw : fallback;

  if (/^#([0-9a-f]{3})$/i.test(hex)) {
    const [, h] = hex.match(/^#([0-9a-f]{3})$/i) ?? [];
    return {
      r: Number.parseInt(h[0] + h[0], 16),
      g: Number.parseInt(h[1] + h[1], 16),
      b: Number.parseInt(h[2] + h[2], 16),
    };
  }

  if (/^#([0-9a-f]{6})$/i.test(hex)) {
    const n = Number.parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  const rgb = raw.match(/rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i);
  if (rgb) {
    return {
      r: Math.round(Number(rgb[1])),
      g: Math.round(Number(rgb[2])),
      b: Math.round(Number(rgb[3])),
    };
  }

  return parseCssColor(fallback, FALLBACK_HEX.background);
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  const k = Math.min(1, Math.max(0, t));
  return {
    r: Math.round(a.r + (b.r - a.r) * k),
    g: Math.round(a.g + (b.g - a.g) * k),
    b: Math.round(a.b + (b.b - a.b) * k),
  };
}

function rgbString(c: Rgb): string {
  return `rgb(${c.r} ${c.g} ${c.b})`;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Deterministic 0..1 hash from integer grid coords. */
function cellNoise(col: number, row: number): number {
  let n = (col * 374761393 + row * 668265263 + SEED) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n = (n ^ (n >>> 16)) >>> 0;
  return (n & 0xffff) / 0xffff;
}

function distPointSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-12) {
    const ex = px - ax;
    const ey = py - ay;
    return Math.hypot(ex, ey);
  }
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.min(1, Math.max(0, t));
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

function distanceToPolyline(
  px: number,
  py: number,
  points: Array<{ x: number; y: number }>,
): number {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    min = Math.min(min, distPointSegment(px, py, a.x, a.y, b.x, b.y));
  }
  return min;
}

/** Sample a quadratic Bezier into a dense polyline in normalized 0..1 space. */
function sampleQuadratic(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  segments = 28,
): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const u = 1 - t;
    out.push({
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    });
  }
  return out;
}

/** Cubic Bezier for right-descending ribbon paths. */
function sampleCubic(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  segments = 36,
): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const u = 1 - t;
    const uu = u * u;
    const tt = t * t;
    out.push({
      x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
      y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
    });
  }
  return out;
}

/**
 * Height-driven square pitch so cells stay square and the grid reaches the edges.
 * Fewer rows → larger tiles; wider frames add columns at the same pitch.
 */
function resolveGrid(cssWidth: number, cssHeight: number): GridGeometry {
  const rows = cssHeight < 520 ? 26 : cssHeight < 720 ? 29 : REFERENCE_ROWS;
  const cell = Math.max(10, cssHeight / rows);
  const columns = Math.max(1, Math.ceil(cssWidth / cell));
  const seam = cell * SEAM_RATIO;
  const radius = cell * CORNER_RATIO;
  const gridW = columns * cell;
  const gridH = rows * cell;
  return {
    columns,
    rows,
    cell,
    seam,
    radius,
    originX: (cssWidth - gridW) / 2,
    originY: (cssHeight - gridH) / 2,
  };
}

/**
 * Apply slow drift to a normalized polyline.
 * Phase 0 is identity (reduced-motion / first paint). Drift uses sin so
 * both axes are zero at phase 0 (cos would leave a constant Y offset).
 */
function driftPoints(
  points: Array<{ x: number; y: number }>,
  phase: number,
  scale = 1,
): Array<{ x: number; y: number }> {
  if (phase === 0) return points.map((p) => ({ x: p.x, y: p.y }));
  const driftX = Math.sin(phase * Math.PI * 2) * 0.014 * scale;
  const driftY = Math.sin(phase * Math.PI * 2 * 0.7 + 0.4) * 0.01 * scale;
  return points.map((p, i) => {
    const t = i / Math.max(1, points.length - 1);
    return {
      x: p.x + driftX * (0.35 + t * 0.65),
      y: p.y + driftY * (0.4 + (1 - t) * 0.4),
    };
  });
}

/**
 * Discrete ribbon ridges — inverted lateral S (pivot ~0.67) so the lightning
 * swings the opposite way while energy stays on the right half (left copy pocket).
 *
 * Inverted cool S: top-right entry → mid leftward bulge → lower-right hot.
 * Amber outer bow stays far-right outside the yellow S.
 */
/**
 * Upper yellow entry — inverted: starts farther right, curves left mid-way.
 */
const COOL_UPPER_RIDGE: Array<{ x: number; y: number }> = [
  { x: 0.76, y: 0.02 },
  { x: 0.7, y: 0.12 },
  { x: 0.64, y: 0.2 },
  { x: 0.6, y: 0.28 },
  { x: 0.58, y: 0.36 },
  { x: 0.58, y: 0.44 },
  { x: 0.6, y: 0.52 },
  { x: 0.66, y: 0.58 },
  { x: 0.72, y: 0.64 },
];

/**
 * Lower yellow — PRIMARY bright mass (inverted: hot core ~x0.76, y0.76).
 */
const COOL_LOWER_RIDGE: Array<{ x: number; y: number }> = [
  { x: 0.72, y: 0.7 },
  { x: 0.76, y: 0.74 },
  { x: 0.77, y: 0.76 },
  { x: 0.76, y: 0.77 },
  { x: 0.765, y: 0.78 },
  { x: 0.78, y: 0.8 },
  { x: 0.8, y: 0.86 },
  { x: 0.82, y: 0.94 },
  { x: 0.8, y: 1.04 },
];

/**
 * Full continuous cool S (single band) — prevents mid-right gap
 * between separate upper/lower polylines.
 */
const COOL_RIDGE: Array<{ x: number; y: number }> = [
  ...COOL_UPPER_RIDGE,
  ...COOL_LOWER_RIDGE.slice(1),
];

/**
 * Thin spur on the left flank of the inverted S (mid-right, not far edge).
 */
const COOL_FAR_RIGHT_SPUR: Array<{ x: number; y: number }> = [
  { x: 0.54, y: 0.3 },
  { x: 0.51, y: 0.38 },
  { x: 0.49, y: 0.46 },
  { x: 0.47, y: 0.5 },
  { x: 0.49, y: 0.54 },
  { x: 0.51, y: 0.6 },
];

/**
 * Outer warm bow — FAR RIGHT main spine (outside inverted yellow S).
 * Paired with WARM_EDGE_RIDGE + left shoulder.
 */
const WARM_RIDGE: Array<{ x: number; y: number }> = [
  { x: 0.9, y: -0.02 },
  { x: 0.93, y: 0.12 },
  { x: 0.94, y: 0.28 },
  { x: 0.93, y: 0.42 },
  { x: 0.92, y: 0.58 },
  { x: 0.91, y: 0.74 },
  { x: 0.9, y: 0.9 },
  { x: 0.89, y: 1.04 },
];

/** Far-edge amber (x0.95–1.0). */
const WARM_EDGE_RIDGE: Array<{ x: number; y: number }> = [
  { x: 0.96, y: 0.05 },
  { x: 0.97, y: 0.25 },
  { x: 0.98, y: 0.45 },
  { x: 0.97, y: 0.65 },
  { x: 0.96, y: 0.85 },
  { x: 0.95, y: 1.02 },
];

/**
 * Left shoulder of outer bow — sits just left of warm spine, right of yellow S.
 */
const WARM_SHOULDER_RIDGE: Array<{ x: number; y: number }> = [
  { x: 0.84, y: 0.5 },
  { x: 0.85, y: 0.65 },
  { x: 0.85, y: 0.8 },
  { x: 0.84, y: 0.92 },
  { x: 0.83, y: 1.04 },
];

/**
 * Soft yellow depth under lower S. Stay right of copy pocket (x≳0.38).
 */
const COOL_SECONDARY_RIDGE: Array<{ x: number; y: number }> = [
  { x: 0.68, y: 0.48 },
  { x: 0.72, y: 0.58 },
  { x: 0.76, y: 0.68 },
  { x: 0.78, y: 0.78 },
  { x: 0.76, y: 0.88 },
  { x: 0.74, y: 1.0 },
];

/**
 * Amber weave — spiral arm through inverted yellow S (thin, secondary).
 */
const WARM_WEAVE_RIDGE: Array<{ x: number; y: number }> = [
  { x: 0.78, y: 0.4 },
  { x: 0.7, y: 0.5 },
  { x: 0.62, y: 0.58 },
  { x: 0.56, y: 0.68 },
  { x: 0.6, y: 0.78 },
  { x: 0.66, y: 0.88 },
];

/** Weaker amber echo lower-right. */
const WARM_ECHO_RIDGE: Array<{ x: number; y: number }> = [
  { x: 0.7, y: 0.86 },
  { x: 0.78, y: 0.94 },
  { x: 0.86, y: 1.02 },
  { x: 0.92, y: 1.1 },
];

const TOP_LEFT_HAZE_RIDGE: Array<{ x: number; y: number }> = [
  { x: -0.08, y: -0.06 },
  { x: 0.04, y: 0.04 },
  { x: 0.12, y: 0.14 },
  { x: 0.18, y: 0.26 },
];

/**
 * Discrete bright-yellow + dark-yellow ribbon bands on warm-black bed.
 * NO continuous coolMass blob — dark gaps between ribbons required.
 * Cool S is ONE continuous ridge so mid-right stays lit yellow (not bed gap).
 */
function buildBands(_colors: ThemeColors, phase: number): Band[] {
  const coolS = driftPoints(COOL_RIDGE, phase, 1);
  const coolFarRight = driftPoints(COOL_FAR_RIGHT_SPUR, phase, 0.9);
  const coolSecondary = driftPoints(COOL_SECONDARY_RIDGE, phase, 0.7);
  const warmBand = driftPoints(WARM_RIDGE, phase, 1);
  const warmEdge = driftPoints(WARM_EDGE_RIDGE, phase, 0.9);
  const warmShoulder = driftPoints(WARM_SHOULDER_RIDGE, phase, 0.9);
  const warmWeave = driftPoints(WARM_WEAVE_RIDGE, phase, 0.85);
  const warmEcho = driftPoints(WARM_ECHO_RIDGE, phase, 0.6);
  const topLeftHaze = driftPoints(TOP_LEFT_HAZE_RIDGE, phase, 0.5);

  return [
    {
      points: coolSecondary,
      // Mid-right yellow depth under inverted lower S (not left pocket wash).
      width: 0.14,
      coreWidth: 0.055,
      opacity: 0.88,
      coreOpacity: 0.62,
      color: mix(FIELD.yellowDeep, FIELD.baseDark, 0.05),
      coreColor: FIELD.yellowMid,
    },
    {
      points: coolS,
      // Full-height discrete inverted S — thinner ribbon body.
      width: 0.11,
      coreWidth: 0.04,
      opacity: 0.85,
      coreOpacity: 0.55,
      color: FIELD.yellowMid,
      coreColor: FIELD.yellowCore,
      hotColor: FIELD.yellowHot,
    },
    {
      points: coolFarRight,
      // Thin left-flank spur of inverted S.
      width: 0.06,
      coreWidth: 0.022,
      opacity: 0.65,
      coreOpacity: 0.55,
      color: FIELD.yellowMid,
      coreColor: FIELD.yellowCore,
      hotColor: FIELD.yellowHot,
    },
    {
      // PRIMARY cream-hot mass — inverted peaks at ~(.76–.78, .75–.77).
      points: driftPoints(COOL_LOWER_RIDGE, phase, 1),
      width: 0.12,
      coreWidth: 0.07,
      opacity: 1,
      coreOpacity: 1,
      color: FIELD.yellowMid,
      coreColor: FIELD.yellowCore,
      hotColor: FIELD.yellowHot,
      // Sole bright-yellow hotspot — top peak at y≈0.76.
      hotspot: { x: 0.76, y: 0.76, radiusX: 0.1, radiusY: 0.1 },
    },
    {
      points: warmWeave,
      // Dark-yellow spiral through inverted yellow S — discrete threads.
      width: 0.055,
      coreWidth: 0.02,
      opacity: 0.55,
      coreOpacity: 0.5,
      color: FIELD.amberDeep,
      coreColor: FIELD.amberCore,
      hotColor: FIELD.amberHot,
      hotspot: { x: 0.66, y: 0.58, radiusX: 0.04, radiusY: 0.05 },
    },
    {
      points: warmShoulder,
      // Lower-half amber shoulder between yellow S and far-right spine.
      width: 0.065,
      coreWidth: 0.024,
      opacity: 0.65,
      coreOpacity: 0.55,
      color: FIELD.amberDeep,
      coreColor: FIELD.amberCore,
      hotColor: FIELD.amberHot,
    },
    {
      points: warmBand,
      // Main far-right dark-yellow spine (x≥0.90).
      width: 0.055,
      coreWidth: 0.022,
      opacity: 0.52,
      coreOpacity: 0.5,
      color: FIELD.amberDeep,
      coreColor: FIELD.amberCore,
      hotColor: FIELD.amberHot,
      hotspot: { x: 0.93, y: 0.42, radiusX: 0.045, radiusY: 0.06 },
    },
    {
      points: warmEdge,
      // Far-edge amber dens.
      width: 0.05,
      coreWidth: 0.018,
      opacity: 0.5,
      coreOpacity: 0.48,
      color: FIELD.amberDeep,
      coreColor: FIELD.amberCore,
      hotColor: FIELD.amberHot,
      hotspot: { x: 0.97, y: 0.42, radiusX: 0.038, radiusY: 0.055 },
    },
    {
      points: warmEcho,
      width: 0.07,
      coreWidth: 0.024,
      opacity: 0.45,
      coreOpacity: 0.38,
      color: mix(FIELD.amberDeep, FIELD.baseDark, 0.1),
      coreColor: FIELD.amberFade,
      hotColor: FIELD.amberHot,
      hotspot: { x: 0.86, y: 0.92, radiusX: 0.055, radiusY: 0.055 },
    },
    {
      points: topLeftHaze,
      width: 0.18,
      coreWidth: 0.07,
      opacity: 0.36,
      coreOpacity: 0.14,
      color: FIELD.topLeftHaze,
      coreColor: mix(FIELD.topLeftHaze, FIELD.amberDeep, 0.3),
    },
  ];
}

/** Phase-0 band geometry for tests / tooling (no theme dependency). */
export function getMosaicBandGeometry(phase = 0) {
  const bands = buildBands(
    {
      background: FIELD.baseDark,
      card: FIELD.tileQuiet,
      muted: FIELD.tileLift,
      foreground: FIELD.yellowHot,
      mutedForeground: FIELD.tileLift,
      primary: FIELD.yellowCore,
      accent: FIELD.amberCore,
    },
    phase,
  );
  return {
    coolRidge: COOL_RIDGE,
    warmRidge: WARM_RIDGE,
    warmEdgeRidge: WARM_EDGE_RIDGE,
    warmShoulderRidge: WARM_SHOULDER_RIDGE,
    coolFarRightSpur: COOL_FAR_RIGHT_SPUR,
    coolSecondaryRidge: COOL_SECONDARY_RIDGE,
    warmWeaveRidge: WARM_WEAVE_RIDGE,
    warmEchoRidge: WARM_ECHO_RIDGE,
    topLeftHazeRidge: TOP_LEFT_HAZE_RIDGE,
    bands: bands.map((b) => ({
      width: b.width,
      coreWidth: b.coreWidth,
      opacity: b.opacity,
      hotspot: b.hotspot ?? null,
      pointCount: b.points.length,
      start: b.points[0],
      end: b.points[b.points.length - 1],
      mid: b.points[Math.floor(b.points.length / 2)],
    })),
  };
}

/**
 * Per-cell palette: warm-black matrix + discrete yellow/amber ribbons.
 * Sequence: quiet base → ribbon bands → overlap pale → strong left pocket → vignette.
 * NO continuous coolMass / wash fields.
 */
function colorForCell(
  col: number,
  row: number,
  columns: number,
  rows: number,
  _colors: ThemeColors,
  bands: Band[],
): Rgb {
  const nx = (col + 0.5) / columns;
  const ny = (row + 0.5) / rows;
  const noise = cellNoise(col, row);
  const noise2 = cellNoise(col + 17, row + 31);

  // Quiet warm-black matrix.
  let color = mix(FIELD.baseDark, FIELD.tileQuiet, 0.35 + noise * 0.35);
  color = mix(color, FIELD.tileLift, 0.04 + noise2 * 0.08);
  if (noise > 0.9) {
    color = mix(color, FIELD.tileLift, 0.06 + (noise - 0.9) * 0.25);
  } else if (noise < 0.1) {
    color = mix(color, FIELD.baseDark, 0.1 + (0.1 - noise) * 0.2);
  }

  let coolAccum = 0;
  let warmAccum = 0;
  // Track max hotspot focus so pure hot cores survive pocket/edge mixes.
  let peakFocus = 0;
  let peakHot: Rgb | null = null;

  for (const band of bands) {
    const d = distanceToPolyline(nx, ny, band.points);
    // Soft but discrete falloff: fuller ribbon bodies (REF mass) while
    // still leaving dark gaps between separate cool/warm paths (no coolMass wash).
    const broad = Math.pow(1 - smoothstep(0, band.width, d), 0.72);
    const core = Math.pow(1 - smoothstep(0, band.coreWidth, d), 0.95);
    if (broad <= 0.001) continue;

    const noiseMod = 0.78 + noise * 0.28 + noise2 * 0.1;
    const intensity = broad * band.opacity * noiseMod;
    const hotness = core * band.coreOpacity * (0.95 + noise * 0.45);

    color = mix(color, band.color, Math.min(1, intensity));
    if (hotness > 0.01) {
      color = mix(color, band.coreColor, Math.min(1, hotness * 1.2));
    }

    const isCool = band.coreColor.b > band.coreColor.r + 20 || band.color.b > band.color.r + 15;
    if (isCool) coolAccum += intensity + hotness * 0.6;
    else warmAccum += intensity + hotness * 0.6;

    if (band.hotspot && hotness > 0.02) {
      const dx = (nx - band.hotspot.x) / band.hotspot.radiusX;
      const dy = (ny - band.hotspot.y) / band.hotspot.radiusY;
      const focus = 1 - smoothstep(0.02, 1, Math.hypot(dx, dy));
      // Cream yellow / amber hot spikes.
      const highlight = Math.min(1, hotness * focus * (2.2 + noise * 0.2));
      if (highlight > 0.01) {
        color = mix(color, band.hotColor ?? band.coreColor, highlight);
      }
      if (focus > peakFocus && band.hotColor) {
        peakFocus = focus;
        peakHot = band.hotColor;
      }
    }
  }

  // Pale overlap where cool∩warm meet mid-right (desaturated intermediates).
  // Keep weak so weave stays dark yellow, not muddy.
  const overlap = Math.min(coolAccum, warmAccum);
  if (overlap > 0.28) {
    const pale = Math.min(1, (overlap - 0.28) * 0.7);
    color = mix(color, FIELD.overlapPale, pale * (0.1 + noise * 0.06));
  }

  // Strong left copy pocket — quiet dark bed for headline.
  // End pocket ~x0.38 so mid-third (x0.33–0.55) can hold cool mass (ref mid_lum ~39).
  const copyPocket = 1 - smoothstep(0.24, 0.38, nx);
  color = mix(color, FIELD.baseDark, copyPocket * 0.94);
  const farLeft = 1 - smoothstep(0, 0.15, nx);
  color = mix(color, FIELD.baseDark, farLeft * 0.75);
  const lowerLeftQuiet = (1 - smoothstep(0.05, 0.3, nx)) * (1 - smoothstep(0.48, 0.92, ny)) * 0.45;
  color = mix(color, FIELD.baseDark, lowerLeftQuiet);

  // Soft edge vignette — spare right ribbon energy almost entirely.
  const edge =
    Math.max(
      1 - smoothstep(0, 0.05, nx),
      (1 - smoothstep(0, 0.03, 1 - nx)) * 0.1,
      1 - smoothstep(0, 0.05, ny),
      1 - smoothstep(0, 0.07, 1 - ny),
    ) * 0.2;
  color = mix(color, FIELD.baseDark, edge);

  // Re-apply pure hot cores AFTER darkening so peak_lum reaches ~255 (REF).
  // Tight focus only (lower primary hotspot) — discrete cores, not a wash field.
  if (peakHot && peakFocus > 0.55) {
    // Hard pure hotColor at core (cream / amber peaks).
    color = { r: peakHot.r, g: peakHot.g, b: peakHot.b };
  } else if (peakHot && peakFocus > 0.2) {
    const coreMix = Math.min(1, (peakFocus - 0.2) * 2.4);
    color = mix(color, peakHot, coreMix);
  }

  // No quant on near-white cores — preserves peak_lum 255.
  if (peakHot && peakFocus > 0.55) {
    return color;
  }
  // Fine quant for non-core tiles.
  const quant = 4;
  return {
    r: Math.round(color.r / quant) * quant,
    g: Math.round(color.g / quant) * quant,
    b: Math.round(color.b / quant) * quant,
  };
}

function readThemeColors(): ThemeColors {
  if (typeof document === "undefined") {
    return {
      background: parseCssColor(FALLBACK_HEX.background, FALLBACK_HEX.background),
      card: parseCssColor(FALLBACK_HEX.card, FALLBACK_HEX.card),
      muted: parseCssColor(FALLBACK_HEX.muted, FALLBACK_HEX.muted),
      foreground: parseCssColor(FALLBACK_HEX.foreground, FALLBACK_HEX.foreground),
      mutedForeground: parseCssColor(FALLBACK_HEX.mutedForeground, FALLBACK_HEX.mutedForeground),
      primary: parseCssColor(FALLBACK_HEX.primary, FALLBACK_HEX.primary),
      accent: parseCssColor(FALLBACK_HEX.accent, FALLBACK_HEX.accent),
    };
  }

  const styles = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    parseCssColor(styles.getPropertyValue(name), fallback);

  return {
    background: token("--background", FALLBACK_HEX.background),
    card: token("--card", FALLBACK_HEX.card),
    muted: token("--muted", FALLBACK_HEX.muted),
    foreground: token("--foreground", FALLBACK_HEX.foreground),
    mutedForeground: token("--muted-foreground", FALLBACK_HEX.mutedForeground),
    primary: token("--primary", FALLBACK_HEX.primary),
    accent: token("--accent", FALLBACK_HEX.accent),
  };
}

function paintMosaic(
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  colors: ThemeColors,
  phase: number,
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // Navy field bed (ref), not editorial olive gold background.
  ctx.fillStyle = rgbString(FIELD.baseDark);
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const grid = resolveGrid(cssWidth, cssHeight);
  const { columns, rows, cell, seam, radius, originX, originY } = grid;
  const tile = Math.max(1, cell - seam);
  const bands = buildBands(colors, phase);

  // Dark seam field under opaque rounded-square cells.
  ctx.fillStyle = rgbString(mix(FIELD.baseDark, FIELD.tileQuiet, 0.4));
  ctx.fillRect(originX, originY, columns * cell, rows * cell);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = originX + col * cell + seam * 0.5;
      const y = originY + row * cell + seam * 0.5;
      const fill = colorForCell(col, row, columns, rows, colors, bands);
      // Single flat rounded rect per cell — no radial edge treatment.
      ctx.fillStyle = rgbString(fill);
      ctx.beginPath();
      ctx.roundRect(x, y, tile, tile, radius);
      ctx.fill();
    }
  }

  // Light atmospheric veil only — CSS .mosaic-hero-veil owns copy contrast.
  // Keep very weak so mid-right ribbon luminance matches the reference (~100+).
  const veil = ctx.createRadialGradient(
    cssWidth * 0.28,
    cssHeight * 0.72,
    cssWidth * 0.08,
    cssWidth * 0.55,
    cssHeight * 0.5,
    cssWidth * 0.85,
  );
  veil.addColorStop(0, `rgba(${FIELD.baseDark.r},${FIELD.baseDark.g},${FIELD.baseDark.b},0.04)`);
  veil.addColorStop(0.4, "rgba(0,0,0,0)");
  veil.addColorStop(1, `rgba(${FIELD.baseDark.r},${FIELD.baseDark.g},${FIELD.baseDark.b},0.03)`);
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Edge vignette — spare the right swirl energy almost entirely.
  const edgeGrad = ctx.createRadialGradient(
    cssWidth * 0.7,
    cssHeight * 0.42,
    cssHeight * 0.22,
    cssWidth * 0.5,
    cssHeight * 0.5,
    Math.max(cssWidth, cssHeight) * 0.82,
  );
  edgeGrad.addColorStop(0, "rgba(0,0,0,0)");
  edgeGrad.addColorStop(0.82, "rgba(0,0,0,0.02)");
  edgeGrad.addColorStop(
    1,
    `rgba(${FIELD.baseDark.r},${FIELD.baseDark.g},${FIELD.baseDark.b},0.28)`,
  );
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  return grid;
}

/**
 * Dark mosaic hero atmosphere: rounded-square pixel field with curved
 * bright yellow + dark yellow/amber bands, content-safe left pocket.
 * Canvas-only artwork — keep interactive content in a sibling layer.
 */
export default function MosaicHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<ThemeColors>(readThemeColors());
  const paintApiRef = useRef<{ paint: (phase?: number) => void } | null>(null);
  const unmountPainterRef = useRef<(() => void) | null>(null);

  const mountPainter = () => {
    // Avoid stacking two paint loops when layout + effect both fire.
    if (unmountPainterRef.current) {
      unmountPainterRef.current();
      unmountPainterRef.current = null;
    }
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // alpha:true so the CSS fallback remains visible until first successful paint.
    // Do not request desynchronized — it returns null in some headless/Playwright Chromium builds.
    const ctx = canvas.getContext("2d", { alpha: true }) ?? canvas.getContext("2d");
    if (!ctx) return;

    // Polyfill rounded rect when roundRect is unavailable (still square cells with radius).
    if (typeof ctx.roundRect !== "function") {
      ctx.roundRect = function roundRectPolyfill(
        x: number,
        y: number,
        w: number,
        h: number,
        radii: number | number[] = 0,
      ) {
        const r = typeof radii === "number" ? radii : (radii[0] ?? 0);
        const rr = Math.min(r, w / 2, h / 2);
        this.moveTo(x + rr, y);
        this.arcTo(x + w, y, x + w, y + h, rr);
        this.arcTo(x + w, y + h, x, y + h, rr);
        this.arcTo(x, y + h, x, y, rr);
        this.arcTo(x, y, x + w, y, rr);
        this.closePath();
      };
    }

    colorsRef.current = readThemeColors();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let raf = 0;
    let settleRaf = 0;
    let running = true;
    let visible = true;
    let lastPaint = 0;
    const start = performance.now();
    const frameIntervalMs = 1000 / 12;

    const currentPhase = () => {
      if (reducedMotion) return 0;
      const elapsed = (performance.now() - start) / 1000;
      return (elapsed % DRIFT_PERIOD_SEC) / DRIFT_PERIOD_SEC;
    };

    const measure = () => {
      const rect = container.getBoundingClientRect();
      // Prefer layout box; fall back to viewport so first paint is never 0×0.
      const cssWidth = Math.max(
        1,
        Math.round(
          rect.width || container.clientWidth || container.offsetWidth || window.innerWidth,
        ),
      );
      const cssHeight = Math.max(
        1,
        Math.round(
          rect.height || container.clientHeight || container.offsetHeight || window.innerHeight,
        ),
      );
      return { cssWidth, cssHeight };
    };

    const draw = (phase: number) => {
      const { cssWidth, cssHeight } = measure();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      const pixelW = Math.max(1, Math.round(cssWidth * dpr));
      const pixelH = Math.max(1, Math.round(cssHeight * dpr));
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      const grid = paintMosaic(ctx, cssWidth, cssHeight, dpr, colorsRef.current, phase);

      container.style.setProperty("--mosaic-pitch", `${grid.cell.toFixed(2)}px`);
      canvas.dataset.mosaicReady = "true";
      canvas.dataset.mosaicColumns = String(grid.columns);
      canvas.dataset.mosaicRows = String(grid.rows);
      canvas.setAttribute("data-mosaic-ready", "true");
    };

    const safeDraw = (phase: number) => {
      try {
        draw(phase);
      } catch (error) {
        // Leave fallback visible; the resize observer or layout rAF may retry.
        console.error("[mosaic-hero] paint failed", error);
        canvas.dataset.mosaicReady = "false";
        canvas.setAttribute("data-mosaic-ready", "false");
      }
    };

    paintApiRef.current = { paint: (phase = 0) => safeDraw(phase) };

    const tick = (now: number) => {
      if (!running) return;
      if (!reducedMotion) {
        raf = requestAnimationFrame(tick);
      }
      if (!visible) return;
      if (!reducedMotion && now - lastPaint < frameIntervalMs) return;

      lastPaint = now;
      safeDraw(currentPhase());
    };

    const restartLoop = () => {
      cancelAnimationFrame(raf);
      if (!reducedMotion && running) {
        raf = requestAnimationFrame(tick);
      } else {
        safeDraw(0);
      }
    };

    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      restartLoop();
    };
    motionQuery.addEventListener("change", onMotionChange);

    const resizeObserver = new ResizeObserver(() => {
      safeDraw(currentPhase());
    });
    resizeObserver.observe(container);

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible && !reducedMotion && running) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(tick);
        } else if (visible && reducedMotion) {
          safeDraw(0);
        }
      },
      { rootMargin: "80px", threshold: 0 },
    );
    intersection.observe(container);

    const themeObserver = new MutationObserver(() => {
      colorsRef.current = readThemeColors();
      safeDraw(currentPhase());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    // Immediate first paint + short rAF settle so late layout still marks ready.
    safeDraw(0);
    settleRaf = requestAnimationFrame(() => {
      if (!running) return;
      if (canvas.dataset.mosaicReady !== "true") {
        safeDraw(0);
      }
      if (!reducedMotion) {
        raf = requestAnimationFrame(tick);
      } else {
        // Second reduced-motion paint after layout settles (Playwright / hydration).
        settleRaf = requestAnimationFrame(() => {
          if (running) safeDraw(0);
        });
      }
    });

    const cleanup = () => {
      running = false;
      paintApiRef.current = null;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(settleRaf);
      motionQuery.removeEventListener("change", onMotionChange);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
    };
    unmountPainterRef.current = cleanup;
    return cleanup;
  };

  // useLayoutEffect for first paint; useEffect as Playwright/hydration backup.
  useLayoutEffect(() => {
    mountPainter();
    return () => {
      unmountPainterRef.current?.();
      unmountPainterRef.current = null;
    };
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas?.dataset.mosaicReady === "true") return;
    // If layout effect missed (rare headless hydration), mount once more.
    mountPainter();
    return () => {
      unmountPainterRef.current?.();
      unmountPainterRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ ["--mosaic-pitch" as string]: "calc(100svh / 37)" }}
    >
      <div className="mosaic-hero-fallback" />
      <canvas
        ref={canvasRef}
        className="mosaic-hero-canvas absolute inset-0 h-full w-full"
        data-mosaic-ready="false"
      />
    </div>
  );
}
