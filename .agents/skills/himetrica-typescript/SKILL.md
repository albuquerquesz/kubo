---
name: himetrica-typescript
description: Implement or plan Himetrica analytics for this Kubo monorepo, including the TypeScript web SDK, React/Next.js integration, custom product events, error tracking, Web Vitals, user identification, and server-side events. Use when adding, replacing, or auditing analytics in apps/web, the Stack Builder, CLI-related flows, or backend integrations.
---

# Himetrica TypeScript

Use Himetrica as the analytics layer for the Kubo website and Builder. Prefer the official `@himetrica/tracker-js` package for typed browser/React integration and the Himetrica Server API for backend or webhook events.

## Repository context

- `apps/web` is a Next.js app. Existing Umami integration lives in `apps/web/src/components/umami-script.tsx` and analytics links/components.
- The Builder lives under `apps/web/src/app/(home)/new`.
- Backend code uses Convex under `packages/backend`; never put a Himetrica secret key in client components, public env files, or generated projects.
- Preserve the existing analytics provider until a migration is explicitly requested. Adding Himetrica beside Umami requires deduplication and an explicit ownership decision.

## Workflow

1. Read [references/integration-plan.md](references/integration-plan.md) before changing analytics.
2. Inspect current providers, environment variables, consent/privacy behavior, and event naming. Search for `umami`, `analytics`, `track`, and existing auth boundaries.
3. Decide the boundary:
   - Browser page views, Builder interactions, errors, and Web Vitals: client SDK.
   - Payments, CLI generation jobs, webhooks, or trusted business events: Server API with `HIMETRICA_SECRET_KEY`.
4. Verify the current package version and official docs before installing. The SDK is evolving and may be beta.
5. Add a small typed event vocabulary in the owning app/module. Do not scatter arbitrary event strings across components.
6. Implement only the requested surface, then verify with typecheck, relevant tests, and a browser smoke check when client behavior changes.

## Client integration rules

- Use `HimetricaProvider` and hooks for React/Next.js client components, or `HimetricaClient` for a deliberately isolated browser module.
- Keep the API key public only in the sense intended by Himetrica's browser tracker; load it through the app's public runtime configuration, never a server secret.
- Enable automatic page views only once. Avoid loading both the script tag and npm client for the same page.
- Recommended capabilities: SPA page views, typed custom events, `captureError`, optional `trackVitals`, and `reset()` on logout.
- Identify users only after consent and authentication. Send the minimum necessary identity fields; avoid passwords, tokens, or sensitive payloads.
- Respect Do Not Track and the project's consent policy. Do not silently introduce tracking on protected or unrelated surfaces.

## Server integration rules

- Use `https://app.himetrica.com/api/v1` and the `X-API-Key: hm_sk_...` header.
- Keep `HIMETRICA_SECRET_KEY` server-only and validate response status/error bodies.
- Use `userId`, `email`, or `visitorId` to associate events; use `session: "latest"` only when intentionally joining a browser session.
- Treat analytics as non-critical: failures must not break project creation, payments, authentication, webhooks, or page rendering. Add bounded timeout/retry behavior only where it fits the existing boundary.
- Never log API keys or full PII-bearing request bodies.

## Event vocabulary for Kubo

Use stable snake-case names and small properties. Good candidates include:

- `builder_started`, `stack_option_selected`, `command_copied`
- `project_generation_started`, `project_generation_succeeded`, `project_generation_failed`
- `docs_search_submitted`, `docs_link_clicked`, `cli_download_clicked`
- `error_boundary_triggered`, `web_vital_recorded`

Include only useful dimensions such as `frontend`, `backend`, `database`, `orm`, `deployment`, or a normalized failure category. Never send source code, environment variables, credentials, or raw user input by default.

## Verification checklist

- Confirm exactly one client initialization path.
- Confirm no secret key reaches a Client Component or browser bundle.
- Confirm consent/DNT behavior and logout reset behavior.
- Confirm event names and properties are typed or centralized.
- Confirm analytics failure is isolated from product behavior.
- Run the relevant package checks and inspect the production build for accidental server-secret exposure.
