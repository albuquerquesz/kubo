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
  const CORNER_RATIO = 0.17;
  const MAX_DPR = 1.5;
  const SEED = 0x6b75626f;

  const FALLBACK = {
    background: "#11110d",
    card: "#181814",
    muted: "#222118",
    foreground: "#f2ede0",
    mutedForeground: "#b0a78d",
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
    const primaryBand = sampleQuadratic(
      { x: 0.92, y: 1.06 },
      { x: 0.56, y: 0.52 },
      { x: 0.34, y: -0.06 },
    );
    const warmBand = sampleQuadratic(
      { x: 1.12, y: 0.88 },
      { x: 0.88, y: 0.42 },
      { x: 0.64, y: -0.04 },
    );
    const lowerEcho = sampleQuadratic(
      { x: 0.78, y: 1.1 },
      { x: 0.52, y: 0.92 },
      { x: 0.22, y: 0.78 },
    );
    const topLeftHaze = sampleQuadratic(
      { x: -0.05, y: -0.04 },
      { x: 0.12, y: 0.08 },
      { x: 0.22, y: 0.22 },
    );

    return [
      {
        points: primaryBand,
        width: 0.09,
        coreWidth: 0.03,
        opacity: 0.84,
        coreOpacity: 0.78,
        color: mix(colors.primary, colors.background, 0.42),
        coreColor: mix(mix(colors.primary, colors.mutedForeground, 0.22), colors.card, 0.18),
        temperature: 0.38,
      },
      {
        points: warmBand,
        width: 0.08,
        coreWidth: 0.028,
        opacity: 0.78,
        coreOpacity: 0.94,
        color: mix(colors.accent, colors.primary, 0.22),
        coreColor: mix(colors.accent, colors.foreground, 0.68),
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
        color: mix(colors.card, colors.background, 0.35),
        coreColor: mix(colors.muted, colors.card, 0.35),
        temperature: 0.22,
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
      const broad = Math.pow(1 - smoothstep(0, band.width, d), 1.12);
      const core = Math.pow(1 - smoothstep(0, band.coreWidth, d), 1.28);
      if (broad <= 0.001) continue;
      const noiseMod = 0.78 + noise * 0.28 + noise2 * 0.08;
      const intensity = broad * band.opacity * noiseMod;
      const hotness = core * band.coreOpacity * (0.72 + noise * 0.48);
      color = mix(color, band.color, intensity);
      if (hotness > 0.01) color = mix(color, band.coreColor, hotness);
      if (hotness > 0.22 && noise > 0.62 && band.temperature > 0.55) {
        color = mix(color, colors.foreground, hotness * band.temperature * 0.2);
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

  function paintOne(canvas) {
    if (!canvas || canvas.dataset.mosaicReactOwned === "true") return false;
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
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";

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

    container.style.setProperty("--mosaic-pitch", cell.toFixed(2) + "px");
    canvas.dataset.mosaicReady = "true";
    canvas.dataset.mosaicColumns = String(columns);
    canvas.dataset.mosaicRows = String(rows);
    canvas.setAttribute("data-mosaic-ready", "true");
    canvas.dataset.mosaicBoot = "true";
    return true;
  }

  function paintAll() {
    const nodes = document.querySelectorAll("canvas.mosaic-hero-canvas");
    let any = false;
    for (let i = 0; i < nodes.length; i++) {
      try {
        if (paintOne(nodes[i])) any = true;
      } catch (_) {
        /* keep fallback */
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

  // Late-inserted canvas (client navigation) — paint when nodes appear.
  if (typeof MutationObserver !== "undefined") {
    const mo = new MutationObserver(function () {
      if (window.__kuboMosaicReactActive) return;
      const pending = document.querySelector(
        'canvas.mosaic-hero-canvas:not([data-mosaic-ready="true"])',
      );
      if (pending) paintAll();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  window.__kuboMosaicPaint = paintAll;
})();
