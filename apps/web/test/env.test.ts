import { describe, expect, test } from "bun:test";

import { z } from "zod";

describe("web env schemas", () => {
  test("server schema requires Resend API key and sender", () => {
    const serverSchema = z.object({
      RESEND_API_KEY: z.string().min(1),
      EMAIL_FROM: z.string().min(1),
    });

    expect(() =>
      serverSchema.parse({ RESEND_API_KEY: undefined, EMAIL_FROM: "Kubo <noreply@kubojs.dev>" }),
    ).toThrow();

    expect(
      serverSchema.parse({ RESEND_API_KEY: "re_test", EMAIL_FROM: "Kubo <noreply@kubojs.dev>" }),
    ).toEqual({ RESEND_API_KEY: "re_test", EMAIL_FROM: "Kubo <noreply@kubojs.dev>" });
  });

  test("client schema requires Convex URLs and treats analytics keys as optional", () => {
    const clientSchema = z.object({
      NEXT_PUBLIC_CONVEX_URL: z.url(),
      NEXT_PUBLIC_CONVEX_SITE_URL: z.url(),
      NEXT_PUBLIC_HIMETRICA_API_KEY: z.string().min(1).optional(),
    });

    expect(() => clientSchema.parse({})).toThrow();
    expect(
      clientSchema.parse({
        NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
        NEXT_PUBLIC_CONVEX_SITE_URL: "https://example.convex.site",
        NEXT_PUBLIC_HIMETRICA_API_KEY: "hm_test",
      }),
    ).toEqual({
      NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
      NEXT_PUBLIC_CONVEX_SITE_URL: "https://example.convex.site",
      NEXT_PUBLIC_HIMETRICA_API_KEY: "hm_test",
    });
  });
});
