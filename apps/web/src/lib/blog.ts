import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type BlogLang = "pt" | "en";

export type BlogPost = {
  slug: string;
  lang: BlogLang;
  title: string;
  description: string;
  publishedOn: string;
  body: string;
};

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const SLUG_ORDER = [
  "escolha-de-stack-explicita",
  "telemetria-honesta-em-cli",
  "agente-de-codigo-instala-o-projeto",
];

const FILE_NAME = /^([a-z0-9-]+)\.(pt|en)\.md$/;

export function parseBlogSource(filename: string, raw: string): BlogPost {
  const match = FILE_NAME.exec(filename);
  if (!match) {
    throw new Error(`Nome de artigo inválido: ${filename}`);
  }

  const [, slug, lang] = match;
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const titleLine = lines[0] ?? "";
  if (!titleLine.startsWith("# ")) {
    throw new Error(`Artigo sem título: ${filename}`);
  }

  const descriptionLine = lines.find((line) => line.includes("description"));
  const dateLine = lines.find((line) => /publica|Publication date/i.test(line));
  const description = descriptionLine?.split(":").slice(1).join(":").trim() ?? "";
  const publishedOn = dateLine?.split(":").slice(1).join(":").trim() ?? "";
  const bodyStart = lines.findIndex((line) => line.startsWith("## "));
  if (!description || !/^\d{4}-\d{2}-\d{2}$/.test(publishedOn) || bodyStart < 0) {
    throw new Error(`Cabeçalho incompleto: ${filename}`);
  }

  return {
    slug: slug ?? "",
    lang: lang === "en" ? "en" : "pt",
    title: titleLine.slice(2).trim(),
    description,
    publishedOn,
    body: lines.slice(bodyStart).join("\n").trim(),
  };
}

function readPosts(): BlogPost[] {
  return readdirSync(BLOG_DIR)
    .filter((name) => FILE_NAME.test(name))
    .map((name) => parseBlogSource(name, readFileSync(path.join(BLOG_DIR, name), "utf8")));
}

export function listBlogPosts(lang: BlogLang): BlogPost[] {
  return readPosts()
    .filter((post) => post.lang === lang)
    .sort((a, b) => SLUG_ORDER.indexOf(a.slug) - SLUG_ORDER.indexOf(b.slug));
}

export function getBlogPost(slug: string, lang: BlogLang): BlogPost | undefined {
  return readPosts().find((post) => post.slug === slug && post.lang === lang);
}

export function listBlogSlugs(): string[] {
  return [...new Set(readPosts().map((post) => post.slug))];
}

export function formatBlogDate(publishedOn: string, lang: BlogLang): string {
  const [year, month, day] = publishedOn.split("-");
  const months =
    lang === "en"
      ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      : ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const monthIndex = Number(month) - 1;
  const label = months[monthIndex] ?? month;
  return lang === "en" ? `${label} ${Number(day)}, ${year}` : `${Number(day)} ${label} ${year}`;
}
