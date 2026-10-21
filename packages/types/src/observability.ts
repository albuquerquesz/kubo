import type { Observability, ObservabilityProvider } from "./types";

export type ObservabilityMount = "web-browser";

export const OBSERVABILITY_PROVIDER_CAPABILITIES = {
  himetrica: {
    mounts: ["web-browser"],
  },
} as const satisfies Record<
  ObservabilityProvider,
  {
    mounts: readonly ObservabilityMount[];
  }
>;

export function isObservabilityProvider(value: unknown): value is ObservabilityProvider {
  return typeof value === "string" && Object.hasOwn(OBSERVABILITY_PROVIDER_CAPABILITIES, value);
}

// Providers dropped from the catalog; existing project configs may still list them.
const REMOVED_OBSERVABILITY_PROVIDERS: readonly unknown[] = ["none", "getmonitor"];

export function normalizeObservability(value: unknown): Observability {
  if (value === undefined || value === "none") return [];

  const values = Array.isArray(value) ? value : [value];
  const providers = values.filter((item) => !REMOVED_OBSERVABILITY_PROVIDERS.includes(item));
  const unsupported = providers.filter((item) => !isObservabilityProvider(item));

  if (unsupported.length > 0) {
    throw new Error(`Unsupported observability provider(s): ${unsupported.join(", ")}`);
  }

  return [...new Set(providers.filter(isObservabilityProvider))];
}
