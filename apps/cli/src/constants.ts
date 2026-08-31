import path from "node:path";
import { fileURLToPath } from "node:url";

import { desktopWebFrontends, type PaymentProvider } from "@kubojs/types";

import { getUserPkgManager } from "./utils/get-package-manager";

export { dependencyVersionMap, type AvailableDependencies } from "@kubojs/template-generator";

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");

export const DEFAULT_CONFIG_BASE = {
  projectName: "my-kubo-app",
  relativePath: "my-kubo-app",
  frontend: ["tanstack-router"],
  database: "sqlite",
  orm: "drizzle",
  auth: "better-auth",
  payments: [],
  observability: ["getmonitor"],
  communication: "none",
  addons: ["turborepo"],
  examples: [],
  testing: [],
  git: true,
  install: true,
  dbSetup: "none",
  backend: "hono",
  runtime: "bun",
  api: "trpc",
  webDeploy: "none",
  serverDeploy: "none",
} as const;

export function getDefaultConfig() {
  return {
    ...DEFAULT_CONFIG_BASE,
    projectDir: path.resolve(process.cwd(), DEFAULT_CONFIG_BASE.projectName),
    packageManager: getUserPkgManager(),
    frontend: [...DEFAULT_CONFIG_BASE.frontend],
    payments: [...(DEFAULT_CONFIG_BASE.payments as readonly PaymentProvider[])],
    observability: [...DEFAULT_CONFIG_BASE.observability],
    addons: [...DEFAULT_CONFIG_BASE.addons],
    examples: [...DEFAULT_CONFIG_BASE.examples],
    testing: [...DEFAULT_CONFIG_BASE.testing],
  };
}

export const DEFAULT_CONFIG = getDefaultConfig();

export { desktopWebFrontends };

export const ADDON_COMPATIBILITY = {
  pwa: ["tanstack-router", "react-router", "solid", "next"],
  tauri: desktopWebFrontends,
  electrobun: desktopWebFrontends,
  biome: [],
  husky: [],
  lefthook: [],
  turborepo: [],
  "vite-plus": [],
  mcp: [],
  oxlint: [],
  opentui: [],
  skills: [],
  "s3-storage": [],
  none: [],
} as const;
