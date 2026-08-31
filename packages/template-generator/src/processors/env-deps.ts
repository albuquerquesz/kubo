import { hasAnyFrontend, hasNativeFrontend, type ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency, type AvailableDependencies } from "../utils/add-deps";

export function processEnvDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const envPath = "packages/env/package.json";
  if (!vfs.exists(envPath)) return;

  const { frontend, backend, runtime, webDeploy } = config;
  const deps: AvailableDependencies[] = ["zod"];
  const hasNative = hasNativeFrontend(frontend);
  const hasNextJs = hasAnyFrontend(frontend, ["next"]);
  const hasNuxt = hasAnyFrontend(frontend, ["nuxt"]);

  if (hasNextJs) {
    deps.push("@t3-oss/env-nextjs");
  } else if (hasNuxt) {
    deps.push("@t3-oss/env-nuxt");
  }

  const needsCoreEnv = hasNative || (!hasNextJs && !hasNuxt);
  if (needsCoreEnv) {
    deps.push("@t3-oss/env-core");
  }

  const needsServerEnv = !["convex", "none"].includes(backend) && runtime !== "workers";
  if (needsServerEnv && !deps.includes("@t3-oss/env-core")) {
    deps.push("@t3-oss/env-core");
  }

  if (backend === "self" && webDeploy === "cloudflare" && hasNextJs) {
    deps.push("@opennextjs/cloudflare");
  }

  addPackageDependency({ vfs, packagePath: envPath, dependencies: deps });
}
