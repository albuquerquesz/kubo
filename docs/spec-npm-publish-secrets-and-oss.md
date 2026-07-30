# Spec: Publish `kubojs` to npm without leaking secrets (open-source repo)

## Status

Ready for operators (local + GitHub Actions). Does **not** change product code by itself.

## Date

2026-07-21

## Goal

Define a **safe, repeatable** way to:

1. Create and store an npm **granular access token** (or OTP flow) for the account that owns the packages.
2. Publish the public packages (`@kubojs/types`, `@kubojs/template-generator`, `create-kubojs`, and the `@kubojs/cli` compat alias) to `registry.npmjs.org`.
3. Keep all credentials **out of the git history**, PRs, logs, and the open-source tree at `github.com/albuquerquesz/kubo`.

**Scope of packages (publishable):**

| Package            | Path                          | Registry name                                                                           |
| ------------------ | ----------------------------- | --------------------------------------------------------------------------------------- |
| Types              | `packages/types`              | `@kubojs/types`                                                                         |
| Template generator | `packages/template-generator` | `@kubojs/template-generator`                                                            |
| CLI                | `apps/cli`                    | `create-kubojs` (bins: `create-kubojs`, `kubojs`); also dual-published as `@kubojs/cli` |

## Private monorepo root name is `kubo` — **not** published.

## Threat model (why this exists)

| Risk                                     | What happens                                     | Mitigation                                                    |
| ---------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| Token committed in repo                  | Anyone can publish malware as `kubojs`           | Never write tokens into tracked files; secret scanning        |
| Token in CI log / PR comment             | Token stolen from Actions logs                   | Mask secrets; never `echo` token                              |
| Classic token with all access            | Over-broad blast radius                          | Prefer **granular** token, package-scoped                     |
| 2FA account + password login only        | `npm publish` → **403** requiring 2FA bypass/OTP | Granular token with publish permission **or** `--otp` locally |
| `.npmrc` in project root with real token | Leaks on clone                                   | Only `${NPM_TOKEN}` placeholder if project `.npmrc` is needed |
| Sharing token in chat / issue            | Social leak                                      | Use password manager / 1Password / GitHub Secrets only        |

---

## Hard rules (non-negotiable)

1. **Never** commit:
   - `//registry.npmjs.org/:_authToken=...` with a real value
   - `NPM_TOKEN=...` / `NODE_AUTH_TOKEN=...` in files under the repo
   - Screenshots of tokens in git (vault notes are fine if vault is private)
2. **Never** put the token in:
   - PR descriptions, commit messages, Issues, Discussions
   - Agent chat that is logged to a shared transcript you treat as public
3. **Always** use one of:
   - Local: token in **`~/.npmrc`** (home directory, outside the repo), **or** interactive `npm login` + OTP
   - CI production: **npm Trusted Publishing (OIDC)** from `release.yaml` (no write token on publish steps)
   - CI preview / break-glass: GitHub Actions secret **`NPM_TOKEN`** (granular, short-lived when possible)
4. Prefer a **granular** token with **write only on the packages you own** (`@kubojs/*`), short expiry when possible.
5. Rotate the token if it might have been exposed.

---

## A. Create the token (npmjs.com)

1. Log in at [https://www.npmjs.com/](https://www.npmjs.com/) as the publish account (e.g. `albuquerquesz`).
2. Avatar → **Access Tokens** → **Generate New Token** → **Granular Access Token**.
3. Configure:
   - **Packages:** Read and write on `create-kubojs`, `@kubojs/cli`, `@kubojs/types`, `@kubojs/template-generator` (or org `@kubojs` / “All packages”; unscoped `create-kubojs` needs create permission).
   - **Organizations:** none unless required.
   - **Expiration:** set a finite date (e.g. 90 days); calendar a rotation.
   - **2FA / publish:** enable whatever option allows **automation publish** without interactive OTP (wording varies: “Bypass 2FA for automation”, “Publish”, etc.).  
     Without this, automation and non-OTP CLI publish still fail with **403**.
4. Copy the token **once**. Store in a password manager. Do not paste into the repo.

> [!warning] Classic tokens
> npm discourages Classic tokens on 2FA accounts. Prefer granular. If the UI only offers Classic for automation, treat as temporary and migrate to granular ASAP.

---

## B. Local machine (manual publish)

### B.1 Store token (recommended)

**Outside the repository:**

```bash
# Writes ONLY to ~/.npmrc (user home) — not into the git tree
npm config set //registry.npmjs.org/:_authToken=YOUR_GRANULAR_TOKEN
```

Verify (should print your npm username, not the token):

```bash
npm whoami
```

Inspect without dumping the token:

```bash
# Should show a line for registry.npmjs.org — do not cat full file into PRs
grep -n 'registry.npmjs.org' ~/.npmrc
```

### B.2 Alternative: OTP only (no long-lived local token)

```bash
npm login   # if session expired
cd /path/to/kubo
bun run build:cli   # or full release build order below
cd apps/cli
npm publish --access public --otp=123456   # code from authenticator app
```

### B.3 Project-level `.npmrc` (only if needed)

If the monorepo must document registry config for contributors, commit **only**:

```ini
# apps/cli/.npmrc or repo .npmrc — SAFE to commit
@kubo:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

Then export locally (never commit):

```bash
export NPM_TOKEN=YOUR_GRANULAR_TOKEN
```

Ensure `.env`, `.env*.local`, and any file that might hold a real token stay in `.gitignore` (already true for `.env*`).

### B.4 Manual publish order (workspace packages)

Publish order matches the release workflow: **types → template-generator → CLI (`create-kubojs`) → CLI alias (`@kubojs/cli`)**.

From monorepo root (authenticated):

```bash
# 1) Build
bun install
bun run build:cli   # builds deps + CLI via turbo

# 2) Optional smoke
bun run smoke:publish   # if available

# 3) Publish (versions already set in package.json; workspace:* rewritten for CLI)
cd packages/types && npm publish --access public && cd ../..
cd packages/template-generator && npm publish --access public && cd ../..
cd apps/cli && npm publish --access public && cd ../..
```

First-time scoped packages may need:

```bash
npm publish --access public
```

(`publishConfig.access` is already `"public"` on `kubojs`.)

### B.5 Dry-run before real publish

```bash
cd apps/cli
npm publish --access public --dry-run
```

Expect tarball contents under `dist/` + `package.json` + README — no `.env`, no source secrets.

---

## C. GitHub Actions (open-source CI — preferred for release)

### C.1 Secret storage

In the GitHub repo **Settings → Secrets and variables → Actions**:

| Secret name | Value                        | Used by                                                                                          |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `NPM_TOKEN` | Granular npm token (publish) | **Preview only** (`.github/workflows/pr-preview.yaml`) + break-glass / bootstrap; not production |

**Rules:**

- Secret is encrypted by GitHub; not visible in the public clone.
- Only maintainers can read/write secrets.
- Workflows reference `${{ secrets.NPM_TOKEN }}` — **never** print it.
- Production release does **not** require `NPM_TOKEN` once Trusted Publishing is configured (see C.3–C.4).

### C.2 How setup-node injects auth (token path)

When a job uses:

```yaml
- uses: actions/setup-node@v6
  with:
    registry-url: https://registry.npmjs.org
```

and the publish step sets:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

`setup-node` writes a **job-local** `.npmrc` in the runner workspace with the token. That file is ephemeral and must not be committed.

**Production path does not set `NODE_AUTH_TOKEN`.** npm CLI uses OIDC from `permissions.id-token: write` + Trusted Publisher config.

### C.3 Existing workflows in this monorepo

| Workflow                     | Auth pattern                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `release.yaml`               | **OIDC Trusted Publishing** — no `NODE_AUTH_TOKEN` on publish; `id-token: write`; optional canary via `workflow_dispatch` |
| `pr-preview.yaml`            | **Token exception:** `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` (pull_request_target; not yet OIDC)                      |
| `publish-create-kubojs.yaml` | Bootstrap only / retired for routine releases; still token-based                                                          |

**Operator checklist (production):**

1. Configure Trusted Publisher on npm for all four packages → GitHub `albuquerquesz` / `kubo` / workflow **`release.yaml`** / environment empty. See [`spec-npm-trusted-publishing-oidc-migration.md`](./spec-npm-trusted-publishing-oidc-migration.md).
2. Run OIDC canary once: Actions → Release → Run workflow → `oidc_canary=true` (dist-tag `oidc-canary`, never `latest`).
3. Trigger production release only via `chore(release): x.y.z` on `main`.
4. Keep `NPM_TOKEN` only for preview / emergency rollback until preview is also OIDC.

**Rollback (same day if OIDC fails):**

```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

on production publish steps only; confirm secret still valid; re-run only if version was not partially published.

### C.4 npm Trusted Publishing (OIDC) — production default

Production publish auth is **Trusted Publishing** from GitHub Actions:

- npmjs.com → each package → **Trusted Publisher** → GitHub Actions → owner `albuquerquesz`, repo `kubo`, workflow filename **`release.yaml`**, environment empty, allow npm publish.
- Workflow requires `permissions: id-token: write` and Node/npm versions that support OIDC (`npm >= 11.5.1`; CI asserts this).
- Full migration steps, canary, and acceptance: [`spec-npm-trusted-publishing-oidc-migration.md`](./spec-npm-trusted-publishing-oidc-migration.md).
- Still keep a break-glass granular token offline (password manager) if packages allow tokens; rotate after any leak.

---

## D. What may live in the open-source repo

| Allowed in git                                | Forbidden in git                           |
| --------------------------------------------- | ------------------------------------------ |
| Package names, versions, `publishConfig`      | Real tokens                                |
| Workflow YAML with `${{ secrets.NPM_TOKEN }}` | `${{ secrets.NPM_TOKEN }}` expanded values |
| `.npmrc` with `${NPM_TOKEN}` placeholder only | `.npmrc` with `npm_...` literal            |
| This spec                                     | Screenshots of full tokens                 |
| `npm publish --dry-run` docs                  | `~/.npmrc` contents                        |

---

## E. Verification (before claiming “published safely”)

| Check                                                                     | Pass                          |
| ------------------------------------------------------------------------- | ----------------------------- |
| `git grep -i 'npm_[a-zA-Z0-9]'` (or similar) finds no live tokens in tree | empty                         |
| `git check-ignore -v .env` (and similar) works                            | ignored                       |
| `npm whoami` works locally with home `.npmrc`                             | username only                 |
| `npm publish --dry-run` in `apps/cli` succeeds                            | tarball ok                    |
| GitHub secret `NPM_TOKEN` exists for maintainers                          | set in UI                     |
| Public Actions logs show no token string                                  | spot-check latest release run |
| First real publish: `npm view create-kubojs version` matches expected     | after publish                 |

---

## F. Incident response (if a token leaks)

1. **Revoke** the token immediately on npmjs.com → Access Tokens → Delete.
2. Create a new granular token; update `~/.npmrc` and GitHub `NPM_TOKEN`.
3. Check `npm` package access history / recent publishes for unexpected versions.
4. If a bad version was published: `npm unpublish` only within policy window, or deprecate + publish a fixed version.
5. Rotate any other secrets that sat in the same chat/log dump.

---

## G. Operator quick path (summary)

**Local, one-off (you own the laptop):**

```text
npmjs.com → Granular token (write on @kubojs/*)
  → npm config set //registry.npmjs.org/:_authToken=…
  → npm whoami
  → build + npm publish --access public (from package dirs)
```

**Open-source CI (team / automation):**

```text
Production:
  npm Trusted Publisher (OIDC) on release.yaml
  → chore(release): x.y.z on main
  → npm publish without NODE_AUTH_TOKEN

Preview / break-glass:
  Granular token → GitHub secret NPM_TOKEN (never in git)
  → pr-preview.yaml uses NODE_AUTH_TOKEN
```

---

## Relationship

| Doc / path                                      | Role                                                 |
| ----------------------------------------------- | ---------------------------------------------------- |
| `.github/workflows/release.yaml`                | Automated release on `chore(release): x.y.z` (OIDC)  |
| `.github/workflows/pr-preview.yaml`             | Preview publishes with `NPM_TOKEN` (token exception) |
| `spec-npm-trusted-publishing-oidc-migration.md` | OIDC migration + canary + acceptance                 |
| `scripts/canary-release.ts`                     | Local canary publish helper                          |
| `scripts/publish-smoke.ts`                      | Consumer smoke after pack                            |
| Vault note `projects/kubo/npm.md`               | Private operator notes / screenshots (not in git)    |

---

## Out of scope

- Changing package scope or marketing names
- Enforcing npm v12 consumer install allowlists (optional follow-up in OIDC migration spec)
- Publishing private packages
- Sharing the token with agents without a short-lived, revocable token

---

## Acceptance (this spec is done when)

- [x] Documents where tokens live (`~/.npmrc` vs GitHub Secrets) for OSS
- [x] Documents publish package order and dry-run
- [x] Explicit forbidden list for open-source tree
- [x] Aligns with existing Actions secret name `NPM_TOKEN`
- [ ] Operator has created token + secret (human action)
- [ ] First successful `kubojs` publish after 2FA policy (human + npm)
