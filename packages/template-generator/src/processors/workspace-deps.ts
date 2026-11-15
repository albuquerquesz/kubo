import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { appFile, pkgFile, scopedName } from "../layout-paths";
import { addPackageDependency, type AvailableDependencies } from "../utils/add-deps";

export function processWorkspaceDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const { packageManager, runtime, backend, database, auth, api, serverDeploy, webDeploy } = config;

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

  const configDep = packages.config ? { [scopedName(config, "config")]: workspaceVersion } : {};
  const envDep = packages.env ? { [scopedName(config, "env")]: workspaceVersion } : {};
  const uiDep = packages.ui ? { [scopedName(config, "ui")]: workspaceVersion } : {};
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
      envDevDeps[scopedName(config, "infra")] = workspaceVersion;
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
      authDeps[scopedName(config, "db")] = workspaceVersion;
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
      paymentsDeps[scopedName(config, "db")] = workspaceVersion;
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
      apiPackageDeps[scopedName(config, "auth")] = workspaceVersion;
    }
    if (database !== "none" && packages.db) {
      apiPackageDeps[scopedName(config, "db")] = workspaceVersion;
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
      backendDeps[scopedName(config, "millionsend")] = workspaceVersion;
    }
    if (config.communication.includes("arara") && packages.arara) {
      backendDeps[scopedName(config, "arara")] = workspaceVersion;
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
    if (api !== "none" && packages.api) serverDeps[scopedName(config, "api")] = workspaceVersion;
    if (auth !== "none" && packages.auth) serverDeps[scopedName(config, "auth")] = workspaceVersion;
    if (database !== "none" && packages.db) serverDeps[scopedName(config, "db")] = workspaceVersion;
    if (packages.payments) serverDeps[scopedName(config, "payments")] = workspaceVersion;
    if (packages.millionsend) serverDeps[scopedName(config, "millionsend")] = workspaceVersion;
    if (packages.email) serverDeps[scopedName(config, "email")] = workspaceVersion;
    if (packages.notifique) serverDeps[scopedName(config, "notifique")] = workspaceVersion;
    if (packages.arara) serverDeps[scopedName(config, "arara")] = workspaceVersion;
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

    if (api !== "none" && packages.api)
      webPackageDeps[scopedName(config, "api")] = workspaceVersion;
    if (backend === "self" && auth !== "none" && packages.auth) {
      webPackageDeps[scopedName(config, "auth")] = workspaceVersion;
    }
    if (backend === "self" && packages.payments) {
      webPackageDeps[scopedName(config, "payments")] = workspaceVersion;
    }
    if (backend === "self" && packages.millionsend) {
      webPackageDeps[scopedName(config, "millionsend")] = workspaceVersion;
    }
    if (backend === "self" && packages.email) {
      webPackageDeps[scopedName(config, "email")] = workspaceVersion;
    }
    if (backend === "self" && packages.notifique) {
      webPackageDeps[scopedName(config, "notifique")] = workspaceVersion;
    }
    if (backend === "self" && packages.arara) {
      webPackageDeps[scopedName(config, "arara")] = workspaceVersion;
    }
    if (backend === "convex" && packages.backend)
      webPackageDeps[scopedName(config, "backend")] = workspaceVersion;

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
    if (api !== "none" && packages.api) nativeDeps[scopedName(config, "api")] = workspaceVersion;
    if (backend === "convex" && packages.backend)
      nativeDeps[scopedName(config, "backend")] = workspaceVersion;
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
