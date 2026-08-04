# Monorepo map

Canonical layout for agent routing. Prefer this over inventing new package homes. Product rules remain in [`AGENTS.md`](../../../../AGENTS.md).

## Apps

| Path         | Package / name                                                         | Role                                                    | Runtime / tools             | Default monorepo scripts                                   |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------- | ---------------------------------------------------------- |
| `apps/cli`   | `create-kubojs` (bins `create-kubojs`, `kubojs`; `@kubojs/cli` compat) | Scaffolding CLI, MCP surface, tests                     | Bun, TypeScript             | `bun cli`, `bun build:cli`, `cd apps/cli && bun run test`  |
| `apps/web`   | `web`                                                                  | Next.js marketing site + docs (`content/docs`)          | Next.js, React, GSAP motion | `bun dev`, `bun build:web`                                 |
| `apps/video` | `@kubojs/video`                                                        | Remotion brand/launch videos (React frame compositions) | Remotion Studio + render    | `bun run dev:video`, `bun run build:video` (opt-in bundle) |

### App boundaries

- **`apps/web` is not the video source tree.** Marketing embeds static media under `apps/web/public` when needed; Remotion sources live only in `apps/video`.
- **`apps/video` is a first-class React app**, not nested under `apps/web/public`. It does not ship as part of the Next production graph.
- **Root `bun build` does not require video.** Video uses Turbo task `bundle` (`build:video` / package `bundle`) so Studio work stays opt-in.
- **Motion stacks stay separate:** web marketing motion uses GSAP helpers under `apps/web/src/lib/motion`; video mark animation is frame-driven Remotion under `apps/video/src`.

### Video entry points

- Studio: package script `dev` → `remotion studio`
- Launch composition: `kubo-launch` (see [`apps/video/LAUNCH.md`](../../../../apps/video/LAUNCH.md))
- Render: package script `render` → `remotion render kubo-launch …`
- Remotion agent skills (package-local): `apps/video/.agents/skills/`

## Packages

| Path                          | Package                      | Role                                         |
| ----------------------------- | ---------------------------- | -------------------------------------------- |
| `packages/template-generator` | `@kubojs/template-generator` | Handlebars template engine for CLI scaffolds |
| `packages/types`              | `@kubojs/types`              | Shared schemas / types for CLI + generators  |
| `packages/backend`            | `@kubojs/backend`            | Convex backend used by web features          |

## Other roots

| Path              | Role                                                                            |
| ----------------- | ------------------------------------------------------------------------------- |
| `plugin/`         | Installable agent plugin (Claude Code + Codex); published via root marketplaces |
| `.agents/skills/` | Repo-scoped agent skills (including this `kubojs` router)                       |
| `docs/`           | Specs, ADRs, agent runbooks; not product runtime                                |

## Workspaces

Root `package.json` workspaces: `apps/*`, `packages/*` (Bun). Turbo orchestrates `build`, `dev`, `bundle`, `lint`, `check`.

## When documenting or reviewing

- Scope claims to the owning app/package above.
- Do not treat Remotion sources as Next public assets.
- Conventional Commit scopes in use include `cli`, `web`, `video`, and package names when appropriate.
