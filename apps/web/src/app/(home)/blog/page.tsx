import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { blogLangFromHeader, formatBlogDate, listBlogPosts } from "@/lib/blog";

import Footer from "../_components/footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog - kubojs",
  description:
    "Textos sobre stack TypeScript, telemetria de CLI e agentes de código, ligados ao que o Kubo faz.",
  openGraph: {
    title: "Blog - kubojs",
    description:
      "Textos sobre stack TypeScript, telemetria de CLI e agentes de código, ligados ao que o Kubo faz.",
    url: "https://kubojs.dev/blog",
    type: "website",
  },
};

export default async function BlogIndexPage() {
  const headerStore = await headers();
  const lang = blogLangFromHeader(headerStore.get("accept-language"));
  const posts = listBlogPosts(lang);

  return (
    <main className="min-h-svh overflow-x-clip">
      <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-24 sm:px-8 sm:pt-28">
        <p className="ui-kicker text-primary">Blog</p>
        <h1 className="ui-display mt-6 text-balance text-5xl sm:text-7xl">
          {lang === "en" ? "Technology around Kubo." : "Tecnologia em volta do Kubo."}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {lang === "en"
            ? "Stack choices, CLI telemetry, and the coding agent that installs the project."
            : "Escolha de stack, telemetria de ferramenta e o agente de código que instala o projeto."}
        </p>
        <ul className="mt-12">
          {posts.map((post) => (
            <li key={post.slug} className="border-border border-t py-8">
              <p className="ui-kicker text-muted-foreground">
                {formatBlogDate(post.publishedOn, lang)}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-muted-foreground">{post.description}</p>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </main>
  );
}
