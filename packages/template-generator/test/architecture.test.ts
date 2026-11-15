import { describe, expect, it } from "bun:test";
import path from "node:path";

import {
  normalizeCompatibility,
  type Architecture,
  type LayoutConfig,
  type ProjectConfig,
  type ProjectConfigDraft,
} from "@kubojs/types";

import { generate } from "../src/generator";
import { EMBEDDED_TEMPLATES } from "../src/templates.generated";
import type { VirtualNode } from "../src/types";

const ARCHITECTURES: Architecture[] = ["feature", "layered", "clean"];
const WEB_FRONTENDS = [
  "tanstack-router",
  "react-router",
  "tanstack-start",
  "next",
  "solid",
  "svelte",
  "astro",
] as const;

function listFiles(node: VirtualNode, prefix: string, out: Map<string, string>): void {
  if (node.type === "file") {
    out.set(prefix, node.content);
    return;
  }
  for (const child of node.children) listFiles(child, `${prefix}/${child.name}`, out);
}

function buildConfig(overrides: Partial<ProjectConfigDraft>): ProjectConfig {
  const draft = {
    projectName: "app",
    frontend: ["tanstack-router"],
    backend: "hono",
    runtime: "bun",
    database: "sqlite",
    orm: "drizzle",
    api: "trpc",
    auth: "better-auth",
    payments: [],
    observability: [],
    communication: [],
    addons: ["turborepo"],
    examples: ["todo"],
    testing: [],
    git: false,
    packageManager: "bun",
    install: false,
    dbSetup: "none",
    webDeploy: "none",
    serverDeploy: "none",
    ...overrides,
  } as ProjectConfigDraft;
  const { config } = normalizeCompatibility(draft);
  return { ...config, projectDir: "/virtual", relativePath: "app" } as ProjectConfig;
}

async function generateFiles(config: ProjectConfig): Promise<Map<string, string>> {
  const result = await generate({ config, templates: EMBEDDED_TEMPLATES });
  if (result.isErr()) throw result.error;
  const files = new Map<string, string>();
  for (const child of result.value.root.children) listFiles(child, child.name, files);
  return files;
}

const SPECIFIER = /\b(?:from|import)\s*\(?\s*["']((?:\.{1,2}\/|@\/|\$lib\/)[^"'\n]*)["']/g;
const SUFFIXES = ["", ".ts", ".tsx", ".js", ".svelte", ".astro", "/index.ts", "/index.tsx"];

/** Relative, `@/` and `$lib/` imports in the API and web apps that point at no generated file. */
function danglingImports(files: Map<string, string>, config: ProjectConfig): string[] {
  const reactAlias = !["svelte", "astro", "nuxt"].includes(config.frontend[0] ?? "");
  const dangling: string[] = [];
  for (const [file, content] of files) {
    if (!/^apps\/(web|api)\//.test(file)) continue;
    if (!/\.(ts|tsx|svelte|astro)$/.test(file)) continue;
    for (const match of content.matchAll(SPECIFIER)) {
      const specifier = match[1]!.replace(/[?#].*$/, "");
      let base: string;
      if (specifier.startsWith("@/")) {
        if (!reactAlias || !file.startsWith("apps/web/")) continue;
        base = path.posix.join("apps/web/src", specifier.slice(2));
      } else if (specifier.startsWith("$lib/")) {
        base = path.posix.join("apps/web/src/lib", specifier.slice(5));
      } else {
        base = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
      }
      if (/\+types\//.test(base) || /routeTree\.gen$/.test(base)) continue; // generated at dev time
      if (/\.css$/.test(base) && files.has(base)) continue;
      if (!SUFFIXES.some((suffix) => files.has(base + suffix))) {
        dangling.push(`${file} -> ${match[1]}`);
      }
    }
  }
  return dangling;
}

/** Files that frameworks or other packages expect at a fixed path. */
const PROTECTED = [
  "apps/api/src/index.ts",
  "apps/api/src/context.ts",
  "apps/api/src/router.ts",
  "apps/api/src/routers/index.ts",
];

describe("architecture", () => {
  it("leaves the output untouched without an architecture", async () => {
    const files = await generateFiles(buildConfig({}));
    expect(files.has("apps/api/src/modules/todo/service.ts")).toBe(true);
    expect(files.has("apps/web/src/components/sign-in-form.tsx")).toBe(true);
  });

  for (const architecture of ARCHITECTURES) {
    for (const frontend of WEB_FRONTENDS) {
      for (const api of ["trpc", "orpc"] as const) {
        it(`${architecture} / ${frontend} / ${api}: imports resolve and entry files stay`, async () => {
          const config = {
            ...buildConfig({ frontend: [frontend], api }),
            architecture,
          };
          const files = await generateFiles(config);
          expect(danglingImports(files, config)).toEqual([]);
          if (config.api === "trpc" || config.api === "orpc") {
            for (const file of PROTECTED) expect(files.has(file)).toBe(true);
          }
        });
      }
    }
  }

  it("moves the API modules for each architecture", async () => {
    const base = buildConfig({});
    const layered = await generateFiles({ ...base, architecture: "layered" });
    expect(layered.has("apps/api/src/routers/todo.ts")).toBe(true);
    expect(layered.has("apps/api/src/services/todo.service.ts")).toBe(true);
    expect(layered.has("apps/api/src/models/todo.model.ts")).toBe(true);
    expect([...layered.keys()].some((file) => file.includes("/modules/"))).toBe(false);
    expect(layered.get("apps/api/src/router.ts")).toContain('from "./routers/todo"');

    const clean = await generateFiles({ ...base, architecture: "clean" });
    expect(clean.has("apps/api/src/presentation/routers/todo.ts")).toBe(true);
    expect(clean.has("apps/api/src/application/todo/todo.service.ts")).toBe(true);
    expect(clean.has("apps/api/src/domain/todo/todo.model.ts")).toBe(true);

    const feature = await generateFiles({ ...base, architecture: "feature" });
    expect(feature.has("apps/api/src/modules/todo/service.ts")).toBe(true);
  });

  it("moves the web files for each architecture", async () => {
    const base = buildConfig({});
    const feature = await generateFiles({ ...base, architecture: "feature" });
    expect(feature.has("apps/web/src/features/auth/components/sign-in-form.tsx")).toBe(true);
    expect(feature.has("apps/web/src/features/auth/lib/auth-client.ts")).toBe(true);
    expect(feature.has("apps/web/src/components/header.tsx")).toBe(true);
    expect(feature.has("apps/web/src/components/sign-in-form.tsx")).toBe(false);

    const layered = await generateFiles({ ...base, architecture: "layered" });
    expect(layered.has("apps/web/src/components/sign-in-form.tsx")).toBe(true);

    const clean = await generateFiles({ ...base, architecture: "clean" });
    expect(clean.has("apps/web/src/presentation/components/header.tsx")).toBe(true);
    expect(clean.has("apps/web/src/infrastructure/api/trpc.ts")).toBe(true);
    expect(clean.has("apps/web/src/infrastructure/auth/auth-client.ts")).toBe(true);
    expect(clean.get("apps/web/components.json")).toContain(
      '"components": "@/presentation/components"',
    );
    expect([...clean.keys()].some((file) => file.startsWith("apps/web/src/components/"))).toBe(
      false,
    );
  });

  it("keeps SvelteKit code under src/lib", async () => {
    const files = await generateFiles({
      ...buildConfig({ frontend: ["svelte"], api: "orpc" }),
      architecture: "clean",
    });
    expect(files.has("apps/web/src/lib/presentation/components/Header.svelte")).toBe(true);
    expect(files.has("apps/web/src/lib/infrastructure/api/orpc.ts")).toBe(true);
  });

  it("works together with a custom layout", async () => {
    const layout: LayoutConfig = { version: 1, preset: "libs", apps: { web: "apps/client" } };
    const files = await generateFiles({ ...buildConfig({}), layout, architecture: "clean" });
    expect(files.has("apps/client/src/presentation/components/header.tsx")).toBe(true);
    expect(files.has("apps/api/src/domain/todo/todo.model.ts")).toBe(true);
  });

  it("records the architecture in the reproducible command and kubo.config.ts", async () => {
    const result = await generate({
      config: { ...buildConfig({}), architecture: "layered" },
      templates: EMBEDDED_TEMPLATES,
      version: "0.0.0-test",
    });
    if (result.isErr()) throw result.error;
    const files = new Map<string, string>();
    for (const child of result.value.root.children) listFiles(child, child.name, files);
    expect(files.get("kubo.config.ts")).toContain('"architecture": "layered"');
  });
});
