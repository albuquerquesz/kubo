/**
 * prefers-reduced-motion helpers for GSAP timelines.
 * Call only in the browser (client components / effects).
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Subscribe to reduced-motion preference changes.
 * Returns an unsubscribe function.
 */
export function onReducedMotionChange(callback: (reduced: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };

  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
