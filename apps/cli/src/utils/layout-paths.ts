import { appDir, pkgDir } from "@kubojs/template-generator";

import type { ProjectConfig } from "../types";

type LayoutAwareConfig = Pick<ProjectConfig, "backend" | "layout">;

/**
 * App folder that holds the database `.env` (the web app for fullstack `self` backends,
 * otherwise the server app), resolved against the project layout.
 */
export function getDbEnvTargetApp(config: LayoutAwareConfig): string {
  return appDir(config, config.backend === "self" ? "web" : "server");
}

export { appDir, pkgDir };
