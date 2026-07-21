import path from "node:path";
import { fileURLToPath } from "node:url";

import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();
const appDir = path.dirname(fileURLToPath(import.meta.url));
// Pin monorepo root so Turbopack does not walk sibling projects under /www.
const monorepoRoot = path.join(appDir, "../..");

const config: NextConfig = {
  // React Compiler is expensive during Turbopack compile (workers + AST). Keep it
  // for production builds; skip in `next dev` so cold compile does not balloon RAM.
  reactCompiler: process.env.NODE_ENV === "production",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "abs.twimg.com" },
      { protocol: "https", hostname: "r2.better-t-stack.dev" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  outputFileTracingExcludes: {
    "*": ["./**/*.js.map", "./**/*.mjs.map", "./**/*.cjs.map"],
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
    "kubojs",
    "@kubo/template-generator",
    "fs-extra",
    "tinyglobby",
    "handlebars",
    "ts-morph",
    "memfs",
  ],
};

export default withMDX(config);
