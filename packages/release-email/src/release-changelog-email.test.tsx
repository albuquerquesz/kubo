import { describe, expect, it } from "bun:test";

import { render, toPlainText } from "react-email";

import { ReleaseChangelogEmail } from "./release-changelog-email";

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
});
