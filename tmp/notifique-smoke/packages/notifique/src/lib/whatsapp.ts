import { env } from "@notifique-smoke/env/server";

import { notifiqueRequest } from "./client";

export type SendWhatsAppTextInput = {
  /** WhatsApp instance id (ACTIVE). Defaults to NOTIFIQUE_WHATSAPP_INSTANCE_ID when set. */
  instanceId?: string;
  /** Digits only, international (no +), e.g. 5511999999999 */
  to: string | string[];
  message: string;
  idempotencyKey?: string;
};

export type SendWhatsAppResult = {
  status: "QUEUED" | "SCHEDULED" | string;
  messageIds: string[];
  scheduledAt?: string | null;
};

/**
 * POST /v1/whatsapp/messages — free-form text (unofficial / open 24h window on official).
 * Official first contact outside 24h needs type: "template" (not covered here).
 * Docs: https://docs.notifique.dev/whatsapp-api/como-funciona/quick-start
 */
export async function sendWhatsAppText(input: SendWhatsAppTextInput): Promise<SendWhatsAppResult> {
  const instanceId = input.instanceId?.trim() || env.NOTIFIQUE_WHATSAPP_INSTANCE_ID?.trim();
  if (!instanceId) {
    throw new Error(
      "WhatsApp instanceId is required. Pass instanceId or set NOTIFIQUE_WHATSAPP_INSTANCE_ID.",
    );
  }

  const to = Array.isArray(input.to) ? input.to : [input.to];

  return notifiqueRequest<SendWhatsAppResult>("/whatsapp/messages", {
    body: {
      instanceId,
      to,
      type: "text",
      payload: { message: input.message },
    },
    idempotencyKey: input.idempotencyKey,
  });
}
