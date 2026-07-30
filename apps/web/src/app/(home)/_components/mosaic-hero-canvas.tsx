"use client";

import { useEffect, useRef, useState } from "react";

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
  /** Luminance bias: cooler bands sit lower; warm cores sit higher. */
  temperature: number;
};

const COLUMNS = 52;
const ROWS = 37;
const SEAM_RATIO = 0.09;
const CORNER_RATIO = 0.13;
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

function buildBands(colors: ThemeColors, phase: number): Band[] {
  // Slow drift: small normalized offsets so the field breathes without flicker.
  const driftX = Math.sin(phase * Math.PI * 2) * 0.02;
  const driftY = Math.cos(phase * Math.PI * 2 * 0.7) * 0.014;

  // Primary ribbon: enters upper-middle-right, bows through center, exits lower-leftish.
  const primaryBand = sampleQuadratic(
    { x: 0.68 + driftX, y: -0.06 },
    { x: 0.52 + driftX * 0.5, y: 0.38 + driftY },
    { x: 0.38 + driftX * 0.3, y: 1.06 },
  );

  // Secondary primary arc for ribbon thickness without a single fat blob.
  const primaryCompanion = sampleQuadratic(
    { x: 0.78 + driftX * 0.4, y: 0.02 },
    { x: 0.62 + driftY, y: 0.5 + driftX * 0.3 },
    { x: 0.48, y: 1.04 },
  );

  // Warm counter-ribbon: far right, brighter cores.
  const warmBand = sampleQuadratic(
    { x: 1.08 + driftX * 0.4, y: -0.02 },
    { x: 0.9 - driftY, y: 0.42 + driftX },
    { x: 0.74 + driftX * 0.25, y: 1.04 },
  );

  const warmCompanion = sampleQuadratic(
    { x: 1.02, y: 0.18 },
    { x: 0.86 + driftX * 0.3, y: 0.58 + driftY },
    { x: 0.78, y: 0.98 },
  );

  const lowerEcho = sampleQuadratic(
    { x: -0.04 + driftX * 0.25, y: 0.94 },
    { x: 0.3 + driftY, y: 0.8 + driftX * 0.15 },
    { x: 0.54, y: 0.64 + driftY },
  );

  const topLeftHaze = sampleQuadratic(
    { x: -0.06, y: -0.04 },
    { x: 0.16 + driftX * 0.35, y: 0.1 },
    { x: 0.3, y: 0.26 + driftY },
  );

  // Warm cores lean toward foreground; primary stays slightly dimmer (luminance split).
  const primaryCore = mix(colors.primary, colors.foreground, 0.42);
  const warmCore = mix(colors.accent, colors.foreground, 0.78);
  const hazeColor = mix(colors.primary, colors.card, 0.3);

  return [
    {
      points: primaryBand,
      width: 0.14,
      coreWidth: 0.045,
      opacity: 0.92,
      coreOpacity: 0.68,
      color: mix(colors.primary, colors.background, 0.02),
      coreColor: primaryCore,
      temperature: 0.38,
    },
    {
      points: primaryCompanion,
      width: 0.11,
      coreWidth: 0.035,
      opacity: 0.72,
      coreOpacity: 0.48,
      color: mix(colors.primary, colors.muted, 0.15),
      coreColor: mix(colors.primary, colors.foreground, 0.3),
      temperature: 0.32,
    },
    {
      points: warmBand,
      width: 0.13,
      coreWidth: 0.04,
      opacity: 0.98,
      coreOpacity: 0.92,
      color: mix(colors.accent, colors.primary, 0.12),
      coreColor: warmCore,
      temperature: 1,
    },
    {
      points: warmCompanion,
      width: 0.1,
      coreWidth: 0.032,
      opacity: 0.78,
      coreOpacity: 0.62,
      color: mix(colors.accent, colors.background, 0.08),
      coreColor: mix(colors.accent, colors.foreground, 0.55),
      temperature: 0.85,
    },
    {
      points: lowerEcho,
      width: 0.16,
      coreWidth: 0.045,
      opacity: 0.48,
      coreOpacity: 0.28,
      color: mix(colors.primary, colors.muted, 0.18),
      coreColor: mix(colors.accent, colors.mutedForeground, 0.3),
      temperature: 0.4,
    },
    {
      points: topLeftHaze,
      width: 0.26,
      coreWidth: 0.09,
      opacity: 0.26,
      coreOpacity: 0.1,
      color: hazeColor,
      coreColor: mix(colors.accent, colors.card, 0.3),
      temperature: 0.5,
    },
  ];
}

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

  // Quiet base: mostly background with faint card lift so seams stay readable.
  let color = mix(colors.background, colors.card, 0.32 + noise * 0.22);

  // Tiny micro-variation so quiet regions are not flat.
  color = mix(color, colors.muted, 0.08 + noise * 0.1);

  for (const band of bands) {
    const d = distanceToPolyline(nx, ny, band.points);
    // Sharper falloff near the path keeps ribbons readable as cell energy.
    const broad = Math.pow(1 - smoothstep(0, band.width, d), 1.15);
    const core = Math.pow(1 - smoothstep(0, band.coreWidth, d), 1.35);
    if (broad <= 0.001) continue;

    const intensity = broad * band.opacity * (0.9 + noise * 0.16);
    const hotness = core * band.coreOpacity * (0.8 + noise * 0.4);

    color = mix(color, band.color, intensity);
    if (hotness > 0.01) {
      color = mix(color, band.coreColor, hotness);
    }

    // Temperature separates gold-only bands via luminance rather than inventing hues.
    if (hotness > 0.15) {
      const lift = hotness * band.temperature * 0.22;
      color = mix(color, colors.foreground, lift);
    }
  }

  // Content-safe darkening for the centered Kubo copy zone; leave right half hot.
  const leftQuiet = 1 - smoothstep(0.12, 0.55, nx);
  const centerQuiet = 1 - smoothstep(0.12, 0.42, Math.hypot((nx - 0.5) * 1.15, (ny - 0.42) * 0.9));
  const quiet = Math.max(leftQuiet * 0.48, centerQuiet * 0.55);
  color = mix(color, colors.background, quiet * 0.62);

  // Soft edge vignette (applied per-cell so the grid remains legible).
  const edge =
    Math.max(
      1 - smoothstep(0, 0.1, nx),
      1 - smoothstep(0, 0.08, 1 - nx),
      1 - smoothstep(0, 0.08, ny),
      1 - smoothstep(0, 0.12, 1 - ny),
    ) * 0.48;
  color = mix(color, colors.background, edge);

  // Quantize slightly so neighboring cells do not smear into a smooth gradient.
  const quant = 12;
  color = {
    r: Math.round(color.r / quant) * quant,
    g: Math.round(color.g / quant) * quant,
    b: Math.round(color.b / quant) * quant,
  };

  return color;
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
  columns: number,
  rows: number,
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // Matte near-black canvas.
  ctx.fillStyle = rgbString(colors.background);
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Cover the frame with near-square cells (overflow clips at container edges).
  // Using max() keeps tiles from stretching while ensuring no empty gutters.
  const cell = Math.max(cssWidth / columns, cssHeight / rows);
  const seam = cell * SEAM_RATIO;
  const radius = cell * CORNER_RATIO;
  const tile = Math.max(1, cell - seam);

  const gridW = columns * cell;
  const gridH = rows * cell;
  const originX = (cssWidth - gridW) / 2;
  const originY = (cssHeight - gridH) / 2;

  const bands = buildBands(colors, phase);

  // Fill seam color once under the tiles for a continuous dark grid.
  ctx.fillStyle = rgbString(mix(colors.background, colors.muted, 0.35));
  ctx.fillRect(originX, originY, gridW, gridH);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = originX + col * cell + seam * 0.5;
      const y = originY + row * cell + seam * 0.5;
      const fill = colorForCell(col, row, columns, rows, colors, bands);
      ctx.fillStyle = rgbString(fill);
      ctx.beginPath();
      ctx.roundRect(x, y, tile, tile, radius);
      ctx.fill();
    }
  }

  // Light global veil — CSS mosaic-hero-veil owns most copy contrast.
  const veil = ctx.createRadialGradient(
    cssWidth * 0.5,
    cssHeight * 0.42,
    cssWidth * 0.1,
    cssWidth * 0.55,
    cssHeight * 0.5,
    cssWidth * 0.82,
  );
  veil.addColorStop(
    0,
    `rgba(${colors.background.r},${colors.background.g},${colors.background.b},0.06)`,
  );
  veil.addColorStop(
    0.55,
    `rgba(${colors.background.r},${colors.background.g},${colors.background.b},0.02)`,
  );
  veil.addColorStop(
    1,
    `rgba(${colors.background.r},${colors.background.g},${colors.background.b},0.28)`,
  );
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Edge vignette overlay.
  const edgeGrad = ctx.createRadialGradient(
    cssWidth * 0.55,
    cssHeight * 0.45,
    cssHeight * 0.22,
    cssWidth * 0.5,
    cssHeight * 0.5,
    Math.max(cssWidth, cssHeight) * 0.78,
  );
  edgeGrad.addColorStop(0, "rgba(0,0,0,0)");
  edgeGrad.addColorStop(0.72, "rgba(0,0,0,0.08)");
  edgeGrad.addColorStop(
    1,
    `rgba(${colors.background.r},${colors.background.g},${colors.background.b},0.58)`,
  );
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, cssWidth, cssHeight);
}

function gridForFrame(cssWidth: number): { columns: number; rows: number } {
  // Keep cell size readable on small screens without dropping the mosaic entirely.
  if (cssWidth < 420) return { columns: 28, rows: 34 };
  if (cssWidth < 768) return { columns: 40, rows: 36 };
  return { columns: COLUMNS, rows: ROWS };
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return reducedMotion;
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
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    colorsRef.current = readThemeColors();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let visible = true;
    let lastPaint = 0;
    const start = performance.now();
    // Slow field drift does not need 60fps; ~12fps keeps cost low.
    const frameIntervalMs = 1000 / 12;

    const draw = (phase: number) => {
      const rect = container.getBoundingClientRect();
      const cssWidth = Math.max(1, Math.round(rect.width));
      const cssHeight = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const { columns, rows } = gridForFrame(cssWidth);

      const pixelW = Math.round(cssWidth * dpr);
      const pixelH = Math.round(cssHeight * dpr);
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
      }

      paintMosaic(ctx, cssWidth, cssHeight, dpr, colorsRef.current, phase, columns, rows);
    };

    const tick = (now: number) => {
      if (!running) return;
      if (!reducedMotion) {
        raf = requestAnimationFrame(tick);
      }
      if (!visible) return;
      if (!reducedMotion && now - lastPaint < frameIntervalMs) return;

      lastPaint = now;
      const elapsed = (now - start) / 1000;
      const phase = reducedMotion ? 0 : (elapsed % DRIFT_PERIOD_SEC) / DRIFT_PERIOD_SEC;
      draw(phase);
    };

    // Resize: re-paint immediately; animation loop continues for live drift.
    const resizeObserver = new ResizeObserver(() => {
      const elapsed = (performance.now() - start) / 1000;
      const phase = reducedMotion ? 0 : (elapsed % DRIFT_PERIOD_SEC) / DRIFT_PERIOD_SEC;
      draw(phase);
    });
    resizeObserver.observe(container);

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible && !reducedMotion && running) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "80px", threshold: 0 },
    );
    intersection.observe(container);

    // Theme token refresh if class/tokens change (e.g. next-themes).
    const themeObserver = new MutationObserver(() => {
      colorsRef.current = readThemeColors();
      const elapsed = (performance.now() - start) / 1000;
      const phase = reducedMotion ? 0 : (elapsed % DRIFT_PERIOD_SEC) / DRIFT_PERIOD_SEC;
      draw(phase);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
    };
  }, [mounted, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* CSS fallback visible before canvas paints and when canvas is unavailable. */}
      <div className="mosaic-hero-fallback" />
      {mounted && (
        <canvas ref={canvasRef} className="mosaic-hero-canvas absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
