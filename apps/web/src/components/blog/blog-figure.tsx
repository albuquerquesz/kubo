import { kuboSurface } from "@kubojs/design";

import type { BlogLang } from "@/lib/blog";

const COPY = {
  pt: {
    stack: ["Frontend", "Backend", "Banco", "ORM", "Auth", "Deploy"],
    sends: ["Escolhas da stack", "Resultado", "Origem", "install_id aleatório"],
    skips: ["Nome do projeto", "Caminho", "Conteúdo", "Segredo", "IP"],
    sendsLabel: "O create manda",
    skipsLabel: "O create não manda",
    agent: ["Você pede a stack", "O agente conecta pelo MCP", "O comando monta só isso"],
  },
  en: {
    stack: ["Frontend", "Backend", "Database", "ORM", "Auth", "Deploy"],
    sends: ["Stack choices", "Result", "Source", "Random install_id"],
    skips: ["Project name", "Path", "File contents", "Secrets", "IP"],
    sendsLabel: "create sends",
    skipsLabel: "create does not send",
    agent: ["You name the stack", "The agent connects over MCP", "The command builds only that"],
  },
} as const;

const MEDIA = {
  "escolha-de-stack-explicita": {
    src: "/blog/stack.jpg",
    alt: {
      pt: "Seis blocos, um deles amarelo, representando as peças de uma stack.",
      en: "Six blocks, one of them yellow, standing in for the pieces of a stack.",
    },
  },
  "telemetria-honesta-em-cli": {
    src: "/blog/telemetry.jpg",
    alt: {
      pt: "Um cubo amarelo pequeno ao lado de um caderno fechado.",
      en: "A small yellow cube beside a closed notebook.",
    },
  },
  "agente-de-codigo-instala-o-projeto": {
    src: "/blog/agent.jpg",
    alt: {
      pt: "Uma peça amarela se aproximando de uma pilha de peças cinza.",
      en: "A yellow piece moving toward a stack of gray pieces.",
    },
  },
} as const;

export function BlogFigure({ slug, lang }: { slug: string; lang: BlogLang }) {
  const copy = COPY[lang];
  const media = MEDIA[slug as keyof typeof MEDIA];
  if (!media) return null;

  return (
    <figure className="space-y-4">
      <style>{`
        @keyframes blog-piece-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        .blog-piece { display: inline-block; animation: blog-piece-in 0.45s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .blog-piece { animation: none; }
        }
      `}</style>
      <img src={media.src} alt={media.alt[lang]} className="w-full rounded-2xl" />
      {slug === "escolha-de-stack-explicita" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {copy.stack.map((label, index) => (
            <div
              key={label}
              className={`${kuboSurface.tile} px-3 py-4 text-sm text-foreground ${index === 2 ? "border-primary bg-primary/10" : ""}`}
            >
              <span className="blog-piece" style={{ animationDelay: `${index * 80}ms` }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      ) : null}
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
