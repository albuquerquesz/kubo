import { describe, expect, it } from "bun:test";

import {
  encodeLayoutCode,
  formatLayoutCode,
  hashLayoutCode,
  isLayoutCodeStale,
  normalizeLayoutCode,
} from "../shared/layout-code";

describe("layout codes", () => {
  it("encodes 12 Crockford base32 characters and formats them in groups", () => {
    const code = encodeLayoutCode(new Uint8Array(Array.from({ length: 16 }, (_, i) => i * 7)));
    expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{12}$/);
    expect(formatLayoutCode(code)).toMatch(/^.{4}-.{4}-.{4}$/);
  });

  it("normalizes what a person types", () => {
    expect(normalizeLayoutCode(" abcd-efgh-jkmn ")).toBe("ABCDEFGHJKMN");
    expect(normalizeLayoutCode("O1L1-ABCD-EFGH")).toBe("0111ABCDEFGH");
  });

  it("rejects malformed codes", () => {
    expect(normalizeLayoutCode("ABCD-EFGH")).toBeNull();
    expect(normalizeLayoutCode("ABCD-EFGH-JKMU")).toBeNull(); // U is not in the alphabet
    expect(normalizeLayoutCode(42)).toBeNull();
    expect(normalizeLayoutCode("A".repeat(100))).toBeNull();
  });

  it("hashes deterministically without exposing the code", async () => {
    const hash = await hashLayoutCode("ABCDEFGHJKMN");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(await hashLayoutCode("ABCDEFGHJKMN"));
    expect(hash).not.toContain("ABCD");
  });

  it("treats used or expired codes as stale", () => {
    const now = 1_000;
    expect(isLayoutCodeStale({ expiresAt: now + 1 }, now)).toBe(false);
    expect(isLayoutCodeStale({ expiresAt: now }, now)).toBe(false);
    expect(isLayoutCodeStale({ expiresAt: now - 1 }, now)).toBe(true);
    expect(isLayoutCodeStale({ expiresAt: now + 1, usedAt: now - 5 }, now)).toBe(true);
  });
});
