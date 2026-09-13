import { CATEGORY_ORDER } from "@/lib/stack-utils";

export {
  analyzeStackCompatibility,
  getDisabledReason,
  hasClerkCompatibleBackend,
  hasClerkCompatibleFrontend,
  hasElectrobunCompatibleFrontend,
  hasPlaywrightCompatibleFrontend,
  hasPWACompatibleFrontend,
  hasTauriCompatibleFrontend,
  isOptionCompatible,
  isTauriBlockedByConvexBetterAuth,
} from "@/lib/stack-compatibility";
export type { CompatibilityResult } from "@/lib/stack-compatibility";

export function validateProjectName(name: string): string | undefined {
  const invalidCharacters = ["<", ">", ":", '"', "|", "?", "*"];
  const maxLength = 255;

  if (name === ".") return undefined;
  if (!name) return "O nome do projeto não pode ficar vazio";
  if (name.length > maxLength) {
    return `O nome do projeto deve ter menos de ${maxLength} caracteres`;
  }
  if (invalidCharacters.some((character) => name.includes(character))) {
    return "O nome do projeto contém caracteres inválidos";
  }
  if (name.startsWith(".") || name.startsWith("-")) {
    return "O nome do projeto não pode começar com ponto ou hífen";
  }
  if (name.toLowerCase() === "node_modules" || name.toLowerCase() === "favicon.ico") {
    return "Esse nome de projeto é reservado";
  }
  return undefined;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  webFrontend: "Web",
  nativeFrontend: "Nativo",
  backend: "Backend",
  runtime: "Runtime",
  api: "API",
  database: "Banco de dados",
  orm: "ORM",
  dbSetup: "Config. do banco",
  webDeploy: "Deploy web",
  serverDeploy: "Deploy do servidor",
  auth: "Auth",
  payments: "Pagamentos",
  observability: "Observabilidade",
  communication: "Comunicação",
  packageManager: "Package Manager",
  addons: "Add-ons",
  testing: "Testes",
  examples: "Exemplos",
  git: "Git",
  install: "Instalação",
};

export function getCategoryDisplayName(categoryKey: string): string {
  const displayName = CATEGORY_DISPLAY_NAMES[categoryKey];
  if (displayName) return displayName;

  const result = categoryKey.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export { CATEGORY_ORDER };
