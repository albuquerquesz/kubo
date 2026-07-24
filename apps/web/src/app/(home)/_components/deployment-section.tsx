import { Cloud, Globe, Server } from "lucide-react";

import { IconCodeWindow, IconLightbulb, IconMountain } from "./deployment-icons";

const deploymentCards = [
  {
    icon: Server,
    title: "Auto-hospedado",
    description:
      "Implante o Studio em nuvem virtual, edge ou on-premises. Deployments auto-hospedados oferecem nveis avanados de customizao e controle. Seus dados permanecem dentro da sua infraestrutura.",
  },
  {
    icon: Cloud,
    title: "Nuvem Kubo",
    description:
      "Comece com o Studio hospedado na infraestrutura do Kubo e construa suas aplicaes e servios com nossas APIs. Nossos servidores est hospedados na UE.",
  },
  {
    icon: Globe,
    title: "Provedores de nuvem",
    description:
      "Acesse o poder do Studio atravs do seu provedor de nuvem preferido (Google Cloud, AWS, Azure, SAP, IBM, Snowflake, NVIDIA, Outscale) usando seus crditos de nuvem.",
  },
] as const;

export default function DeploymentSection() {
  return (
    <section
      aria-labelledby="deployment-title"
      className="relative left-1/2 flex w-screen min-h-screen flex-col justify-center bg-primary text-primary-foreground -ml-[50vw]"
    >
      {/* Intro */}
      <div className="flex flex-col items-center pt-[40px] text-center sm:pt-0">
        <p className="text-xs leading-none text-primary-foreground/72">
          Deployments de IA projetados para privacidade.
        </p>

        <div className="flex gap-4 mt-10 sm:mt-10" aria-hidden="true">
          <IconCodeWindow className="block w-14 h-14 text-primary-foreground" />
          <IconLightbulb className="block w-14 h-14 text-primary-foreground" />
          <IconMountain className="block w-14 h-14 text-primary-foreground" />
        </div>

        <h2
          id="deployment-title"
          className="max-w-[64rem] mt-10 text-lg leading-10 sm:mt-[40px] sm:text-[56px] sm:leading-[60px] sm:tracking-[-0.035em] text-primary-foreground"
        >
          Implante IA de fronteira no seu ambiente, ou consuma como servio ou de um de nossos
          parceiros de nuvem.
        </h2>
      </div>

      {/* Cards grid */}
      <div className="grid w-full grid-cols-1 px-4 sm:mt-[48px] sm:grid-cols-3 sm:px-[64px] border border-primary-foreground/14">
        {deploymentCards.map((card, i) => (
          <article
            key={card.title}
            className={`flex flex-col justify-between px-8 py-6 sm:px-8 sm:py-8 sm:min-h-[364px] ${
              i === 0 ? "" : "border-t sm:border-t-0 sm:border-l"
            } border-primary-foreground/14`}
          >
            <card.icon aria-hidden className="w-5 h-5 flex-shrink-0 text-primary-foreground" />
            <h3 className="font-archivo font-semibold text-lg leading-6 tracking-[-0.065em] mt-3 text-primary-foreground sm:text-2xl sm:leading-10">
              {card.title}
            </h3>
            <p className="mt-auto text-base leading-6 text-primary-foreground/72">
              {card.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
