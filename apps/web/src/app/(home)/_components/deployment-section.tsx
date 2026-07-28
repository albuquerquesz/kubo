import Image from "next/image";

const deploymentCards = [
  {
    iconSrc: "/assets/glossy-stacked-server-icon.png",
    title: "Crie com a CLI.",
    description:
      "Rode o Kubo no terminal e escolha as camadas. Em minutos você tem monorepo TypeScript na sua máquina, sem colar boilerplate de repositório em repositório.",
  },
  {
    iconSrc: "/assets/glossy-cloud-icon.png",
    title: "Monte no Stack Builder.",
    description:
      "Prefere ver antes de gerar? Abra o Stack Builder, teste combinações e saia com a mesma base pronta. Menos chute, mais projeto de verdade.",
  },
  {
    iconSrc: "/assets/glossy-globe-icon.png",
    title: "Já pense no deploy.",
    description:
      "Inclua Cloudflare, Docker ou Vercel na geração. Você para de configurar publish depois e começa a publicar com o que o scaffold já trouxe.",
  },
] as const;

export default function DeploymentSection() {
  return (
    <section
      id="deployment"
      aria-labelledby="deployment-title"
      className="ui-scroll-target relative left-1/2 flex w-screen flex-col bg-primary py-16 text-primary-foreground -ml-[50vw] sm:py-24"
    >
      <div className="flex flex-col items-center text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] leading-none text-primary-foreground/80">
          Gerador de stacks TypeScript.
        </p>

        <div className="mt-0 flex items-center gap-0" aria-hidden="true">
          <Image
            src="/assets/glossy-stacked-server-icon.png"
            alt=""
            width={176}
            height={120}
            className="h-40 w-40 object-contain -mx-4 sm:h-44 sm:w-44 sm:-mx-5"
          />
          <Image
            src="/assets/glossy-cloud-icon.png"
            alt=""
            width={176}
            height={120}
            className="h-40 w-40 object-contain -mx-4 sm:h-44 sm:w-44 sm:-mx-5"
          />
          <Image
            src="/assets/glossy-globe-icon.png"
            alt=""
            width={176}
            height={120}
            className="h-40 w-40 object-contain -mx-4 sm:h-44 sm:w-44 sm:-mx-5"
          />
        </div>

        <h2
          id="deployment-title"
          className="mt-0 max-w-5xl text-lg leading-10 text-primary-foreground sm:text-[56px] sm:leading-[60px] sm:tracking-[-0.035em]"
        >
          Pare de montar monorepo na mão.
        </h2>
      </div>

      <div className="mt-8 w-full border-y border-primary-foreground/28 px-4 sm:mt-10 sm:pl-12 sm:pr-[38px]">
        <div className="grid w-full grid-cols-1 border-l border-primary-foreground/28 sm:grid-cols-3">
          {deploymentCards.map((card) => (
            <article
              key={card.title}
              className="flex flex-col justify-between border-b border-r border-primary-foreground/28 px-2 pt-4 pb-6 last:border-b-0 sm:min-h-[320px] sm:border-b-0 sm:px-3 sm:pt-5 sm:pb-8"
            >
              <span className="relative -left-0.5 flex h-16 w-16 shrink-0 items-center justify-center sm:h-20 sm:w-20">
                <Image
                  src={card.iconSrc}
                  alt=""
                  width={96}
                  height={96}
                  aria-hidden="true"
                  className="h-full w-full object-contain"
                />
              </span>
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
