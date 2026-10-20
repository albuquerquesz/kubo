import { describe, expect, it } from "bun:test";

import {
  buildKuboConfigFromProject,
  serializeKuboConfigFile,
  generateReproducibleCommand,
} from "@kubojs/template-generator";

import { DEFAULT_CONFIG, getDefaultConfig } from "../src/constants";
import { createVirtual } from "../src/index";
import { validateCommunicationCompatibility } from "../src/utils/compatibility-rules";
import { processFlags } from "../src/utils/config-processing";
import { collectFiles } from "./setup";

const baseInput = {
  projectName: "million-app",
  frontend: ["tanstack-router"],
  backend: "hono",
  runtime: "bun",
  database: "none",
  orm: "none",
  auth: "none",
  payments: [],
  observability: [],
  communication: ["millionsend"],
  addons: [],
  examples: [],
  testing: [],
  dbSetup: "none",
  api: "trpc",
  webDeploy: "none",
  serverDeploy: "none",
  install: false,
  git: false,
} satisfies Parameters<typeof createVirtual>[0];

async function generate(overrides: Partial<Parameters<typeof createVirtual>[0]> = {}) {
  const result = await createVirtual({ ...baseInput, ...overrides });
  if (result.isErr()) throw result.error;
  return {
    files: collectFiles(result.value.root, "/virtual"),
    config: result.value.config,
  };
}

function read(files: Map<string, string>, path: string) {
  const content = files.get(path);
  if (content === undefined) throw new Error(`Missing generated file: ${path}`);
  return content;
}

describe("MillionSend communication", () => {
  it("keeps default communication selections independent between projects", () => {
    const first = getDefaultConfig();
    first.communication.push("millionsend");
    expect(first.communication).toEqual(["arara", "millionsend"]);
    expect(getDefaultConfig().communication).toEqual(["arara"]);
    expect(DEFAULT_CONFIG.communication).toEqual(["arara"]);
  });

  it.each(["bun", "pnpm", "npm"] as const)(
    "wires server dependencies for %s",
    async (packageManager) => {
      const { files, config } = await generate({ packageManager });
      const pkg = JSON.parse(read(files, "packages/millionsend/package.json"));
      const server = JSON.parse(read(files, "apps/server/package.json"));
      const workspaceVersion = packageManager === "npm" ? "*" : "workspace:*";
      const versions = JSON.stringify([
        pkg,
        files.get("package.json"),
        files.get("pnpm-workspace.yaml"),
      ]);

      expect(pkg.name).toBe("@million-app/millionsend");
      expect(versions).toContain("^0.10.0");
      expect(pkg.dependencies.millionsend).toBeDefined();
      expect(pkg.dependencies["@million-app/env"]).toBe(workspaceVersion);
      expect(server.dependencies["@million-app/millionsend"]).toBe(workspaceVersion);
      expect(read(files, "packages/millionsend/src/index.ts")).toContain("SendEmailInput");
      expect(read(files, "packages/millionsend/src/lib/client.ts")).toContain('from "millionsend"');
      expect(read(files, "apps/server/.env")).toContain("MILLIONSEND_API_KEY=");
      expect(read(files, "apps/server/.env")).toContain(
        "MILLIONSEND_BASE_URL=https://api.millionsend.com",
      );
      expect(read(files, "packages/env/src/server.ts")).toContain(
        "MILLIONSEND_API_KEY: z.string().min(1)",
      );
      expect(read(files, "apps/web/.env")).not.toContain("MILLIONSEND_API_KEY");
      expect(read(files, "packages/env/src/web.ts")).not.toContain("MILLIONSEND_API_KEY");
      expect(read(files, "README.md")).toContain("@million-app/millionsend");
      expect(read(files, "README.md")).toContain("before importing the client");
      expect(generateReproducibleCommand(config)).toContain("--communication millionsend");
      expect(serializeKuboConfigFile(buildKuboConfigFromProject(config, "0.3.1"))).toContain(
        '"millionsend"',
      );
      expect(files.has("packages/email/package.json")).toBe(false);
    },
  );

  it("coexists with Resend and Notifique", async () => {
    const { files } = await generate({ communication: ["resend", "notifique", "millionsend"] });
    for (const directory of ["email", "notifique", "millionsend"]) {
      expect(files.has(`packages/${directory}/package.json`)).toBe(true);
    }
    const env = read(files, "apps/server/.env");
    for (const provider of ["RESEND", "NOTIFIQUE", "MILLIONSEND"]) {
      expect(env).toContain(`${provider}_API_KEY=`);
    }
  });

  it("omits all MillionSend artifacts when not selected", async () => {
    const { files } = await generate({ communication: [] });
    expect([...files.keys()].some((path) => path.startsWith("packages/millionsend/"))).toBe(false);
    expect(read(files, "apps/server/.env")).not.toContain("MILLIONSEND_");
    expect(read(files, "packages/env/src/server.ts")).not.toContain("MILLIONSEND_");
    expect(read(files, "README.md")).not.toContain("MillionSend");
  });

  it("uses the integrated backend's private environment", async () => {
    const { files } = await generate({ backend: "self", runtime: "none", frontend: ["next"] });
    const web = JSON.parse(read(files, "apps/web/package.json"));
    expect(web.dependencies["@million-app/millionsend"]).toBe("workspace:*");
    expect(read(files, "apps/web/.env")).toContain("MILLIONSEND_API_KEY=");
    expect(read(files, "packages/env/src/web.ts")).not.toContain("MILLIONSEND_");
    expect(read(files, "README.md")).toContain("apps/web/.env");
  });

  it("keeps Convex independent of the web environment loader", async () => {
    const { files } = await generate({ backend: "convex", runtime: "none", api: "none" });
    const pkg = JSON.parse(read(files, "packages/millionsend/package.json"));
    const backend = JSON.parse(read(files, "packages/backend/package.json"));
    expect(backend.dependencies["@million-app/millionsend"]).toBe("workspace:*");
    expect(pkg.dependencies["@million-app/env"]).toBeUndefined();
    expect(read(files, "packages/backend/.env.local")).toContain("MILLIONSEND_API_KEY=");
    for (const file of ["client", "email"]) {
      const source = read(files, `packages/millionsend/src/lib/${file}.ts`);
      expect(source).toContain("process.env.MILLIONSEND_");
      expect(source).not.toContain("/env/server");
    }
    expect(read(files, "apps/web/.env")).not.toContain("MILLIONSEND_");
    expect(read(files, "README.md")).toContain("convex env set MILLIONSEND_API_KEY");
  });

  it("binds the key only to a dedicated Cloudflare backend", async () => {
    const { files } = await generate({
      runtime: "workers",
      serverDeploy: "cloudflare",
      webDeploy: "cloudflare",
      frontend: ["next"],
    });
    const infra = read(files, "packages/infra/alchemy.run.ts");
    const [server, web] = infra.split("export const web");
    expect(server).toContain("MILLIONSEND_API_KEY: alchemy.secret.env.MILLIONSEND_API_KEY!");
    expect(server).toContain("MILLIONSEND_BASE_URL:");
    expect(web).not.toContain("MILLIONSEND_");
  });

  it.each(["next", "svelte", "tanstack-start", "nuxt", "astro"] as const)(
    "binds the integrated %s Cloudflare backend",
    async (frontend) => {
      const { files } = await generate({
        backend: "self",
        runtime: "none",
        api: "orpc",
        frontend: [frontend],
        webDeploy: "cloudflare",
      });
      const infra = read(files, "packages/infra/alchemy.run.ts");
      expect(infra).toContain("MILLIONSEND_API_KEY: alchemy.secret.env.MILLIONSEND_API_KEY!");
      expect(infra).toContain("MILLIONSEND_FROM_EMAIL:");
    },
  );

  it("preserves flags and validates backend requirements", () => {
    expect(processFlags({ communication: "millionsend", backend: "hono" }).communication).toEqual([
      "millionsend",
    ]);
    expect(
      processFlags({ communication: ["millionsend", "resend"], backend: "hono" }).communication,
    ).toEqual(["millionsend", "resend"]);
    const invalid = validateCommunicationCompatibility(["millionsend"], "none");
    expect(invalid.isErr()).toBe(true);
    if (invalid.isErr())
      expect(invalid.error.message).toContain(
        "MillionSend communication requires a server backend",
      );
    expect(
      validateCommunicationCompatibility(["millionsend"], "hono", "workers", "cloudflare").isOk(),
    ).toBe(true);
  });
});
