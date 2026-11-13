import { afterEach, describe, expect, it, mock } from "bun:test";

import { render, toPlainText } from "react-email";

import { ReleaseChangelogEmail } from "../src/release-changelog-email";

const originalFetch = globalThis.fetch;

const release = {
  version: "1.2.3",
  releaseDate: "13 AGO 2026",
  intro: "Uma atualização importante para quem constrói com KuboJS.",
  changes: [
    {
      category: "CLI",
      title: "Novo fluxo de release",
      description: "O projeto agora tem um caminho mais claro até produção.",
    },
  ],
  releaseUrl: "https://example.com/releases/v1.2.3",
  docsUrl: "https://example.com/docs",
  npmUrl: "https://www.npmjs.com/package/create-kubojs",
};

describe("newsletter release email", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("renders the release content in HTML and plain text", async () => {
    const html = await render(ReleaseChangelogEmail(release));
    const text = toPlainText(html);

    expect(html).toContain("KuboJS 1.2.3");
    expect(html).toContain("Novo fluxo de release");
    expect(html).toContain("https://example.com/releases/v1.2.3");
    expect(html).toContain("KuboJS 1.2.3: o que mudou e o que você pode usar agora.");
    expect(text).toContain("NOVO FLUXO DE RELEASE");
    expect(text).toContain("https://example.com/docs");
  });

  it("renders without optional links", async () => {
    const html = await render(
      ReleaseChangelogEmail({
        version: release.version,
        releaseDate: release.releaseDate,
        intro: release.intro,
        changes: release.changes,
        releaseUrl: release.releaseUrl,
      }),
    );

    expect(html).not.toContain("https://example.com/docs");
    expect(html).not.toContain("www.npmjs.com");
  });

  it("sends the rendered release through Resend with unsubscribe headers", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Kubo <noreply@kubojs.dev>";
    const { mail } = await import("../src");

    const fetchMock = mock((_input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(
        new Response(JSON.stringify({ id: "email_123" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await mail({
      release,
      to: "updates@example.com",
      idempotencyKey: "release-1.2.3",
      unsubscribeUrl: "https://example.convex.site/newsletter/unsubscribe?token=abc",
    });

    expect(result).toEqual({ id: "email_123" });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe("https://api.resend.com/emails");
    expect(new Headers(init?.headers).get("Idempotency-Key")).toBe("release-1.2.3");

    const body = JSON.parse(String(init?.body));
    expect(body.from).toBe("Kubo <noreply@kubojs.dev>");
    expect(body.to).toEqual(["updates@example.com"]);
    expect(body.headers).toEqual({
      "List-Unsubscribe": "<https://example.convex.site/newsletter/unsubscribe?token=abc>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
  });

  it("throws when Resend rejects the email", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Kubo <noreply@kubojs.dev>";
    const { EmailDeliveryError, mail } = await import("../src");

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ name: "validation_error", message: "Invalid `from` field." }),
          { status: 422, headers: { "Content-Type": "application/json" } },
        ),
      ),
    ) as unknown as typeof fetch;

    await expect(mail({ release, to: "updates@example.com" })).rejects.toBeInstanceOf(
      EmailDeliveryError,
    );
  });
});
