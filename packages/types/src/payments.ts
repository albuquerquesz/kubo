import { desktopWebFrontends } from "./constants";
import type { Payments } from "./types";

export type PaymentCompatibilityIssue =
  | "convex-unsupported"
  | "requires-web-frontend"
  | "native-only-unsupported"
  | "sql-database-required";

export type PaymentCompatibilityInput = {
  provider: Payments | string | undefined;
  backend?: string;
  frontends?: readonly string[];
  database?: string;
  orm?: string;
};

const stripePublicEnvKeys = {
  next: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  nuxt: "NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  browser: "VITE_STRIPE_PUBLISHABLE_KEY",
  public: "PUBLIC_STRIPE_PUBLISHABLE_KEY",
} as const;

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

export function getStripePublicEnvKey(frontends: readonly string[] = []): string {
  if (frontends.includes("next")) return stripePublicEnvKeys.next;
  if (frontends.includes("nuxt")) return stripePublicEnvKeys.nuxt;
  if (frontends.includes("svelte") || frontends.includes("astro")) {
    return stripePublicEnvKeys.public;
  }
  return stripePublicEnvKeys.browser;
}

export function getPaymentCompatibilityIssue({
  provider,
  backend,
  frontends = [],
  database,
  orm,
}: PaymentCompatibilityInput): PaymentCompatibilityIssue | null {
  if (!provider || provider === "none") return null;
  const capabilities =
    PAYMENT_PROVIDER_CAPABILITIES[provider as keyof typeof PAYMENT_PROVIDER_CAPABILITIES];
  if (!capabilities) return null;

  if (backend === "convex" && !capabilities.supportsConvex) return "convex-unsupported";

  const hasWebFrontend = frontends.some((frontend) =>
    (desktopWebFrontends as readonly string[]).includes(frontend),
  );
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
