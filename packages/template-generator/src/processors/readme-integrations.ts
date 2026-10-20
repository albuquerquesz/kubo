import type { ProjectConfig } from "@kubojs/types";

type IntegrationSetup = {
  readonly enabled: (config: ProjectConfig) => boolean;
  readonly render: (config: ProjectConfig) => string;
};

type IntegrationFeature = {
  readonly enabled: (
    observability: ProjectConfig["observability"],
    communication: ProjectConfig["communication"],
  ) => boolean;
  readonly content: string;
};

const generateGetMonitorSetup = (): string => `
## GetMonitor Setup

This project includes the [GetMonitor JavaScript error-tracking SDK](https://github.com/get-monitor/getmonitor-js).

Keys are **optional for local first run** — the app starts without them and capture stays idle until you configure a project key.

1. Create a GetMonitor project and copy its public project key (\`gm_xxx\`).
2. Set the generated \`.env\` value ending in \`GETMONITOR_API_KEY\` for the web app and/or server when you are ready to send events.
3. Ingestion uses a fixed host (\`http://ingest.getmonitor.io\`) — no \`apiHost\` env var is required.
4. Optional (Next.js / Nuxt production builds): set \`GETMONITOR_AUTH_TOKEN\` (secret, never public) so source maps upload during \`next build\` / \`nuxt build\`.

Browser uncaught errors are captured after the client bootstrap runs. React apps also wrap the tree in \`<GetMonitorErrorBoundary>\`. Node server errors are captured when the server key is configured.

See the [browser](https://github.com/get-monitor/getmonitor-js/tree/main/packages/browser), [Node](https://github.com/get-monitor/getmonitor-js/tree/main/packages/node), [React](https://github.com/get-monitor/getmonitor-js/tree/main/packages/react), [Next.js](https://github.com/get-monitor/getmonitor-js/tree/main/packages/nextjs-config), and [Nuxt](https://github.com/get-monitor/getmonitor-js/tree/main/packages/nuxt) package guides.
`;

const generateHimetricaSetup = (): string => `
## Himetrica Setup

This project includes the [Himetrica TypeScript tracker](https://www.himetrica.com/docs/web).

1. Create a Himetrica project and copy its public tracker key (\`hm_pk_...\`).
2. Set the generated web \`.env\` value ending in \`HIMETRICA_API_KEY\`.
3. Page views, uncaught errors, and Web Vitals are collected automatically when the key is configured.
4. Add product events with the SDK's \`track\` method; do not send secrets, source code, or raw user input.

The generated integration is browser-only. Keep Himetrica secret keys out of client projects and use the Himetrica Server API from a server-only module for trusted backend events.
`;

const generateMillionSendSetup = (config: ProjectConfig): string => {
  const envPath =
    config.backend === "convex"
      ? "packages/backend/.env.local"
      : config.backend === "self"
        ? "apps/web/.env"
        : "apps/server/.env";
  const convexNote =
    config.backend === "convex"
      ? "For hosted Convex, configure these values in the Convex deployment environment (for example with `bunx convex env set MILLIONSEND_API_KEY <key>`). Import the package only from backend Actions; no web env loader is used."
      : "";

  return `
## MillionSend Setup

This project includes the official [MillionSend TypeScript SDK](https://github.com/MillionSend/millionsend-node) through \`packages/millionsend\`.

1. Set \`MILLIONSEND_API_KEY\` (\`ms_...\`) in \`${envPath}\` **before importing the client**. The SDK creates the client once and throws if the key is missing.
2. Replace \`MILLIONSEND_FROM_EMAIL\` with a verified domain sender. The generated \`noreply@example.com\` address is a placeholder.
3. Cloud uses \`https://api.millionsend.com\`. For self-hosting, set \`MILLIONSEND_BASE_URL\` to your API origin. Loopback HTTP is allowed; other plain HTTP origins require explicitly changing the client's SDK options to \`allowInsecureHttp: true\`. HTTPS is recommended.

${convexNote}

\`\`\`ts
import { millionsend, sendEmail } from "@${config.projectName}/millionsend";

await sendEmail({
  to: "user@example.com",
  subject: "Hello",
  html: "<strong>It works!</strong>",
  idempotencyKey: "welcome/user-123",
});

// The complete SDK is available, including received mail and inboxes.
const { data, error } = await millionsend.emails.receiving.list({ inboxId: "your-inbox-id" });
\`\`\`

Reuse an idempotency key for retries of the same send. The helper returns the sent data and throws on SDK errors; the raw client returns \`{ data, error }\`.
`;
};

const generateResendSetup = (): string => `
## Resend Setup

This project includes a \`packages/email\` helper powered by [Resend](https://resend.com).

Keys are **optional for local first run** — the app starts without them. \`sendEmail\` throws only when you call it without \`RESEND_API_KEY\`.

1. Create an API key at [resend.com/api-keys](https://resend.com/api-keys).
2. Set \`RESEND_API_KEY\` (and optionally \`RESEND_FROM_EMAIL\`) in the server \`.env\`.
3. For production, verify a domain and replace the default test From address (\`onboarding@resend.dev\`).

\`\`\`ts
import { sendEmail } from "@your-project/email";

await sendEmail({
  to: "user@example.com",
  subject: "Hello",
  html: "<strong>It works!</strong>",
});
\`\`\`

See the [Node.js guide](https://resend.com/docs/send-with-nodejs).
`;

const generateNotifiqueSetup = (): string => `
## Notifique Setup

This project includes a \`packages/notifique\` REST client for [Notifique](https://notifique.dev) (WhatsApp, SMS, email, and more).

\`NOTIFIQUE_API_KEY\` is **required** by the Zod schema in \`packages/env\` (typed \`env.NOTIFIQUE_*\`). \`NOTIFIQUE_FROM_EMAIL\` has a default. Set \`SKIP_ENV_VALIDATION=1\` only if you need to boot before filling secrets.

1. Create an API key in the [Developer panel](https://docs.notifique.dev/guides/api-key/index) (\`sk_live_…\` or sandbox \`sk_test_…\`).
2. Grant the scopes you need (e.g. \`sms:send\`, \`whatsapp:send\`, \`email:send\`).
3. Set \`NOTIFIQUE_API_KEY\` in the server \`.env\`. Optionally set \`NOTIFIQUE_WHATSAPP_INSTANCE_ID\` and a verified \`NOTIFIQUE_FROM_EMAIL\`.
4. Auth is **Bearer only** — do not send \`x-workspace-id\`.

\`\`\`ts
import { sendSms, sendWhatsAppText, sendEmail } from "@your-project/notifique";

await sendSms({
  to: "5511999999999",
  message: "Seu código é 123456",
  idempotencyKey: "otp/user-123",
});

await sendWhatsAppText({
  instanceId: "INSTANCE_ID",
  to: "5511999999999",
  message: "Olá!",
});

await sendEmail({
  to: "cliente@example.com",
  subject: "Pedido confirmado",
  html: "<p>Obrigado!</p>",
});
\`\`\`

Agent skill / API map:

- https://docs.notifique.dev/skill.md
- https://docs.notifique.dev/llms.txt
`;

const generateAraraSetup = (config: ProjectConfig): string => {
  const envPath = config.backend === "convex" ? "packages/backend/.env.local" : "the server .env";
  const importPath = `@${config.projectName}/arara`;
  return `
## AraraHQ Setup

This project includes the official [AraraHQ Node SDK](https://docs.ararahq.com/sdks/node) for WhatsApp messaging.

1. Create an AraraHQ API key.
2. Set \`ARARA_API_KEY\` in \`${envPath}\`.
3. Use the SDK only from server code. AraraHQ is not generated for browser code or Edge/Workers runtimes.
4. With Convex, call the generated \`api.arara.execute\` Node Action.

\`\`\`ts
import { arara } from "${importPath}";

await arara.sendMessage({
  receiver: "whatsapp:+5511999999999",
  body: "Olá!",
});

await arara.getMessage("ara_msg_xxx");
await arara.listTemplates();
\`\`\`

The package also exposes template creation and template-status helpers. See the [official SDK docs](https://docs.ararahq.com/sdks/node).
`;
};

const INTEGRATION_SETUPS: readonly IntegrationSetup[] = [
  {
    enabled: (config) => config.observability.includes("getmonitor"),
    render: () => generateGetMonitorSetup(),
  },
  {
    enabled: (config) => config.observability.includes("himetrica"),
    render: () => generateHimetricaSetup(),
  },
  {
    enabled: (config) => config.communication.includes("millionsend"),
    render: generateMillionSendSetup,
  },
  {
    enabled: (config) => config.communication.includes("resend"),
    render: () => generateResendSetup(),
  },
  {
    enabled: (config) => config.communication.includes("notifique"),
    render: () => generateNotifiqueSetup(),
  },
  {
    enabled: (config) => config.communication.includes("arara"),
    render: generateAraraSetup,
  },
];

const INTEGRATION_FEATURES: readonly IntegrationFeature[] = [
  {
    enabled: (observability) => observability.includes("getmonitor"),
    content: "- **GetMonitor** - JavaScript error tracking for browser and server runtimes",
  },
  {
    enabled: (observability) => observability.includes("himetrica"),
    content: "- **Himetrica** - Browser analytics, error tracking, and Web Vitals",
  },
  {
    enabled: (_observability, communication) => communication.includes("millionsend"),
    content: "- **MillionSend** - Cloud or self-hosted email via packages/millionsend",
  },
  {
    enabled: (_observability, communication) => communication.includes("resend"),
    content: "- **Resend** - Transactional email via packages/email",
  },
  {
    enabled: (_observability, communication) => communication.includes("notifique"),
    content:
      "- **Notifique** - Omnichannel messaging (SMS, WhatsApp, email) via packages/notifique",
  },
  {
    enabled: (_observability, communication) => communication.includes("arara"),
    content: "- **AraraHQ** - WhatsApp messaging through the official Node SDK",
  },
];

export function generateIntegrationSetups(config: ProjectConfig): string {
  return INTEGRATION_SETUPS.filter((setup) => setup.enabled(config))
    .map((setup) => setup.render(config))
    .join("\n");
}

export function getIntegrationFeatures(
  observability: ProjectConfig["observability"],
  communication: ProjectConfig["communication"],
): string[] {
  return INTEGRATION_FEATURES.filter((feature) =>
    feature.enabled(observability, communication),
  ).map((feature) => feature.content);
}
