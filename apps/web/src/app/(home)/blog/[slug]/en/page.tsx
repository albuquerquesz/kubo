import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog/blog-article";
import { getBlogPost, listBlogSlugs } from "@/lib/blog";

export function generateStaticParams() {
  return listBlogSlugs()
    .filter((slug) => getBlogPost(slug, "en"))
    .map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getBlogPost(slug, "en");
  if (!post) return {};
  return {
    title: `${post.title} - kubojs`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://kubojs.dev/blog/${post.slug}/en`,
      type: "article",
    },
  };
}

export default async function EnglishBlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = getBlogPost(slug, "en");
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
