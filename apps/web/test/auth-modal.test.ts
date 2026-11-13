import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  emailSignInReducer,
  initialEmailSignInState,
  resolveCallbackURL,
} from "../src/lib/auth-modal-state";

const repoRoot = join(import.meta.dir, "..", "..", "..");

function readRepo(relative: string): string {
  return readFileSync(join(repoRoot, relative), "utf8");
}

describe("auth modal state", () => {
  test("walks the email sign-in flow and resets", () => {
    const sending = emailSignInReducer(initialEmailSignInState, {
      type: "submit",
      email: "dev@kubojs.dev",
    });
    expect(sending).toEqual({ status: "sending", email: "dev@kubojs.dev" });

    const sent = emailSignInReducer(sending, { type: "sent" });
    expect(sent).toEqual({ status: "sent", email: "dev@kubojs.dev" });

    expect(emailSignInReducer(sending, { type: "failed" }).status).toBe("error");
    expect(emailSignInReducer(sent, { type: "reset" })).toEqual(initialEmailSignInState);
  });

  test("callback URL stays on the current page without the modal flag", () => {
    expect(resolveCallbackURL("https://kubojs.dev/new?stack=next&auth=true#deps")).toBe(
      "/new?stack=next#deps",
    );
    expect(resolveCallbackURL("https://kubojs.dev/?auth=true")).toBe("/");
  });
});

describe("auth modal wiring", () => {
  test("provider is mounted inside the Convex auth + nuqs providers", () => {
    const providers = readRepo("apps/web/src/components/providers.tsx");
    expect(providers).toMatch(
      /<ConvexBetterAuthProvider[\s\S]*<NuqsAdapter>[\s\S]*<AuthModalProvider>/,
    );
  });

  test("modal offers Google and email magic link sign-in", () => {
    const modal = readRepo("apps/web/src/components/auth/auth-modal.tsx");
    expect(modal).toContain('provider: "google"');
    expect(modal).toContain("authClient.signIn.magicLink(");

    const client = readRepo("apps/web/src/lib/auth-client.ts");
    expect(client).toContain("magicLinkClient()");
  });

  test("backend enables the magic link plugin and sends through a node action", () => {
    const auth = readRepo("packages/backend/convex/auth.ts");
    expect(auth).toContain("magicLink({");
    expect(auth).toContain("internal.emails.sendMagicLink");

    const emails = readRepo("packages/backend/convex/emails.ts");
    expect(emails.startsWith('"use node";')).toBe(true);
    expect(emails).toContain("sendMagicLinkEmail");
  });
});
