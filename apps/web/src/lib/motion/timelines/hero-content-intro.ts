"use client";

/**
 * Hero content entrance — gate-and-orchestrate (WhatsLeads parity).
 *
 * Content stays CSS-hidden until the host opens the gate. GSAP always runs
 * word-by-word blur-in on title AND description (no late-skip that leaves
 * static full text). Refresh and first visit share the same path.
 *
 * Gate defaults are short (fonts only). Atmosphere/WebGL must NOT block copy —
 * pass no shaderReady unless a surface truly needs it.
 */
import { duration, ease, stagger } from "@/lib/motion/eases";
import { gsap, SplitText } from "@/lib/motion/gsap-client";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

export type HeroContentIntroOptions = {
  root: HTMLElement;
  /** Optional status chip — omitted when the hero ships without a badge. */
  badge?: HTMLElement | null;
  title: HTMLElement;
  body: HTMLElement;
  cta: HTMLElement;
};

export type HeroContentIntroHandle = {
  kill: () => void;
};

const WORD_FROM = {
  opacity: 0,
  filter: "blur(10px)",
  y: 10,
  display: "inline-block",
  willChange: "transform, opacity, filter",
} as const;

function setIntroState(root: HTMLElement, state: "pending" | "playing" | "done") {
  root.dataset.heroIntro = state;
}

function releaseToFinal(root: HTMLElement, els: HTMLElement[]) {
  setIntroState(root, "done");
  for (const el of els) {
    gsap.set(el, { clearProps: "opacity,filter,transform,visibility" });
    el.style.opacity = "";
    el.style.filter = "";
    el.style.transform = "";
    el.style.visibility = "";
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const id = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(id);
        resolve();
      },
      { once: true },
    );
  });
}

/**
 * Play coordinated hero entrance: optional badge → title words → body words → CTA.
 * Caller is responsible for waiting on the readiness gate before invoking.
 * Returns cleanup for useGsapContext.
 */
export function playHeroContentIntro(options: HeroContentIntroOptions): () => void {
  const { root, badge, title, body, cta } = options;
  const stack = [title, body, cta, ...(badge ? [badge] : [])];

  let titleSplit: SplitText | null = null;
  let bodySplit: SplitText | null = null;
  let timeline: gsap.core.Timeline | null = null;

  const kill = () => {
    timeline?.kill();
    timeline = null;
    if (titleSplit) {
      titleSplit.revert();
      titleSplit = null;
    }
    if (bodySplit) {
      bodySplit.revert();
      bodySplit = null;
    }
  };

  if (prefersReducedMotion()) {
    releaseToFinal(root, stack);
    return kill;
  }

  try {
    // Split while CSS still keeps the stack visually hidden (pending).
    titleSplit = SplitText.create(title, {
      type: "words",
      wordsClass: "word",
      aria: "none",
    });
    bodySplit = SplitText.create(body, {
      type: "words",
      wordsClass: "word",
      aria: "none",
    });

    const titleWords = (titleSplit.words as HTMLElement[]) ?? [];
    const bodyWords = (bodySplit.words as HTMLElement[]) ?? [];

    // Inline pre-state BEFORE flipping data-hero-intro (avoids opacity:1 flash).
    // Mark pop: scale from 0.7 (toy drop-in); no blur — title owns the blur grammar.
    if (badge) gsap.set(badge, { opacity: 0, y: 8, scale: 0.7, visibility: "visible" });
    gsap.set(cta, { opacity: 0, y: 12, scale: 0.98, visibility: "visible" });
    gsap.set(titleWords, WORD_FROM);
    gsap.set(bodyWords, WORD_FROM);
    // Containers visible; words drive the reveal.
    gsap.set([title, body], { opacity: 1, visibility: "visible", clearProps: "filter" });

    setIntroState(root, "playing");

    timeline = gsap.timeline({
      onComplete: () => {
        gsap.set([...titleWords, ...bodyWords], { clearProps: "willChange,filter" });
        gsap.set(cta, { clearProps: "transform" });
        if (badge) gsap.set(badge, { clearProps: "transform" });
        setIntroState(root, "done");
      },
    });

    // Without a badge, title blur starts at t=0 so the reveal still feels immediate.
    const titleAt = badge ? 0.1 : 0;
    const bodyAt = badge ? 0.42 : 0.32;
    const ctaAt = badge ? 0.72 : 0.62;

    if (badge) {
      timeline
        .to(badge, { opacity: 1, y: 0, scale: 1.05, duration: 0.38, ease: "back.out(1.4)" }, 0)
        .to(badge, { scale: 1, duration: 0.16, ease: ease.expoOut }, 0.34);
    }

    if (titleWords.length > 0) {
      timeline.to(
        titleWords,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: duration.blurIn,
          ease: ease.expoOut,
          stagger: stagger.word,
        },
        titleAt,
      );
    }

    if (bodyWords.length > 0) {
      timeline.to(
        bodyWords,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: duration.blurIn,
          ease: ease.expoOut,
          stagger: stagger.word,
        },
        bodyAt,
      );
    }

    timeline.to(cta, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: ease.expoOut }, ctaAt);
  } catch {
    kill();
    releaseToFinal(root, stack);
  }

  return kill;
}

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

/**
 * Wait until fonts are ready / optional shader signal, with min hold + hard ceiling.
 * Never blocks forever — maxWaitMs always releases the intro.
 *
 * Defaults are tuned for paint-first heroes: short fonts wait, no artificial hold.
 * Pass shaderReady only when content must wait on WebGL (prefer not to).
 */
export async function waitForHeroIntroGate(options: {
  /** Resolves when WebGL/shader canvas is ready (optional — avoid for copy). */
  shaderReady?: () => boolean;
  /** Subscribe to shader ready; return unsubscribe. */
  onShaderReady?: (cb: () => void) => () => void;
  /** Minimum ms to hold before opening. Default 0 (no artificial delay). */
  minHoldMs?: number;
  /**
   * Hard ceiling for optional shader wait (from gate start).
   * Default 250 — only used when shaderReady is provided.
   */
  maxWaitMs?: number;
  /** Fonts timeout if document.fonts hangs. Default 150. */
  fontsTimeoutMs?: number;
  signal?: AbortSignal;
}): Promise<void> {
  const {
    shaderReady,
    onShaderReady,
    minHoldMs = 0,
    maxWaitMs = 250,
    fontsTimeoutMs = 150,
    signal,
  } = options;

  if (signal?.aborted) return;

  const started = performance.now();

  try {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await Promise.race([document.fonts.ready, delay(fontsTimeoutMs, signal)]);
    }
  } catch {
    // ignore font failures
  }

  if (signal?.aborted) return;

  // Optional atmosphere wait — only when caller wires shaderReady.
  if (shaderReady && !shaderReady()) {
    const remaining = Math.max(0, maxWaitMs - (performance.now() - started));
    await new Promise<void>((resolve) => {
      if (shaderReady()) {
        resolve();
        return;
      }
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        unsub?.();
        resolve();
      };
      const unsub = onShaderReady?.(done);
      if (shaderReady()) {
        done();
        return;
      }
      void delay(remaining, signal).then(done);
    });
  }

  if (signal?.aborted) return;

  const elapsed = performance.now() - started;
  if (elapsed < minHoldMs) {
    await delay(minHoldMs - elapsed, signal);
  }
}
