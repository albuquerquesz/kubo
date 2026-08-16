import type { ProjectConfig } from "@kubojs/types";

function normalizeMultiValues(values: string[] | string | undefined): string[] {
  if (!values || (Array.isArray(values) && values.length === 0)) return [];
  const normalized = Array.isArray(values) ? values : [values];
  const filtered = normalized.filter((value) => value !== "none");
  return Array.from(new Set(filtered));
}

function formatMultiFlag(flag: string, values: string[]): string {
  if (values.length === 0) {
    return `${flag} none`;
  }
  return `${flag} ${values.join(" ")}`;
}

function getBaseCommand(packageManager: ProjectConfig["packageManager"]): string {
  if (packageManager === "bun") {
    return "bun create kubojs@latest";
  }

  if (packageManager === "pnpm") {
    return "pnpm create kubojs@latest";
  }

  return "npx kubojs@latest";
}

export function generateReproducibleCommand(config: ProjectConfig): string {
  const baseCommand = getBaseCommand(config.packageManager);

  const flags: string[] = [];
  const frontend = normalizeMultiValues(config.frontend);
  const addons = normalizeMultiValues(config.addons);
  const examples = normalizeMultiValues(config.examples);
  const testing = normalizeMultiValues(config.testing);

  flags.push(formatMultiFlag("--frontend", frontend));

  flags.push(`--backend ${config.backend}`);
  flags.push(`--runtime ${config.runtime}`);
  flags.push(`--database ${config.database}`);
  flags.push(`--orm ${config.orm}`);
  flags.push(`--api ${config.api}`);
  flags.push(`--auth ${config.auth}`);
  const payments = normalizeMultiValues(config.payments);
  flags.push(`--payments ${payments.join(" ") || "none"}`);
  const observability = normalizeMultiValues(config.observability);
  if (observability.length === 0) {
    flags.push("--disable-observability");
  } else {
    flags.push(`--observability ${observability.join(" ")}`);
  }
  flags.push(`--communication ${config.communication}`);

  flags.push(formatMultiFlag("--addons", addons));
  flags.push(formatMultiFlag("--examples", examples));
  flags.push(formatMultiFlag("--testing", testing));

  flags.push(`--db-setup ${config.dbSetup}`);
  if (config.dbSetupOptions?.mode === "manual") {
    flags.push("--manual-db");
  }
  flags.push(`--web-deploy ${config.webDeploy}`);
  flags.push(`--server-deploy ${config.serverDeploy}`);
  flags.push(config.git ? "--git" : "--no-git");
  flags.push(`--package-manager ${config.packageManager}`);
  flags.push(config.install ? "--install" : "--no-install");

  const projectPathArg = config.relativePath ? ` ${config.relativePath}` : "";

  return `${baseCommand}${projectPathArg} ${flags.join(" ")}`;
}
