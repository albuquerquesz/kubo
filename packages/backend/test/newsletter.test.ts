import { describe, expect, it } from "bun:test";

import {
  normalizeNewsletterEmail,
  planSubscription,
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

describe("renderUnsubscribePage", () => {
  it("only the confirm state renders a POST form", () => {
    expect(renderUnsubscribePage("confirm")).toContain('<form method="post">');
    expect(renderUnsubscribePage("done")).not.toContain("<form");
    expect(renderUnsubscribePage("invalid")).toContain("Link inválido");
  });
});
