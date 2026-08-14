---
name: abacatepay-checkout-webhooks
description: Implement a basic AbacatePay integration for hosted checkout and webhook handling in this project. Use when the user wants to charge via AbacatePay Checkout, create payment sessions, persist AbacatePay checkout IDs/URLs, or receive payment status updates via webhooks.
metadata:
  priority: 6
  docs:
    - "https://docs.abacatepay.com/pages/payment/reference"
    - "https://docs.abacatepay.com/pages/webhooks/reference"
---

# AbacatePay checkout + webhooks

Use this skill for the smallest useful AbacatePay integration: create a hosted checkout URL and process webhook events that confirm payment lifecycle changes.

## Scope

This skill covers only:

- Hosted checkout creation
- Minimal product/customer support when needed by the flow
- Webhook registration assumptions
- Webhook receiver and signature verification wiring

This skill does not cover:

- Transparent checkout / embedded PIX
- Recurring subscriptions
- Payouts or PIX transfers
- Coupons, TrustMRR, or store APIs

Read [references/api.md](references/api.md) before editing payment code.

## Workflow

1. Find the current billing flow, order model, and webhook infrastructure already used by the repo.
2. Add AbacatePay config at the boundary only:
   - `ABACATEPAY_API_KEY`
   - `ABACATEPAY_WEBHOOK_SECRET`
   - optional app URL values for `returnUrl` / `completionUrl`
3. Create or reuse a thin server-side client for `https://api.abacatepay.com/v2` with Bearer auth and JSON handling.
4. Implement hosted checkout creation with `POST /checkouts/create`.
5. Persist enough local state to reconcile callbacks:
   - local order/cart ID
   - AbacatePay checkout ID
   - AbacatePay checkout URL
   - amount in centavos
6. Add a public HTTPS webhook endpoint and verify the HMAC signature using the configured secret.
7. Handle only the events the project needs. For a basic one-time checkout, start with `checkout.completed`.
8. Make webhook processing idempotent. Never fulfill an order twice.

## Rules

- Never create checkout requests from the client with the API key. Use server-side code only.
- Monetary values are always centavos.
- Treat all AbacatePay responses as wrapped in `{ data, success, error }`.
- Prefer `externalId` and `metadata` to map AbacatePay objects back to local records.
- If the project already has products in its own catalog, use stable `externalId` values to map them to AbacatePay products.
- Do not invent webhook signature headers or payload canonicalization rules. This skill only guarantees that AbacatePay signs webhooks with HMAC using the configured secret. If the exact header name is not already present in the repo, check the official webhook docs before hardcoding verification.

## Basic implementation target

For a minimal integration, the finished flow should be:

1. Server ensures the AbacatePay product exists or already knows its AbacatePay product ID.
2. Server optionally creates/reuses an AbacatePay customer.
3. Server creates a checkout and returns `data.url`.
4. Client redirects the user to that hosted checkout URL.
5. AbacatePay calls the webhook after payment updates.
6. Server verifies signature, records the event, and marks the local order as paid when `checkout.completed` is confirmed.
