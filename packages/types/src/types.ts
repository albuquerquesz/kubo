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
  KubojsConfigSchema,
  InitResultSchema,
} from "./schemas";

// Inferred types from Zod schemas
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
export type KubojsConfig = z.infer<typeof KubojsConfigSchema>;
export type InitResult = z.infer<typeof InitResultSchema>;

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

export function isNativeFrontend(frontend: string): boolean {
  return (
    frontend === "native-bare" || frontend === "native-uniwind" || frontend === "native-unistyles"
  );
}
