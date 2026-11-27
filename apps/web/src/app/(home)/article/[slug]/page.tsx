import { redirect } from "next/navigation";

import { listBlogSlugs } from "@/lib/blog";

export function generateStaticParams() {
  return listBlogSlugs().map((slug) => ({ slug }));
}

export default async function ArticleAliasPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  redirect(`/blog/${slug}`);
}
