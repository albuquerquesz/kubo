import { LAYOUT_PRESETS } from "./layout-presets";
import type { LayoutAppId, LayoutConfig, LayoutPackageId } from "./types";

export type ExpandedLayoutConfig = Required<Pick<LayoutConfig, "preset">> & {
  apps: Record<LayoutAppId, string>;
  packages: Record<LayoutPackageId, string>;
};

export function expandLayoutConfig(layout?: LayoutConfig): ExpandedLayoutConfig {
  const preset = layout?.preset ?? "standard";
  const base = LAYOUT_PRESETS[preset];

  return {
    preset,
    apps: { ...base.apps, ...layout?.apps },
    packages: { ...base.packages, ...layout?.packages },
  };
}
