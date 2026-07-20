"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import { gsap } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export type ScrollRevealIconsOptions = {
  /** Icon elements that move (children of overflow-hidden masks). */
  icons: HTMLElement[];
  /** ScrollTrigger root — typically the section / mission host. */
  trigger: HTMLElement;
  /** Stagger between icons (seconds of scrub progress). Default 0.12. */
  stagger?: number;
  /** ScrollTrigger start. Default "top 75%". */
  start?: string;
  /** ScrollTrigger end. Default "top 35%". */
  end?: string;
  /** Scrub lag. Default 0.45. */
  scrub?: number | boolean;
};

export type ScrollRevealIconsHandle = {
  tween: gsap.core.Tween | null;
  kill: () => void;
};

/**
 * Masked icon rise scrubbed to scroll (yPercent 100 → 0).
 * Icons must sit inside overflow-hidden fixed squares for the mask to work.
 * prefers-reduced-motion: icons visible at rest, no scrub.
 */
export function playScrollRevealIcons(options: ScrollRevealIconsOptions): ScrollRevealIconsHandle {
  const {
    icons,
    trigger,
    stagger = 0.12,
    start = "top 75%",
    end = "top 35%",
    scrub = 0.45,
  } = options;

  let tween: gsap.core.Tween | null = null;

  const kill = () => {
    tween?.scrollTrigger?.kill();
    tween?.kill();
    tween = null;
  };

  if (icons.length === 0) {
    return { tween: null, kill };
  }

  if (prefersReducedMotion()) {
    gsap.set(icons, { yPercent: 0 });
    return { tween: null, kill };
  }

  gsap.set(icons, { yPercent: 100 });

  tween = gsap.to(icons, {
    yPercent: 0,
    ease: "none",
    stagger,
    force3D: true,
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub,
    },
  });

  return { tween, kill };
}
