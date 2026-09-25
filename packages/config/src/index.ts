import type { KuboConfig, LayoutConfig } from "@kubojs/types";

export type { KuboConfig, LayoutConfig } from "@kubojs/types";

export type KuboConfigInput = Omit<KuboConfig, "layout"> & {
  layout?: LayoutConfig;
};

/**
 * Typed helper for kubo.config.ts. Validation runs when the KuboJS CLI loads the file.
 */
export function defineKuboConfig<const T extends KuboConfigInput>(config: T): T {
  return config;
}
