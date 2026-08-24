import { describe, expect, it } from "bun:test";

import { generateReproducibleCommand } from "@kubojs/template-generator";

import { DEFAULT_CONFIG } from "../src/constants";
import { createVirtual } from "../src/index";
import type { ProjectConfig } from "../src/types";
import { processFlags } from "../src/utils/config-processing";
import { collectFiles } from "./setup";

describe("Resend communication", () => {
  it("defaults communication to none", () => {
    expect(DEFAULT_CONFIG.communication).toBe("none");
  });

  it("generates packages/email with Resend helper and env placeholders", async () => {
    const result = await createVirtual({
      projectName: "resend-app",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      payments: [],
      observability: "none",
      communication: "resend",
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
    const emailIndex = files.get("packages/email/src/index.ts") ?? "";
    const resendLib = files.get("packages/email/src/lib/resend.ts") ?? "";
    const emailPackage = JSON.parse(files.get("packages/email/package.json") ?? "{}");
    const serverPackage = JSON.parse(files.get("apps/server/package.json") ?? "{}");
    const serverEnv = files.get("apps/server/.env") ?? "";
    const readme = files.get("README.md") ?? "";

    expect(emailIndex).toContain("./lib/resend");
    expect(resendLib).toContain('from "resend"');
    expect(resendLib).toContain("sendEmail");
    expect(resendLib).not.toContain("hardcode");
    expect(emailPackage.dependencies?.resend).toBe("^6.19.0");
    expect(
      serverPackage.dependencies?.["@resend-app/email"] || serverPackage.dependencies,
    ).toBeTruthy();
    expect(serverEnv).toContain("RESEND_API_KEY=");
    expect(serverEnv).toContain("RESEND_FROM_EMAIL=");
    expect(readme).toContain("Resend");
  });

  it("does not generate packages/email when communication is none", async () => {
    const result = await createVirtual({
      projectName: "no-email-app",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      payments: "none",
      observability: "none",
      communication: "none",
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
    expect(files.has("packages/email/package.json")).toBe(false);
  });

  it("keeps --communication from Stack Builder commands in processFlags", () => {
    const noneConfig = processFlags({
      communication: "none",
      backend: "hono",
    });
    expect(noneConfig.communication).toBe("none");

    const resendConfig = processFlags({
      communication: "resend",
      backend: "hono",
    });
    expect(resendConfig.communication).toBe("resend");

    const araraConfig = processFlags({
      communication: "arara",
      backend: "hono",
    });
    expect(araraConfig.communication).toBe("arara");
  });

  it("generates the AraraHQ SDK package and server integration", async () => {
    const result = await createVirtual({
      projectName: "arara-app",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      payments: "none",
      observability: "none",
      communication: "arara",
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
    const araraPackage = JSON.parse(files.get("packages/arara/package.json") ?? "{}");
    const client = files.get("packages/arara/src/lib/client.ts") ?? "";
    const serverEnv = files.get("apps/server/.env") ?? "";
    const serverPackage = JSON.parse(files.get("apps/server/package.json") ?? "{}");
    const readme = files.get("README.md") ?? "";

    expect(araraPackage.dependencies?.["@ararahq/sdk"]).toBe("^1.8.1");
    expect(client).toContain("NodeSDK");
    expect(client).toContain("messages.send");
    expect(client).toContain("templates.list");
    expect(serverEnv).toContain("ARARA_API_KEY=");
    expect(serverPackage.dependencies?.["@arara-app/arara"]).toBeTruthy();
    expect(readme).toContain("docs.ararahq.com/sdks/node");
  });

  it("generates AraraHQ as a Convex Node Action with a backend-only key", async () => {
    const result = await createVirtual({
      projectName: "arara-convex-app",
      frontend: ["tanstack-router"],
      backend: "convex",
      runtime: "none",
      database: "none",
      orm: "none",
      auth: "none",
      payments: "none",
      observability: "none",
      communication: "arara",
      addons: ["none"],
      examples: ["none"],
      dbSetup: "none",
      api: "none",
      webDeploy: "none",
      serverDeploy: "none",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) return;

    const files = collectFiles(result.value.root, "/virtual");
    const action = files.get("packages/backend/convex/arara.ts") ?? "";
    const env = files.get("packages/backend/.env.local") ?? "";
    const backendPackage = JSON.parse(files.get("packages/backend/package.json") ?? "{}");

    expect(action).toContain('"use node"');
    expect(action).toContain("client.messages.send");
    expect(action).toContain("client.templates.create");
    expect(env).toContain("ARARA_API_KEY=");
    expect(backendPackage.dependencies?.["@arara-convex-app/arara"]).toBe("workspace:*");
  });

  it("generates packages/notifique helpers aligned with the Notifique skill", async () => {
    const result = await createVirtual({
      projectName: "notifique-app",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      auth: "none",
      payments: "none",
      observability: "none",
      communication: "notifique",
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
    const client = files.get("packages/notifique/src/lib/client.ts") ?? "";
    const sms = files.get("packages/notifique/src/lib/sms.ts") ?? "";
    const whatsapp = files.get("packages/notifique/src/lib/whatsapp.ts") ?? "";
    const email = files.get("packages/notifique/src/lib/email.ts") ?? "";
    const index = files.get("packages/notifique/src/index.ts") ?? "";
    const serverEnv = files.get("apps/server/.env") ?? "";
    const serverPackage = JSON.parse(files.get("apps/server/package.json") ?? "{}");
    const readme = files.get("README.md") ?? "";

    expect(files.has("packages/email/package.json")).toBe(false);
    expect(index).toContain("export { getNotifiqueClient }");
    expect(index).toContain("sendSms");
    expect(index).not.toMatch(/^\*/m);
    expect(client).toContain("@notifique/sdk-node");
    expect(client).toContain("new Notifique");
    expect(client).toContain("env.NOTIFIQUE_API_KEY");
    expect(client).not.toContain("fetch(");
    expect(sms).toContain(".sms.send");
    expect(sms).toContain("idempotencyKey");
    expect(sms).toContain("options: { priority:");
    expect(sms).not.toContain("options: { speed:");
    expect(whatsapp).toContain(".whatsapp.send");
    expect(whatsapp).toContain("instanceId");
    expect(email).toContain(".email.send");
    expect(email).toContain("env.NOTIFIQUE_FROM_EMAIL");
    expect(email).not.toContain("cc:");
    expect(serverEnv).toContain("NOTIFIQUE_API_KEY=");
    expect(serverPackage.dependencies?.["@notifique-app/notifique"]).toBeTruthy();
    expect(readme).toContain("Notifique");
    expect(readme).toContain("docs.notifique.dev/skill.md");
  });

  it("includes --communication in the reproducible create command", () => {
    const config = {
      projectName: "mail-app",
      projectDir: "/tmp/mail-app",
      relativePath: "mail-app",
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "sqlite",
      orm: "drizzle",
      api: "trpc",
      auth: "none",
      payments: [],
      observability: "none",
      communication: "resend",
      addons: [],
      examples: [],
      dbSetup: "none",
      packageManager: "bun",
      git: true,
      install: true,
      webDeploy: "none",
      serverDeploy: "none",
    } satisfies ProjectConfig;

    const command = generateReproducibleCommand(config);
    expect(command).toContain("--communication resend");
  });
});
