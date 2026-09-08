<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/assets/kubo-wordmark-dark.svg" />
    <img alt="Kubo" src="apps/web/public/assets/kubo-wordmark-light.svg" height="48" />
  </picture>
</p>

<p align="center">
  A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/create-kubojs">
    <img alt="npm: create-kubojs" src="https://img.shields.io/npm/v/create-kubojs?style=flat-square&label=npm&color=CB3837" />
  </a>
  <a href="https://x.com/byalbuquerquesz">
    <img alt="X: @byalbuquerquesz" src="https://img.shields.io/badge/X-@byalbuquerquesz-000000?style=flat-square&logo=x&logoColor=white" />
  </a>
</p>

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
npx create-kubojs@latest
```

## Agent Skill

Kubo includes a [`kubojs` agent skill](.agents/skills/kubojs/SKILL.md) that helps AI coding agents
create, inspect, and extend projects generated with KuboJS.

Install it for the current project:

```bash
npx skills add albuquerquesz/kubo --skill kubojs
```

Or install it globally for your agent:

```bash
npx skills add albuquerquesz/kubo --skill kubojs --global
```

## What Kubo Makes Easier

- `kubojs create` — scaffold a new project interactively or with explicit CLI options.
- `kubojs create-json` — generate projects from JSON payloads for scripts and AI agents.
- `kubojs add` — add addons and testing tools to an existing KuboJS project.
- `kubojs add-json` — apply the same changes from a structured JSON payload.
- `kubojs schema` — inspect current CLI schemas, valid stack options, and input shapes.
- `kubojs history` — review project creation history or export it as JSON.
- `kubojs docs` and `kubojs builder` — open the documentation and visual Stack Builder.
- `kubojs mcp` — connect KuboJS to AI agents through a local stdio MCP server.

From the first scaffold to ongoing project changes, Kubo keeps setup explicit, repeatable, and easy to automate.

## Repository Structure

This repository is organized as a monorepo containing:

- **CLI**: [`apps/cli`](apps/cli) — published as [`create-kubojs`](https://www.npmjs.com/package/create-kubojs) (bins: `create-kubojs`, `kubojs`; `@kubojs/cli` compat alias)
- **Documentation / site**: [`apps/web`](apps/web) — Next.js marketing + docs
- **Video**: [`apps/video`](apps/video) — Remotion app (`@kubojs/video`) for brand/launch videos; Studio + render only (not nested under the web site)
- **Packages**: [`packages/types`](packages/types), [`packages/template-generator`](packages/template-generator), [`packages/backend`](packages/backend)

Agent usage guide: [`.agents/skills/kubojs/SKILL.md`](.agents/skills/kubojs/SKILL.md).

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

## Credits

Kubo began as a continuation of [Better T Stack](https://github.com/AmanVarshney01/create-better-t-stack). We thank its maintainers and contributors for the foundation that made this project possible.

## Want to contribute?

Please read the Contribution Guide first and open an issue before starting new features to ensure alignment with project goals.

- Docs: [`./apps/web/content/docs/contributing.mdx`](./apps/web/content/docs/contributing.mdx)
- Repo guide: [`./.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md)
