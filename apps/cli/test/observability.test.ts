import { describe, expect, it } from "bun:test";

import { generateReproducibleCommand } from "@kubojs/template-generator";

import { createVirtual } from "../src/index";
import type { ProjectConfig } from "../src/types";
import { processFlags } from "../src/utils/config-processing";
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

describe("observability CLI flag processing", () => {
  it("keeps --observability from Stack Builder commands in processFlags", () => {
    const noneConfig = processFlags({
      observability: "none",
      payments: "none",
      backend: "none",
    });
    expect(noneConfig.observability).toBe("none");
    expect(noneConfig.payments).toBe("none");

    const getMonitorConfig = processFlags({
      observability: "getmonitor",
      backend: "hono",
    });
    expect(getMonitorConfig.observability).toBe("getmonitor");
  });

  it("includes --observability none in the reproducible create command", () => {
    const config = {
      projectName: "atscopilot",
      projectDir: "/tmp/atscopilot",
      relativePath: "atscopilot",
      frontend: ["tanstack-router"],
      backend: "none",
      runtime: "none",
      database: "none",
      orm: "none",
      api: "none",
      auth: "none",
      payments: "none",
      observability: "none",
      addons: ["biome"],
      examples: [],
      dbSetup: "none",
      packageManager: "bun",
      git: true,
      install: true,
      webDeploy: "vercel",
      serverDeploy: "none",
    } satisfies ProjectConfig;

    const command = generateReproducibleCommand(config);
    expect(command).toContain("--observability none");
    expect(command).toContain("--payments none");
  });
});
