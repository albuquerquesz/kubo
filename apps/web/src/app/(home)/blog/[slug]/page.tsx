import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog/blog-article";
import { blogLangFromHeader, getBlogPost, listBlogSlugs } from "@/lib/blog";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const headerStore = await headers();
  const lang = blogLangFromHeader(headerStore.get("accept-language"));
  const post = getBlogPost(slug, lang) ?? getBlogPost(slug, "pt");
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
  const headerStore = await headers();
  const lang = blogLangFromHeader(headerStore.get("accept-language"));
  const post = getBlogPost(slug, lang) ?? getBlogPost(slug, "pt");
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
