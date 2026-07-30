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
  /** Luminance bias: cooler bands sit lower; warm cores sit higher. */
  temperature: number;
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
/** 7–10% of pitch — narrow dark seam between opaque cells. */
const SEAM_RATIO = 0.09;
/** 16–18% of pitch — softer corners than graph-paper squares, still clearly square. */
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
 * Directional luminous bands: enter lower-right / right and bend up-left.
 * Paths keep ≥0.12 nx separation at mid height so they never form a mid-field eye/bridge.
 */
function buildBands(colors: ThemeColors, phase: number): Band[] {
  const driftX = Math.sin(phase * Math.PI * 2) * 0.018;
  const driftY = Math.cos(phase * Math.PI * 2 * 0.7) * 0.012;

  // Primary ribbon — reverse sweep: lower-right → upper-center/left.
  // Spec anchors: p0=(0.92, 1.06), p1=(0.58, 0.52), p2=(0.34, -0.06)
  const primaryBand = sampleQuadratic(
    { x: 0.92 + driftX, y: 1.06 },
    { x: 0.58 + driftX * 0.4, y: 0.52 + driftY },
    { x: 0.34 + driftX * 0.2, y: -0.06 },
  );

  // Warm companion — further right, same reverse direction, ≥0.12 mid-gap from primary.
  // Spec anchors: p0=(1.12, 0.88), p1=(0.86, 0.42), p2=(0.62, -0.04)
  const warmBand = sampleQuadratic(
    { x: 1.12 + driftX * 0.3, y: 0.88 },
    { x: 0.86 - driftY, y: 0.42 + driftX },
    { x: 0.62 + driftX * 0.15, y: -0.04 },
  );

  // Weak lower echo — ≤~35% of primary opacity, not bridging the primary pair.
  // Spec anchors: p0=(0.78, 1.10), p1=(0.52, 0.92), p2=(0.22, 0.78)
  const lowerEcho = sampleQuadratic(
    { x: 0.78 + driftX * 0.2, y: 1.1 },
    { x: 0.52 + driftY, y: 0.92 },
    { x: 0.22, y: 0.78 + driftY },
  );

  // Faint top-left haze — below the visual weight of either main ribbon.
  const topLeftHaze = sampleQuadratic(
    { x: -0.05, y: -0.04 },
    { x: 0.12 + driftX * 0.3, y: 0.08 },
    { x: 0.22, y: 0.22 + driftY },
  );

  // Primary: deeper amber/olive-gold. Warm: lighter yellow core temperature.
  const primaryColor = mix(colors.primary, colors.background, 0.12);
  const primaryCore = mix(colors.primary, colors.foreground, 0.55);
  const warmColor = mix(colors.accent, colors.primary, 0.35);
  const warmCore = mix(colors.accent, colors.foreground, 0.72);
  const hazeColor = mix(colors.primary, colors.card, 0.28);

  return [
    {
      points: primaryBand,
      width: 0.13,
      coreWidth: 0.042,
      opacity: 1,
      coreOpacity: 0.72,
      color: primaryColor,
      coreColor: primaryCore,
      temperature: 0.42,
    },
    {
      points: warmBand,
      width: 0.12,
      coreWidth: 0.04,
      opacity: 1,
      coreOpacity: 0.92,
      color: warmColor,
      coreColor: warmCore,
      temperature: 1,
    },
    {
      points: lowerEcho,
      width: 0.11,
      coreWidth: 0.035,
      opacity: 0.32,
      coreOpacity: 0.16,
      color: mix(colors.primary, colors.muted, 0.28),
      coreColor: mix(colors.accent, colors.mutedForeground, 0.28),
      temperature: 0.32,
    },
    {
      points: topLeftHaze,
      width: 0.18,
      coreWidth: 0.06,
      opacity: 0.14,
      coreOpacity: 0.05,
      color: hazeColor,
      coreColor: mix(colors.accent, colors.card, 0.28),
      temperature: 0.35,
    },
  ];
}

/**
 * Per-cell palette: continuous quiet yellow/olive bed + band cores.
 * Sequence: base → muted lift → olive field → bands → copy pocket → vignette → quantize.
 * Flat fill only — no radial edge halo or per-cell bevel.
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

  // Opaque base cell — card/muted lift so seams read against a real tile bed.
  let color = mix(colors.background, colors.card, 0.3 + noise * 0.18);
  color = mix(color, colors.muted, 0.08 + noise * 0.1);

  // Quiet olive-gold field outside ribbons (prevents large black voids).
  // deep olive-gold ≈ mix(background, primary, .20–.35); mid gold for right shoulders.
  const deepOlive = mix(colors.background, colors.primary, 0.22 + noise2 * 0.13);
  const midGold = mix(colors.card, colors.primary, 0.38 + noise * 0.2);
  // Right 60–70% carries continuous distinguishable tile variation.
  const rightField = smoothstep(0.28, 0.75, nx);
  const midY = 1 - Math.min(1, Math.abs(ny - 0.48) * 2);
  const midLift = smoothstep(0.2, 0.58, nx) * (0.55 + midY * 0.45);
  color = mix(color, deepOlive, 0.42 + noise * 0.22 + rightField * 0.18);
  color = mix(color, midGold, rightField * (0.16 + noise2 * 0.14) + midLift * 0.1);
  // Sparse warm freckles so quiet regions still reveal the grid at 100% zoom.
  if (noise > 0.72 && rightField > 0.15) {
    color = mix(color, mix(colors.primary, colors.accent, 0.4), (noise - 0.72) * 0.55);
  }

  for (const band of bands) {
    const d = distanceToPolyline(nx, ny, band.points);
    const broad = Math.pow(1 - smoothstep(0, band.width, d), 1.08);
    const core = Math.pow(1 - smoothstep(0, band.coreWidth, d), 1.22);
    if (broad <= 0.001) continue;

    const intensity = broad * band.opacity * (0.9 + noise * 0.16);
    const hotness = core * band.coreOpacity * (0.82 + noise * 0.4);

    color = mix(color, band.color, intensity);
    if (hotness > 0.01) {
      color = mix(color, band.coreColor, hotness);
    }
    // Sparse pale hot cores only — not a uniformly bright gold screen.
    if (hotness > 0.18 && noise > 0.55) {
      color = mix(color, colors.foreground, hotness * band.temperature * 0.22);
    }
  }

  // Copy pocket across ~first 28–34%: dark olive/charcoal tiles, not blank unpainted layer.
  const copyPocket = 1 - smoothstep(0.28, 0.36, nx);
  const darkOlive = mix(colors.background, colors.card, 0.38 + noise * 0.16);
  color = mix(color, darkOlive, copyPocket * 0.58);
  // Extra crush only on the far-left strip so headline contrast survives.
  const farLeft = 1 - smoothstep(0, 0.18, nx);
  color = mix(color, colors.background, farLeft * 0.32);
  // Mild lower-left tuck under the title block without erasing the bed.
  const lowerLeftQuiet = (1 - smoothstep(0.08, 0.4, nx)) * (1 - smoothstep(0.42, 0.88, ny)) * 0.42;
  color = mix(color, colors.background, lowerLeftQuiet);

  // Soft edge vignette — right edge less crushed so energy survives.
  const edge =
    Math.max(
      1 - smoothstep(0, 0.06, nx),
      (1 - smoothstep(0, 0.05, 1 - nx)) * 0.32,
      1 - smoothstep(0, 0.05, ny),
      1 - smoothstep(0, 0.08, 1 - ny),
    ) * 0.28;
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

  // useLayoutEffect: first paint before paint flush so captures rarely see fallback alone.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // alpha:true so the denser CSS fallback remains visible until first paint.
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    colorsRef.current = readThemeColors();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let raf = 0;
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
      const cssWidth = Math.max(
        1,
        Math.round(rect.width || container.offsetWidth || window.innerWidth),
      );
      const cssHeight = Math.max(
        1,
        Math.round(rect.height || container.offsetHeight || window.innerHeight),
      );
      return { cssWidth, cssHeight };
    };

    const draw = (phase: number) => {
      const { cssWidth, cssHeight } = measure();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      const pixelW = Math.round(cssWidth * dpr);
      const pixelH = Math.round(cssHeight * dpr);
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
    };

    const tick = (now: number) => {
      if (!running) return;
      if (!reducedMotion) {
        raf = requestAnimationFrame(tick);
      }
      if (!visible) return;
      if (!reducedMotion && now - lastPaint < frameIntervalMs) return;

      lastPaint = now;
      draw(currentPhase());
    };

    const restartLoop = () => {
      cancelAnimationFrame(raf);
      if (!reducedMotion && running) {
        raf = requestAnimationFrame(tick);
      } else {
        draw(0);
      }
    };

    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      restartLoop();
    };
    motionQuery.addEventListener("change", onMotionChange);

    const resizeObserver = new ResizeObserver(() => {
      draw(currentPhase());
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

    const themeObserver = new MutationObserver(() => {
      colorsRef.current = readThemeColors();
      draw(currentPhase());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    // Immediate first paint; ResizeObserver covers late size resolution.
    draw(0);
    if (!reducedMotion) {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      motionQuery.removeEventListener("change", onMotionChange);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
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
