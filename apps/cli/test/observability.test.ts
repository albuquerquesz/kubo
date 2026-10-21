import { describe, expect, it } from "bun:test";

import {
  EMBEDDED_TEMPLATES,
  generate,
  generateReproducibleCommand,
} from "@kubojs/template-generator";

import { DEFAULT_CONFIG } from "../src/constants";
import { createVirtual } from "../src/index";
import type { ProjectConfig } from "../src/types";
import { normalizeObservability, processFlags } from "../src/utils/config-processing";
import { collectFiles } from "./setup";

describe("canonical observability normalization", () => {
  it("deduplicates selections and drops the removed GetMonitor provider", async () => {
    // Older kubo.jsonc files may still list GetMonitor.
    const result = await generate({
      config: {
        ...DEFAULT_CONFIG,
        observability: JSON.parse('["himetrica", "getmonitor", "himetrica"]'),
      },
      templates: EMBEDDED_TEMPLATES,
    });
    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw result.error;
    expect(result.value.config.observability).toEqual(["himetrica"]);
  });

  it("returns a generator error instead of silently dropping an unknown provider", async () => {
    // Simulate a config crossing an untyped JSON boundary.
    const result = await generate({
      config: { ...DEFAULT_CONFIG, observability: JSON.parse('["himetrica", "unknown"]') },
      templates: EMBEDDED_TEMPLATES,
    });
    expect(result.match({ ok: () => null, err: (error) => error.message })).toBe(
      "Unsupported observability provider(s): unknown",
    );
  });

  it("uses the same normalization contract through the CLI re-export", () => {
    expect(normalizeObservability(["none", "himetrica", "himetrica"])).toEqual(["himetrica"]);
    expect(() => normalizeObservability("unknown")).toThrow(
      "Unsupported observability provider(s): unknown",
    );
  });
});

describe("GetMonitor removal", () => {
  it("ignores GetMonitor when it comes from a legacy project config", () => {
    expect(normalizeObservability(["getmonitor"])).toEqual([]);
  });

  it("emits no GetMonitor code, deps, or env vars for full-stack projects", async () => {
    for (const frontend of ["tanstack-router", "next", "nuxt", "react-router"] as const) {
      const result = await createVirtual({
        projectName: `${frontend}-app`,
        frontend: [frontend],
        backend: "express",
        runtime: "node",
        database: "none",
        orm: "none",
        auth: "none",
        payments: "none",
        addons: ["none"],
        examples: ["none"],
        dbSetup: "none",
        api: "none",
        webDeploy: "none",
        serverDeploy: "none",
      });

      expect(result.isOk()).toBe(true);
      if (result.isErr()) continue;

      const files = collectFiles(result.value.root, "/virtual");
      for (const [path, content] of files) {
        expect(`${path}: ${content}`).not.toMatch(/getmonitor/i);
      }
    }
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
  it("defaults interactive and --yes paths to no observability provider", () => {
    expect(DEFAULT_CONFIG.observability).toEqual([]);
  });

  it("keeps --observability from Stack Builder commands in processFlags", () => {
    const noneConfig = processFlags({
      observability: "none",
      payments: "none",
      backend: "none",
    });
    expect(noneConfig.observability).toEqual([]);
    expect(noneConfig.payments).toEqual([]);

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
      communication: [],
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
});
