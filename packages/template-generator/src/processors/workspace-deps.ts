import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency, type AvailableDependencies } from "../utils/add-deps";
import { appFile, pkgFile } from "../layout-paths";

export function processWorkspaceDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const {
    projectName,
    packageManager,
    runtime,
    backend,
    database,
    auth,
    api,
    serverDeploy,
    webDeploy,
  } = config;

  const workspaceVersion = packageManager === "npm" ? "*" : "workspace:*";
  const packages = {
    config: vfs.exists(pkgFile(config, "config", "package.json")),
    env: vfs.exists(pkgFile(config, "env", "package.json")),
    infra: vfs.exists(pkgFile(config, "infra", "package.json")),
    db: vfs.exists(pkgFile(config, "db", "package.json")),
    auth: vfs.exists(pkgFile(config, "auth", "package.json")),
    payments: vfs.exists(pkgFile(config, "payments", "package.json")),
    email: vfs.exists(pkgFile(config, "email", "package.json")),
    notifique: vfs.exists(pkgFile(config, "notifique", "package.json")),
    millionsend: vfs.exists(pkgFile(config, "millionsend", "package.json")),
    arara: vfs.exists(pkgFile(config, "arara", "package.json")),
    api: vfs.exists(appFile(config, "api", "package.json")),
    ui: vfs.exists(pkgFile(config, "ui", "package.json")),
    backend: vfs.exists(pkgFile(config, "backend", "package.json")),
    server: vfs.exists(appFile(config, "server", "package.json")),
    web: vfs.exists(appFile(config, "web", "package.json")),
    native: vfs.exists(appFile(config, "native", "package.json")),
  };

  const configDep = packages.config ? { [`@${projectName}/config`]: workspaceVersion } : {};
  const envDep = packages.env ? { [`@${projectName}/env`]: workspaceVersion } : {};
  const uiDep = packages.ui ? { [`@${projectName}/ui`]: workspaceVersion } : {};
  const isCloudflare = serverDeploy === "cloudflare" || webDeploy === "cloudflare";
  const runtimeDevDeps = getRuntimeDevDeps(runtime);
  const commonDeps: AvailableDependencies[] = ["dotenv", "zod"];
  const commonDevDeps: AvailableDependencies[] = ["typescript", ...runtimeDevDeps];

  addPackageDependency({
    vfs,
    packagePath: "package.json",
    dependencies: commonDeps,
    devDependencies: commonDevDeps,
    customDependencies: envDep,
    customDevDependencies: configDep,
  });

  if (packages.env) {
    const envDevDeps: Record<string, string> = { ...configDep };
    if (isCloudflare && packages.infra) {
      envDevDeps[`@${projectName}/infra`] = workspaceVersion;
    }
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "env", "package.json"),
      dependencies: commonDeps,
      devDependencies: commonDevDeps,
      customDevDependencies: envDevDeps,
    });
  }

  if (packages.infra) {
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "infra", "package.json"),
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDevDependencies: configDep,
    });
  }

  if (packages.db) {
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "db", "package.json"),
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDependencies: envDep,
      customDevDependencies: configDep,
    });
  }

  if (packages.auth) {
    const authDeps: Record<string, string> = { ...envDep };
    if (database !== "none" && packages.db) {
      authDeps[`@${projectName}/db`] = workspaceVersion;
    }
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "auth", "package.json"),
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDependencies: authDeps,
      customDevDependencies: configDep,
    });
  }

  if (packages.payments) {
    const paymentsDeps: Record<string, string> = { ...envDep };
    if (database !== "none" && packages.db) {
      paymentsDeps[`@${projectName}/db`] = workspaceVersion;
    }
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "payments", "package.json"),
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDependencies: paymentsDeps,
      customDevDependencies: configDep,
    });
  }

  if (packages.email) {
    const emailDeps: AvailableDependencies[] = [...commonDeps];
    if (config.communication.includes("resend")) {
      emailDeps.push("resend");
    }
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "email", "package.json"),
      dependencies: emailDeps,
      devDependencies: ["typescript"],
      customDependencies: envDep,
      customDevDependencies: configDep,
    });
  }

  if (packages.millionsend) {
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "millionsend", "package.json"),
      dependencies: ["millionsend"],
      devDependencies: ["typescript"],
      customDependencies: backend === "convex" ? {} : envDep,
      customDevDependencies: configDep,
    });
  }

  if (packages.notifique) {
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "notifique", "package.json"),
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDependencies: envDep,
      customDevDependencies: configDep,
    });
  }

  if (packages.arara) {
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "arara", "package.json"),
      dependencies: ["@ararahq/sdk"],
      devDependencies: ["typescript"],
      customDevDependencies: configDep,
    });
  }

  if (packages.api) {
    const apiPackageDeps: Record<string, string> = { ...envDep };
    if (auth !== "none" && packages.auth) {
      apiPackageDeps[`@${projectName}/auth`] = workspaceVersion;
    }
    if (database !== "none" && packages.db) {
      apiPackageDeps[`@${projectName}/db`] = workspaceVersion;
    }
    addPackageDependency({
      vfs,
      packagePath: appFile(config, "api", "package.json"),
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDependencies: apiPackageDeps,
      customDevDependencies: configDep,
    });
  }

  if (packages.backend) {
    const backendDeps: Record<string, string> = {};
    if (packages.millionsend) {
      backendDeps[`@${projectName}/millionsend`] = workspaceVersion;
    }
    if (config.communication.includes("arara") && packages.arara) {
      backendDeps[`@${projectName}/arara`] = workspaceVersion;
    }
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "backend", "package.json"),
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDependencies: backendDeps,
      customDevDependencies: configDep,
    });
  }

  if (packages.server) {
    const serverDeps: Record<string, string> = { ...envDep };
    if (api !== "none" && packages.api) serverDeps[`@${projectName}/api`] = workspaceVersion;
    if (auth !== "none" && packages.auth) serverDeps[`@${projectName}/auth`] = workspaceVersion;
    if (database !== "none" && packages.db) serverDeps[`@${projectName}/db`] = workspaceVersion;
    if (packages.payments) serverDeps[`@${projectName}/payments`] = workspaceVersion;
    if (packages.millionsend) serverDeps[`@${projectName}/millionsend`] = workspaceVersion;
    if (packages.email) serverDeps[`@${projectName}/email`] = workspaceVersion;
    if (packages.notifique) serverDeps[`@${projectName}/notifique`] = workspaceVersion;
    if (packages.arara) serverDeps[`@${projectName}/arara`] = workspaceVersion;
    addPackageDependency({
      vfs,
      packagePath: appFile(config, "server", "package.json"),
      dependencies: commonDeps,
      devDependencies: ["typescript", "tsdown", "unrun"],
      customDependencies: serverDeps,
      customDevDependencies: configDep,
    });
  }

  if (packages.web) {
    const webPackageDeps: Record<string, string> = { ...envDep, ...uiDep };

    if (api !== "none" && packages.api) webPackageDeps[`@${projectName}/api`] = workspaceVersion;
    if (backend === "self" && auth !== "none" && packages.auth) {
      webPackageDeps[`@${projectName}/auth`] = workspaceVersion;
    }
    if (backend === "self" && packages.payments) {
      webPackageDeps[`@${projectName}/payments`] = workspaceVersion;
    }
    if (backend === "self" && packages.millionsend) {
      webPackageDeps[`@${projectName}/millionsend`] = workspaceVersion;
    }
    if (backend === "self" && packages.email) {
      webPackageDeps[`@${projectName}/email`] = workspaceVersion;
    }
    if (backend === "self" && packages.notifique) {
      webPackageDeps[`@${projectName}/notifique`] = workspaceVersion;
    }
    if (backend === "self" && packages.arara) {
      webPackageDeps[`@${projectName}/arara`] = workspaceVersion;
    }
    if (backend === "convex" && packages.backend)
      webPackageDeps[`@${projectName}/backend`] = workspaceVersion;

    addPackageDependency({
      vfs,
      packagePath: appFile(config, "web", "package.json"),
      dependencies: commonDeps,
      devDependencies: ["typescript"],
      customDependencies: webPackageDeps,
      customDevDependencies: configDep,
    });
  }

  if (packages.ui) {
    addPackageDependency({
      vfs,
      packagePath: pkgFile(config, "ui", "package.json"),
      devDependencies: ["typescript"],
      customDevDependencies: configDep,
    });
  }

  if (packages.native) {
    const nativeDeps: Record<string, string> = { ...envDep };
    if (api !== "none" && packages.api) nativeDeps[`@${projectName}/api`] = workspaceVersion;
    if (backend === "convex" && packages.backend)
      nativeDeps[`@${projectName}/backend`] = workspaceVersion;
    addPackageDependency({
      vfs,
      packagePath: appFile(config, "native", "package.json"),
      dependencies: commonDeps,
      customDependencies: nativeDeps,
      customDevDependencies: configDep,
    });
  }
}

function getRuntimeDevDeps(runtime: ProjectConfig["runtime"]): AvailableDependencies[] {
  return runtime === "bun" ? ["@types/bun"] : ["@types/node"];
}
