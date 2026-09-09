import { DEFAULT_CONFIG } from "../constants";
import type { Backend, DatabaseSetup, Frontend, Runtime, WebDeploy } from "../types";
import { WEB_FRAMEWORKS } from "../utils/compatibility";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableSelect, preferValidInitial } from "./navigable";

function hasWebFrontend(frontends: Frontend[]) {
  return frontends.some((f) => WEB_FRAMEWORKS.includes(f));
}

type DeploymentOption = {
  value: WebDeploy;
  label: string;
  hint: string;
};

const DEPLOYMENT_DISPLAYS: Partial<Record<WebDeploy, Omit<DeploymentOption, "value">>> = {
  cloudflare: { label: "Cloudflare", hint: "Deploy to Cloudflare Workers using Alchemy" },
  docker: { label: "Docker", hint: "Self-host with a Dockerfile and docker-compose.yml" },
  vercel: { label: "Vercel", hint: "Deploy to Vercel with Services" },
  railway: { label: "Railway", hint: "Deploy with Railpack and railway.json" },
  guaracloud: {
    label: "Guara Cloud",
    hint: "Deploy containers on Guara Cloud via GitHub or Docker image",
  },
};

function getDeploymentDisplay(deployment: WebDeploy): {
  label: string;
  hint: string;
} {
  return (
    DEPLOYMENT_DISPLAYS[deployment] ?? {
      label: deployment,
      hint: `Add ${deployment} deployment`,
    }
  );
}

export async function getDeploymentChoice(
  deployment?: WebDeploy,
  _runtime?: Runtime,
  backend?: Backend,
  frontend: Frontend[] = [],
  dbSetup?: DatabaseSetup,
  previousValue?: WebDeploy,
) {
  if (deployment !== undefined) return deployment;
  if (!hasWebFrontend(frontend)) {
    return "none";
  }

  if (backend === "self" && dbSetup === "d1") {
    return "cloudflare";
  }

  const availableDeployments = [
    "cloudflare",
    "docker",
    "vercel",
    "railway",
    "guaracloud",
    "none",
  ] as const satisfies readonly WebDeploy[];

  const options: DeploymentOption[] = availableDeployments.map((deploy) => {
    const { label, hint } = getDeploymentDisplay(deploy);
    return {
      value: deploy,
      label,
      hint,
    };
  });

  const response = await navigableSelect<WebDeploy>({
    message: "Select web deployment",
    options,
    initialValue: preferValidInitial(options, previousValue, DEFAULT_CONFIG.webDeploy),
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });

  return response;
}

export async function getDeploymentToAdd(frontend: Frontend[], existingDeployment?: WebDeploy) {
  if (!hasWebFrontend(frontend)) {
    return "none";
  }

  // A project can only have one web deployment target; nothing to add.
  if (existingDeployment && existingDeployment !== "none") {
    return "none";
  }

  const options: DeploymentOption[] = (
    ["cloudflare", "docker", "vercel", "railway", "guaracloud"] as const
  ).map((deploy) => {
    const { label, hint } = getDeploymentDisplay(deploy);
    return { value: deploy, label, hint };
  });

  options.push({
    value: "none",
    label: "None",
    hint: "Skip deployment setup",
  });

  const response = await navigableSelect<WebDeploy>({
    message: "Select web deployment",
    options,
    initialValue: DEFAULT_CONFIG.webDeploy,
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });

  return response;
}
