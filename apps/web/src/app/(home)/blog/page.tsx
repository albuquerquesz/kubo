import type { Metadata } from "next";
import Link from "next/link";

import { formatBlogDate, listBlogPosts } from "@/lib/blog";

import Footer from "../_components/footer";

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

export default function BlogIndexPage() {
  const posts = listBlogPosts("pt");

  return (
    <main className="min-h-svh overflow-x-clip">
      <header className="border-rule border-b px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pt-36">
        <div className="mx-auto max-w-[1440px]">
          <p className="ui-kicker text-primary">Blog</p>
          <h1 className="ui-display mt-8 max-w-4xl text-balance text-5xl sm:text-7xl">
            Tecnologia em volta do Kubo.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Escolha de stack, telemetria de ferramenta e o agente de código que instala o projeto.
          </p>
        </div>
      </header>
      <ul className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">
        {posts.map((post) => (
          <li key={post.slug} className="border-rule border-t py-8">
            <p className="ui-kicker text-muted-foreground">
              {formatBlogDate(post.publishedOn, "pt")}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                {post.title}
              </Link>
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{post.description}</p>
          </li>
        ))}
      </ul>
      <Footer />
    </main>
  );
}
