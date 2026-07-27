import { Cloud, Globe, Server } from "lucide-react";
import Image from "next/image";

const deploymentCards = [
  {
    icon: Server,
    title: "Crie com a CLI.",
    description:
      "Rode o Kubo no terminal e escolha as camadas. Em minutos você tem monorepo TypeScript na sua máquina, sem colar boilerplate de repositório em repositório.",
  },
  {
    icon: Cloud,
    title: "Monte no Stack Builder.",
    description:
      "Prefere ver antes de gerar? Abra o Stack Builder, teste combinações e saia com a mesma base pronta. Menos chute, mais projeto de verdade.",
  },
  {
    icon: Globe,
    title: "Já pense no deploy.",
    description:
      "Inclua Cloudflare, Docker ou Vercel na geração. Você para de configurar publish depois e começa a publicar com o que o scaffold já trouxe.",
  },
] as const;

export default function DeploymentSection() {
  return (
    <section
      aria-labelledby="deployment-title"
      className="relative left-1/2 flex w-screen flex-col bg-primary py-16 text-primary-foreground -ml-[50vw] sm:py-24"
    >
      <div className="flex flex-col items-center text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] leading-none text-primary-foreground/80">
          Gerador de stacks TypeScript.
        </p>

        <div className="mt-3 flex items-center gap-0 sm:mt-4" aria-hidden="true">
          <Image
            src="/assets/glossy-document-card-icon.png"
            alt=""
            width={144}
            height={96}
            className="h-32 w-32 object-contain sm:h-36 sm:w-36"
          />
          <Image
            src="/assets/glossy-idea-lightbulb-icon.png"
            alt=""
            width={144}
            height={96}
            className="h-32 w-32 object-contain sm:h-36 sm:w-36"
          />
          <Image
            src="/assets/glossy-mountain-landscape-icon.png"
            alt=""
            width={144}
            height={96}
            className="h-32 w-32 object-contain sm:h-36 sm:w-36"
          />
        </div>

        <h2
          id="deployment-title"
          className="mt-6 max-w-5xl text-lg leading-10 text-primary-foreground sm:mt-8 sm:text-[56px] sm:leading-[60px] sm:tracking-[-0.035em]"
        >
          Pare de montar monorepo na mão.
        </h2>
      </div>

      <div className="mt-8 w-full border-y border-primary-foreground/28 px-10 sm:mt-10">
        <div className="grid w-full grid-cols-1 border-l border-primary-foreground/28 sm:grid-cols-3">
          {deploymentCards.map((card) => (
            <article
              key={card.title}
              className="flex flex-col justify-between border-b border-r border-primary-foreground/28 px-8 py-6 last:border-b-0 sm:min-h-[360px] sm:border-b-0 sm:py-8"
            >
              <card.icon aria-hidden className="w-8 h-8 shrink-0 text-primary-foreground" />
              <h3 className="font-archivo font-semibold text-lg leading-6 tracking-[-0.065em] mt-3 text-primary-foreground sm:text-2xl sm:leading-10">
                {card.title}
              </h3>
              <p className="mt-auto text-base leading-6 text-primary-foreground/72">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
