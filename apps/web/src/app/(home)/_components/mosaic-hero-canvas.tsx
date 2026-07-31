"use client";

import { useLayoutEffect, useRef } from "react";

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
  /** A localized pale core prevents a continuous, evenly-lit rail. */
  hotspot?: { x: number; y: number; radiusX: number; radiusY: number };
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

const REFERENCE_ROWS = 37;
/** 9% of pitch — narrow dark seam between opaque cells. */
const SEAM_RATIO = 0.09;
/** 17% of pitch — softer corners than graph-paper squares, still clearly square. */
const CORNER_RATIO = 0.17;
const MAX_DPR = 1.5;
const DRIFT_PERIOD_SEC = 18;
const SEED = 0x6b75626f; // "kubo"

const FALLBACK_HEX = {
  background: "#11110d",
  card: "#181814",
  muted: "#222118",
  foreground: "#f2ede0",
  mutedForeground: "#b0a78d",
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
 * At the reference aspect this resolves near 52×37; wider frames add columns.
 */
function resolveGrid(cssWidth: number, cssHeight: number): GridGeometry {
  const rows = cssHeight < 520 ? 30 : cssHeight < 720 ? 34 : REFERENCE_ROWS;
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
 * Five parallel gold lightning columns (same right-descending curvature × Kubo tokens).
 * Bronze leading + mid + amber + gold + warm outer; dark troughs between cores.
 * Gold-only separation via luminance, opacity, and curve — no cyan/red.
 */
function buildBands(colors: ThemeColors, phase: number): Band[] {
  const driftX = Math.sin(phase * Math.PI * 2) * 0.018;
  const driftY = Math.cos(phase * Math.PI * 2 * 0.7) * 0.012;

  // Five parallel lightning columns — ~0.18 nx spacing, centered pack, thinner rails.
  // Primary (left column).
  const primaryBand = sampleCubic(
    { x: 0.22 + driftX * 0.2, y: -0.1 },
    { x: 0.36 + driftX, y: 0.22 + driftY },
    { x: 0.52 + driftX * 0.25, y: 0.55 },
    { x: 0.7 + driftX * 0.1, y: 1.02 },
  );

  // Inner mid column.
  const midBand = sampleCubic(
    { x: 0.4 + driftX * 0.18, y: -0.09 },
    { x: 0.54 + driftX * 0.6, y: 0.23 + driftY * 0.5 },
    { x: 0.7 + driftX * 0.15, y: 0.56 },
    { x: 0.88 + driftX * 0.1, y: 1.03 },
  );

  // Amber mid column.
  const amberBand = sampleCubic(
    { x: 0.58 + driftX * 0.16, y: -0.085 },
    { x: 0.72 + driftX * 0.5, y: 0.235 + driftY * 0.4 },
    { x: 0.88 + driftX * 0.12, y: 0.565 },
    { x: 1.06 + driftX * 0.1, y: 1.035 },
  );

  // Gold column — fifth rail between amber and warm.
  const goldBand = sampleCubic(
    { x: 0.76 + driftX * 0.15, y: -0.082 },
    { x: 0.9 + driftX * 0.45, y: 0.238 + driftY * 0.35 },
    { x: 1.06 + driftX * 0.11, y: 0.568 },
    { x: 1.24 + driftX * 0.1, y: 1.038 },
  );

  // Warm (right column) — outer of the centered pack.
  const warmBand = sampleCubic(
    { x: 0.94 + driftX * 0.15, y: -0.08 },
    { x: 1.08 - driftY * 0.2, y: 0.24 + driftX },
    { x: 1.24 + driftX * 0.1, y: 0.57 },
    { x: 1.42 + driftX * 0.1, y: 1.04 },
  );

  // Top-left warm haze — non-focal cloud only (no counter-direction lightning).
  const topLeftHaze = sampleQuadratic(
    { x: -0.12, y: -0.1 },
    { x: 0.1 + driftX * 0.2, y: 0.1 },
    { x: 0.24, y: 0.3 + driftY },
  );

  // Gold-only five-step temperature: bronze → mid → amber → gold → warm outer.
  const primaryColor = mix(colors.primary, colors.background, 0.5);
  const primaryCore = mix(colors.primary, colors.accent, 0.48);
  const midColor = mix(mix(colors.primary, colors.accent, 0.45), colors.background, 0.28);
  const midCore = mix(colors.accent, colors.primary, 0.4);
  const amberColor = mix(mix(colors.accent, colors.primary, 0.32), colors.background, 0.22);
  const amberCore = mix(colors.accent, colors.primary, 0.28);
  const goldColor = mix(mix(colors.accent, colors.primary, 0.25), colors.background, 0.18);
  const goldCore = mix(colors.accent, colors.foreground, 0.22);
  const warmColor = mix(mix(colors.accent, colors.primary, 0.2), colors.background, 0.2);
  const warmCore = mix(colors.accent, colors.foreground, 0.36);
  // Warm-leaning haze (tiny accent tick) without flooding primary gold.
  const hazeColor = mix(mix(colors.muted, colors.accent, 0.14), colors.card, 0.28);

  return [
    {
      points: primaryBand,
      width: 0.062,
      coreWidth: 0.018,
      opacity: 0.86,
      coreOpacity: 0.72,
      color: primaryColor,
      coreColor: primaryCore,
      hotspot: { x: 0.46, y: 0.48, radiusX: 0.08, radiusY: 0.14 },
    },
    {
      points: midBand,
      width: 0.06,
      coreWidth: 0.017,
      opacity: 0.87,
      coreOpacity: 0.73,
      color: midColor,
      coreColor: midCore,
      hotspot: { x: 0.64, y: 0.49, radiusX: 0.08, radiusY: 0.14 },
    },
    {
      points: amberBand,
      width: 0.058,
      coreWidth: 0.016,
      opacity: 0.88,
      coreOpacity: 0.74,
      color: amberColor,
      coreColor: amberCore,
      hotspot: { x: 0.82, y: 0.5, radiusX: 0.08, radiusY: 0.14 },
    },
    {
      points: goldBand,
      width: 0.056,
      coreWidth: 0.016,
      opacity: 0.89,
      coreOpacity: 0.76,
      color: goldColor,
      coreColor: goldCore,
      hotspot: { x: 1.0, y: 0.5, radiusX: 0.08, radiusY: 0.14 },
    },
    {
      points: warmBand,
      width: 0.055,
      coreWidth: 0.015,
      opacity: 0.9,
      coreOpacity: 0.78,
      color: warmColor,
      coreColor: warmCore,
      hotspot: { x: 1.18, y: 0.5, radiusX: 0.08, radiusY: 0.14 },
    },
    {
      points: topLeftHaze,
      width: 0.24,
      coreWidth: 0.09,
      opacity: 0.36,
      coreOpacity: 0.14,
      color: hazeColor,
      coreColor: mix(colors.muted, colors.mutedForeground, 0.32),
    },
  ];
}

/**
 * Per-cell palette: dark matrix default; luminous cells only under band influence.
 * Sequence: quiet base → muted tick → bands → copy pocket → vignette → quantize.
 * Flat fill only — no radial edge halo, continuous right-side olive wash, or per-cell bevel.
 */
function colorForCell(
  col: number,
  row: number,
  columns: number,
  rows: number,
  colors: ThemeColors,
  bands: Band[],
): Rgb {
  const nx = (col + 0.5) / columns;
  const ny = (row + 0.5) / rows;
  const noise = cellNoise(col, row);
  // Secondary deterministic hash for multi-axis tile variation without extra allocations.
  const noise2 = cellNoise(col + 17, row + 31);

  // Quiet matrix — near background/card with only a tiny luminance tick so seams read.
  let color = mix(colors.background, colors.card, 0.22 + noise * 0.18);
  color = mix(color, colors.muted, 0.04 + noise2 * 0.06);
  // ± tiny global noise outside bands (grid readability without olive wash).
  if (noise > 0.88) {
    color = mix(color, colors.muted, 0.05 + (noise - 0.88) * 0.2);
  } else if (noise < 0.12) {
    color = mix(color, colors.background, 0.08 + (0.12 - noise) * 0.15);
  }

  for (const band of bands) {
    const d = distanceToPolyline(nx, ny, band.points);
    // Softer falloff exponents → more intermediate cells across the mass (structure match).
    const broad = Math.pow(1 - smoothstep(0, band.width, d), 0.92);
    const core = Math.pow(1 - smoothstep(0, band.coreWidth, d), 1.15);
    if (broad <= 0.001) continue;

    // Noise modulates intensity inside band influence for smooth cell-by-cell steps.
    const noiseMod = 0.74 + noise * 0.32 + noise2 * 0.1;
    const intensity = broad * band.opacity * noiseMod;
    const hotness = core * band.coreOpacity * (0.68 + noise * 0.52);

    color = mix(color, band.color, intensity);
    if (hotness > 0.01) {
      color = mix(color, band.coreColor, hotness);
    }
    // Pale cells appear only at the localized overlap/focal points, never as rails.
    if (band.hotspot && hotness > 0.08) {
      const dx = (nx - band.hotspot.x) / band.hotspot.radiusX;
      const dy = (ny - band.hotspot.y) / band.hotspot.radiusY;
      const focus = 1 - smoothstep(0.26, 1, Math.hypot(dx, dy));
      const highlight = hotness * focus * (0.18 + noise * 0.16);
      if (highlight > 0.01) color = mix(color, colors.foreground, highlight);
    }
  }

  // Copy pocket ~first 32–40%: charcoal/dark tiles, faint grid only.
  const copyPocket = 1 - smoothstep(0.3, 0.4, nx);
  const darkBed = mix(colors.background, colors.card, 0.18 + noise * 0.12);
  color = mix(color, darkBed, copyPocket * 0.72);
  const farLeft = 1 - smoothstep(0, 0.2, nx);
  color = mix(color, colors.background, farLeft * 0.42);
  // Lower-left tuck under the title block.
  const lowerLeftQuiet = (1 - smoothstep(0.06, 0.38, nx)) * (1 - smoothstep(0.4, 0.9, ny)) * 0.48;
  color = mix(color, colors.background, lowerLeftQuiet);

  // Soft edge vignette — right edge less crushed so ribbon energy survives.
  const edge =
    Math.max(
      1 - smoothstep(0, 0.06, nx),
      (1 - smoothstep(0, 0.05, 1 - nx)) * 0.28,
      1 - smoothstep(0, 0.05, ny),
      1 - smoothstep(0, 0.08, 1 - ny),
    ) * 0.32;
  color = mix(color, colors.background, edge);

  // Quantize 8–12 RGB units so bands read as tile-level lightning, not smooth blur.
  const quant = 10;
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

  ctx.fillStyle = rgbString(colors.background);
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const grid = resolveGrid(cssWidth, cssHeight);
  const { columns, rows, cell, seam, radius, originX, originY } = grid;
  const tile = Math.max(1, cell - seam);
  const bands = buildBands(colors, phase);

  // Dark seam field under opaque rounded-square cells.
  ctx.fillStyle = rgbString(mix(colors.background, colors.muted, 0.35));
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
  // Keep this weak so the tile bed survives under headline/paragraph.
  const veil = ctx.createRadialGradient(
    cssWidth * 0.28,
    cssHeight * 0.72,
    cssWidth * 0.08,
    cssWidth * 0.55,
    cssHeight * 0.5,
    cssWidth * 0.85,
  );
  veil.addColorStop(
    0,
    `rgba(${colors.background.r},${colors.background.g},${colors.background.b},0.12)`,
  );
  veil.addColorStop(
    0.5,
    `rgba(${colors.background.r},${colors.background.g},${colors.background.b},0.02)`,
  );
  veil.addColorStop(
    1,
    `rgba(${colors.background.r},${colors.background.g},${colors.background.b},0.1)`,
  );
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const edgeGrad = ctx.createRadialGradient(
    cssWidth * 0.68,
    cssHeight * 0.4,
    cssHeight * 0.18,
    cssWidth * 0.5,
    cssHeight * 0.5,
    Math.max(cssWidth, cssHeight) * 0.8,
  );
  edgeGrad.addColorStop(0, "rgba(0,0,0,0)");
  edgeGrad.addColorStop(0.78, "rgba(0,0,0,0.04)");
  edgeGrad.addColorStop(
    1,
    `rgba(${colors.background.r},${colors.background.g},${colors.background.b},0.36)`,
  );
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  return grid;
}

/**
 * Dark mosaic hero atmosphere: rounded-square pixel field with curved
 * luminous bands, content-safe negative space, and Kubo theme tokens.
 * Canvas-only artwork — keep interactive content in a sibling layer.
 */
export default function MosaicHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<ThemeColors>(readThemeColors());

  // useLayoutEffect: claim ownership after optional mosaic-hero-boot.js first paint.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Signal the public boot script to stop resizing/painting this canvas.
    (window as Window & { __kuboMosaicReactActive?: boolean }).__kuboMosaicReactActive = true;
    canvas.dataset.mosaicReactOwned = "true";

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
    let bootRaf = 0;
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
      } catch {
        // Leave fallback visible; ResizeObserver / boot rAF may retry.
        canvas.dataset.mosaicReady = "false";
        canvas.setAttribute("data-mosaic-ready", "false");
      }
    };

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

    // Immediate first paint + short rAF boot so late layout still marks ready.
    safeDraw(0);
    bootRaf = requestAnimationFrame(() => {
      if (!running) return;
      if (canvas.dataset.mosaicReady !== "true") {
        safeDraw(0);
      }
      if (!reducedMotion) {
        raf = requestAnimationFrame(tick);
      } else {
        // Second reduced-motion paint after layout settles (Playwright / hydration).
        bootRaf = requestAnimationFrame(() => {
          if (running) safeDraw(0);
        });
      }
    });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(bootRaf);
      motionQuery.removeEventListener("change", onMotionChange);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      delete canvas.dataset.mosaicReactOwned;
      const w = window as Window & { __kuboMosaicReactActive?: boolean };
      w.__kuboMosaicReactActive = false;
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
      {/*
        Boot layer: mosaic-hero-boot.js paints here only. Attributes may diverge
        from SSR before hydration; suppressHydrationWarning is scoped to this
        explicit pre-React surface (not the React-owned mosaic canvas below).
      */}
      <canvas
        className="mosaic-hero-boot-canvas absolute inset-0 h-full w-full"
        aria-hidden="true"
        suppressHydrationWarning
      />
      <canvas
        ref={canvasRef}
        className="mosaic-hero-canvas absolute inset-0 h-full w-full"
        data-mosaic-ready="false"
      />
    </div>
  );
}
