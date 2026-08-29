import { env } from "@kubojs/env/server";
import { Notifique } from "@notifique/sdk-node";
import { createElement } from "react";
import { render, toPlainText } from "react-email";

import { ReleaseChangelogEmail } from "./release-changelog-email";
import type { ReleaseChangelogEmailProps } from "./types";

export type SendReleaseChangelogEmail = {
  release: ReleaseChangelogEmailProps;
  to: string | string[];
  subject?: string;
  idempotencyKey?: string;
};

const notifique = new Notifique({
  apiKey: env.NOTIFIQUE_API_KEY,
});

export type SubscribeToNewsletterInput = {
  email: string;
  listId: string;
};

export async function subscribeToNewsletter(input: SubscribeToNewsletterInput) {
  return notifique.api.forms.postV1FormsSubscriptions({
    body: input,
  });
}

export async function mail(input: SendReleaseChangelogEmail) {
  const html = await render(createElement(ReleaseChangelogEmail, input.release));
  const text = toPlainText(html);

  const email = {
    from: env.NOTIFIQUE_FROM_EMAIL,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject:
      input.subject ?? `KuboJS ${input.release.version}: o que mudou e o que você pode usar agora.`,
    html,
    text,
  };

  const response = await notifique.email.send(email, { idempotencyKey: input.idempotencyKey });

  return response;
}
