import type { ProjectConfig } from "@kubojs/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import { getDbScriptSupport } from "../utils/db-scripts";

function getDesktopStaticBuildNote(frontend: ProjectConfig["frontend"]): string {
  const staticBuildFrontends = new Map([
    ["tanstack-start", "TanStack Start"],
    ["next", "Next.js"],
    ["nuxt", "Nuxt"],
    ["svelte", "SvelteKit"],
    ["astro", "Astro"],
  ]);

  const staticBuildFrontend = frontend.find((value) => staticBuildFrontends.has(value));
  if (!staticBuildFrontend) {
    return "";
  }

  return `Desktop builds package static web assets. ${staticBuildFrontends.get(
    staticBuildFrontend,
  )} needs a static/export build configuration before desktop packaging will work.`;
}

function getClerkQuickstartUrl(frontend: ProjectConfig["frontend"]): string {
  if (frontend.includes("next")) return "https://clerk.com/docs/nextjs/getting-started/quickstart";
  if (frontend.includes("react-router")) {
    return "https://clerk.com/docs/react-router/getting-started/quickstart";
  }
  if (frontend.includes("tanstack-start")) {
    return "https://clerk.com/docs/tanstack-react-start/getting-started/quickstart";
  }
  if (frontend.includes("tanstack-router")) {
    return "https://clerk.com/docs/react/getting-started/quickstart";
  }
  if (
    frontend.includes("native-bare") ||
    frontend.includes("native-uniwind") ||
    frontend.includes("native-unistyles")
  ) {
    return "https://clerk.com/docs/expo/getting-started/quickstart";
  }

  return "https://clerk.com/docs";
}

function getClerkFrontendEnvLines(frontend: ProjectConfig["frontend"]): string[] {
  const lines: string[] = [];

  if (frontend.includes("next")) {
    lines.push("- Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `apps/web/.env`");
  }

  if (
    frontend.some((value) => ["react-router", "tanstack-router", "tanstack-start"].includes(value))
  ) {
    lines.push("- Set `VITE_CLERK_PUBLISHABLE_KEY` in `apps/web/.env`");
  }

  if (
    frontend.some((value) => ["native-bare", "native-uniwind", "native-unistyles"].includes(value))
  ) {
    lines.push("- Set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `apps/native/.env`");
  }

  return lines;
}

function getClerkSetupLines(
  frontend: ProjectConfig["frontend"],
  backend: ProjectConfig["backend"],
  api: ProjectConfig["api"],
  isConvex: boolean,
): string[] {
  const lines = getClerkFrontendEnvLines(frontend);
  const hasClerkServerFrontend = frontend.some((value) =>
    ["next", "react-router", "tanstack-start"].includes(value),
  );

  if (isConvex) {
    return [
      "- Set `CLERK_JWT_ISSUER_DOMAIN` in Convex Dashboard",
      ...lines,
      ...(hasClerkServerFrontend
        ? ["- Set `CLERK_SECRET_KEY` in `apps/web/.env` for Clerk server middleware"]
        : []),
    ];
  }

  const serverEnvPath = backend === "self" ? "apps/web/.env" : "apps/server/.env";
  const needsServerSideClerkAuth = backend !== "none";
  const needsClerkBackendPublishableKey = ["express", "fastify"].includes(backend);
  const needsClerkRequestVerification =
    api !== "none" && ["self", "hono", "elysia"].includes(backend);

  if (hasClerkServerFrontend && backend === "self") {
    lines.push(
      "- Set `CLERK_SECRET_KEY` in `apps/web/.env` for Clerk server middleware and server-side Clerk auth",
    );
  } else {
    if (hasClerkServerFrontend) {
      lines.push("- Set `CLERK_SECRET_KEY` in `apps/web/.env` for Clerk server middleware");
    }

    if (needsServerSideClerkAuth) {
      lines.push(`- Set \`CLERK_SECRET_KEY\` in \`${serverEnvPath}\` for server-side Clerk auth`);
    }
  }

  if (needsClerkRequestVerification) {
    lines.push(
      `- Set \`CLERK_PUBLISHABLE_KEY\` in \`${serverEnvPath}\` for server-side Clerk request verification`,
    );
  }

  if (needsClerkBackendPublishableKey) {
    lines.push(
      `- Set \`CLERK_PUBLISHABLE_KEY\` in \`${serverEnvPath}\` for Clerk backend middleware`,
    );
  }

  return lines;
}

function hasNativeFrontend(frontend: ProjectConfig["frontend"]): boolean {
  return frontend.some((value) =>
    ["native-bare", "native-uniwind", "native-unistyles"].includes(value),
  );
}

function hasWebFrontend(frontend: ProjectConfig["frontend"]): boolean {
  return frontend.some((value) =>
    [
      "tanstack-router",
      "react-router",
      "tanstack-start",
      "next",
      "svelte",
      "nuxt",
      "solid",
      "astro",
    ].includes(value),
  );
}

export function processReadme(vfs: VirtualFileSystem, config: ProjectConfig): void {
  const content = generateReadmeContent(config);
  vfs.writeFile("README.md", content);
}

function generateReadmeContent(options: ProjectConfig): string {
  const {
    projectName,
    packageManager,
    database,
    auth,
    payments,
    observability,
    communication,
    addons = [],
    orm = "drizzle",
    runtime = "bun",
    frontend = ["tanstack-router"],
    backend = "hono",
    api = "trpc",
    dbSetup,
    webDeploy,
    serverDeploy,
  } = options;

  const isConvex = backend === "convex";
  const hasReactRouter = frontend.includes("react-router");
  const hasNative = hasNativeFrontend(frontend);
  const hasReactWeb = frontend.some((f) =>
    ["tanstack-router", "react-router", "tanstack-start", "next"].includes(f),
  );
  const hasSvelte = frontend.includes("svelte");
  const hasAstro = frontend.includes("astro");
  const packageManagerRunCmd = `${packageManager} run`;
  // TanStack Router/Start, Next, Nuxt and Solid all dev on 3001; only React Router and SvelteKit use Vite's default 5173.
  const webPort = hasReactRouter || hasSvelte ? "5173" : hasAstro ? "4321" : "3001";

  const stackDescription = generateStackDescription(frontend, backend, api, isConvex);

  return `# ${projectName}

This project was created with [kubojs](https://github.com/albuquerquesz/kubo), a modern TypeScript stack${
    stackDescription ? ` that combines ${stackDescription}` : ""
  }.

## Features

${generateFeaturesList(database, auth, payments, observability, communication, addons, orm, runtime, frontend, backend, api, dbSetup)}

## Getting Started

First, install the dependencies:

\`\`\`bash
${packageManager} install
\`\`\`
${
  isConvex
    ? `
## Convex Setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

\`\`\`bash
${packageManagerRunCmd} dev:setup
\`\`\`

Follow the prompts to create a new Convex project and connect it to your application.

Copy environment variables from \`packages/backend/.env.local\` to \`apps/*/.env\`.
${
  auth === "clerk"
    ? `
### Clerk Authentication Setup

- Follow the guide: [Convex + Clerk](https://docs.convex.dev/auth/clerk)
${getClerkSetupLines(frontend, backend, api, true).join("\n")}`
    : ""
}`
    : generateDatabaseSetup(options, packageManagerRunCmd)
}
${
  !isConvex && auth === "clerk"
    ? `
## Clerk Authentication Setup

- Follow the guide: [Clerk Quickstart](${getClerkQuickstartUrl(frontend)})
${getClerkSetupLines(frontend, backend, api, false).join("\n")}`
    : ""
}
${payments === "abacatepay" ? generateAbacatePaySetup(options, packageManagerRunCmd, webPort) : ""}
${observability.includes("getmonitor") ? generateGetMonitorSetup() : ""}
${observability.includes("himetrica") ? generateHimetricaSetup() : ""}
${communication === "resend" ? generateResendSetup() : ""}
${communication === "notifique" ? generateNotifiqueSetup() : ""}

Then, run the development server:

\`\`\`bash
${packageManagerRunCmd} dev
\`\`\`

${generateRunningInstructions(frontend, backend, webPort, hasNative, isConvex)}
${generateReactUiSection(hasReactWeb, projectName)}
${
  addons.includes("pwa") && hasReactRouter
    ? "\n## PWA Support with React Router v7\n\nThere is a known compatibility issue between VitePWA and React Router v7.\nSee: https://github.com/vite-pwa/vite-plugin-pwa/issues/809\n"
    : ""
}
${generateDeploymentCommands(packageManagerRunCmd, webDeploy, serverDeploy, backend)}
${generateGitHooksSection(packageManagerRunCmd, addons)}

## Project Structure

\`\`\`
${generateProjectStructure(options)}
\`\`\`

## Available Scripts

${generateScriptsList(packageManagerRunCmd, options, hasNative)}
`;
}

function generateStackDescription(
  frontend: ProjectConfig["frontend"],
  backend: ProjectConfig["backend"],
  api: ProjectConfig["api"],
  isConvex: boolean,
): string {
  const parts: string[] = [];

  const frontendMap: Record<string, string> = {
    "tanstack-router": "React, TanStack Router",
    "react-router": "React, React Router",
    next: "Next.js",
    "tanstack-start": "React, TanStack Start",
    svelte: "SvelteKit",
    nuxt: "Nuxt",
    solid: "SolidJS",
    astro: "Astro",
    "native-bare": "React Native, Expo",
    "native-uniwind": "React Native, Expo",
    "native-unistyles": "React Native, Expo",
  };

  for (const fe of frontend) {
    if (frontendMap[fe]) {
      parts.push(frontendMap[fe]);
      break;
    }
  }

  if (backend !== "none") {
    parts.push((backend[0]?.toUpperCase() ?? "") + backend.slice(1));
  }

  if (!isConvex && api !== "none") {
    parts.push(api.toUpperCase());
  }

  return parts.length > 0 ? `${parts.join(", ")}, and more` : "";
}

function generateRunningInstructions(
  frontend: ProjectConfig["frontend"],
  backend: ProjectConfig["backend"],
  webPort: string,
  hasNative: boolean,
  isConvex: boolean,
): string {
  const instructions: string[] = [];
  const hasAppWebFrontend = hasWebFrontend(frontend);
  const isBackendSelf = backend === "self";

  if (hasAppWebFrontend) {
    const desc = isBackendSelf ? "fullstack application" : "web application";
    instructions.push(
      `Open [http://localhost:${webPort}](http://localhost:${webPort}) in your browser to see the ${desc}.`,
    );
  }

  if (hasNative) {
    instructions.push("Use the Expo Go app to run the mobile application.");
  }

  if (isConvex) {
    instructions.push("Your app will connect to the Convex cloud backend automatically.");
  } else if (backend !== "none" && !isBackendSelf) {
    instructions.push("The API is running at [http://localhost:3000](http://localhost:3000).");
  }

  return instructions.join("\n");
}

function generateReactUiSection(hasReactWeb: boolean, projectName: string): string {
  if (!hasReactWeb) return "";

  return `
## UI Customization

React web apps in this stack share shadcn/ui primitives through \`packages/ui\`.

- Change design tokens and global styles in \`packages/ui/src/styles/globals.css\`
- Update shared primitives in \`packages/ui/src/components/*\`
- Adjust shadcn aliases or style config in \`packages/ui/components.json\` and \`apps/web/components.json\`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

\`\`\`bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
\`\`\`

Import shared components like this:

\`\`\`tsx
import { Button } from "@${projectName}/ui/components/button"
\`\`\`

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from \`apps/web\`.
`;
}

function generateAbacatePaySetup(
  config: ProjectConfig,
  packageManagerRunCmd: string,
  webPort: string,
): string {
  const { backend, database, dbSetup, payments } = config;
  if (payments !== "abacatepay") return "";

  const envPath = backend === "self" ? "apps/web/.env" : "apps/server/.env";
  const localBaseUrl = backend === "self" ? `http://localhost:${webPort}` : "http://localhost:3000";
  const setupSteps = [
    `1. Configure these variables in \`${envPath}\`:\n- \`ABACATEPAY_API_KEY\`: your AbacatePay API key for server-to-server checkout creation\n- \`ABACATEPAY_WEBHOOK_SECRET\`: shared secret used in the webhook URL query string\n- \`ABACATEPAY_PUBLIC_KEY\`: public key used to verify \`X-Webhook-Signature\`\n- \`ABACATEPAY_RETURN_URL\`: where AbacatePay sends users when they leave checkout\n- \`ABACATEPAY_COMPLETION_URL\`: success page that reads local checkout status after webhook reconciliation`,
  ];

  if (database !== "none" && dbSetup === "none") {
    setupSteps.push(
      `2. Make sure \`DATABASE_URL\` is set in \`${envPath}\`. Payment status is stored locally and the success page reads that persisted state.`,
    );
  }

  setupSteps.push(
    `${setupSteps.length + 1}. Make sure \`CORS_ORIGIN\` in \`${envPath}\` matches your local web app URL.`,
  );

  if (database !== "none") {
    setupSteps.push(
      `${setupSteps.length + 1}. Apply the schema before testing checkout:\n\`\`\`bash\n${packageManagerRunCmd} db:push\n\`\`\``,
    );
  }

  setupSteps.push(
    `${setupSteps.length + 1}. Build from the project root after env is configured:\n\`\`\`bash\n${packageManagerRunCmd} build\n\`\`\``,
    `${setupSteps.length + 2}. Start the app and trigger the sample hosted checkout from the generated UI.`,
    `${setupSteps.length + 3}. Configure this webhook URL in AbacatePay:\n\`${localBaseUrl}/api/payments/abacatepay/webhook?webhookSecret=YOUR_WEBHOOK_SECRET\``,
    `${setupSteps.length + 4}. After payment, verify the success page and status endpoint reflect the locally stored checkout state instead of trusting the redirect alone.`,
  );

  return `
## AbacatePay Setup

This project includes a sample hosted-checkout integration for AbacatePay.

${setupSteps.join("\n\n")}

### Production note

The scaffold keeps a placeholder \`prod_your_product_id\` in \`packages/payments/src/lib/abacatepay.ts\`. Replace that hardcoded product ID in code before using this integration for real transactions.
`;
}

function generateGetMonitorSetup(): string {
  return `
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
}

function generateHimetricaSetup(): string {
  return `
## Himetrica Setup

This project includes the [Himetrica TypeScript tracker](https://www.himetrica.com/docs/web).

1. Create a Himetrica project and copy its public tracker key (\`hm_pk_...\`).
2. Set the generated web \`.env\` value ending in \`HIMETRICA_API_KEY\`.
3. Page views, uncaught errors, and Web Vitals are collected automatically when the key is configured.
4. Add product events with the SDK's \`track\` method; do not send secrets, source code, or raw user input.

The generated integration is browser-only. Keep Himetrica secret keys out of client projects and use the Himetrica Server API from a server-only module for trusted backend events.
`;
}

function generateProjectStructure(config: ProjectConfig): string {
  const { projectName, frontend, backend, addons, api, auth, database, orm, payments } = config;
  const isConvex = backend === "convex";
  const structure: string[] = [`${projectName}/`, "├── apps/"];
  const hasAppWebFrontend = hasWebFrontend(frontend);
  const isBackendSelf = backend === "self";
  const hasReactWeb = frontend.some((f) =>
    ["tanstack-router", "react-router", "tanstack-start", "next"].includes(f),
  );
  const hasNative = hasNativeFrontend(frontend);
  const hasDbPackage = !isConvex && database !== "none" && orm !== "none";

  if (hasAppWebFrontend) {
    const frontendTypes: Record<string, string> = {
      "tanstack-router": "React + TanStack Router",
      "react-router": "React + React Router",
      next: "Next.js",
      "tanstack-start": "React + TanStack Start",
      svelte: "SvelteKit",
      nuxt: "Nuxt",
      solid: "SolidJS",
      astro: "Astro",
    };
    const frontendType = frontend.find((f) => frontendTypes[f])
      ? frontendTypes[frontend.find((f) => frontendTypes[f]) || ""]
      : "";

    const prefix = isBackendSelf ? "└──" : "├──";
    const desc = isBackendSelf ? "Fullstack application" : "Frontend application";
    structure.push(`│   ${prefix} web/         # ${desc} (${frontendType})`);
  }

  if (hasNative) {
    structure.push("│   ├── native/      # Mobile application (React Native, Expo)");
  }

  if (addons.includes("starlight")) {
    structure.push("│   ├── docs/        # Documentation site (Astro Starlight)");
  }

  if (!isBackendSelf && backend !== "none" && !isConvex) {
    const backendName = (backend[0]?.toUpperCase() ?? "") + backend.slice(1);
    const apiName = api !== "none" ? api.toUpperCase() : "";
    const desc = apiName ? `${backendName}, ${apiName}` : backendName;
    structure.push(`│   └── server/      # Backend API (${desc})`);
  }

  if (isConvex || backend !== "none" || hasReactWeb) {
    structure.push("├── packages/");

    if (hasReactWeb) {
      structure.push("│   ├── ui/          # Shared shadcn/ui components and styles");
    }

    if (isConvex) {
      structure.push("│   ├── backend/     # Convex backend functions and schema");
      if (auth === "clerk") {
        structure.push(
          "│   │   ├── convex/    # Convex functions and schema",
          "│   │   └── .env.local # Convex environment variables",
        );
      }
    }

    if (!isConvex) {
      if (api !== "none") {
        structure.push("│   ├── api/         # API layer / business logic");
      }
      if (auth === "better-auth") {
        structure.push("│   ├── auth/        # Authentication configuration & logic");
      }
      if (hasDbPackage) {
        structure.push(
          payments === "abacatepay"
            ? "│   ├── db/          # Database schema & queries"
            : "│   └── db/          # Database schema & queries",
        );
      }
      if (payments === "abacatepay") {
        structure.push("│   └── payments/    # AbacatePay runtime and webhook helpers");
      }
    }
  }

  return structure.join("\n");
}

function generateResendSetup(): string {
  return `
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
}

function generateNotifiqueSetup(): string {
  return `
## Notifique Setup

This project includes a \`packages/notifique\` REST client for [Notifique](https://notifique.dev) (WhatsApp, SMS, email, and more).

Keys are **optional for local first run** — helpers throw only when called without \`NOTIFIQUE_API_KEY\`.

1. Create an API key in the [Developer panel](https://docs.notifique.dev/guides/api-key/index) (\`sk_live_…\` or sandbox \`sk_test_…\`).
2. Grant the scopes you need (e.g. \`sms:send\`, \`whatsapp:send\`, \`email:send\`).
3. Set \`NOTIFIQUE_API_KEY\` (and optionally \`NOTIFIQUE_WHATSAPP_INSTANCE_ID\`, \`NOTIFIQUE_FROM_EMAIL\`) in the server \`.env\`.
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
  from: "Acme <noreply@seudominio.com>",
  to: "cliente@example.com",
  subject: "Pedido confirmado",
  html: "<p>Obrigado!</p>",
});
\`\`\`

Agent skill / API map:

- https://docs.notifique.dev/skill.md
- https://docs.notifique.dev/llms.txt
`;
}

function generateFeaturesList(
  database: ProjectConfig["database"],
  auth: ProjectConfig["auth"],
  payments: ProjectConfig["payments"],
  observability: ProjectConfig["observability"],
  communication: ProjectConfig["communication"],
  addons: ProjectConfig["addons"],
  orm: ProjectConfig["orm"],
  runtime: ProjectConfig["runtime"],
  frontend: ProjectConfig["frontend"],
  backend: ProjectConfig["backend"],
  api: ProjectConfig["api"],
  dbSetup: ProjectConfig["dbSetup"],
): string {
  const isConvex = backend === "convex";
  const hasNative = hasNativeFrontend(frontend);
  const hasAppWebFrontend = hasWebFrontend(frontend);
  const hasReactWeb = frontend.some((f) =>
    ["tanstack-router", "react-router", "tanstack-start", "next"].includes(f),
  );
  const usesTailwind = hasAppWebFrontend || frontend.includes("native-uniwind");

  const features = ["- **TypeScript** - For type safety and improved developer experience"];

  if (observability.includes("getmonitor")) {
    features.push("- **GetMonitor** - JavaScript error tracking for browser and server runtimes");
  }

  if (observability.includes("himetrica")) {
    features.push("- **Himetrica** - Browser analytics, error tracking, and Web Vitals");
  }

  if (communication === "resend") {
    features.push("- **Resend** - Transactional email via packages/email");
  }

  if (communication === "notifique") {
    features.push(
      "- **Notifique** - Omnichannel messaging (SMS, WhatsApp, email) via packages/notifique",
    );
  }

  const frontendFeatures: Record<string, string> = {
    "tanstack-router": "- **TanStack Router** - File-based routing with full type safety",
    "react-router": "- **React Router** - Declarative routing for React",
    next: "- **Next.js** - Full-stack React framework",
    "tanstack-start": "- **TanStack Start** - SSR framework with TanStack Router",
    svelte: "- **SvelteKit** - Web framework for building Svelte apps",
    nuxt: "- **Nuxt** - The Intuitive Vue Framework",
    solid: "- **SolidJS** - Simple and performant reactivity",
    astro: "- **Astro** - The web framework for content-driven websites",
  };

  for (const fe of frontend) {
    if (frontendFeatures[fe]) {
      features.push(frontendFeatures[fe]);
      break;
    }
  }

  if (hasNative) {
    features.push(
      "- **React Native** - Build mobile apps using React",
      "- **Expo** - Tools for React Native development",
    );
  }

  if (usesTailwind) {
    features.push("- **TailwindCSS** - Utility-first CSS for rapid UI development");
  }

  if (hasReactWeb) {
    features.push("- **Shared UI package** - shadcn/ui primitives live in `packages/ui`");
  }

  const backendFeatures: Record<string, string> = {
    convex: "- **Convex** - Reactive backend-as-a-service platform",
    hono: "- **Hono** - Lightweight, performant server framework",
    express: "- **Express** - Fast, unopinionated web framework",
    fastify: "- **Fastify** - Fast, low-overhead web framework",
    elysia: "- **Elysia** - Type-safe, high-performance framework",
  };

  if (backendFeatures[backend]) {
    features.push(backendFeatures[backend]);
  }

  if (!isConvex && api === "trpc") {
    features.push("- **tRPC** - End-to-end type-safe APIs");
  } else if (!isConvex && api === "orpc") {
    features.push("- **oRPC** - End-to-end type-safe APIs with OpenAPI integration");
  }

  if (!isConvex && backend !== "none" && runtime !== "none") {
    const runtimeName = runtime === "bun" ? "Bun" : runtime === "node" ? "Node.js" : runtime;
    features.push(`- **${runtimeName}** - Runtime environment`);
  }

  if (database !== "none" && !isConvex) {
    const ormNames: Record<string, string> = {
      drizzle: "Drizzle",
      prisma: "Prisma",
      mongoose: "Mongoose",
    };
    const dbNames: Record<string, string> = {
      sqlite: dbSetup === "d1" ? "Cloudflare D1" : dbSetup === "turso" ? "Turso" : "SQLite",
      postgres: "PostgreSQL",
      mysql: "MySQL",
      mongodb: "MongoDB",
    };
    features.push(
      `- **${ormNames[orm] || "ORM"}** - TypeScript-first ORM`,
      `- **${dbNames[database] || "Database"}** - Database engine`,
    );
  }

  if (auth !== "none") {
    const authLabel = auth === "clerk" ? "Clerk" : "Better-Auth";
    features.push(`- **Authentication** - ${authLabel}`);
  }

  if (payments === "abacatepay") {
    features.push("- **AbacatePay** - Hosted checkout with webhook-driven payment reconciliation");
  }

  const addonFeatures: Record<string, string> = {
    pwa: "- **PWA** - Progressive Web App support",
    tauri: "- **Tauri** - Build native desktop applications",
    electrobun: "- **Electrobun** - Lightweight desktop shell for web frontends",
    biome: "- **Biome** - Linting and formatting",
    oxlint: "- **Oxlint** - Oxlint + Oxfmt (linting & formatting)",
    husky: "- **Husky** - Git hooks for code quality",
    starlight: "- **Starlight** - Documentation site with Astro",
    turborepo: "- **Turborepo** - Optimized monorepo build system",
    nx: "- **Nx** - Smart monorepo task orchestration and caching",
    "vite-plus":
      "- **Vite+** - Unified Vite toolchain, workspace task runner, linting, and formatting",
  };

  for (const addon of addons) {
    if (addonFeatures[addon]) {
      features.push(addonFeatures[addon]);
    }
  }

  return features.join("\n");
}

function generateDatabaseSetup(config: ProjectConfig, packageManagerRunCmd: string): string {
  const { database, orm, dbSetup, backend } = config;
  if (database === "none") return "";

  const isBackendSelf = backend === "self";
  const envPath = isBackendSelf ? "apps/web/.env" : "apps/server/.env";
  const ormLabels: Record<ProjectConfig["orm"], string> = {
    drizzle: "Drizzle ORM",
    prisma: "Prisma",
    mongoose: "Mongoose",
    none: "ORM",
  };
  const ormDesc = orm === "none" ? "" : ` with ${ormLabels[orm] || orm}`;
  const dbSupport = getDbScriptSupport(config);
  const isD1Alchemy = dbSupport.isD1Alchemy;

  let setup = "## Database Setup\n\n";

  if (isD1Alchemy) {
    const steps: string[] = [];

    if (dbSupport.hasDbGenerate) {
      steps.push(
        `${steps.length + 1}. ${
          orm === "prisma" ? "Generate the Prisma client" : "Generate migration files"
        }:
\`\`\`bash
${packageManagerRunCmd} db:generate
\`\`\``,
      );
    }

    if (dbSupport.hasDbMigrate) {
      steps.push(`${steps.length + 1}. Create and apply Prisma migrations locally:
\`\`\`bash
${packageManagerRunCmd} db:migrate
\`\`\``);
    }

    return `${setup}This project uses Cloudflare D1 (SQLite)${ormDesc}.

Runtime database access uses the Cloudflare \`DB\` binding from \`packages/infra/alchemy.run.ts\`. If a local \`DATABASE_URL\` is present, it is only for database tooling.

Alchemy provisions the D1 database and applies migrations during \`dev\` and \`deploy\`.

${steps.join("\n\n")}
`;
  }

  const dbDescriptions: Record<string, string> = {
    sqlite: `This project uses SQLite${ormDesc}.

${
  dbSetup === "d1"
    ? `1. D1 local development and migrations are handled automatically by Alchemy during dev and deploy.

2. Update your \`.env\` file in the \`${isBackendSelf ? "apps/web" : "apps/server"}\` directory with the appropriate connection details if needed.`
    : dbSetup === "turso"
      ? `1. Start a local Turso/libsql replica (optional; requires the Turso CLI):
\`\`\`bash
${packageManagerRunCmd} db:local
\`\`\`

2. Update your \`.env\` file in the \`${isBackendSelf ? "apps/web" : "apps/server"}\` directory with the Turso URL and auth token.`
      : `1. Local SQLite uses a \`file:\` URL via libsql (no Turso account or CLI required). Default \`DATABASE_URL\` points at a local file database.

2. Update your \`.env\` file in the \`${isBackendSelf ? "apps/web" : "apps/server"}\` directory if you need a different path.`
}`,

    postgres: `This project uses PostgreSQL${ormDesc}.

1. Make sure you have a PostgreSQL database set up.
2. Update your \`${envPath}\` file with your PostgreSQL connection details.`,

    mysql: `This project uses MySQL${ormDesc}.

1. Make sure you have a MySQL database set up.
2. Update your \`${envPath}\` file with your MySQL connection details.`,

    mongodb: `This project uses MongoDB ${ormDesc.replace(" with ", "with ")}.

1. Make sure you have MongoDB set up.
2. Update your \`${envPath}\` file with your MongoDB connection URI.`,
  };

  setup += dbDescriptions[database] || "";

  if (dbSupport.hasDbPush) {
    setup += `

3. Apply the schema to your database:
\`\`\`bash
${packageManagerRunCmd} db:push
\`\`\`
`;
  }

  return setup;
}

function generateScriptsList(
  packageManagerRunCmd: string,
  config: ProjectConfig,
  hasNative: boolean,
): string {
  const { database, addons, backend, dbSetup, frontend, webDeploy, serverDeploy } = config;
  const isConvex = backend === "convex";
  const isBackendSelf = backend === "self";
  const hasWeb = frontend.some((f) =>
    [
      "tanstack-router",
      "react-router",
      "tanstack-start",
      "next",
      "nuxt",
      "svelte",
      "solid",
      "astro",
    ].includes(f),
  );
  const dbSupport = getDbScriptSupport(config);

  let scripts = `- \`${packageManagerRunCmd} dev\`: Start all applications in development mode
- \`${packageManagerRunCmd} build\`: Build all applications`;

  if (hasWeb) {
    scripts += `\n- \`${packageManagerRunCmd} dev:web\`: Start only the web application`;
  }

  if (isConvex) {
    scripts += `\n- \`${packageManagerRunCmd} dev:setup\`: Setup and configure your Convex project`;
  } else if (backend !== "none" && !isBackendSelf) {
    scripts += `\n- \`${packageManagerRunCmd} dev:server\`: Start only the server`;
  }

  scripts += `\n- \`${packageManagerRunCmd} check-types\`: Check TypeScript types across all apps`;

  if (hasNative) {
    scripts += `\n- \`${packageManagerRunCmd} dev:native\`: Start the React Native/Expo development server`;
  }

  if (dbSupport.hasDbScripts) {
    if (dbSupport.hasDbPush) {
      scripts += `\n- \`${packageManagerRunCmd} db:push\`: Push schema changes to database`;
    }
    if (dbSupport.hasDbGenerate) {
      scripts += `\n- \`${packageManagerRunCmd} db:generate\`: Generate database client/types`;
    }
    if (dbSupport.hasDbMigrate) {
      scripts += `\n- \`${packageManagerRunCmd} db:migrate\`: Run database migrations`;
    }
    if (dbSupport.hasDbStudio) {
      scripts += `\n- \`${packageManagerRunCmd} db:studio\`: Open database studio UI`;
    }
  }

  if (database === "sqlite" && dbSetup === "turso" && dbSupport.hasDbScripts) {
    scripts += `\n- \`${packageManagerRunCmd} db:local\`: Start a local Turso/libsql database (Turso CLI)`;
  }

  if (addons.includes("vite-plus")) {
    const hasVitePlusNativeHooks = !addons.includes("husky") && !addons.includes("lefthook");

    scripts += `\n- \`${packageManagerRunCmd} check\`: Run Vite+ format/lint checks and workspace TypeScript checks
- \`${packageManagerRunCmd} lint\`: Run Vite+ lint checks
- \`${packageManagerRunCmd} format\`: Run Vite+ formatting
- \`${packageManagerRunCmd} staged\`: Run Vite+ checks against staged files`;

    if (hasVitePlusNativeHooks) {
      scripts += `\n- \`${packageManagerRunCmd} hooks:setup\`: Install Vite+ native Git hooks with \`vp config\``;
    }
  } else if (addons.includes("biome")) {
    scripts += `\n- \`${packageManagerRunCmd} check\`: Run Biome formatting and linting`;
  } else if (addons.includes("oxlint")) {
    scripts += `\n- \`${packageManagerRunCmd} check\`: Run Oxlint and Oxfmt`;
  }

  if (addons.includes("pwa")) {
    scripts += `\n- \`cd apps/web && ${packageManagerRunCmd} generate-pwa-assets\`: Generate PWA assets`;
  }

  if (addons.includes("tauri")) {
    scripts += `\n- \`cd apps/web && ${packageManagerRunCmd} desktop:dev\`: Start Tauri desktop app in development
- \`cd apps/web && ${packageManagerRunCmd} desktop:build\`: Build Tauri desktop app`;
    const staticBuildNote = getDesktopStaticBuildNote(frontend);
    if (staticBuildNote) {
      scripts += `\n- Note: ${staticBuildNote}`;
    }
  }

  if (addons.includes("electrobun")) {
    scripts += `\n- \`${packageManagerRunCmd} dev:desktop\`: Start the Electrobun desktop app with HMR
- \`${packageManagerRunCmd} build:desktop\`: Build the stable Electrobun desktop app
- \`${packageManagerRunCmd} build:desktop:canary\`: Build the canary Electrobun desktop app`;
    const staticBuildNote = getDesktopStaticBuildNote(frontend);
    if (staticBuildNote) {
      scripts += `\n- Note: ${staticBuildNote}`;
    }
  }

  if (addons.includes("starlight")) {
    scripts += `\n- \`cd apps/docs && ${packageManagerRunCmd} dev\`: Start documentation site
- \`cd apps/docs && ${packageManagerRunCmd} build\`: Build documentation site`;
  }

  if (webDeploy === "docker" || serverDeploy === "docker") {
    scripts += `\n- \`${packageManagerRunCmd} docker:build\`: Build the Docker Compose images
- \`${packageManagerRunCmd} docker:up\`: Build and start the Docker Compose stack
- \`${packageManagerRunCmd} docker:logs\`: Tail logs from the Docker Compose stack
- \`${packageManagerRunCmd} docker:down\`: Stop the Docker Compose stack`;
  }

  if (webDeploy === "vercel" || serverDeploy === "vercel") {
    const v = getVercelScriptNames(webDeploy, serverDeploy);
    scripts += `\n- \`${packageManagerRunCmd} ${v.setup}\`: Link this repo to a Vercel project (first-time setup)
- \`${packageManagerRunCmd} dev:vercel\`: Run the Vercel Services dev environment locally
- \`${packageManagerRunCmd} ${v.envPreview}\`: Sync local env files to the Vercel preview environment
- \`${packageManagerRunCmd} ${v.envProduction}\`: Sync local env files to the Vercel production environment
- \`${packageManagerRunCmd} ${v.deploy}\`: Create a Vercel preview deployment
- \`${packageManagerRunCmd} ${v.deployProd}\`: Deploy to Vercel production
- \`${packageManagerRunCmd} ${v.deployCheck}\`: Dry-run a deploy to preview framework detection and included files without uploading`;
  }

  if (webDeploy === "guaracloud" || serverDeploy === "guaracloud") {
    const scriptSets = getGuaraCloudScriptSets(webDeploy, serverDeploy);
    scripts += `\n- \`${packageManagerRunCmd} deploy:login\`: Authenticate the Guara Cloud CLI`;
    for (const g of scriptSets) {
      const label = g.target === "web" ? "web service" : "server service";
      scripts += `\n- \`${packageManagerRunCmd} ${g.link}\`: Link the ${label} directory to Guara Cloud
- \`${packageManagerRunCmd} ${g.deploy}\`: Trigger a deployment on Guara Cloud for the ${label}
- \`${packageManagerRunCmd} ${g.logs}\`: Stream runtime logs for the ${label}
- \`${packageManagerRunCmd} ${g.buildLogs}\`: Stream build logs for the ${label}
- \`${packageManagerRunCmd} ${g.rollback}\`: Roll back the ${label} deployment`;
    }
  }

  return scripts;
}

function generateDeploymentCommands(
  packageManagerRunCmd: string,
  webDeploy: ProjectConfig["webDeploy"],
  serverDeploy: ProjectConfig["serverDeploy"],
  backend: ProjectConfig["backend"],
): string {
  const hasCloudflare = webDeploy === "cloudflare" || serverDeploy === "cloudflare";
  const hasDocker = webDeploy === "docker" || serverDeploy === "docker";
  const hasVercel = webDeploy === "vercel" || serverDeploy === "vercel";
  const hasGuaraCloud = webDeploy === "guaracloud" || serverDeploy === "guaracloud";

  if (!hasCloudflare && !hasDocker && !hasVercel && !hasGuaraCloud) {
    return "";
  }

  const lines: string[] = ["## Deployment"];

  if (hasCloudflare) {
    const targetLabel =
      webDeploy === "cloudflare" && (serverDeploy === "cloudflare" || backend === "self")
        ? "web + server"
        : webDeploy === "cloudflare"
          ? "web"
          : "server";
    const cfDeployScript = hasVercel
      ? webDeploy === "cloudflare"
        ? "deploy:web"
        : "deploy:server"
      : "deploy";

    lines.push(
      "",
      "### Cloudflare via Alchemy",
      "",
      `- Target: ${targetLabel}`,
      `- Dev: ${packageManagerRunCmd} dev`,
      `- Deploy: ${packageManagerRunCmd} ${cfDeployScript}`,
      `- Destroy: ${packageManagerRunCmd} destroy`,
      "",
      "For more details, see the guide on [Deploying to Cloudflare with Alchemy](https://www.kubojs.dev/docs/guides/cloudflare-alchemy).",
    );
  }

  if (hasDocker) {
    const targetLabel =
      webDeploy === "docker" && (serverDeploy === "docker" || backend === "self")
        ? "web + server"
        : webDeploy === "docker"
          ? "web"
          : "server";

    lines.push(
      "",
      "### Docker Compose",
      "",
      `- Target: ${targetLabel}`,
      "- Config: `docker-compose.yml` (app Dockerfiles live in `apps/*/Dockerfile`)",
      `- Build images: ${packageManagerRunCmd} docker:build`,
      `- Start: ${packageManagerRunCmd} docker:up`,
      `- Logs: ${packageManagerRunCmd} docker:logs`,
      `- Stop: ${packageManagerRunCmd} docker:down`,
      "",
      "Environment variables are read from each app's `.env` file (baked into web builds for public variables) and overridden in `docker-compose.yml` for container networking.",
      "",
      "For more details, see the guide on [Deploying with Docker Compose](https://www.kubojs.dev/docs/guides/docker).",
    );
  }

  if (hasVercel) {
    const vercelNames = getVercelScriptNames(webDeploy, serverDeploy);
    const targetLabel =
      webDeploy === "vercel" && (serverDeploy === "vercel" || backend === "self")
        ? "web + server"
        : webDeploy === "vercel"
          ? "web"
          : "server";

    lines.push(
      "",
      "### Vercel Services",
      "",
      `- Target: ${targetLabel}`,
      "- Config: `vercel.json`",
      `- Link the project first: ${packageManagerRunCmd} ${vercelNames.setup}`,
      `- Local Vercel dev: ${packageManagerRunCmd} dev:vercel`,
      `- Sync preview env: ${packageManagerRunCmd} ${vercelNames.envPreview}`,
      `- Sync production env: ${packageManagerRunCmd} ${vercelNames.envProduction}`,
      `- Dry-run check (no upload): ${packageManagerRunCmd} ${vercelNames.deployCheck}`,
      `- Preview deploy: ${packageManagerRunCmd} ${vercelNames.deploy}`,
      `- Production deploy: ${packageManagerRunCmd} ${vercelNames.deployProd}`,
    );

    if (webDeploy === "vercel" && serverDeploy === "vercel" && backend !== "self") {
      lines.push(
        "- Web requests under `/api/*` route to the server service and are rewritten before reaching the backend.",
      );
    }

    lines.push(
      "Vercel Services share project environment variables, but deploys do not upload local `.env` files automatically. Link the project with `vercel link`, then run the env sync command before your first deploy (otherwise the deployment starts with no env vars), or pass one-off envs with `vercel deploy -e KEY=value`.",
      `Pass Vercel CLI flags to the env sync command directly, for example: \`${packageManagerRunCmd} ${vercelNames.envProduction} --scope your-team\`.`,
      "",
      "For more details, see the guide on [Deploying to Vercel](https://www.kubojs.dev/docs/guides/vercel).",
    );
  }

  if (hasGuaraCloud) {
    const scriptSets = getGuaraCloudScriptSets(webDeploy, serverDeploy);
    const targetLabel =
      webDeploy === "guaracloud" && (serverDeploy === "guaracloud" || backend === "self")
        ? "web + server"
        : webDeploy === "guaracloud"
          ? "web"
          : "server";

    lines.push(
      "",
      "### Guara Cloud",
      "",
      `- Target: ${targetLabel}`,
      "- Build source: app Dockerfiles in `apps/*/Dockerfile`",
      `- Login: ${packageManagerRunCmd} deploy:login`,
      "- One Guara service should be linked per app directory in this monorepo.",
      "",
      "Guara Cloud supports GitHub-connected monorepos and Docker-based deployments. Configure each service to build from its app directory, set environment variables in Guara Cloud (or via `guara env`), and attach custom domains after the first deploy.",
      "",
      "Docs referenced during integration: Introduction, Quickstart, Concepts, Pricing, Creating Services, Environment Variables, Service Scaling, Storage Volumes, Build Configuration, Health Checks, Managing Services, Deployments Overview, Service Domains, Guara CLI, Supported Technologies, Deploying from GitHub, and Deploying with Docker.",
    );

    for (const g of scriptSets) {
      const label = g.target === "web" ? "Web" : "Server";
      const appDir = g.target === "web" ? "apps/web" : "apps/server";
      lines.push(
        `- ${label} link: ${packageManagerRunCmd} ${g.link}`,
        `- ${label} deploy: ${packageManagerRunCmd} ${g.deploy}`,
        `- ${label} runtime logs: ${packageManagerRunCmd} ${g.logs}`,
        `- ${label} build logs: ${packageManagerRunCmd} ${g.buildLogs}`,
        `- ${label} roll back: ${packageManagerRunCmd} ${g.rollback}`,
        `- Start by linking from \`${appDir}\` so Guara stores service metadata beside the app it deploys.`,
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

function generateGitHooksSection(
  packageManagerRunCmd: string,
  addons: ProjectConfig["addons"],
): string {
  const hasHusky = addons.includes("husky");
  const hasLefthook = addons.includes("lefthook");
  const hasVitePlus = addons.includes("vite-plus");
  const hasVitePlusNativeHooks = hasVitePlus && !hasHusky && !hasLefthook;
  const hasLinting = addons.includes("biome") || addons.includes("oxlint") || hasVitePlus;

  if (!hasHusky && !hasLinting) {
    return "";
  }

  const lines: string[] = ["## Git Hooks and Formatting", ""];

  if (hasHusky) {
    lines.push(`- Initialize hooks: \`${packageManagerRunCmd} prepare\``);
  }

  if (hasVitePlusNativeHooks) {
    lines.push(
      `- Optional native Vite+ hooks: \`${packageManagerRunCmd} hooks:setup\``,
      "- Docs: [Vite+ commit hooks](https://viteplus.dev/guide/commit-hooks)",
    );
  }

  if (hasLinting) {
    lines.push(`- Run checks: \`${packageManagerRunCmd} check\``);
  }

  return `${lines.join("\n")}\n\n`;
}

function getVercelScriptNames(
  webDeploy: ProjectConfig["webDeploy"] | undefined,
  serverDeploy: ProjectConfig["serverDeploy"] | undefined,
) {
  const mixedCloud = webDeploy !== "none" && serverDeploy !== "none" && webDeploy !== serverDeploy;
  const target = webDeploy === "vercel" ? "web" : "server";
  const deploy = mixedCloud ? `deploy:${target}` : "deploy";
  return {
    setup: "deploy:setup",
    envPreview: "env:preview",
    envProduction: "env:production",
    deploy,
    deployProd: `${deploy}:prod`,
    deployCheck: "deploy:check",
  };
}

function getGuaraCloudScriptNames(
  webDeploy: ProjectConfig["webDeploy"] | undefined,
  serverDeploy: ProjectConfig["serverDeploy"] | undefined,
) {
  const splitTargets =
    (webDeploy !== "none" && serverDeploy !== "none" && webDeploy !== serverDeploy) ||
    (webDeploy === "guaracloud" && serverDeploy === "guaracloud");
  const target = webDeploy === "guaracloud" ? "web" : "server";
  const deploy = splitTargets ? `deploy:${target}` : "deploy";
  return {
    deploy,
    link: `${deploy}:link`,
    logs: `${deploy}:logs`,
    buildLogs: `${deploy}:build-logs`,
    rollback: splitTargets ? `rollback:${target}` : "rollback",
  };
}

function getGuaraCloudScriptSets(
  webDeploy: ProjectConfig["webDeploy"] | undefined,
  serverDeploy: ProjectConfig["serverDeploy"] | undefined,
) {
  if (webDeploy === "guaracloud" && serverDeploy === "guaracloud") {
    return [
      {
        target: "web" as const,
        deploy: "deploy:web",
        link: "deploy:web:link",
        logs: "deploy:web:logs",
        buildLogs: "deploy:web:build-logs",
        rollback: "rollback:web",
      },
      {
        target: "server" as const,
        deploy: "deploy:server",
        link: "deploy:server:link",
        logs: "deploy:server:logs",
        buildLogs: "deploy:server:build-logs",
        rollback: "rollback:server",
      },
    ];
  }

  return [
    {
      target: webDeploy === "guaracloud" ? ("web" as const) : ("server" as const),
      ...getGuaraCloudScriptNames(webDeploy, serverDeploy),
    },
  ];
}
