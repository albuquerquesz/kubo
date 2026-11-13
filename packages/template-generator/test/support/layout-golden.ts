import { createHash } from "node:crypto";

import {
  APISchema,
  AddonsSchema,
  AuthSchema,
  BackendSchema,
  COMMUNICATION_PROVIDER_CAPABILITIES,
  DatabaseSchema,
  DatabaseSetupSchema,
  ExamplesSchema,
  FrontendSchema,
  OBSERVABILITY_PROVIDER_CAPABILITIES,
  ORMSchema,
  PAYMENT_PROVIDER_CAPABILITIES,
  PackageManagerSchema,
  RuntimeSchema,
  ServerDeploySchema,
  TestingSchema,
  WebDeploySchema,
  normalizeCompatibility,
  type LayoutConfig,
  type ProjectConfig,
  type ProjectConfigDraft,
} from "@kubojs/types";

import { generate } from "../../src/generator";
import { EMBEDDED_TEMPLATES } from "../../src/templates.generated";
import type { VirtualNode } from "../../src/types";

type Options = readonly string[];

function optionsOf(schema: { options: Options }): Options {
  return schema.options;
}

const DIMENSIONS = {
  frontend: optionsOf(FrontendSchema),
  backend: optionsOf(BackendSchema),
  runtime: optionsOf(RuntimeSchema),
  database: optionsOf(DatabaseSchema),
  orm: optionsOf(ORMSchema),
  api: optionsOf(APISchema),
  auth: optionsOf(AuthSchema),
  payments: ["none", ...Object.keys(PAYMENT_PROVIDER_CAPABILITIES)],
  addons: optionsOf(AddonsSchema),
  examples: optionsOf(ExamplesSchema),
  testing: optionsOf(TestingSchema),
  observability: ["none", ...Object.keys(OBSERVABILITY_PROVIDER_CAPABILITIES)],
  communication: ["none", ...Object.keys(COMMUNICATION_PROVIDER_CAPABILITIES)],
  dbSetup: optionsOf(DatabaseSetupSchema),
  webDeploy: optionsOf(WebDeploySchema),
  serverDeploy: optionsOf(ServerDeploySchema),
  packageManager: optionsOf(PackageManagerSchema),
} as const;

const ARRAY_DIMENSIONS = new Set([
  "frontend",
  "payments",
  "addons",
  "examples",
  "testing",
  "observability",
  "communication",
]);

/**
 * Deterministic configs where every option value appears at least once (round-robin
 * with co-prime offsets), normalized into compatible stacks.
 */
export function buildGoldenConfigs(): ProjectConfig[] {
  const size = Math.max(...Object.values(DIMENSIONS).map((values) => values.length)) * 3;
  const configs: ProjectConfig[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < size; i++) {
    const draft: Record<string, unknown> = {};
    Object.entries(DIMENSIONS).forEach(([key, values], dimension) => {
      const value = values[(i * (dimension + 1) + dimension) % values.length];
      draft[key] = ARRAY_DIMENSIONS.has(key) ? (value === "none" ? [] : [value]) : value;
    });

    const { config } = normalizeCompatibility(draft as ProjectConfigDraft);
    const key = JSON.stringify(config);
    if (seen.has(key)) continue;
    seen.add(key);

    configs.push(toProjectConfig(config));
  }

  // Second pass: every value that normalization dropped gets its own config on a sane base.
  for (const [key, values] of Object.entries(DIMENSIONS)) {
    for (const value of values) {
      if (value === "none" || isCovered(configs, key, value)) continue;
      const draft = {
        ...SANE_BASE,
        [key]: ARRAY_DIMENSIONS.has(key) ? [value] : value,
      } as ProjectConfigDraft;
      const { config } = normalizeCompatibility(draft);
      const keyJson = JSON.stringify(config);
      if (seen.has(keyJson) || !isCovered([toProjectConfig(config)], key, value)) continue;
      seen.add(keyJson);
      configs.push(toProjectConfig(config));
    }
  }

  return configs;
}

const SANE_BASE = {
  frontend: ["tanstack-router"],
  backend: "hono",
  runtime: "bun",
  database: "sqlite",
  orm: "drizzle",
  api: "trpc",
  auth: "better-auth",
  payments: [],
  addons: ["turborepo"],
  examples: [],
  testing: [],
  observability: [],
  communication: [],
  dbSetup: "none",
  webDeploy: "none",
  serverDeploy: "none",
  packageManager: "bun",
} satisfies Record<keyof typeof DIMENSIONS, unknown>;

function isCovered(configs: ProjectConfig[], key: string, value: string): boolean {
  return configs.some((config) => {
    const current: unknown = config[key as keyof ProjectConfig];
    return Array.isArray(current) ? current.includes(value) : current === value;
  });
}

function toProjectConfig(config: ProjectConfigDraft): ProjectConfig {
  return {
    ...config,
    projectName: "golden",
    projectDir: "/virtual/golden",
    relativePath: "golden",
    git: false,
    install: false,
  } as ProjectConfig;
}

function collectFiles(node: VirtualNode, prefix: string, out: Map<string, string>): void {
  if (node.type === "file") {
    // Generated secrets in .env files are random; mask long opaque values.
    const content = /(^|\/)\.env[^/]*$/.test(prefix)
      ? node.content.replace(/=([A-Za-z0-9+/_-]{24,}={0,2})$/gm, "=<secret>")
      : node.content;
    out.set(prefix, createHash("sha256").update(content).digest("hex").slice(0, 16));
    return;
  }
  for (const child of node.children) {
    collectFiles(child, prefix ? `${prefix}/${child.name}` : child.name, out);
  }
}

export type GoldenEntry =
  | { config: string; files: Record<string, string> }
  | { config: string; error: string };

export async function snapshotConfig(
  config: ProjectConfig,
  layout?: LayoutConfig,
): Promise<GoldenEntry> {
  const label = [
    config.frontend.join("+") || "no-frontend",
    config.backend,
    config.runtime,
    config.database,
    config.orm,
    config.api,
    config.auth,
    config.packageManager,
  ].join("|");

  const result = await generate({
    config: layout ? { ...config, layout } : config,
    templates: EMBEDDED_TEMPLATES,
  });
  if (result.isErr()) return { config: label, error: result.error.message };

  const files = new Map<string, string>();
  for (const child of result.value.root.children) collectFiles(child, child.name, files);
  return {
    config: label,
    files: Object.fromEntries([...files].sort(([a], [b]) => a.localeCompare(b))),
  };
}

export async function snapshotMatrix(layout?: LayoutConfig): Promise<GoldenEntry[]> {
  const entries: GoldenEntry[] = [];
  for (const config of buildGoldenConfigs()) entries.push(await snapshotConfig(config, layout));
  return entries;
}
