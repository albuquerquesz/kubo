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
 * Used when sticky is unavailable (fixture / unit checks).
 *
 * Runtime prefers {@link hostEndTranslateForStage} which **centers** the
 * unscaled host in the sticky shell (Mistral left 259 / top 252 is true center
 * for 924×396 on 1440×900).
 */
export const HERO_HOST_X_END_RATIO = 258 / 924;
export const HERO_HOST_Y_END_RATIO = -252 / 396;

/**
 * Legacy Mistral end position as sticky shares (true center for 924×396 host).
 * Prefer dynamic centering via {@link hostEndTranslateForStage}.
 */
export const HERO_STAGE_END_LEFT_SHARE = 259 / 1440;
export const HERO_STAGE_END_TOP_SHARE = 252 / 900;

/**
 * Title exit magnitude as fraction of sticky height.
 * Strong enough to clear justify-end title in Kubo’s tall L1 cell.
 * Mistral probe ends ~−0.5; we use more so the last line leaves the frame.
 */
export const HERO_TITLE_Y_END_RATIO = -0.85;

/**
 * Stage-clear elements (install rail, empty lower band) fade out over the pin
 * so the sticky shell reads as a clean full-viewport stage (optical 100%).
 * Opacity stays 1 until this pin fraction, then → 0 by pin end.
 */
export const HERO_STAGE_CLEAR_START_PIN = 0.35;
export const HERO_STAGE_CLEAR_END_PIN = 0.85;

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
   * Sticky shell — used for title exit magnitude + stage centering.
   */
  sticky?: HTMLElement | null;
  /**
   * Title wrap / left column — Family B2 translateY exit.
   */
  title?: HTMLElement | null;
  /**
   * Elements that fade out as the stage takes over (install card, L2 band).
   * Opacity 1 → 0 over {@link HERO_STAGE_CLEAR_START_PIN}…{@link HERO_STAGE_CLEAR_END_PIN}.
   */
  stageClear?: HTMLElement[];
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
  stageClearTween: gsap.core.Tween | null;
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
 * (Fixture / unit checks — runtime uses stage centering when sticky is passed.)
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
 * End translate so scale-1 painted box is **centered** in the sticky shell.
 * Matches Mistral end pose for a 924×396 host on 1440×900 (left≈259, top≈252).
 */
export function hostEndTranslateForStage(
  target: HTMLElement,
  sticky: HTMLElement,
): { x: number; y: number } {
  const stickyRect = sticky.getBoundingClientRect();
  const layout = hostLayoutViewportOrigin(target);
  const w = target.offsetWidth;
  const h = target.offsetHeight;
  const targetLeft = stickyRect.left + (stickyRect.width - w) / 2;
  const targetTop = stickyRect.top + (stickyRect.height - h) / 2;
  return {
    x: targetLeft - layout.left,
    y: targetTop - layout.top,
  };
}

/** X-only helper. */
export function hostEndTranslateXForStage(target: HTMLElement, sticky: HTMLElement): number {
  return hostEndTranslateForStage(target, sticky).x;
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
 * Family B2: title wrap translateY exit (clears left column).
 * Stage clear: optional opacity fade on lower rail / chrome.
 * Optional per-line translateX (outer lines; middle fixed).
 * Desktop only (matchMedia lg+). Reduced motion → host scale 1, title visible, no scrub.
 * Reverse is free via scrub (scroll up restores rest).
 */
export function playHeroStickyScale(options: HeroStickyScaleOptions): HeroStickyScaleHandle {
  const {
    trigger,
    target,
    sticky = null,
    title = null,
    stageClear = [],
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
  let stageClearTween: gsap.core.Tween | null = null;
  let mm: gsap.MatchMedia | null = null;

  const clearHost = () => {
    gsap.set(target, { clearProps: "transform,transformOrigin" });
    if (sentences.length) {
      gsap.set(sentences, { clearProps: "transform" });
    }
    if (title) {
      gsap.set(title, { clearProps: "transform,opacity" });
    }
    if (stageClear.length) {
      gsap.set(stageClear, { clearProps: "opacity,visibility,pointerEvents" });
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
    stageClearTween?.scrollTrigger?.kill();
    stageClearTween?.kill();
    stageClearTween = null;
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
      gsap.set(title, { y: 0, opacity: 1 });
    }
    if (stageClear.length) {
      gsap.set(stageClear, { opacity: 1 });
    }
    return { tween: null, sentenceTween: null, titleTween: null, stageClearTween: null, kill };
  }

  mm = gsap.matchMedia();

  mm.add(HERO_STICKY_MQ, () => {
    // Establish rest transform before measuring layout for stage end XY.
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
      gsap.set(title, { y: 0, opacity: 1, force3D: true });
      // Exit up + fade so last line does not linger at the top edge.
      titleTween = gsap.fromTo(
        title,
        { y: 0, opacity: 1 },
        {
          y: titleEndY,
          opacity: 0,
          ease: HERO_HOST_EASE,
          force3D: true,
          immediateRender: true,
          scrollTrigger: { ...stBase },
        },
      );
    }

    if (stageClear.length > 0) {
      gsap.set(stageClear, { opacity: 1, pointerEvents: "auto" });
      const travel = pinTravelPx(trigger);
      const clearStart = Math.round(travel * HERO_STAGE_CLEAR_START_PIN);
      const clearEnd = Math.round(travel * HERO_STAGE_CLEAR_END_PIN);
      stageClearTween = gsap.fromTo(
        stageClear,
        { opacity: 1 },
        {
          opacity: 0,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger,
            start: `top+=${clearStart} top`,
            end: `top+=${clearEnd} top`,
            scrub,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Disable clicks once mostly faded
              const pe = self.progress > 0.5 ? "none" : "auto";
              stageClear.forEach((el) => {
                el.style.pointerEvents = pe;
              });
            },
          },
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
      stageClearTween?.scrollTrigger?.kill();
      stageClearTween?.kill();
      stageClearTween = null;
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
      gsap.set(title, { clearProps: "transform,opacity" });
    }
    if (stageClear.length) {
      gsap.set(stageClear, { clearProps: "opacity,pointerEvents" });
    }
  });

  return { tween, sentenceTween, titleTween, stageClearTween, kill };
}
