import { afterEach, describe, expect, mock, test } from "bun:test";

import { render, toPlainText } from "react-email";

import { MagicLinkEmail } from "../src/magic-link-email";

describe("magic link email", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("renders the sign-in link in HTML and plain text", async () => {
    const url = "https://kubojs.dev/api/auth/magic-link/verify?token=abc";
    const html = await render(MagicLinkEmail({ url }));
    const text = toPlainText(html);

    expect(html).toContain(url);
    expect(html).toContain("Entrar no Kubo");
    expect(text).toContain("expira em 5 minutos");
    expect(text).toContain(url);
  });

  test("sends through Resend with a bounded, URL-derived idempotency key", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Kubo <noreply@kubojs.dev>";
    const { sendMagicLinkEmail } = await import("../src");

    const fetchMock = mock((_input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(
        new Response(JSON.stringify({ id: "email_456" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const url = `https://kubojs.dev/api/auth/magic-link/verify?token=${"t".repeat(400)}`;
    await expect(sendMagicLinkEmail({ to: "dev@kubojs.dev", url })).resolves.toEqual({
      id: "email_456",
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const key = new Headers(init?.headers).get("Idempotency-Key") ?? "";
    expect(key).toMatch(/^magic-link:[0-9a-f]{64}$/);

    const body = JSON.parse(String(init?.body));
    expect(body.to).toEqual(["dev@kubojs.dev"]);
    expect(body.subject).toBe("Seu link de acesso ao Kubo");
    expect(body.html).toContain(url);
    expect(body.text).toContain(url);
  });
});
