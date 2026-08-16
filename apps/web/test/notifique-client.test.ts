import { afterEach, describe, expect, mock, test } from "bun:test";

import {
  createNotifiqueClient,
  NotifiqueConfigurationError,
  NotifiqueError,
} from "../src/lib/notifique/client";

const originalFetch = globalThis.fetch;

function mockResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Notifique client", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("subscribes an email using the documented forms payload", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        mockResponse({
          success: true,
          data: { status: "PENDING_CONFIRMATION", subscriptionId: "sub_123" },
        }),
      ),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    const client = createNotifiqueClient({
      apiKey: "sk_test_123",
      baseUrl: "https://api.notifique.dev",
    });
    const result = await client.forms.subscribe({
      email: "person@example.com",
      listId: "newsletterform1234567890",
    });

    expect(result.status).toBe("PENDING_CONFIRMATION");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.notifique.dev/v1/forms/subscriptions",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer sk_test_123",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listId: "newsletterform1234567890",
          email: "person@example.com",
        }),
      }),
    );
  });

  test("accepts a skipped duplicate subscription", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(mockResponse({ success: true, data: { status: "SKIPPED" } })),
    ) as typeof fetch;

    const client = createNotifiqueClient({ apiKey: "sk_test_123" });
    const result = await client.forms.subscribe({
      email: "person@example.com",
      listId: "newsletterform1234567890",
    });

    expect(result.status).toBe("SKIPPED");
  });

  test("exposes documented API errors", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        mockResponse(
          {
            success: false,
            error: "Forbidden",
            message: "Missing forms:submit scope",
            code: "FORBIDDEN",
          },
          403,
        ),
      ),
    ) as typeof fetch;

    const client = createNotifiqueClient({ apiKey: "sk_test_123" });

    await expect(
      client.forms.subscribe({
        email: "person@example.com",
        listId: "newsletterform1234567890",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<NotifiqueError>>({
        status: 403,
        code: "FORBIDDEN",
        message: "Missing forms:submit scope",
      }),
    );
  });

  test("rejects invalid form IDs before making a request", async () => {
    const fetchMock = mock(() => Promise.resolve(mockResponse({})));
    globalThis.fetch = fetchMock as typeof fetch;
    const client = createNotifiqueClient({ apiKey: "sk_test_123" });

    await expect(
      client.forms.subscribe({ email: "person@example.com", listId: "newsletter" }),
    ).rejects.toBeInstanceOf(NotifiqueConfigurationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
