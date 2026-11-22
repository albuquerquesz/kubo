import { describe, expect, test } from "bun:test";

import { validateProjectName } from "../src/app/(home)/new/_components/utils";

describe("builder project name validation", () => {
  test("accepts regular names, nested paths and the current directory", () => {
    for (const name of ["my-kubo-app", "my_app.v2", "apps/my-app", "@scope/app", "."]) {
      expect(validateProjectName(name)).toBeUndefined();
    }
  });

  test("rejects names that break the generated shell command", () => {
    for (const name of [
      "My-App!!",
      "my app",
      "app$HOME",
      "a&b",
      "a;b",
      "(app)",
      "a'b",
      "a`b`",
      "a\\b",
    ]) {
      expect(validateProjectName(name)).toContain("terminal");
    }
  });

  test("keeps the existing rules", () => {
    expect(validateProjectName("")).toContain("vazio");
    expect(validateProjectName("-app")).toContain("começar");
    expect(validateProjectName("a:b")).toContain("inválidos");
    expect(validateProjectName("node_modules")).toContain("reservado");
  });
});
