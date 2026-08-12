---
name: getmonitor-observability
description: Integrate the GetMonitor JavaScript error-tracking SDK into kubojs-generated browser, Node.js, Express, and full-stack applications.
---

# GetMonitor observability

Use this skill when a kubojs project selects `observability: "getmonitor"`, or when adding GetMonitor error tracking to an existing generated application.

## Product boundary

The upstream `get-monitor/getmonitor-js` repository is the client-side JavaScript/TypeScript SDK for error tracking. It captures exceptions in browser and Node.js processes, normalizes them into a shared event shape, and sends them to an ingestion endpoint.

This SDK is not an uptime monitor, incident manager, maintenance-window tool, or status-page API. Do not describe or implement those features from this repository. The upstream README says backend ingestion, grouping, and triage are separate and not yet built.

Current upstream packages are version `0.1.0`:

- `@getmonitor/browser` — browser SDK; automatic uncaught-error, unhandled-rejection, and `console.error` capture; manual capture; breadcrumbs; filters.
- `@getmonitor/node` — Node SDK; automatic `uncaughtException`/`unhandledRejection` capture; manual capture; breadcrumbs; `AsyncLocalStorage` identity scoping; Express middleware.
- `@getmonitor/core` — shared internals and types. Do not install it directly in a normal application; the platform packages depend on and expose the needed API.

Phase 1 is the capture engine. Source-map tooling (`@getmonitor/cli`, `@getmonitor/nextjs-config`, `@getmonitor/nuxt`) and React integration (`@getmonitor/react`) are deferred in the upstream repository and must not be invented in generated projects.

## Credentials and transport

The SDK takes a public, write-only project key such as `gm_xxx`. It sends one JSON event per exception to:

```text
{apiHost}/api/v1/exceptions
```

The request uses `Authorization: Bearer <public project key>` and `Content-Type: application/json`. The key is intentionally safe to embed in browser bundles, like a Sentry DSN or PostHog project key. Still keep the key configurable through the generated app's environment/configuration conventions rather than hardcoding it.

The upstream quickstart uses:

```text
https://ingest.getmonitor.com
```

Do not assume the ingestion host is the same as `https://getmonitor.io`; keep `apiHost` explicit and configurable.

## Choose the package

| Generated target                                | Package               | Initialization                                                                        |
| ----------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| Browser/client code                             | `@getmonitor/browser` | `GetMonitor.init(apiKey, options)` once per page load                                 |
| Node server, worker, CLI, or serverless handler | `@getmonitor/node`    | `new GetMonitor(apiKey, options)`                                                     |
| Express server                                  | `@getmonitor/node`    | Add `setupExpressErrorHandler(gm, app)` after routes and before custom error handlers |

For a full-stack app, install both platform packages only when both browser and server errors are meant to be tracked. Use separate project keys when the deployment model calls for separate browser/server projects; otherwise use the project’s chosen key consistently.

## Browser integration

Install:

```bash
npm install @getmonitor/browser
```

Initialize once in client-only code, after the browser runtime exists:

```ts
import { GetMonitor } from "@getmonitor/browser";

GetMonitor.init(import.meta.env.PUBLIC_GETMONITOR_API_KEY, {
  apiHost: import.meta.env.PUBLIC_GETMONITOR_API_HOST ?? "https://ingest.getmonitor.com",
  environment: "production",
  release: "1.4.2",
});
```

The exact public environment-variable prefix must follow the selected frontend framework. Never use a server-only variable in code that is bundled for the browser. `GetMonitor` is a singleton, not a class.

After initialization, automatic capture is enabled by default:

- `window` error events → `uncaught_exception`
- unhandled promise rejections → `unhandled_rejection`
- `console.error` → `console_error`

Disable individual sources when they would be noisy:

```ts
GetMonitor.init(apiKey, {
  apiHost,
  captureConsoleErrors: false,
});
```

Manual capture returns `Promise<void>` and can be awaited before navigation or redirect:

```ts
try {
  await submitOrder();
} catch (error) {
  await GetMonitor.captureException(error, {
    tags: { area: "checkout" },
    level: "error",
  });
  throw error;
}
```

Without a bundler, the upstream package also ships a UMD build:

```html
<script src="https://unpkg.com/@getmonitor/browser/dist/index.umd.js"></script>
<script>
  GetMonitor.init("gm_xxx", { apiHost: "https://ingest.getmonitor.com" });
</script>
```

## Node and Express integration

Install:

```bash
npm install @getmonitor/node
```

Create one long-lived client per configured project/process:

```ts
import { GetMonitor } from "@getmonitor/node";

const gm = new GetMonitor(process.env.GETMONITOR_API_KEY!, {
  apiHost: process.env.GETMONITOR_API_HOST ?? "https://ingest.getmonitor.com",
  environment: process.env.NODE_ENV ?? "development",
  release: process.env.APP_RELEASE,
});
```

Automatic `uncaughtException` and `unhandledRejection` capture is enabled by default. The uncaught-exception hook awaits delivery and then exits with status 1, matching Node's normal behavior. For short-lived scripts, serverless functions, edge handlers, or code that may exit immediately, use the immediate path:

```ts
await gm.captureExceptionImmediate(error);
```

Normal `captureException()` uses an in-memory retry queue. Do not rely on that queue surviving process shutdown.

For Express, register the middleware after all routes and before application error handlers:

```ts
import express from "express";
import { setupExpressErrorHandler } from "@getmonitor/node";

const app = express();
// routes and ordinary middleware
setupExpressErrorHandler(gm, app);
// custom four-argument error handlers
```

The middleware captures with `mechanism: "express_middleware"`, marks the error handled, and calls `next(err)` so existing error handlers still run. Express is an optional peer dependency; install it only when using this helper.

Call `gm.shutdown()` when a client has a shorter lifetime than the process, especially in tests, to remove its process listeners.

## Request identity and context

Both SDKs support:

```ts
client.identify(userId, { plan: "pro" });
client.addBreadcrumb({
  category: "checkout",
  message: "user applied promo code",
  data: { orderId },
});
```

In Node concurrent servers, do not call `identify()` directly with request-specific data on a shared client: that global identity can leak across in-flight requests. Use `runWithIdentity()`:

```ts
gm.runWithIdentity(req.user.id, () => next(), { plan: req.user.plan });
```

Browser breadcrumbs are automatically collected from console log/info/warn, navigation, and clicks, with a count-capped ring buffer. Node breadcrumbs are manual only. Breadcrumbs are attached to exception events; they are not sent as standalone events.

## Filtering, grouping, and limits

Shared configuration supports:

```ts
GetMonitor.init(apiKey, {
  apiHost,
  ignoreErrors: ["ResizeObserver loop limit exceeded", /^Network request failed/],
  beforeCapture(event) {
    if (event.user?.internal) return null;
    event.fingerprint = ["checkout-failure"];
    return event;
  },
  rateLimit: { maxTokens: 10, refillIntervalMs: 10_000 },
});
```

- `ignoreErrors` matches exception type/message using strings or regular expressions.
- `beforeCapture` runs after filtering and may mutate the event or return `null` to drop it.
- Browser only: `denyUrls` and `allowUrls` match stack-frame source filenames.
- Default grouping uses exception type/message without a stack, or type plus the first in-app stack frame with a stack. Override with `fingerprint` in capture options or `beforeCapture`.
- The default per-exception-type token bucket has 10 tokens and refills one token every 10 seconds. Dropped events do not consume rate-limit budget.

Do not put secrets, passwords, authorization headers, or sensitive request bodies into `tags`, `context`, breadcrumbs, user traits, or custom event data. The SDK's public project key is ingest-only, but captured application data may still be sensitive.

## Event contract

The shared event contains `eventId`, `timestamp`, optional `release`/`environment`, `fingerprint`, an `exceptions` array, `handled`, `level`, `mechanism`, `breadcrumbs`, optional `user`, `tags`, and platform-specific `context`.

Supported mechanisms currently include:

```text
uncaught_exception | unhandled_rejection | console_error | manual | react_error_boundary | express_middleware
```

The SDK normalizes plain thrown values, chained `error.cause`, and `AggregateError`; exception chains are ordered root cause first and primary error last. Treat this as the current upstream contract and link to the source instead of duplicating types in Kubo.

## Kubo integration rules

- Keep `getmonitor` as the canonical `observability` identifier and retain `none`.
- Treat GetMonitor as an observability provider, not an addon, database, API, auth, or deployment target.
- Select the platform package from the generated runtime/frontend. Do not install a browser SDK into server-only projects or a Node SDK into browser bundles.
- Add a real SDK integration only when the generated project has a clear environment/configuration strategy and the selected runtime is supported. Documentation-only selection is not equivalent to SDK integration.
- Do not generate uptime-monitor, incident, maintenance, or status-page setup instructions from this SDK repository.
- Do not invent source-map, React error-boundary, Next.js, Nuxt, or backend-admin integrations while upstream marks those phases deferred.
- Keep `apiHost`, project-key names, environment, and release configurable; do not hardcode the project key.
- For server rendering, initialize browser tracking only in a client boundary; for Node, initialize the client once at server startup.
- Generated READMEs and post-install output must link to the upstream package README matching the selected platform and clearly distinguish public browser keys from server configuration.

## Verification

For a Kubo schema/provider change, verify the provider through the full path: shared schema/types, CLI flags and prompts, `kubojs.jsonrc`, reproducible command, web stack-builder state/URL/command, generated README, post-install output, and tests.

For a generated SDK integration, verify at minimum:

1. The selected package is present in the generated manifest and only the appropriate platform package is used.
2. Initialization is guarded by the selected runtime's client/server boundary.
3. The configured `apiHost` and key are passed to the SDK without hardcoded secrets.
4. A manual exception reaches a test/mock endpoint at `/api/v1/exceptions` with bearer authentication.
5. Browser automatic capture, Node automatic capture, Express middleware, or immediate delivery are tested when those paths are generated.
6. `gm.shutdown()` is used in short-lived Node test fixtures.
7. Existing application error handling still runs after SDK capture.
8. Sensitive data is excluded from identity, breadcrumbs, tags, and context.

Run the upstream repository's relevant checks when investigating SDK behavior:

```bash
pnpm install
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
```

The upstream repository currently requires Node `>=20` and pnpm `10`; the root project has no CI workflow, so these checks are local.

## Source resources

Use these primary resources and prefer the platform README over memory:

- [Upstream repository](https://github.com/get-monitor/getmonitor-js)
- [Upstream README](https://github.com/get-monitor/getmonitor-js/blob/main/README.md)
- [Browser SDK README](https://github.com/get-monitor/getmonitor-js/blob/main/packages/browser/README.md)
- [Node SDK README](https://github.com/get-monitor/getmonitor-js/blob/main/packages/node/README.md)
- [Core README and event schema](https://github.com/get-monitor/getmonitor-js/blob/main/packages/core/README.md)
- [Browser SDK source](https://github.com/get-monitor/getmonitor-js/tree/main/packages/browser/src)
- [Node SDK source](https://github.com/get-monitor/getmonitor-js/tree/main/packages/node/src)
- [Core types](https://github.com/get-monitor/getmonitor-js/blob/main/packages/core/src/types.ts)
- [Core transport](https://github.com/get-monitor/getmonitor-js/blob/main/packages/core/src/httpClient.ts)
- [Upstream package releases](https://github.com/get-monitor/getmonitor-js/releases)

When upstream changes package names, supported mechanisms, endpoint/authentication, deferred phases, or initialization behavior, re-read the repository and update this skill before changing Kubo templates.
