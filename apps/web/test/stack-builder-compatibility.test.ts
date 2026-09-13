import { describe, expect, test } from "bun:test";

import { getIsSelected } from "../src/app/(home)/new/_components/stack-builder/tech-categories";
import {
  getCompatibilityAdjustmentKey,
  getCompatibilityAdjustmentState,
} from "../src/app/(home)/new/_components/stack-builder/use-stack-builder";
import {
  analyzeStackCompatibility,
  getDisabledReason,
} from "../src/app/(home)/new/_components/utils";
import { DEFAULT_STACK, type StackState } from "../src/lib/constant";
import {
  sanitizeAddons,
  sanitizeStackState,
  sanitizeTesting,
} from "../src/lib/sanitize-stack-addons";
import { formatStackCommandForDisplay, generateStackCommand } from "../src/lib/stack-utils";

function createStack(overrides: Partial<StackState> = {}): StackState {
  return sanitizeStackState({ ...DEFAULT_STACK, ...overrides });
}

describe("communication capability messages", () => {
  test.each([
    ["resend", "Resend"],
    ["notifique", "Notifique"],
    ["arara", "AraraHQ"],
  ])("shows the catalog backend requirement for %s", (provider, name) => {
    expect(getDisabledReason(createStack({ backend: "none" }), "communication", provider)).toBe(
      `${name} exige um backend com runtime de servidor`,
    );
  });

  test("blocks AraraHQ for Cloudflare deploy even when the runtime still says Node", () => {
    const stack = createStack({ backend: "hono", runtime: "node", serverDeploy: "cloudflare" });
    expect(getDisabledReason(stack, "communication", "arara")).toBe(
      "AraraHQ exige o SDK Node e não é compatível com runtimes Edge/Workers. Use um servidor Node/Bun ou uma Node Action do Convex.",
    );
    expect(getDisabledReason(stack, "communication", "resend")).toBeNull();
    expect(getDisabledReason(stack, "communication", "notifique")).toBeNull();
  });

  test("blocks AraraHQ on Workers runtime and still allows Resend", () => {
    const stack = createStack({ backend: "hono", runtime: "workers", serverDeploy: "cloudflare" });
    expect(getDisabledReason(stack, "communication", "arara")).toBe(
      "AraraHQ exige o SDK Node e não é compatível com runtimes Edge/Workers. Use um servidor Node/Bun ou uma Node Action do Convex.",
    );
    expect(getDisabledReason(stack, "communication", "resend")).toBeNull();
  });

  test("allows AraraHQ in Convex Node Actions and self backends", () => {
    expect(
      getDisabledReason(
        createStack({ backend: "convex", runtime: "workers", serverDeploy: "cloudflare" }),
        "communication",
        "arara",
      ),
    ).toBeNull();
    expect(
      getDisabledReason(
        createStack({ backend: "self", frontend: ["next"], runtime: "none", serverDeploy: "none" }),
        "communication",
        "arara",
      ),
    ).toBeNull();
    expect(getDisabledReason(createStack({ backend: "none" }), "communication", "none")).toBeNull();
  });
});

describe("stack builder D1 compatibility", () => {
  test("supports selecting multiple payment providers and emits both CLI values", () => {
    const stack = createStack({ payments: ["abacatepay", "stripe"] });

    expect(getIsSelected(stack, "payments", "abacatepay")).toBe(true);
    expect(getIsSelected(stack, "payments", "stripe")).toBe(true);
    expect(generateStackCommand(stack)).toContain("--payments abacatepay stripe");
  });

  test("supports selecting multiple testing tools and emits both CLI values", () => {
    const testing = sanitizeTesting(["vitest", "playwright"]);
    const stack = createStack({ testing });

    expect(testing).toEqual(["vitest", "playwright"]);
    expect(getIsSelected(stack, "testing", "vitest")).toBe(true);
    expect(getIsSelected(stack, "testing", "playwright")).toBe(true);
    expect(generateStackCommand(stack)).toContain("--testing vitest playwright");
  });

  test("renders observability providers as selected when present in the array", () => {
    const stack = createStack({ observability: ["getmonitor", "himetrica"] });

    expect(getIsSelected(stack, "observability", "getmonitor")).toBe(true);
    expect(getIsSelected(stack, "observability", "himetrica")).toBe(true);
    expect(getIsSelected(stack, "observability", "missing")).toBe(false);
  });

  test("keeps self fullstack backends on the D1 + Cloudflare path", () => {
    const stack = createStack({
      backend: "self",
      frontend: ["next"],
      runtime: "none",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
      webDeploy: "none",
      serverDeploy: "none",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      backend: "self",
      runtime: "none",
      database: "sqlite",
      dbSetup: "d1",
      webDeploy: "cloudflare",
      serverDeploy: "none",
    });
  });

  test("still routes non-self D1 stacks through workers + cloudflare", () => {
    const stack = createStack({
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
      serverDeploy: "none",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      backend: "hono",
      runtime: "workers",
      database: "sqlite",
      dbSetup: "d1",
      serverDeploy: "cloudflare",
    });
  });

  test("applies the canonical NestJS backend capabilities", () => {
    const stack = createStack({
      backend: "nestjs",
      frontend: ["next"],
      runtime: "none",
      api: "trpc",
      auth: "clerk",
      database: "sqlite",
      orm: "drizzle",
      examples: ["ai"],
      payments: ["stripe"],
    });

    expect(getDisabledReason(stack, "api", "trpc")).toContain("não é compatível");
    expect(getDisabledReason(stack, "database", "sqlite")).toContain("não é compatível");
    expect(getDisabledReason(stack, "orm", "drizzle")).toContain("não é compatível");
    expect(getDisabledReason(stack, "examples", "ai")).toContain("não é compatível");
    expect(getDisabledReason(stack, "payments", "stripe")).toContain("não são compatíveis");

    expect(analyzeStackCompatibility(stack).adjustedStack).toMatchObject({
      backend: "nestjs",
      api: "none",
      auth: "none",
      database: "postgres",
      orm: "prisma",
      examples: ["none"],
      payments: [],
    });
  });

  test("allows selecting D1 for self fullstack backends", () => {
    const stack = createStack({
      backend: "self",
      frontend: ["next"],
      runtime: "none",
      database: "sqlite",
    });

    expect(getDisabledReason(stack, "dbSetup", "d1")).toBeNull();
  });

  test("blocks non-cloudflare web deployment for self fullstack D1 stacks", () => {
    const stack = createStack({
      backend: "self",
      frontend: ["next"],
      runtime: "none",
      database: "sqlite",
      dbSetup: "d1",
      webDeploy: "cloudflare",
    });

    expect(getDisabledReason(stack, "webDeploy", "none")).toBe(
      "D1 com backend fullstack self exige deploy web na Cloudflare",
    );
  });

  test("keeps only the latest selected task-runner addon", () => {
    expect(sanitizeAddons(["turborepo", "vite-plus"])).toEqual(["vite-plus"]);
    expect(sanitizeAddons(["vite-plus", "nx"])).toEqual(["vite-plus"]);
    expect(sanitizeAddons(["nx", "turborepo"])).toEqual(["turborepo"]);

    const sanitizedAddons = sanitizeAddons(["turborepo", "vite-plus"]);
    const command = generateStackCommand(createStack({ addons: sanitizedAddons }));

    expect(command).toContain("--addons vite-plus");
    expect(command).not.toContain("turborepo");

    expect(
      getDisabledReason(createStack({ addons: ["turborepo"] }), "addons", "vite-plus"),
    ).toBeNull();
  });

  test("emits supported storage addons in the CLI command", () => {
    const command = generateStackCommand(createStack({ addons: ["s3-storage"] }));

    expect(command).toContain("--addons s3-storage");
  });

  test("renders long CLI commands with visible flag separators", () => {
    const command = generateStackCommand(
      createStack({ addons: ["vite-plus"], examples: ["none"] }),
    );
    const displayCommand = formatStackCommandForDisplay(command);

    expect(command).toContain("my-kubo-app --frontend");
    expect(displayCommand).toContain(`my-kubo-app ${"\\"}\n  --frontend`);
    expect(displayCommand).toContain(`tanstack-router ${"\\"}\n  --backend`);
  });

  test("reapplies the same D1 adjustment after leaving and returning to it", () => {
    const adjustedD1Stack = createStack({
      backend: "self",
      frontend: ["next"],
      runtime: "none",
      database: "sqlite",
      dbSetup: "d1",
      webDeploy: "cloudflare",
      serverDeploy: "none",
    });
    const initialRawD1Stack = createStack({
      ...adjustedD1Stack,
      webDeploy: "none",
    });
    const tursoStack = createStack({
      backend: "self",
      frontend: ["next"],
      runtime: "none",
      database: "sqlite",
      dbSetup: "turso",
      webDeploy: "none",
      serverDeploy: "none",
    });

    const firstAdjustment = getCompatibilityAdjustmentState("", initialRawD1Stack, adjustedD1Stack);
    const settledState = getCompatibilityAdjustmentState(
      firstAdjustment.adjustmentKey,
      tursoStack,
      null,
    );
    const secondAdjustment = getCompatibilityAdjustmentState(
      settledState.adjustmentKey,
      initialRawD1Stack,
      adjustedD1Stack,
    );

    expect(firstAdjustment.adjustmentKey).toBe(
      getCompatibilityAdjustmentKey(initialRawD1Stack, adjustedD1Stack),
    );
    expect(firstAdjustment.shouldApply).toBe(true);
    expect(settledState.adjustmentKey).toBe("");
    expect(settledState.shouldApply).toBe(false);
    expect(secondAdjustment.adjustmentKey).toBe(
      getCompatibilityAdjustmentKey(initialRawD1Stack, adjustedD1Stack),
    );
    expect(secondAdjustment.shouldApply).toBe(true);
  });

  test("blocks AbacatePay when there is no web frontend", () => {
    const stack = createStack({
      frontend: ["none"],
      backend: "hono",
      database: "sqlite",
      orm: "drizzle",
    });

    expect(getDisabledReason(stack, "payments", "abacatepay")).toBe(
      "AbacatePay exige um frontend web",
    );
  });

  test("blocks AbacatePay for native-only stacks", () => {
    const stack = createStack({
      frontend: ["native-bare"],
      backend: "hono",
      database: "sqlite",
      orm: "drizzle",
    });

    expect(getDisabledReason(stack, "payments", "abacatepay")).toBe(
      "AbacatePay exige um frontend web",
    );
  });

  test("blocks AbacatePay for mixed web and native stacks", () => {
    const stack = createStack({
      frontend: ["tanstack-router", "native-bare"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      payments: ["abacatepay"],
    });

    expect(getDisabledReason(stack, "payments", "abacatepay")).toBe(
      "AbacatePay v1 não suporta apps com frontend nativo",
    );
  });

  test("blocks AbacatePay for Convex stacks", () => {
    const stack = createStack({
      frontend: ["next"],
      backend: "convex",
      runtime: "none",
      database: "none",
      orm: "none",
      api: "none",
      dbSetup: "none",
      auth: "better-auth",
      payments: ["abacatepay"],
    });

    expect(getDisabledReason(stack, "payments", "abacatepay")).toBe(
      "AbacatePay não é suportado com Convex",
    );
  });

  test("allows AbacatePay for web + SQL stacks and emits CLI flags", () => {
    const stack = createStack({
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      payments: ["abacatepay"],
      observability: ["getmonitor"],
      webDeploy: "guaracloud",
      serverDeploy: "guaracloud",
    });

    expect(getDisabledReason(stack, "payments", "abacatepay")).toBeNull();
    expect(getDisabledReason(stack, "observability", "getmonitor")).toBeNull();
    expect(getDisabledReason(stack, "webDeploy", "guaracloud")).toBeNull();
    expect(getDisabledReason(stack, "serverDeploy", "guaracloud")).toBeNull();
    expect(analyzeStackCompatibility(stack).adjustedStack).toBeNull();

    const command = generateStackCommand(stack);
    expect(command).toContain("--payments abacatepay");
    expect(command).toContain("--observability getmonitor");
    expect(command).toContain("--web-deploy guaracloud");
    expect(command).toContain("--server-deploy guaracloud");
  });

  test("allows Stripe without database setup and emits CLI flags", () => {
    const stack = createStack({
      frontend: ["next"],
      backend: "hono",
      runtime: "bun",
      database: "none",
      orm: "none",
      payments: ["stripe"],
    });

    expect(getDisabledReason(stack, "payments", "stripe")).toBeNull();
    expect(generateStackCommand(stack)).toContain("--payments stripe");
  });

  test("blocks Stripe for Convex and native-only stacks", () => {
    const convex = createStack({ frontend: ["next"], backend: "convex", payments: ["stripe"] });
    const native = createStack({
      frontend: ["native-bare"],
      backend: "hono",
      payments: ["stripe"],
    });
    expect(getDisabledReason(convex, "payments", "stripe")).toBe(
      "Stripe não é suportado com Convex",
    );
    expect(getDisabledReason(native, "payments", "stripe")).toBe("Stripe exige um frontend web");
  });

  test("clears incompatible payments when Convex is selected", () => {
    const result = analyzeStackCompatibility(
      createStack({ frontend: ["next"], backend: "convex", payments: ["stripe"] }),
    );

    expect(result.adjustedStack).toMatchObject({ backend: "convex", payments: [] });
    expect(result.changes).toContainEqual(
      expect.objectContaining({
        category: "backend",
        message: expect.stringContaining("Pagamentos"),
      }),
    );
  });

  test("default stack implies GetMonitor and short --yes command", () => {
    expect(DEFAULT_STACK.observability).toEqual(["getmonitor"]);

    const command = generateStackCommand(createStack({}));
    expect(command).toMatch(/--yes\s*$/);
    expect(command).not.toContain("--observability");
  });

  test("emits --disable-observability for backend-less stacks (Stack Builder → CLI)", () => {
    const stack = createStack({
      projectName: "atscopilot",
      frontend: ["tanstack-router"],
      backend: "none",
      runtime: "none",
      api: "none",
      auth: "none",
      payments: [],
      observability: [],
      communication: "none",
      database: "none",
      orm: "none",
      dbSetup: "none",
      packageManager: "bun",
      git: true,
      webDeploy: "vercel",
      serverDeploy: "none",
      install: true,
      addons: ["biome"],
      examples: ["none"],
    });

    const command = generateStackCommand(stack);
    expect(command).toContain("--disable-observability");
    expect(command).toContain("--communication none");
    expect(command).toContain("--payments none");
    expect(command).toContain("--backend none");
    expect(command).toContain("--web-deploy vercel");
  });

  test("emits --communication resend and disables Resend without backend", () => {
    const withResend = createStack({
      communication: "resend",
      backend: "hono",
    });
    expect(generateStackCommand(withResend)).toContain("--communication resend");

    const noBackend = createStack({
      backend: "none",
      communication: "resend",
    });
    expect(getDisabledReason(noBackend, "communication", "resend")).toContain("backend");
    expect(getDisabledReason(noBackend, "communication", "arara")).toContain("backend");
    expect(
      getDisabledReason(
        createStack({ backend: "hono", runtime: "workers", communication: "arara" }),
        "communication",
        "arara",
      ),
    ).toContain("Workers");
    expect(
      getDisabledReason(
        createStack({ backend: "hono", runtime: "workers", communication: "resend" }),
        "communication",
        "resend",
      ),
    ).toBeNull();
  });

  test("blocks the AI example for Astro frontends", () => {
    const stack = createStack({
      frontend: ["astro"],
      backend: "self",
      api: "orpc",
    });

    expect(getDisabledReason(stack, "examples", "ai")).toBe(
      "Exemplo de IA incompatível com frontend Solid ou Astro",
    );

    const result = analyzeStackCompatibility({
      ...stack,
      examples: ["ai"],
    });

    expect(result.adjustedStack?.examples).toEqual(["none"]);
  });
});

describe("stack builder Docker deployment compatibility", () => {
  test("allows Docker web deploy with a web frontend", () => {
    const stack = createStack({
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
    });

    expect(getDisabledReason(stack, "webDeploy", "docker")).toBeNull();

    const command = generateStackCommand({
      ...stack,
      webDeploy: "docker",
    });
    expect(command).toContain("--web-deploy docker");
  });

  test("allows Docker server deploy on bun/node runtimes only", () => {
    const bunStack = createStack({
      backend: "hono",
      runtime: "bun",
    });
    const workersStack = createStack({
      backend: "hono",
      runtime: "workers",
      serverDeploy: "cloudflare",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
    });

    expect(getDisabledReason(bunStack, "serverDeploy", "docker")).toBeNull();
    expect(getDisabledReason(workersStack, "serverDeploy", "docker")).toBe(
      "Deploy de servidor com Docker exige runtime Bun ou Node",
    );
  });

  test("switches Docker server deploy to Cloudflare when runtime becomes workers", () => {
    const stack = createStack({
      backend: "hono",
      runtime: "workers",
      serverDeploy: "docker",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      serverDeploy: "cloudflare",
    });
  });

  test("clears Docker server deploy for backends without a server app", () => {
    const stack = createStack({
      frontend: ["next"],
      backend: "self",
      runtime: "none",
      serverDeploy: "docker",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      serverDeploy: "none",
    });
  });
});

describe("stack builder Vercel deployment compatibility", () => {
  test("allows Vercel web deploy with a web frontend", () => {
    const stack = createStack({
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
    });

    expect(getDisabledReason(stack, "webDeploy", "vercel")).toBeNull();

    const command = generateStackCommand({
      ...stack,
      webDeploy: "vercel",
    });
    expect(command).toContain("--web-deploy vercel");
  });

  test("allows Vercel server deploy on bun/node runtimes only", () => {
    const bunStack = createStack({
      backend: "hono",
      runtime: "bun",
    });
    const workersStack = createStack({
      backend: "hono",
      runtime: "workers",
      serverDeploy: "cloudflare",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
    });

    expect(getDisabledReason(bunStack, "serverDeploy", "vercel")).toBeNull();
    expect(getDisabledReason(workersStack, "serverDeploy", "vercel")).toBe(
      "Deploy de servidor na Vercel exige runtime Bun ou Node",
    );
  });

  test("switches Vercel server deploy to Cloudflare when runtime becomes workers", () => {
    const stack = createStack({
      backend: "hono",
      runtime: "workers",
      serverDeploy: "vercel",
      database: "sqlite",
      orm: "drizzle",
      dbSetup: "d1",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      serverDeploy: "cloudflare",
    });
  });

  test("clears Vercel server deploy for backends without a server app", () => {
    const stack = createStack({
      frontend: ["next"],
      backend: "self",
      runtime: "none",
      serverDeploy: "vercel",
    });

    const result = analyzeStackCompatibility(stack);

    expect(result.adjustedStack).toMatchObject({
      serverDeploy: "none",
    });
  });
});
