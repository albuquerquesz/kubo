import { afterEach, describe, expect, it, mock } from "bun:test";

import { render, toPlainText } from "react-email";

import { mail } from "../../../packages/email/src";
import { ReleaseChangelogEmail } from "../../../packages/email/src/release-changelog-email";

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

  it("sends the rendered release through Notifique", async () => {
    const fetchMock = mock((_input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            data: { status: "QUEUED", count: 1, messageIds: ["message_123"] },
          }),
          { status: 202, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await mail({
      release,
      to: "updates@example.com",
      idempotencyKey: "release-1.2.3",
    });

    expect(result).toEqual({ status: "QUEUED", count: 1, messageIds: ["message_123"] });
  });
});
