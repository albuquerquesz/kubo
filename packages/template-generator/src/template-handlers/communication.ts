import type { CommunicationProvider, ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processSingleTemplate } from "./utils";

type CommunicationArtifact = {
  readonly templatePath: string;
  readonly destinationPath: string;
  readonly when?: (config: ProjectConfig) => boolean;
};

type CommunicationCatalogEntry = {
  readonly provider: CommunicationProvider;
  readonly artifacts: readonly CommunicationArtifact[];
};

const packageArtifacts = (
  prefix: string,
  paths: readonly string[],
): readonly CommunicationArtifact[] =>
  paths.map((path) => ({
    templatePath: `${prefix}/${path}`,
    destinationPath: `${prefix}/${path}`,
  }));

const COMMUNICATION_CATALOG: readonly CommunicationCatalogEntry[] = [
  {
    provider: "resend",
    artifacts: packageArtifacts("packages/email", [
      "package.json",
      "tsconfig.json",
      "src/index.ts",
      "src/lib/resend.ts",
    ]),
  },
  {
    provider: "notifique",
    artifacts: packageArtifacts("packages/notifique", [
      "package.json",
      "tsconfig.json",
      "src/index.ts",
      "src/notifique.ts",
      "src/lib/sms.ts",
      "src/lib/whatsapp.ts",
      "src/lib/email.ts",
    ]),
  },
  {
    provider: "arara",
    artifacts: [
      ...packageArtifacts("packages/arara", [
        "package.json",
        "tsconfig.json",
        "src/index.ts",
        "src/lib/client.ts",
      ]),
      {
        templatePath: "backend/convex/packages/backend/convex/arara.ts",
        destinationPath: "packages/backend/convex/arara.ts",
        when: (config) => config.backend === "convex",
      },
    ],
  },
];

export async function processCommunicationTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  const provider = config.communication;
  if (!provider || provider === "none") return;

  const integration = COMMUNICATION_CATALOG.find((entry) => entry.provider === provider);
  if (!integration) return;

  for (const artifact of integration.artifacts) {
    if (artifact.when && !artifact.when(config)) continue;

    processSingleTemplate(vfs, templates, artifact.templatePath, artifact.destinationPath, config);
  }
}
