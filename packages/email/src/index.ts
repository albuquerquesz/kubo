import { env } from "@kubojs/env/server";
import { createElement } from "react";
import { render, toPlainText } from "react-email";
import { Resend } from "resend";

import { MagicLinkEmail } from "./magic-link-email";
import { ReleaseChangelogEmail } from "./release-changelog-email";
import type { ReleaseChangelogEmailProps } from "./types";

export type SendReleaseChangelogEmail = {
  release: ReleaseChangelogEmailProps;
  to: string | string[];
  subject?: string;
  idempotencyKey?: string;
  /** One-click unsubscribe URL (RFC 8058), sent as `List-Unsubscribe` headers. */
  unsubscribeUrl?: string;
};

export class EmailDeliveryError extends Error {
  override readonly name = "EmailDeliveryError";

  // Not `ErrorOptions.cause`: Convex typechecks this package with `lib: ES2021`.
  constructor(
    message: string,
    readonly reason: unknown,
  ) {
    super(message);
  }
}

// Created on first send so importing this module (Convex push analysis, tests) needs no API key.
let resendClient: Resend | undefined;

function getResend(): Resend {
  resendClient ??= new Resend(env.RESEND_API_KEY);
  return resendClient;
}

function unsubscribeHeaders(url: string | undefined): Record<string, string> | undefined {
  if (!url) return undefined;
  return {
    "List-Unsubscribe": `<${url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

type OutgoingEmail = {
  to: string[];
  subject: string;
  html: string;
  idempotencyKey?: string;
  headers?: Record<string, string>;
};

async function sendEmail({ idempotencyKey, ...email }: OutgoingEmail) {
  const { data, error } = await getResend().emails.send(
    { from: env.EMAIL_FROM, text: toPlainText(email.html), ...email },
    { idempotencyKey },
  );

  if (error) {
    throw new EmailDeliveryError(`Resend rejected the email: ${error.message}`, error);
  }

  return data;
}

export async function mail(input: SendReleaseChangelogEmail) {
  return sendEmail({
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject:
      input.subject ?? `KuboJS ${input.release.version}: o que mudou e o que você pode usar agora.`,
    html: await render(createElement(ReleaseChangelogEmail, input.release)),
    idempotencyKey: input.idempotencyKey,
    headers: unsubscribeHeaders(input.unsubscribeUrl),
  });
}

export type SendMagicLinkEmail = {
  to: string;
  url: string;
};

/** Resend caps idempotency keys at 256 chars; magic-link URLs carry a long token, so hash them. */
async function magicLinkIdempotencyKey(url: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(url));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"));
  return `magic-link:${hex.join("")}`;
}

export async function sendMagicLinkEmail(input: SendMagicLinkEmail) {
  return sendEmail({
    to: [input.to],
    subject: "Seu link de acesso ao Kubo",
    html: await render(createElement(MagicLinkEmail, { url: input.url })),
    idempotencyKey: await magicLinkIdempotencyKey(input.url),
  });
}
