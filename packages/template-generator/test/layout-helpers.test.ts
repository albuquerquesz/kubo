import { describe, expect, it } from "bun:test";

import { processTemplateString } from "../src/core/template-processor";
import type { ProjectConfig } from "../src/types";

function render(template: string, layout?: ProjectConfig["layout"]): string {
  return processTemplateString(template, { layout } as ProjectConfig);
}

describe("layout Handlebars helpers", () => {
  it("renders standard paths identical to the old hardcoded ones", () => {
    expect(render(`{{layoutRelative "app:web" "app:server" ".env"}}`)).toBe(
      "../../apps/server/.env",
    );
    expect(render(`{{layoutRelative "package:infra" "package:db" "src/migrations"}}`)).toBe(
      "../../packages/db/src/migrations",
    );
    expect(render(`{{layoutRelative "package:db" "app:server" ".env"}}`)).toBe(
      "../../apps/server/.env",
    );
    expect(render(`{{layoutRelative "app:web" "package:ui" "src/*"}}`)).toBe(
      "../../packages/ui/src/*",
    );
    expect(render(`{{layoutPath "package:db"}}`)).toBe("packages/db");
    expect(render(`{{layoutPath "app:web" "src/index.ts"}}`)).toBe("apps/web/src/index.ts");
  });

  it("follows custom layouts", () => {
    const layout = { preset: "libs", apps: { web: "web" } } as const;
    expect(render(`{{layoutRelative "app:web" "package:ui" "src/*"}}`, layout)).toBe(
      "../libs/ui/src/*",
    );
    expect(render(`{{layoutPath "package:env"}}`, layout)).toBe("libs/env");
  });

  it("resolves from inside nested blocks", () => {
    const config = { layout: { preset: "libs" }, frontend: ["next"] } as unknown as ProjectConfig;
    expect(
      processTemplateString(`{{#each frontend}}{{layoutPath "package:ui"}}{{/each}}`, config),
    ).toBe("libs/ui");
  });

  it("throws on unknown refs", () => {
    expect(() => render(`{{layoutPath "app:mobile"}}`)).toThrow("Unknown layout ref");
  });
});

describe("migrated templates render the standard paths", () => {
  const standard = {
    projectName: "x",
    frontend: ["next"],
    addons: [],
    backend: "hono",
    runtime: "bun",
    database: "sqlite",
    orm: "drizzle",
    webDeploy: "cloudflare",
    serverDeploy: "cloudflare",
  } as unknown as ProjectConfig;

  async function renderTemplate(file: string): Promise<string> {
    const source = await Bun.file(new URL(`../templates/${file}`, import.meta.url)).text();
    return processTemplateString(source, standard);
  }

  it("ui globals.css points @source at the apps dir relative to the stylesheet", async () => {
    // Tailwind resolves @source from the CSS file (packages/ui/src/styles), so the
    // apps dir is four levels up. The old hardcoded "../../../apps" pointed at packages/apps.
    const css = await renderTemplate("packages/ui/src/styles/globals.css.hbs");
    expect(css.split("\n").slice(0, 5).join("\n")).toContain(
      '@source "../../../../apps/**/*.{ts,tsx}";',
    );
  });

  it("infra alchemy.run.ts keeps the standard relative paths", async () => {
    const lines = (await renderTemplate("packages/infra/alchemy.run.ts.hbs"))
      .split("\n")
      .filter((line) => /\.\.\/|cwd:|migrationsDir|config\(\{ path/.test(line));
    expect(lines.join("\n")).toContain('config({ path: "../../apps/web/.env" });');
    expect(lines.join("\n")).not.toContain("&#x");
    expect(
      lines
        .filter((line) => line.includes("cwd:"))
        .every((line) => /"\.\.\/\.\.\/apps\/(web|server)"/.test(line)),
    ).toBe(true);
  });
});
