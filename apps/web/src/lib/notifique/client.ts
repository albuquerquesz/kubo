import { z } from "zod";

const formListIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9]+$/, "Notifique form IDs must be alphanumeric")
  .min(20)
  .max(36);

const subscriptionResultSchema = z.object({
  subscriptionId: z.string().nullable().optional(),
  status: z.enum([
    "SKIPPED",
    "PENDING_CONFIRMATION",
    "CONFIRMED",
    "ACTIVE",
    "UNSUBSCRIBED",
    "CANCELLED",
  ]),
  queuePosition: z.number().int().nullable().optional(),
  subscribedAt: z.string().optional(),
  confirmedAt: z.string().nullable().optional(),
  confirmationToken: z.string().optional(),
});

const responseSchema = z.object({
  success: z.boolean().optional(),
  data: subscriptionResultSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  code: z.string().optional(),
});

const subscriptionInputSchema = z.object({
  listId: formListIdSchema,
  email: z.email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  extraData: z.record(z.string(), z.unknown()).optional(),
  preferences: z.record(z.string(), z.string()).optional(),
});

export type NotifiqueSubscriptionInput = z.infer<typeof subscriptionInputSchema>;
export type NotifiqueSubscriptionResult = z.infer<typeof subscriptionResultSchema>;

export type NotifiqueClientConfig = {
  apiKey: string;
  baseUrl?: string;
};

export class NotifiqueError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "NotifiqueError";
    this.status = status;
    this.code = code;
  }
}

export class NotifiqueConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotifiqueConfigurationError";
  }
}

export function createNotifiqueClient(config: NotifiqueClientConfig) {
  const apiKey = config.apiKey.trim();
  if (!apiKey) {
    throw new NotifiqueConfigurationError("NOTIFIQUE_API_KEY is not configured");
  }

  const baseUrl = normalizeBaseUrl(config.baseUrl);

  return {
    forms: {
      subscribe: (input: NotifiqueSubscriptionInput) => subscribeToForm({ apiKey, baseUrl, input }),
    },
  };
}

async function subscribeToForm({
  apiKey,
  baseUrl,
  input,
}: {
  apiKey: string;
  baseUrl: string;
  input: NotifiqueSubscriptionInput;
}): Promise<NotifiqueSubscriptionResult> {
  const parsedInput = subscriptionInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new NotifiqueConfigurationError(parsedInput.error.message);
  }

  const response = await fetch(`${baseUrl}/forms/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsedInput.data),
    cache: "no-store",
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new NotifiqueError(
      response.status,
      payload.message ?? payload.error ?? "Notifique request failed",
      payload.code,
    );
  }

  if (!payload.data) {
    throw new NotifiqueError(response.status, "Notifique returned no subscription data");
  }

  return payload.data;
}

async function parseResponse(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  const parsed = responseSchema.safeParse(body);

  if (!parsed.success) {
    throw new NotifiqueError(response.status, "Notifique returned an invalid response");
  }

  return parsed.data;
}

function normalizeBaseUrl(baseUrl = "https://api.notifique.dev") {
  const normalized = baseUrl.trim().replace(/\/$/, "");
  if (!normalized) {
    throw new NotifiqueConfigurationError("NOTIFIQUE_BASE_URL is not configured");
  }

  const versionedBaseUrl = normalized.endsWith("/v1") ? normalized : `${normalized}/v1`;
  const parsedUrl = z.url().safeParse(versionedBaseUrl);

  if (!parsedUrl.success) {
    throw new NotifiqueConfigurationError("NOTIFIQUE_BASE_URL must be a valid URL");
  }

  return parsedUrl.data;
}
