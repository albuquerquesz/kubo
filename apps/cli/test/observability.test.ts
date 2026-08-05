import { describe, expect, it } from "bun:test";

import { generateReproducibleCommand } from "@kubojs/template-generator";

import { createVirtual } from "../src/index";
import type { ProjectConfig } from "../src/types";
import { processFlags } from "../src/utils/config-processing";
import { collectFiles } from "./setup";

describe("GetMonitor observability", () => {
  it("generates the browser and Node SDK integrations with schema-backed env vars", async () => {
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
    const files = collectFiles(result.value.root, "/virtual");
    const webPackage = JSON.parse(files.get("apps/web/package.json") ?? "{}");
    const serverPackage = JSON.parse(files.get("apps/server/package.json") ?? "{}");

    expect(readme).toContain("## GetMonitor Setup");
    expect(readme).toContain("JavaScript error-tracking SDK");
    expect(readme).not.toContain("uptime monitoring");
    expect(webPackage.dependencies["@getmonitor/browser"]).toBe("^0.1.0");
    expect(serverPackage.dependencies["@getmonitor/node"]).toBe("^0.1.0");
    expect(files.get("apps/web/src/lib/getmonitor.ts")).toContain("GetMonitor.init");
    expect(files.get("apps/web/.env")).toContain("VITE_GETMONITOR_API_KEY=");
    expect(files.get("apps/server/src/getmonitor.ts")).toContain("new GetMonitor");
    expect(files.get("apps/server/.env")).toContain("GETMONITOR_API_KEY=");
  });

  it("keeps Express error handling in the generated pipeline", async () => {
    const result = await createVirtual({
      projectName: "getmonitor-express-app",
      frontend: [],
      backend: "express",
      runtime: "bun",
      database: "none",
      orm: "none",
      auth: "none",
      payments: "none",
      observability: "getmonitor",
      addons: ["none"],
      examples: ["none"],
      dbSetup: "none",
      api: "none",
      webDeploy: "none",
      serverDeploy: "none",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    const files = collectFiles(result.value.root, "/virtual");
    const server = files.get("apps/server/src/index.ts") ?? "";
    expect(server).toContain("setupExpressErrorHandler(getMonitor, app)");
    expect(server).toContain('from "@getmonitor/node"');
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
