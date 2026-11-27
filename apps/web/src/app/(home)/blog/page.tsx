import { kuboSurface } from "@kubojs/design";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { BlogStage, blogCover } from "@/components/blog/blog-figure";
import { blogLangFromHeader, formatBlogDate, listBlogPosts, type BlogPost } from "@/lib/blog";

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
  const [lead, ...rest] = posts;

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
        {lead ? <LeadPost post={lead} lang={lang} /> : null}
        {rest.length > 0 ? (
          <ul className="mt-16 grid gap-3.5 sm:grid-cols-2">
            {rest.map((post) => (
              <li key={post.slug}>
                <CardPost post={post} lang={lang} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Footer />
    </main>
  );
}

function LeadPost({ post, lang }: { post: BlogPost; lang: BlogPost["lang"] }) {
  const cover = blogCover(post.slug);

  return (
    <article className="mt-8">
      <Link href={`/blog/${post.slug}`} className="block">
        {cover ? (
          <div className="relative aspect-[1.9/1] overflow-hidden rounded-3xl border border-border bg-zinc-950">
            <Image
              src={cover.src}
              alt={cover.alt[lang]}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        ) : (
          <BlogStage slug={post.slug} lang={lang} />
        )}
      </Link>
      <p className="ui-kicker mt-4 text-muted-foreground">
        {formatBlogDate(post.publishedOn, lang)}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
        <Link href={`/blog/${post.slug}`} className="hover:text-primary">
          {post.title}
        </Link>
      </h2>
      <p className="mt-3 leading-7 text-muted-foreground">{post.description}</p>
    </article>
  );
}

function CardPost({ post, lang }: { post: BlogPost; lang: BlogPost["lang"] }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`${kuboSurface.panel} block p-2 pb-4`}>
      <BlogStage slug={post.slug} lang={lang} compact />
      <div className="px-2 pt-3">
        <p className="ui-kicker text-muted-foreground">{formatBlogDate(post.publishedOn, lang)}</p>
        <h2 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-foreground">
          {post.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.description}</p>
      </div>
    </Link>
  );
}
