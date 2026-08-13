import { ReleaseChangelogEmail } from "../src/release-changelog-email";
import type { ReleaseChangelogEmailProps } from "../src/types";

export const exampleRelease: ReleaseChangelogEmailProps = {
  version: "0.4.0",
  releaseDate: "13 AGO 2026",
  intro:
    "Uma nova leva de ferramentas chegou para deixar o caminho entre a ideia e o primeiro deploy ainda mais curto.",
  changes: [
    {
      category: "CLI",
      title: "Integrações entram no Stack Builder",
      description:
        "Escolha comunicação, observabilidade e serviços externos durante a criação do projeto, com configuração pronta para o seu backend.",
    },
    {
      category: "TEMPLATES",
      title: "Mais contexto no projeto gerado",
      description:
        "README, variáveis de ambiente e instruções de pós-instalação agora acompanham as decisões feitas no fluxo da CLI.",
    },
    {
      category: "DX",
      title: "Um caminho mais claro até produção",
      description:
        "Os exemplos e validações deixam explícitos os limites de runtime, deployment e backend antes do código ser gerado.",
    },
  ],
  releaseUrl: "https://github.com/albuquerquesz/kubo/releases/tag/v0.4.0",
  docsUrl: "https://kubojs.dev/docs",
  npmUrl: "https://www.npmjs.com/package/create-kubojs",
};

export default function ReleaseChangelogPreview() {
  return <ReleaseChangelogEmail {...exampleRelease} />;
}
