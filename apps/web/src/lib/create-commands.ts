/**
 * Canonical bare create-command display strings (no project name / flags).
 * Shared by hero install card, command section, and other marketing surfaces.
 */

export type PackageManager = "bun" | "pnpm" | "npm";

export const PACKAGE_MANAGERS = ["bun", "pnpm", "npm"] as const satisfies readonly PackageManager[];

export const CREATE_COMMANDS: Record<PackageManager, string> = {
  bun: "bun create kubots@latest",
  pnpm: "pnpm create kubots@latest",
  npm: "npx create-kubots@latest",
};

export const DEFAULT_PACKAGE_MANAGER: PackageManager = "bun";

export function getCreateCommand(manager: PackageManager = DEFAULT_PACKAGE_MANAGER): string {
  return CREATE_COMMANDS[manager];
}
