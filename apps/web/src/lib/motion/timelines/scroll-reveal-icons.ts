"use client";

import { gsap, ScrollTrigger } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import {
  HERO_STICKY_SCROLL,
  heroIconScrollRange,
  pinTravelPx,
} from "@/lib/motion/timelines/hero-sticky-scale";

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
 * Hero pin window (Family B + C): delayed start so icons stay clipped while
 * scale begins; end before host scale locks (probe ~20%–58% of pin travel).
 */
export const SCROLL_REVEAL_ICONS_HERO = {
  scrub: HERO_STICKY_SCROLL.scrub,
  stagger: 0.1,
} as const;

function resetIconTransforms(icons: HTMLElement[]) {
  for (const el of icons) {
    el.style.transform = "";
    el.style.translate = "none";
  }
  gsap.set(icons, {
    x: 0,
    y: 0,
    xPercent: 0,
    yPercent: 100,
    force3D: true,
    immediateRender: true,
  });
}

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
    gsap.set(icons, { y: 0, yPercent: 0, clearProps: "transform" });
    return { tween: null, kill };
  }

  resetIconTransforms(icons);

  tween = gsap.fromTo(
    icons,
    { yPercent: 100, y: 0, x: 0, xPercent: 0 },
    {
      yPercent: 0,
      y: 0,
      x: 0,
      xPercent: 0,
      ease: "none",
      stagger,
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

  return { tween, kill };
}

/**
 * Map full-pin scrub progress → icon rise progress (for tests / probes).
 * Stay fully clipped until iconsStartPin, finish by iconsEndPin.
 */
export function iconRiseEaseFromPinProgress(pinProgress: number): number {
  const startAt = HERO_STICKY_SCROLL.iconsStartPin;
  const endAt = HERO_STICKY_SCROLL.iconsEndPin;
  if (pinProgress <= startAt) return 0;
  if (pinProgress >= endAt) return 1;
  return (pinProgress - startAt) / (endAt - startAt);
}

/**
 * Hero-wired icon rise on the **same pin travel** as Family B host scale.
 * Scrubbed timeline: hold clipped until iconsStartPin, rise by iconsEndPin.
 */
export function playHeroScrollRevealIcons(options: {
  icons: HTMLElement[];
  trigger: HTMLElement;
  stagger?: number;
  scrub?: number | boolean;
}): ScrollRevealIconsHandle {
  const {
    icons,
    trigger,
    stagger = SCROLL_REVEAL_ICONS_HERO.stagger,
    scrub = SCROLL_REVEAL_ICONS_HERO.scrub,
  } = options;

  let timeline: gsap.core.Timeline | null = null;

  const kill = () => {
    timeline?.scrollTrigger?.kill();
    timeline?.kill();
    timeline = null;
  };

  if (icons.length === 0) {
    return { tween: null, kill };
  }

  if (prefersReducedMotion()) {
    gsap.set(icons, { y: 0, yPercent: 0, clearProps: "transform" });
    return { tween: null, kill };
  }

  resetIconTransforms(icons);

  const startAt = HERO_STICKY_SCROLL.iconsStartPin;
  const endAt = HERO_STICKY_SCROLL.iconsEndPin;
  // Budget stagger into the rise window so the LAST icon finishes by endAt
  const staggerSpan = stagger * Math.max(icons.length - 1, 0);
  const riseDur = Math.max(endAt - startAt - staggerSpan, 0.08);

  timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger,
      start: HERO_STICKY_SCROLL.start,
      // Explicit pin distance — avoids sticky-shell confusion with bottom bottom
      end: () => `+=${pinTravelPx(trigger)}`,
      scrub,
      invalidateOnRefresh: true,
    },
  });

  // Empty hold so playhead stays before the rise until startAt
  timeline.to({}, { duration: startAt }, 0);
  timeline.fromTo(
    icons,
    { yPercent: 100, y: 0, x: 0, xPercent: 0 },
    {
      yPercent: 0,
      y: 0,
      x: 0,
      xPercent: 0,
      duration: riseDur,
      stagger,
      force3D: true,
    },
    startAt,
  );
  // Pad to duration 1 so remaining pin keeps icons settled
  const lastIconEnd = startAt + riseDur + staggerSpan;
  timeline.to({}, { duration: Math.max(1 - lastIconEnd, 0.01) }, lastIconEnd);

  // Snap to from-state at progress 0 (scrub can otherwise leave end-state FOUC)
  timeline.scrollTrigger?.update();
  if ((timeline.scrollTrigger?.progress ?? 0) <= 0) {
    gsap.set(icons, { yPercent: 100, y: 0, x: 0, xPercent: 0, force3D: true });
  }

  return {
    tween: timeline as unknown as gsap.core.Tween,
    kill,
  };
}

export { heroIconScrollRange };
