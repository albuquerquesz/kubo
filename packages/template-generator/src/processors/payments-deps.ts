import type { ProjectConfig } from "@kubo/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
export function processPaymentsDeps(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const { payments } = config;
  if (!payments || payments === "none") return;
}
