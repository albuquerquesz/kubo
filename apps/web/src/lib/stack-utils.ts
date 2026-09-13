import { isDesktopWebFrontend, isSelfHostedFrontend, type ProjectConfigDraft } from "@kubojs/types";

import { isStackDefault, type StackState, TECH_OPTIONS } from "@/lib/constant";
import { CREATE_COMMANDS, DEFAULT_PACKAGE_MANAGER } from "@/lib/create-commands";
import { getFrontendSelection } from "@/lib/stack-state";
import { stackUrlKeys } from "@/lib/stack-url-keys";

const STACK_STATE_KEYS = [
  "projectName",
  "frontend",
  "runtime",
  "backend",
  "api",
  "database",
  "orm",
  "dbSetup",
  "auth",
  "payments",
  "observability",
  "communication",
  "packageManager",
  "addons",
  "testing",
  "examples",
  "git",
  "install",
  "webDeploy",
  "serverDeploy",
  "yolo",
] as const satisfies readonly (keyof StackState)[];

const CATEGORY_ORDER: Array<keyof typeof TECH_OPTIONS> = [
  "webFrontend",
  "nativeFrontend",
  "backend",
  "runtime",
  "api",
  "database",
  "orm",
  "dbSetup",
  "webDeploy",
  "serverDeploy",
  "auth",
  "payments",
  "observability",
  "communication",
  "packageManager",
  "addons",
  "testing",
  "examples",
  "git",
  "install",
];

export type StackBuilderInput = ProjectConfigDraft & { yolo?: boolean };

function withBuilderState(input: StackBuilderInput): StackState {
  return { ...input, yolo: input.yolo ?? false };
}

const desktopAddonNames = {
  tauri: "Tauri",
  electrobun: "Electrobun",
} as const;

const staticDesktopFrontendNames = {
  "tanstack-start": "TanStack Start",
  next: "Next.js",
  nuxt: "Nuxt",
  svelte: "SvelteKit",
  astro: "Astro",
} as const;

export function formatProjectName(name: string | null | undefined) {
  return (name || "my-kubo-app").replace(/\s+/g, "-");
}

export type SelectedTech = {
  category: keyof typeof TECH_OPTIONS;
  id: string;
  name: string;
  icon: string;
};

export function getSelectedTechs(stack: ProjectConfigDraft): SelectedTech[] {
  const selected: SelectedTech[] = [];
  for (const category of CATEGORY_ORDER) {
    const options = TECH_OPTIONS[category];
    const value = getStackCategoryValue(stack, category);
    if (!options || value === undefined) continue;

    const ids = Array.isArray(value) ? value : typeof value === "boolean" ? [] : [value];
    for (const id of ids) {
      if (id === "none") {
        continue;
      }
      const tech = options.find((opt) => opt.id === id);
      if (tech) {
        selected.push({ category, id: tech.id, name: tech.name, icon: tech.icon });
      }
    }
  }
  return selected;
}

export function generateStackSummary(stack: StackState) {
  const selectedTechs = CATEGORY_ORDER.flatMap((category) => {
    const options = TECH_OPTIONS[category];
    const selectedValue = getStackCategoryValue(stack, category);

    if (!options) return [];

    const getTechNames = (value: string | string[] | boolean) => {
      const values = Array.isArray(value) ? value : typeof value === "boolean" ? [] : [value];
      return values
        .filter((id) => id !== "none")
        .map((id) => options.find((opt) => opt.id === id)?.name)
        .filter(Boolean) as string[];
    };

    return selectedValue ? getTechNames(selectedValue) : [];
  });

  return selectedTechs.length > 0 ? selectedTechs.join(" • ") : "Stack personalizada";
}

export function getDesktopBuildNote(stack: Pick<StackState, "addons" | "backend" | "frontend">) {
  const selectedDesktopAddons = stack.addons.filter(
    (addon): addon is keyof typeof desktopAddonNames => addon in desktopAddonNames,
  );

  if (selectedDesktopAddons.length === 0) {
    return null;
  }

  const staticFrontend = getFrontendSelection(stack.frontend, "webFrontend").find(
    (frontend): frontend is keyof typeof staticDesktopFrontendNames =>
      isDesktopWebFrontend(frontend) && frontend in staticDesktopFrontendNames,
  );

  if (!staticFrontend) {
    return null;
  }

  const addonLabel =
    selectedDesktopAddons.length === 2
      ? "Os builds desktop Tauri e Electrobun"
      : `Os builds desktop ${desktopAddonNames[selectedDesktopAddons[0]]}`;

  if (
    stack.backend === "self" &&
    getFrontendSelection(stack.frontend, "webFrontend").some(isSelfHostedFrontend)
  ) {
    return `${addonLabel} empacotam assets web estáticos e exigem um backend separado ou nenhum backend. Backends fullstack self emitem rotas de servidor dentro do app web, então não podem ser empacotados para desktop.`;
  }

  return `${addonLabel} empacotam assets web estáticos. ${staticDesktopFrontendNames[staticFrontend]} precisa de uma configuração de build static/export antes do empacotamento desktop funcionar.`;
}

export function generateStackCommand(input: StackBuilderInput) {
  const stack = withBuilderState(input);
  const manager = stack.packageManager || DEFAULT_PACKAGE_MANAGER;
  const base = CREATE_COMMANDS[manager];
  const projectName = stack.projectName || "my-kubo-app";

  const isStackDefaultExceptProjectName = STACK_STATE_KEYS.every(
    (key) => key === "projectName" || isStackDefault(stack, key, stack[key]),
  );

  if (isStackDefaultExceptProjectName) {
    return `${base} ${projectName} --yes`;
  }

  const flags = [
    `--frontend ${
      stack.frontend.filter((v, _, arr) => v !== "none" || arr.length === 1).join(" ") || "none"
    }`,
    `--backend ${stack.backend}`,
    `--runtime ${stack.runtime}`,
    `--api ${stack.api}`,
    `--auth ${stack.auth || "none"}`,
    `--payments ${stack.payments.join(" ") || "none"}`,
    // Always emit observability so Stack Builder → CLI carries the choice
    // (including explicit "none"); CLI processFlags must accept this flag.
    stack.observability.length > 0
      ? `--observability ${stack.observability.join(" ")}`
      : "--disable-observability",
    `--communication ${stack.communication || "none"}`,
    `--database ${stack.database}`,
    `--orm ${stack.orm}`,
    `--db-setup ${stack.dbSetup}`,
    `--package-manager ${stack.packageManager}`,
    stack.git ? "--git" : "--no-git",
    `--web-deploy ${stack.webDeploy}`,
    `--server-deploy ${stack.serverDeploy}`,
    stack.install ? "--install" : "--no-install",
    `--addons ${
      stack.addons.length > 0
        ? stack.addons
            .filter((addon) => TECH_OPTIONS.addons.some((option) => option.id === addon))
            .join(" ") || "none"
        : "none"
    }`,
    `--examples ${stack.examples.join(" ") || "none"}`,
    `--testing ${
      stack.testing.length > 0
        ? stack.testing.filter((t) => ["vitest", "playwright"].includes(t)).join(" ") || "none"
        : "none"
    }`,
  ];

  if (stack.yolo) {
    flags.push("--yolo");
  }

  return `${base} ${projectName} ${flags.join(" ")}`;
}

export function formatStackCommandForDisplay(command: string) {
  return command.replaceAll(" --", ` ${"\\"}\n  --`);
}

export function generateStackUrlFromState(input: StackBuilderInput, baseUrl?: string) {
  const origin = baseUrl || "https://kubojs.dev";
  const stack = withBuilderState(input);
  const searchString = serializeStackToSearchString(stack);
  return `${origin}/new${searchString ? `?${searchString}` : ""}`;
}

function serializeStackToSearchString(stack: StackState) {
  const stackParams = new URLSearchParams();
  STACK_STATE_KEYS.forEach((stackKey) => {
    const urlKey = stackUrlKeys[stackKey];
    const value = stack[stackKey];
    if (urlKey && value !== undefined) {
      stackParams.set(urlKey, Array.isArray(value) ? value.join(",") : String(value));
    }
  });
  return stackParams.toString();
}

export function generateStackSharingUrl(input: StackBuilderInput, baseUrl?: string) {
  return generateStackUrlFromState(input, baseUrl);
}

export function generateStackOgImageUrl(input: StackBuilderInput, baseUrl = "") {
  const stack = withBuilderState(input);
  const searchString = serializeStackToSearchString(stack);
  return `${baseUrl}/og/stack${searchString ? `?${searchString}` : ""}`;
}

export { CATEGORY_ORDER };

export function getStackCategoryValue(
  stack: ProjectConfigDraft,
  category: (typeof CATEGORY_ORDER)[number],
) {
  if (category === "webFrontend" || category === "nativeFrontend") {
    return getFrontendSelection(stack.frontend, category);
  }

  return stack[category];
}
