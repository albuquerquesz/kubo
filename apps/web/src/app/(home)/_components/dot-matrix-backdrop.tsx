"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import DotMatrixCanvas from "./dot-matrix-canvas";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COARSE_POINTER_QUERY = "(pointer: coarse)";
/** Prewarm margin so the field is ready just before the CTA enters the viewport. */
const VIEW_ROOT_MARGIN = "120px 0px";

function subscribeReducedMotion(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** SSR + first client paint: treat as reduced so we never schedule an animated frame early. */
function getReducedMotionServerSnapshot() {
  return true;
}

function subscribeCoarsePointer(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(COARSE_POINTER_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getCoarsePointerSnapshot() {
  return window.matchMedia(COARSE_POINTER_QUERY).matches;
}

function getCoarsePointerServerSnapshot() {
  return false;
}

/**
 * Decorative black-on-yellow dot-matrix for the final CTA.
 * CSS fallback paints before hydration; WebGL only animates while near view
 * and when reduced motion is off. Mobile/coarse pointer caps DPR at 1.
 */
export default function DotMatrixBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const coarsePointer = useSyncExternalStore(
    subscribeCoarsePointer,
    getCoarsePointerSnapshot,
    getCoarsePointerServerSnapshot,
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting ?? false);
      },
      { root: null, rootMargin: VIEW_ROOT_MARGIN, threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Desktop quality stays [1, 2]; mobile/coarse pointer caps at 1 (or lower device DPR).
  const dpr: [number, number] = coarsePointer ? [1, 1] : [1, 2];

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-dot-matrix-in-view={isInView ? "true" : "false"}
      data-dot-matrix-reduced={reducedMotion ? "true" : "false"}
      data-dot-matrix-ready={canvasReady ? "true" : "false"}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#c49314]"
    >
      {/* Flat yellow bed always — never transparent black under WebGL. */}
      <div className="absolute inset-0 bg-[#c49314]" aria-hidden="true" />

      {/* CSS dots only before Canvas is ready (no vignette / shadow). */}
      {!canvasReady && <div className="dot-matrix-fallback" aria-hidden="true" />}

      <DotMatrixCanvas
        reducedMotion={reducedMotion}
        isInView={isInView}
        dpr={dpr}
        onReady={() => setCanvasReady(true)}
        className={canvasReady ? "opacity-100" : "opacity-0"}
      />
    </div>
  );
}
