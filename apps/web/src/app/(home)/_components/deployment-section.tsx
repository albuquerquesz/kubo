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
      className="deployment-section border-rule border-t bg-background"
    >
      {/* Intro */}
      <div className="deployment-intro">
        <p className="ui-kicker text-muted-foreground">
          Deployments de IA projetados para privacidade.
        </p>

        <div className="deployment-icons" aria-hidden="true">
          <IconCodeWindow className="deployment-icon" />
          <IconLightbulb className="deployment-icon" />
          <IconMountain className="deployment-icon" />
        </div>

        <h2 id="deployment-title" className="ui-display text-foreground">
          Implante IA de fronteira no seu ambiente, ou consuma como servio ou de um de nossos
          parceiros de nuvem.
        </h2>
      </div>

      {/* Cards grid */}
      <div className="deployment-grid">
        {deploymentCards.map((card) => (
          <article key={card.title} className="deployment-card">
            <div className="deployment-card__header">
              <card.icon aria-hidden className="deployment-card__icon" />
              <h3 className="deployment-card__title">{card.title}</h3>
            </div>
            <p className="deployment-card__description">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
