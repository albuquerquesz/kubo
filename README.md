# Kubo

A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations.

**Package:** [`kubojs`](https://www.npmjs.com/package/kubojs) · **Repo:** [albuquerquesz/kubo](https://github.com/albuquerquesz/kubo)

<br />

<a href="https://vercel.com/oss">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
</a>

## Philosophy

- Roll your own stack: you pick only the parts you need, nothing extra.
- Minimal templates: bare-bones scaffolds with zero bloat.
- Latest dependencies: always use current, stable versions by default.
- Free and open source: forever.

## Quick Start

```bash
# Using bun (recommended)
bun create kubojs@latest

# Using pnpm
pnpm create kubojs@latest

# Using npm
npx kubojs@latest
```

## Claude Code plugin

Want your AI assistant to scaffold and extend projects with Kubo? Install the plugin and it will plan a valid stack and generate it through the bundled MCP server instead of hand-rolling boilerplate.

```bash
/plugin marketplace add albuquerquesz/kubo
/plugin install better-t-stack@better-t-stack
```

Then ask: _"create a fullstack app with Next, Hono, Postgres and Better Auth"_, or run `/better-t-stack:new <description>`. See [`plugin/`](plugin) and the [Agent Workflows docs](apps/web/content/docs/cli/agent-workflows.mdx).

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
- **Plugin**: [`plugin`](plugin) — Claude Code / Codex plugin (MCP server + skills + commands + agent)

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

## Star History

<a href="https://www.star-history.com/#albuquerquesz/kubo&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=albuquerquesz/kubo&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=albuquerquesz/kubo&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=albuquerquesz/kubo&type=Date" />
 </picture>
</a>
