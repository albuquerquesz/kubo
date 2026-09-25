import type { LayoutConfig } from "./types";

const STANDARD_PACKAGES = {
  db: "packages/db",
  auth: "packages/auth",
  backend: "packages/backend",
  config: "packages/config",
  env: "packages/env",
  infra: "packages/infra",
  ui: "packages/ui",
  storage: "packages/storage",
  api: "packages/api",
  payments: "packages/payments",
  email: "packages/email",
  arara: "packages/arara",
  notifique: "packages/notifique",
} as const;

export const standardLayout = {
  preset: "standard",
  apps: {
    web: "apps/web",
    server: "apps/server",
    native: "apps/native",
    desktop: "apps/desktop",
    docs: "apps/docs",
    api: "apps/api",
  },
  packages: { ...STANDARD_PACKAGES },
} satisfies LayoutConfig;

export const serverSeparatedLayout = {
  preset: "server-separated",
  apps: {
    web: "apps/client",
    server: "apps/server",
    native: "apps/native",
    desktop: "apps/desktop",
    docs: "apps/docs",
    api: "apps/api",
  },
  packages: { ...STANDARD_PACKAGES },
} satisfies LayoutConfig;

export const LAYOUT_PRESETS = {
  standard: standardLayout,
  "server-separated": serverSeparatedLayout,
} as const;
