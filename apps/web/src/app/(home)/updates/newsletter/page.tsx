import type { Metadata } from "next";
import Link from "next/link";

import Footer from "../../_components/footer";

export const metadata: Metadata = {
  title: "A newsletter do Kubo está chegando - kubojs",
  description:
    "Um espaço para acompanhar lançamentos, decisões de produto e guias curtos sobre projetos TypeScript.",
  openGraph: {
    title: "A newsletter do Kubo está chegando",
    description:
      "Lançamentos, decisões de produto e guias curtos para montar projetos TypeScript com mais clareza.",
    url: "https://kubojs.dev/updates/newsletter",
    type: "article",
  },
};

export default function NewsletterAnnouncementPage() {
  return (
    <main className="min-h-svh overflow-x-clip">
      <article>
        <header className="border-rule border-b px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pt-36">
          <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.5fr)] lg:gap-24">
            <div>
              <p className="ui-kicker text-primary">Atualização · 14 ago 2026</p>
              <h1 className="ui-display mt-8 max-w-4xl text-balance text-5xl sm:text-7xl">
                A newsletter do Kubo está chegando.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Um canal direto para acompanhar o que muda no Kubo, sem transformar cada lançamento
                em mais uma aba aberta.
              </p>
            </div>
            <dl className="grid h-fit grid-cols-2 border-rule border-y text-sm lg:mt-2 lg:grid-cols-1 lg:border-y-0">
              <div className="border-rule border-r py-4 lg:border-r-0 lg:border-b">
                <dt className="ui-kicker text-muted-foreground">Formato</dt>
                <dd className="mt-2 text-foreground">Notas curtas</dd>
              </div>
              <div className="py-4 lg:pt-6">
                <dt className="ui-kicker text-muted-foreground">Ritmo</dt>
                <dd className="mt-2 text-foreground">Quando fizer sentido</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.5fr)] lg:gap-24 lg:px-12">
          <div className="max-w-2xl space-y-12 text-base leading-8 text-muted-foreground">
            <p className="text-xl leading-9 text-foreground">
              Kubo existe para tornar as decisões de um projeto TypeScript visíveis. A newsletter
              segue a mesma ideia: contexto suficiente para entender o movimento, sem conteúdo por
              obrigação.
            </p>

            <section aria-labelledby="what-you-get">
              <p className="ui-kicker text-primary">01 · O que entra</p>
              <h2
                id="what-you-get"
                className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground"
              >
                O que você pode esperar
              </h2>
              <ul className="mt-6 space-y-4">
                <li className="border-rule border-t pt-4">
                  Novos recursos do CLI e do Stack Builder.
                </li>
                <li className="border-rule border-t pt-4">
                  Decisões de arquitetura explicadas sem esconder os trade-offs.
                </li>
                <li className="border-rule border-t pt-4">
                  Guias práticos para sair de uma ideia e chegar a um projeto executável.
                </li>
              </ul>
            </section>

            <section aria-labelledby="why-now">
              <p className="ui-kicker text-primary">02 · Por que agora</p>
              <h2
                id="why-now"
                className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground"
              >
                Construir também é comunicar
              </h2>
              <p className="mt-6">
                As melhores ferramentas não apenas geram arquivos. Elas ajudam você a entender por
                que cada escolha está ali. Este post é o primeiro passo para levar essa conversa
                para a sua caixa de entrada.
              </p>
            </section>

            <section className="border-rule border-y py-8" aria-labelledby="join-list">
              <p className="ui-kicker text-primary">03 · Próximo passo</p>
              <h2
                id="join-list"
                className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground"
              >
                Entre na lista
              </h2>
              <p className="mt-4">
                O campo de email no rodapé fica sempre à mão. Quando a primeira edição estiver
                pronta, ela chega com uma única pergunta: o que vale a pena construir agora?
              </p>
              <Link
                href="/#newsletter-title"
                className="mt-6 inline-flex min-h-12 items-center gap-2 bg-primary px-5 font-semibold text-primary-foreground transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Quero receber novidades
                <span aria-hidden="true">↗</span>
              </Link>
            </section>
          </div>

          <aside
            className="h-fit border-rule border-t pt-5 lg:sticky lg:top-24"
            aria-label="Sobre este post"
          >
            <p className="ui-kicker text-muted-foreground">Sobre este post</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Uma nota de produto sobre o novo canal de comunicação do Kubo.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center text-sm text-foreground underline decoration-rule underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Voltar para o início
            </Link>
          </aside>
        </div>
      </article>

      <Footer />
    </main>
  );
}
