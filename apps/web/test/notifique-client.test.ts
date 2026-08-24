import { afterEach, beforeEach, describe, expect, test } from "bun:test";

describe("Notifique client", () => {
  const originalApiKey = process.env.NOTIFIQUE_API_KEY;
  const originalBaseUrl = process.env.NOTIFIQUE_BASE_URL;
  const originalListId = process.env.NOTIFIQUE_NEWSLETTER_LIST_ID;
  const originalSkip = process.env.SKIP_ENV_VALIDATION;

  beforeEach(() => {
    delete process.env.SKIP_ENV_VALIDATION;
    process.env.NOTIFIQUE_API_KEY = "sk_test_123";
    process.env.NOTIFIQUE_NEWSLETTER_LIST_ID = "list_test";
    process.env.NOTIFIQUE_BASE_URL = "https://api.notifique.dev";
  });

  afterEach(async () => {
    process.env.NOTIFIQUE_API_KEY = originalApiKey;
    process.env.NOTIFIQUE_BASE_URL = originalBaseUrl;
    process.env.NOTIFIQUE_NEWSLETTER_LIST_ID = originalListId;
    process.env.SKIP_ENV_VALIDATION = originalSkip;
    const { resetNotifiqueClient } = await import("../src/lib/notifique/client");
    resetNotifiqueClient();
  });

  test("returns a cached SDK instance", async () => {
    const { getNotifiqueClient, resetNotifiqueClient, Notifique } =
      await import("../src/lib/notifique/client");
    resetNotifiqueClient();

    const first = getNotifiqueClient();
    const second = getNotifiqueClient();

    expect(first).toBeInstanceOf(Notifique);
    expect(second).toBe(first);
  });
});
