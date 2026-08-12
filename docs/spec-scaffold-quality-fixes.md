# Spec: Scaffold quality fixes (generated project)

## Status

Ready to implement. Covers remaining P0–P2 findings from the generated-project quality review (after `kubojs.jsonrc` rebrand + `packageManager` pin).

## Date

2026-08-12

## Goal

Make a default scaffold (tanstack-router + hono + bun + sqlite/drizzle + better-auth + turborepo + biome) **usable out of the box**:

1. `bun install` works with Corepack/Turbo (`packageManager` already fixed).
2. `bun run check` / `biome check` green without manual reformat.
3. Local auth cookies work on `http://localhost`.
4. One linter stack only (no dual biome+oxlint).
5. Env loads from monorepo package paths, not only CWD.
6. `check-types` is typecheck, not a production Vite build.
7. Config + SQLite surface match what the user chose.

## Context (already done)

| Item                                                                                         | Status                                                  |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `bts.jsonc` → `kubojs.jsonrc`                                                                | Done                                                    |
| `bts-config` / `BetterTStack*` → `kubojs-config` / `Kubojs*`                                 | Done                                                    |
| Strip Aman / Better-T-Stack branding from config path                                        | Done                                                    |
| `packageManager: bun@latest` → pin `bun@<process.versions.bun>` + strip invalid field on add | Done (`create-project.ts`, `package-configs.ts`, tests) |

## Smoke baseline (reference stack)

```bash
bun create kubojs@latest /tmp/kubo-scaffold-smoke \
  --frontend tanstack-router \
  --backend hono \
  --runtime bun \
  --database sqlite \
  --orm drizzle \
  --api trpc \
  --auth better-auth \
  --payments none \
  --observability none \
  --addons turborepo biome \
  --examples none \
  --db-setup none \
  --web-deploy none \
  --server-deploy none \
  --no-git \
  --package-manager bun
```

Acceptance after all §1–§8: install + check-types + biome check green; auth cookie attributes sane for local; single linter; env loads when turbo runs from root.

## Implementation order

Implement in this order (dependencies between fixes are small; order prioritizes user pain):

1. §1 Formatter vs Biome (P0)
2. §2 Auth cookies local (P0)
3. §3 Exclusive linters (P1)
4. §4 Env monorepo path (P1)
5. §5 check-types without vite build (P1)
6. §6 kubojs.jsonrc rewrite hygiene (P2)
7. §7 SQLite / Turso surface (P2)
8. §8 Minors (P3)

After code: regenerate embedded templates if needed (`generate-templates` / package build), `bun build:cli`, focused CLI tests, then `/tmp` smoke.

---

## §1 — Formatter vs Biome (P0)

### Problema

Post-create `formatProject` always runs **oxfmt** (default spaces / ox style). Scaffold with addon **biome** ships `biome.json` with `"indentStyle": "tab"`. Result: ~80+ `biome check` format errors on a brand-new project. User’s first quality gate fails.

### Onde

| Path                                                                | Role                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/cli/src/utils/file-formatter.ts`                              | Always `import { format } from "oxfmt"`; used after VFS materialize |
| `apps/cli/src/helpers/core/create-project.ts`                       | Calls `formatProject(projectDir)`                                   |
| `packages/template-generator/templates/addons/biome/biome.json.hbs` | `formatter.indentStyle: "tab"`                                      |
| `apps/cli/src/helpers/addons/oxlint-setup.ts`                       | oxlint path correctly owns oxfmt                                    |

### Como resolver (resumo)

Align post-format with **chosen** quality addon:

- If `addons` includes `biome` (or ultracite-on-biome): format with **Biome** (`biome check --write` or Biome JS API), **or** skip oxfmt and leave biome as source of truth.
- If `addons` includes `oxlint` only: keep oxfmt.
- If neither: keep oxfmt or no-op (pick one, document).

Pass `addons` (or resolved formatter) into `formatProject`. Do **not** reformat after biome with oxfmt.

### Aceite

Fresh project with `--addons turborepo biome`: `bunx biome check .` exit 0 without `--write`. Project with oxlint only: oxfmt path still works.

---

## §2 — Auth cookies local (P0)

### Problema

Better Auth default cookie attrs force `sameSite: "none"` + `secure: true`. On local `http://localhost` browsers reject or never send session cookies → login looks broken.

### Onde

| Path                                                                                  | Role                                                                                                                        |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `packages/template-generator/templates/auth/better-auth/server/base/src/index.ts.hbs` | Multiple branches set `advanced.defaultCookieAttributes` with `sameSite: "none"`, `secure: true` (non-`self` backend paths) |
| Generated: `apps/server` (or auth package) `src/...` after scaffold                   | Runtime copy of above                                                                                                       |

### Como resolver (resumo)

Use local-safe defaults; tighten only for cross-site / production HTTPS:

- Prefer `sameSite: "lax"` (or `"strict"`) and `secure: process.env.NODE_ENV === "production"` (or Better Auth env-aware pattern).
- Keep `httpOnly: true`.
- Only use `sameSite: "none"` + `secure: true` when stack truly needs cross-site cookies (document that case; prefer explicit deploy flag if required).

Apply consistently to **all** `defaultCookieAttributes` blocks in the `.hbs` template.

### Aceite

Local `http://localhost` sign-in sets a session cookie the browser stores. Production HTTPS still gets Secure when `NODE_ENV=production`.

---

## §3 — Exclusive linters (P1)

### Problema

Code-quality addons are not mutually exclusive end-to-end. Create can multi-select; `kubojs add oxlint` on a biome project can leave **both** installed and dual scripts/hooks. Hooks pick one linter for husky, but deps + root scripts still dual.

### Onde

| Path                                                                        | Role                                                                                  |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `apps/cli/src/prompts/addons.ts`                                            | Group `"Code Quality": ["biome", "oxlint", "ultracite", ...]` — multi-select possible |
| `apps/cli/src/helpers/addons/addons-setup.ts`                               | Runs biome **and** oxlint if both present                                             |
| `apps/cli/src/helpers/core/add-handler.ts`                                  | `HOOK_LINTER_ADDONS`; merges addons without replacing sibling linter                  |
| `packages/template-generator` addon templates + root `package.json` scripts | Can accumulate dual check scripts                                                     |
| Compatibility / validation layer (`@kubojs/types` or CLI validate)          | Must enforce exclusive slot if not already                                            |

### Como resolver (resumo)

Treat **biome | oxlint | ultracite | vite-plus-as-lint** as one exclusive “lint slot”:

1. **Create prompts**: selecting one deselects others (or single-select within group).
2. **`add`**: when adding biome, remove oxlint (and vice versa); ultracite replaces both base linters as designed.
3. **Setup**: never run both `setupBiome` and `setupOxlint` in one project.
4. Persist final exclusive list in `kubojs.jsonrc` `addons`.

### Aceite

Cannot end with both `@biomejs/biome` and `oxlint` as active project linters after create or add. `kubojs.jsonrc` `addons` contains at most one of the exclusive set (plus ultracite rules as product intends).

---

## §4 — Env monorepo path (P1)

### Problema

`packages/env` server entry uses bare `import "dotenv/config"`, which loads `.env` from **process.cwd()**. Turbo/`bun run` from monorepo root → looks for root `.env`, while scaffold writes env under `apps/server/.env` (or `apps/web` for self backend). DB kit configs already pass explicit path; env package does not → missing env / false negatives in typecheck or server boot.

### Onde

| Path                                                                                                                     | Role                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `packages/template-generator/templates/packages/env/src/server.ts.hbs`                                                   | `import "dotenv/config"` branch (non-Cloudflare)                      |
| Contrast (correct pattern): `templates/db/drizzle/*/drizzle.config.ts.hbs`, `templates/db/prisma/*/prisma.config.ts.hbs` | `dotenv.config({ path: "../../apps/server/.env" })` (or web for self) |

### Como resolver (resumo)

Replace bare `dotenv/config` with explicit path matching backend layout:

- Separate server: `path` → `apps/server/.env` (resolved from package file location via `import.meta.dir` / `fileURLToPath`, not CWD).
- Backend `self`: `apps/web/.env`.
- Keep Cloudflare worker branch unchanged (`cloudflare:workers`).

Prefer resolve relative to this module so turbo filter from root still works.

### Aceite

From monorepo root, importing `@project/env/server` sees vars from `apps/server/.env` without copying `.env` to root. `db:*` scripts still work.

---

## §5 — check-types without vite build (P1)

### Problema

TanStack Router web package defines:

```json
"check-types": "vite build && tsc --noEmit"
```

So monorepo `check-types` (turbo) **builds production client** every typecheck. Slow, noisy, fails for reasons unrelated to types, and blurs “typecheck” vs “build”.

### Onde

| Path                                                                                    | Role                                                           |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `packages/template-generator/templates/frontend/react/tanstack-router/package.json.hbs` | `"check-types": "vite build && tsc --noEmit"`                  |
| Other frontends                                                                         | Audit: most should already be `tsc` only; confirm after change |
| Root turbo task `check-types`                                                           | Orchestrates package scripts                                   |

### Como resolver (resumo)

- `check-types` → pure typecheck (`tsc --noEmit` or `tsc -b` as package already uses).
- Keep `build` as `vite build` (or framework equivalent).
- If route tree / gen files need a prior step, use a dedicated script (`prepare` / `generate`) — not silently inside `check-types`.

### Aceite

`bun run check-types` does not emit `dist/` for web and does not run Vite production build. Types still fail when TS is wrong.

---

## §6 — kubojs.jsonrc rewrite hygiene (P2)

### Problema

Config write is correct functionally, but post-format / tooling can mangle or inconsistently treat `kubojs.jsonrc` (JSONC with header comments). Biome already ignores `!kubojs.jsonrc`; oxfmt may still rewrite it during `formatProject`. Risk: broken comments, reordered keys, or invalid JSONC after create/add.

### Onde

| Path                                                     | Role                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| `packages/template-generator/src/kubojs-config.ts`       | `writeKubojsConfigToVfs` — header comments + `JSON.stringify(..., null, 2)` |
| CLI write on `add` (kubojs-config util under `apps/cli`) | Updates addons / options on disk                                            |
| `apps/cli/src/utils/file-formatter.ts`                   | Walks **all** files including `kubojs.jsonrc`                               |

### Como resolver (resumo)

- Exclude `kubojs.jsonrc` from oxfmt/biome post-format (explicit skip list).
- On rewrite (`add`): preserve header style; pretty-print JSON body with stable key order if practical.
- Never strip `$schema` or comments block.

### Aceite

After create + format + `kubojs add <addon>`, `kubojs.jsonrc` still valid JSONC, header intact, CLI still detects project.

---

## §7 — SQLite / Turso surface (P2)

### Problema

User selects `--database sqlite --db-setup none`, but generated DB package still looks **Turso/libsql-shaped**:

- `drizzle.config` `dialect: "turso"`
- deps `@libsql/client` + `libsql`
- script `db:local`: `turso dev --db-file local.db`

Local file SQLite works via libsql, but UX implies Turso cloud and requires Turso CLI for `db:local`. Misleading for “plain sqlite”.

### Onde

| Path                                                                            | Role                                                                         |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `packages/template-generator/templates/db/drizzle/sqlite/drizzle.config.ts.hbs` | `dialect: "turso"` unless d1                                                 |
| `packages/template-generator/templates/db/drizzle/sqlite/src/index.ts.hbs`      | Always libsql client for non-d1                                              |
| `packages/template-generator/src/post-process/package-configs.ts`               | `scripts["db:local"] = "turso dev --db-file local.db"` when sqlite && not d1 |
| `packages/template-generator/src/processors/db-deps.ts`                         | libsql deps for drizzle sqlite                                               |
| README generator                                                                | Documents `db:local` as local SQLite                                         |

### Como resolver (resumo)

Product decision (pick one, implement fully):

**A (recommended):** Keep libsql for sqlite (compatible), but:

- When `dbSetup === "none"`: document as “local SQLite via libsql”; use `file:` URL only; dialect can stay turso if required by drizzle-kit for libsql, with comment.
- Gate `db:local` / Turso CLI on `dbSetup === "turso"` **or** replace `db:local` with a no-CLI path (`file:local.db` only).
- When `dbSetup === "turso"`: keep authToken + turso messaging.

**B:** True better-sqlite3 / node:sqlite path for `dbSetup none` (larger change).

Ship A unless product wants B.

### Aceite

`--db-setup none` does not require Turso account or `turso` CLI for day-1 `db:push` / dev. `--db-setup turso` still documents cloud + token.

---

## §8 — Minors (P3)

### Problema

Small consistency gaps that did not block smoke but erode polish.

### Checklist (verify + fix if still present)

| Item                                                                       | Onde (hunt)                                  | Fix                             |
| -------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------- | -------------- | ------------------------- | --------------- |
| Leftover `bts` / Better-T-Stack strings in generated files or CLI messages | `rg -i 'bts\.jsonc                           | Better-T-Stack                  | better-t-stack | Aman'` in templates + CLI | Rename / delete |
| Dual `dotenv` in catalog vs direct version noise                           | root / workspace package.json templates      | Prefer catalog only             |
| README scripts list mismatch after §5/§7                                   | `readme-generator.ts`                        | Align with real scripts         |
| Frontend packages missing pure `check-types`                               | all `templates/frontend/**/package.json.hbs` | Audit each framework            |
| `formatProject` formatting binary / lockfiles                              | `file-formatter.ts`                          | Skip non-text / known lockfiles |

### Aceite

No user-facing BTS legacy strings in default scaffold. README scripts match package.json.

---

## Verification plan

### Automated

```bash
bun install
bun run build:cli   # or workspace generate-templates + build as monorepo requires
cd apps/cli && bun run test
# focused if present:
# package-manager-field, addons exclusive, config write
```

### Manual smoke (`/tmp`)

1. Create reference stack (baseline above) with install.
2. Assert root `package.json` has `packageManager` like `bun@1.x.y` (not `@latest`).
3. `bunx biome check .` → 0 (§1).
4. Grep auth template/output: no forced `sameSite: "none"` + `secure: true` for local defaults (§2).
5. `bun run check-types` → no Vite production build in web logs (§5).
6. Env: only `apps/server/.env` populated; import env from root script works (§4).
7. `kubojs add oxlint` on biome project → exclusive outcome (§3).
8. SQLite none: no mandatory Turso CLI for first migrate/push (§7).
9. `kubojs.jsonrc` valid after create + add (§6).

### Done when

All §1–§8 aceite boxes pass on smoke stack; no regressions on packageManager pin tests.

## PR strategy

- **Monolith PR** OK if review bandwidth low: one conventional commit series under `fix(cli):` / `fix(template-generator):`.
- Or split: **P0** (§1–§2) → **P1** (§3–§5) → **P2/P3** (§6–§8).

## Out of scope

- New database providers.
- Changing default stack matrix / web stack builder UX beyond exclusive lint slot.
- Publishing npm (see `docs/spec-npm-*.md`).
  )
