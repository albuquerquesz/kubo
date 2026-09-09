/**
 * Post-processor - Orchestrates post-generation processing
 * Modifies virtual files after template generation
 */

import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { processCatalogs } from "./catalogs";
import { processPackageConfigs } from "./package-configs";
import { processRailwayConfig } from "./railway-config";
import { processVercelConfig } from "./vercel-config";

/**
 * Run all post-processing steps on the virtual filesystem
 */
export function processPostGeneration(vfs: VirtualFileSystem, config: ProjectConfig) {
  processPackageConfigs(vfs, config);
  processCatalogs(vfs, config);
  processRailwayConfig(vfs, config);
  processVercelConfig(vfs, config);
}

export { processCatalogs, processPackageConfigs, processRailwayConfig, processVercelConfig };
