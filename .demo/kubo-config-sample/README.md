# kubo-config-sample

This project was created with [kubojs](https://github.com/albuquerquesz/kubo), a modern TypeScript stack that combines React, TanStack Router, Hono, TRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **GetMonitor** - JavaScript error tracking for browser and server runtimes
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Hono** - Lightweight, performant server framework
- **tRPC** - End-to-end type-safe APIs
- **Bun** - Runtime environment
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## GetMonitor Setup

This project includes the [GetMonitor JavaScript error-tracking SDK](https://github.com/get-monitor/getmonitor-js).

Keys are **optional for local first run** — the app starts without them and capture stays idle until you configure a project key.

1. Create a GetMonitor project and copy its public project key (`gm_xxx`).
2. Set the generated `.env` value ending in `GETMONITOR_API_KEY` for the web app and/or server when you are ready to send events.
3. Ingestion uses a fixed host (`http://ingest.getmonitor.io`) — no `apiHost` env var is required.
4. Optional (Next.js / Nuxt production builds): set `GETMONITOR_AUTH_TOKEN` (secret, never public) so source maps upload during `next build` / `nuxt build`.

Browser uncaught errors are captured after the client bootstrap runs. React apps also wrap the tree in `<GetMonitorErrorBoundary>`. Node server errors are captured when the server key is configured.

See the [browser](https://github.com/get-monitor/getmonitor-js/tree/main/packages/browser), [Node](https://github.com/get-monitor/getmonitor-js/tree/main/packages/node), [React](https://github.com/get-monitor/getmonitor-js/tree/main/packages/react), [Next.js](https://github.com/get-monitor/getmonitor-js/tree/main/packages/nextjs-config), and [Nuxt](https://github.com/get-monitor/getmonitor-js/tree/main/packages/nuxt) package guides.

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
import { Button } from "@kubo-config-sample/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Project Structure

```
kubo-config-sample/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono, TRPC)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── api/         # API layer / business logic
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
