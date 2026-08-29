import { isDesktopWebFrontend } from "./constants";
import { getPublicEnvKey } from "./frontend";
import type { PaymentProvider, Payments } from "./types";

export type PaymentCompatibilityIssue =
  | "convex-unsupported"
  | "requires-web-frontend"
  | "native-only-unsupported"
  | "sql-database-required";

export type PaymentCompatibilityInput = {
  provider: PaymentProvider | string | undefined;
  backend?: string;
  frontends?: readonly string[];
  database?: string;
  orm?: string;
};

export const PAYMENT_PROVIDER_CAPABILITIES = {
  abacatepay: {
    supportsConvex: false,
    requiresWebFrontend: true,
    disallowsNativeFrontend: true,
    requiresSqlDatabase: true,
  },
  stripe: {
    supportsConvex: false,
    requiresWebFrontend: true,
    disallowsNativeFrontend: false,
    requiresSqlDatabase: false,
  },
} as const;

const PAYMENT_PROVIDERS = ["abacatepay", "stripe"] as const satisfies readonly PaymentProvider[];

export function isPaymentProvider(value: unknown): value is PaymentProvider {
  return typeof value === "string" && PAYMENT_PROVIDERS.some((provider) => provider === value);
}

export function normalizePayments(value: unknown): Payments {
  if (value === undefined || value === "none") return [];

  const values = Array.isArray(value) ? value : [value];
  const providers = values.filter((item) => item !== "none");
  const unsupported = providers.filter((item) => !isPaymentProvider(item));

  if (unsupported.length > 0) {
    throw new Error(`Unsupported payment provider(s): ${unsupported.join(", ")}`);
  }

  return [...new Set(providers.filter(isPaymentProvider))];
}

export function getStripePublicEnvKey(frontends: readonly string[] = []): string {
  return getPublicEnvKey(frontends, "STRIPE_PUBLISHABLE_KEY");
}

export function getPaymentCompatibilityIssue({
  provider,
  backend,
  frontends = [],
  database,
  orm,
}: PaymentCompatibilityInput): PaymentCompatibilityIssue | null {
  if (!provider || provider === "none" || !isPaymentProvider(provider)) return null;
  const capabilities = PAYMENT_PROVIDER_CAPABILITIES[provider];

  if (backend === "convex" && !capabilities.supportsConvex) return "convex-unsupported";

  const hasWebFrontend = frontends.some((frontend) => isDesktopWebFrontend(frontend));
  const hasNativeFrontend = frontends.some((frontend) =>
    ["native-bare", "native-uniwind", "native-unistyles"].includes(frontend),
  );
  if (capabilities.requiresWebFrontend && !hasWebFrontend) return "requires-web-frontend";
  if (capabilities.disallowsNativeFrontend && hasNativeFrontend) return "native-only-unsupported";

  if (
    capabilities.requiresSqlDatabase &&
    (database === "none" || orm === "none" || database === "mongodb" || orm === "mongoose")
  ) {
    return "sql-database-required";
  }

  return null;
}
