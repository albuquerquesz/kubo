# Himetrica integration reference

Official sources:

- Web Tracker: https://www.himetrica.com/docs/web
- Server API: https://www.himetrica.com/docs/server-api
- TypeScript/React package: https://www.npmjs.com/package/@himetrica/tracker-js
- Complete machine-readable docs: https://www.himetrica.com/llms-full.txt

## TypeScript SDK surface

The package is `@himetrica/tracker-js`. The documented client is `HimetricaClient`; the React entry point exposes `HimetricaProvider`, `HimetricaErrorBoundary`, `useHimetrica`, `useTrackEvent`, and `useCaptureError`.

Documented client capabilities:

- `trackPageView(path?)`
- `track(eventName, properties?)`
- `identify({ userId?, name?, email?, metadata? })`
- `captureError(error, context?)`
- `captureMessage(message, severity?, context?)`
- `getVisitorId()`
- `reset()`, `flush()`, and `destroy()`

Configuration documented by the package includes `autoTrackPageViews`, `autoTrackErrors`, `interceptConsole`, `trackVitals`, `respectDoNotTrack`, and `sessionTimeout`. Verify the installed version's declarations before relying on a field or method.

## Kubo implementation map

### Website and docs

Add one provider/initialization boundary in `apps/web`, then expose a typed event helper. Track page views once, docs search submissions, important outbound clicks, Builder starts, command copies, and generation outcomes. Keep event dispatch in client components or a browser-safe utility.

### Stack Builder

Instrument the existing selection and generation state transitions rather than individual presentational tiles. Prefer events at meaningful boundaries:

```ts
track("stack_option_selected", { category: "database", value: "sqlite" });
track("command_copied", { source: "builder" });
track("project_generation_succeeded", { frontend, backend, database });
```

Normalize values and avoid sending arbitrary form data.

### Errors and Web Vitals

Use the React error boundary or client options for uncaught errors. Enable Web Vitals only once. If the current site already has another error/performance provider, decide whether Himetrica replaces it or receives a deliberately non-duplicated subset.

### Server-side events

For trusted events, call the Server API from a server-only module:

```ts
const response = await fetch("https://app.himetrica.com/api/v1/track", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.HIMETRICA_SECRET_KEY!,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    userId,
    eventName: "project_generation_succeeded",
    properties: { frontend, backend, database },
  }),
});

if (!response.ok) {
  throw new Error("Himetrica event failed");
}
```

Adapt this to the repository's existing result/error conventions and make failures non-blocking for the primary operation. The Server API documents `POST /track`, `POST /identify`, and `GET /user-id`; secret keys start with `hm_sk_` and must remain server-only.

## Privacy and migration notes

- Use consent before `identify` or other PII-bearing events.
- Do not send passwords, tokens, source code, raw prompts, full URLs containing secrets, or unbounded user input.
- Existing Umami code means a migration needs a cutover plan: define the source of truth, avoid duplicate page views, and keep dashboards comparable during the transition.
- Treat the SDK and React/Next integration as evolving; check the official docs and package declarations at implementation time.
