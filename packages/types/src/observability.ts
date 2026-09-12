import type { Observability, ObservabilityProvider } from "./types";

export type ObservabilityMount =
  | "web-browser"
  | "next-config"
  | "react-error-boundary"
  | "node-server";

export const OBSERVABILITY_PROVIDER_CAPABILITIES = {
  getmonitor: {
    mounts: ["web-browser", "next-config", "react-error-boundary", "node-server"],
  },
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

export function normalizeObservability(value: unknown): Observability {
  if (value === undefined || value === "none") return [];

  const values = Array.isArray(value) ? value : [value];
  const providers = values.filter((item) => item !== "none");
  const unsupported = providers.filter((item) => !isObservabilityProvider(item));

  if (unsupported.length > 0) {
    throw new Error(`Unsupported observability provider(s): ${unsupported.join(", ")}`);
  }

  return [...new Set(providers.filter(isObservabilityProvider))];
}
