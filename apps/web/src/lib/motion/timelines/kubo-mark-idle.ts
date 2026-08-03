"use client";

import { gsap } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

import { KUBO_MARK_HIP_CENTER, KUBO_MARK_HIP_LEFT, KUBO_MARK_HIP_RIGHT } from "./kubo-mark-paths";

/**
 * Bottom-center pivot in KuboMark viewBox (0 0 763 678).
 * Celebrate / rest feel: toy on a shelf, not floating from geometric center.
 */
export const KUBO_MARK_SVG_ORIGIN = "381.5 678";

export type KuboMarkIdleTargets = {
  /** Optional soft vertical bob on the whole rig. */
  root?: Element | null;
  body: Element;
  legLeft: Element;
  legRight: Element;
};

export type KuboMarkIdleHandle = {
  kill: () => void;
  pause: () => void;
  resume: () => void;
};

const noop: KuboMarkIdleHandle = {
  kill: () => undefined,
  pause: () => undefined,
  resume: () => undefined,
};

/**
 * Mode A walk idle: simultaneous body sway + alternating leg pivots from the hip.
 * No-ops under prefers-reduced-motion (static rest pose).
 */
export function playKuboMarkIdle(targets: KuboMarkIdleTargets): KuboMarkIdleHandle {
  if (prefersReducedMotion()) return noop;

  const { root, body, legLeft, legRight } = targets;
  if (!body || !legLeft || !legRight) return noop;

  const parts = [body, legLeft, legRight, root].filter(Boolean) as Element[];

  gsap.set(body, {
    svgOrigin: KUBO_MARK_HIP_CENTER,
    transformOrigin: "50% 100%",
    force3D: true,
    rotation: 0,
    y: 0,
    x: 0,
  });
  gsap.set(legLeft, {
    svgOrigin: KUBO_MARK_HIP_LEFT,
    transformOrigin: "50% 0%",
    force3D: true,
    rotation: 0,
    scaleY: 1,
  });
  gsap.set(legRight, {
    svgOrigin: KUBO_MARK_HIP_RIGHT,
    transformOrigin: "50% 0%",
    force3D: true,
    rotation: 0,
    scaleY: 1,
  });
  if (root) {
    gsap.set(root, {
      svgOrigin: KUBO_MARK_SVG_ORIGIN,
      transformOrigin: "50% 100%",
      force3D: true,
      y: 0,
    });
  }

  const step = 0.4;
  const pass = 0.2;
  const rest = 0.3;
  const ease = "power2.inOut";

  const tl = gsap.timeline({
    repeat: -1,
    defaults: { ease },
  });

  // Step A — left forward, right plant (slight scaleY for weight)
  tl.to(legLeft, { rotation: 10, duration: step }, 0)
    .to(legRight, { rotation: -8, scaleY: 1.04, duration: step }, "<")
    .to(body, { rotation: -2.5, y: -3, x: 2, duration: step }, "<");

  if (root) {
    tl.to(root, { y: -2, duration: step }, "<");
  }

  // Pass mid — legs cross near neutral
  tl.to(legLeft, { rotation: 0, duration: pass })
    .to(legRight, { rotation: 0, scaleY: 1, duration: pass }, "<")
    .to(body, { rotation: 0, y: -1, x: 0, duration: pass }, "<");

  if (root) {
    tl.to(root, { y: 0, duration: pass }, "<");
  }

  // Step B — right forward, left plant
  tl.to(legLeft, { rotation: -8, scaleY: 1.04, duration: step })
    .to(legRight, { rotation: 10, scaleY: 1, duration: step }, "<")
    .to(body, { rotation: 2.5, y: -3, x: -2, duration: step }, "<");

  if (root) {
    tl.to(root, { y: -2, duration: step }, "<");
  }

  // Return to rest (hold polish before loop)
  tl.to(legLeft, { rotation: 0, scaleY: 1, duration: pass + rest * 0.35 })
    .to(legRight, { rotation: 0, scaleY: 1, duration: pass + rest * 0.35 }, "<")
    .to(body, { rotation: 0, y: 0, x: 0, duration: pass + rest * 0.35 }, "<");

  if (root) {
    tl.to(root, { y: 0, duration: pass + rest * 0.35 }, "<");
  }

  // Explicit rest hold so the loop does not feel machine-gun continuous
  tl.to({}, { duration: rest });

  return {
    kill: () => {
      tl.kill();
      gsap.set(parts, { clearProps: "transform" });
    },
    pause: () => {
      tl.pause();
    },
    resume: () => {
      tl.resume();
    },
  };
}
