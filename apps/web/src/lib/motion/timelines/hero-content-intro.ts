"use client";

/**
 * Full hero content entrance (WhatsLeads-style orchestration):
 * badge → title words (blur-in) → body → CTA.
 * All nodes share a pre-state so the hero never shows a half-empty stack.
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
  /** Force-visible fallback if arming stalls (ms). Default 400. */
  safetyMs?: number;
};

export type HeroContentIntroHandle = {
  kill: () => void;
};

const ENTER_ATTR = "data-hero-enter";

function revealFinal(els: HTMLElement[]) {
  for (const el of els) {
    gsap.set(el, { clearProps: "opacity,filter,transform" });
    el.style.opacity = "";
    el.style.filter = "";
    el.style.transform = "";
  }
}

/**
 * Play coordinated hero entrance. Returns cleanup for useGsapContext.
 */
export function playHeroContentIntro(options: HeroContentIntroOptions): () => void {
  const { root, badge, title, body, cta, safetyMs = 400 } = options;
  const stack = [badge, title, body, cta];

  let split: SplitText | null = null;
  let timeline: gsap.core.Timeline | null = null;
  let safetyTimer: number | null = null;
  let armed = false;

  const clearPending = () => {
    root.removeAttribute("data-hero-pending");
  };

  const forceVisible = () => {
    if (armed) return;
    armed = true;
    clearPending();
    timeline?.kill();
    timeline = null;
    if (split) {
      split.revert();
      split = null;
    }
    revealFinal(stack);
  };

  const kill = () => {
    if (safetyTimer !== null) {
      window.clearTimeout(safetyTimer);
      safetyTimer = null;
    }
    timeline?.kill();
    timeline = null;
    if (split) {
      split.revert();
      split = null;
    }
    clearPending();
  };

  if (prefersReducedMotion()) {
    forceVisible();
    return kill;
  }

  // Safety: never leave the stack stuck at opacity 0 if GSAP stalls.
  safetyTimer = window.setTimeout(() => {
    safetyTimer = null;
    if (!armed) forceVisible();
  }, safetyMs);

  try {
    for (const el of stack) {
      if (!el.hasAttribute(ENTER_ATTR)) {
        el.setAttribute(ENTER_ATTR, "");
      }
    }

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
    // Title host itself must be opaque so word fades are the only gate.
    gsap.set(title, { opacity: 1, clearProps: "filter" });

    clearPending();
    armed = true;
    if (safetyTimer !== null) {
      window.clearTimeout(safetyTimer);
      safetyTimer = null;
    }

    timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(words, { clearProps: "willChange,filter" });
        gsap.set([badge, body, cta], { clearProps: "transform" });
      },
    });

    // 1 — badge
    timeline.to(badge, { opacity: 1, y: 0, duration: 0.45, ease: ease.expoOut }, 0);

    // 2 — title words (blur-in)
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

    // 3 — body
    timeline.to(body, { opacity: 1, y: 0, duration: 0.55, ease: ease.expoOut }, 0.4);

    // 4 — CTA
    timeline.to(cta, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: ease.expoOut }, 0.55);
  } catch {
    forceVisible();
  }

  return kill;
}
