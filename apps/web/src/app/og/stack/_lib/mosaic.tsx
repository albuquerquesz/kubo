import { ogEditorial } from "./colors";

const GRID_SIZE = 42;
const GRID_LINE = "rgba(255,255,255,0.04)";

/** Quiet black grid only — no lit signal pixels. */
export function OgPixelField({ width, height }: { width: number; height: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        width,
        height,
        backgroundColor: ogEditorial.background,
        backgroundImage: [
          `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px)`,
          `linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
        ].join(","),
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
    />
  );
}
