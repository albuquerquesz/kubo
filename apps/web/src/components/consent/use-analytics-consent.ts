"use client";

import { useSyncExternalStore } from "react";

import { readConsent, subscribeConsent, type AnalyticsConsent } from "@/lib/consent";

/** Current consent; `undefined` during SSR / first render, so nothing flashes before hydration. */
export function useAnalyticsConsent(): AnalyticsConsent | null | undefined {
  return useSyncExternalStore(subscribeConsent, readConsent, () => undefined);
}
