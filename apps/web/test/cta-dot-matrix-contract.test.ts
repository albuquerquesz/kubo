/**
 * Source contracts for the final CTA decorative matrix (spec-mobile-responsiveness).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");

describe("CTA dot-matrix mobile/motion contract", () => {
  test("backdrop gates motion, DPR, reduced-motion, and CSS fallback", () => {
    const backdrop = readFileSync(
      join(root, "src/app/(home)/_components/dot-matrix-backdrop.tsx"),
      "utf8",
    );
    const canvas = readFileSync(
      join(root, "src/app/(home)/_components/dot-matrix-canvas.tsx"),
      "utf8",
    );
    const css = readFileSync(join(root, "src/app/global.css"), "utf8");
    const cta = readFileSync(
      join(root, "src/app/(home)/_components/final-cta-dot-matrix.tsx"),
      "utf8",
    );

    // IntersectionObserver prewarm + in-view gate
    expect(backdrop).toContain("IntersectionObserver");
    expect(backdrop).toContain("VIEW_ROOT_MARGIN");
    expect(backdrop).toContain("isInView");
    expect(backdrop).toContain("dot-matrix-fallback");

    // Reduced motion starts static via useSyncExternalStore server snapshot
    expect(backdrop).toContain("useSyncExternalStore");
    expect(backdrop).toContain("getReducedMotionServerSnapshot");
    expect(backdrop).toContain("return true");

    // Coarse pointer / mobile DPR cap
    expect(backdrop).toContain("pointer: coarse");
    expect(backdrop).toContain("[1, 1]");
    expect(backdrop).toContain("[1, 2]");

    // Canvas: demand frameloop when not animating; never advance u_time offscreen
    expect(canvas).toContain("frameloop={frameloop}");
    expect(canvas).toContain('"never"');
    expect(canvas).toContain("if (reducedMotion || !isInView");
    expect(canvas).toContain("SETTLED_TIME");

    // Decorative + CSS fallback present without layout shift
    expect(css).toContain(".dot-matrix-fallback");
    expect(css).toContain("position: absolute");
    expect(backdrop).toContain('aria-hidden="true"');
    expect(backdrop).toContain("pointer-events-none");
    expect(canvas).toContain('aria-hidden="true"');
    expect(canvas).toContain("pointer-events-none");

    // CTA keeps controls above decorative layers
    expect(cta).toContain("DotMatrixBackdrop");
    expect(cta).toContain("relative z-10");
  });

  test("mobile navigation is safe-area aware and scrollable", () => {
    const header = readFileSync(join(root, "src/components/site/site-header.tsx"), "utf8");
    expect(header).toContain("env(safe-area-inset-top");
    expect(header).toContain("env(safe-area-inset-bottom");
    expect(header).toContain("overscroll-contain");
    expect(header).toContain("overflow-y-auto");
    expect(header).toContain('role="dialog"');
    expect(header).toContain("Escape");
  });
});
