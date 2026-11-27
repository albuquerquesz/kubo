import { describe, expect, test } from "bun:test";

import { parseBlogBlocks } from "../src/components/blog/blog-body";
import { blogLangFromHeader, formatBlogDate, parseBlogSource } from "../src/lib/blog";

const source = `# Escolha de stack

Meta description (20 caracteres): Como escolher de propósito.

Slug: /article/escolha-de-stack-explicita
Data de publicação: 2026-11-27

## A seção

Um parágrafo com **negrito** e \`comando\`.

| Peça | Pergunta |
| --- | --- |
| Frontend | Como a pessoa usa? |

- primeiro item
`;

describe("blog source", () => {
  test("reads title, description, date and body", () => {
    const post = parseBlogSource("escolha-de-stack-explicita.pt.md", source);
    expect(post.slug).toBe("escolha-de-stack-explicita");
    expect(post.lang).toBe("pt");
    expect(post.title).toBe("Escolha de stack");
    expect(post.description).toBe("Como escolher de propósito.");
    expect(post.publishedOn).toBe("2026-11-27");
    expect(post.body.startsWith("## A seção")).toBe(true);
  });

  test("formats the publication date", () => {
    expect(formatBlogDate("2026-11-27", "pt")).toBe("27 nov 2026");
    expect(blogLangFromHeader("en-US,en;q=0.8")).toBe("en");
    expect(blogLangFromHeader("pt-BR,pt;q=0.9")).toBe("pt");
    expect(formatBlogDate("2026-11-27", "en")).toBe("Nov 27, 2026");
  });

  test("keeps table, list, code and paragraph", () => {
    const blocks = parseBlogBlocks(
      parseBlogSource("escolha-de-stack-explicita.pt.md", source).body,
    );
    expect(blocks.map((block) => block.type)).toEqual(["h2", "p", "table", "ul"]);
  });
});
