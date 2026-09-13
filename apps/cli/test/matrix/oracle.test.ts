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
