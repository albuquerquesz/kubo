import { Result } from "better-result";
import { $ } from "execa";
import pc from "picocolors";

import { navigableMultiselect, navigableSelect } from "../../prompts/navigable";
import { navigableGroup } from "../../prompts/navigable-group";
import type { AddonOptions, ProjectConfig } from "../../types";
import { isSilent } from "../../utils/context";
import { AddonSetupError, UserCancelledError } from "../../utils/errors";
import { shouldSkipExternalCommands } from "../../utils/external-commands";
import { readKubojsConfig } from "../../utils/kubojs-config";
import { getPackageRunnerPrefix } from "../../utils/package-runner";
import { cliLog, createSpinner } from "../../utils/terminal-output";

type SkillSource = {
  label: string;
};

type AgentOption = {
  value: SkillAgent;
  label: string;
};

type SkillsOptions = NonNullable<AddonOptions["skills"]>;
type SkillAgent = NonNullable<SkillsOptions["agents"]>[number];
type InstallScope = NonNullable<SkillsOptions["scope"]>;

// Skill sources - using GitHub shorthand or full URLs
const SKILL_SOURCES = {
  "vercel-labs/agent-skills": {
    label: "Vercel Agent Skills",
  },
  "vercel/ai": {
    label: "Vercel AI SDK",
  },
  "vercel/turborepo": {
    label: "Turborepo",
  },
  "yusukebe/hono-skill": {
    label: "Hono Backend",
  },
  "vercel-labs/next-skills": {
    label: "Next.js Best Practices",
  },
  "nuxt/ui": {
    label: "Nuxt UI",
  },
  "heroui-inc/heroui": {
    label: "HeroUI Native",
  },
  "shadcn/ui": {
    label: "shadcn/ui",
  },
  "better-auth/skills": {
    label: "Better Auth",
  },
  "clerk/skills": {
    label: "Clerk",
  },
  "neondatabase/agent-skills": {
    label: "Neon Database",
  },
  "supabase/agent-skills": {
    label: "Supabase",
  },
  "planetscale/database-skills": {
    label: "PlanetScale",
  },
  "expo/skills": {
    label: "Expo",
  },
  "prisma/skills": {
    label: "Prisma",
  },
  "elysiajs/skills": {
    label: "ElysiaJS",
  },
  "waynesutton/convexskills": {
    label: "Convex",
  },
  "msmps/opentui-skill": {
    label: "OpenTUI Platform",
  },
  "haydenbleasel/ultracite": {
    label: "Ultracite",
  },
  "https://www.evlog.dev": {
    label: "evlog",
  },
} satisfies Record<string, SkillSource>;

type SourceKey = keyof typeof SKILL_SOURCES;

// All available agents from add-skill CLI
const AVAILABLE_AGENTS: AgentOption[] = [
  { value: "cursor", label: "Cursor" },
  { value: "claude-code", label: "Claude Code" },
  { value: "cline", label: "Cline" },
  { value: "github-copilot", label: "GitHub Copilot" },
  { value: "codex", label: "Codex" },
  { value: "opencode", label: "OpenCode" },
  { value: "windsurf", label: "Windsurf" },
  { value: "goose", label: "Goose" },
  { value: "roo", label: "Roo Code" },
  { value: "kilo", label: "Kilo Code" },
  { value: "gemini-cli", label: "Gemini CLI" },
  { value: "antigravity", label: "Antigravity" },
  { value: "openhands", label: "OpenHands" },
  { value: "trae", label: "Trae" },
  { value: "amp", label: "Amp" },
  { value: "pi", label: "Pi" },
  { value: "qoder", label: "Qoder" },
  { value: "qwen-code", label: "Qwen Code" },
  { value: "kiro-cli", label: "Kiro CLI" },
  { value: "droid", label: "Droid" },
  { value: "command-code", label: "Command Code" },
  { value: "clawdbot", label: "Clawdbot" },
  { value: "zencoder", label: "Zencoder" },
  { value: "neovate", label: "Neovate" },
  { value: "mcpjam", label: "MCPJam" },
];

const DEFAULT_SCOPE: InstallScope = "project";
const DEFAULT_AGENTS: SkillAgent[] = ["cursor", "claude-code", "github-copilot"];

function hasReactBasedFrontend(frontend: ProjectConfig["frontend"]): boolean {
  return (
    frontend.includes("react-router") ||
    frontend.includes("tanstack-router") ||
    frontend.includes("tanstack-start") ||
    frontend.includes("next")
  );
}

function hasNativeFrontend(frontend: ProjectConfig["frontend"]): boolean {
  return (
    frontend.includes("native-bare") ||
    frontend.includes("native-uniwind") ||
    frontend.includes("native-unistyles")
  );
}

type RecommendationRule = {
  when: (config: ProjectConfig) => boolean;
  sources: readonly SourceKey[];
};

const RECOMMENDED_SOURCE_RULES = {
  reactBasedFrontend: {
    when: ({ frontend }) => hasReactBasedFrontend(frontend),
    sources: ["vercel-labs/agent-skills", "shadcn/ui"],
  },
  vercelDeployment: {
    when: ({ webDeploy, serverDeploy }) => webDeploy === "vercel" || serverDeploy === "vercel",
    sources: ["vercel-labs/agent-skills"],
  },
  nextFrontend: {
    when: ({ frontend }) => frontend.includes("next"),
    sources: ["vercel-labs/next-skills"],
  },
  nuxtFrontend: {
    when: ({ frontend }) => frontend.includes("nuxt"),
    sources: ["nuxt/ui"],
  },
  nativeUniwindFrontend: {
    when: ({ frontend }) => frontend.includes("native-uniwind"),
    sources: ["heroui-inc/heroui"],
  },
  nativeFrontend: {
    when: ({ frontend }) => hasNativeFrontend(frontend),
    sources: ["expo/skills"],
  },
  betterAuth: {
    when: ({ auth }) => auth === "better-auth",
    sources: ["better-auth/skills"],
  },
  clerk: {
    when: ({ auth }) => auth === "clerk",
    sources: ["clerk/skills"],
  },
  neonDatabase: {
    when: ({ dbSetup }) => dbSetup === "neon",
    sources: ["neondatabase/agent-skills"],
  },
  supabaseDatabase: {
    when: ({ dbSetup }) => dbSetup === "supabase",
    sources: ["supabase/agent-skills"],
  },
  planetscaleDatabase: {
    when: ({ dbSetup }) => dbSetup === "planetscale",
    sources: ["planetscale/database-skills"],
  },
  prismaDatabase: {
    when: ({ orm, dbSetup }) => orm === "prisma" || dbSetup === "prisma-postgres",
    sources: ["prisma/skills"],
  },
  aiExample: {
    when: ({ examples }) => examples.includes("ai"),
    sources: ["vercel/ai"],
  },
  turborepoAddon: {
    when: ({ addons }) => addons.includes("turborepo"),
    sources: ["vercel/turborepo"],
  },
  honoBackend: {
    when: ({ backend }) => backend === "hono",
    sources: ["yusukebe/hono-skill"],
  },
  elysiaBackend: {
    when: ({ backend }) => backend === "elysia",
    sources: ["elysiajs/skills"],
  },
  convexBackend: {
    when: ({ backend }) => backend === "convex",
    sources: ["waynesutton/convexskills"],
  },
  opentuiAddon: {
    when: ({ addons }) => addons.includes("opentui"),
    sources: ["msmps/opentui-skill"],
  },
} satisfies Record<string, RecommendationRule>;

function getRecommendedSourceKeys(config: ProjectConfig): SourceKey[] {
  const sources = Object.values(RECOMMENDED_SOURCE_RULES).flatMap(({ when, sources }) =>
    when(config) ? sources : [],
  );

  return uniqueValues(sources);
}

const CURATED_SKILLS_BY_SOURCE: Record<SourceKey, (config: ProjectConfig) => string[]> = {
  "vercel-labs/agent-skills": (config) => {
    const skills: string[] = [];
    if (hasReactBasedFrontend(config.frontend)) {
      skills.push(
        "web-design-guidelines",
        "vercel-composition-patterns",
        "vercel-react-best-practices",
      );
    }
    if (hasNativeFrontend(config.frontend)) {
      skills.push("vercel-react-native-skills");
    }
    if (config.webDeploy === "vercel" || config.serverDeploy === "vercel") {
      skills.push("deploy-to-vercel");
    }
    return skills;
  },
  "vercel/ai": () => ["ai-sdk"],
  "vercel/turborepo": () => ["turborepo"],
  "yusukebe/hono-skill": () => ["hono"],
  "vercel-labs/next-skills": () => ["next-best-practices", "next-cache-components"],
  "nuxt/ui": () => ["nuxt-ui"],
  "heroui-inc/heroui": () => ["heroui-native"],
  "shadcn/ui": () => ["shadcn"],
  "better-auth/skills": () => ["better-auth-best-practices"],
  "clerk/skills": (config) => {
    const skills = [
      "clerk",
      "clerk-setup",
      "clerk-custom-ui",
      "clerk-webhooks",
      "clerk-testing",
      "clerk-orgs",
    ];

    if (config.frontend.includes("next")) {
      skills.push("clerk-nextjs-patterns");
    }

    return skills;
  },
  "neondatabase/agent-skills": () => ["neon-postgres"],
  "supabase/agent-skills": () => ["supabase-postgres-best-practices"],
  "planetscale/database-skills": (config) => {
    if (config.dbSetup !== "planetscale") {
      return [];
    }

    if (config.database === "postgres") {
      return ["postgres", "neki"];
    }

    if (config.database === "mysql") {
      return ["mysql", "vitess"];
    }

    return [];
  },
  "expo/skills": (config) => {
    const skills = [
      "expo-dev-client",
      "building-native-ui",
      "native-data-fetching",
      "expo-deployment",
      "expo-cicd-workflows",
    ];
    if (config.frontend.includes("native-uniwind")) {
      skills.push("expo-tailwind-setup");
    }
    return skills;
  },
  "prisma/skills": (config) => {
    const skills: string[] = [];

    if (config.orm === "prisma") {
      skills.push("prisma-cli", "prisma-client-api", "prisma-database-setup");
    }

    if (config.dbSetup === "prisma-postgres") {
      skills.push("prisma-postgres");
    }

    return skills;
  },
  "elysiajs/skills": () => ["elysiajs"],
  "waynesutton/convexskills": () => [
    "convex-best-practices",
    "convex-functions",
    "convex-schema-validator",
    "convex-realtime",
    "convex-http-actions",
    "convex-cron-jobs",
    "convex-file-storage",
    "convex-migrations",
    "convex-security-check",
  ],
  "msmps/opentui-skill": () => ["opentui"],
  "haydenbleasel/ultracite": () => ["ultracite"],
  "https://www.evlog.dev": () => ["review-logging-patterns", "analyze-logs"],
};

function getCuratedSkillNamesForSourceKey(sourceKey: SourceKey, config: ProjectConfig): string[] {
  return CURATED_SKILLS_BY_SOURCE[sourceKey](config);
}

function uniqueValues<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

export async function setupSkills(
  config: ProjectConfig,
): Promise<Result<void, AddonSetupError | UserCancelledError>> {
  if (shouldSkipExternalCommands()) {
    return Result.ok(undefined);
  }

  const { packageManager, projectDir } = config;

  // Load full config from kubojs.jsonrc to get all addons (existing + new)
  const kubojsConfig = await readKubojsConfig(projectDir);
  const fullConfig: ProjectConfig = kubojsConfig
    ? {
        ...config,
        addons: kubojsConfig.addons ?? config.addons,
        addonOptions: kubojsConfig.addonOptions ?? config.addonOptions,
      }
    : config;

  const recommendedSourceKeys = getRecommendedSourceKeys(fullConfig);
  const skillsOptions = fullConfig.addonOptions?.skills;
  const configuredSourceKeys = uniqueValues(
    (skillsOptions?.selections ?? []).map((selection) => selection.source),
  );
  const sourceKeys = uniqueValues([...recommendedSourceKeys, ...configuredSourceKeys]);

  if (sourceKeys.length === 0) {
    return Result.ok(undefined);
  }

  const skillOptions = sourceKeys.flatMap((sourceKey) => {
    const source = SKILL_SOURCES[sourceKey];
    const skillNames = getCuratedSkillNamesForSourceKey(sourceKey, fullConfig);
    return skillNames.map((skillName) => ({
      value: `${sourceKey}::${skillName}`,
      label: skillName,
      hint: source.label,
    }));
  });

  if (skillOptions.length === 0) {
    return Result.ok(undefined);
  }

  const configuredScope = skillsOptions?.scope;
  const configuredSelections = skillsOptions?.selections;
  const configuredAgents = skillsOptions?.agents;
  const allSkillValues = skillOptions.map((opt) => opt.value);

  let scope: InstallScope;
  let selectedSkills: string[];
  let selectedAgents: SkillAgent[];

  if (isSilent()) {
    scope = configuredScope ?? DEFAULT_SCOPE;
    selectedSkills =
      configuredSelections !== undefined
        ? configuredSelections.flatMap((selection) =>
            selection.skills.map((skill) => `${selection.source}::${skill}`),
          )
        : allSkillValues;
    if (selectedSkills.length === 0) return Result.ok(undefined);
    selectedAgents = configuredAgents ? [...configuredAgents] : [...DEFAULT_AGENTS];
    if (selectedAgents.length === 0) return Result.ok(undefined);
  } else {
    const results = await navigableGroup<{
      scope: InstallScope;
      skills: string[];
      agents: SkillAgent[];
    }>({
      scope: async () => {
        if (configuredScope !== undefined) return configuredScope;
        return navigableSelect<InstallScope>({
          message: "Where should skills be installed?",
          options: [
            {
              value: "project",
              label: "Project",
              hint: "Writes to project config files (recommended for teams)",
            },
            {
              value: "global",
              label: "Global",
              hint: "Writes to user-level config files (personal machine)",
            },
          ],
          initialValue: DEFAULT_SCOPE,
        });
      },
      skills: async () => {
        if (configuredSelections !== undefined) {
          return configuredSelections.flatMap((selection) =>
            selection.skills.map((skill) => `${selection.source}::${skill}`),
          );
        }
        return navigableMultiselect<string>({
          message: "Select skills to install",
          options: skillOptions,
          required: false,
          initialValues: allSkillValues,
        });
      },
      agents: async ({ results: r }) => {
        const pickedSkills = r.skills as string[] | undefined;
        if (pickedSkills !== undefined && pickedSkills.length === 0) return [];
        if (configuredAgents !== undefined) return [...configuredAgents];
        return navigableMultiselect<SkillAgent>({
          message: "Select agents to install skills to",
          options: AVAILABLE_AGENTS,
          required: false,
          initialValues: [...DEFAULT_AGENTS],
        });
      },
    });

    if (
      results.scope === undefined ||
      results.skills === undefined ||
      results.agents === undefined
    ) {
      return Result.err(new UserCancelledError({ message: "Operation cancelled" }));
    }

    scope = results.scope;
    selectedSkills = results.skills as string[];
    selectedAgents = results.agents as SkillAgent[];

    if (selectedSkills.length === 0 || selectedAgents.length === 0) {
      return Result.ok(undefined);
    }
  }

  // Group skills by source
  const skillsBySource: Record<string, string[]> = {};
  for (const skillKey of selectedSkills) {
    const [source, skillName] = skillKey.split("::");
    if (!skillsBySource[source]) {
      skillsBySource[source] = [];
    }
    skillsBySource[source].push(skillName);
  }

  const installSpinner = createSpinner();
  installSpinner.start("Installing skills...");

  const runner = getPackageRunnerPrefix(packageManager);
  const globalFlags = scope === "global" ? ["-g"] : [];

  // Install skills grouped by source (project scope, no -g flag)
  for (const [source, skills] of Object.entries(skillsBySource)) {
    const installResult = await Result.tryPromise({
      try: async () => {
        const args = [
          ...runner,
          "skills@latest",
          "add",
          source,
          ...globalFlags,
          "--skill",
          ...skills,
          "--agent",
          ...selectedAgents,
          "-y",
        ];
        await $({ cwd: projectDir, env: { CI: "true" } })`${args}`;
      },
      catch: (e) =>
        new AddonSetupError({
          addon: "skills",
          message: `Failed to install skills from ${source}: ${e instanceof Error ? e.message : String(e)}`,
          cause: e,
        }),
    });

    if (installResult.isErr()) {
      cliLog.warn(pc.yellow(`Warning: Could not install skills from ${source}`));
    }
  }

  installSpinner.stop("Skills installed");

  return Result.ok(undefined);
}
