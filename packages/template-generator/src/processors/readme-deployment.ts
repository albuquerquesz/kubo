import type { ProjectConfig } from "@kubojs/types";

export function generateDeploymentCommands(
  packageManagerRunCmd: string,
  webDeploy: ProjectConfig["webDeploy"],
  serverDeploy: ProjectConfig["serverDeploy"],
  backend: ProjectConfig["backend"],
): string {
  const hasCloudflare = webDeploy === "cloudflare" || serverDeploy === "cloudflare";
  const hasDocker = webDeploy === "docker" || serverDeploy === "docker";
  const hasVercel = webDeploy === "vercel" || serverDeploy === "vercel";
  const hasRailway = webDeploy === "railway" || serverDeploy === "railway";
  const hasGuaraCloud = webDeploy === "guaracloud" || serverDeploy === "guaracloud";

  if (!hasCloudflare && !hasDocker && !hasVercel && !hasRailway && !hasGuaraCloud) {
    return "";
  }

  const lines: string[] = ["## Deployment"];

  if (hasCloudflare) {
    const targetLabel =
      webDeploy === "cloudflare" && (serverDeploy === "cloudflare" || backend === "self")
        ? "web + server"
        : webDeploy === "cloudflare"
          ? "web"
          : "server";
    const cfDeployScript = hasVercel
      ? webDeploy === "cloudflare"
        ? "deploy:web"
        : "deploy:server"
      : "deploy";

    lines.push(
      "",
      "### Cloudflare via Alchemy",
      "",
      `- Target: ${targetLabel}`,
      `- Dev: ${packageManagerRunCmd} dev`,
      `- Deploy: ${packageManagerRunCmd} ${cfDeployScript}`,
      `- Destroy: ${packageManagerRunCmd} destroy`,
      "",
      "For more details, see the guide on [Deploying to Cloudflare with Alchemy](https://www.kubojs.dev/docs/guides/cloudflare-alchemy).",
    );
  }

  if (hasDocker) {
    const targetLabel =
      webDeploy === "docker" && (serverDeploy === "docker" || backend === "self")
        ? "web + server"
        : webDeploy === "docker"
          ? "web"
          : "server";

    lines.push(
      "",
      "### Docker Compose",
      "",
      `- Target: ${targetLabel}`,
      "- Config: `docker-compose.yml` (app Dockerfiles live in `apps/*/Dockerfile`)",
      `- Build images: ${packageManagerRunCmd} docker:build`,
      `- Start: ${packageManagerRunCmd} docker:up`,
      `- Logs: ${packageManagerRunCmd} docker:logs`,
      `- Stop: ${packageManagerRunCmd} docker:down`,
      "",
      "Environment variables are read from each app's `.env` file (baked into web builds for public variables) and overridden in `docker-compose.yml` for container networking.",
      "",
      "For more details, see the guide on [Deploying with Docker Compose](https://www.kubojs.dev/docs/guides/docker).",
    );
  }

  if (hasVercel) {
    const vercelNames = getVercelScriptNames(webDeploy, serverDeploy);
    const targetLabel =
      webDeploy === "vercel" && (serverDeploy === "vercel" || backend === "self")
        ? "web + server"
        : webDeploy === "vercel"
          ? "web"
          : "server";

    lines.push(
      "",
      "### Vercel Services",
      "",
      `- Target: ${targetLabel}`,
      "- Config: `vercel.json`",
      `- Link the project first: ${packageManagerRunCmd} ${vercelNames.setup}`,
      `- Local Vercel dev: ${packageManagerRunCmd} dev:vercel`,
      `- Sync preview env: ${packageManagerRunCmd} ${vercelNames.envPreview}`,
      `- Sync production env: ${packageManagerRunCmd} ${vercelNames.envProduction}`,
      `- Dry-run check (no upload): ${packageManagerRunCmd} ${vercelNames.deployCheck}`,
      `- Preview deploy: ${packageManagerRunCmd} ${vercelNames.deploy}`,
      `- Production deploy: ${packageManagerRunCmd} ${vercelNames.deployProd}`,
    );

    if (webDeploy === "vercel" && serverDeploy === "vercel" && backend !== "self") {
      lines.push(
        "- Web requests under `/api/*` route to the server service and are rewritten before reaching the backend.",
      );
    }

    lines.push(
      "Vercel Services share project environment variables, but deploys do not upload local `.env` files automatically. Link the project with `vercel link`, then run the env sync command before your first deploy (otherwise the deployment starts with no env vars), or pass one-off envs with `vercel deploy -e KEY=value`.",
      `Pass Vercel CLI flags to the env sync command directly, for example: \`${packageManagerRunCmd} ${vercelNames.envProduction} --scope your-team\`.`,
      "",
      "For more details, see the guide on [Deploying to Vercel](https://www.kubojs.dev/docs/guides/vercel).",
    );
  }

  if (hasRailway) {
    const targetLabel =
      webDeploy === "railway" && (serverDeploy === "railway" || backend === "self")
        ? "web + server"
        : webDeploy === "railway"
          ? "web"
          : "server";
    const usesTargetScopedRailwayScripts =
      (webDeploy !== "none" && serverDeploy !== "none" && webDeploy !== serverDeploy) ||
      (webDeploy === "railway" && serverDeploy === "railway");
    const deployScript = usesTargetScopedRailwayScripts
      ? webDeploy === "railway"
        ? "deploy:web"
        : "deploy:server"
      : "deploy";
    const configPaths = [
      ...(webDeploy === "railway" ? ["`apps/web/railway.json`"] : []),
      ...(serverDeploy === "railway" ? ["`apps/server/railway.json`"] : []),
    ];

    lines.push(
      "",
      "### Railway",
      "",
      `- Target: ${targetLabel}`,
      `- Config: ${configPaths.join(" and ")}`,
      "- Each app is a separate Railway service; import the monorepo, then select the matching app directory as its config path.",
      `- Login: ${packageManagerRunCmd} railway:login`,
      `- Deploy: ${packageManagerRunCmd} ${deployScript}`,
      "- Set the generated app's environment variables in Railway before the first deploy.",
    );

    if (webDeploy === "railway" && serverDeploy === "railway") {
      lines.push(`- Server deploy: ${packageManagerRunCmd} deploy:server`);
    }
  }

  if (hasGuaraCloud) {
    const scriptSets = getGuaraCloudScriptSets(webDeploy, serverDeploy);
    const targetLabel =
      webDeploy === "guaracloud" && (serverDeploy === "guaracloud" || backend === "self")
        ? "web + server"
        : webDeploy === "guaracloud"
          ? "web"
          : "server";

    lines.push(
      "",
      "### Guara Cloud",
      "",
      `- Target: ${targetLabel}`,
      "- Build source: app Dockerfiles in `apps/*/Dockerfile`",
      `- Login: ${packageManagerRunCmd} deploy:login`,
      "- One Guara service should be linked per app directory in this monorepo.",
      "",
      "Guara Cloud supports GitHub-connected monorepos and Docker-based deployments. Configure each service to build from its app directory, set environment variables in Guara Cloud (or via `guara env`), and attach custom domains after the first deploy.",
      "",
      "Docs referenced during integration: Introduction, Quickstart, Concepts, Pricing, Creating Services, Environment Variables, Service Scaling, Storage Volumes, Build Configuration, Health Checks, Managing Services, Deployments Overview, Service Domains, Guara CLI, Supported Technologies, Deploying from GitHub, and Deploying with Docker.",
    );

    for (const scriptSet of scriptSets) {
      const label = scriptSet.target === "web" ? "Web" : "Server";
      const appDir = scriptSet.target === "web" ? "apps/web" : "apps/server";
      lines.push(
        `- ${label} link: ${packageManagerRunCmd} ${scriptSet.link}`,
        `- ${label} deploy: ${packageManagerRunCmd} ${scriptSet.deploy}`,
        `- ${label} runtime logs: ${packageManagerRunCmd} ${scriptSet.logs}`,
        `- ${label} build logs: ${packageManagerRunCmd} ${scriptSet.buildLogs}`,
        `- ${label} roll back: ${packageManagerRunCmd} ${scriptSet.rollback}`,
        `- Start by linking from \`${appDir}\` so Guara stores service metadata beside the app it deploys.`,
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

export function getVercelScriptNames(
  webDeploy: ProjectConfig["webDeploy"] | undefined,
  serverDeploy: ProjectConfig["serverDeploy"] | undefined,
) {
  const mixedCloud = webDeploy !== "none" && serverDeploy !== "none" && webDeploy !== serverDeploy;
  const target = webDeploy === "vercel" ? "web" : "server";
  const deploy = mixedCloud ? `deploy:${target}` : "deploy";
  return {
    setup: "deploy:setup",
    envPreview: "env:preview",
    envProduction: "env:production",
    deploy,
    deployProd: `${deploy}:prod`,
    deployCheck: "deploy:check",
  };
}

function getGuaraCloudScriptNames(
  webDeploy: ProjectConfig["webDeploy"] | undefined,
  serverDeploy: ProjectConfig["serverDeploy"] | undefined,
) {
  const splitTargets =
    (webDeploy !== "none" && serverDeploy !== "none" && webDeploy !== serverDeploy) ||
    (webDeploy === "guaracloud" && serverDeploy === "guaracloud");
  const target = webDeploy === "guaracloud" ? "web" : "server";
  const deploy = splitTargets ? `deploy:${target}` : "deploy";
  return {
    deploy,
    link: `${deploy}:link`,
    logs: `${deploy}:logs`,
    buildLogs: `${deploy}:build-logs`,
    rollback: splitTargets ? `rollback:${target}` : "rollback",
  };
}

export function getGuaraCloudScriptSets(
  webDeploy: ProjectConfig["webDeploy"] | undefined,
  serverDeploy: ProjectConfig["serverDeploy"] | undefined,
) {
  if (webDeploy === "guaracloud" && serverDeploy === "guaracloud") {
    return [
      {
        target: "web" as const,
        deploy: "deploy:web",
        link: "deploy:web:link",
        logs: "deploy:web:logs",
        buildLogs: "deploy:web:build-logs",
        rollback: "rollback:web",
      },
      {
        target: "server" as const,
        deploy: "deploy:server",
        link: "deploy:server:link",
        logs: "deploy:server:logs",
        buildLogs: "deploy:server:build-logs",
        rollback: "rollback:server",
      },
    ];
  }

  return [
    {
      target: webDeploy === "guaracloud" ? ("web" as const) : ("server" as const),
      ...getGuaraCloudScriptNames(webDeploy, serverDeploy),
    },
  ];
}
