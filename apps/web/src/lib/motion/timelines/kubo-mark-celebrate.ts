"use client";

import { gsap } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

import { KUBO_MARK_SVG_ORIGIN } from "./kubo-mark-idle";

/**
 * One-shot punch + wobble for CTA success (pairs with canvas confetti).
 * Target a dedicated inner layer so idle bob on the parent is not killed.
 */
export function playKuboMarkCelebrate(target: Element): gsap.core.Timeline | null {
  if (prefersReducedMotion()) return null;

  gsap.killTweensOf(target);
  gsap.set(target, {
    svgOrigin: KUBO_MARK_SVG_ORIGIN,
    transformOrigin: "50% 100%",
    force3D: true,
  });

  return gsap
    .timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        gsap.set(target, { scale: 1, rotation: 0, y: 0, clearProps: "transform" });
      },
    })
    .to(target, { scale: 1.12, duration: 0.12, ease: "power2.out" })
    .to(target, { scale: 0.96, rotation: 6, duration: 0.1, ease: "power2.inOut" })
    .to(target, { scale: 1.04, rotation: -5, duration: 0.1, ease: "power2.inOut" })
    .to(target, { scale: 1, rotation: 2, duration: 0.08, ease: "power2.inOut" })
    .to(target, { scale: 1, rotation: 0, duration: 0.16, ease: "power2.out" });
}
