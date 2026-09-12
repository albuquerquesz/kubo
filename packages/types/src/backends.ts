import type { API, Auth, Backend, Database, ORM } from "./types";

export type BackendKind = "convex" | "hosted-server" | "fullstack-self" | "none";

export type BackendCompatibilityIssue =
  | "api-unsupported"
  | "auth-unsupported"
  | "database-unsupported"
  | "orm-unsupported"
  | "example-ai-unsupported"
  | "payments-unsupported";

export type BackendCompatibilityInput = {
  backend?: string;
  api?: string;
  auth?: string;
  database?: string;
  orm?: string;
  examples?: readonly string[];
  payments?: readonly string[];
};

export type BackendCapabilities = {
  readonly kind: BackendKind;
  readonly apis: readonly API[];
  readonly examples: { readonly ai: boolean };
  readonly auth?: readonly Auth[];
  readonly databases?: readonly Database[];
  readonly orms?: readonly ORM[];
  readonly supportsPayments: boolean;
  readonly ownsRuntime: boolean;
  readonly ownsDatabase: boolean;
  readonly ownsApi: boolean;
  readonly ownsServerDeploy: boolean;
};

const hostedServer = {
  kind: "hosted-server",
  apis: ["trpc", "orpc", "none"],
  examples: { ai: true },
  supportsPayments: true,
  ownsRuntime: false,
  ownsDatabase: false,
  ownsApi: false,
  ownsServerDeploy: false,
} as const satisfies BackendCapabilities;

export const BACKEND_CAPABILITIES = {
  hono: { ...hostedServer, apis: ["trpc", "orpc", "orval", "none"] },
  express: { ...hostedServer },
  fastify: { ...hostedServer },
  elysia: { ...hostedServer },
  nestjs: {
    ...hostedServer,
    apis: ["none"],
    examples: { ai: false },
    auth: ["better-auth", "none"],
    databases: ["none", "postgres"],
    orms: ["none", "prisma"],
    supportsPayments: false,
  },
  convex: {
    kind: "convex",
    apis: ["none"],
    examples: { ai: true },
    supportsPayments: false,
    ownsRuntime: true,
    ownsDatabase: true,
    ownsApi: true,
    ownsServerDeploy: true,
  },
  self: {
    kind: "fullstack-self",
    apis: ["trpc", "orpc", "none"],
    examples: { ai: true },
    supportsPayments: true,
    ownsRuntime: true,
    ownsDatabase: false,
    ownsApi: false,
    ownsServerDeploy: true,
  },
  none: {
    kind: "none",
    apis: ["none"],
    examples: { ai: false },
    supportsPayments: false,
    ownsRuntime: true,
    ownsDatabase: true,
    ownsApi: true,
    ownsServerDeploy: true,
  },
} as const satisfies Record<Backend, BackendCapabilities>;

export function isBackend(value: unknown): value is Backend {
  return typeof value === "string" && Object.hasOwn(BACKEND_CAPABILITIES, value);
}

export function getBackendCapabilities(backend: Backend): BackendCapabilities {
  return BACKEND_CAPABILITIES[backend];
}

export function backendAllowsOnlyNoneApi(backend?: string): boolean {
  if (!isBackend(backend)) return false;
  const { apis } = BACKEND_CAPABILITIES[backend];
  return apis.length === 1 && apis[0] === "none";
}

export function backendAllowsApi(backend: string | undefined, api: API): boolean {
  if (!isBackend(backend)) return api !== "orval";
  return getBackendCapabilities(backend).apis.includes(api);
}

export function backendAllowsAiExample(backend?: string): boolean {
  if (!isBackend(backend)) return true;
  return BACKEND_CAPABILITIES[backend].examples.ai;
}

export function getBackendCompatibilityIssue({
  backend,
  api,
  auth,
  database,
  orm,
  examples = [],
  payments = [],
}: BackendCompatibilityInput): BackendCompatibilityIssue | null {
  if (!isBackend(backend)) return null;
  const capabilities = getBackendCapabilities(backend);

  // Keep this order: CLI consumers preserve the first existing product error.
  const restrictions: readonly [BackendCompatibilityIssue, boolean][] = [
    ["api-unsupported", !allowsValue(capabilities.apis, api ?? "")],
    ["auth-unsupported", !allowsValue(capabilities.auth, auth ?? "none")],
    ["database-unsupported", !!database && !allowsValue(capabilities.databases, database)],
    ["orm-unsupported", !!orm && !allowsValue(capabilities.orms, orm)],
    ["example-ai-unsupported", examples.includes("ai") && !capabilities.examples.ai],
    ["payments-unsupported", payments.length > 0 && !capabilities.supportsPayments],
  ];

  return restrictions.find(([, violated]) => violated)?.[0] ?? null;
}

function allowsValue(allowed: readonly string[] | undefined, value: string): boolean {
  return allowed === undefined || allowed.includes(value);
}
