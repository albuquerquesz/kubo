import { describe, expect, it } from "bun:test";
import path from "node:path";

import {
  evaluate,
  normalizeCompatibility,
  type CompatibilityIssueCode,
  type ProjectConfig,
} from "@kubojs/types";

import { generate } from "../src/generator";
import { EMBEDDED_TEMPLATES } from "../src/templates.generated";
import type { VirtualNode } from "../src/types";

type Draft = Parameters<typeof normalizeCompatibility>[0];

function buildConfig(overrides: Partial<Draft>): ProjectConfig {
  const draft: Draft = {
    projectName: "chat",
    frontend: ["next"],
    backend: "self",
    runtime: "none",
    database: "none",
    orm: "none",
    api: "none",
    auth: "none",
    payments: [],
    observability: [],
    communication: [],
    addons: ["turborepo"],
    examples: ["chatbot"],
    testing: [],
    git: false,
    packageManager: "bun",
    install: false,
    dbSetup: "none",
    webDeploy: "none",
    serverDeploy: "none",
    ...overrides,
  };
  const { config } = normalizeCompatibility(draft);
  return { ...config, projectDir: "/virtual", relativePath: "chat" };
}

function listFiles(node: VirtualNode, prefix: string, out: Map<string, string>): void {
  if (node.type === "file") {
    out.set(prefix, node.content);
    return;
  }
  for (const child of node.children)
    listFiles(child, prefix ? `${prefix}/${child.name}` : child.name, out);
}

async function generateFiles(config: ProjectConfig): Promise<Map<string, string>> {
  const result = await generate({ config, templates: EMBEDDED_TEMPLATES });
  if (result.isErr()) throw result.error;
  const files = new Map<string, string>();
  for (const child of result.value.root.children) listFiles(child, child.name, files);
  return files;
}

const SPECIFIER = /\bfrom\s+["'](\.{1,2}\/[^"']+)["']/g;

/** Relative imports in the chatbot files that do not point at a generated file. */
function unresolvedImports(files: Map<string, string>): string[] {
  const unresolved: string[] = [];
  for (const [file, content] of files) {
    if (!/\/(chatbot|copilotkit)\b/.test(file) || !/\.tsx?$/.test(file)) continue;
    for (const match of content.matchAll(SPECIFIER)) {
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1]!));
      const candidates = [target, `${target}.ts`, `${target}.tsx`, `${target}/index.ts`];
      if (!candidates.some((candidate) => files.has(candidate))) {
        unresolved.push(`${file} -> ${match[1]}`);
      }
    }
  }
  return unresolved;
}

const SHARED_FILES = [
  "apps/web/src/components/chatbot/chatbot-app.tsx",
  "apps/web/src/components/chatbot/chat-thread.tsx",
  "apps/web/src/components/chatbot/conversation-sidebar.tsx",
  "apps/web/src/components/chatbot/css-icons.tsx",
  "apps/web/src/components/chatbot/kubo-cta.tsx",
  "apps/web/src/components/chatbot/chatbot.css",
  "apps/web/src/components/chatbot/beautiful-ui/LICENSE",
  "apps/web/src/components/chatbot/beautiful-ui/prompt-bar.tsx",
  "apps/web/src/components/chatbot/beautiful-ui/thinking-state.tsx",
  "apps/web/src/components/chatbot/beautiful-ui/streaming-text.tsx",
  "apps/web/src/components/chatbot/beautiful-ui/tool-chips.tsx",
  "apps/web/src/components/chatbot/beautiful-ui/approval-card.tsx",
  "apps/web/src/lib/chatbot/runtime.ts",
];

const FRAMEWORK_FILES = {
  next: [
    "apps/web/src/app/chatbot/page.tsx",
    "apps/web/src/app/api/copilotkit/[[...slug]]/route.ts",
  ],
  "tanstack-start": ["apps/web/src/routes/chatbot.tsx", "apps/web/src/routes/api/copilotkit/$.ts"],
} as const;

const REJECTED: [string, Partial<Draft>, CompatibilityIssueCode][] = [
  ["svelte", { frontend: ["svelte"] }, "example-chatbot-frontend"],
  ["nuxt", { frontend: ["nuxt"] }, "example-chatbot-frontend"],
  ["native", { frontend: ["next", "native-uniwind"] }, "example-chatbot-frontend"],
  [
    "separate backend",
    { backend: "hono", frontend: ["tanstack-router"] },
    "example-chatbot-backend",
  ],
  ["convex", { backend: "convex" }, "example-chatbot-backend"],
  ["the ai example", { examples: ["chatbot", "ai"] }, "example-chatbot-ai"],
];

describe("chatbot example", () => {
  for (const frontend of ["next", "tanstack-start"] as const) {
    it(`generates a working chatbot for ${frontend} fullstack`, async () => {
      const config = buildConfig({ frontend: [frontend] });
      expect(config.examples).toEqual(["chatbot"]);
      const files = await generateFiles(config);

      for (const file of [...SHARED_FILES, ...FRAMEWORK_FILES[frontend]]) {
        expect(files.has(file)).toBe(true);
      }
      expect(unresolvedImports(files)).toEqual([]);

      const pkg = JSON.parse(files.get("apps/web/package.json")!);
      expect(pkg.dependencies["@copilotkit/react-core"]).toBe("1.90.0");
      expect(pkg.dependencies["@copilotkit/runtime"]).toBe("1.90.0");
      expect(pkg.dependencies.streamdown).toBeDefined();
      expect(pkg.dependencies.zod).toBeDefined();

      expect(files.get("apps/web/.env")).toContain("GOOGLE_GENERATIVE_AI_API_KEY=");
      expect(files.get("apps/web/.env")).toContain("CHATBOT_MODEL=google/gemini-2.5-flash");
      expect(files.get("apps/web/src/index.css")).toContain("./components/chatbot/chatbot.css");
      expect(files.get("apps/web/src/components/header.tsx")).toContain('to: "/chatbot"');
      expect(files.get("README.md")).toContain("## Chatbot Example");

      const cta = files.get("apps/web/src/components/chatbot/kubo-cta.tsx")!;
      expect(cta).toContain("https://kubojs.dev/?utm_source=kubo-template&utm_medium=chatbot");
      expect(files.get("apps/web/src/components/chatbot/beautiful-ui/LICENSE")).toContain(
        "MIT License",
      );
    });
  }

  it("protects the page and the runtime route with Better Auth", async () => {
    const files = await generateFiles(
      buildConfig({ auth: "better-auth", database: "sqlite", orm: "drizzle" }),
    );
    expect(files.get("apps/web/src/app/chatbot/page.tsx")).toContain('redirect("/login")');
    expect(files.get("apps/web/src/app/api/copilotkit/[[...slug]]/route.ts")).toContain(
      "status: 401",
    );
    expect(unresolvedImports(files)).toEqual([]);
  });

  it("does not ship chatbot files when the example is not selected", async () => {
    const files = await generateFiles(buildConfig({ examples: [] }));
    expect([...files.keys()].some((file) => file.includes("/chatbot"))).toBe(false);
    expect(files.get("apps/web/src/index.css")).not.toContain("chatbot");
  });

  it.each(REJECTED)("rejects chatbot with %s", (_label, overrides, code) => {
    const codes = evaluate({
      backend: "self",
      frontend: ["next"],
      examples: ["chatbot"],
      ...overrides,
    }).issues.map((issue) => issue.code);
    expect(codes).toContain(code);
    // Normalization drops the unsupported chatbot instead of generating a broken app.
    expect(buildConfig({ ...overrides }).examples).not.toContain("chatbot");
  });
});
