"use client";

/**
 * Shared SplitText text reveals for marketing surfaces.
 *
 * - **Text split:** GSAP SplitText only (no hand-rolled DOM splitters).
 * - **Scroll coupling:** ScrollTrigger when `trigger: "scroll"`.
 * - **Enter-once:** IntersectionObserver / immediate play when `trigger: "view"`.
 */
import { duration, ease, stagger } from "@/lib/motion/eases";
import { gsap, ScrollTrigger, SplitText } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

export type SplitTextRevealPreset =
  /** Family A style: chars rise from under a line mask. */
  | "mask-rise"
  /** Word-by-word blur + fade (common landing-page title). */
  | "blur-in"
  /** Soft word rise without blur. */
  | "word-rise";

export type SplitTextRevealTrigger =
  /** Play once when the element is (or becomes) in view. */
  | "view"
  /** Scrub / toggle via ScrollTrigger on the element (or `scrollTrigger` vars). */
  | "scroll"
  /** Build the timeline paused; caller plays it. */
  | "manual";

export type SplitTextRevealOptions = {
  root: HTMLElement;
  preset?: SplitTextRevealPreset;
  trigger?: SplitTextRevealTrigger;
  /** Multiplier for char/word stagger. Default 1. */
  randomness?: number;
  /**
   * Revert SplitText DOM after play-once completes.
   * Default: false for `blur-in` / `word-rise` (avoids layout jump), true for `mask-rise` and scroll.
   */
  revertOnComplete?: boolean;
  /** ScrollTrigger vars merged when trigger is "scroll". */
  scrollTrigger?: ScrollTrigger.Vars;
  onComplete?: () => void;
};

export type SplitTextRevealHandle = {
  timeline: gsap.core.Timeline | null;
  split: SplitText | null;
  kill: () => void;
};

function charsInLine(line: Element, chars: Element[]): Element[] {
  return chars.filter((char) => line.contains(char));
}

function splitVarsForPreset(preset: SplitTextRevealPreset): SplitText.Vars {
  if (preset === "mask-rise") {
    return {
      type: "lines,words,chars",
      mask: "lines",
      linesClass: "line",
      wordsClass: "word",
      charsClass: "char",
      aria: "none",
    };
  }

  return {
    type: "words",
    wordsClass: "word",
    aria: "none",
  };
}

/**
 * Create a SplitText-based reveal timeline.
 * Reduced motion: no split/tween; root left in final visible state.
 */
export function createSplitTextReveal(options: SplitTextRevealOptions): SplitTextRevealHandle {
  const {
    root,
    preset = "blur-in",
    trigger = "view",
    randomness = 1,
    scrollTrigger,
    onComplete,
  } = options;

  const revertOnComplete =
    options.revertOnComplete ??
    // Word reveals keep split wrappers (no layout jump). Mask-rise reverts to clean HTML.
    (preset === "mask-rise" && trigger !== "scroll");

  let split: SplitText | null = null;
  let timeline: gsap.core.Timeline | null = null;
  let viewObserver: IntersectionObserver | null = null;

  const kill = () => {
    viewObserver?.disconnect();
    viewObserver = null;
    timeline?.kill();
    timeline = null;
    if (split) {
      split.revert();
      split = null;
    }
  };

  if (prefersReducedMotion()) {
    gsap.set(root, { clearProps: "opacity,filter,transform" });
    root.classList.remove("opacity-0");
    return { timeline: null, split: null, kill };
  }

  split = SplitText.create(root, splitVarsForPreset(preset));
  root.classList.remove("opacity-0");

  const tlVars: gsap.TimelineVars = {
    paused: trigger !== "scroll",
    onComplete: () => {
      if (revertOnComplete) {
        split?.revert();
        split = null;
      }
      onComplete?.();
    },
  };

  if (trigger === "scroll") {
    tlVars.scrollTrigger = {
      trigger: root,
      start: "top 85%",
      end: "top 40%",
      toggleActions: "play none none none",
      ...scrollTrigger,
    };
  }

  timeline = gsap.timeline(tlVars);

  if (preset === "mask-rise") {
    const chars = split.chars as HTMLElement[];
    const charStagger = stagger.charFactor * randomness;
    const lineDelay = stagger.line * 1.05;

    gsap.set(chars, { y: "100%" });

    for (let lineIndex = 0; lineIndex < split.lines.length; lineIndex++) {
      const lineChars = charsInLine(split.lines[lineIndex], chars);
      timeline.fromTo(
        lineChars,
        { y: "100%" },
        {
          y: "0%",
          duration: duration.intro,
          ease: ease.standard,
          stagger: charStagger,
        },
        lineIndex * lineDelay,
      );
    }
  } else if (preset === "blur-in") {
    // WhatsLeads / Framer word appear: blur(10px) + y:10 + fade, staggered per word.
    const words = split.words as HTMLElement[];
    gsap.set(words, {
      opacity: 0,
      filter: "blur(10px)",
      y: 10,
      display: "inline-block",
      willChange: "transform, opacity, filter",
    });
    timeline.to(words, {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      duration: duration.blurIn,
      ease: ease.expoOut,
      stagger: stagger.word * randomness,
      onComplete: () => {
        gsap.set(words, { clearProps: "willChange,filter" });
      },
    });
  } else {
    // word-rise
    const words = split.words as HTMLElement[];
    gsap.set(words, { opacity: 0, y: "0.4em", display: "inline-block" });
    timeline.to(words, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: ease.exit,
      stagger: 0.05 * randomness,
    });
  }

  if (trigger === "view" && timeline) {
    const tl = timeline;
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      tl.play(0);
    };

    const rect = root.getBoundingClientRect();
    const inView =
      rect.top < (typeof window !== "undefined" ? window.innerHeight : 0) && rect.bottom > 0;

    if (inView) {
      play();
    } else {
      viewObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              play();
              viewObserver?.disconnect();
              viewObserver = null;
              break;
            }
          }
        },
        { threshold: 0.15 },
      );
      viewObserver.observe(root);
    }
  }

  return { timeline, split, kill };
}

/**
 * Convenience: mount a reveal and return cleanup (for useGsapContext).
 */
export function playSplitTextReveal(options: SplitTextRevealOptions): () => void {
  const handle = createSplitTextReveal(options);
  return handle.kill;
}
