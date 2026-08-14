# PRD: AbacatePay Setup and Root Build Reliability

## Status

Draft

## Date

July 17, 2026

## Context

The generated AbacatePay scaffold in `testproject3` is structurally close, but two product failures remain in the default create path:

1. setup is under-documented for first-time users
2. `bun run build` from the generated project root is not reliable when payment env vars are required by the web app build

The current scaffold already does several important things correctly:

- it generates a payment-owned runtime in `packages/payments`
- it supports guest checkout without requiring auth
- it persists reconciliation-first checkout data
- it verifies webhooks using `webhookSecret`, `X-Webhook-Signature`, and `ABACATEPAY_PUBLIC_KEY`

This PRD is intentionally narrow. It does not revisit auth-free payment architecture and it does not change the current hardcoded AbacatePay product ID strategy.

## Problem

Users can successfully generate a project with `payments=abacatepay`, but the generated project still has poor day-one ergonomics:

1. there is no clear setup guide for required AbacatePay env vars and webhook wiring
2. root `bun run build` can fail even though the app itself builds when run from `apps/web` with the same env present
3. the generated README does not explain the payment flow, required secrets, or local verification steps

This creates a false-negative experience after successful scaffolding: generation succeeds, but common setup and verification steps are unclear or brittle.

## Decision

We will improve generated AbacatePay setup guidance and make root project builds reliable without changing the current payment flow shape.

Specifically:

- keep current webhook verification contract
- keep current guest checkout flow
- keep current hardcoded product ID
- fix generated docs and env guidance
- fix root build reliability for AbacatePay-enabled projects

## Goals

- Make AbacatePay setup understandable from the generated project alone
- Make root `bun run build` work for AbacatePay-enabled generated projects when required env vars are provided in the generated project environment
- Document the webhook URL contract and expected env vars
- Preserve the current hosted-checkout happy path and webhook model
- Preserve the current hardcoded product ID behavior

## Non-Goals

- Replacing the hardcoded AbacatePay product ID with env or prompt configuration
- Changing the webhook auth model away from `webhookSecret` plus `X-Webhook-Signature`
- Redesigning payment persistence or auth coupling
- Adding subscription billing or native payment flows
- Expanding AbacatePay support beyond the current SQL-backed web flow

## Users

- CLI users generating a Better T Stack project with `payments=abacatepay`
- Maintainers validating that generated AbacatePay projects boot, build, and document themselves correctly

## Current State

### Setup Gaps

- generated README does not include an AbacatePay setup section
- required env vars are enforced in code but not clearly explained in generated docs
- webhook configuration expectations are not documented in the generated project
- local verification steps for checkout and webhook flow are not documented

### Build Gap

- `bun run build` from project root can fail during Turbo-driven app build because required env vars are not reliably available to the web package build context
- direct `bun run build` from `apps/web` can succeed with the same values present, which makes the failure mode confusing

## Requirements

### 1. Generated README Setup Section

Every generated project with `payments=abacatepay` must include a dedicated README section covering:

- required env vars:
  - `ABACATEPAY_API_KEY`
  - `ABACATEPAY_WEBHOOK_SECRET`
  - `ABACATEPAY_PUBLIC_KEY`
  - `ABACATEPAY_RETURN_URL`
  - `ABACATEPAY_COMPLETION_URL`
  - existing required app env such as `DATABASE_URL` and `CORS_ORIGIN` when relevant to payment flow
- what each value is used for
- example webhook URL shape:
  - `https://your-app.com/api/payments/abacatepay/webhook?webhookSecret=...`
- reminder that checkout status should be confirmed from local persisted state and verified webhook processing, not redirect alone

### 2. Generated Setup Steps

Generated documentation must include a simple setup sequence for AbacatePay projects:

1. install dependencies
2. configure env vars
3. apply DB schema
4. start dev server
5. trigger hosted checkout
6. configure AbacatePay webhook URL
7. verify local success page and webhook-driven status update

The steps must be generated into the scaffold itself, not only documented in repo-internal maintainer docs.

### 3. Root Build Reliability

For generated projects with `payments=abacatepay`, `bun run build` from project root must succeed when the required env vars are present in the generated project environment.

Requirements:

- fix must apply to the default root build path, not only direct `apps/web` builds
- fix must not require users to manually cd into `apps/web` as a workaround
- fix must preserve existing build behavior for projects without payments
- fix should work with the generated project's normal `.env` placement and Turbo task model

Accepted implementation directions include:

- ensuring Turbo passes the required env vars into the web build task
- ensuring the web build reads env from the generated project root in a way that works under the root task runner
- another equivalent fix that makes the documented root build path reliable

This PRD does not mandate the exact mechanism, only the resulting behavior.

### 4. Error Message and Guidance Quality

If required AbacatePay env vars are missing, the generated project should fail with understandable guidance.

Requirements:

- env validation should continue protecting server-only secrets
- generated docs must explain how to satisfy the validation
- failure mode should clearly map back to documented env names

### 5. Preserve Current Product ID Strategy

The generated AbacatePay runtime must keep the current hardcoded product ID placeholder strategy for now.

Requirements:

- do not add new CLI prompts for AbacatePay product ID
- do not add new env vars for product ID
- do not change checkout creation to source the product ID dynamically
- generated docs may mention that the scaffold uses a placeholder product ID that the user must replace in code before production use

## Proposed Delivery

### Phase 1: Documentation

- add AbacatePay setup section to generated README content
- document required env vars and webhook URL contract
- document local verification flow for checkout and webhook handling
- document current hardcoded product ID limitation without changing implementation

### Phase 2: Root Build Fix

- reproduce root build failure in generated AbacatePay project
- fix env availability for root `bun run build`
- verify the fix through the normal root build command

### Phase 3: Regression Coverage

- add focused coverage for generated README/payment setup output
- add build-oriented coverage proving root build path works for curated AbacatePay projects
- preserve existing non-payment build behavior

## Acceptance Criteria

### Generated Docs

- a generated project with `payments=abacatepay` contains an AbacatePay setup section in `README.md`
- generated docs list all required AbacatePay env vars by exact name
- generated docs show the webhook URL shape including `?webhookSecret=`
- generated docs explain local verification steps for checkout and webhook flow
- generated docs mention that the product ID remains hardcoded and must be replaced manually for real use

### Build Behavior

- root `bun run build` succeeds for a curated generated AbacatePay project when required env vars are present
- the same project does not require `cd apps/web && bun run build` as a workaround
- non-payment generated projects keep current root build behavior unchanged

### Regression

- existing guest checkout and webhook code paths remain generated
- existing webhook verification contract remains unchanged
- current hardcoded product ID remains unchanged in generated runtime

## Test Plan

### Generation and Documentation

- add or update template tests asserting that AbacatePay-enabled generated `README.md` includes setup instructions, env var names, and webhook URL guidance
- add assertions that docs mention the hardcoded product ID limitation without introducing a new config source

### Curated Build Verification

- generate at least one curated AbacatePay project configuration
- provide required env vars in generated project environment
- run `bun run build` from project root
- assert success without package-local build workaround

### Manual Verification

1. Generate a project with `payments=abacatepay`.
2. Open generated `README.md` and follow only its instructions.
3. Configure env vars.
4. Run `bun run db:push`.
5. Run `bun run build` from project root.
6. Run dev server and trigger checkout.
7. Configure webhook URL in AbacatePay using documented shape.
8. Confirm success page reads local checkout status after webhook processing.

## Risks

- root build fix may depend on subtle Turbo or Next.js env-loading behavior in monorepo builds
- README generation may drift across frontend variants if payment docs are duplicated instead of shared
- documenting the hardcoded product ID too softly may still confuse users; documenting it too strongly may imply the scaffold is production-ready when it is only a starter

## Open Questions

- Should the generated README include a code path reference for where users replace the hardcoded AbacatePay product ID?
- Should curated build coverage include both one auth-free project configuration and one auth-enabled project configuration, or is one representative AbacatePay project enough for this issue?

## Recommended Next Issue Breakdown

1. Add generated AbacatePay README/setup guidance
2. Fix root `bun run build` env propagation or loading for generated AbacatePay projects
3. Add focused regression coverage for generated docs and curated root build behavior
