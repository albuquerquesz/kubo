"use client";

import { gsap, ScrollTrigger } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { HERO_STICKY_SCROLL } from "@/lib/motion/timelines/hero-sticky-scale";

// Ensure plugin is registered even if this module loads first
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

/** Defaults when icons self-trigger (not hero pin). */
export const SCROLL_REVEAL_ICONS_DEFAULTS = {
  start: "top 75%",
  end: "top 35%",
  scrub: 0.45,
  stagger: 0.12,
} as const;

/**
 * Hero pin window (Family B + C): same start as sticky scale; end slightly
 * earlier so icons finish while scale still approaches 1 (probe y≈800 vs 1000).
 */
export const SCROLL_REVEAL_ICONS_HERO = {
  start: HERO_STICKY_SCROLL.start,
  end: HERO_STICKY_SCROLL.iconsEnd,
  scrub: HERO_STICKY_SCROLL.scrub,
  stagger: 0.12,
} as const;

/**
 * Masked icon rise scrubbed to scroll (yPercent 100 → 0).
 * Icons must sit inside overflow-hidden fixed squares for the mask to work.
 * prefers-reduced-motion: icons visible at rest, no scrub.
 */
export function playScrollRevealIcons(options: ScrollRevealIconsOptions): ScrollRevealIconsHandle {
  const {
    icons,
    trigger,
    stagger = SCROLL_REVEAL_ICONS_DEFAULTS.stagger,
    start = SCROLL_REVEAL_ICONS_DEFAULTS.start,
    end = SCROLL_REVEAL_ICONS_DEFAULTS.end,
    scrub = SCROLL_REVEAL_ICONS_DEFAULTS.scrub,
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
    gsap.set(icons, { yPercent: 0, clearProps: "" });
    return { tween: null, kill };
  }

  // Force clipped rest immediately (overrides any FOUC / layout pass)
  gsap.set(icons, { yPercent: 100, force3D: true });

  tween = gsap.fromTo(
    icons,
    { yPercent: 100 },
    {
      yPercent: 0,
      ease: "none",
      stagger,
      force3D: true,
      immediateRender: true,
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub,
        // Pin progress at 0 until start so first paint stays clipped
        invalidateOnRefresh: true,
      },
    },
  );

  return { tween, kill };
}
