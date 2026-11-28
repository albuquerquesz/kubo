import { kuboSurface } from "@kubojs/design";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { BlogBody } from "@/components/blog/blog-body";
import { BlogFigure } from "@/components/blog/blog-figure";
import { NewsletterForm } from "@/components/newsletter-form";
import { formatBlogDate, type BlogPost } from "@/lib/blog";

import Footer from "../../app/(home)/_components/footer";

export function BlogArticle({ post }: { post: BlogPost }) {
  return (
    <main className="min-h-svh overflow-x-clip">
      <article className="mx-auto w-full max-w-4xl px-5 pb-16 pt-24 sm:px-8 sm:pt-28">
        <Link
          href="/blog"
          aria-label={post.lang === "en" ? "Back to the blog" : "Voltar ao blog"}
          className={kuboSurface.icon}
        >
          <ArrowLeft className="size-4" />
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
        <section
          className={`${kuboSurface.panel} mt-16 p-6 sm:p-8`}
          aria-labelledby="article-newsletter"
        >
          <p className="ui-kicker text-primary">Newsletter</p>
          <h2 id="article-newsletter" className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
            {post.lang === "en" ? "Get the next note" : "Receba a próxima nota"}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            {post.lang === "en"
              ? "Releases and short notes, only when there is something new."
              : "Lançamentos e notas curtas, só quando houver algo novo."}
          </p>
          <NewsletterForm
            id="article-newsletter-email"
            className="mt-6"
            label={post.lang === "en" ? "Your email" : "Seu email"}
            placeholder={post.lang === "en" ? "you@example.com" : "voce@exemplo.com"}
            submitLabel={post.lang === "en" ? "Join" : "Entrar"}
          />
        </section>
      </article>
      <Footer />
    </main>
  );
}
