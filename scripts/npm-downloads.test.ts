import { describe, expect, test } from "bun:test";

import {
  formatHelp,
  formatHumanReport,
  getAllTimeDownloads,
  parseArguments,
} from "./npm-downloads";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("npm download reporting", () => {
  test("aggregates all-time downloads across non-overlapping API chunks", async () => {
    const urls: string[] = [];
    const fetchImpl = async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input);
      urls.push(url);

      if (url.includes("registry.npmjs.org")) {
        return jsonResponse({ time: { created: "2024-01-31T12:00:00.000Z" } });
      }

      if (url.includes("2024-01-31:2025-07-30")) {
        return jsonResponse({
          start: "2024-01-31",
          end: "2025-07-30",
          package: "create-kubojs",
          downloads: [{ day: "2024-01-31", downloads: 2 }],
        });
      }

      return jsonResponse({
        start: "2025-07-31",
        end: "2025-08-02",
        package: "create-kubojs",
        downloads: [{ day: "2025-07-31", downloads: 3 }],
      });
    };

    const report = await getAllTimeDownloads({
      fetchImpl,
      sleep: async () => {},
      today: "2025-08-02",
    });

    expect(report).toEqual({
      packageName: "create-kubojs",
      start: "2024-01-31",
      end: "2025-08-02",
      totalDownloads: 5,
      chunks: 2,
    });
    expect(urls).toHaveLength(3);
    expect(urls[1]).toContain("2024-01-31:2025-07-30");
    expect(urls[2]).toContain("2025-07-31:2025-08-02");
  });

  test("retries transient npm failures", async () => {
    let attempts = 0;
    const fetchImpl = async (input: RequestInfo | URL): Promise<Response> => {
      attempts++;
      if (attempts < 3) {
        return jsonResponse({ error: "temporarily unavailable" }, 503);
      }

      if (attempts === 3) {
        return jsonResponse({ time: { created: "2026-01-01T00:00:00.000Z" } });
      }

      expect(String(input)).toContain("api.npmjs.org/downloads/range");
      return jsonResponse({ downloads: [] });
    };

    const reportPromise = getAllTimeDownloads({
      fetchImpl,
      sleep: async () => {},
      today: "2026-01-01",
    });

    await expect(reportPromise).resolves.toMatchObject({ totalDownloads: 0, chunks: 1 });
    expect(attempts).toBe(4);
  });

  test("supports human and JSON-oriented CLI arguments", () => {
    expect(parseArguments([])).toEqual({ json: false, help: false });
    expect(parseArguments(["--json"])).toEqual({ json: true, help: false });
    expect(parseArguments(["--help"])).toEqual({ json: false, help: true });
    expect(() => parseArguments(["--from=2026-01-01"])).toThrow("Unknown argument");

    expect(
      formatHumanReport({
        packageName: "create-kubojs",
        start: "2026-01-01",
        end: "2026-01-31",
        totalDownloads: 1234,
        chunks: 1,
      }),
    ).toContain("1,234 downloads");
    expect(formatHelp()).toContain("bun run downloads [--json]");
  });
});
