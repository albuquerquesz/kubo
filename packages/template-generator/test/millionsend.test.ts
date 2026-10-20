import { describe, expect, it } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { ProjectConfig } from "@kubojs/types";

import { processTemplateString } from "../src/core/template-processor";

const baseConfig: ProjectConfig = {
  projectName: "test",
  projectDir: "/virtual",
  relativePath: "test",
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
  packageManager: "bun",
  install: false,
  git: false,
  webDeploy: "none",
  serverDeploy: "none",
};

type FixtureOptions = {
  backend?: "hono" | "convex";
  apiKey?: string;
  baseUrl?: string;
  from?: string;
  status?: number;
  response?: unknown;
  input?: Record<string, unknown>;
};

// Each child process owns its fetch mock and SDK singleton. No real requests are sent.
async function runFixture(options: FixtureOptions = {}) {
  const fixture = await mkdtemp(join(tmpdir(), "kubo-millionsend-"));
  try {
    const config = { ...baseConfig, backend: options.backend ?? "hono" };
    for (const file of ["client", "email"]) {
      const template = await Bun.file(
        new URL(`../templates/packages/millionsend/src/lib/${file}.ts.hbs`, import.meta.url),
      ).text();
      const rendered = processTemplateString(template, config)
        .replace('from "millionsend"', `from ${JSON.stringify(import.meta.resolve("millionsend"))}`)
        .replace('from "@test/env/server"', 'from "./env"');
      await writeFile(join(fixture, `${file}.ts`), rendered);
    }
    await writeFile(join(fixture, "env.ts"), "export const env = process.env;");
    const input = {
      to: "recipient@example.com",
      subject: "Hello",
      html: "<p>Hello</p>",
      ...options.input,
    };
    await writeFile(
      join(fixture, "run.mjs"),
      `
      const requests = [];
      globalThis.fetch = async (url, init) => {
        requests.push({ url: String(url), headers: Object.fromEntries(new Headers(init.headers)), body: JSON.parse(init.body) });
        return Response.json(${JSON.stringify(options.response ?? { id: "email-123" })}, { status: ${options.status ?? 200} });
      };
      try {
        const { sendEmail } = await import("./email.ts");
        const { millionsend } = await import("./client.ts");
        const data = await sendEmail(${JSON.stringify(input)});
        console.log(JSON.stringify({ data, requests, hasInboxes: !!millionsend.inboxes, hasReceiving: !!millionsend.emails.receiving }));
      } catch (error) {
        console.log(JSON.stringify({ error: error.message, requests }));
      }
    `,
    );
    const child = Bun.spawn([process.execPath, join(fixture, "run.mjs")], {
      env: {
        ...process.env,
        MILLIONSEND_API_KEY: options.apiKey ?? "ms_test_key",
        MILLIONSEND_BASE_URL: options.baseUrl,
        MILLIONSEND_FROM_EMAIL: options.from,
      },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    if (exitCode !== 0) throw new Error(stderr);
    return JSON.parse(stdout);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
}

describe("generated MillionSend helper with the official SDK", () => {
  it.each(["hono", "convex"] as const)(
    "sends from %s with the configured sender and an idempotency header",
    async (backend) => {
      const result = await runFixture({
        backend,
        from: "Acme <mail@acme.dev>",
        input: {
          to: ["a@example.com", "b@example.com"],
          replyTo: "reply@acme.dev",
          idempotencyKey: "welcome-123",
        },
      });
      expect(result.error).toBeUndefined();
      expect(result.data).toEqual({ id: "email-123" });
      expect(result.hasInboxes).toBe(true);
      expect(result.hasReceiving).toBe(true);
      expect(result.requests).toEqual([
        {
          url: "https://api.millionsend.com/emails",
          headers: expect.objectContaining({
            authorization: "Bearer ms_test_key",
            "idempotency-key": "welcome-123",
          }),
          body: {
            to: ["a@example.com", "b@example.com"],
            subject: "Hello",
            html: "<p>Hello</p>",
            reply_to: "reply@acme.dev",
            from: "Acme <mail@acme.dev>",
          },
        },
      ]);
    },
  );

  it("supports an explicit sender and a self-hosted origin without an idempotency key", async () => {
    const result = await runFixture({
      baseUrl: "http://localhost:3001",
      from: "default@acme.dev",
      input: { from: "override@acme.dev" },
    });
    expect(result.requests[0].url).toBe("http://localhost:3001/emails");
    expect(result.requests[0].body.from).toBe("override@acme.dev");
    expect(result.requests[0].headers["idempotency-key"]).toBeUndefined();
  });

  it("uses the documented placeholder when no sender is configured", async () => {
    const result = await runFixture();
    expect(result.requests[0].body.from).toBe("Acme <noreply@example.com>");
  });

  it("throws SDK error messages", async () => {
    const result = await runFixture({
      status: 422,
      response: { name: "validation_error", message: "Sender is not verified" },
    });
    expect(result.error).toBe("Sender is not verified");
    expect(result.requests).toHaveLength(1);
  });

  it("fails before making a request when the key is missing", async () => {
    const result = await runFixture({ apiKey: "" });
    expect(result.error).toContain("Missing API key");
    expect(result.requests).toEqual([]);
  });

  it("preserves the SDK restriction on non-loopback HTTP", async () => {
    const result = await runFixture({ baseUrl: "http://mail.acme.dev" });
    expect(result.error).toContain("Refusing to send the API key over plain http");
    expect(result.requests).toEqual([]);
  });
});
