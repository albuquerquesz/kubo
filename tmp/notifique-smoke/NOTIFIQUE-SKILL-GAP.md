# Notifique scaffold vs [skill.md](https://docs.notifique.dev/skill.md)

Smoke project: `tmp/notifique-smoke`  
Generated with: `communication: "notifique"` (enum single-select alongside `resend` / `none`)

References:

- Skill: https://docs.notifique.dev/skill.md
- LLMs map: https://docs.notifique.dev/llms.txt
- SMS QS: https://docs.notifique.dev/sms-api/como-funciona/quick-start
- WhatsApp QS: https://docs.notifique.dev/whatsapp-api/como-funciona/quick-start
- Email QS: https://docs.notifique.dev/emails-api/como-funciona/quick-start

## Checklist

| Skill / docs requirement                                               | Scaffold location                                       | Status              |
| ---------------------------------------------------------------------- | ------------------------------------------------------- | ------------------- |
| Base host `https://api.notifique.dev` + `/v1` paths                    | `packages/notifique/src/lib/client.ts` `getBaseUrl()`   | **Pass**            |
| `Authorization: Bearer sk_*`                                           | `client.ts` headers                                     | **Pass**            |
| Do **not** send `x-workspace-id`                                       | Only Bearer + Content-Type (+ optional Idempotency-Key) | **Pass**            |
| Accept **202** as success                                              | `response.ok` includes 202                              | **Pass**            |
| Envelope `{ success, data, code, message }`                            | `NotifiqueEnvelope` + error mapping                     | **Pass**            |
| `POST /v1/sms/messages` body `to[]`, `type: "text"`, `payload.message` | `lib/sms.ts`                                            | **Pass**            |
| SMS min 9 characters                                                   | Client guard in `sendSms`                               | **Pass**            |
| `options.speed` full/standard/slow                                     | Optional on `sendSms`                                   | **Pass**            |
| Header `Idempotency-Key`                                               | `idempotencyKey` → header                               | **Pass**            |
| `POST /v1/whatsapp/messages` text + `instanceId`                       | `lib/whatsapp.ts`                                       | **Pass**            |
| `POST /v1/email/messages` `type: "email"`, subject + html/text, `from` | `lib/email.ts`                                          | **Pass**            |
| Email `cc` / `bcc` / `replyTo` arrays                                  | Optional on `sendEmail`                                 | **Pass**            |
| Optional API key until send                                            | `NOTIFIQUE_API_KEY` optional in env schema              | **Pass**            |
| Document skill + llms.txt                                              | README Notifique section                                | **Pass**            |
| `x-api-key` alternate auth                                             | Not implemented (Bearer only is skill primary)          | **Intentional gap** |
| WhatsApp official **template** first contact                           | Only free-form text helper                              | **Intentional gap** |
| `POST /v1/templates/send` multichannel                                 | —                                                       | **Intentional gap** |
| `POST /v1/notify` cascade                                              | —                                                       | **Intentional gap** |
| Webhooks + HMAC `X-Notifique-Signature`                                | —                                                       | **Intentional gap** |
| Connect-page / instances create                                        | —                                                       | **Intentional gap** |
| OAuth apps API                                                         | —                                                       | **Intentional gap** |
| Campaigns re-run                                                       | —                                                       | **Intentional gap** |
| Forms / short links                                                    | —                                                       | **Intentional gap** |
| Instagram / Telegram / Push / RCS / Voice helpers                      | —                                                       | **Intentional gap** |
| Live API call from smoke                                               | Not executed (no real key in CI)                        | **N/A**             |

## Generated surface

```
packages/notifique/
  src/index.ts          # sendSms, sendWhatsAppText, sendEmail, client
  src/lib/client.ts
  src/lib/sms.ts
  src/lib/whatsapp.ts
  src/lib/email.ts
```

Env (`apps/server/.env` + `@notifique-smoke/env/server`):

- `NOTIFIQUE_API_KEY`
- `NOTIFIQUE_BASE_URL` (default `https://api.notifique.dev`)
- `NOTIFIQUE_WHATSAPP_INSTANCE_ID`
- `NOTIFIQUE_FROM_EMAIL`

## Conclusion

v1 scaffold matches the skill for **auth**, **base URL**, **SMS text send**, **WhatsApp free-form text**, and **email send** shapes. Broader skill recipes (templates, notify cascade, webhooks, OAuth, connect-page, campaigns) remain documented as follow-ups, not generated helpers.
