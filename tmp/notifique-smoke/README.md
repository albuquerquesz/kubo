# notifique-smoke

This project was created with [kubojs](https://github.com/albuquerquesz/kubo), a modern TypeScript stack that combines React, TanStack Router, Hono, TRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Notifique** - Omnichannel messaging (SMS, WhatsApp, email) via packages/notifique
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Hono** - Lightweight, performant server framework
- **tRPC** - End-to-end type-safe APIs
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **SQLite** - Database engine

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. Local SQLite uses a `file:` URL via libsql (no Turso account or CLI required). Default `DATABASE_URL` points at a local file database.

2. Update your `.env` file in the `apps/server` directory if you need a different path.

3. Apply the schema to your database:

```bash
bun run db:push
```

## Notifique Setup

This project includes a `packages/notifique` REST client for [Notifique](https://notifique.dev) (WhatsApp, SMS, email, and more).

Keys are **optional for local first run** — helpers throw only when called without `NOTIFIQUE_API_KEY`.

1. Create an API key in the [Developer panel](https://docs.notifique.dev/guides/api-key/index) (`sk_live_…` or sandbox `sk_test_…`).
2. Grant the scopes you need (e.g. `sms:send`, `whatsapp:send`, `email:send`).
3. Set `NOTIFIQUE_API_KEY` (and optionally `NOTIFIQUE_WHATSAPP_INSTANCE_ID`, `NOTIFIQUE_FROM_EMAIL`) in the server `.env`.
4. Auth is **Bearer only** — do not send `x-workspace-id`.

```ts
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
```

Agent skill / API map:

- https://docs.notifique.dev/skill.md
- https://docs.notifique.dev/llms.txt

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@notifique-smoke/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Project Structure

```
notifique-smoke/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono, TRPC)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── api/         # API layer / business logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:push`: Push schema changes to database
- `bun run db:generate`: Generate database client/types
- `bun run db:migrate`: Run database migrations
- `bun run db:studio`: Open database studio UI
