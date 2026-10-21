import { describe, expect, test } from "bun:test";
import { existsSync, statSync } from "node:fs";

import { ICON_BASE_URL, TECH_OPTIONS } from "../src/lib/constant";

describe("stack builder technology icons", () => {
  test("keeps technology icons local and available", () => {
    const icons = new Set(
      Object.values(TECH_OPTIONS)
        .flat()
        .map((option) => option.icon)
        .filter((icon) => icon.startsWith("/icon/")),
    );

    expect(ICON_BASE_URL).toBe("/icon");
    expect(icons.size).toBeGreaterThan(30);

    for (const icon of icons) {
      const path = `public${icon}`;
      expect(existsSync(path)).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(0);
    }
  });

  test("does not reference the unavailable remote icon host", () => {
    const remoteIcons = Object.values(TECH_OPTIONS)
      .flat()
      .map((option) => option.icon)
      .filter((icon) => icon.startsWith("https://r2.kubojs.dev"));

    expect(remoteIcons).toEqual([]);
  });

  test("no longer offers GetMonitor and has no default observability option", () => {
    expect(TECH_OPTIONS.observability.map((option) => option.id)).toEqual(["himetrica"]);
    expect(TECH_OPTIONS.observability.some((option) => option.default)).toBe(false);
  });

  test("uses the AraraHQ favicon only for the AraraHQ option", () => {
    const arara = TECH_OPTIONS.communication.find((option) => option.id === "arara");

    expect(arara?.icon).toBe("https://ararahq.com/favicon.svg");
  });

  test("features AraraHQ as the default communication provider", () => {
    const arara = TECH_OPTIONS.communication.find((option) => option.id === "arara");
    const resend = TECH_OPTIONS.communication.find((option) => option.id === "resend");

    expect(TECH_OPTIONS.communication[0]?.id).toBe("arara");
    expect(arara?.default).toBe(true);
    expect(resend?.default).toBeUndefined();
    expect(arara?.name).toBe("AraraHQ");
    expect(arara?.description.toLowerCase()).toContain("whatsapp");
  });
});
