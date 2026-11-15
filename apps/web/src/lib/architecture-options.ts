import type { Architecture } from "@kubojs/types";

export type ArchitectureTreeLine = {
  /** Folder or file, indented with two spaces per level. */
  path: string;
  note?: string;
};

export type ArchitectureOption = {
  id: Architecture | "default";
  name: string;
  description: string;
  /** `undefined` keeps the generator's default output (no `--architecture` flag). */
  architecture: Architecture | undefined;
  api: ArchitectureTreeLine[];
  web: ArchitectureTreeLine[];
};

/** Architectures offered by the builder's Arquitetura dialog. */
export const ARCHITECTURE_OPTIONS: ArchitectureOption[] = [
  {
    id: "default",
    name: "Padrão",
    description: "Como o Kubo gera hoje: API em módulos por feature e web separado por tipo.",
    architecture: undefined,
    api: [{ path: "modules/todo/", note: "index, service, model" }],
    web: [
      { path: "components/", note: "header, sign-in-form…" },
      { path: "lib/", note: "auth-client" },
      { path: "utils/", note: "cliente da API" },
    ],
  },
  {
    id: "feature",
    name: "Por feature",
    description: "Cada feature reúne tudo o que é dela: rotas da API, serviço, modelo e telas.",
    architecture: "feature",
    api: [{ path: "modules/todo/", note: "index, service, model" }],
    web: [
      { path: "features/auth/", note: "components, lib, server" },
      { path: "components/", note: "compartilhados: header, loader…" },
    ],
  },
  {
    id: "layered",
    name: "Em camadas",
    description: "Código separado por tipo: rotas, serviços e modelos em pastas próprias.",
    architecture: "layered",
    api: [
      { path: "routers/", note: "todo.ts" },
      { path: "services/", note: "todo.service.ts" },
      { path: "models/", note: "todo.model.ts" },
    ],
    web: [
      { path: "components/", note: "header, sign-in-form…" },
      { path: "lib/", note: "auth-client" },
      { path: "utils/", note: "cliente da API" },
    ],
  },
  {
    id: "clean",
    name: "Clean",
    description: "Domínio no centro, casos de uso em application e detalhes em infrastructure.",
    architecture: "clean",
    api: [
      { path: "domain/todo/", note: "todo.model.ts" },
      { path: "application/todo/", note: "todo.service.ts" },
      { path: "presentation/routers/", note: "todo.ts" },
    ],
    web: [
      { path: "presentation/components/", note: "header, sign-in-form…" },
      { path: "infrastructure/api/", note: "cliente da API" },
      { path: "infrastructure/auth/", note: "auth-client" },
    ],
  },
];

export function findArchitectureOption(architecture: Architecture | undefined): ArchitectureOption {
  return (
    ARCHITECTURE_OPTIONS.find((option) => option.architecture === architecture) ??
    ARCHITECTURE_OPTIONS[0]!
  );
}
