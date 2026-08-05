import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency } from "../utils/add-deps";

const webFrontends = [
  "tanstack-router",
  "react-router",
  "tanstack-start",
  "next",
  "solid",
] as const;

function hasWebFrontend(frontend: ProjectConfig["frontend"]): boolean {
  return frontend.some((value) => webFrontends.includes(value as (typeof webFrontends)[number]));
}

function getWebEnvNames(frontend: ProjectConfig["frontend"]): { key: string; host: string } {
  if (frontend.includes("next")) {
    return { key: "NEXT_PUBLIC_GETMONITOR_API_KEY", host: "NEXT_PUBLIC_GETMONITOR_API_HOST" };
  }
  if (frontend.includes("nuxt")) {
    return { key: "NUXT_PUBLIC_GETMONITOR_API_KEY", host: "NUXT_PUBLIC_GETMONITOR_API_HOST" };
  }
  if (frontend.includes("svelte") || frontend.includes("astro")) {
    return { key: "PUBLIC_GETMONITOR_API_KEY", host: "PUBLIC_GETMONITOR_API_HOST" };
  }
  return { key: "VITE_GETMONITOR_API_KEY", host: "VITE_GETMONITOR_API_HOST" };
}

function processBrowserIntegration(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (!hasWebFrontend(config.frontend) || !vfs.exists("apps/web/package.json")) return;

  addPackageDependency({
    vfs,
    packagePath: "apps/web/package.json",
    dependencies: ["@getmonitor/browser"],
  });
  const { key, host } = getWebEnvNames(config.frontend);

  if (config.frontend.includes("next")) {
    vfs.writeFile(
      "apps/web/src/components/getmonitor.tsx",
      `"use client";\n\nimport { useEffect } from "react";\nimport { GetMonitor } from "@getmonitor/browser";\n\nexport function GetMonitorProvider() {\n  useEffect(() => {\n    if (process.env.${key}) {\n      GetMonitor.init(process.env.${key}, {\n        apiHost: process.env.${host} ?? "https://ingest.getmonitor.com",\n        environment: process.env.NODE_ENV ?? "development",\n      });\n    }\n  }, []);\n\n  return null;\n}\n`,
    );
    const layoutPath = "apps/web/src/app/layout.tsx";
    if (vfs.exists(layoutPath)) {
      let layout = vfs.readFile(layoutPath) ?? "";
      if (!layout.includes('from "../components/getmonitor"')) {
        layout = `import { GetMonitorProvider } from "../components/getmonitor";\n${layout}`;
      }
      if (!layout.includes("<GetMonitorProvider />")) {
        layout = layout.replace("<body>", "<body>\n        <GetMonitorProvider />");
      }
      vfs.writeFile(layoutPath, layout);
    }
    return;
  }

  vfs.writeFile(
    "apps/web/src/lib/getmonitor.ts",
    `import { GetMonitor } from "@getmonitor/browser";\nimport { env } from "@${config.projectName}/env/web";\n\nif (typeof window !== "undefined" && env.${key}) {\n  GetMonitor.init(env.${key}, {\n    apiHost: env.${host} ?? "https://ingest.getmonitor.com",\n    environment: import.meta.env.MODE,\n  });\n}\n`,
  );

  const entryByFrontend: Record<string, string> = {
    "tanstack-router": "apps/web/src/main.tsx",
    "react-router": "apps/web/src/root.tsx",
    "tanstack-start": "apps/web/src/router.tsx",
    solid: "apps/web/src/main.tsx",
  };
  const frontend = config.frontend.find((value) => entryByFrontend[value]);
  const entryPath = frontend ? entryByFrontend[frontend] : undefined;
  if (!entryPath || !vfs.exists(entryPath)) return;
  const content = vfs.readFile(entryPath) ?? "";
  if (!content.includes('"./lib/getmonitor"'))
    vfs.writeFile(entryPath, `import "./lib/getmonitor";\n${content}`);
}

function processNodeIntegration(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const supported =
    config.backend !== "none" &&
    config.backend !== "self" &&
    config.backend !== "convex" &&
    config.serverDeploy !== "cloudflare" &&
    config.runtime !== "workers";
  if (!supported || !vfs.exists("apps/server/package.json")) return;

  addPackageDependency({
    vfs,
    packagePath: "apps/server/package.json",
    dependencies: ["@getmonitor/node"],
  });
  vfs.writeFile(
    "apps/server/src/getmonitor.ts",
    `import { GetMonitor } from "@getmonitor/node";\nimport { env } from "@${config.projectName}/env/server";\n\nexport const getMonitor = env.GETMONITOR_API_KEY\n  ? new GetMonitor(env.GETMONITOR_API_KEY, {\n      apiHost: env.GETMONITOR_API_HOST ?? "https://ingest.getmonitor.com",\n      environment: env.NODE_ENV,\n    })\n  : null;\n`,
  );

  const entryPath = "apps/server/src/index.ts";
  if (!vfs.exists(entryPath)) return;
  let content = vfs.readFile(entryPath) ?? "";
  if (!content.includes('from "./getmonitor"'))
    content = `import { getMonitor } from "./getmonitor";\n${content}`;
  if (config.backend === "express" && !content.includes("setupExpressErrorHandler")) {
    content = content.replace(
      'import express from "express";',
      'import express from "express";\nimport { setupExpressErrorHandler } from "@getmonitor/node";',
    );
    content = content.replace(
      "app.listen(3000,",
      "if (getMonitor) setupExpressErrorHandler(getMonitor, app);\n\napp.listen(3000,",
    );
  } else if (!content.includes("void getMonitor;")) {
    content += "\nvoid getMonitor;\n";
  }
  vfs.writeFile(entryPath, content);
}

export function processObservability(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (config.observability !== "getmonitor") return;
  processBrowserIntegration(vfs, config);
  processNodeIntegration(vfs, config);
}
