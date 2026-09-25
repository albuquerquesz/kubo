import type { z } from "zod";

import type {
  DatabaseSchema,
  ORMSchema,
  BackendSchema,
  RuntimeSchema,
  FrontendSchema,
  AddonsSchema,
  ExamplesSchema,
  TestingSchema,
  PackageManagerSchema,
  DatabaseSetupSchema,
  APISchema,
  AuthSchema,
  PaymentProviderSchema,
  PaymentsSchema,
  ObservabilityProviderSchema,
  ObservabilitySchema,
  CommunicationSchema,
  WebDeploySchema,
  ServerDeploySchema,
  DirectoryConflictSchema,
  TemplateSchema,
  AddonOptionsSchema,
  DbSetupOptionsSchema,
  ProjectNameSchema,
  CreateInputSchema,
  AddInputSchema,
  CLIInputSchema,
  ProjectConfigSchema,
  ProjectConfigDraftSchema,
  KubojsConfigSchema,
  KuboConfigSchema,
  KuboConfigFileSchema,
  LayoutConfigSchema,
  LayoutPresetSchema,
  LayoutAppIdSchema,
  LayoutPackageIdSchema,
  InitResultSchema,
} from "./schemas";

export type Database = z.infer<typeof DatabaseSchema>;
export type ORM = z.infer<typeof ORMSchema>;
export type Backend = z.infer<typeof BackendSchema>;
export type Runtime = z.infer<typeof RuntimeSchema>;
export type Frontend = z.infer<typeof FrontendSchema>;
export type Addons = z.infer<typeof AddonsSchema>;
export type Examples = z.infer<typeof ExamplesSchema>;
export type Testing = z.infer<typeof TestingSchema>;
export type PackageManager = z.infer<typeof PackageManagerSchema>;
export type DatabaseSetup = z.infer<typeof DatabaseSetupSchema>;
export type API = z.infer<typeof APISchema>;
export type Auth = z.infer<typeof AuthSchema>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
export type Payments = z.infer<typeof PaymentsSchema>;
export type ObservabilityProvider = z.infer<typeof ObservabilityProviderSchema>;
export type Observability = z.infer<typeof ObservabilitySchema>;
export type Communication = z.infer<typeof CommunicationSchema>;
export type WebDeploy = z.infer<typeof WebDeploySchema>;
export type ServerDeploy = z.infer<typeof ServerDeploySchema>;
export type DirectoryConflict = z.infer<typeof DirectoryConflictSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type AddonOptions = z.infer<typeof AddonOptionsSchema>;
export type DbSetupOptions = z.infer<typeof DbSetupOptionsSchema>;
export type ProjectName = z.infer<typeof ProjectNameSchema>;

export type CreateInput = z.infer<typeof CreateInputSchema>;
export type AddInput = z.infer<typeof AddInputSchema>;
export type CLIInput = z.infer<typeof CLIInputSchema>;
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type ProjectConfigDraft = z.infer<typeof ProjectConfigDraftSchema>;
export type KubojsConfig = z.infer<typeof KubojsConfigSchema>;
export type KuboConfig = z.infer<typeof KuboConfigSchema>;
export type LayoutConfig = z.infer<typeof LayoutConfigSchema>;
export type LayoutPreset = z.infer<typeof LayoutPresetSchema>;
export type LayoutAppId = z.infer<typeof LayoutAppIdSchema>;
export type LayoutPackageId = z.infer<typeof LayoutPackageIdSchema>;
export type InitResult = z.infer<typeof InitResultSchema>;

export interface ResolvedLayout {
  preset: LayoutPreset;
  apps: Record<LayoutAppId, string>;
  packages: Record<LayoutPackageId, string>;
  path(logical: LayoutAppId, kind: "app"): string;
  path(logical: LayoutPackageId, kind: "package"): string;
  file(logical: LayoutAppId, kind: "app", ...segments: string[]): string;
  file(logical: LayoutPackageId, kind: "package", ...segments: string[]): string;
  rootPackagePath(): string;
}

export type WebFrontend = Extract<
  Frontend,
  | "tanstack-router"
  | "react-router"
  | "tanstack-start"
  | "next"
  | "nuxt"
  | "svelte"
  | "solid"
  | "astro"
  | "none"
>;

export type DesktopWebFrontend = Exclude<WebFrontend, "none">;

export type NativeFrontend = Extract<
  Frontend,
  "native-bare" | "native-uniwind" | "native-unistyles" | "none"
>;
