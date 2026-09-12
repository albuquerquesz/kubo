import { describe, expect, test } from "bun:test";

import {
  BACKEND_CAPABILITIES,
  BackendSchema,
  ObservabilityProviderSchema,
  backendAllowsAiExample,
  backendAllowsApi,
  backendAllowsOnlyNoneApi,
  getBackendCompatibilityIssue,
  getCommunicationCompatibilityIssue,
  normalizeObservability,
  isBackend,
  isCommunicationProvider,
  isObservabilityProvider,
  type BackendCompatibilityInput,
} from "../src/index.ts";

describe("communication compatibility issues", () => {
  test("none or unknown provider yields no issue", () => {
    expect(getCommunicationCompatibilityIssue({ provider: "none", backend: "none" })).toBeNull();
    expect(getCommunicationCompatibilityIssue({ provider: undefined })).toBeNull();
    expect(getCommunicationCompatibilityIssue({ provider: "smtp" })).toBeNull();
  });

  test("every provider requires a server backend", () => {
    expect(getCommunicationCompatibilityIssue({ provider: "resend", backend: "none" })).toBe(
      "requires-backend",
    );
    expect(getCommunicationCompatibilityIssue({ provider: "notifique" })).toBe("requires-backend");
    expect(getCommunicationCompatibilityIssue({ provider: "arara", backend: "none" })).toBe(
      "requires-backend",
    );
    expect(getCommunicationCompatibilityIssue({ provider: "resend", backend: "hono" })).toBeNull();
  });

  test("AraraHQ rejects workers unless Convex owns the runtime", () => {
    expect(
      getCommunicationCompatibilityIssue({
        provider: "arara",
        backend: "hono",
        runtime: "workers",
      }),
    ).toBe("workers-unsupported");
    expect(
      getCommunicationCompatibilityIssue({
        provider: "arara",
        backend: "hono",
        serverDeploy: "cloudflare",
      }),
    ).toBe("workers-unsupported");
    expect(
      getCommunicationCompatibilityIssue({
        provider: "arara",
        backend: "convex",
        runtime: "workers",
      }),
    ).toBeNull();
    expect(
      getCommunicationCompatibilityIssue({
        provider: "resend",
        backend: "hono",
        runtime: "workers",
      }),
    ).toBeNull();
  });

  test("missing backend takes priority over the runtime restriction", () => {
    expect(getCommunicationCompatibilityIssue({ provider: "arara", runtime: "workers" })).toBe(
      "requires-backend",
    );
  });

  test.each(["resend", "notifique", "arara"])("allows %s in Convex Node Actions", (provider) => {
    expect(
      getCommunicationCompatibilityIssue({
        provider,
        backend: "convex",
        runtime: "workers",
        serverDeploy: "cloudflare",
      }),
    ).toBeNull();
  });
});

describe("normalizeObservability", () => {
  test("none and undefined become an empty selection", () => {
    expect(normalizeObservability(undefined)).toEqual([]);
    expect(normalizeObservability("none")).toEqual([]);
  });

  test("accepts a single provider or a unique array", () => {
    expect(normalizeObservability("getmonitor")).toEqual(["getmonitor"]);
    expect(normalizeObservability(["himetrica", "getmonitor", "himetrica"])).toEqual([
      "himetrica",
      "getmonitor",
    ]);
  });

  test("unknown providers fail at the type boundary", () => {
    expect(() => normalizeObservability("datadog")).toThrow(/Unsupported observability provider/);
  });

  test("normalizes every schema provider without dropping a selection", () => {
    for (const provider of ObservabilityProviderSchema.options) {
      expect(normalizeObservability(provider)).toEqual([provider]);
    }
    expect(normalizeObservability(["none", "himetrica", "none"])).toEqual(["himetrica"]);
    expect(normalizeObservability([])).toEqual([]);
  });

  test.each([[null], [123], [{}], [["getmonitor", "unknown"]]])(
    "rejects invalid input %j",
    (value) => {
      expect(() => normalizeObservability(value)).toThrow(/Unsupported observability provider/);
    },
  );
});

describe("backend compatibility issues", () => {
  test("NestJS allow-list is none-only for APIs and rejects AI", () => {
    expect(backendAllowsOnlyNoneApi("nestjs")).toBe(true);
    expect(backendAllowsOnlyNoneApi("hono")).toBe(false);
    expect(backendAllowsAiExample("nestjs")).toBe(false);
    expect(backendAllowsAiExample("hono")).toBe(true);
    expect(BACKEND_CAPABILITIES.nestjs.kind).toBe("hosted-server");
  });

  test("NestJS reports the first violated restriction", () => {
    expect(getBackendCompatibilityIssue({ backend: "nestjs", api: "trpc" })).toBe(
      "api-unsupported",
    );
    expect(getBackendCompatibilityIssue({ backend: "nestjs", api: "none" })).toBeNull();
    expect(getBackendCompatibilityIssue({ backend: "nestjs", api: "none", auth: "clerk" })).toBe(
      "auth-unsupported",
    );
    expect(
      getBackendCompatibilityIssue({
        backend: "nestjs",
        api: "none",
        database: "sqlite",
      }),
    ).toBe("database-unsupported");
    expect(getBackendCompatibilityIssue({ backend: "nestjs", api: "none", orm: "drizzle" })).toBe(
      "orm-unsupported",
    );
    expect(
      getBackendCompatibilityIssue({
        backend: "nestjs",
        api: "none",
        examples: ["ai"],
      }),
    ).toBe("example-ai-unsupported");
    expect(
      getBackendCompatibilityIssue({
        backend: "nestjs",
        api: "none",
        payments: ["stripe"],
      }),
    ).toBe("payments-unsupported");
  });

  test("hosted servers that allow tRPC do not emit NestJS issues", () => {
    expect(getBackendCompatibilityIssue({ backend: "hono", api: "trpc" })).toBeNull();
    expect(getBackendCompatibilityIssue({ backend: "hono", api: "orval" })).toBeNull();
    expect(getBackendCompatibilityIssue({ backend: "express", api: "orval" })).toBe(
      "api-unsupported",
    );
  });

  test("reports the earliest violation when several restrictions fail", () => {
    const input: BackendCompatibilityInput = {
      backend: "nestjs",
      api: "trpc",
      auth: "clerk",
      database: "sqlite",
      orm: "drizzle",
      examples: ["ai"],
      payments: ["stripe"],
    };
    expect(getBackendCompatibilityIssue(input)).toBe("api-unsupported");
    input.api = "none";
    expect(getBackendCompatibilityIssue(input)).toBe("auth-unsupported");
    input.auth = "none";
    expect(getBackendCompatibilityIssue(input)).toBe("database-unsupported");
    input.database = "postgres";
    expect(getBackendCompatibilityIssue(input)).toBe("orm-unsupported");
    input.orm = "prisma";
    expect(getBackendCompatibilityIssue(input)).toBe("example-ai-unsupported");
    input.examples = [];
    expect(getBackendCompatibilityIssue(input)).toBe("payments-unsupported");
    input.payments = [];
    expect(getBackendCompatibilityIssue(input)).toBeNull();
  });

  test("only Hono supports Orval and only NestJS/none disallow AI", () => {
    for (const backend of BackendSchema.options) {
      expect(backendAllowsApi(backend, "orval")).toBe(backend === "hono");
      expect(backendAllowsAiExample(backend)).toBe(!["nestjs", "none"].includes(backend));
    }
    expect(backendAllowsApi(undefined, "orval")).toBe(false);
    expect(backendAllowsAiExample(undefined)).toBe(true);
    expect(backendAllowsOnlyNoneApi(undefined)).toBe(false);
  });

  test("missing API preserves the NestJS validation error", () => {
    expect(getBackendCompatibilityIssue({ backend: "nestjs" })).toBe("api-unsupported");
  });
});

describe("catalog input guards", () => {
  test.each([undefined, null, "unknown", "constructor", "toString", "__proto__"])(
    "ignores non-provider keys %j",
    (value) => {
      expect(isBackend(value)).toBe(false);
      expect(isCommunicationProvider(value)).toBe(false);
      expect(isObservabilityProvider(value)).toBe(false);
      if (typeof value === "string") {
        expect(getBackendCompatibilityIssue({ backend: value })).toBeNull();
        expect(backendAllowsOnlyNoneApi(value)).toBe(false);
        expect(getCommunicationCompatibilityIssue({ provider: value })).toBeNull();
      }
    },
  );
});
