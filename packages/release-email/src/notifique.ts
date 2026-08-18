import { createElement } from "react";
import { render, toPlainText } from "react-email";

import { ReleaseChangelogEmail } from "./release-changelog-email";
import type { ReleaseChangelogEmailProps } from "./types";

type EmailAddress = string | string[];

export type SendReleaseChangelogEmailInput = {
  release: ReleaseChangelogEmailProps;
  to: EmailAddress;
  from?: string;
  replyTo?: EmailAddress;
  subject?: string;
  apiKey?: string;
  baseUrl?: string;
  idempotencyKey?: string;
};

export type SendNotifiqueEmailResult = {
  status: string;
  count?: number;
  messageIds: string[];
  emailIds?: string[];
};

export class NotifiqueEmailError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "NotifiqueEmailError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Renders and sends a release changelog through Notifique's email API.
 * The sender must belong to a verified domain in Notifique.
 */
export async function sendReleaseChangelogEmail(
  input: SendReleaseChangelogEmailInput,
): Promise<SendNotifiqueEmailResult> {
  const apiKey = input.apiKey ?? process.env.NOTIFIQUE_API_KEY;
  const from = input.from ?? process.env.NOTIFIQUE_FROM_EMAIL;

  if (!apiKey?.trim()) {
    throw new NotifiqueEmailError(401, "NOTIFIQUE_API_KEY is not configured");
  }
  if (!from?.trim()) {
    throw new NotifiqueEmailError(400, "NOTIFIQUE_FROM_EMAIL is not configured");
  }

  const html = await render(createElement(ReleaseChangelogEmail, input.release));
  const text = toPlainText(html);
  const body = {
    from: from.trim(),
    to: asArray(input.to),
    ...(input.replyTo ? { replyTo: asArray(input.replyTo) } : {}),
    type: "email",
    payload: {
      subject:
        input.subject ??
        `KuboJS ${input.release.version}: o que mudou e o que você pode usar agora.`,
      html,
      text,
    },
  };

  const response = await fetch(`${normalizeBaseUrl(input.baseUrl)}/email/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
      ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
  });

  const payload: unknown = await response.json().catch(() => null);
  const parsedPayload = parseResponse(payload);

  if (!response.ok) {
    throw new NotifiqueEmailError(
      response.status,
      parsedPayload.message ?? parsedPayload.error ?? "Notifique email request failed",
      parsedPayload.code,
    );
  }

  if (!parsedPayload.data) {
    throw new NotifiqueEmailError(response.status, "Notifique returned no email result");
  }

  return parsedPayload.data;
}

function asArray(value: EmailAddress): string[] {
  return Array.isArray(value) ? value : [value];
}

function normalizeBaseUrl(baseUrl = process.env.NOTIFIQUE_BASE_URL ?? "https://api.notifique.dev") {
  const normalized = baseUrl.trim().replace(/\/$/, "");
  return normalized.endsWith("/v1") ? normalized : `${normalized}/v1`;
}

function parseResponse(payload: unknown): {
  data?: SendNotifiqueEmailResult;
  error?: string;
  message?: string;
  code?: string;
} {
  if (!isRecord(payload)) {
    throw new NotifiqueEmailError(502, "Notifique returned an invalid response");
  }

  const data = isRecord(payload.data) ? parseResult(payload.data) : undefined;

  return {
    data,
    error: asOptionalString(payload.error),
    message: asOptionalString(payload.message),
    code: asOptionalString(payload.code),
  };
}

function parseResult(value: Record<string, unknown>): SendNotifiqueEmailResult {
  const status = asOptionalString(value.status);
  const messageIds = value.messageIds;

  if (!status || !Array.isArray(messageIds) || !messageIds.every((id) => typeof id === "string")) {
    throw new NotifiqueEmailError(502, "Notifique returned an invalid email result");
  }

  return {
    status,
    count: typeof value.count === "number" ? value.count : undefined,
    messageIds,
    emailIds: Array.isArray(value.emailIds)
      ? value.emailIds.filter((id): id is string => typeof id === "string")
      : undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
