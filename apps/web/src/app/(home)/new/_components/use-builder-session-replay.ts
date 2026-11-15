"use client";

import { useEffect } from "react";

import { useAnalyticsConsent } from "@/components/consent/use-analytics-consent";
import { env } from "@/env/client";
import { BUILDER_REPLAY_APP, builderReplayConfig } from "@/lib/builder-replay";

type PostHogInstance = (typeof import("posthog-js"))["default"];

let posthogPromise: Promise<PostHogInstance | null> | null = null;

/** Loads and initializes posthog-js once, only when the builder is opened. */
function loadPostHog(): Promise<PostHogInstance | null> {
  const key = env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || typeof window === "undefined") return Promise.resolve(null);
  posthogPromise ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, builderReplayConfig(env.NEXT_PUBLIC_POSTHOG_HOST));
    posthog.register({ app: BUILDER_REPLAY_APP });
    return posthog;
  });
  return posthogPromise;
}

/**
 * Records the session while the stack builder (/new, /new/preview) is on screen, and only after
 * the visitor accepted analytics in the cookie card. Refusing later stops capture right away.
 */
export function useBuilderSessionReplay(): void {
  const consent = useAnalyticsConsent();

  useEffect(() => {
    if (consent !== "granted") {
      // Only touch PostHog if it was already loaded (consent given earlier in this visit).
      if (consent === "denied" && posthogPromise) {
        void posthogPromise.then((posthog) => {
          posthog?.stopSessionRecording();
          posthog?.opt_out_capturing();
        });
      }
      return;
    }
    let active = true;
    void loadPostHog().then((posthog) => {
      if (!active || !posthog) return;
      if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing();
      posthog.startSessionRecording();
    });
    return () => {
      active = false;
      void loadPostHog().then((posthog) => posthog?.stopSessionRecording());
    };
  }, [consent]);
}
