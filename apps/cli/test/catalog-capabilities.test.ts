import { describe, expect, test } from "bun:test";

import type { CLIInput, ProjectConfig } from "../src/types";
import {
  allowedApisForFrontends,
  isApiCompatibleWithBackend,
  isExampleAIAllowedForBackend,
  validateCommunicationCompatibility,
} from "../src/utils/compatibility-rules";
import { validateBackendConstraints } from "../src/utils/config-validation";
import { getProvidedFlags, processAndValidateFlags } from "../src/validation";

describe("catalog consumers preserve CLI product messages", () => {
  const nestjsCases: { config: Partial<ProjectConfig>; message: string }[] = [
    {
      config: { api: "trpc" },
      message: "NestJS currently supports no API layer yet. Please use '--api none'.",
    },
    {
      config: { api: "orval" },
      message: "NestJS currently supports no API layer yet. Please use '--api none'.",
    },
    {
      config: { auth: "clerk" },
      message:
        "NestJS backend currently supports Better Auth or no authentication. Please use '--auth better-auth' or '--auth none'.",
    },
    {
      config: { database: "sqlite" },
      message:
        "NestJS backend currently supports PostgreSQL as its database. Please use '--database postgres'.",
    },
    {
      config: { orm: "drizzle" },
      message: "NestJS backend currently supports Prisma as its ORM. Please use '--orm prisma'.",
    },
    {
      config: { examples: ["ai"] },
      message:
        "The 'ai' example is not supported with NestJS yet. Please remove 'ai' from --examples.",
    },
    {
      config: { payments: ["stripe"] },
      message:
        "Payment integrations are not supported with NestJS yet. Please remove payment providers.",
    },
  ];

  test.each(nestjsCases)("keeps the NestJS message for $config", ({ config, message }) => {
    const result = validateBackendConstraints(
      { backend: "nestjs", api: "none", ...config },
      new Set(),
      {},
    );
    expect(result.match({ ok: () => null, err: (error) => error.message })).toBe(message);
  });

  test.each(["trpc", "orval"] as const)("reports the NestJS error first for %s flags", (api) => {
    const options: CLIInput = { backend: "nestjs", api };
    const result = processAndValidateFlags(options, getProvidedFlags(options), "catalog-app");
    expect(result.match({ ok: () => null, err: (error) => error.message })).toBe(
      "NestJS currently supports no API layer yet. Please use '--api none'.",
    );
  });

  test.each([
    ["resend", "Resend"],
    ["notifique", "Notifique"],
    ["arara", "AraraHQ"],
  ] as const)("preserves the %s backend error and allows the backend prompt", (provider, name) => {
    const result = validateCommunicationCompatibility(provider, "none");
    expect(result.match({ ok: () => null, err: (error) => error.message })).toBe(
      `${name} communication requires a server backend. Please choose a backend or use '--communication none'.`,
    );

    const options: CLIInput = { communication: provider };
    expect(processAndValidateFlags(options, getProvidedFlags(options), "catalog-app").isOk()).toBe(
      true,
    );
  });

  test("keeps the AraraHQ runtime message for either Workers signal", () => {
    const results = [
      validateCommunicationCompatibility("arara", "hono", "workers"),
      validateCommunicationCompatibility("arara", "hono", "node", "cloudflare"),
    ];
    for (const result of results) {
      expect(result.match({ ok: () => null, err: (error) => error.message })).toBe(
        "AraraHQ requires the official Node SDK and is not compatible with Edge/Workers runtimes. Use a Node/Bun server deployment or Convex Node Action.",
      );
    }
  });

  test("rejects AraraHQ + Workers before the backend prompt", () => {
    const options: CLIInput = { communication: "arara", runtime: "workers" };
    expect(
      processAndValidateFlags(options, getProvidedFlags(options), "catalog-app").match({
        ok: () => null,
        err: (error) => error.message,
      }),
    ).toBe(
      "AraraHQ requires the official Node SDK and is not compatible with Edge/Workers runtimes. Use a Node/Bun server deployment or Convex Node Action.",
    );

    const resendWorkers: CLIInput = { communication: "resend", runtime: "workers" };
    expect(
      processAndValidateFlags(resendWorkers, getProvidedFlags(resendWorkers), "catalog-app").isOk(),
    ).toBe(true);
  });
});

describe("catalog-backed prompt filtering", () => {
  test("keeps API ordering and frontend restrictions", () => {
    expect(allowedApisForFrontends(["next"], "hono")).toEqual(["trpc", "orpc", "orval", "none"]);
    expect(allowedApisForFrontends(["next"], "express")).toEqual(["trpc", "orpc", "none"]);
    expect(allowedApisForFrontends(["next"])).toEqual(["trpc", "orpc", "none"]);
    for (const frontend of ["nuxt", "svelte", "solid", "astro"] as const) {
      expect(allowedApisForFrontends([frontend], "hono")).toEqual(["orpc", "orval", "none"]);
      expect(allowedApisForFrontends([frontend], "self")).toEqual(["orpc", "none"]);
    }
    for (const backend of ["nestjs", "convex", "none"] as const) {
      expect(allowedApisForFrontends(["next"], backend)).toEqual(["none"]);
    }
  });

  test("leaves non-Orval validation to backend constraints", () => {
    expect(isApiCompatibleWithBackend("trpc", "nestjs")).toBe(true);
    expect(isApiCompatibleWithBackend("orval", "nestjs")).toBe(false);
    expect(isApiCompatibleWithBackend("orval", "hono")).toBe(true);
    expect(isApiCompatibleWithBackend("orval", undefined)).toBe(false);
    expect(isExampleAIAllowedForBackend("none", "ai")).toBe(false);
    expect(isExampleAIAllowedForBackend("convex", "ai")).toBe(true);
    expect(isExampleAIAllowedForBackend("nestjs", "todo")).toBe(true);
  });
});
