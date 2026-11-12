import { env } from "@kubojs/env/server";
import { createElement } from "react";
import { render, toPlainText } from "react-email";
import { Resend } from "resend";

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

export async function mail(input: SendReleaseChangelogEmail) {
  const html = await render(createElement(ReleaseChangelogEmail, input.release));

  const { data, error } = await getResend().emails.send(
    {
      from: env.EMAIL_FROM,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject:
        input.subject ??
        `KuboJS ${input.release.version}: o que mudou e o que você pode usar agora.`,
      html,
      text: toPlainText(html),
      headers: unsubscribeHeaders(input.unsubscribeUrl),
    },
    { idempotencyKey: input.idempotencyKey },
  );

  if (error) {
    throw new EmailDeliveryError(`Resend rejected the email: ${error.message}`, error);
  }

  return data;
}
