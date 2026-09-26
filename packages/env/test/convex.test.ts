import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const authModuleUrl = new URL("../../backend/convex/auth.ts", import.meta.url).href;

function loadAuthModule(environment: Record<string, string> = {}) {
  return spawnSync(process.execPath, ["--eval", `await import(${JSON.stringify(authModuleUrl)})`], {
    cwd: tmpdir(),
    encoding: "utf8",
    env: {
      PATH: process.env.PATH ?? "",
      NODE_ENV: "production",
      ...environment,
    },
    timeout: 10_000,
  });
}

test("requires all Better Auth environment variables during Convex module bootstrap", () => {
  const result = loadAuthModule();

  expect(result.error).toBeUndefined();
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("BETTER_AUTH_SECRET");
});

test("loads Better Auth during Convex module bootstrap with valid values", () => {
  const result = loadAuthModule({
    BETTER_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
    GOOGLE_CLIENT_ID: "google-client-id",
    GOOGLE_CLIENT_SECRET: "google-client-secret",
    SITE_URL: "http://localhost:3333",
  });

  expect(result.error).toBeUndefined();
  expect(result.status).toBe(0);
});

test("rejects an invalid secret or site URL during Convex module bootstrap", () => {
  const result = loadAuthModule({
    BETTER_AUTH_SECRET: "short",
    GOOGLE_CLIENT_ID: "google-client-id",
    GOOGLE_CLIENT_SECRET: "google-client-secret",
    SITE_URL: "not-a-url",
  });

  expect(result.error).toBeUndefined();
  expect(result.status).not.toBe(0);
});
