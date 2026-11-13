import { describe, expect, it } from "bun:test";

import golden from "./fixtures/layout-golden.standard.json";
import { buildGoldenConfigs, snapshotConfig, type GoldenEntry } from "./support/layout-golden";

// Regenerate after an intentional template change:
//   bun -e 'import {snapshotMatrix} from "./test/support/layout-golden";
//     await Bun.write("test/fixtures/layout-golden.standard.json",
//       JSON.stringify(await snapshotMatrix(), null, 1) + "\n")'
const expected = golden as GoldenEntry[];

describe("standard layout golden output", () => {
  const configs = buildGoldenConfigs();

  it("covers the same stack matrix as the fixture", () => {
    expect(configs.length).toBe(expected.length);
  });

  it("generates byte-identical files for the standard layout", async () => {
    for (const [index, config] of configs.entries()) {
      const implicit = await snapshotConfig(config);
      const explicit = await snapshotConfig(config, { version: 1, preset: "standard" });
      expect(implicit).toEqual(expected[index]!);
      expect(explicit).toEqual(expected[index]!);
    }
  }, 120_000);
});
