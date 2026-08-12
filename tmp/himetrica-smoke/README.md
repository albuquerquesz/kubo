# Himetrica SDK smoke app

This isolated Bun app validates the installed `@himetrica/tracker-js` surface without sending analytics to Himetrica. It provides a minimal browser shim, intercepts `fetch`, and checks that automatic page views drain queued custom events and that captured messages use the SDK's tracker endpoints.

```bash
bun install
bun run check
bun run src/index.ts
```

The API key and endpoint are intentionally fake/local to the test. Do not put a real secret key in this app.
