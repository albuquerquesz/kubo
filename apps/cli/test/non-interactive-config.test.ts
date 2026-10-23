import { describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { execa } from "execa";

import { canPromptForInput, gatherConfig } from "../src/prompts/config-prompts";

const CLI_ENTRYPOINT = path.join(import.meta.dir, "..", "src", "cli.ts");

// Matches a Stack Builder command with `--testing` left out.
const FLAGS_WITHOUT_TESTING = [
  "--frontend",
  "next",
  "--backend",
  "hono",
  "--runtime",
  "bun",
  "--api",
  "trpc",
  "--auth",
  "none",
  "--payments",
  "none",
  "--disable-observability",
  "--communication",
  "none",
  "--database",
  "sqlite",
  "--orm",
  "drizzle",
  "--db-setup",
  "none",
  "--package-manager",
  "bun",
  "--no-git",
  "--web-deploy",
  "none",
  "--server-deploy",
  "none",
  "--no-install",
  "--addons",
  "none",
  "--examples",
  "none",
];

describe("non-interactive config", () => {
  it("only prompts when stdin is a TTY", () => {
    expect(canPromptForInput({ isTTY: true })).toBe(true);
    expect(canPromptForInput({ isTTY: false })).toBe(false);
    expect(canPromptForInput({})).toBe(false);
  });

  it("fills missing options with defaults instead of prompting without a TTY", async () => {
    const config = await gatherConfig(
      { frontend: ["next"], backend: "hono", auth: "none" },
      "my-app",
      "/tmp/my-app",
      "my-app",
      { isTTY: false },
    );

    expect(config.frontend).toEqual(["next"]);
    expect(config.backend).toBe("hono");
    expect(config.auth).toBe("none");
    expect(config.testing).toEqual([]);
  });

  it("creates the project without --testing when stdin is closed", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "kubo-non-interactive-"));
    try {
      const result = await execa("bun", [CLI_ENTRYPOINT, "my-app", ...FLAGS_WITHOUT_TESTING], {
        cwd,
        stdin: "ignore",
        reject: false,
        timeout: 120_000,
        env: { BTS_TELEMETRY_DISABLED: "1" },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Project created successfully");
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  }, 150_000);
});
