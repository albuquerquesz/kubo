import { z } from "zod";

import { describeLayoutPathIssue, getLayoutPathIssue } from "./layout-path";

export const DatabaseSchema = z
  .enum(["none", "sqlite", "postgres", "mysql", "mongodb"])
  .describe("Database type");

export const ORMSchema = z.enum(["drizzle", "prisma", "mongoose", "none"]).describe("ORM type");

export const BackendSchema = z
  .enum(["hono", "express", "fastify", "elysia", "nestjs", "convex", "self", "none"])
  .describe("Backend framework");

export const RuntimeSchema = z
  .enum(["bun", "node", "workers", "none"])
  .describe("Runtime environment");

export const FrontendSchema = z
  .enum([
    "tanstack-router",
    "react-router",
    "tanstack-start",
    "next",
    "nuxt",
    "native-bare",
    "native-uniwind",
    "native-unistyles",
    "svelte",
    "solid",
    "astro",
    "none",
  ])
  .describe("Frontend framework");

export const AddonsSchema = z
  .enum([
    "pwa",
    "tauri",
    "electrobun",
    "biome",
    "lefthook",
    "husky",
    "mcp",
    "turborepo",
    "vite-plus",
    "oxlint",
    "opentui",
    "skills",
    "s3-storage",
    "none",
  ])
  .describe("Additional addons");

const AddonsListSchema = z.array(AddonsSchema).superRefine((addons, ctx) => {
  const taskRunners = addons.filter((addon) => ["turborepo", "vite-plus"].includes(addon));
  if (taskRunners.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "`turborepo` and `vite-plus` cannot be used together",
    });
  }
});

export const ExamplesSchema = z
  .enum(["todo", "ai", "none"])
  .describe("Example templates to include");

export const TestingSchema = z.enum(["vitest", "playwright", "none"]).describe("Testing tools");

export const PackageManagerSchema = z.enum(["npm", "pnpm", "bun"]).describe("Package manager");

export const DatabaseSetupSchema = z
  .enum([
    "turso",
    "neon",
    "prisma-postgres",
    "planetscale",
    "mongodb-atlas",
    "supabase",
    "d1",
    "docker",
    "none",
  ])
  .describe("Database hosting setup");

export const APISchema = z.enum(["trpc", "orpc", "orval", "none"]).describe("API type");

export const AuthSchema = z
  .enum(["better-auth", "clerk", "none"])
  .describe("Authentication provider");

export const PaymentProviderSchema = z.enum(["abacatepay", "stripe"]);

function selectedProvidersSchema<T extends z.ZodTypeAny>(
  providerSchema: T,
  uniqueMessage: string,
  options?: { treatUndefinedAsEmpty?: boolean },
) {
  const treatUndefinedAsEmpty = options?.treatUndefinedAsEmpty ?? false;
  return z.preprocess(
    (value) => {
      if (value === "none" || (treatUndefinedAsEmpty && value === undefined)) return [];
      if (typeof value === "string") return [value];
      if (Array.isArray(value)) return value.filter((item) => item !== "none");
      return value;
    },
    z.array(providerSchema).superRefine((providers, ctx) => {
      if (new Set(providers).size !== providers.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: uniqueMessage,
        });
      }
    }),
  );
}

export const PaymentsSchema = selectedProvidersSchema(
  PaymentProviderSchema,
  "Payment providers must be unique",
  { treatUndefinedAsEmpty: true },
).describe("Selected payment providers");

export const ObservabilityProviderSchema = z.enum(["himetrica"]);

export const ObservabilitySchema = selectedProvidersSchema(
  ObservabilityProviderSchema,
  "Observability providers must be unique",
).describe("Selected observability providers");

export const CommunicationProviderSchema = z.enum(["arara", "resend", "notifique", "millionsend"]);

export const CommunicationSchema = selectedProvidersSchema(
  CommunicationProviderSchema,
  "Communication providers must be unique",
  { treatUndefinedAsEmpty: true },
).describe("Selected communication providers");

export const WebDeploySchema = z
  .enum(["cloudflare", "docker", "vercel", "railway", "guaracloud", "none"])
  .describe("Web deployment");

export const ServerDeploySchema = z
  .enum(["cloudflare", "docker", "vercel", "railway", "guaracloud", "none"])
  .describe("Server deployment");

export const DirectoryConflictSchema = z
  .enum(["merge", "overwrite", "increment", "error"])
  .describe("How to handle existing directory conflicts");

export const TemplateSchema = z
  .enum(["mern", "pern", "t3", "uniwind", "none"])
  .describe("Predefined project template");

export const TuiTemplateSchema = z.enum(["core", "react", "solid"]).describe("OpenTUI template");

export const InstallScopeSchema = z.enum(["project", "global"]).describe("Installation scope");

export const McpServerSchema = z
  .enum([
    "kubojs",
    "context7",
    "nx",
    "cloudflare-docs",
    "convex",
    "shadcn",
    "next-devtools",
    "nuxt-docs",
    "nuxt-ui-docs",
    "svelte-docs",
    "astro-docs",
    "planetscale",
    "neon",
    "supabase",
    "better-auth",
    "clerk",
    "expo",
    "polar",
  ])
  .describe("MCP server to install");

export const McpAgentSchema = z
  .enum([
    "antigravity",
    "cline",
    "cline-cli",
    "cursor",
    "claude-code",
    "codex",
    "opencode",
    "gemini-cli",
    "github-copilot-cli",
    "mcporter",
    "vscode",
    "zed",
    "claude-desktop",
    "goose",
  ])
  .describe("Agent target for MCP installation");

export const SkillsSourceSchema = z
  .enum([
    "vercel-labs/agent-skills",
    "vercel/ai",
    "vercel/turborepo",
    "yusukebe/hono-skill",
    "vercel-labs/next-skills",
    "nuxt/ui",
    "heroui-inc/heroui",
    "shadcn/ui",
    "better-auth/skills",
    "clerk/skills",
    "neondatabase/agent-skills",
    "supabase/agent-skills",
    "planetscale/database-skills",
    "expo/skills",
    "prisma/skills",
    "elysiajs/skills",
    "waynesutton/convexskills",
    "msmps/opentui-skill",
    "haydenbleasel/ultracite",
    "https://www.evlog.dev",
  ])
  .describe("Skill source repository");

export const SkillsAgentSchema = z
  .enum([
    "cursor",
    "claude-code",
    "cline",
    "github-copilot",
    "codex",
    "opencode",
    "windsurf",
    "goose",
    "roo",
    "kilo",
    "gemini-cli",
    "antigravity",
    "openhands",
    "trae",
    "amp",
    "pi",
    "qoder",
    "qwen-code",
    "kiro-cli",
    "droid",
    "command-code",
    "clawdbot",
    "zencoder",
    "neovate",
    "mcpjam",
  ])
  .describe("Agent target for skill installation");

export const SkillSelectionSchema = z.strictObject({
  source: SkillsSourceSchema.describe("Skill source to install from"),
  skills: z.array(z.string()).describe("Curated skill names to install from this source"),
});

export const DbSetupModeSchema = z.enum(["manual", "auto"]).describe("Database setup mode");

export const NeonSetupMethodSchema = z
  .enum(["neondb", "neonctl"])
  .describe("Neon database provisioning method");

export const AddonOptionsSchema = z
  .strictObject({
    opentui: z
      .strictObject({
        template: TuiTemplateSchema,
      })
      .optional()
      .describe("Options for the OpenTUI addon"),
    mcp: z
      .strictObject({
        scope: InstallScopeSchema.optional(),
        servers: z.array(McpServerSchema).optional().describe("MCP servers to install"),
        agents: z.array(McpAgentSchema).optional().describe("Agents to wire MCP servers into"),
      })
      .optional()
      .describe("Options for the MCP addon"),
    skills: z
      .strictObject({
        scope: InstallScopeSchema.optional(),
        agents: z.array(SkillsAgentSchema).optional().describe("Agents to install skills into"),
        selections: z.array(SkillSelectionSchema).optional().describe("Skills grouped by source"),
      })
      .optional()
      .describe("Options for the Skills addon"),
  })
  .describe("Addon-specific configuration");

export const DbSetupOptionsSchema = z
  .strictObject({
    mode: DbSetupModeSchema.optional().describe("How database setup should be executed"),
    neon: z
      .strictObject({
        method: NeonSetupMethodSchema.optional(),
        projectName: z.string().min(1).optional().describe("Neon project name"),
        regionId: z.string().min(1).optional().describe("Neon region identifier"),
      })
      .optional()
      .describe("Options for Neon setup"),
    prismaPostgres: z
      .strictObject({
        regionId: z.string().min(1).optional().describe("Prisma Postgres region identifier"),
      })
      .optional()
      .describe("Options for Prisma Postgres setup"),
    turso: z
      .strictObject({
        databaseName: z.string().min(1).optional().describe("Turso database name"),
        groupName: z.string().min(1).optional().describe("Turso database group name"),
        installCli: z
          .boolean()
          .optional()
          .describe("Whether the CLI may install the Turso CLI automatically"),
      })
      .optional()
      .describe("Options for Turso setup"),
  })
  .describe("Database setup configuration");

export const LAYOUT_PRESET_IDS = ["standard", "libs"] as const;

export const LayoutPresetSchema = z
  .enum(LAYOUT_PRESET_IDS)
  .describe("Official layout preset: the default convention directories");

/** Presets accepted for backward compatibility; expanded to an official preset + overrides. */
export const LegacyLayoutPresetSchema = z
  .literal("server-separated")
  .describe("Deprecated: equivalent to standard with apps.web = apps/client");

export const LayoutAppIdSchema = z.enum(["web", "server", "native", "desktop", "docs", "api"]);

/** Core package ids. Integration packages (catalog providers) use any slug id. */
export const LayoutPackageIdSchema = z.enum([
  "db",
  "auth",
  "backend",
  "config",
  "env",
  "infra",
  "ui",
  "storage",
  "api",
  "payments",
  "email",
]);

export const LayoutPackageKeySchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "Package id must be a lowercase slug")
  .describe("Logical package id (core id or catalog integration id)");

function layoutPathSchema(allowRoot: boolean) {
  return z.string().superRefine((value, ctx) => {
    const issue = getLayoutPathIssue(value, { allowRoot });
    if (issue) ctx.addIssue({ code: "custom", message: describeLayoutPathIssue(issue) });
  });
}

export const LayoutRelativePathSchema = layoutPathSchema(false).describe(
  "Project-relative directory path (POSIX, no .. segments)",
);

export const LayoutDirSchema = layoutPathSchema(true).describe(
  "Project-relative convention directory; '.' means the project root",
);

const LayoutDirsSchema = z
  .object({
    apps: LayoutDirSchema,
    packages: LayoutDirSchema,
  })
  .partial()
  .strict()
  .describe("Convention directories that hold apps and packages");

const LayoutAppsSchema = z
  .object({
    web: LayoutRelativePathSchema,
    server: LayoutRelativePathSchema,
    native: LayoutRelativePathSchema,
    desktop: LayoutRelativePathSchema,
    docs: LayoutRelativePathSchema,
    api: LayoutRelativePathSchema,
  })
  .partial()
  .strict()
  .describe("Per-app path overrides");

const LayoutPackagesSchema = z
  .record(LayoutPackageKeySchema, LayoutRelativePathSchema)
  .describe("Per-package path overrides");

/** npm scope for the generated workspace packages, e.g. `@acme` → `@acme/ui`. */
export const LayoutScopeSchema = z
  .string()
  .max(64, "Package scope must be at most 64 characters")
  .regex(
    /^@[a-z0-9][a-z0-9._-]*$/,
    "Package scope must look like @acme (lowercase letters, digits, '.', '_' or '-')",
  )
  .describe("npm scope of the workspace packages; defaults to @<projectName>");

export const LayoutConfigSchema = z
  .object({
    version: z.literal(1).optional().describe("Layout contract version"),
    preset: z.union([LayoutPresetSchema, LegacyLayoutPresetSchema]).default("standard"),
    dirs: LayoutDirsSchema.optional(),
    apps: LayoutAppsSchema.optional(),
    packages: LayoutPackagesSchema.optional(),
    scope: LayoutScopeSchema.optional(),
  })
  .strict()
  .describe("Declarative project folder layout: convention directories plus overrides");

export const ProjectNameSchema = z
  .string()
  .min(1, "Project name cannot be empty")
  .max(255, "Project name must be less than 255 characters")
  .refine(
    (name) => name === "." || !name.startsWith("."),
    "Project name cannot start with a dot (except for '.')",
  )
  .refine((name) => name === "." || !name.startsWith("-"), "Project name cannot start with a dash")
  .refine((name) => {
    const invalidChars = ["<", ">", ":", '"', "|", "?", "*"];
    return !invalidChars.some((char) => name.includes(char));
  }, "Project name contains invalid characters")
  .refine((name) => name.toLowerCase() !== "node_modules", "Project name is reserved")
  .describe("Project name or path");

export const CreateInputSchema = z
  .object({
    projectName: z.string().optional(),
    template: TemplateSchema.optional(),
    yes: z.boolean().optional(),
    yolo: z.boolean().optional(),
    dryRun: z.boolean().optional(),
    verbose: z.boolean().optional(),
    addonOptions: AddonOptionsSchema.optional(),
    dbSetupOptions: DbSetupOptionsSchema.optional(),
    database: DatabaseSchema.optional(),
    orm: ORMSchema.optional(),
    auth: AuthSchema.optional(),
    payments: PaymentsSchema.optional(),
    observability: ObservabilitySchema.optional(),
    disableObservability: z.boolean().optional(),
    communication: CommunicationSchema.optional(),
    frontend: z.array(FrontendSchema).optional(),
    addons: AddonsListSchema.optional(),
    examples: z.array(ExamplesSchema).optional(),
    testing: z.array(TestingSchema).optional(),
    git: z.boolean().optional(),
    packageManager: PackageManagerSchema.optional(),
    install: z.boolean().optional(),
    dbSetup: DatabaseSetupSchema.optional(),
    backend: BackendSchema.optional(),
    runtime: RuntimeSchema.optional(),
    api: APISchema.optional(),
    webDeploy: WebDeploySchema.optional(),
    serverDeploy: ServerDeploySchema.optional(),
    directoryConflict: DirectoryConflictSchema.optional(),
    renderTitle: z.boolean().optional(),
    disableAnalytics: z.boolean().optional(),
    manualDb: z.boolean().optional(),
    layout: LayoutConfigSchema.optional().describe(
      "Project folder layout (preset, convention dirs and per-app/package overrides)",
    ),
    layoutCode: z
      .string()
      .max(64)
      .optional()
      .describe("Single-use code from kubojs.dev that applies the layout saved in the account"),
  })
  .strict()
  .refine((input) => !(input.manualDb !== undefined && input.dbSetupOptions?.mode !== undefined), {
    message: "`manualDb` and `dbSetupOptions.mode` are mutually exclusive",
    path: ["dbSetupOptions", "mode"],
  });

export const AddInputSchema = z
  .object({
    addons: AddonsListSchema.optional(),
    testing: z.array(TestingSchema).optional(),
    addonOptions: AddonOptionsSchema.optional(),
    webDeploy: WebDeploySchema.optional(),
    serverDeploy: ServerDeploySchema.optional(),
    projectDir: z.string().optional(),
    install: z.boolean().optional(),
    packageManager: PackageManagerSchema.optional(),
    dryRun: z.boolean().optional(),
  })
  .strict();

export const CLIInputSchema = CreateInputSchema.safeExtend({
  projectDirectory: z.string().optional(),
}).strict();

export const ProjectConfigSchema = z.object({
  projectName: z.string(),
  projectDir: z.string(),
  relativePath: z.string(),
  layout: LayoutConfigSchema.optional(),
  addonOptions: AddonOptionsSchema.optional(),
  dbSetupOptions: DbSetupOptionsSchema.optional(),
  database: DatabaseSchema,
  orm: ORMSchema,
  backend: BackendSchema,
  runtime: RuntimeSchema,
  frontend: z.array(FrontendSchema),
  addons: AddonsListSchema,
  examples: z.array(ExamplesSchema),
  testing: z.array(TestingSchema),
  auth: AuthSchema,
  payments: PaymentsSchema,
  observability: ObservabilitySchema,
  communication: CommunicationSchema,
  git: z.boolean(),
  packageManager: PackageManagerSchema,
  install: z.boolean(),
  dbSetup: DatabaseSetupSchema,
  api: APISchema,
  webDeploy: WebDeploySchema,
  serverDeploy: ServerDeploySchema,
});

export const ProjectConfigDraftSchema = ProjectConfigSchema.omit({
  projectDir: true,
  relativePath: true,
});

const KuboStackConfigSchema = z.object({
  version: z.string().describe("CLI version used to create this project"),
  createdAt: z.string().describe("Timestamp when the project was created"),
  reproducibleCommand: z.string().optional().describe("Command to reproduce this project setup"),
  addonOptions: AddonOptionsSchema.optional(),
  dbSetupOptions: DbSetupOptionsSchema.optional(),
  database: DatabaseSchema,
  orm: ORMSchema,
  backend: BackendSchema,
  runtime: RuntimeSchema,
  frontend: z.array(FrontendSchema),
  addons: AddonsListSchema,
  examples: z.array(ExamplesSchema),
  testing: z.array(TestingSchema),
  auth: AuthSchema,
  payments: PaymentsSchema,
  observability: ObservabilitySchema,
  communication: CommunicationSchema,
  packageManager: PackageManagerSchema,
  dbSetup: DatabaseSetupSchema,
  api: APISchema,
  webDeploy: WebDeploySchema,
  serverDeploy: ServerDeploySchema,
});

/** @deprecated Prefer {@link KuboConfigSchema} and `kubo.config.ts`. */
export const KubojsConfigSchema = KuboStackConfigSchema;

export const KuboConfigSchema = KuboStackConfigSchema.extend({
  layout: LayoutConfigSchema.optional(),
});

export const KubojsConfigFileSchema = z
  .object({
    $schema: z.string().optional().describe("JSON Schema reference for validation"),
  })
  .extend(KubojsConfigSchema.shape)
  .strict()
  .meta({
    id: "https://r2.kubojs.dev/schema.json",
    title: "kubojs Configuration",
    description: "Legacy kubojs.jsonrc configuration (prefer kubo.config.ts)",
  });

export const KuboConfigFileSchema = KuboConfigSchema.strict().meta({
  id: "https://r2.kubojs.dev/kubo-config.schema.json",
  title: "Kubo project configuration",
  description: "Configuration exported from kubo.config.ts",
});

export const InitResultSchema = z.object({
  success: z.boolean(),
  projectConfig: ProjectConfigSchema,
  reproducibleCommand: z.string(),
  timeScaffolded: z.string(),
  elapsedTimeMs: z.number(),
  projectDirectory: z.string(),
  relativePath: z.string(),
  error: z.string().optional(),
});

export const DATABASE_VALUES = DatabaseSchema.options;
export const ORM_VALUES = ORMSchema.options;
export const BACKEND_VALUES = BackendSchema.options;
export const RUNTIME_VALUES = RuntimeSchema.options;
export const FRONTEND_VALUES = FrontendSchema.options;
export const ADDONS_VALUES = AddonsSchema.options;
export const EXAMPLES_VALUES = ExamplesSchema.options;
export const TESTING_VALUES = TestingSchema.options;
export const PACKAGE_MANAGER_VALUES = PackageManagerSchema.options;
export const DATABASE_SETUP_VALUES = DatabaseSetupSchema.options;
export const API_VALUES = APISchema.options;
export const AUTH_VALUES = AuthSchema.options;
export const PAYMENTS_VALUES = PaymentProviderSchema.options;
export const OBSERVABILITY_VALUES = ObservabilityProviderSchema.options;
export const COMMUNICATION_VALUES = CommunicationProviderSchema.options;
export const WEB_DEPLOY_VALUES = WebDeploySchema.options;
export const SERVER_DEPLOY_VALUES = ServerDeploySchema.options;
export const DIRECTORY_CONFLICT_VALUES = DirectoryConflictSchema.options;
export const TEMPLATE_VALUES = TemplateSchema.options;
