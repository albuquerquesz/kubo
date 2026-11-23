import { describe, expect, test } from "bun:test";

import { createVirtual } from "../../src/index";
import { createMatrixConfig } from "./cases";
import { evaluateMatrixConfig } from "./oracle";

describe("compatibility matrix oracle", () => {
  test("returns canonical issue codes instead of local rule names", () => {
    const result = evaluateMatrixConfig(
      createMatrixConfig({
        backend: "convex",
        runtime: "bun",
        database: "none",
        orm: "none",
        api: "none",
        serverDeploy: "none",
      }),
    );

    expect(result).toEqual({
      valid: false,
      rules: ["backend-convex-runtime"],
    });
  });

  const chatbotBase = {
    backend: "self",
    runtime: "none",
    database: "none",
    orm: "none",
    api: "none",
    examples: ["chatbot"],
  } as const;

  test.each(["next", "tanstack-start"] as const)("accepts chatbot on %s fullstack", (frontend) => {
    expect(
      evaluateMatrixConfig(createMatrixConfig({ ...chatbotBase, frontend: [frontend] })),
    ).toEqual({ valid: true, rules: [] });
  });

  test.each([
    ["svelte", { frontend: ["svelte"] }, "example-chatbot-frontend"],
    ["nuxt", { frontend: ["nuxt"] }, "example-chatbot-frontend"],
    ["native", { frontend: ["next", "native-bare"] }, "example-chatbot-frontend"],
    [
      "a separate backend",
      { backend: "hono", runtime: "bun", frontend: ["tanstack-router"] },
      "example-chatbot-backend",
    ],
    ["the ai example", { frontend: ["next"], examples: ["chatbot", "ai"] }, "example-chatbot-ai"],
  ] as const)("rejects chatbot with %s", (_label, overrides, rule) => {
    const result = evaluateMatrixConfig(
      createMatrixConfig({
        ...chatbotBase,
        ...overrides,
        frontend: [...overrides.frontend],
        examples: [...("examples" in overrides ? overrides.examples : chatbotBase.examples)],
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.rules).toContain(rule);
  });

  test("reads the structured compatibility code from generation errors", async () => {
    const result = await createVirtual({
      frontend: ["nuxt"],
      api: "trpc",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) return;

    expect(result.error.compatibilityCode).toBe("api-frontend");
    expect(result.error.message).toContain("tRPC API is not supported");
  });
});
