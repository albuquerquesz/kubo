"use client";

import { duration, ease, stagger } from "@/lib/motion/eases";
import { gsap } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import {
  isDescenderChar,
  splitDisplayText,
  type SplitDisplayTextResult,
} from "@/lib/motion/split-display-text";

export type HeroDisplayIntroOptions = {
  root: HTMLElement;
  /** Char stagger jitter multiplier. Default 1. */
  randomness?: number;
  /**
   * Optional line height grow + selective glyph doubling.
   * Default false — Kubo ships the clean masked rise only.
   */
  grow?: boolean;
  /** Called after split.revert() on complete. */
  onComplete?: () => void;
};

export type HeroDisplayIntroHandle = {
  timeline: gsap.core.Timeline | null;
  split: SplitDisplayTextResult | null;
  kill: () => void;
};

/**
 * Hero display intro: split → masked char rise → revert on complete.
 * Respects prefers-reduced-motion (no split/tween; leaves final HTML intact).
 */
export function createHeroDisplayIntro(options: HeroDisplayIntroOptions): HeroDisplayIntroHandle {
  const { root, randomness = 1, grow = false, onComplete } = options;

  let split: SplitDisplayTextResult | null = null;
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
    // Ensure fully visible; no animation
    gsap.set(root, { clearProps: "opacity" });
    root.classList.remove("opacity-0");
    return { timeline: null, split: null, kill };
  }

  split = splitDisplayText(root);

  const charStagger = stagger.charFactor * randomness;
  const lineDelay = stagger.line * 1.05;

  // Initial: chars sit below the mask
  gsap.set(split.chars, { y: "100%" });
  root.classList.remove("opacity-0");

  if (grow) {
    // Selective glyph doubling for grow mode (research technique)
    for (let i = 0; i < split.chars.length; i++) {
      const charEl = split.chars[i];
      const text = charEl.textContent ?? "";
      if (text.length !== 1) continue;
      if (isDescenderChar(text)) continue;
      if (i % 5 !== 0 && i % 8 !== 0) continue;

      // Duplicate glyph visually via data attribute; tween target y -50%
      charEl.dataset.growDup = "true";
    }
  }

  timeline = gsap.timeline({
    paused: true,
    onStart: () => {
      root.classList.remove("opacity-0");
    },
    onComplete: () => {
      split?.revert();
      split = null;
      onComplete?.();
    },
  });

  // Per-line char rise
  for (let lineIndex = 0; lineIndex < split.lines.length; lineIndex++) {
    const line = split.lines[lineIndex];
    const lineChars = Array.from(line.querySelectorAll<HTMLElement>(".char"));

    timeline.fromTo(
      lineChars,
      { y: "100%" },
      {
        y: (i: number, target: HTMLElement) =>
          grow && target.dataset.growDup === "true" ? "-50%" : "0%",
        duration: duration.intro,
        ease: ease.standard,
        stagger: charStagger,
      },
      lineIndex * lineDelay,
    );
  }

  if (grow) {
    timeline.from(
      split.lines,
      {
        height: 0,
        duration: duration.lineGrow,
        ease: ease.standard,
        stagger: stagger.line,
      },
      0,
    );
  }

  return { timeline, split, kill };
}

/**
 * Play intro when root is (or becomes) in view.
 * Returns a cleanup function that disconnects the observer and kills the intro.
 */
export function playHeroDisplayIntroWhenVisible(
  options: HeroDisplayIntroOptions & { autoplay?: boolean },
): () => void {
  const { root, autoplay = true, ...introOptions } = options;
  const handle = createHeroDisplayIntro({ root, ...introOptions });

  if (!handle.timeline) {
    // Reduced motion or no timeline — nothing to play
    return handle.kill;
  }

  if (!autoplay) {
    return handle.kill;
  }

  let played = false;

  const play = () => {
    if (played || !handle.timeline) return;
    played = true;
    handle.timeline.play(0);
  };

  // Already in view?
  const rect = root.getBoundingClientRect();
  const inView =
    rect.top < (typeof window !== "undefined" ? window.innerHeight : 0) && rect.bottom > 0;

  if (inView) {
    play();
    return handle.kill;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          play();
          observer.disconnect();
          break;
        }
      }
    },
    { threshold: 0.15 },
  );

  observer.observe(root);

  return () => {
    observer.disconnect();
    handle.kill();
  };
}
