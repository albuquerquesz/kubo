import path from "node:path";
import { fileURLToPath } from "node:url";

import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

// Validate env at build/dev boot (set SKIP_ENV_VALIDATION=1 to bypass).
import "./src/env/client";
import "./src/env/server";

const withMDX = createMDX();
const appDir = path.dirname(fileURLToPath(import.meta.url));
// Pin monorepo root so Turbopack does not walk sibling projects under /www.
const monorepoRoot = path.join(appDir, "../..");

const config: NextConfig = {
  // Dev-only: allow Tailscale MagicDNS hosts to hit `/_next/*` + HMR websocket.
  // Next wildcard matching is label-strict (`*.ts.net` only matches one label),
  // so MagicDNS (`machine.tailXXXX.ts.net`) needs `**` or an explicit host.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "archlinux.tail309429.ts.net",
    "**.ts.net",
    "**.tailscale.net",
  ],
  // React Compiler is expensive during Turbopack compile (workers + AST). Keep it
  // for production builds; skip in `next dev` so cold compile does not balloon RAM.
  reactCompiler: process.env.NODE_ENV === "production",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "abs.twimg.com" },
      { protocol: "https", hostname: "r2.kubojs.dev" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  outputFileTracingExcludes: {
    "*": ["./**/*.js.map", "./**/*.mjs.map", "./**/*.cjs.map"],
  },
  outputFileTracingIncludes: {
    "/og/stack": ["./src/app/og/stack/_assets/**/*"],
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
      },
    ];
  },
  // Off by default: the FS cache was growing to ~1.4GB under .next/dev/cache/turbopack
  // and inflating compile-time RAM after large home/motion changes. Re-enable only if
  // you need faster warm restarts and can spare the disk/memory.
  // experimental: { turbopackFileSystemCacheForDev: true },
  turbopack: {
    root: monorepoRoot,
  },
  serverExternalPackages: [
    "create-kubojs",
    "@kubojs/template-generator",
    "fs-extra",
    "tinyglobby",
    "handlebars",
    "ts-morph",
    "memfs",
    "@resvg/resvg-js",
  ],
};

export default withMDX(config);
