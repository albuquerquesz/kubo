import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency } from "../utils/add-deps";

export function processPaymentsDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const { payments } = config;
  if (!payments || payments.length === 0) return;

  if (payments.includes("stripe")) {
    addPackageDependency({
      vfs,
      packagePath: "packages/payments/package.json",
      dependencies: ["stripe"],
    });
    addPackageDependency({
      vfs,
      packagePath: "apps/web/package.json",
      dependencies: ["@stripe/stripe-js"],
    });

    if (config.backend === "fastify") {
      addPackageDependency({
        vfs,
        packagePath: "apps/server/package.json",
        dependencies: ["fastify-raw-body"],
      });
    }
  }
}
