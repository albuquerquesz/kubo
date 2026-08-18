import { afterEach, describe, expect, it, mock } from "bun:test";

import { render, toPlainText } from "react-email";

import { sendReleaseChangelogEmail } from "./notifique";
import { ReleaseChangelogEmail } from "./release-changelog-email";

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

describe("ReleaseChangelogEmail", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("renders the release content in HTML and plain text", async () => {
    const html = await render(<ReleaseChangelogEmail {...release} />);
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
      <ReleaseChangelogEmail
        version={release.version}
        releaseDate={release.releaseDate}
        intro={release.intro}
        changes={release.changes}
        releaseUrl={release.releaseUrl}
      />,
    );

    expect(html).not.toContain("https://example.com/docs");
    expect(html).not.toContain("www.npmjs.com");
  });

  it("sends the rendered release through Notifique", async () => {
    const fetchMock = mock((_input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            data: { status: "QUEUED", messageIds: ["message_123"] },
          }),
          { status: 202, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await sendReleaseChangelogEmail({
      release,
      to: "updates@example.com",
      from: "KuboJS <updates@example.com>",
      apiKey: "sk_test_123",
      idempotencyKey: "release-1.2.3",
    });

    expect(result).toEqual({ status: "QUEUED", messageIds: ["message_123"] });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.notifique.dev/v1/email/messages",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer sk_test_123",
          "Idempotency-Key": "release-1.2.3",
        }),
      }),
    );

    const request = fetchMock.mock.calls[0]?.[1];
    const body = JSON.parse(String(request?.body));
    expect(body.type).toBe("email");
    expect(body.payload.subject).toContain("KuboJS 1.2.3");
    expect(body.payload.html).toContain("Novo fluxo de release");
    expect(body.payload.text).toContain("NOVO FLUXO DE RELEASE");
  });
});
