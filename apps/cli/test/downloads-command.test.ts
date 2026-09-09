import { describe, expect, it, spyOn } from "bun:test";
import path from "node:path";

import { execa } from "execa";

import { runDownloadsCommand } from "../src/commands/downloads";

const CLI_ENTRYPOINT = path.join(import.meta.dir, "..", "src", "cli.ts");

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}

describe("downloads command", () => {
  it("is available through the CLI entrypoint with private help", async () => {
    const result = await execa("bun", [CLI_ENTRYPOINT, "downloads", "--help"], {
      reject: false,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: kubojs downloads [--json]");
    expect(result.stderr).toBe("");
  });

  it("returns a failure for unsupported private-command arguments", async () => {
    const result = await execa("bun", [CLI_ENTRYPOINT, "downloads", "--from=2026-01-01"], {
      reject: false,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Unknown argument: --from=2026-01-01");
  });

  it("prints the download report as JSON", async () => {
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    const fetchImpl = async (input: RequestInfo | URL): Promise<Response> => {
      if (String(input).includes("registry.npmjs.org")) {
        return jsonResponse({ time: { created: "2026-01-01T00:00:00.000Z" } });
      }

      return jsonResponse({ downloads: [{ day: "2026-01-01", downloads: 7 }] });
    };

    try {
      await runDownloadsCommand(["--json"], {
        fetchImpl,
        sleep: async () => {},
        today: "2026-01-01",
      });
    } finally {
      logSpy.mockRestore();
    }

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(logSpy.mock.calls[0]?.[0]))).toMatchObject({
      packageName: "create-kubojs",
      totalDownloads: 7,
    });
  });
});
