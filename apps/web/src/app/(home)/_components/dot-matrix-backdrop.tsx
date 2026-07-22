"use client";

import { useEffect, useState } from "react";

import DotMatrixCanvas from "./dot-matrix-canvas";

export default function DotMatrixBackdrop() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <DotMatrixCanvas reducedMotion={reducedMotion} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, #050505 0%, transparent 100%), linear-gradient(to top, #050505, transparent)",
        }}
      />
    </div>
  );
}
