import { describe, expect, it } from "bun:test";

import { getPackageExecutionArgs } from "../src/utils/package-runner";

describe("package runner", () => {
  it("preserves argument boundaries for Windows-compatible provider commands", () => {
    expect(
      getPackageExecutionArgs("bun", [
        "neonctl@latest",
        "projects",
        "create",
        "--name",
        "my Windows app",
        "--region-id",
        "aws-us-east-1",
      ]),
    ).toEqual([
      "bunx",
      "neonctl@latest",
      "projects",
      "create",
      "--name",
      "my Windows app",
      "--region-id",
      "aws-us-east-1",
    ]);
  });

  it("continues to support the string command form", () => {
    expect(getPackageExecutionArgs("npm", 'neon-new@latest --ref "sbA3tIe"')).toEqual([
      "npx",
      "neon-new@latest",
      "--ref",
      "sbA3tIe",
    ]);
  });
});
