import { kuboSurface } from "@kubojs/design";
import Image from "next/image";

import { KuboMark } from "@/components/brand/kubo-mark";
import type { BlogLang } from "@/lib/blog";
import { cn } from "@/lib/utils";

const COPY = {
  pt: {
    sends: ["Escolhas da stack", "Resultado", "Origem", "install_id aleatório"],
    skips: ["Nome do projeto", "Caminho", "Conteúdo", "Segredo", "IP"],
    sendsLabel: "O create manda",
    skipsLabel: "O create não manda",
    agent: ["Você pede a stack", "O agente conecta pelo MCP", "O comando monta só isso"],
  },
  en: {
    sends: ["Stack choices", "Result", "Source", "Random install_id"],
    skips: ["Project name", "Path", "File contents", "Secrets", "IP"],
    sendsLabel: "create sends",
    skipsLabel: "create does not send",
    agent: ["You name the stack", "The agent connects over MCP", "The command builds only that"],
  },
} as const;

/**
 * Every article figure uses the same stage: the Kubo mark, one gold icon
 * already used on the home page, and the site stage radius.
 */
const FIGURES = {
  "escolha-de-stack-explicita": {
    icon: "/assets/gold-apps-grid.png",
    alt: {
      pt: "O mascote do Kubo ao lado da grade dourada de peças da home.",
      en: "The Kubo mascot beside the home page's gold grid of pieces.",
    },
  },
  "telemetria-honesta-em-cli": {
    icon: "/assets/gold-bar-chart.png",
    alt: {
      pt: "O mascote do Kubo ao lado do gráfico dourado da home.",
      en: "The Kubo mascot beside the home page's gold chart.",
    },
  },
  "agente-de-codigo-instala-o-projeto": {
    icon: "/assets/gold-link.png",
    alt: {
      pt: "O mascote do Kubo ao lado do elo dourado da home, o ícone de conexão.",
      en: "The Kubo mascot beside the home page's gold link, the connection icon.",
    },
  },
} as const;

type FigureSlug = keyof typeof FIGURES;

const COVERS = {
  "escolha-de-stack-explicita": {
    src: "/assets/kubo-bg-4.png",
    alt: {
      pt: "Mascote do Kubo ao lado do painel de integrações da home.",
      en: "The Kubo mascot beside the home page integrations panel.",
    },
  },
} as const;

type CoverSlug = keyof typeof COVERS;

function isFigureSlug(slug: string): slug is FigureSlug {
  return slug in FIGURES;
}

function isCoverSlug(slug: string): slug is CoverSlug {
  return slug in COVERS;
}

const STAGE_DOTS = {
  backgroundImage: "radial-gradient(circle, rgb(251 200 13 / 0.22) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

export function blogCover(slug: string) {
  return isCoverSlug(slug) ? COVERS[slug] : undefined;
}

export function BlogStage({
  slug,
  lang,
  compact = false,
}: {
  slug: string;
  lang: BlogLang;
  compact?: boolean;
}) {
  if (!isFigureSlug(slug)) return null;
  const figure = FIGURES[slug];

  return (
    <div className={cn(kuboSurface.stage, compact && "rounded-[0.85rem]")} style={STAGE_DOTS}>
      <div
        className={cn(
          "flex items-center justify-center",
          compact ? "aspect-[16/10] gap-4 px-4" : "aspect-[2/1] gap-6 px-6 sm:gap-12",
        )}
      >
        <KuboMark className={compact ? "h-16 w-auto" : "h-20 w-auto sm:h-32"} />
        <span className={cn("h-px bg-primary", compact ? "w-6" : "w-8 sm:w-14")} aria-hidden />
        <Image
          src={figure.icon}
          alt={figure.alt[lang]}
          width={160}
          height={160}
          className={compact ? "h-16 w-auto" : "h-20 w-auto sm:h-32"}
        />
      </div>
    </div>
  );
}

export function BlogFigure({ slug, lang }: { slug: string; lang: BlogLang }) {
  const copy = COPY[lang];
  if (!isFigureSlug(slug)) return null;

  return (
    <figure className="space-y-4">
      <BlogStage slug={slug} lang={lang} />
      {slug === "telemetria-honesta-em-cli" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <List title={copy.sendsLabel} items={copy.sends} />
          <List title={copy.skipsLabel} items={copy.skips} />
        </div>
      ) : null}
      {slug === "agente-de-codigo-instala-o-projeto" ? (
        <ol className="grid gap-2">
          {copy.agent.map((step, index) => (
            <li key={step} className={`${kuboSurface.tile} px-4 py-3 text-sm text-foreground`}>
              <span className="mr-3 font-mono text-primary">0{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      ) : null}
    </figure>
  );
}

function List({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className={kuboSurface.panel}>
      <p className="bg-muted/60 px-4 py-3 text-sm font-medium text-foreground">{title}</p>
      <ul>
        {items.map((item) => (
          <li key={item} className="border-border border-t px-4 py-3 text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
