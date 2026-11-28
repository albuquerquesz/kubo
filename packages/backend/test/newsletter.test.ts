import { describe, expect, it } from "bun:test";

import {
  bearerMatches,
  normalizeNewsletterEmail,
  parseReleaseNotice,
  planSubscription,
  releaseNoticeToEmail,
  renderUnsubscribePage,
} from "../shared/newsletter";

describe("normalizeNewsletterEmail", () => {
  it("trims and lowercases so the same address maps to one subscriber", () => {
    expect(normalizeNewsletterEmail("  Dev@Kubojs.DEV ")).toBe("dev@kubojs.dev");
  });

  it("rejects non-strings, malformed and oversized addresses", () => {
    expect(normalizeNewsletterEmail(undefined)).toBeNull();
    expect(normalizeNewsletterEmail("not-an-email")).toBeNull();
    expect(normalizeNewsletterEmail("a b@c.dev")).toBeNull();
    expect(normalizeNewsletterEmail(`${"a".repeat(250)}@x.dev`)).toBeNull();
  });
});

describe("planSubscription", () => {
  it("inserts new emails, resubscribes opted-out ones and ignores active ones", () => {
    expect(planSubscription(null)).toBe("insert");
    expect(planSubscription({ status: "unsubscribed" })).toBe("resubscribe");
    expect(planSubscription({ status: "subscribed" })).toBe("noop");
  });
});

describe("parseReleaseNotice", () => {
  it("accepts a semver and trims notes", () => {
    expect(parseReleaseNotice({ version: " 1.2.3 ", notes: "  CLI novo  " })).toEqual({
      version: "1.2.3",
      notes: "CLI novo",
    });
  });

  it("rejects a missing version, a tag prefix and a non-object", () => {
    expect(parseReleaseNotice({ notes: "oi" })).toBeNull();
    expect(parseReleaseNotice({ version: "v1.2.3", notes: "" })).toBeNull();
    expect(parseReleaseNotice(null)).toBeNull();
  });
});

describe("bearerMatches", () => {
  it("matches only the exact bearer token", () => {
    expect(bearerMatches("Bearer secreto", "secreto")).toBe(true);
    expect(bearerMatches("Bearer secreto", "segredo")).toBe(false);
    expect(bearerMatches("secreto", "secreto")).toBe(false);
    expect(bearerMatches("Bearer ", "secreto")).toBe(false);
  });
});

describe("releaseNoticeToEmail", () => {
  it("builds one CLI change and a fallback when notes are empty", () => {
    const email = releaseNoticeToEmail({ version: "1.2.3", notes: "", releasedOn: "27 nov 2026" });
    expect(email.intro).toBe("O create-kubojs 1.2.3 está no npm.");
    expect(email.changes).toEqual([
      {
        category: "CLI",
        title: "create-kubojs 1.2.3",
        description: "Publicado no npm.",
      },
    ]);
    expect(email.releaseUrl).toBe("https://github.com/albuquerquesz/kubo/releases/tag/v1.2.3");
    expect(email.npmUrl).toBe("https://www.npmjs.com/package/create-kubojs/v/1.2.3");
  });
});

describe("renderUnsubscribePage", () => {
  it("only the confirm state renders a POST form", () => {
    expect(renderUnsubscribePage("confirm")).toContain('<form method="post">');
    expect(renderUnsubscribePage("done")).not.toContain("<form");
    expect(renderUnsubscribePage("invalid")).toContain("Link inválido");
  });
});
