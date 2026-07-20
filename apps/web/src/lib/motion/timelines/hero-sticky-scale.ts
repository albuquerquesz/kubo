"use client";

import { gsap, ScrollTrigger } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Family B start scale (Mistral probe exact 0.4664).
 * Rounded 0.47 is fine for docs; runtime uses probe value for curve match.
 */
export const HERO_STICKY_SCALE_FROM = 0.4664;
/** Family B end scale — locks at 1 after scrub range. */
export const HERO_STICKY_SCALE_TO = 1;

/**
 * Mistral host end translate as fractions of the unscaled host box
 * (probe @1440×900: host ~431×396, end translate(258, -252)).
 */
export const HERO_HOST_X_END_RATIO = 258 / 431;
export const HERO_HOST_Y_END_RATIO = -252 / 396;

/**
 * Per-line translateX end as fraction of host width (middle line fixed at 0).
 * Probe @900: ~[52.1, 0, 71.04] on ~431px host.
 */
export const HERO_LINE_X_END_RATIOS = [52.1 / 431, 0, 71.04 / 431] as const;

/**
 * Scrub maps scroll progress linearly; tween ease recreates Mistral's
 * non-linear scale/translate curve (validated: power2.out ≈ probe s_n(p)).
 */
export const HERO_HOST_EASE = "power2.out";

/**
 * Shared ScrollTrigger window for the sticky hero pin (section is ~200dvh).
 * Scale/translate and icon scrub bind to the same trigger with different ends.
 */
export const HERO_STICKY_SCROLL = {
  start: "top top",
  /** Host scale+translate completes over full pin travel. */
  scaleEnd: "bottom bottom",
  /**
   * Icon rise window as fractions of pin travel (probe: clipped ~0–200,
   * mid-rise ~250–450, done ~625, scale locks ~875–900 on a ~900px pin).
   * Slightly earlier end so icons clear before host scale locks.
   */
  iconsStartPin: 0.18,
  iconsEndPin: 0.7,
  scrub: 0.45,
  /** Legacy string end — prefer pin fractions via helpers. */
  iconsEnd: "bottom 42%",
} as const;

/** Desktop breakpoint matching Tailwind `lg`. */
export const HERO_STICKY_MQ = "(min-width: 1024px)";

export type HeroStickyScaleOptions = {
  /** Tall hero host (~200dvh) — ScrollTrigger root. */
  trigger: HTMLElement;
  /** Element that receives scale + translate (mission / right-top content). */
  target: HTMLElement;
  /** Mission line elements for per-line translateX (outer lines move). */
  sentences?: HTMLElement[];
  /** Start scale. Default probe 0.4664. */
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
  sentenceTween: gsap.core.Tween | null;
  kill: () => void;
};

/** Pin travel ≈ section height − viewport (200dvh − 100dvh). */
export function pinTravelPx(
  trigger: { offsetHeight: number },
  viewportHeight: number = typeof window !== "undefined" ? window.innerHeight : 900,
): number {
  return Math.max(trigger.offsetHeight - viewportHeight, 1);
}

/**
 * Same curve as GSAP `power2.out` under linear scrub progress.
 * Used by probes/tests; runtime tweens use `HERO_HOST_EASE` string for GSAP.
 */
export function hostEaseProgress(scrollProgress: number): number {
  const t = Math.min(1, Math.max(0, scrollProgress));
  return 1 - (1 - t) ** 2;
}

/**
 * Host scale + translate at pin progress (0–1), matching shipped ratios + ease.
 * Drives parity checks against the canonical fixture without remounting React.
 */
export function hostTransformAtPinProgress(
  scrollProgress: number,
  hostWidth: number,
  hostHeight: number,
): { scale: number; x: number; y: number; eased: number } {
  const eased = hostEaseProgress(scrollProgress);
  const scale = HERO_STICKY_SCALE_FROM + (HERO_STICKY_SCALE_TO - HERO_STICKY_SCALE_FROM) * eased;
  return {
    scale,
    x: hostWidth * HERO_HOST_X_END_RATIO * eased,
    y: hostHeight * HERO_HOST_Y_END_RATIO * eased,
    eased,
  };
}

/** Per-line translateX at pin progress (middle index stays 0). */
export function lineTranslateXAtPinProgress(
  scrollProgress: number,
  hostWidth: number,
  lineIndex: number,
): number {
  const ratio = HERO_LINE_X_END_RATIOS[lineIndex] ?? 0;
  return hostWidth * ratio * hostEaseProgress(scrollProgress);
}

/** Icon ScrollTrigger start/end strings relative to pin travel. */
export function heroIconScrollRange(
  trigger: { offsetHeight: number },
  viewportHeight?: number,
): { start: string; end: string; travel: number; startPx: number; endPx: number } {
  const travel = pinTravelPx(trigger, viewportHeight);
  const startPx = Math.round(travel * HERO_STICKY_SCROLL.iconsStartPin);
  const endPx = Math.round(travel * HERO_STICKY_SCROLL.iconsEndPin);
  return {
    start: `top+=${startPx} top`,
    end: `top+=${endPx} top`,
    travel,
    startPx,
    endPx,
  };
}

/**
 * Family B: scrub scale ~0.47→1 + translateX/Y on the mission host over a sticky pin.
 * Optional per-line translateX (outer lines; middle fixed).
 * Desktop only (matchMedia lg+). Reduced motion → finals, no scrub.
 */
export function playHeroStickyScale(options: HeroStickyScaleOptions): HeroStickyScaleHandle {
  const {
    trigger,
    target,
    sentences = [],
    fromScale = HERO_STICKY_SCALE_FROM,
    toScale = HERO_STICKY_SCALE_TO,
    scrub = HERO_STICKY_SCROLL.scrub,
    start = HERO_STICKY_SCROLL.start,
    end = HERO_STICKY_SCROLL.scaleEnd,
  } = options;

  let tween: gsap.core.Tween | null = null;
  let sentenceTween: gsap.core.Tween | null = null;
  let mm: gsap.MatchMedia | null = null;

  const clearHost = () => {
    gsap.set(target, { clearProps: "transform,transformOrigin" });
    if (sentences.length) {
      gsap.set(sentences, { clearProps: "transform" });
    }
  };

  const kill = () => {
    tween?.scrollTrigger?.kill();
    tween?.kill();
    tween = null;
    sentenceTween?.scrollTrigger?.kill();
    sentenceTween?.kill();
    sentenceTween = null;
    mm?.revert();
    mm = null;
    clearHost();
  };

  if (prefersReducedMotion()) {
    gsap.set(target, {
      scale: toScale,
      x: 0,
      y: 0,
      transformOrigin: "bottom left",
      force3D: true,
    });
    if (sentences.length) {
      gsap.set(sentences, { x: 0 });
    }
    return { tween: null, sentenceTween: null, kill };
  }

  mm = gsap.matchMedia();

  mm.add(HERO_STICKY_MQ, () => {
    const endX = () => target.offsetWidth * HERO_HOST_X_END_RATIO;
    const endY = () => target.offsetHeight * HERO_HOST_Y_END_RATIO;

    gsap.set(target, {
      scale: fromScale,
      x: 0,
      y: 0,
      transformOrigin: "bottom left",
      force3D: true,
    });

    const pinEnd = () => `+=${pinTravelPx(trigger)}`;

    tween = gsap.fromTo(
      target,
      { scale: fromScale, x: 0, y: 0 },
      {
        scale: toScale,
        x: endX,
        y: endY,
        ease: HERO_HOST_EASE,
        force3D: true,
        immediateRender: true,
        scrollTrigger: {
          trigger,
          start,
          end: end === HERO_STICKY_SCROLL.scaleEnd ? pinEnd : end,
          scrub,
          invalidateOnRefresh: true,
        },
      },
    );

    if (sentences.length > 0) {
      gsap.set(sentences, { x: 0, force3D: true });

      // Per-line end x from host width ratios (middle stays 0)
      sentenceTween = gsap.to(sentences, {
        x: (i: number) => {
          const ratio = HERO_LINE_X_END_RATIOS[i] ?? 0;
          return target.offsetWidth * ratio;
        },
        ease: HERO_HOST_EASE,
        force3D: true,
        stagger: 0,
        immediateRender: false,
        scrollTrigger: {
          trigger,
          start,
          end: end === HERO_STICKY_SCROLL.scaleEnd ? pinEnd : end,
          scrub,
          invalidateOnRefresh: true,
        },
      });
    }

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      tween = null;
      sentenceTween?.scrollTrigger?.kill();
      sentenceTween?.kill();
      sentenceTween = null;
      clearHost();
    };
  });

  // Mobile / below lg: always full scale (no pin scrub)
  mm.add("(max-width: 1023px)", () => {
    gsap.set(target, {
      scale: toScale,
      x: 0,
      y: 0,
      clearProps: "transform,transformOrigin",
    });
    if (sentences.length) {
      gsap.set(sentences, { clearProps: "transform" });
    }
  });

  return { tween, sentenceTween, kill };
}
