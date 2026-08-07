import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type VercelConfig = {
  framework?: string;
  bunVersion?: string;
  installCommand?: string;
  buildCommand?: string;
};

const vercelConfig = JSON.parse(
  readFileSync(resolve(import.meta.dir, "../vercel.json"), "utf8"),
) as VercelConfig;

describe("web Vercel configuration", () => {
  test("pins the framework and Bun runtime", () => {
    expect(vercelConfig.framework).toBe("nextjs");
    expect(vercelConfig.bunVersion).toBe("1.x");
  });

  test("installs from and builds the monorepo root", () => {
    expect(vercelConfig.installCommand).toBe("cd ../.. && bun install --ignore-scripts");
    expect(vercelConfig.buildCommand).toBe("bunx fumadocs-mdx && cd ../.. && bun run build:web");
  });
});
