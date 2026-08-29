import { describe, expect, test } from "bun:test";

import { z } from "zod";

describe("web env schemas", () => {
  test("server schema requires Notifique keys and defaults base URL", () => {
    const serverSchema = z.object({
      NOTIFIQUE_API_KEY: z.string().min(1),
      NOTIFIQUE_NEWSLETTER_LIST_ID: z.string().trim().min(1),
    });

    expect(() =>
      serverSchema.parse({
        NOTIFIQUE_API_KEY: undefined,
        NOTIFIQUE_NEWSLETTER_LIST_ID: "list_1",
      }),
    ).toThrow();

    const parsed = serverSchema.parse({
      NOTIFIQUE_API_KEY: "sk_test",
      NOTIFIQUE_NEWSLETTER_LIST_ID: " list_1 ",
    });

    expect(parsed.NOTIFIQUE_NEWSLETTER_LIST_ID).toBe("list_1");
  });

  test("client schema treats public keys as optional", () => {
    const clientSchema = z.object({
      NEXT_PUBLIC_CONVEX_URL: z.url().optional(),
      NEXT_PUBLIC_HIMETRICA_API_KEY: z.string().min(1).optional(),
    });

    expect(clientSchema.parse({})).toEqual({});
    expect(
      clientSchema.parse({
        NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
        NEXT_PUBLIC_HIMETRICA_API_KEY: "hm_test",
      }),
    ).toEqual({
      NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
      NEXT_PUBLIC_HIMETRICA_API_KEY: "hm_test",
    });
  });
});
