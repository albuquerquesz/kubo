import { mixHex, ogEditorial } from "./colors";

const COLS = 24;
const ROWS = 13;

function hash01(col: number, row: number): number {
  const n = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Approximate distance from point to a quadratic bezier (sampled). */
function distanceToBand(
  x: number,
  y: number,
  ax: number,
  ay: number,
  cx: number,
  cy: number,
  bx: number,
  by: number,
): number {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const u = 1 - t;
    const px = u * u * ax + 2 * u * t * cx + t * t * bx;
    const py = u * u * ay + 2 * u * t * cy + t * t * by;
    const d = Math.hypot(x - px, y - py);
    if (d < min) min = d;
  }
  return min;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function tileColor(col: number, row: number): string {
  const x = col / (COLS - 1);
  const y = row / (ROWS - 1);
  const noise = hash01(col, row);

  // Primary ribbon: enters upper-right, bends through center, exits lower-middle.
  const dPrimary = distanceToBand(x, y, 0.72, -0.05, 0.55, 0.45, 0.38, 1.05);
  const primaryBroad = smoothstep(0.32, 0.0, dPrimary) * 0.72;
  const primaryCore = smoothstep(0.14, 0.0, dPrimary) * 0.85;

  // Accent counter-ribbon on the right half.
  const dAccent = distanceToBand(x, y, 1.05, 0.15, 0.88, 0.5, 0.7, 1.05);
  const accentBroad = smoothstep(0.26, 0.0, dAccent) * 0.62;
  const accentCore = smoothstep(0.1, 0.0, dAccent) * 0.8;

  // Weaker lower echo for depth behind copy.
  const dEcho = distanceToBand(x, y, -0.05, 0.85, 0.35, 0.78, 0.62, 1.1);
  const echo = smoothstep(0.22, 0.0, dEcho) * 0.32;

  // Quiet left / copy-safe: suppress energy when x is low.
  const leftQuiet = smoothstep(0.48, 0.1, x);

  let color = mixHex(ogEditorial.background, ogEditorial.card, 0.45 + noise * 0.3);
  color = mixHex(color, ogEditorial.muted, 0.12 + noise * 0.22);
  color = mixHex(color, ogEditorial.primary, primaryBroad * leftQuiet);
  color = mixHex(color, ogEditorial.accent, accentBroad * leftQuiet * 0.95);
  color = mixHex(color, ogEditorial.primary, echo * leftQuiet * 0.75);
  color = mixHex(color, ogEditorial.foreground, primaryCore * leftQuiet * 0.28);
  color = mixHex(color, ogEditorial.foreground, accentCore * leftQuiet * 0.22);

  // Soft edge vignette toward black.
  const vignette = Math.max(
    smoothstep(0.12, 0.0, x),
    smoothstep(0.12, 0.0, 1 - x),
    smoothstep(0.14, 0.0, y),
    smoothstep(0.14, 0.0, 1 - y),
  );
  return mixHex(color, ogEditorial.background, vignette * 0.55);
}

export function OgMosaicField({ width, height }: { width: number; height: number }) {
  const seam = 0.1;
  const cellW = width / COLS;
  const cellH = height / ROWS;
  const insetX = cellW * seam * 0.5;
  const insetY = cellH * seam * 0.5;
  const radius = Math.min(cellW, cellH) * 0.14;

  const tiles: { key: string; left: number; top: number; w: number; h: number; color: string }[] =
    [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      tiles.push({
        key: `${col}-${row}`,
        left: col * cellW + insetX,
        top: row * cellH + insetY,
        w: cellW - insetX * 2,
        h: cellH - insetY * 2,
        color: tileColor(col, row),
      });
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        width,
        height,
        background: ogEditorial.background,
      }}
    >
      {tiles.map((tile) => (
        <div
          key={tile.key}
          style={{
            position: "absolute",
            left: tile.left,
            top: tile.top,
            width: tile.w,
            height: tile.h,
            borderRadius: radius,
            background: tile.color,
            display: "flex",
          }}
        />
      ))}
    </div>
  );
}
