"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import { gsap } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

gsap.registerPlugin(ScrollTrigger);

/** Family B start scale (Mistral probe ~0.4664). */
export const HERO_STICKY_SCALE_FROM = 0.47;
/** Family B end scale — locks at 1 after scrub range. */
export const HERO_STICKY_SCALE_TO = 1;

/**
 * Shared ScrollTrigger window for the sticky hero pin (section is ~200dvh).
 * Scale and icon scrub bind to the same trigger with different end points.
 */
export const HERO_STICKY_SCROLL = {
  /** When the tall section top reaches the viewport top (under fixed header offset is layout-owned). */
  start: "top top",
  /** Full pin travel: scale completes when section bottom meets viewport bottom. */
  scaleEnd: "bottom bottom",
  /**
   * Icons finish slightly before scale locks (probe: icons ~done by y≈800, scale 1 at y≈1000).
   * `bottom 20%` ≈ 80% through the pin window on a 200dvh shell.
   */
  iconsEnd: "bottom 20%",
  scrub: 0.45,
} as const;

/** Desktop breakpoint matching Tailwind `lg`. */
export const HERO_STICKY_MQ = "(min-width: 1024px)";

export type HeroStickyScaleOptions = {
  /** Tall hero host (~200dvh) — ScrollTrigger root. */
  trigger: HTMLElement;
  /** Element that receives scale (mission / right-top content). */
  target: HTMLElement;
  /** Start scale. Default 0.47. */
  fromScale?: number;
  /** End scale. Default 1. */
  toScale?: number;
  /** Scrub lag. Default 0.45. */
  scrub?: number | boolean;
  /** ScrollTrigger start. Default "top top". */
  start?: string;
  /** ScrollTrigger end. Default "bottom bottom". */
  end?: string;
};

export type HeroStickyScaleHandle = {
  tween: gsap.core.Tween | null;
  kill: () => void;
};

/**
 * Family B: scrub scale ~0.47 → 1.0 on the mission column over a sticky hero pin.
 * Desktop only (matchMedia lg+). Reduced motion → scale 1, no scrub.
 * CSS should provide sticky shell + min-height; this only drives transform.
 */
export function playHeroStickyScale(options: HeroStickyScaleOptions): HeroStickyScaleHandle {
  const {
    trigger,
    target,
    fromScale = HERO_STICKY_SCALE_FROM,
    toScale = HERO_STICKY_SCALE_TO,
    scrub = HERO_STICKY_SCROLL.scrub,
    start = HERO_STICKY_SCROLL.start,
    end = HERO_STICKY_SCROLL.scaleEnd,
  } = options;

  let tween: gsap.core.Tween | null = null;
  let mm: gsap.MatchMedia | null = null;

  const kill = () => {
    tween?.scrollTrigger?.kill();
    tween?.kill();
    tween = null;
    mm?.revert();
    mm = null;
    gsap.set(target, { clearProps: "transform,transformOrigin" });
  };

  if (prefersReducedMotion()) {
    gsap.set(target, {
      scale: toScale,
      transformOrigin: "bottom left",
      force3D: true,
    });
    return { tween: null, kill };
  }

  mm = gsap.matchMedia();

  mm.add(HERO_STICKY_MQ, () => {
    gsap.set(target, {
      scale: fromScale,
      transformOrigin: "bottom left",
      force3D: true,
    });

    tween = gsap.fromTo(
      target,
      { scale: fromScale },
      {
        scale: toScale,
        ease: "none",
        force3D: true,
        immediateRender: true,
        scrollTrigger: {
          trigger,
          start,
          end,
          scrub,
          invalidateOnRefresh: true,
        },
      },
    );

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      tween = null;
      gsap.set(target, { clearProps: "transform,transformOrigin" });
    };
  });

  // Mobile / below lg: always full scale (no pin scrub)
  mm.add("(max-width: 1023px)", () => {
    gsap.set(target, {
      scale: toScale,
      clearProps: "transform,transformOrigin",
    });
  });

  return { tween, kill };
}
