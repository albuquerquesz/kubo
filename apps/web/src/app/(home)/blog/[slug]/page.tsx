import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogBody } from "@/components/blog/blog-body";
import { formatBlogDate, getBlogPost, listBlogSlugs } from "@/lib/blog";

import Footer from "../../_components/footer";

export function generateStaticParams() {
  return listBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getBlogPost(slug, "pt");
  if (!post) return {};
  return {
    title: `${post.title} - kubojs`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://kubojs.dev/blog/${post.slug}`,
      type: "article",
    },
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = getBlogPost(slug, "pt");
  if (!post) notFound();
  const english = getBlogPost(slug, "en");

  return (
    <main className="min-h-svh overflow-x-clip">
      <article>
        <header className="border-rule border-b px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pt-36">
          <div className="mx-auto max-w-[1440px]">
            <p className="ui-kicker text-primary">
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
              {" · "}
              {formatBlogDate(post.publishedOn, "pt")}
            </p>
            <h1 className="ui-display mt-8 max-w-4xl text-balance text-4xl sm:text-6xl">
              {post.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
              {post.description}
            </p>
            {english ? (
              <p className="mt-6">
                <Link
                  href={`/blog/${post.slug}/en`}
                  className="text-sm text-foreground underline decoration-primary/60 underline-offset-4"
                >
                  English
                </Link>
              </p>
            ) : null}
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <BlogBody markdown={post.body} />
        </div>
      </article>
      <Footer />
    </main>
  );
}
