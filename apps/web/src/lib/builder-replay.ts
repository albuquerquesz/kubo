import type { PostHogConfig } from "posthog-js";

/** Tags every kubojs.dev event; the PostHog project is shared with breakbot (`app: "breakbot"`). */
export const BUILDER_REPLAY_APP = "kubojs-web";

export const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

/**
 * PostHog setup for the stack builder: session replay only, no click autocapture, inputs masked
 * (the auth modal email never reaches a recording), Do Not Track respected, no cookies.
 */
export function builderReplayConfig(host: string | undefined): Partial<PostHogConfig> {
  return {
    api_host: host ?? DEFAULT_POSTHOG_HOST,
    autocapture: false,
    capture_pageview: "history_change",
    capture_pageleave: true,
    capture_exceptions: false,
    capture_performance: false,
    capture_heatmaps: false,
    capture_dead_clicks: false,
    rageclick: false,
    disable_surveys: true,
    disable_web_experiments: true,
    respect_dnt: true,
    persistence: "localStorage",
    person_profiles: "identified_only",
    // Recording starts explicitly while the builder is mounted (see useBuilderSessionReplay).
    disable_session_recording: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-replay-mask]",
    },
  };
}
