import { describe, expect, test } from "bun:test";

import { builderStepHref } from "../src/lib/builder-steps";

describe("builder step links", () => {
  test("keeps the stack query when moving between steps", () => {
    expect(builderStepHref("preview", "?name=app&be=hono")).toBe("/new/preview?name=app&be=hono");
    expect(builderStepHref("stack", "name=app")).toBe("/new?name=app");
  });

  test("drops the legacy view key", () => {
    expect(builderStepHref("preview", "?view=layout&name=app")).toBe("/new/preview?name=app");
    expect(builderStepHref("stack", "?view=preview")).toBe("/new");
  });
});
