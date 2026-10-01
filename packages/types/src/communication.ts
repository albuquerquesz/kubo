import type { Communication, CommunicationProvider } from "./types";

export type CommunicationCompatibilityIssue = "requires-backend" | "workers-unsupported";

export type CommunicationCompatibilityInput = {
  provider: string | undefined;
  backend?: string;
  runtime?: string;
  serverDeploy?: string;
};

export const COMMUNICATION_PRODUCT_NAMES = {
  resend: "Resend",
  notifique: "Notifique",
  arara: "AraraHQ",
} as const satisfies Record<CommunicationProvider, string>;

export const COMMUNICATION_PROVIDER_CAPABILITIES = {
  resend: {
    requiresBackend: true,
    supportsConvex: true,
    supportsWorkers: true,
  },
  notifique: {
    requiresBackend: true,
    supportsConvex: true,
    supportsWorkers: true,
  },
  arara: {
    requiresBackend: true,
    supportsConvex: true,
    supportsWorkers: false,
  },
} as const satisfies Record<
  CommunicationProvider,
  {
    requiresBackend: boolean;
    supportsConvex: boolean;
    supportsWorkers: boolean;
  }
>;

export function isCommunicationProvider(value: unknown): value is CommunicationProvider {
  return typeof value === "string" && Object.hasOwn(COMMUNICATION_PROVIDER_CAPABILITIES, value);
}

export function normalizeCommunication(value: unknown): Communication {
  if (value === undefined || value === "none") return [];

  const values = Array.isArray(value) ? value : [value];
  const providers = values.filter((item) => item !== "none");
  const unsupported = providers.filter((item) => !isCommunicationProvider(item));

  if (unsupported.length > 0) {
    throw new Error(`Unsupported communication provider(s): ${unsupported.join(", ")}`);
  }

  return [...new Set(providers.filter(isCommunicationProvider))];
}

export function getCommunicationCompatibilityIssue({
  provider,
  backend,
  runtime,
  serverDeploy,
}: CommunicationCompatibilityInput): CommunicationCompatibilityIssue | null {
  if (!isCommunicationProvider(provider)) return null;
  const capabilities = COMMUNICATION_PROVIDER_CAPABILITIES[provider];

  if (capabilities.requiresBackend && backend === "none") {
    return "requires-backend";
  }

  const onConvex = backend === "convex";
  if (
    !onConvex &&
    !capabilities.supportsWorkers &&
    (runtime === "workers" || serverDeploy === "cloudflare")
  ) {
    return "workers-unsupported";
  }

  return null;
}
