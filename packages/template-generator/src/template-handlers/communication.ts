import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processSingleTemplate } from "./utils";

export async function processCommunicationTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.communication || config.communication === "none") return;

  if (config.communication === "resend") {
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
    processSingleTemplate(
      vfs,
      templates,
      "packages/email/src/lib/resend.ts",
      "packages/email/src/lib/resend.ts",
      config,
    );
    return;
  }

  if (config.communication === "notifique") {
    processSingleTemplate(
      vfs,
      templates,
      "packages/notifique/package.json",
      "packages/notifique/package.json",
      config,
    );
    processSingleTemplate(
      vfs,
      templates,
      "packages/notifique/tsconfig.json",
      "packages/notifique/tsconfig.json",
      config,
    );
    processSingleTemplate(
      vfs,
      templates,
      "packages/notifique/src/index.ts",
      "packages/notifique/src/index.ts",
      config,
    );
    processSingleTemplate(
      vfs,
      templates,
      "packages/notifique/src/lib/client.ts",
      "packages/notifique/src/lib/client.ts",
      config,
    );
    processSingleTemplate(
      vfs,
      templates,
      "packages/notifique/src/lib/sms.ts",
      "packages/notifique/src/lib/sms.ts",
      config,
    );
    processSingleTemplate(
      vfs,
      templates,
      "packages/notifique/src/lib/whatsapp.ts",
      "packages/notifique/src/lib/whatsapp.ts",
      config,
    );
    processSingleTemplate(
      vfs,
      templates,
      "packages/notifique/src/lib/email.ts",
      "packages/notifique/src/lib/email.ts",
      config,
    );
    return;
  }

  if (config.communication === "arara") {
    for (const path of [
      "packages/arara/package.json",
      "packages/arara/tsconfig.json",
      "packages/arara/src/index.ts",
      "packages/arara/src/lib/client.ts",
    ]) {
      processSingleTemplate(vfs, templates, path, path, config);
    }

    if (config.backend === "convex") {
      processSingleTemplate(
        vfs,
        templates,
        "backend/convex/packages/backend/convex/arara.ts",
        "packages/backend/convex/arara.ts",
        config,
      );
    }
  }
}
