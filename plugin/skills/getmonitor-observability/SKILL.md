---
name: getmonitor-observability
description: Integrate the GetMonitor JavaScript error-tracking SDK into kubojs-generated browser, Node.js, Express, and full-stack applications.
---

# GetMonitor observability

Use this skill when a kubojs project selects `observability: "getmonitor"`, or when adding GetMonitor error tracking to an existing generated application.

## Product boundary

The upstream `get-monitor/getmonitor-js` repository is the client-side JavaScript/TypeScript SDK for error tracking. It captures exceptions in browser and Node.js processes, normalizes them into a shared event shape, and sends them to GetMonitor ingestion (`ingester-api`).

This SDK is not an uptime monitor, incident manager, maintenance-window tool, or status-page API. Do not describe or implement those features from this repository.

Current packages (published under `@getmonitor/*`, version `0.1.0` as of writing):

| Package                     | Role                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `@getmonitor/browser`       | Browser SDK — automatic uncaught / rejection / `console.error` capture; manual capture; breadcrumbs |
| `@getmonitor/node`          | Node SDK — uncaught/unhandled + Express middleware; `AsyncLocalStorage` identity                    |
| `@getmonitor/core`          | Shared internals (do not install directly in apps)                                                  |
| `@getmonitor/react`         | `<GetMonitorErrorBoundary>` for React render errors                                                 |
| `@getmonitor/cli`           | Source map upload tool (used by Next/Nuxt packages)                                                 |
| `@getmonitor/nextjs-config` | `withGetMonitor()` for Next.js production source maps                                               |
| `@getmonitor/nuxt`          | Nuxt module for production source maps                                                              |

**Current upstream scope:** Phase 1 (capture engine), Phase 2 (source maps), Phase 3 (React error boundary). All three are available.

> **npm lag:** GitHub main (2026-08-11) pins the exception host and removes public `apiHost`. Older published builds still required `apiHost`. Kubo scaffolds generate **main-shaped** code (no `apiHost`). Prefer packages that match main when available.

## Credentials and transport

- **Public project key** (`gm_xxx`): write-only ingest key. Safe to embed in browser bundles (same trust model as a Sentry DSN).
- **Auth token** (`GETMONITOR_AUTH_TOKEN`): **secret** used only for source-map upload at build time. Never put it in client env prefixes (`NEXT_PUBLIC_`, `VITE_`, `NUXT_PUBLIC_`, `PUBLIC_`).

Exception delivery:

```text
POST http://ingest.getmonitor.io/api/v1/exceptions
Authorization: Bearer <public project key>
Content-Type: application/json
```

The ingestion host is **fixed** and not customer-configurable. Do not generate `GETMONITOR_API_HOST` / `apiHost` options for application code.

Source-map upload (Phase 2) uses a fixed upload host documented in `@getmonitor/cli` (`https://ingest.getmonitor.io/api/v1/sourcemaps`).

## Choose the package

| Generated target        | Package                              | Initialization                                                |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------- |
| Browser/client          | `@getmonitor/browser`                | `GetMonitor.init(apiKey, options?)` once per page load        |
| React UI tree           | `@getmonitor/react` (+ browser)      | `<GetMonitorErrorBoundary>` after browser `init`              |
| Node server / worker    | `@getmonitor/node`                   | `new GetMonitor(apiKey, options?)`                            |
| Express                 | `@getmonitor/node`                   | `setupExpressErrorHandler(gm, app)` after routes              |
| Next.js production maps | `@getmonitor/nextjs-config` (devDep) | `withGetMonitor(nextConfig, { authToken })`                   |
| Nuxt production maps    | `@getmonitor/nuxt` (devDep)          | `modules: ['@getmonitor/nuxt']` + `getmonitor: { authToken }` |

## Browser integration

```bash
npm install @getmonitor/browser
```

```ts
import { GetMonitor } from "@getmonitor/browser";

GetMonitor.init(import.meta.env.VITE_GETMONITOR_API_KEY, {
  environment: "production",
  release: "1.4.2",
});
```

`GetMonitor` is a **singleton**. Match the frontend’s public env prefix (`NEXT_PUBLIC_`, `VITE_`, `NUXT_PUBLIC_`, `PUBLIC_`). Never ship a server-only secret into the browser bundle.

Automatic capture (defaults on): uncaught exceptions, unhandled rejections, `console.error`.

## React error boundary (Phase 3)

```bash
npm install @getmonitor/react @getmonitor/browser
```

Initialize the browser SDK **before** the boundary mounts. Disable console capture to avoid **duplicate** events (React logs boundary catches via `console.error`):

```ts
GetMonitor.init(apiKey, {
  environment: "production",
  captureConsoleErrors: false,
});
```

```tsx
import { GetMonitorErrorBoundary } from "@getmonitor/react";

<GetMonitorErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Something went wrong.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  )}
>
  <App />
</GetMonitorErrorBoundary>;
```

## Node and Express

```bash
npm install @getmonitor/node
```

```ts
import { GetMonitor, setupExpressErrorHandler } from "@getmonitor/node";

const gm = new GetMonitor(process.env.GETMONITOR_API_KEY!, {
  environment: process.env.NODE_ENV ?? "development",
});

// Express: after routes, before custom error handlers
setupExpressErrorHandler(gm, app);
```

Use `captureExceptionImmediate` when the process may exit immediately (serverless/short scripts). Call `gm.shutdown()` in short-lived test fixtures.

## Source maps (Phase 2)

### Next.js

```bash
npm install --save-dev @getmonitor/nextjs-config
```

```ts
import { withGetMonitor } from "@getmonitor/nextjs-config";

export default process.env.GETMONITOR_AUTH_TOKEN
  ? withGetMonitor(nextConfig, {
      authToken: process.env.GETMONITOR_AUTH_TOKEN,
    })
  : nextConfig;
```

Kubo gates the wrap on token presence so local production builds without a token still succeed. Upstream `withGetMonitor` fails the build if upload fails.

### Nuxt

```bash
npm install --save-dev @getmonitor/nuxt
```

```ts
export default defineNuxtConfig({
  modules: ["@getmonitor/nuxt"],
  getmonitor: {
    authToken: process.env.GETMONITOR_AUTH_TOKEN,
  },
});
```

Without an auth token the module is a silent no-op for uploads (main branch behavior).

## Filtering and identity

```ts
GetMonitor.init(apiKey, {
  ignoreErrors: ["ResizeObserver loop limit exceeded"],
  beforeCapture(event) {
    if (event.user?.internal) return null;
    return event;
  },
});
```

Node concurrent servers: prefer `runWithIdentity(id, fn, traits)` over global `identify()` so identity does not leak across requests.

Never put secrets, tokens, passwords, or raw PII into tags, breadcrumbs, traits, or context.

## Event contract

Shared event fields: `eventId`, `timestamp`, optional `release`/`environment`, `fingerprint`, `exceptions[]`, `handled`, `level`, `mechanism`, `breadcrumbs`, optional `user`, `tags`, `context`.

Mechanisms: `uncaught_exception | unhandled_rejection | console_error | manual | react_error_boundary | express_middleware`.

## Kubo integration rules

- Keep `getmonitor` as the canonical `observability` identifier and retain `none` (single enum — no multiselect).
- **Default-on:** interactive CLI, Stack Builder `DEFAULT_STACK`, and full-stack templates (`mern` / `pern` / `t3`) use `getmonitor`. Minimal native-only preset (`uniwind`) stays `none`.
- **Explicit opt-out:** user selects None in the prompt/builder, or passes `--observability none`.
- **Keys optional on first run:** scaffold must not fail without `GETMONITOR_API_KEY` / `GETMONITOR_AUTH_TOKEN`; capture stays idle until configured. Document this in README and post-install.
- Treat GetMonitor as observability, not addon / database / auth / deploy.
- Install only the platform packages needed for the selected frontend/backend.
- Do **not** generate configurable `apiHost` / `*_GETMONITOR_API_HOST`.
- Initialize browser tracking only on the client boundary; Node once at server startup.
- For React scaffolds: install `@getmonitor/react`, wrap the tree, set `captureConsoleErrors: false`.
- For Next/Nuxt: wire source-map packages and document `GETMONITOR_AUTH_TOKEN`.
- README and post-install must distinguish public project keys from the build-time auth token.
- Product copy: error tracking (browser/server JS/TS) — never uptime/status-page claims.

## Verification

Schema/provider path: types, CLI flags/prompts, stack builder, README, post-install, tests.

Generated integration checks:

1. Correct package(s) in the manifest for the selected stack.
2. No `apiHost` / `*_API_HOST` in generated app code or env schemas.
3. Init guarded by client/server boundary.
4. React stacks include ErrorBoundary + `captureConsoleErrors: false`.
5. Next wraps config only when auth token is present (Kubo DX).
6. Nuxt module registered; browser client plugin present.
7. Express middleware still after routes.
8. Secrets excluded from identity/breadcrumbs/tags.

## Source resources

- [Upstream repository](https://github.com/get-monitor/getmonitor-js)
- [Browser README](https://github.com/get-monitor/getmonitor-js/blob/main/packages/browser/README.md)
- [Node README](https://github.com/get-monitor/getmonitor-js/blob/main/packages/node/README.md)
- [React README](https://github.com/get-monitor/getmonitor-js/blob/main/packages/react/README.md)
- [Next.js config README](https://github.com/get-monitor/getmonitor-js/blob/main/packages/nextjs-config/README.md)
- [Nuxt README](https://github.com/get-monitor/getmonitor-js/blob/main/packages/nuxt/README.md)
- [Core event schema](https://github.com/get-monitor/getmonitor-js/blob/main/packages/core/README.md)

When upstream changes package names, host policy, deferred phases, or init shape, re-read the repository and update this skill before changing Kubo templates.
