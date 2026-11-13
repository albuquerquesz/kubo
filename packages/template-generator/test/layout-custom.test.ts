import { describe, expect, it } from "bun:test";
import path from "node:path";

import { expandLayoutConfig, type LayoutConfig } from "@kubojs/types";

import { generate } from "../src/generator";
import { EMBEDDED_TEMPLATES } from "../src/templates.generated";
import type { VirtualNode } from "../src/types";
import { buildGoldenConfigs } from "./support/layout-golden";

const CUSTOM_LAYOUTS: Record<string, LayoutConfig> = {
  libs: { version: 1, preset: "libs" },
  "web-at-root": { version: 1, preset: "standard", apps: { web: "web" } },
  "nested-dirs": {
    version: 1,
    preset: "standard",
    dirs: { apps: "src/apps", packages: "src/packages" },
  },
};

function listFiles(node: VirtualNode, prefix: string, out: Map<string, string>): void {
  if (node.type === "file") {
    out.set(prefix, node.content);
    return;
  }
  for (const child of node.children) listFiles(child, prefix ? `${prefix}/${child.name}` : child.name, out);
}

async function generateFiles(config: ReturnType<typeof buildGoldenConfigs>[number], layout: LayoutConfig) {
  const result = await generate({ config: { ...config, layout }, templates: EMBEDDED_TEMPLATES });
  if (result.isErr()) throw result.error;
  const files = new Map<string, string>();
  for (const child of result.value.root.children) listFiles(child, child.name, files);
  return files;
}

/** Relative refs that must point at something generated (not globs, not runtime files). */
const RELATIVE_REF = /["'](\.\.\/(?:\.\.\/)*[A-Za-z@][^"'*{}]*)["']/g;
const RUNTIME_FILES = /(^|\/)\.env(\.local)?$|\/migrations$|\.d\.ts$|\/generated(\/|$)/;

function danglingRefs(files: Map<string, string>): string[] {
  const dirs = new Set<string>();
  for (const file of files.keys()) {
    const parts = file.split("/");
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join("/"));
  }
  const dangling: string[] = [];
  for (const [file, content] of files) {
    if (!/\.(json|ts|tsx|mts|js|mjs|css|vue|svelte|astro)$/.test(file)) continue;
    for (const match of content.matchAll(RELATIVE_REF)) {
      const ref = match[1]!;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), ref));
      if (target.startsWith("..")) continue; // leaves the project: not ours to check
      if (RUNTIME_FILES.test(target)) {
        // .env, migrations and generated clients appear at runtime; the package must exist.
        const owner = target.includes("/generated") ? target.slice(0, target.indexOf("/generated")) : path.posix.dirname(target);
        const base = owner.replace(/\/(prisma|src)$/, "");
        if (!dirs.has(base) && !files.has(base)) {
          dangling.push(`${file} -> ${ref}`);
        }
        continue;
      }
      const candidates = [target, `${target}.ts`, `${target}.tsx`, `${target}/index.ts`];
      if (!candidates.some((candidate) => files.has(candidate) || dirs.has(candidate))) {
        dangling.push(`${file} -> ${ref}`);
      }
    }
  }
  return dangling;
}

describe("custom layouts", () => {
  const configs = buildGoldenConfigs();

  for (const [name, layout] of Object.entries(CUSTOM_LAYOUTS)) {
    it(`${name}: nothing is written to the standard folders`, async () => {
      const expanded = expandLayoutConfig(layout);
      const movedApps = Object.entries(expanded.apps).filter(([id, p]) => p !== `apps/${id}`);
      const movedPackages = Object.entries(expanded.packages).filter(
        ([id, p]) => p !== `packages/${id}`,
      );
      for (const config of configs) {
        const files = [...(await generateFiles(config, layout)).keys()];
        for (const [id] of movedApps) {
          expect(files.filter((file) => file.startsWith(`apps/${id}/`))).toEqual([]);
        }
        for (const [id] of movedPackages) {
          expect(files.filter((file) => file.startsWith(`packages/${id}/`))).toEqual([]);
        }
      }
    }, 180_000);

    it(`${name}: relative references resolve inside the project`, async () => {
      for (const config of configs) {
        expect(danglingRefs(await generateFiles(config, layout))).toEqual([]);
      }
    }, 180_000);
  }

  it("standard layout also has no dangling relative references", async () => {
    for (const config of configs) {
      expect(danglingRefs(await generateFiles(config, { preset: "standard" }))).toEqual([]);
    }
  }, 180_000);
});
