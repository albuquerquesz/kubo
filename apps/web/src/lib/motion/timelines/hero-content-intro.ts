"use client";

/**
 * Hero content entrance — progressive enhancement over CSS first-paint cascade.
 *
 * CSS (`.hero-enter*`) always runs from first paint so refresh never shows a
 * static full stack waiting on hydration. GSAP word blur-in only arms when
 * the page is still "early"; otherwise we leave CSS alone and never re-hide.
 */
import { duration, ease, stagger } from "@/lib/motion/eases";
import { gsap, SplitText } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

export type HeroContentIntroOptions = {
  root: HTMLElement;
  badge: HTMLElement;
  title: HTMLElement;
  body: HTMLElement;
  cta: HTMLElement;
  /**
   * Max ms since navigation start to still take over with GSAP.
   * Past this, CSS cascade owns the intro. Default 200.
   */
  deadlineMs?: number;
};

export type HeroContentIntroHandle = {
  kill: () => void;
};

const JS_OWN_CLASS = "hero-enter-js";

/** Elapsed ms since navigation start (or performance.now() fallback). */
export function msSinceNavigationStart(): number {
  if (typeof performance === "undefined") return Number.POSITIVE_INFINITY;
  const nav = performance.getEntriesByType?.("navigation")?.[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (nav && typeof nav.startTime === "number") {
    return performance.now() - nav.startTime;
  }
  return performance.now();
}

function claimForJs(els: HTMLElement[]) {
  for (const el of els) {
    el.classList.add(JS_OWN_CLASS);
    el.style.animation = "none";
  }
}

function releaseToFinal(els: HTMLElement[]) {
  for (const el of els) {
    el.classList.add(JS_OWN_CLASS);
    gsap.set(el, { clearProps: "opacity,filter,transform" });
    el.style.opacity = "";
    el.style.filter = "";
    el.style.transform = "";
    el.style.animation = "none";
  }
}

/**
 * Play coordinated hero entrance when early enough; otherwise no-op (CSS owns it).
 * Returns cleanup for useGsapContext.
 */
export function playHeroContentIntro(options: HeroContentIntroOptions): () => void {
  const { badge, title, body, cta, deadlineMs = 200 } = options;
  const stack = [badge, title, body, cta];

  let split: SplitText | null = null;
  let timeline: gsap.core.Timeline | null = null;

  const kill = () => {
    timeline?.kill();
    timeline = null;
    if (split) {
      split.revert();
      split = null;
    }
  };

  if (prefersReducedMotion()) {
    // CSS reduced-motion path already shows final state; ensure no leftover inline.
    releaseToFinal(stack);
    return kill;
  }

  const elapsed = msSinceNavigationStart();
  if (elapsed > deadlineMs) {
    // Too late to re-orchestrate — never re-hide content the user may already see.
    return kill;
  }

  try {
    claimForJs(stack);

    split = SplitText.create(title, {
      type: "words",
      wordsClass: "word",
      aria: "none",
    });

    const words = (split.words as HTMLElement[]) ?? [];

    gsap.set(badge, { opacity: 0, y: 8 });
    gsap.set(body, { opacity: 0, y: 12 });
    gsap.set(cta, { opacity: 0, y: 12, scale: 0.98 });
    gsap.set(words, {
      opacity: 0,
      filter: "blur(10px)",
      y: 10,
      display: "inline-block",
      willChange: "transform, opacity, filter",
    });
    gsap.set(title, { opacity: 1, clearProps: "filter" });

    timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(words, { clearProps: "willChange,filter" });
        gsap.set([badge, body, cta], { clearProps: "transform" });
      },
    });

    timeline.to(badge, { opacity: 1, y: 0, duration: 0.45, ease: ease.expoOut }, 0);
    timeline.to(
      words,
      {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: duration.blurIn,
        ease: ease.expoOut,
        stagger: stagger.word,
      },
      0.1,
    );
    timeline.to(body, { opacity: 1, y: 0, duration: 0.55, ease: ease.expoOut }, 0.4);
    timeline.to(cta, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: ease.expoOut }, 0.55);
  } catch {
    kill();
    releaseToFinal(stack);
  }

  return kill;
}
