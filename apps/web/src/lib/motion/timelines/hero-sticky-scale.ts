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
 * Legacy Mistral host end translate as fractions of the unscaled host box
 * (probe @1440×900: painted rest host ~431×396, end translate(258, -252)).
 * Kept for curve unit tests / fixture parity. Runtime stage translate uses
 * {@link hostEndTranslateForStage} against the sticky shell.
 */
export const HERO_HOST_X_END_RATIO = 258 / 431;
export const HERO_HOST_Y_END_RATIO = -252 / 396;

/**
 * Strategy B (screen occupancy): sticky-stage host layout shares of the sticky shell.
 * Mistral probe offset ~924×396 on 1440×900 → ~0.64 × ~0.44.
 */
export const HERO_STAGE_HOST_WIDTH_SHARE = 0.64;
export const HERO_STAGE_HOST_HEIGHT_SHARE = 0.44;

/**
 * End-of-pin painted host position within the sticky shell
 * (Mistral end: left ~259/1440, top ~252/900).
 */
export const HERO_STAGE_END_LEFT_SHARE = 259 / 1440;
export const HERO_STAGE_END_TOP_SHARE = 252 / 900;

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
  /**
   * Sticky shell used for stage-occupancy end translate.
   * When omitted, falls back to legacy host-box ratios.
   */
  sticky?: HTMLElement | null;
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
 * Unscaled layout top-left of `target` in viewport coordinates, accounting for
 * current GSAP scale/x/y with transform-origin bottom-left.
 */
export function hostLayoutViewportOrigin(target: HTMLElement): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  const x = Number(gsap.getProperty(target, "x")) || 0;
  const y = Number(gsap.getProperty(target, "y")) || 0;
  const scale = Number(gsap.getProperty(target, "scale")) || 1;
  const rect = target.getBoundingClientRect();
  const height = target.offsetHeight;
  const width = target.offsetWidth;
  // origin bottom-left: painted left = layoutLeft + x; painted bottom = layoutBottom + y
  // painted top = layoutTop + height*(1-scale) + y
  const left = rect.left - x;
  const top = rect.top - y - height * (1 - scale);
  return { left, top, width, height };
}

/**
 * End translate so the scale-1 painted box lands in the sticky-stage region
 * (occupancy gap-spec: claim mid/right stage, not the right margin).
 */
export function hostEndTranslateForStage(
  target: HTMLElement,
  sticky: HTMLElement,
  endLeftShare: number = HERO_STAGE_END_LEFT_SHARE,
  endTopShare: number = HERO_STAGE_END_TOP_SHARE,
): { x: number; y: number } {
  const stickyRect = sticky.getBoundingClientRect();
  const layout = hostLayoutViewportOrigin(target);
  const targetLeft = stickyRect.left + stickyRect.width * endLeftShare;
  const targetTop = stickyRect.top + stickyRect.height * endTopShare;
  return {
    x: targetLeft - layout.left,
    y: targetTop - layout.top,
  };
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
 * Uses legacy host-box ratios (Mistral probe box) for fixture curve checks.
 * Runtime stage occupancy uses {@link hostEndTranslateForStage} instead.
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
 * Desktop only (matchMedia lg+). Reduced motion → finals (scale 1 + end occupancy), no scrub.
 */
export function playHeroStickyScale(options: HeroStickyScaleOptions): HeroStickyScaleHandle {
  const {
    trigger,
    target,
    sticky = null,
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

  const resolveEndTranslate = (): { x: number; y: number } => {
    if (sticky) {
      return hostEndTranslateForStage(target, sticky);
    }
    return {
      x: target.offsetWidth * HERO_HOST_X_END_RATIO,
      y: target.offsetHeight * HERO_HOST_Y_END_RATIO,
    };
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
    // Final occupancy: scale 1 + stage end translate (no scrub).
    gsap.set(target, {
      scale: toScale,
      x: 0,
      y: 0,
      transformOrigin: "bottom left",
      force3D: true,
    });
    const endTx = resolveEndTranslate();
    gsap.set(target, {
      scale: toScale,
      x: endTx.x,
      y: endTx.y,
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
    // Establish origin + rest transform before measuring layout for end translate.
    gsap.set(target, {
      scale: fromScale,
      x: 0,
      y: 0,
      transformOrigin: "bottom left",
      force3D: true,
    });

    const endX = () => resolveEndTranslate().x;
    const endY = () => resolveEndTranslate().y;

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
