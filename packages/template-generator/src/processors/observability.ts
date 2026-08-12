import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { addPackageDependency } from "../utils/add-deps";

const webFrontends = [
  "tanstack-router",
  "react-router",
  "tanstack-start",
  "next",
  "solid",
  "nuxt",
] as const;

const reactFrontends = ["next", "tanstack-router", "react-router", "tanstack-start"] as const;

function hasWebFrontend(frontend: ProjectConfig["frontend"]): boolean {
  return frontend.some((value) => webFrontends.includes(value as (typeof webFrontends)[number]));
}

function hasReactFrontend(frontend: ProjectConfig["frontend"]): boolean {
  return frontend.some((value) =>
    reactFrontends.includes(value as (typeof reactFrontends)[number]),
  );
}

function getWebEnvKey(frontend: ProjectConfig["frontend"]): string {
  if (frontend.includes("next")) return "NEXT_PUBLIC_GETMONITOR_API_KEY";
  if (frontend.includes("nuxt")) return "NUXT_PUBLIC_GETMONITOR_API_KEY";
  if (frontend.includes("svelte") || frontend.includes("astro")) {
    return "PUBLIC_GETMONITOR_API_KEY";
  }
  return "VITE_GETMONITOR_API_KEY";
}

const ERROR_BOUNDARY_FALLBACK = `fallback={(error, reset) => (
        <div>
          <p>Something went wrong.</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </div>
      )}`;

function ensureImport(content: string, importLine: string): string {
  if (content.includes(importLine)) return content;
  return `${importLine}\n${content}`;
}

function wrapOutletWithBoundary(content: string): string {
  if (content.includes("GetMonitorErrorBoundary")) return content;
  let next = ensureImport(content, 'import { GetMonitorErrorBoundary } from "@getmonitor/react";');
  // Preserve indentation of each <Outlet /> occurrence.
  next = next.replace(
    /^([ \t]*)<Outlet\s*\/>/gm,
    (_match, indent: string) =>
      `${indent}<GetMonitorErrorBoundary\n${indent}  ${ERROR_BOUNDARY_FALLBACK}\n${indent}>\n${indent}  <Outlet />\n${indent}</GetMonitorErrorBoundary>`,
  );
  return next;
}

function processNextIntegration(vfs: VirtualFileSystem, config: ProjectConfig, key: string): void {
  addPackageDependency({
    vfs,
    packagePath: "apps/web/package.json",
    dependencies: ["@getmonitor/browser", "@getmonitor/react"],
    devDependencies: ["@getmonitor/nextjs-config"],
  });

  vfs.writeFile(
    "apps/web/src/components/getmonitor.tsx",
    `"use client";

import { useEffect } from "react";
import { GetMonitor } from "@getmonitor/browser";
import { GetMonitorErrorBoundary } from "@getmonitor/react";

export function GetMonitorProvider() {
  useEffect(() => {
    if (process.env.${key}) {
      GetMonitor.init(process.env.${key}, {
        environment: process.env.NODE_ENV ?? "development",
        // Avoid duplicate events: React logs boundary catches via console.error.
        captureConsoleErrors: false,
      });
    }
  }, []);

  return null;
}

export function GetMonitorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <GetMonitorErrorBoundary
      ${ERROR_BOUNDARY_FALLBACK}
    >
      {children}
    </GetMonitorErrorBoundary>
  );
}
`,
  );

  const layoutPath = "apps/web/src/app/layout.tsx";
  if (vfs.exists(layoutPath)) {
    let layout = vfs.readFile(layoutPath) ?? "";
    const importLine =
      'import { GetMonitorProvider, GetMonitorBoundary } from "@/components/getmonitor";';
    if (!layout.includes("@/components/getmonitor")) {
      layout = `${importLine}\n${layout}`;
    }
    if (!layout.includes("<GetMonitorProvider")) {
      // Match multi-line <body ...> openings used by the Next layout template.
      layout = layout.replace(/<body([^>]*)>/, "<body$1>\n        <GetMonitorProvider />");
    }
    if (!layout.includes("GetMonitorBoundary")) {
      // Wrap the Providers tree (or body children) once.
      if (layout.includes("<Providers") && layout.includes("</Providers>")) {
        layout = layout.replace(
          /<Providers([^>]*)>/,
          "<GetMonitorBoundary>\n        <Providers$1>",
        );
        layout = layout.replace("</Providers>", "</Providers>\n        </GetMonitorBoundary>");
      } else {
        layout = layout.replace(
          /(<body[^>]*>\s*(?:<GetMonitorProvider \/>\s*)?)/,
          "$1\n        <GetMonitorBoundary>\n",
        );
        layout = layout.replace("</body>", "        </GetMonitorBoundary>\n      </body>");
      }
    }
    vfs.writeFile(layoutPath, layout);
  }

  patchNextConfig(vfs);
}

function patchNextConfig(vfs: VirtualFileSystem): void {
  const configPath = "apps/web/next.config.ts";
  if (!vfs.exists(configPath)) return;
  let content = vfs.readFile(configPath) ?? "";
  if (content.includes("withGetMonitor")) return;

  content = ensureImport(content, 'import { withGetMonitor } from "@getmonitor/nextjs-config";');

  // Replace bare `export default nextConfig` with a token-gated wrap.
  // Keep any trailing Cloudflare side-effect calls after the export.
  if (content.includes("export default nextConfig;")) {
    content = content.replace(
      "export default nextConfig;",
      `export default process.env.GETMONITOR_AUTH_TOKEN
	? withGetMonitor(nextConfig, {
			authToken: process.env.GETMONITOR_AUTH_TOKEN,
		})
	: nextConfig;`,
    );
  } else if (/export default nextConfig\s*;?/.test(content)) {
    content = content.replace(
      /export default nextConfig\s*;?/,
      `export default process.env.GETMONITOR_AUTH_TOKEN
	? withGetMonitor(nextConfig, {
			authToken: process.env.GETMONITOR_AUTH_TOKEN,
		})
	: nextConfig;`,
    );
  }

  vfs.writeFile(configPath, content);
}

function processNuxtIntegration(vfs: VirtualFileSystem, config: ProjectConfig, key: string): void {
  addPackageDependency({
    vfs,
    packagePath: "apps/web/package.json",
    dependencies: ["@getmonitor/browser"],
    devDependencies: ["@getmonitor/nuxt"],
  });

  vfs.writeFile(
    "apps/web/app/plugins/getmonitor.client.ts",
    `import { GetMonitor } from "@getmonitor/browser";

export default defineNuxtPlugin(() => {
  const apiKey = process.env.${key};
  if (!apiKey) return;

  GetMonitor.init(apiKey, {
    environment: process.env.NODE_ENV ?? "development",
  });
});
`,
  );

  const configPath = "apps/web/nuxt.config.ts";
  if (!vfs.exists(configPath)) return;
  let content = vfs.readFile(configPath) ?? "";
  if (!content.includes("@getmonitor/nuxt")) {
    // Insert module after the opening of modules: [
    content = content.replace(/modules:\s*\[/, "modules: [\n    '@getmonitor/nuxt',");
  }
  if (!content.includes("getmonitor:")) {
    // Insert getmonitor config before the closing of defineNuxtConfig
    content = content.replace(
      /\}\)\s*$/,
      `  getmonitor: {
    authToken: process.env.GETMONITOR_AUTH_TOKEN,
  },
})
`,
    );
  }
  vfs.writeFile(configPath, content);
}

function processViteBrowserIntegration(
  vfs: VirtualFileSystem,
  config: ProjectConfig,
  key: string,
): void {
  const useReact = hasReactFrontend(config.frontend);
  const deps = useReact
    ? (["@getmonitor/browser", "@getmonitor/react"] as const)
    : (["@getmonitor/browser"] as const);

  addPackageDependency({
    vfs,
    packagePath: "apps/web/package.json",
    dependencies: [...deps],
  });

  const captureConsole = useReact
    ? `\n    // Avoid duplicate events: React logs boundary catches via console.error.\n    captureConsoleErrors: false,`
    : "";

  vfs.writeFile(
    "apps/web/src/lib/getmonitor.ts",
    `import { GetMonitor } from "@getmonitor/browser";
import { env } from "@${config.projectName}/env/web";

if (typeof window !== "undefined" && env.${key}) {
  GetMonitor.init(env.${key}, {
    environment: import.meta.env.MODE,${captureConsole}
  });
}
`,
  );

  const entryByFrontend: Record<string, string> = {
    "tanstack-router": "apps/web/src/main.tsx",
    "react-router": "apps/web/src/root.tsx",
    "tanstack-start": "apps/web/src/router.tsx",
    solid: "apps/web/src/main.tsx",
  };
  const frontend = config.frontend.find((value) => entryByFrontend[value]);
  const entryPath = frontend ? entryByFrontend[frontend] : undefined;
  if (entryPath && vfs.exists(entryPath)) {
    const content = vfs.readFile(entryPath) ?? "";
    if (!content.includes('"./lib/getmonitor"') && !content.includes("'./lib/getmonitor'")) {
      vfs.writeFile(entryPath, `import "./lib/getmonitor";\n${content}`);
    }
  }

  if (!useReact) return;

  const rootPaths: string[] = [];
  if (config.frontend.includes("tanstack-router")) {
    rootPaths.push("apps/web/src/routes/__root.tsx");
  }
  if (config.frontend.includes("tanstack-start")) {
    rootPaths.push("apps/web/src/routes/__root.tsx");
  }
  if (config.frontend.includes("react-router")) {
    rootPaths.push("apps/web/src/root.tsx");
  }

  for (const rootPath of rootPaths) {
    if (!vfs.exists(rootPath)) continue;
    const content = vfs.readFile(rootPath) ?? "";
    vfs.writeFile(rootPath, wrapOutletWithBoundary(content));
  }
}

function processBrowserIntegration(vfs: VirtualFileSystem, config: ProjectConfig): void {
  if (!hasWebFrontend(config.frontend) || !vfs.exists("apps/web/package.json")) return;

  const key = getWebEnvKey(config.frontend);

  if (config.frontend.includes("next")) {
    processNextIntegration(vfs, config, key);
    return;
  }

  if (config.frontend.includes("nuxt")) {
    processNuxtIntegration(vfs, config, key);
    return;
  }

  processViteBrowserIntegration(vfs, config, key);
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
    `import { GetMonitor } from "@getmonitor/node";
import { env } from "@${config.projectName}/env/server";

export const getMonitor = env.GETMONITOR_API_KEY
  ? new GetMonitor(env.GETMONITOR_API_KEY, {
      environment: env.NODE_ENV,
    })
  : null;
`,
  );

  const entryPath = "apps/server/src/index.ts";
  if (!vfs.exists(entryPath)) return;
  let content = vfs.readFile(entryPath) ?? "";
  if (!content.includes('from "./getmonitor"')) {
    content = `import { getMonitor } from "./getmonitor";\n${content}`;
  }
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
