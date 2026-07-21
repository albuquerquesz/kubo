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
 * Host end translate as fractions of the **unscaled offset** box
 * (Mistral probe @1440×900: offset ~924×396, end matrix translate(258, −252)).
 *
 * Runtime **Y** uses the height ratio. Runtime **X** prefers sticky-stage
 * landing ({@link hostEndTranslateXForStage}) so an in-flow right-rail host
 * moves into center stage (Mistral painted left 1009→259) instead of deeper
 * into the right margin.
 */
export const HERO_HOST_X_END_RATIO = 258 / 924;
export const HERO_HOST_Y_END_RATIO = -252 / 396;

/**
 * End painted host position as fractions of sticky box
 * (Mistral end: left ~259/1440, top ~252/900).
 * Used when `sticky` is passed to {@link playHeroStickyScale}.
 */
export const HERO_STAGE_END_LEFT_SHARE = 259 / 1440;
export const HERO_STAGE_END_TOP_SHARE = 252 / 900;

/**
 * Title exit magnitude as fraction of sticky height.
 * Probe −450/900 = −0.5 clears most of Mistral’s upper band; Kubo’s
 * justify-end title sits lower in a taller L1 cell — use a stronger exit.
 */
export const HERO_TITLE_Y_END_RATIO = -0.62;

/**
 * Mistral painted-rest host box (scale×offset at rest) — fixture reference.
 */
export const HERO_HOST_PAINTED_REST_W = 431;
export const HERO_HOST_PAINTED_REST_H = 396;

/**
 * Per-line translateX end as fraction of host **offset** width
 * (middle line fixed at 0). Probe @900 on ~924px host: ~[52, 0, 71].
 */
export const HERO_LINE_X_END_RATIOS = [52.1 / 924, 0, 71.04 / 924] as const;

/**
 * Scrub maps scroll progress linearly; tween ease recreates Mistral's
 * non-linear scale/translate curve (validated: power2.out ≈ probe s_n(p)).
 */
export const HERO_HOST_EASE = "power2.out";

/**
 * Shared ScrollTrigger window for the sticky hero pin (section is ~200dvh).
 * Scale/translate, title exit, and icon scrub bind to the same trigger.
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
   * Sticky shell — used for title exit magnitude (fraction of sticky height).
   */
  sticky?: HTMLElement | null;
  /**
   * Title wrap / left column — Family B2 translateY exit (0 → −50% sticky H).
   */
  title?: HTMLElement | null;
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
  titleTween: gsap.core.Tween | null;
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
 * Host scale + translate at pin progress (0–1) using **offset-box** ratios.
 * (Fixture / unit checks — runtime X may use stage landing instead.)
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

/**
 * Unscaled layout top-left of `target` in viewport coords, given current GSAP
 * scale/x/y with transform-origin bottom-left.
 */
export function hostLayoutViewportOrigin(target: HTMLElement): { left: number; top: number } {
  const x = Number(gsap.getProperty(target, "x")) || 0;
  const y = Number(gsap.getProperty(target, "y")) || 0;
  const scale = Number(gsap.getProperty(target, "scale")) || 1;
  const rect = target.getBoundingClientRect();
  const height = target.offsetHeight;
  // origin bottom-left: painted left = layoutLeft + x
  // painted top = layoutTop + height*(1-scale) + y
  return {
    left: rect.left - x,
    top: rect.top - y - height * (1 - scale),
  };
}

/** @deprecated use hostLayoutViewportOrigin */
export function hostLayoutViewportLeft(target: HTMLElement): number {
  return hostLayoutViewportOrigin(target).left;
}

/**
 * End translate so scale-1 painted box lands in the sticky-stage region
 * (Mistral-like left/top shares). Right-rail hosts get negative x (into stage).
 */
export function hostEndTranslateForStage(
  target: HTMLElement,
  sticky: HTMLElement,
  endLeftShare: number = HERO_STAGE_END_LEFT_SHARE,
  endTopShare: number = HERO_STAGE_END_TOP_SHARE,
): { x: number; y: number } {
  const stickyRect = sticky.getBoundingClientRect();
  const layout = hostLayoutViewportOrigin(target);
  return {
    x: stickyRect.left + stickyRect.width * endLeftShare - layout.left,
    y: stickyRect.top + stickyRect.height * endTopShare - layout.top,
  };
}

/** X-only helper (tests / callers that only need horizontal stage landing). */
export function hostEndTranslateXForStage(
  target: HTMLElement,
  sticky: HTMLElement,
  endLeftShare: number = HERO_STAGE_END_LEFT_SHARE,
): number {
  return hostEndTranslateForStage(target, sticky, endLeftShare).x;
}

/**
 * Title wrap translateY at pin progress (Family B2).
 * @param stickyHeight sticky shell height (probe 900)
 */
export function titleExitYAtPinProgress(scrollProgress: number, stickyHeight: number): number {
  return stickyHeight * HERO_TITLE_Y_END_RATIO * hostEaseProgress(scrollProgress);
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
 * Family B2: optional title wrap translateY exit (0 → −50% sticky H).
 * Optional per-line translateX (outer lines; middle fixed).
 * Desktop only (matchMedia lg+). Reduced motion → host scale 1, title visible, no scrub.
 */
export function playHeroStickyScale(options: HeroStickyScaleOptions): HeroStickyScaleHandle {
  const {
    trigger,
    target,
    sticky = null,
    title = null,
    sentences = [],
    fromScale = HERO_STICKY_SCALE_FROM,
    toScale = HERO_STICKY_SCALE_TO,
    scrub = HERO_STICKY_SCROLL.scrub,
    start = HERO_STICKY_SCROLL.start,
    end = HERO_STICKY_SCROLL.scaleEnd,
  } = options;

  let tween: gsap.core.Tween | null = null;
  let sentenceTween: gsap.core.Tween | null = null;
  let titleTween: gsap.core.Tween | null = null;
  let mm: gsap.MatchMedia | null = null;

  const clearHost = () => {
    gsap.set(target, { clearProps: "transform,transformOrigin" });
    if (sentences.length) {
      gsap.set(sentences, { clearProps: "transform" });
    }
    if (title) {
      gsap.set(title, { clearProps: "transform" });
    }
  };

  const kill = () => {
    tween?.scrollTrigger?.kill();
    tween?.kill();
    tween = null;
    sentenceTween?.scrollTrigger?.kill();
    sentenceTween?.kill();
    sentenceTween = null;
    titleTween?.scrollTrigger?.kill();
    titleTween?.kill();
    titleTween = null;
    mm?.revert();
    mm = null;
    clearHost();
  };

  if (prefersReducedMotion()) {
    // Finals: full-scale mission in place; title stays readable (no exit).
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
    if (title) {
      gsap.set(title, { y: 0 });
    }
    return { tween: null, sentenceTween: null, titleTween: null, kill };
  }

  mm = gsap.matchMedia();

  mm.add(HERO_STICKY_MQ, () => {
    // Establish rest transform before measuring layout for stage end X.
    gsap.set(target, {
      scale: fromScale,
      x: 0,
      y: 0,
      transformOrigin: "bottom left",
      force3D: true,
    });

    const endXY = () => {
      if (sticky) {
        return hostEndTranslateForStage(target, sticky);
      }
      return {
        x: target.offsetWidth * HERO_HOST_X_END_RATIO,
        y: target.offsetHeight * HERO_HOST_Y_END_RATIO,
      };
    };
    const endX = () => endXY().x;
    const endY = () => endXY().y;
    const titleEndY = () => {
      const h = sticky?.clientHeight || sticky?.offsetHeight || window.innerHeight;
      return h * HERO_TITLE_Y_END_RATIO;
    };

    const pinEnd = () => `+=${pinTravelPx(trigger)}`;
    const stBase = {
      trigger,
      start,
      end: end === HERO_STICKY_SCROLL.scaleEnd ? pinEnd : end,
      scrub,
      invalidateOnRefresh: true,
    } as const;

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
        scrollTrigger: { ...stBase },
      },
    );

    if (sentences.length > 0) {
      gsap.set(sentences, { x: 0, force3D: true });

      sentenceTween = gsap.to(sentences, {
        x: (i: number) => {
          const ratio = HERO_LINE_X_END_RATIOS[i] ?? 0;
          return target.offsetWidth * ratio;
        },
        ease: HERO_HOST_EASE,
        force3D: true,
        stagger: 0,
        immediateRender: false,
        scrollTrigger: { ...stBase },
      });
    }

    if (title) {
      gsap.set(title, { y: 0, force3D: true });
      titleTween = gsap.fromTo(
        title,
        { y: 0 },
        {
          y: titleEndY,
          ease: HERO_HOST_EASE,
          force3D: true,
          immediateRender: true,
          scrollTrigger: { ...stBase },
        },
      );
    }

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      tween = null;
      sentenceTween?.scrollTrigger?.kill();
      sentenceTween?.kill();
      sentenceTween = null;
      titleTween?.scrollTrigger?.kill();
      titleTween?.kill();
      titleTween = null;
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
    if (title) {
      gsap.set(title, { clearProps: "transform" });
    }
  });

  return { tween, sentenceTween, titleTween, kill };
}
