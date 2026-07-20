"use client";

import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";

type UseGsapContextOptions = {
  scope?: RefObject<Element | null>;
  /** Values that rebuild the timeline when they change. */
  dependencies?: unknown[];
  revertOnUpdate?: boolean;
};

/**
 * Thin wrapper around @gsap/react useGSAP for consistent cleanup conventions.
 * The callback may return a cleanup function; context.revert() still runs on unmount.
 */
export function useGsapContext(
  callback: () => void | (() => void),
  options: UseGsapContextOptions = {},
) {
  const { scope, dependencies, revertOnUpdate } = options;

  useGSAP(callback, {
    scope,
    dependencies,
    revertOnUpdate,
  });
}
