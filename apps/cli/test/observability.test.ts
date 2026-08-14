import { describe, expect, it } from "bun:test";

import { createVirtual } from "../src/index";
import { collectFiles } from "./setup";

describe("GetMonitor observability", () => {
  it("generates GetMonitor setup guidance without adding runtime dependencies", async () => {
    const result = await createVirtual({
      projectName: "getmonitor-app",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      payments: "none",
      observability: "getmonitor",
      addons: ["none"],
      examples: ["none"],
      dbSetup: "none",
      api: "trpc",
      webDeploy: "none",
      serverDeploy: "none",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    const readme = collectFiles(result.value.root, "/virtual").get("README.md");
    expect(readme).toContain("## GetMonitor Setup");
    expect(readme).toContain("https://getmonitor.io/docs/getting-started/introduction/");
    expect(readme).toContain("GetMonitor");
  });
});
