import type { CommunicationProvider, ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { pkgFile } from "../layout-paths";
import { type TemplateData, processSingleTemplate } from "./utils";

type CommunicationArtifact = {
  readonly templatePath: string;
  /** Destination resolved against the project layout. */
  readonly destinationPath: (config: ProjectConfig) => string;
  readonly when?: (config: ProjectConfig) => boolean;
};

type CommunicationCatalogEntry = {
  readonly provider: CommunicationProvider;
  readonly artifacts: readonly CommunicationArtifact[];
};

/** Templates live under `packages/<id>/`; output goes to the layout folder of package `<id>`. */
const packageArtifacts = (
  packageId: string,
  paths: readonly string[],
): readonly CommunicationArtifact[] =>
  paths.map((path) => ({
    templatePath: `packages/${packageId}/${path}`,
    destinationPath: (config) => pkgFile(config, packageId, path),
  }));

const COMMUNICATION_CATALOG: readonly CommunicationCatalogEntry[] = [
  {
    provider: "millionsend",
    artifacts: packageArtifacts("millionsend", [
      "package.json",
      "tsconfig.json",
      "src/index.ts",
      "src/lib/client.ts",
      "src/lib/email.ts",
    ]),
  },
  {
    provider: "resend",
    artifacts: packageArtifacts("email", [
      "package.json",
      "tsconfig.json",
      "src/index.ts",
      "src/lib/resend.ts",
    ]),
  },
  {
    provider: "notifique",
    artifacts: packageArtifacts("notifique", [
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
      ...packageArtifacts("arara", [
        "package.json",
        "tsconfig.json",
        "src/index.ts",
        "src/lib/client.ts",
      ]),
      {
        templatePath: "backend/convex/packages/backend/convex/arara.ts",
        destinationPath: (config) => pkgFile(config, "backend", "convex/arara.ts"),
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
  for (const provider of config.communication) {
    const integration = COMMUNICATION_CATALOG.find((entry) => entry.provider === provider);
    if (!integration) continue;

    for (const artifact of integration.artifacts) {
      if (artifact.when && !artifact.when(config)) continue;

      processSingleTemplate(
        vfs,
        templates,
        artifact.templatePath,
        artifact.destinationPath(config),
        config,
      );
    }
  }
}
