import type { KuboConfig, KubojsConfig, LayoutConfig } from "./types";

const DEFAULT_LAYOUT: LayoutConfig = { preset: "standard" };

export function normalizeLegacyKuboConfig(
  config: KubojsConfig | KuboConfig,
  layout?: LayoutConfig,
): KuboConfig {
  const withLayout =
    "layout" in config && config.layout !== undefined
      ? config
      : { ...config, layout: layout ?? DEFAULT_LAYOUT };

  return withLayout as KuboConfig;
}
