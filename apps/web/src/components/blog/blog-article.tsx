import { kuboSurface } from "@kubojs/design";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { BlogBody } from "@/components/blog/blog-body";
import { BlogFigure } from "@/components/blog/blog-figure";
import { formatBlogDate, type BlogPost } from "@/lib/blog";

import Footer from "../../app/(home)/_components/footer";

export function BlogArticle({ post }: { post: BlogPost }) {
  return (
    <main className="min-h-svh overflow-x-clip">
      <article className="mx-auto w-full max-w-4xl px-5 pb-16 pt-24 sm:px-8 sm:pt-28">
        <Link href="/blog" className={kuboSurface.control}>
          <ArrowLeft className="size-4" aria-hidden />
          Blog
        </Link>
        <header className="mt-10">
          <p className="ui-kicker text-primary">{formatBlogDate(post.publishedOn, post.lang)}</p>
          <h1 className="ui-display mt-6 text-balance text-4xl sm:text-6xl">{post.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{post.description}</p>
        </header>
        <div className="mt-10">
          <BlogFigure slug={post.slug} lang={post.lang} />
        </div>
        <div className="mt-12">
          <BlogBody markdown={post.body} />
        </div>
      </article>
      <Footer />
    </main>
  );
}
