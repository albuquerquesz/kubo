import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processSingleTemplate } from "./utils";

export async function processCommunicationTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.communication || config.communication === "none") return;

  processSingleTemplate(
    vfs,
    templates,
    "packages/email/package.json",
    "packages/email/package.json",
    config,
  );
  processSingleTemplate(
    vfs,
    templates,
    "packages/email/tsconfig.json",
    "packages/email/tsconfig.json",
    config,
  );
  processSingleTemplate(
    vfs,
    templates,
    "packages/email/src/index.ts",
    "packages/email/src/index.ts",
    config,
  );

  if (config.communication === "resend") {
    processSingleTemplate(
      vfs,
      templates,
      "packages/email/src/lib/resend.ts",
      "packages/email/src/lib/resend.ts",
      config,
    );
  }
}
