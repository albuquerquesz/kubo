"use client";

import { gsap } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Bottom-center pivot in KuboMark viewBox (0 0 763 678).
 * Feels like a toy resting on a shelf, not floating from geometric center.
 */
export const KUBO_MARK_SVG_ORIGIN = "381.5 678";

export type KuboMarkIdleHandle = {
  kill: () => void;
  pause: () => void;
  resume: () => void;
};

/**
 * Quiet premium idle: soft bob + micro-tilt on the mark root group.
 * No-ops under prefers-reduced-motion (static rest pose).
 */
export function playKuboMarkIdle(target: Element): KuboMarkIdleHandle {
  const noop: KuboMarkIdleHandle = {
    kill: () => undefined,
    pause: () => undefined,
    resume: () => undefined,
  };

  if (prefersReducedMotion()) return noop;

  gsap.set(target, {
    svgOrigin: KUBO_MARK_SVG_ORIGIN,
    transformOrigin: "50% 100%",
    force3D: true,
  });

  const tl = gsap.timeline({
    repeat: -1,
    defaults: { ease: "sine.inOut" },
  });

  tl.to(target, { y: -4, rotation: 1.6, duration: 1.25 })
    .to(target, { y: 0, rotation: -1.4, duration: 1.25 })
    .to(target, { y: -3, rotation: 0.6, duration: 1.1 })
    .to(target, { y: 0, rotation: 0, duration: 1.1 });

  return {
    kill: () => {
      tl.kill();
      gsap.set(target, { clearProps: "transform" });
    },
    pause: () => {
      tl.pause();
    },
    resume: () => {
      tl.resume();
    },
  };
}
