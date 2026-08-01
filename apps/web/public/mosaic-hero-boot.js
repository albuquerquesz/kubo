/**
 * Hydration-independent mosaic hero first paint.
 * Runs before/without React so Playwright and slow hydrations still get a ready Canvas.
 * React MosaicHeroCanvas re-takes ownership when its layout effect mounts.
 */
(function mosaicHeroBoot() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__kuboMosaicBooted) return;
  window.__kuboMosaicBooted = true;

  const REFERENCE_ROWS = 37;
  const SEAM_RATIO = 0.09;
  const CORNER_RATIO = 0.22;
  const MAX_DPR = 1.5;
  const SEED = 0x6b75626f;

  const FALLBACK = {
    background: "#000000",
    card: "#141414",
    muted: "#1f1f1f",
    foreground: "#f1f1f1",
    mutedForeground: "#a8a8a8",
    primary: "#c49314",
    accent: "#d6a72b",
  };

  function parseCssColor(value, fallback) {
    const raw = (value || fallback).trim();
    const hex = raw.startsWith("#") ? raw : fallback;
    if (/^#([0-9a-f]{3})$/i.test(hex)) {
      const h = hex.slice(1);
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16),
      };
    }
    if (/^#([0-9a-f]{6})$/i.test(hex)) {
      const n = parseInt(hex.slice(1), 16);
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
    return parseCssColor(fallback, FALLBACK.background);
  }

  function mix(a, b, t) {
    const k = Math.min(1, Math.max(0, t));
    return {
      r: Math.round(a.r + (b.r - a.r) * k),
      g: Math.round(a.g + (b.g - a.g) * k),
      b: Math.round(a.b + (b.b - a.b) * k),
    };
  }

  function rgbString(c) {
    return "rgb(" + c.r + " " + c.g + " " + c.b + ")";
  }

  function smoothstep(edge0, edge1, x) {
    if (edge0 === edge1) return x < edge0 ? 0 : 1;
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function cellNoise(col, row) {
    let n = (col * 374761393 + row * 668265263 + SEED) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    n = (n ^ (n >>> 16)) >>> 0;
    return (n & 0xffff) / 0xffff;
  }

  function distPointSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-12) return Math.hypot(px - ax, py - ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.min(1, Math.max(0, t));
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
  }

  function distanceToPolyline(px, py, points) {
    let min = Infinity;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      min = Math.min(min, distPointSegment(px, py, a.x, a.y, b.x, b.y));
    }
    return min;
  }

  function sampleQuadratic(p0, p1, p2, segments) {
    const out = [];
    const segs = segments || 28;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const u = 1 - t;
      out.push({
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
      });
    }
    return out;
  }

  function sampleCubic(p0, p1, p2, p3, segments) {
    const out = [];
    const segs = segments || 36;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
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

  function readThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    const token = (name, fallback) => parseCssColor(styles.getPropertyValue(name), fallback);
    return {
      background: token("--background", FALLBACK.background),
      card: token("--card", FALLBACK.card),
      muted: token("--muted", FALLBACK.muted),
      foreground: token("--foreground", FALLBACK.foreground),
      mutedForeground: token("--muted-foreground", FALLBACK.mutedForeground),
      primary: token("--primary", FALLBACK.primary),
      accent: token("--accent", FALLBACK.accent),
    };
  }

  function resolveGrid(cssWidth, cssHeight) {
    const rows = cssHeight < 520 ? 30 : cssHeight < 720 ? 34 : REFERENCE_ROWS;
    const cell = Math.max(10, cssHeight / rows);
    const columns = Math.max(1, Math.ceil(cssWidth / cell));
    return {
      columns,
      rows,
      cell,
      seam: cell * SEAM_RATIO,
      radius: cell * CORNER_RATIO,
      originX: (cssWidth - columns * cell) / 2,
      originY: (cssHeight - rows * cell) / 2,
    };
  }

  function buildBands(colors) {
    // Six parallel lightning columns — ~0.09 nx gap, frame-centered pack, hairline rails;
    // shallower right-descent (Δx ≈ 0.28); no counter-direction.
    const primaryBand = sampleCubic(
      { x: 0.28, y: -0.1 },
      { x: 0.36, y: 0.22 },
      { x: 0.45, y: 0.55 },
      { x: 0.56, y: 1.02 },
    );
    const midBand = sampleCubic(
      { x: 0.37, y: -0.09 },
      { x: 0.45, y: 0.23 },
      { x: 0.54, y: 0.56 },
      { x: 0.65, y: 1.03 },
    );
    const amberBand = sampleCubic(
      { x: 0.46, y: -0.085 },
      { x: 0.54, y: 0.235 },
      { x: 0.63, y: 0.565 },
      { x: 0.74, y: 1.035 },
    );
    const goldBand = sampleCubic(
      { x: 0.55, y: -0.082 },
      { x: 0.63, y: 0.238 },
      { x: 0.72, y: 0.568 },
      { x: 0.83, y: 1.038 },
    );
    const copperBand = sampleCubic(
      { x: 0.64, y: -0.081 },
      { x: 0.72, y: 0.24 },
      { x: 0.81, y: 0.57 },
      { x: 0.92, y: 1.039 },
    );
    const warmBand = sampleCubic(
      { x: 0.73, y: -0.08 },
      { x: 0.81, y: 0.24 },
      { x: 0.9, y: 0.57 },
      { x: 1.01, y: 1.04 },
    );
    const topLeftHaze = sampleQuadratic(
      { x: -0.12, y: -0.1 },
      { x: 0.1, y: 0.1 },
      { x: 0.24, y: 0.3 },
    );

    return [
      {
        points: primaryBand,
        width: 0.034,
        coreWidth: 0.01,
        opacity: 0.86,
        coreOpacity: 0.72,
        color: mix(colors.primary, colors.background, 0.5),
        coreColor: mix(colors.primary, colors.accent, 0.48),
        hotspot: { x: 0.41, y: 0.48, radiusX: 0.05, radiusY: 0.1 },
      },
      {
        points: midBand,
        width: 0.032,
        coreWidth: 0.01,
        opacity: 0.87,
        coreOpacity: 0.73,
        color: mix(mix(colors.primary, colors.accent, 0.45), colors.background, 0.28),
        coreColor: mix(colors.accent, colors.primary, 0.4),
        hotspot: { x: 0.5, y: 0.49, radiusX: 0.05, radiusY: 0.1 },
      },
      {
        points: amberBand,
        width: 0.031,
        coreWidth: 0.009,
        opacity: 0.88,
        coreOpacity: 0.74,
        color: mix(mix(colors.accent, colors.primary, 0.32), colors.background, 0.22),
        coreColor: mix(colors.accent, colors.primary, 0.28),
        hotspot: { x: 0.59, y: 0.5, radiusX: 0.05, radiusY: 0.1 },
      },
      {
        points: goldBand,
        width: 0.03,
        coreWidth: 0.009,
        opacity: 0.89,
        coreOpacity: 0.76,
        color: mix(mix(colors.accent, colors.primary, 0.25), colors.background, 0.18),
        coreColor: mix(colors.accent, colors.foreground, 0.22),
        hotspot: { x: 0.68, y: 0.5, radiusX: 0.05, radiusY: 0.1 },
      },
      {
        points: copperBand,
        width: 0.029,
        coreWidth: 0.008,
        opacity: 0.895,
        coreOpacity: 0.77,
        color: mix(mix(colors.accent, colors.primary, 0.22), colors.background, 0.16),
        coreColor: mix(colors.accent, colors.foreground, 0.28),
        hotspot: { x: 0.77, y: 0.5, radiusX: 0.05, radiusY: 0.1 },
      },
      {
        points: warmBand,
        width: 0.028,
        coreWidth: 0.008,
        opacity: 0.9,
        coreOpacity: 0.78,
        color: mix(mix(colors.accent, colors.primary, 0.2), colors.background, 0.2),
        coreColor: mix(colors.accent, colors.foreground, 0.36),
        hotspot: { x: 0.86, y: 0.5, radiusX: 0.05, radiusY: 0.1 },
      },
      {
        points: topLeftHaze,
        width: 0.24,
        coreWidth: 0.09,
        opacity: 0.36,
        coreOpacity: 0.14,
        color: mix(mix(colors.muted, colors.accent, 0.14), colors.card, 0.28),
        coreColor: mix(colors.muted, colors.mutedForeground, 0.32),
      },
    ];
  }

  function colorForCell(col, row, columns, rows, colors, bands) {
    const nx = (col + 0.5) / columns;
    const ny = (row + 0.5) / rows;
    const noise = cellNoise(col, row);
    const noise2 = cellNoise(col + 17, row + 31);

    let color = mix(colors.background, colors.card, 0.22 + noise * 0.18);
    color = mix(color, colors.muted, 0.04 + noise2 * 0.06);
    if (noise > 0.88) {
      color = mix(color, colors.muted, 0.05 + (noise - 0.88) * 0.2);
    } else if (noise < 0.12) {
      color = mix(color, colors.background, 0.08 + (0.12 - noise) * 0.15);
    }

    for (let i = 0; i < bands.length; i++) {
      const band = bands[i];
      const d = distanceToPolyline(nx, ny, band.points);
      const broad = Math.pow(1 - smoothstep(0, band.width, d), 0.92);
      const core = Math.pow(1 - smoothstep(0, band.coreWidth, d), 1.15);
      if (broad <= 0.001) continue;
      const noiseMod = 0.74 + noise * 0.32 + noise2 * 0.1;
      const intensity = broad * band.opacity * noiseMod;
      const hotness = core * band.coreOpacity * (0.68 + noise * 0.52);
      color = mix(color, band.color, intensity);
      if (hotness > 0.01) color = mix(color, band.coreColor, hotness);
      if (band.hotspot && hotness > 0.08) {
        const dx = (nx - band.hotspot.x) / band.hotspot.radiusX;
        const dy = (ny - band.hotspot.y) / band.hotspot.radiusY;
        const focus = 1 - smoothstep(0.26, 1, Math.hypot(dx, dy));
        const highlight = hotness * focus * (0.18 + noise * 0.16);
        if (highlight > 0.01) color = mix(color, colors.foreground, highlight);
      }
    }

    const copyPocket = 1 - smoothstep(0.3, 0.4, nx);
    const darkBed = mix(colors.background, colors.card, 0.18 + noise * 0.12);
    color = mix(color, darkBed, copyPocket * 0.72);
    color = mix(color, colors.background, (1 - smoothstep(0, 0.2, nx)) * 0.42);
    const lowerLeftQuiet = (1 - smoothstep(0.06, 0.38, nx)) * (1 - smoothstep(0.4, 0.9, ny)) * 0.48;
    color = mix(color, colors.background, lowerLeftQuiet);

    const edge =
      Math.max(
        1 - smoothstep(0, 0.06, nx),
        (1 - smoothstep(0, 0.05, 1 - nx)) * 0.28,
        1 - smoothstep(0, 0.05, ny),
        1 - smoothstep(0, 0.08, 1 - ny),
      ) * 0.32;
    color = mix(color, colors.background, edge);

    const quant = 10;
    return {
      r: Math.round(color.r / quant) * quant,
      g: Math.round(color.g / quant) * quant,
      b: Math.round(color.b / quant) * quant,
    };
  }

  function ensureRoundRect(ctx) {
    if (typeof ctx.roundRect === "function") return;
    ctx.roundRect = function (x, y, w, h, radii) {
      const r = typeof radii === "number" ? radii : (radii && radii[0]) || 0;
      const rr = Math.min(r, w / 2, h / 2);
      this.moveTo(x + rr, y);
      this.arcTo(x + w, y, x + w, y + h, rr);
      this.arcTo(x + w, y + h, x, y + h, rr);
      this.arcTo(x, y + h, x, y, rr);
      this.arcTo(x, y, x + w, y, rr);
      this.closePath();
    };
  }

  /**
   * Paint only the dedicated boot layer (`.mosaic-hero-boot-canvas`).
   * Never mutate React's `.mosaic-hero-canvas` or its container attributes —
   * that causes hydration mismatches (data-mosaic-ready, --mosaic-pitch, size).
   */
  function paintOne(canvas) {
    if (!canvas || window.__kuboMosaicReactActive) return false;
    // React owns the real mosaic canvas; skip it entirely.
    if (canvas.classList.contains("mosaic-hero-canvas")) return false;
    if (canvas.dataset.mosaicReactOwned === "true") return false;

    const container = canvas.parentElement;
    if (!container) return false;

    const ctx = canvas.getContext("2d", { alpha: true }) || canvas.getContext("2d");
    if (!ctx) return false;
    ensureRoundRect(ctx);

    const rect = container.getBoundingClientRect();
    const cssWidth = Math.max(
      1,
      Math.round(rect.width || container.clientWidth || container.offsetWidth || window.innerWidth),
    );
    const cssHeight = Math.max(
      1,
      Math.round(
        rect.height || container.clientHeight || container.offsetHeight || window.innerHeight,
      ),
    );
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const pixelW = Math.max(1, Math.round(cssWidth * dpr));
    const pixelH = Math.max(1, Math.round(cssHeight * dpr));
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }
    // Do not write inline width/height styles or container CSS variables —
    // those are React-owned on the host. Canvas bitmap size is enough to paint.

    const colors = readThemeColors();
    const grid = resolveGrid(cssWidth, cssHeight);
    const { columns, rows, cell, seam, radius, originX, originY } = grid;
    const tile = Math.max(1, cell - seam);
    const bands = buildBands(colors);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = rgbString(colors.background);
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = rgbString(mix(colors.background, colors.muted, 0.35));
    ctx.fillRect(originX, originY, columns * cell, rows * cell);

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

    canvas.dataset.mosaicBoot = "true";
    canvas.dataset.mosaicBootReady = "true";
    return true;
  }

  function paintAll() {
    if (window.__kuboMosaicReactActive) return false;
    const nodes = document.querySelectorAll("canvas.mosaic-hero-boot-canvas");
    let any = false;
    for (let i = 0; i < nodes.length; i++) {
      try {
        if (paintOne(nodes[i])) any = true;
      } catch {
        /* keep CSS fallback */
      }
    }
    return any;
  }

  function schedule() {
    paintAll();
    requestAnimationFrame(function () {
      paintAll();
      requestAnimationFrame(paintAll);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }

  window.addEventListener("resize", function () {
    if (window.__kuboMosaicReactActive) return;
    paintAll();
  });

  // Late-inserted boot canvas (client navigation) — paint when nodes appear.
  if (typeof MutationObserver !== "undefined") {
    const mo = new MutationObserver(function () {
      if (window.__kuboMosaicReactActive) return;
      const pending = document.querySelector(
        "canvas.mosaic-hero-boot-canvas:not([data-mosaic-boot-ready='true'])",
      );
      if (pending) paintAll();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  window.__kuboMosaicPaint = paintAll;
})();
