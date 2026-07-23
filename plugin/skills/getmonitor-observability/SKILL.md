---
name: getmonitor-observability
description: Configure GetMonitor uptime monitoring, alerts, incidents, maintenance, and status pages for kubojs generated applications.
---

# GetMonitor observability

Use this skill when a kubojs project selects `observability: "getmonitor"`, or when setting up GetMonitor for a deployed application.

## Product model

GetMonitor is an external observability service; it monitors public endpoints and provides alerting and hosted status pages. It does not require an application SDK, a runtime dependency, or an API key in the generated project.

Core concepts from the official documentation:

- **HTTP monitors** check public URLs for availability, response status, response time, and uptime statistics.
- **Alert integrations** can notify email, SMS, Slack, Discord, Telegram, or a webhook. Configure and test at least one channel.
- **Status pages** expose monitor status publicly or privately, group monitors as components, and can show incident/maintenance timelines.
- **Incidents** record unexpected outages; publish updates promptly until resolved.
- **Maintenance windows** communicate planned downtime and should be updated at start, during lengthy work, and at completion.

## Generated-project workflow

1. Deploy the application before creating monitors: GetMonitor must reach a stable public URL.
2. Choose a lightweight endpoint that represents application availability. Prefer a dedicated health endpoint when one exists; otherwise use a stable public page or API route.
3. In GetMonitor, create an HTTP monitor:
   - use the deployed public URL;
   - expect a successful 2xx response;
   - choose a timeout and interval appropriate for the service.
4. Attach alert destinations. Use at least two channels for critical production services, and test delivery.
5. Create a status page, add the monitor as a component, and choose public/private visibility deliberately.
6. Record unexpected outages as incidents. Use maintenance events for planned work instead of creating an incident.

## Webhook alerts

A GetMonitor webhook integration sends JSON with `event_type: "monitor_alert"`, monitor identity/status, check status/timestamp/region/response data, and failure context. Treat webhook endpoints as authenticated integration boundaries: validate any shared secret/header configured in GetMonitor, do not log credentials, and make handlers idempotent.

## Repository integration rules

- Model selection as the top-level `observability` provider, not as an addon or deploy target.
- Use the canonical identifier `getmonitor`; always support `none`.
- Propagate it through shared schemas/types, CLI input, interactive prompt, bts.jsonc, reproducible command, stack-builder state/URL/command, README, post-install output, and tests.
- Do not install a GetMonitor SDK or add fake environment variables: GetMonitor monitors public URLs and the docs do not require one for basic HTTP monitoring.
- Generated documentation must tell users to deploy first and configure monitors/alerts/status pages in GetMonitor.

## Verification

Run:

```bash
bun run build:cli
cd apps/cli && bun test test/observability.test.ts test/input-schemas.test.ts
```

Then run a Bun virtual-generation smoke test with `observability: "getmonitor"` and verify generated README output includes `## GetMonitor Setup` and the official documentation URL.

## Source documentation

- https://getmonitor.io/docs/getting-started/introduction/
- https://getmonitor.io/docs/monitoring/creating-monitors
- https://getmonitor.io/docs/status-pages/overview
- https://getmonitor.io/docs/incidents-maintenance/incidents
- https://getmonitor.io/docs/notifications/integrations
