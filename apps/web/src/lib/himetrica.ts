import { HimetricaClient } from "@himetrica/tracker-js";

import { env } from "@/env/client";
import { hasAnalyticsConsent } from "@/lib/consent";

type HimetricaClientFactory = (apiKey: string) => HimetricaClient;

const createClient: HimetricaClientFactory = (apiKey) =>
  new HimetricaClient({ apiKey, autoTrackErrors: true, trackVitals: true });

/**
 * One client per page, created outside React render. The SDK's own provider builds its
 * client during render; when React discards that render, the client left in context is
 * disabled (the SDK allows a single initialized client per window) and drops errors.
 */
export function createHimetricaClientGetter(
  apiKey: string | undefined,
  create: HimetricaClientFactory = createClient,
  canTrack: () => boolean = hasAnalyticsConsent,
): () => HimetricaClient | null {
  let client: HimetricaClient | null = null;

  return () => {
    // Nothing is created (and nothing is sent) until the visitor accepts analytics.
    if (typeof window === "undefined" || !apiKey || !canTrack()) return null;
    client ??= create(apiKey);
    return client;
  };
}

export const getHimetricaClient = createHimetricaClientGetter(env.NEXT_PUBLIC_HIMETRICA_API_KEY);
