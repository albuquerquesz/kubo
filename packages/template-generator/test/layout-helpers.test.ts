import { describe, expect, it } from "bun:test";

import { processTemplateString } from "../src/core/template-processor";
import type { ProjectConfig } from "../src/types";

function render(template: string, layout?: ProjectConfig["layout"]): string {
  return processTemplateString(template, { layout } as ProjectConfig);
}

describe("layout Handlebars helpers", () => {
  it("renders standard paths identical to the old hardcoded ones", () => {
    expect(render(`{{layoutRelative "app:web" "app:server" ".env"}}`)).toBe("../server/.env");
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
