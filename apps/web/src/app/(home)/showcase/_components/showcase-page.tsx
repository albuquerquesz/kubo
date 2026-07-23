"use client";

import { Terminal } from "lucide-react";

import Footer from "../../_components/footer";
import ShowcaseItem from "../_components/ShowcaseItem";

type ShowcaseProject = {
  _id: string;
  _creationTime: number;
  title: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  tags: string[];
};

export function ShowcasePage({ showcaseProjects }: { showcaseProjects: Array<ShowcaseProject> }) {
  return (
    <main className="min-h-svh bg-fd-background">
      <div className="container mx-auto space-y-8 px-4 py-8 pt-16">
        <div className="mb-4 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary">
                <Terminal className="h-5 w-5" />
                <h1 className="font-bold font-mono text-xl sm:text-2xl">EXIBICAO_PROJETOS.SH</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Projetos da comunidade feitos com o kubojs
              </p>
            </div>
          </div>
        </div>

        {showcaseProjects.length === 0 ? (
          <div className="rounded-xl bg-fd-background/80 p-8 text-center ring-1 ring-border/35">
            <div className="mb-4 flex items-center justify-center gap-2">
              <span className="font-mono text-muted-foreground">
                NENHUM_PROJETO_NA_EXIBICAO.NULL
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-primary">$</span>
              <span className="text-muted-foreground">Seja o primeiro a exibir o seu projeto!</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {showcaseProjects.map((project, index) => (
              <ShowcaseItem key={project._id} {...project} index={index} />
            ))}
          </div>
        )}

        <div className="rounded-xl bg-fd-background/80 p-4 ring-1 ring-border/35">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary">$</span>
            <span className="text-muted-foreground">
              Quer exibir o seu projeto? Envie via{" "}
              <a
                href="https://github.com/albuquerquesz/kubo/issues/new/choose"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                issues do GitHub
              </a>
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
