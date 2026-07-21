# Spec: Publish `kubojs` to npm without leaking secrets (open-source repo)

## Status

Ready for operators (local + GitHub Actions). Does **not** change product code by itself.

## Date

2026-07-21

## Goal

Define a **safe, repeatable** way to:

1. Create and store an npm **granular access token** (or OTP flow) for the account that owns the packages.
2. Publish the public packages (`@kubo/types`, `@kubo/template-generator`, `kubojs`, optionally `create-bts`) to `registry.npmjs.org`.
3. Keep all credentials **out of the git history**, PRs, logs, and the open-source tree at `github.com/albuquerquesz/kubo`.

**Scope of packages (publishable):**

| Package            | Path                          | Registry name              |
| ------------------ | ----------------------------- | -------------------------- |
| Types              | `packages/types`              | `@kubo/types`              |
| Template generator | `packages/template-generator` | `@kubo/template-generator` |
| CLI                | `apps/cli`                    | `kubojs`                   |
| Alias (optional)   | `packages/create-bts`         | `create-bts`               |

Private monorepo root name is `kubo` — **not** published.

---

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
   - CI: GitHub Actions secret **`NPM_TOKEN`** (or npm Trusted Publishing — see below)
4. Prefer a **granular** token with **write only on the packages you own** (`kubojs`, `@kubo/*`, `create-bts`), short expiry when possible.
5. Rotate the token if it might have been exposed.

---

## A. Create the token (npmjs.com)

1. Log in at [https://www.npmjs.com/](https://www.npmjs.com/) as the publish account (e.g. `albuquerquesz`).
2. Avatar → **Access Tokens** → **Generate New Token** → **Granular Access Token**.
3. Configure:
   - **Packages:** Read and write on `kubojs`, `@kubo/types`, `@kubo/template-generator`, `create-bts` (or “All packages” only if you accept wider risk).
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

Publish order matches the release workflow: **types → template-generator → CLI → create-bts**.

From monorepo root (authenticated):

```bash
# 1) Build
bun install
bun run build:cli   # builds deps + CLI via turbo

# 2) Optional smoke
bun run smoke:publish   # if available

# 3) Publish (versions already set in package.json)
cd packages/types && npm publish --access public && cd ../..
cd packages/template-generator && npm publish --access public && cd ../..
cd apps/cli && npm publish --access public && cd ../..
cd packages/create-bts && npm publish --access public && cd ../..
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

| Secret name | Value                        | Used by                                                                    |
| ----------- | ---------------------------- | -------------------------------------------------------------------------- |
| `NPM_TOKEN` | Granular npm token (publish) | `.github/workflows/pr-preview.yaml` (and should be wired for main release) |

**Rules:**

- Secret is encrypted by GitHub; not visible in the public clone.
- Only maintainers can read/write secrets.
- Workflows reference `${{ secrets.NPM_TOKEN }}` — **never** print it.

### C.2 How setup-node injects auth

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

### C.3 Existing workflows in this monorepo

| Workflow          | Auth pattern today                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `pr-preview.yaml` | `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` on publish steps                                                                               |
| `release.yaml`    | `registry-url` on setup-node; **ensure** every `npm publish` step also passes `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` (add if missing) |

**Operator checklist:**

1. Create granular token (section A).
2. Add GitHub secret `NPM_TOKEN` with that value (Settings → Secrets).
3. Confirm `release.yaml` / `pr-preview.yaml` use the secret — never a hard-coded token.
4. Trigger release only via the documented path (`chore(release): x.y.z` commit message on `main`, per workflow `if`).

### C.4 Optional: npm Trusted Publishing (OIDC)

npm supports **Trusted Publishing** (OIDC from GitHub Actions) so CI does not need a long-lived `NPM_TOKEN` in some setups.

- Configure package on npmjs.com → **Trusted Publisher** → GitHub Actions → this repo + workflow.
- Requires `permissions: id-token: write` (already present on `release.yaml`).
- Prefer this long-term for OSS; still keep a break-glass granular token offline if needed.

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
| First real publish: `npm view kubojs version` matches expected            | after publish                 |

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
npmjs.com → Granular token (write on kubojs + @kubo/*)
  → npm config set //registry.npmjs.org/:_authToken=…
  → npm whoami
  → build + npm publish --access public (from package dirs)
```

**Open-source CI (team / automation):**

```text
Same granular token
  → GitHub repo secret NPM_TOKEN (never in git)
  → workflows use NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  → release only via trusted workflow on main
```

---

## Relationship

| Doc / path                          | Role                                              |
| ----------------------------------- | ------------------------------------------------- |
| `.github/workflows/release.yaml`    | Automated release on `chore(release): x.y.z`      |
| `.github/workflows/pr-preview.yaml` | Preview publishes with `NPM_TOKEN`                |
| `scripts/canary-release.ts`         | Local canary publish helper                       |
| `scripts/publish-smoke.ts`          | Consumer smoke after pack                         |
| Vault note `projects/kubo/npm.md`   | Private operator notes / screenshots (not in git) |

---

## Out of scope

- Changing package scope or marketing names
- Migrating fully to Trusted Publishing (recommended follow-up)
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
