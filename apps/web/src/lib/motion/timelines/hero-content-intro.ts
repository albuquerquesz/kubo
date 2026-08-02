"use client";

/**
 * Hero content entrance — gate-and-orchestrate (WhatsLeads parity).
 *
 * Content stays CSS-hidden until the host opens the gate. GSAP always runs
 * word-by-word blur-in on title AND description (no late-skip that leaves
 * static full text). Refresh and first visit share the same path.
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
 * Play coordinated hero entrance: badge → title words → body words → CTA.
 * Caller is responsible for waiting on the readiness gate before invoking.
 * Returns cleanup for useGsapContext.
 */
export function playHeroContentIntro(options: HeroContentIntroOptions): () => void {
  const { root, badge, title, body, cta } = options;
  const stack = [badge, title, body, cta];

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
    gsap.set(badge, { opacity: 0, y: 8, visibility: "visible" });
    gsap.set(cta, { opacity: 0, y: 12, scale: 0.98, visibility: "visible" });
    gsap.set(titleWords, WORD_FROM);
    gsap.set(bodyWords, WORD_FROM);
    // Containers visible; words drive the reveal.
    gsap.set([title, body], { opacity: 1, visibility: "visible", clearProps: "filter" });

    setIntroState(root, "playing");

    timeline = gsap.timeline({
      onComplete: () => {
        gsap.set([...titleWords, ...bodyWords], { clearProps: "willChange,filter" });
        gsap.set([badge, cta], { clearProps: "transform" });
        setIntroState(root, "done");
      },
    });

    timeline.to(badge, { opacity: 1, y: 0, duration: 0.5, ease: ease.expoOut }, 0);

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
        0.1,
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
        0.42,
      );
    }

    timeline.to(cta, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: ease.expoOut }, 0.72);
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
 */
export async function waitForHeroIntroGate(options: {
  /** Resolves when WebGL/shader canvas is ready (optional). */
  shaderReady?: () => boolean;
  /** Subscribe to shader ready; return unsubscribe. */
  onShaderReady?: (cb: () => void) => () => void;
  /** Minimum ms to hold before opening (avoids flash on ultra-fast loads). */
  minHoldMs?: number;
  /** Hard ceiling — always open by this time. Default 1100. */
  maxWaitMs?: number;
  /** Fonts timeout if document.fonts hangs. Default 400. */
  fontsTimeoutMs?: number;
  signal?: AbortSignal;
}): Promise<void> {
  const {
    shaderReady,
    onShaderReady,
    minHoldMs = 200,
    maxWaitMs = 1100,
    fontsTimeoutMs = 400,
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

  if (!shaderReady?.()) {
    const remaining = Math.max(0, maxWaitMs - (performance.now() - started));
    await new Promise<void>((resolve) => {
      if (shaderReady?.()) {
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
      if (shaderReady?.()) {
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
