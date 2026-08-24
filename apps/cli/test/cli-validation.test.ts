import { expect, test } from "bun:test";

import { FailedToExitError } from "trpc-cli";

import { createBtsCli } from "../src/index";
import { getProvidedFlags, processAndValidateFlags } from "../src/validation";

test("surfaces a friendly validation error for invalid addons", async () => {
  const logs: string[] = [];

  const result = await createBtsCli()
    .run({
      argv: ["create", "ryu", "--addons", "ruler"],
      logger: {
        error: (...args) => logs.push(args.map(String).join(" ")),
      },
      process: { exit: () => 0 as never },
    })
    .catch((error) => error);

  expect(result).toBeInstanceOf(FailedToExitError);
  expect(result.exitCode).toBe(1);

  const output = logs.join("\n");

  expect(output).toContain("Invalid option");
  expect(output).toContain("at [1].addons[0]");
  expect(output).not.toContain("ORPCError");
  expect(output).not.toContain("Input validation failed");
});

test("accepts the documented s3-storage addon in the CLI", async () => {
  const logs: string[] = [];

  const result = await createBtsCli()
    .run({
      argv: [
        "create",
        "s3-app",
        "--dry-run",
        "--frontend",
        "tanstack-router",
        "--backend",
        "hono",
        "--runtime",
        "bun",
        "--database",
        "sqlite",
        "--orm",
        "drizzle",
        "--auth",
        "none",
        "--payments",
        "none",
        "--disable-observability",
        "--communication",
        "none",
        "--addons",
        "s3-storage",
        "--examples",
        "none",
        "--testing",
        "none",
        "--api",
        "trpc",
        "--db-setup",
        "none",
        "--web-deploy",
        "none",
        "--server-deploy",
        "none",
        "--package-manager",
        "bun",
        "--no-git",
        "--no-install",
      ],
      logger: {
        error: (...args) => logs.push(args.map(String).join(" ")),
      },
      process: { exit: () => 0 as never },
    })
    .catch((error) => error);

  expect(result).toBeInstanceOf(FailedToExitError);
  expect(result.exitCode).toBe(0);
  expect(logs.join("\n")).not.toContain("Invalid option");
});

test("allows self + D1 flags before web deploy is resolved by prompts", () => {
  const options = {
    backend: "self",
    frontend: ["next"],
    database: "sqlite",
    orm: "drizzle",
    dbSetup: "d1",
    api: "trpc",
    auth: "better-auth",
    payments: "none",
    addons: ["none"],
    examples: ["none"],
    runtime: "none",
  } as const;

  const result = processAndValidateFlags(options, getProvidedFlags(options), "my-app");

  expect(result.isOk()).toBe(true);
});

test("allows workers + D1 flags before server deploy is resolved by prompts", () => {
  const options = {
    backend: "hono",
    frontend: ["tanstack-router"],
    database: "sqlite",
    orm: "drizzle",
    dbSetup: "d1",
    api: "trpc",
    auth: "none",
    payments: "none",
    addons: ["none"],
    examples: ["none"],
    runtime: "workers",
  } as const;

  const result = processAndValidateFlags(options, getProvidedFlags(options), "my-app");

  expect(result.isOk()).toBe(true);
});

test("still rejects D1 when the remaining prompt flow cannot resolve it to a valid target", () => {
  const options = {
    backend: "hono",
    frontend: ["tanstack-router"],
    database: "sqlite",
    orm: "drizzle",
    dbSetup: "d1",
    api: "trpc",
    auth: "none",
    payments: "none",
    addons: ["none"],
    examples: ["none"],
    runtime: "node",
  } as const;

  const result = processAndValidateFlags(options, getProvidedFlags(options), "my-app");

  expect(result.isErr()).toBe(true);
  if (result.isErr()) {
    expect(result.error.message).toContain(
      "Cloudflare D1 setup requires SQLite database and either Cloudflare Workers runtime with server deployment or backend 'self' with Cloudflare web deployment.",
    );
  }
});

test("rejects Stripe with Convex before generation", () => {
  const options = {
    backend: "convex",
    frontend: ["next"],
    runtime: "none",
    database: "none",
    orm: "none",
    dbSetup: "none",
    api: "none",
    auth: "none",
    payments: "stripe",
    addons: ["none"],
    examples: ["none"],
    webDeploy: "none",
    serverDeploy: "none",
  } as const;

  const result = processAndValidateFlags(options, getProvidedFlags(options), "my-app");

  expect(result.isErr()).toBe(true);
  if (result.isErr()) {
    expect(result.error.message).toContain(
      "Stripe payments is not compatible with '--backend convex'",
    );
  }
});
