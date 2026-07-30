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
 * Paths keep ≥0.14 nx separation at mid height so dark matrix remains between ribbons.
 */
function buildBands(colors: ThemeColors, phase: number): Band[] {
  const driftX = Math.sin(phase * Math.PI * 2) * 0.018;
  const driftY = Math.cos(phase * Math.PI * 2 * 0.7) * 0.012;

  // Primary ribbon — reverse sweep: lower-right → upper-center/left.
  // Spec anchors: p0=(0.92, 1.06), p1=(0.58, 0.52), p2=(0.34, -0.06)
  const primaryBand = sampleQuadratic(
    { x: 0.92 + driftX, y: 1.06 },
    { x: 0.56 + driftX * 0.4, y: 0.52 + driftY },
    { x: 0.34 + driftX * 0.2, y: -0.06 },
  );

  // Warm companion — further right, same reverse direction, ≥0.14 mid-gap from primary.
  // Spec anchors: p0=(1.12, 0.88), p1=(0.86, 0.42), p2=(0.62, -0.04)
  const warmBand = sampleQuadratic(
    { x: 1.12 + driftX * 0.3, y: 0.88 },
    { x: 0.88 - driftY, y: 0.42 + driftX },
    { x: 0.64 + driftX * 0.15, y: -0.04 },
  );

  // Weak lower echo — ≤~22% of primary weight, not bridging the main pair.
  // Spec anchors: p0=(0.78, 1.10), p1=(0.52, 0.92), p2=(0.22, 0.78)
  const lowerEcho = sampleQuadratic(
    { x: 0.78 + driftX * 0.2, y: 1.1 },
    { x: 0.52 + driftY, y: 0.92 },
    { x: 0.22, y: 0.78 + driftY },
  );

  // Faint top-left haze — almost no primary; below either main ribbon.
  const topLeftHaze = sampleQuadratic(
    { x: -0.05, y: -0.04 },
    { x: 0.12 + driftX * 0.3, y: 0.08 },
    { x: 0.22, y: 0.22 + driftY },
  );

  // Dual temperature: deep/cooler primary vs hotter accent companion (gold-only).
  // Cooler ribbon = primary mixed hard toward background/card; warm = accent path.
  const primaryColor = mix(colors.primary, colors.background, 0.42);
  const primaryCore = mix(mix(colors.primary, colors.mutedForeground, 0.22), colors.card, 0.18);
  const warmColor = mix(colors.accent, colors.primary, 0.22);
  const warmCore = mix(colors.accent, colors.foreground, 0.68);
  const hazeColor = mix(colors.card, colors.background, 0.35);

  return [
    {
      points: primaryBand,
      width: 0.09,
      coreWidth: 0.03,
      opacity: 0.84,
      coreOpacity: 0.78,
      color: primaryColor,
      coreColor: primaryCore,
      temperature: 0.38,
    },
    {
      points: warmBand,
      width: 0.08,
      coreWidth: 0.028,
      opacity: 0.78,
      coreOpacity: 0.94,
      color: warmColor,
      coreColor: warmCore,
      temperature: 1,
    },
    {
      points: lowerEcho,
      width: 0.09,
      coreWidth: 0.028,
      opacity: 0.2,
      coreOpacity: 0.1,
      color: mix(colors.primary, colors.muted, 0.42),
      coreColor: mix(colors.accent, colors.mutedForeground, 0.22),
      temperature: 0.28,
    },
    {
      points: topLeftHaze,
      width: 0.14,
      coreWidth: 0.045,
      opacity: 0.08,
      coreOpacity: 0.03,
      color: hazeColor,
      coreColor: mix(colors.muted, colors.card, 0.35),
      temperature: 0.22,
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
    const broad = Math.pow(1 - smoothstep(0, band.width, d), 1.12);
    const core = Math.pow(1 - smoothstep(0, band.coreWidth, d), 1.28);
    if (broad <= 0.001) continue;

    // Noise modulates intensity inside band influence for smooth cell-by-cell steps.
    const noiseMod = 0.78 + noise * 0.28 + noise2 * 0.08;
    const intensity = broad * band.opacity * noiseMod;
    const hotness = core * band.coreOpacity * (0.72 + noise * 0.48);

    color = mix(color, band.color, intensity);
    if (hotness > 0.01) {
      color = mix(color, band.coreColor, hotness);
    }
    // Sparse pale hot cores only on strong cores — never a uniform gold wall.
    if (hotness > 0.22 && noise > 0.62 && band.temperature > 0.55) {
      color = mix(color, colors.foreground, hotness * band.temperature * 0.2);
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
      <canvas
        ref={canvasRef}
        className="mosaic-hero-canvas absolute inset-0 h-full w-full"
        data-mosaic-ready="false"
      />
    </div>
  );
}
