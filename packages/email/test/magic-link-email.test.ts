import { describe, expect, test } from "bun:test";

import { render, toPlainText } from "react-email";

import { MagicLinkEmail } from "../src/magic-link-email";

describe("magic link email", () => {
  test("renders the sign-in link in HTML and plain text", async () => {
    const url = "https://kubojs.dev/api/auth/magic-link/verify?token=abc";
    const html = await render(MagicLinkEmail({ url }));
    const text = toPlainText(html);

    expect(html).toContain(url);
    expect(html).toContain("Entrar no Kubo");
    expect(text).toContain("expira em 5 minutos");
    expect(text).toContain(url);
  });
});
