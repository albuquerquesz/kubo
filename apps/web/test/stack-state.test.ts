import { describe, expect, test } from "bun:test";

import {
  API_VALUES,
  ADDONS_VALUES,
  AUTH_VALUES,
  BACKEND_VALUES,
  COMMUNICATION_VALUES,
  DATABASE_SETUP_VALUES,
  DATABASE_VALUES,
  EXAMPLES_VALUES,
  FRONTEND_VALUES,
  isNativeFrontend,
  isWebFrontend,
  OBSERVABILITY_VALUES,
  ORM_VALUES,
  PACKAGE_MANAGER_VALUES,
  PAYMENTS_VALUES,
  ProjectConfigDraftSchema,
  ProjectConfigSchema,
  RUNTIME_VALUES,
  SERVER_DEPLOY_VALUES,
  TESTING_VALUES,
  WEB_DEPLOY_VALUES,
  SELF_HOSTED_FRONTENDS,
} from "@kubojs/types";

import { DEFAULT_STACK, TECH_OPTIONS } from "../src/lib/constant";
import { sanitizeStackState } from "../src/lib/sanitize-stack-addons";
import { stackStateToProjectConfig } from "../src/lib/stack-state";
import { loadStackParams } from "../src/lib/stack-url-state";
import { generateStackCommand, generateStackUrlFromState } from "../src/lib/stack-utils";

const catalogValues = {
  api: API_VALUES,
  addons: ADDONS_VALUES,
  backend: BACKEND_VALUES,
  runtime: RUNTIME_VALUES,
  database: DATABASE_VALUES,
  orm: ORM_VALUES,
  dbSetup: DATABASE_SETUP_VALUES,
  auth: AUTH_VALUES,
  payments: PAYMENTS_VALUES,
  observability: OBSERVABILITY_VALUES,
  communication: COMMUNICATION_VALUES,
  packageManager: PACKAGE_MANAGER_VALUES,
  examples: EXAMPLES_VALUES,
  testing: TESTING_VALUES,
  webDeploy: WEB_DEPLOY_VALUES,
  serverDeploy: SERVER_DEPLOY_VALUES,
} as const;

describe("canonical stack state", () => {
  test("exposes every canonical catalog value in the builder category", () => {
    for (const [category, values] of Object.entries(catalogValues)) {
      const optionIds = TECH_OPTIONS[category as keyof typeof TECH_OPTIONS].map(
        (option) => option.id,
      );
      for (const value of values) {
        expect(optionIds).toContain(value);
      }
    }

    const webOptionIds = TECH_OPTIONS.webFrontend.map((option) => option.id);
    const nativeOptionIds = TECH_OPTIONS.nativeFrontend.map((option) => option.id);
    for (const frontend of FRONTEND_VALUES) {
      if (frontend === "none" || isWebFrontend(frontend)) {
        expect(webOptionIds).toContain(frontend);
      }
      if (frontend === "none" || isNativeFrontend(frontend)) {
        expect(nativeOptionIds).toContain(frontend);
      }
    }
  });

  test("normalizes a builder state into a ProjectConfig accepted by the schema", () => {
    const stack = sanitizeStackState({
      ...DEFAULT_STACK,
      backend: "self",
      frontend: ["next"],
      git: false,
      install: false,
    });

    expect(ProjectConfigDraftSchema.safeParse(stack).success).toBe(true);
    expect(ProjectConfigSchema.safeParse(stackStateToProjectConfig(stack)).success).toBe(true);
    const { yolo: _yolo, ...draft } = stack;
    expect(generateStackCommand(draft)).toContain("--backend self");
  });

  test("migrates legacy fullstack, split frontends, and string booleans at the boundary", () => {
    const migrated = sanitizeStackState({
      projectName: "legacy-app",
      backend: "self-next",
      webFrontend: ["next"],
      nativeFrontend: ["none"],
      git: "false",
      install: "true",
    });

    expect(migrated).toMatchObject({
      projectName: "legacy-app",
      backend: "self",
      frontend: ["next"],
      git: false,
      install: true,
    });
    expect(migrated).not.toHaveProperty("webFrontend");
    expect(migrated).not.toHaveProperty("nativeFrontend");
  });

  test("loads legacy URL keys through the same migration boundary", async () => {
    const loaded = await loadStackParams(
      Object.fromEntries(
        new URLSearchParams("name=legacy-url&be=self-next&fe-w=next&fe-n=none&git=false&i=true"),
      ),
    );

    expect(loaded).toMatchObject({
      projectName: "legacy-url",
      backend: "self",
      frontend: ["next"],
      git: false,
      install: true,
    });
  });

  test("round-trips canonical state through the sharing URL", async () => {
    const original = sanitizeStackState({
      ...DEFAULT_STACK,
      projectName: "round-trip",
      backend: "self",
      frontend: ["next"],
      api: "orpc",
      git: false,
      install: false,
      yolo: true,
    });
    const url = generateStackUrlFromState(original, "https://example.test");
    const parsedUrl = new URL(url);
    const loaded = await loadStackParams(Object.fromEntries(parsedUrl.searchParams));

    expect(parsedUrl.searchParams.get("be")).toBe("self");
    expect(parsedUrl.searchParams.get("fe")).toBe("next");
    expect(parsedUrl.searchParams.has("fe-w")).toBe(false);
    expect(parsedUrl.searchParams.has("fe-n")).toBe(false);
    expect(loaded).toMatchObject({
      projectName: "round-trip",
      backend: "self",
      frontend: ["next"],
      api: "orpc",
      git: false,
      install: false,
      yolo: true,
    });
  });

  test("serializes self fullstack directly for each supported frontend", () => {
    for (const frontend of SELF_HOSTED_FRONTENDS) {
      const command = generateStackCommand(
        sanitizeStackState({ ...DEFAULT_STACK, backend: "self", frontend: [frontend] }),
      );

      expect(command).toContain(`--backend self`);
      expect(command).toContain(`--frontend ${frontend}`);
      expect(command).not.toContain("self-");
    }
  });
});
