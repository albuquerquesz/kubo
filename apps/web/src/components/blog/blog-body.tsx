import type { ReactNode } from "react";

type Block =
  | { type: "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "pre"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

export function parseBlogBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
        code.push(lines[index] ?? "");
        index += 1;
      }
      index += 1;
      blocks.push({ type: "pre", text: code.join("\n") });
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      index += 1;
      continue;
    }

    if (line.includes("|") && isTableSeparator(lines[index + 1] ?? "")) {
      const headers = parseTableRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && (lines[index] ?? "").includes("|")) {
        rows.push(parseTableRow(lines[index] ?? ""));
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*] /.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^[-*] /, ""));
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\d+\. /, ""));
        index += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      (lines[index] ?? "").trim() !== "" &&
      !(lines[index] ?? "").startsWith("##") &&
      !(lines[index] ?? "").startsWith("```") &&
      !/^[-*] /.test(lines[index] ?? "") &&
      !/^\d+\. /.test(lines[index] ?? "")
    ) {
      paragraph.push((lines[index] ?? "").trim());
      index += 1;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }

  return blocks;
}

function safeHref(href: string): string | null {
  if (href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://")) {
    return href;
  }
  return null;
}

export function BlogInline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    if (token.startsWith("**")) {
      nodes.push(<strong key={start}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={start} className="font-mono text-[0.92em] text-foreground">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      const safe = safeHref(href);
      nodes.push(
        safe ? (
          <a
            key={start}
            href={safe}
            className="text-foreground underline decoration-primary/60 underline-offset-4 hover:decoration-primary"
            {...(safe.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {label}
          </a>
        ) : (
          label
        ),
      );
    }
    cursor = start + token.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

export function BlogBody({ markdown }: { markdown: string }) {
  return (
    <div className="max-w-2xl space-y-8 text-base leading-8 text-muted-foreground">
      {parseBlogBlocks(markdown).map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2
              key={index}
              className="pt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground"
            >
              <BlogInline text={block.text} />
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3 key={index} className="text-xl font-semibold tracking-[-0.03em] text-foreground">
              <BlogInline text={block.text} />
            </h3>
          );
        }
        if (block.type === "pre") {
          return (
            <pre
              key={index}
              className="overflow-x-auto border-rule border bg-muted p-4 font-mono text-sm leading-6 text-foreground"
            >
              <code>{block.text}</code>
            </pre>
          );
        }
        if (block.type === "ul" || block.type === "ol") {
          const List = block.type === "ul" ? "ul" : "ol";
          return (
            <List key={index} className="list-disc space-y-3 pl-5">
              {block.items.map((item) => (
                <li key={item}>
                  <BlogInline text={item} />
                </li>
              ))}
            </List>
          );
        }
        if (block.type === "table") {
          return (
            <div key={index} className="overflow-x-auto border-rule border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-rule border-b">
                    {block.headers.map((header) => (
                      <th key={header} className="px-3 py-2 font-medium text-foreground">
                        <BlogInline text={header} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row.join("|")} className="border-rule border-b last:border-b-0">
                      {row.map((cell, cellIndex) => (
                        <td key={`${cell}-${cellIndex}`} className="px-3 py-2">
                          <BlogInline text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={index}>
            <BlogInline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
