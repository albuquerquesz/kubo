import { describe, expect, it } from "bun:test";

import { evaluate, normalizeCompatibility } from "../src/index";
import type { ProjectConfigDraft } from "../src/types";

const validConfig: ProjectConfigDraft = {
  projectName: "example",
  database: "postgres",
  orm: "drizzle",
  backend: "hono",
  runtime: "bun",
  frontend: ["tanstack-router"],
  addons: [],
  examples: [],
  testing: [],
  auth: "none",
  payments: [],
  observability: [],
  communication: "none",
  git: false,
  packageManager: "bun",
  install: false,
  dbSetup: "none",
  api: "trpc",
  webDeploy: "none",
  serverDeploy: "none",
};

function codes(config: Partial<ProjectConfigDraft>) {
  return evaluate({ ...validConfig, ...config }).issues.map(({ code }) => code);
}

describe("canonical compatibility evaluator", () => {
  it("accepts a valid project configuration", () => {
    expect(evaluate(validConfig)).toEqual({ valid: true, issues: [] });
  });

  it("normalizes representative invalid stacks into valid CLI configurations", () => {
    const invalidStacks: ProjectConfigDraft[] = [
      {
        ...validConfig,
        backend: "convex",
        runtime: "bun",
        database: "postgres",
        orm: "prisma",
        api: "trpc",
        frontend: ["solid"],
        payments: ["stripe"],
        serverDeploy: "docker",
      },
      {
        ...validConfig,
        backend: "hono",
        runtime: "workers",
        database: "mongodb",
        orm: "mongoose",
        dbSetup: "docker",
        serverDeploy: "vercel",
      },
      {
        ...validConfig,
        backend: "nestjs",
        auth: "clerk",
        database: "mysql",
        orm: "drizzle",
        api: "trpc",
        examples: ["ai"],
        payments: ["stripe"],
      },
    ];

    for (const invalidStack of invalidStacks) {
      const normalized = normalizeCompatibility(invalidStack).config;
      expect(evaluate(normalized).valid).toBe(true);
      expect(normalizeCompatibility(normalized).config).toEqual(normalized);
    }
  });

  it("returns structured issues for unsupported backend capabilities", () => {
    const result = evaluate({
      ...validConfig,
      backend: "nestjs",
      api: "trpc",
      database: "mysql",
      orm: "drizzle",
      auth: "clerk",
      examples: ["ai"],
      payments: ["stripe"],
    });

    expect(result.valid).toBe(false);
    expect(result.issues.map(({ code }) => code)).toEqual([
      "backend-api",
      "backend-auth",
      "backend-database",
      "backend-orm",
      "example-ai-backend",
      "payment",
      "auth-backend",
    ]);
  });

  it("evaluates server deploy relationships", () => {
    expect(codes({ serverDeploy: "docker", backend: "self" })).toContain("server-deploy-backend");
    expect(codes({ serverDeploy: "vercel", backend: "hono", runtime: "workers" })).toContain(
      "server-deploy-runtime",
    );
    expect(codes({ serverDeploy: "cloudflare", backend: "express", runtime: "bun" })).toContain(
      "server-deploy-cloudflare",
    );
  });

  it("keeps frontend cardinality and API relationships in the domain layer", () => {
    const issueCodes = codes({
      frontend: ["next", "tanstack-router", "native-bare", "native-uniwind"],
      api: "trpc",
    });

    expect(issueCodes).toContain("frontend-web-cardinality");
    expect(issueCodes).toContain("frontend-native-cardinality");
  });

  it("evaluates database setup requirements", () => {
    expect(codes({ dbSetup: "turso", database: "postgres" })).toContain("database-setup");
    expect(
      codes({
        dbSetup: "d1",
        database: "sqlite",
        backend: "hono",
        runtime: "bun",
        serverDeploy: "none",
      }),
    ).toContain("database-setup-target");
  });

  it("evaluates provider, addon, testing, and example relationships", () => {
    const issueCodes = codes({
      backend: "none",
      frontend: ["native-bare"],
      communication: "resend",
      payments: ["stripe"],
      addons: ["tauri", "electrobun", "turborepo", "vite-plus"],
      testing: ["playwright"],
      examples: ["todo", "ai"],
      database: "none",
      orm: "none",
      api: "none",
    });

    expect(issueCodes).toEqual(
      expect.arrayContaining([
        "communication",
        "payment",
        "addon-task-runner",
        "addon-frontend",
        "testing-frontend",
        "example-todo-database",
        "example-todo-api",
        "example-ai-backend",
      ]),
    );
  });
});
