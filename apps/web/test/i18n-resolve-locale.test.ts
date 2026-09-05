import { describe, expect, test } from "bun:test";

import { localeCookieMaxAge } from "../src/i18n/config";
import { formatMessage } from "../src/i18n/format-message";
import { getDictionary } from "../src/i18n/get-dictionary";
import {
  localeForPathname,
  localeFromAcceptLanguage,
  resolveLocale,
} from "../src/i18n/resolve-locale";

describe("localeFromAcceptLanguage", () => {
  test("maps Portuguese primary tags to pt-BR", () => {
    expect(localeFromAcceptLanguage("pt")).toBe("pt-BR");
    expect(localeFromAcceptLanguage("pt-BR")).toBe("pt-BR");
    expect(localeFromAcceptLanguage("pt-PT")).toBe("pt-BR");
    expect(localeFromAcceptLanguage("pt-br;q=0.9")).toBe("pt-BR");
    expect(localeFromAcceptLanguage("pt-PT;q=0.8,en;q=0.9")).toBe("pt-BR");
  });

  test("maps non-Portuguese (and missing) headers to en-US", () => {
    expect(localeFromAcceptLanguage(null)).toBe("en-US");
    expect(localeFromAcceptLanguage(undefined)).toBe("en-US");
    expect(localeFromAcceptLanguage("")).toBe("en-US");
    expect(localeFromAcceptLanguage("en-US")).toBe("en-US");
    expect(localeFromAcceptLanguage("fr")).toBe("en-US");
    expect(localeFromAcceptLanguage("en-US,en;q=0.9")).toBe("en-US");
  });
});

describe("resolveLocale", () => {
  test("trusted request locale wins over cookie and Accept-Language", () => {
    expect(
      resolveLocale({
        requestLocale: "en-US",
        cookie: "pt-BR",
        acceptLanguage: "pt-BR,pt;q=0.9",
      }),
    ).toBe("en-US");
  });

  test("valid cookie wins over Accept-Language", () => {
    expect(
      resolveLocale({
        cookie: "en-US",
        acceptLanguage: "pt-BR,pt;q=0.9",
      }),
    ).toBe("en-US");

    expect(
      resolveLocale({
        cookie: "pt-BR",
        acceptLanguage: "en-US",
      }),
    ).toBe("pt-BR");
  });

  test("invalid cookie falls back to Accept-Language", () => {
    expect(
      resolveLocale({
        cookie: "fr-FR",
        acceptLanguage: "pt",
      }),
    ).toBe("pt-BR");
  });
});

describe("localeForPathname", () => {
  test("uses the current browser language on the localized homepage", () => {
    expect(localeForPathname("/", "pt-BR,pt;q=0.9")).toBe("pt-BR");
    expect(localeForPathname("/", "en-US,en;q=0.9")).toBe("en-US");
  });

  test("keeps untranslated routes in Portuguese", () => {
    expect(localeForPathname("/new", "en-US,en;q=0.9")).toBe("pt-BR");
    expect(localeForPathname("/stack", "en-US,en;q=0.9")).toBe("pt-BR");
    expect(localeForPathname("/analytics", "en-US,en;q=0.9")).toBe("pt-BR");
    expect(localeForPathname("/docs", "en-US,en;q=0.9")).toBe("pt-BR");
  });

  test("stores the detected homepage locale for 24 hours", () => {
    expect(localeCookieMaxAge).toBe(60 * 60 * 24);
  });
});

describe("dictionaries", () => {
  test("pt-BR and en-US share the same top-level and nested keys", () => {
    const en = getDictionary("en-US");
    const pt = getDictionary("pt-BR");

    expect(Object.keys(pt).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(pt.hero).sort()).toEqual(Object.keys(en.hero).sort());
    expect(Object.keys(pt.footer).sort()).toEqual(Object.keys(en.footer).sort());
    expect(Object.keys(pt.panels.stackBuilder).sort()).toEqual(
      Object.keys(en.panels.stackBuilder).sort(),
    );
    expect(pt.panels.features).toHaveLength(en.panels.features.length);
  });

  test("formatMessage interpolates placeholders", () => {
    expect(formatMessage("Copy command: {command}", { command: "bun create kubojs@latest" })).toBe(
      "Copy command: bun create kubojs@latest",
    );
    expect(formatMessage("Community dispatch {n}.", { n: "01" })).toBe("Community dispatch 01.");
  });
});
