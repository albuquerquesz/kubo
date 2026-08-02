import confetti from "canvas-confetti";

import { prefersReducedMotion } from "./reduced-motion";

/** Brand-adjacent palette for the hero install CTA burst. */
const CTA_CONFETTI_COLORS = ["#c49314", "#f5d76e", "#fff7d6", "#e8c547", "#1a1a1a"] as const;

/**
 * Fire a short confetti burst from the center of `anchor` (typically the CTA button).
 * No-ops when the user prefers reduced motion.
 */
export function fireCtaConfetti(anchor: HTMLElement): void {
  if (prefersReducedMotion()) return;
  if (typeof window === "undefined") return;

  const rect = anchor.getBoundingClientRect();
  const origin = {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };

  void confetti({
    particleCount: 72,
    spread: 68,
    startVelocity: 28,
    gravity: 1.05,
    ticks: 140,
    origin,
    colors: [...CTA_CONFETTI_COLORS],
    disableForReducedMotion: true,
    zIndex: 80,
  });
}
