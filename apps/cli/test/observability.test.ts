import { describe, expect, it } from "bun:test";

import { generateReproducibleCommand } from "@kubojs/template-generator";

import { DEFAULT_CONFIG } from "../src/constants";
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

    const files = collectFiles(result.value.root, "/virtual");
    const readme = files.get("README.md");
    const webPackage = JSON.parse(files.get("apps/web/package.json") ?? "{}");
    const serverPackage = JSON.parse(files.get("apps/server/package.json") ?? "{}");
    const getmonitorClient = files.get("apps/web/src/lib/getmonitor.ts") ?? "";
    const rootRoute = files.get("apps/web/src/routes/__root.tsx") ?? "";
    const serverGm = files.get("apps/server/src/getmonitor.ts") ?? "";
    const webEnv = files.get("apps/web/.env") ?? "";
    const serverEnv = files.get("apps/server/.env") ?? "";
    const webEnvSchema = files.get("packages/env/src/web.ts") ?? "";
    const serverEnvSchema = files.get("packages/env/src/server.ts") ?? "";

    expect(readme).toContain("## GetMonitor Setup");
    expect(readme).toContain("JavaScript error-tracking SDK");
    expect(readme).toContain("ingest.getmonitor.io");
    expect(readme).not.toContain("uptime monitoring");
    expect(readme).not.toContain("GETMONITOR_API_HOST");
    expect(readme).not.toContain("getmonitor.com");

    expect(webPackage.dependencies["@getmonitor/browser"]).toBe("^0.1.0");
    expect(webPackage.dependencies["@getmonitor/react"]).toBe("^0.1.0");
    expect(serverPackage.dependencies["@getmonitor/node"]).toBe("^0.1.0");

    expect(getmonitorClient).toContain("GetMonitor.init");
    expect(getmonitorClient).toContain("captureConsoleErrors: false");
    expect(getmonitorClient).not.toContain("apiHost");
    expect(rootRoute).toContain("GetMonitorErrorBoundary");
    expect(serverGm).toContain("new GetMonitor");
    expect(serverGm).not.toContain("apiHost");

    expect(webEnv).toContain("VITE_GETMONITOR_API_KEY=");
    expect(webEnv).not.toContain("GETMONITOR_API_HOST");
    expect(webEnv).not.toContain("VITE_GETMONITOR_API_HOST");
    expect(serverEnv).toContain("GETMONITOR_API_KEY=");
    expect(serverEnv).not.toContain("GETMONITOR_API_HOST");

    expect(webEnvSchema).toContain("VITE_GETMONITOR_API_KEY");
    expect(webEnvSchema).not.toContain("GETMONITOR_API_HOST");
    expect(serverEnvSchema).toContain("GETMONITOR_API_KEY");
    expect(serverEnvSchema).not.toContain("GETMONITOR_API_HOST");
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

  it("wires Next.js ErrorBoundary and conditional source-map upload", async () => {
    const result = await createVirtual({
      projectName: "getmonitor-next-app",
      frontend: ["next"],
      backend: "hono",
      runtime: "bun",
      database: "none",
      orm: "none",
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

    const files = collectFiles(result.value.root, "/virtual");
    const webPackage = JSON.parse(files.get("apps/web/package.json") ?? "{}");
    const provider = files.get("apps/web/src/components/getmonitor.tsx") ?? "";
    const layout = files.get("apps/web/src/app/layout.tsx") ?? "";
    const nextConfig = files.get("apps/web/next.config.ts") ?? "";
    const webEnv = files.get("apps/web/.env") ?? "";

    expect(webPackage.dependencies["@getmonitor/browser"]).toBe("^0.1.0");
    expect(webPackage.dependencies["@getmonitor/react"]).toBe("^0.1.0");
    expect(webPackage.devDependencies["@getmonitor/nextjs-config"]).toBe("^0.1.0");

    expect(provider).toContain("GetMonitor.init");
    expect(provider).toContain("captureConsoleErrors: false");
    expect(provider).toContain("GetMonitorErrorBoundary");
    expect(provider).not.toContain("apiHost");
    expect(layout).toContain("GetMonitorProvider");
    expect(layout).toContain("GetMonitorBoundary");

    expect(nextConfig).toContain("withGetMonitor");
    expect(nextConfig).toContain("GETMONITOR_AUTH_TOKEN");
    expect(webEnv).toContain("NEXT_PUBLIC_GETMONITOR_API_KEY=");
    expect(webEnv).toContain("GETMONITOR_AUTH_TOKEN=");
    expect(webEnv).not.toContain("GETMONITOR_API_HOST");
  });

  it("wires Nuxt client plugin and source-map module", async () => {
    const result = await createVirtual({
      projectName: "getmonitor-nuxt-app",
      frontend: ["nuxt"],
      backend: "hono",
      runtime: "bun",
      database: "none",
      orm: "none",
      auth: "none",
      payments: "none",
      observability: "getmonitor",
      addons: ["none"],
      examples: ["none"],
      dbSetup: "none",
      api: "orpc",
      webDeploy: "none",
      serverDeploy: "none",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    const files = collectFiles(result.value.root, "/virtual");
    const webPackage = JSON.parse(files.get("apps/web/package.json") ?? "{}");
    const plugin = files.get("apps/web/app/plugins/getmonitor.client.ts") ?? "";
    const nuxtConfig = files.get("apps/web/nuxt.config.ts") ?? "";
    const webEnv = files.get("apps/web/.env") ?? "";

    expect(webPackage.dependencies["@getmonitor/browser"]).toBe("^0.1.0");
    expect(webPackage.devDependencies["@getmonitor/nuxt"]).toBe("^0.1.0");
    expect(plugin).toContain("GetMonitor.init");
    expect(plugin).not.toContain("apiHost");
    expect(nuxtConfig).toContain("@getmonitor/nuxt");
    expect(nuxtConfig).toContain("getmonitor:");
    expect(nuxtConfig).toContain("GETMONITOR_AUTH_TOKEN");
    expect(webEnv).toContain("NUXT_PUBLIC_GETMONITOR_API_KEY=");
    expect(webEnv).toContain("GETMONITOR_AUTH_TOKEN=");
  });
});

describe("Himetrica observability", () => {
  it("generates a browser tracker for Vite-based web apps", async () => {
    const result = await createVirtual({
      projectName: "himetrica-app",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "none",
      orm: "none",
      auth: "none",
      payments: "none",
      observability: "himetrica",
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
    const webPackage = JSON.parse(files.get("apps/web/package.json") ?? "{}");
    const tracker = files.get("apps/web/src/lib/himetrica.ts") ?? "";
    const entry = files.get("apps/web/src/main.tsx") ?? "";
    const webEnv = files.get("apps/web/.env") ?? "";
    const readme = files.get("README.md") ?? "";

    expect(webPackage.dependencies["@himetrica/tracker-js"]).toBe("^0.1.36");
    expect(tracker).toContain("new HimetricaClient");
    expect(tracker).toContain("autoTrackPageViews: true");
    expect(entry).toContain('import "./lib/himetrica";');
    expect(webEnv).toContain("VITE_HIMETRICA_API_KEY=");
    expect(readme).toContain("## Himetrica Setup");
    expect(readme).not.toContain("## GetMonitor Setup");
  });

  it("wraps generated Next.js providers with the Himetrica React provider", async () => {
    const result = await createVirtual({
      projectName: "himetrica-next-app",
      frontend: ["next"],
      backend: "hono",
      runtime: "bun",
      database: "none",
      orm: "none",
      auth: "none",
      payments: "none",
      observability: "himetrica",
      addons: ["none"],
      examples: ["none"],
      dbSetup: "none",
      api: "trpc",
      webDeploy: "none",
      serverDeploy: "none",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    const files = collectFiles(result.value.root, "/virtual");
    const provider = files.get("apps/web/src/components/himetrica.tsx") ?? "";
    const layout = files.get("apps/web/src/app/layout.tsx") ?? "";
    const webEnv = files.get("apps/web/.env") ?? "";

    expect(provider).toContain('from "@himetrica/tracker-js/react"');
    expect(provider).toContain("autoTrackErrors trackVitals");
    expect(layout).toContain("KuboHimetricaProvider");
    expect(layout.match(/<KuboHimetricaProvider>/g)?.length).toBe(1);
    expect(layout.match(/<\/KuboHimetricaProvider>/g)?.length).toBe(1);
    expect(webEnv).toContain("NEXT_PUBLIC_HIMETRICA_API_KEY=");
  });
});

describe("observability CLI flag processing", () => {
  it("defaults interactive and --yes paths to getmonitor", () => {
    expect(DEFAULT_CONFIG.observability).toEqual(["getmonitor"]);
  });

  it("keeps --observability from Stack Builder commands in processFlags", () => {
    const noneConfig = processFlags({
      observability: "none",
      payments: "none",
      backend: "none",
    });
    expect(noneConfig.observability).toEqual([]);
    expect(noneConfig.payments).toEqual([]);

    const getMonitorConfig = processFlags({
      observability: "getmonitor",
      backend: "hono",
    });
    expect(getMonitorConfig.observability).toEqual(["getmonitor"]);

    const himetricaConfig = processFlags({
      observability: "himetrica",
      backend: "hono",
    });
    expect(himetricaConfig.observability).toEqual(["himetrica"]);
  });

  it("uses --disable-observability in the reproducible create command", () => {
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
      payments: [],
      observability: "none",
      communication: "none",
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
    expect(command).toContain("--disable-observability");
    expect(command).toContain("--payments none");
  });

  it("preserves both providers in a combined configuration", async () => {
    const result = await createVirtual({
      projectName: "combined-observability-app",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "none",
      orm: "none",
      auth: "none",
      payments: "none",
      observability: ["getmonitor", "himetrica"],
      addons: [],
      examples: [],
      dbSetup: "none",
      api: "none",
      webDeploy: "none",
      serverDeploy: "none",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;
    const files = collectFiles(result.value.root, "/virtual");
    const readme = files.get("README.md") ?? "";
    const webPackage = JSON.parse(files.get("apps/web/package.json") ?? "{}");
    expect(webPackage.dependencies["@getmonitor/browser"]).toBe("^0.1.0");
    expect(webPackage.dependencies["@himetrica/tracker-js"]).toBe("^0.1.36");
    expect(files.get("apps/web/src/lib/getmonitor.ts")).toContain("GetMonitor.init");
    expect(files.get("apps/web/src/lib/himetrica.ts")).toContain("HimetricaClient");
    expect(readme).toContain("## GetMonitor Setup");
    expect(readme).toContain("## Himetrica Setup");
  });
});
