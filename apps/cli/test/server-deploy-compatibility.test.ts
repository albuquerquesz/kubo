import { describe, expect, it } from "bun:test";

import type { ServerDeploy } from "../src/types";
import { validateServerDeploy } from "../src/utils/compatibility-rules";

const dedicatedServerDeploys = [
  "docker",
  "vercel",
  "railway",
  "guaracloud",
] as const satisfies readonly ServerDeploy[];

describe("server deploy compatibility", () => {
  it.each(dedicatedServerDeploys)("rejects %s for Convex", (serverDeploy) => {
    const result = validateServerDeploy(serverDeploy, "convex", "none");

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain(
        `'--server-deploy ${serverDeploy}' requires a separate server backend`,
      );
    }
  });

  it.each(dedicatedServerDeploys)("rejects %s for a self backend", (serverDeploy) => {
    const result = validateServerDeploy(serverDeploy, "self", "none");

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain(
        `'--server-deploy ${serverDeploy}' requires a separate server backend`,
      );
    }
  });

  it.each(dedicatedServerDeploys)("rejects %s with Workers", (serverDeploy) => {
    const result = validateServerDeploy(serverDeploy, "hono", "workers");

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain(
        `'--server-deploy ${serverDeploy}' is not compatible with '--runtime workers'`,
      );
    }
  });

  it.each(dedicatedServerDeploys)("allows %s for a server backend on Bun", (serverDeploy) => {
    expect(validateServerDeploy(serverDeploy, "hono", "bun").isOk()).toBe(true);
  });

  it("leaves Cloudflare and none to their dedicated validation rules", () => {
    expect(validateServerDeploy("cloudflare", "hono", "workers").isOk()).toBe(true);
    expect(validateServerDeploy("none", "none", "none").isOk()).toBe(true);
  });
});
