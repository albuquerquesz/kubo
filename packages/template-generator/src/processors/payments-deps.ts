import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency } from "../utils/add-deps";
import { appFile, pkgFile } from "../layout-paths";

export function processPaymentsDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const { payments } = config;
  if (!payments || payments.length === 0) return;

  if (payments.includes("stripe")) {
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "payments", "package.json"),
      dependencies: ["stripe"],
    });
    addPackageDependency({
      vfs,
      packagePath: appFile(config, "web", "package.json"),
      dependencies: ["@stripe/stripe-js"],
    });

    if (config.backend === "fastify") {
      addPackageDependency({
        vfs,
        packagePath: appFile(config, "server", "package.json"),
        dependencies: ["fastify-raw-body"],
      });
    }
  }
}
