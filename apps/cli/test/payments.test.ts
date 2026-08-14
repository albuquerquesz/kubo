import { describe, expect, it } from "bun:test";

import { generateReproducibleCommand } from "@kubojs/template-generator";

import { createVirtual } from "../src/index";
import { collectFiles } from "./setup";

describe("multiple payment providers", () => {
  it("generates AbacatePay and Stripe integrations together", async () => {
    const result = await createVirtual({
      projectName: "combined-payments-app",
      frontend: ["next"],
      backend: "hono",
      runtime: "bun",
      database: "postgres",
      orm: "drizzle",
      auth: "none",
      payments: ["abacatepay", "stripe"],
      observability: [],
      addons: ["none"],
      examples: ["none"],
      dbSetup: "none",
      api: "trpc",
      webDeploy: "none",
      serverDeploy: "none",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    const files = collectFiles(result.value.root, "/virtual");
    const paymentsPackage = JSON.parse(files.get("packages/payments/package.json") ?? "{}");
    const server = files.get("apps/server/src/index.ts") ?? "";
    const webEnv = files.get("apps/web/.env") ?? "";
    const serverEnv = files.get("apps/server/.env") ?? "";
    const command = generateReproducibleCommand(result.value.config);

    expect(files.has("packages/payments/src/lib/abacatepay.ts")).toBe(true);
    expect(files.has("packages/payments/src/lib/stripe.ts")).toBe(true);
    expect(server).toContain("/api/payments/abacatepay/checkout");
    expect(server).toContain("/api/payments/stripe/checkout");
    expect(paymentsPackage.dependencies.stripe).toBeDefined();
    expect(serverEnv).toContain("ABACATEPAY_API_KEY=");
    expect(serverEnv).toContain("STRIPE_SECRET_KEY=");
    expect(webEnv).toContain("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=");
    expect(command).toContain("--payments abacatepay stripe");
  });
});
