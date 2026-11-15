import type { LayoutConfig } from "@kubojs/types";

import { draftToLayout, layoutToDraft } from "./layout-draft";

export type LayoutOptionFolder = {
  /** Folder as it appears at the project root. */
  path: string;
  /** Examples of what lands there. */
  items: string;
};

export type LayoutOption = {
  id: string;
  name: string;
  description: string;
  /** `undefined` is the default layout (no `--layout` flag). */
  layout: LayoutConfig | undefined;
  folders: LayoutOptionFolder[];
};

/** Curated project layouts offered by the builder's Layout dialog (v1: folder placement only). */
export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "standard",
    name: "Padrão",
    description: "Apps em apps/ e pacotes compartilhados em packages/.",
    layout: undefined,
    folders: [
      { path: "apps/", items: "web, server, native…" },
      { path: "packages/", items: "db, auth, ui, env…" },
    ],
  },
  {
    id: "libs",
    name: "Libs",
    description: "Estilo Nx: pacotes compartilhados em libs/.",
    layout: { version: 1, preset: "libs" },
    folders: [
      { path: "apps/", items: "web, server, native…" },
      { path: "libs/", items: "db, auth, ui, env…" },
    ],
  },
  {
    id: "client-server",
    name: "Cliente e servidor",
    description: "O front fica em apps/client, lado a lado com apps/server.",
    layout: { version: 1, preset: "standard", apps: { web: "apps/client" } },
    folders: [
      { path: "apps/client/", items: "front web" },
      { path: "apps/server/", items: "API" },
      { path: "packages/", items: "db, auth, ui, env…" },
    ],
  },
  {
    id: "src",
    name: "Tudo em src/",
    description: "Apps e pacotes dentro de src/, deixando a raiz só com configs.",
    layout: {
      version: 1,
      preset: "standard",
      dirs: { apps: "src/apps", packages: "src/packages" },
    },
    folders: [
      { path: "src/apps/", items: "web, server, native…" },
      { path: "src/packages/", items: "db, auth, ui, env…" },
    ],
  },
];

function layoutKey(layout: LayoutConfig | undefined): string {
  return JSON.stringify(draftToLayout(layoutToDraft(layout)));
}

/** Option that matches the stack's current layout, or `undefined` for a custom one. */
export function findLayoutOption(layout: LayoutConfig | undefined): LayoutOption | undefined {
  const key = layoutKey(layout);
  return LAYOUT_OPTIONS.find((option) => layoutKey(option.layout) === key);
}
