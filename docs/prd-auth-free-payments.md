# PRD: Auth-Free Payments for CLI Templates

## Status

Draft

## Date

July 17, 2026

## Context

The CLI now exposes `abacatepay` as a payments provider, but the generated stack is still structurally coupled to auth.

Today, the selection and validation layer allows `payments=abacatepay` without requiring `auth=better-auth`. That part is correct. The generated code is not yet correct:

- AbacatePay server runtime is emitted into `packages/auth`
- checkout endpoints still import `@project/auth`
- checkout creation still requires an authenticated session and `userId`
- payment persistence stores `userId` as required
- `auth=none` skips auth package generation, which breaks payment generation paths that assume `packages/auth` exists

This produces a false-positive UX: the CLI permits combinations that the generator cannot scaffold correctly.

## Problem

Payments are treated as an auth extension instead of a first-class capability.

That causes three product failures:

1. Users cannot rely on CLI compatibility signals.
2. Payment providers are artificially constrained by auth-provider choice.
3. The generated payment flow is not usable for guest checkout or stacks with `auth=none`.

## Decision

Payments must become auth-free at the platform level.

"Auth-free" in this document means:

- selecting a payment provider must not depend on `auth`
- generating payment runtime must not require `packages/auth`
- checkout creation must work with or without a signed-in user
- persistence and webhook reconciliation must not depend on a local user record

This does not mean every payment flow must be anonymous by default. It means auth becomes optional context, not a hard dependency.

## Goals

- Make `payments=abacatepay` scaffold correctly with `auth=none`, `better-auth`, or `clerk`
- Remove generator-time and runtime imports from payments into `@project/auth`
- Support guest checkout and authenticated checkout through the same payment runtime
- Keep current SQL-only AbacatePay v1 constraints
- Preserve current Polar behavior only if Polar remains in internal templates; do not reintroduce it into public payment selection unless explicitly requested

## Non-Goals

- Subscription billing
- Native payment flows
- Convex support for AbacatePay v1
- MongoDB or Mongoose support for AbacatePay v1
- A shared cross-provider payments abstraction beyond what is required to decouple auth

## Users

- CLI users generating a starter with hosted checkout
- Maintainers extending payment providers without binding them to a specific auth stack

## Current State

### Public UX

- The payments prompt shows `abacatepay`
- Auth-based blocking in the prompt and compatibility layer has been removed

### Remaining Coupling

- `packages/template-generator/src/template-handlers/payments.ts` writes server payment templates into `packages/auth`
- `packages/template-generator/src/template-handlers/auth.ts` returns early for `auth=none`, so no auth package exists in that setup
- AbacatePay fullstack checkout route templates import auth and require a session
- AbacatePay server library expects `createAbacatePayHostedCheckout(userId: string)`
- SQL schemas and helpers persist `userId` as required

## Requirements

### 1. Payments Package Ownership

Payment runtime must live in a payment-owned location, not in the auth package.

Accepted implementation options:

- create `packages/payments`
- emit payment server runtime into `packages/server`
- emit payment runtime into `packages/backend` for server backends and a stable app-local location for fullstack backends

Requirement:

- the chosen location must always exist when `payments !== "none"`
- it must not depend on `auth !== "none"`

### 2. Checkout Creation Without Auth Dependency

The generated checkout endpoint must support both modes:

- authenticated mode: enrich metadata with local user context when available
- guest mode: create checkout without requiring session lookup

Requirements:

- no generated checkout route may hard-fail solely because auth is disabled
- if auth exists, checkout may optionally attach `userId` or email metadata
- the payment runtime must accept nullable or absent user identity

### 3. Persistence Model

AbacatePay persistence must be reconciliation-first, not user-first.

Required stored fields:

- `localOrderId`
- `abacatepayCheckoutId`
- `checkoutUrl`
- `amountInCents`
- `status`
- `eventId`
- optional `userId`
- optional `customerEmail`

Requirements:

- `userId` must become nullable where it exists
- webhook idempotency must continue to rely on `eventId`
- success pages must continue reading local status rather than trusting the redirect alone

### 4. Route Generation

Generated routes must stay framework-specific, but auth-independent.

Required endpoints remain:

- `POST /api/payments/abacatepay/checkout`
- `POST /api/payments/abacatepay/webhook`
- `GET /api/payments/abacatepay/checkout/:checkoutId`

Requirements:

- fullstack templates for Next.js, TanStack Start, Nuxt, SvelteKit, and Astro must work without auth imports
- standalone server backends must expose the same behavior without `better-auth` guards

### 5. CLI and Builder Validation

Validation must reflect only true platform constraints.

Keep:

- requires a web frontend
- rejects native-only frontends
- rejects `backend=convex`
- requires SQL persistence with Drizzle or Prisma
- rejects MongoDB and Mongoose

Do not keep:

- any rule that ties payments to `auth`

### 6. UI Integration

Authenticated dashboards may still show payment CTAs, but payment UI cannot depend on auth-exclusive pages.

Requirements:

- if auth exists, dashboard CTA can remain
- if auth does not exist, generated app must still expose a discoverable checkout trigger or sample integration point
- success page must work in both guest and authenticated flows

### 7. Environment Contract

AbacatePay env vars remain server-side only:

- `ABACATEPAY_API_KEY`
- `ABACATEPAY_WEBHOOK_SECRET`
- `ABACATEPAY_PUBLIC_KEY`
- `ABACATEPAY_RETURN_URL`
- `ABACATEPAY_COMPLETION_URL`

Requirement:

- env generation must not depend on auth package generation

## Proposed Delivery

### Phase 1: Structural Decoupling

- move payment runtime templates out of `packages/auth`
- update dependency wiring so payment-owned code is referenced when `payments !== "none"`
- make template generation succeed for `auth=none`

### Phase 2: Guest-Capable Checkout

- make `userId` optional in payment runtime and DB models
- update all generated checkout handlers to stop requiring sessions
- attach auth metadata only when available

### Phase 3: UX Completion

- add a guest-visible payment entry point for auth-free apps
- keep dashboard CTA for auth-enabled apps
- verify success-page flow across supported web frameworks

## Acceptance Criteria

### CLI / Validation

- `payments=abacatepay` is selectable regardless of auth provider
- no CLI or web-builder compatibility rule references auth for payments

### Generation

- `auth=none + payments=abacatepay + backend=hono + frontend=next + orm=drizzle + database=postgres` generates successfully
- `auth=clerk + payments=abacatepay + backend=self + frontend=tanstack-start + orm=prisma + database=sqlite` generates successfully
- generated payment files do not import from `@project/auth` unless guarded as an optional enhancement path

### Runtime

- guest users can create a hosted checkout
- authenticated users can create a hosted checkout
- webhook processing remains idempotent
- success page renders local checkout status for both flows

### Regression

- `payments=none` does not generate payment files or env vars
- existing non-payment auth generation remains unchanged
- existing AbacatePay SQL constraints remain enforced

## Test Plan

### Unit and Integration

- update CLI matrix tests to assert no auth-based payment rejection
- add generation tests for `auth=none`, `auth=clerk`, and `auth=better-auth`
- add assertions that generated payment route files do not require auth session calls
- add assertions that payment runtime is emitted outside `packages/auth`

### Template Assertions

- DB templates make `userId` optional
- checkout handlers accept guest requests
- success page still queries local checkout status
- webhook verification still checks query `webhookSecret` and `X-Webhook-Signature`

### Manual Verification

1. Generate one auth-free stack and one auth-enabled stack.
2. Confirm both boot without missing workspace imports.
3. Create a checkout in both stacks.
4. Confirm webhook replay does not double-complete the same payment.

## Risks

- Moving payment runtime out of `packages/auth` may require workspace dependency rewiring
- Guest checkout support may expose assumptions in dashboard-only UI templates
- Optional auth metadata can become inconsistent across frameworks if route templates drift

## Open Questions

- Should the new payment-owned runtime live in `packages/payments` or another always-generated package?
- For auth-free apps, should the generator create a public `/checkout` demo page or only a reusable API plus example component?
- Should `customerEmail` be collected in v1 for guest flows, or remain optional metadata only?

## Recommended Next Issue Breakdown

1. Move AbacatePay runtime out of `packages/auth`
2. Make AbacatePay persistence models user-optional
3. Remove auth requirements from generated checkout handlers
4. Add guest payment UI entry point
5. Expand generation and regression coverage for auth-free payments
