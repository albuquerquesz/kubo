import { env } from "@notifique-smoke/env/server";

export type NotifiqueEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
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

function getApiKey(): string {
  const apiKey = env.NOTIFIQUE_API_KEY?.trim();
  if (!apiKey) {
    throw new NotifiqueError(
      401,
      "NOTIFIQUE_API_KEY is not set. Add it to your server .env (sk_live_… or sk_test_…).",
    );
  }
  return apiKey;
}

function getBaseUrl(): string {
  const base = (env.NOTIFIQUE_BASE_URL ?? "https://api.notifique.dev").replace(/\/$/, "");
  return base.endsWith("/v1") ? base : `${base}/v1`;
}

export type NotifiqueRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Header Idempotency-Key — retries within 24h do not create duplicate sends. */
  idempotencyKey?: string;
};

/**
 * Low-level Notifique REST helper.
 * Auth: Authorization Bearer only. Do not send x-workspace-id (key scopes the workspace).
 * Docs: https://docs.notifique.dev/skill.md · https://docs.notifique.dev/llms.txt
 */
export async function notifiqueRequest<T>(
  path: string,
  options: NotifiqueRequestOptions = {},
): Promise<T> {
  const apiKey = getApiKey();
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  const response = await fetch(url, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as NotifiqueEnvelope<T>;

  // 202 Accepted is the normal success for send endpoints.
  if (!response.ok) {
    throw new NotifiqueError(
      response.status,
      payload.message ?? payload.error ?? `Notifique request failed (${response.status})`,
      payload.code,
    );
  }

  if (payload.data !== undefined) {
    return payload.data;
  }

  return payload as unknown as T;
}
