# Kubo

A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations.

<br />

<p align="center">
  <img alt="Kubo" src="apps/web/public/assets/kubo-bg.png" width="900" />
</p>

<br />

## Quick Start

```bash
# Using bun (recommended)
bun create kubojs@latest

# Using pnpm
pnpm create kubojs@latest

# Using npm
npx kubojs@latest
```

## Features

- Frontend: React (TanStack Router, React Router, TanStack Start), Next.js, Nuxt, Svelte, Solid, Astro, React Native (Bare, NativeWind, Unistyles), or none
- Backend: Hono, Express, Fastify, Elysia, Self (fullstack web app), Convex, or none
- API: tRPC or oRPC (or none)
- Runtime: Bun, Node.js, or Cloudflare Workers
- Databases: SQLite, PostgreSQL, MySQL, MongoDB (or none)
- ORMs: Drizzle, Prisma, Mongoose (or none)
- Auth: Better Auth or Clerk (optional)
- Addons: Turborepo, Nx, PWA, Tauri, Electrobun, Biome, Lefthook, Husky, Starlight, Fumadocs, Ultracite, Oxlint, MCP, OpenTUI, WXT, Skills
- Examples: Todo, AI
- DB Setup: Turso, Neon, Supabase, Prisma PostgreSQL, MongoDB Atlas, Cloudflare D1, Docker
- Web Deploy: Cloudflare Workers

Type safety end-to-end, clean monorepo layout, and zero lock-in: you choose only what you need.

## Repository Structure

This repository is organized as a monorepo containing:

- **CLI**: [`apps/cli`](apps/cli) — published as [`kubojs`](https://www.npmjs.com/package/kubojs)
- **Documentation / site**: [`apps/web`](apps/web)
- **Packages**: [`packages/types`](packages/types), [`packages/template-generator`](packages/template-generator), [`packages/backend`](packages/backend)

## Documentation

Run the local docs site with `bun dev` (port 3333). Source lives in [`apps/web/content/docs`](apps/web/content/docs). Use the Stack Builder at `/new` when the site is running.

## Development

```bash
# Clone the repository
git clone https://github.com/albuquerquesz/kubo.git
cd kubo

# Install dependencies
bun install

# Start website development
bun dev

# Start CLI development
bun cli
```

## Want to contribute?

Please read the Contribution Guide first and open an issue before starting new features to ensure alignment with project goals.

- Docs: [`./apps/web/content/docs/contributing.mdx`](./apps/web/content/docs/contributing.mdx)
- Repo guide: [`./.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md)
