# Spec: Migrate npm deploy to Trusted Publishing (OIDC)

## Status

**Implemented in repo (workflows + docs).** Remaining: **human** Trusted Publisher UI (Phase 1), OIDC canary run (Phase 3 acceptance), first production OIDC release proof (Phase 4 acceptance), and token rotation (Phase 6 operator).  
**No product/runtime code change.**  
Changes: npm package settings (human), GitHub Actions workflows, docs.  
This supersedes the “long-term follow-up” in [`spec-npm-publish-secrets-and-oss.md`](./spec-npm-publish-secrets-and-oss.md) for **production publish auth**. That older spec remains valid for **secrets hygiene**, local OTP/bootstrap, and incident response.

### Implementation record (2026-07-30)

| Phase               | Repo state                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| 0 Preflight         | Packages at registry; `repository.url` correct; smoke path unchanged                                          |
| 1 Trusted Publisher | **Human** — configure all four packages → `release.yaml` before first OIDC canary/release                     |
| 2 CI harden         | `release.yaml` + `pr-preview.yaml`: npm ≥ 11.5.1 assert + `repository.url` guard                              |
| 3 OIDC canary       | Option B: `workflow_dispatch` job in `release.yaml` (`oidc_canary`, tag `oidc-canary`, no token)              |
| 4 Production OIDC   | `release.yaml` production publish steps have **no** `NODE_AUTH_TOKEN`; post-`npm view` verify; `--provenance` |
| 5 Preview           | **Token exception** documented: `pr-preview.yaml` keeps `NPM_TOKEN` for `pull_request_target`                 |
| 6 Bootstrap / docs  | `publish-create-kubojs.yaml` marked bootstrap-only; secrets spec updated for production = OIDC                |

## Date

2026-07-30

## Sources (authoritative)

| Source                                                                                                                        | Role                                              |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Vault skill `skills/npm-package-deploy-skill`                                                                                 | Deploy policy + decision tree + CI skeleton       |
| Vault note `projects/kubo/npm`                                                                                                | Kubo package inventory + Trusted Publisher fields |
| [npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers/)                                                          | OIDC setup                                        |
| [npm 2026-07-08 changelog](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/) | GAT bypass2FA deprecation timeline                |

## Goal

Move production and preview **npm publish** from long-lived `NPM_TOKEN` / `NODE_AUTH_TOKEN` to **Trusted Publishing (OIDC)** from GitHub Actions, **1:1 with the skill**, while **proving each step does not break** the existing release and preview process.

**Success means:**

1. Releases on `main` via `chore(release): x.y.z` still publish all four packages in order, then tag + GitHub Release.
2. PR preview (`preview` label) still publishes dist-tags without breaking consumer install docs.
3. Publish steps use **OIDC**, not write tokens.
4. A failed OIDC canary never ships a broken `latest` or leaves half a release.

## Out of scope

- Changing package names, dual-publish strategy, or create-convention (`create-kubojs`).
- Product features, CLI templates, web app.
- Enforcing npm v12 install allowlists for **consumers** (documented as optional follow-up only).
- Disabling all tokens on the npm account on day one (optional hard mode later).

---

## Package inventory (unchanged)

| Path                          | Registry name                | Publish order    |
| ----------------------------- | ---------------------------- | ---------------- |
| `packages/types`              | `@kubojs/types`              | 1                |
| `packages/template-generator` | `@kubojs/template-generator` | 2                |
| `apps/cli`                    | `create-kubojs`              | 3                |
| `apps/cli` (name rewrite)     | `@kubojs/cli`                | 4 (compat alias) |

All four already exist on the registry (e.g. `3.36.3`). **No interactive bootstrap** is required for these names. Bootstrap skill path applies only if a **new** name is introduced later.

Account / repo (Trusted Publisher form):

| Field                        | Value                                                                      |
| ---------------------------- | -------------------------------------------------------------------------- |
| npm owner / org              | account with publish rights (`albuquerquesz` / org `kubojs` as applicable) |
| GitHub owner                 | `albuquerquesz`                                                            |
| Repository                   | `kubo` (name only)                                                         |
| Production workflow filename | `release.yaml`                                                             |
| Preview workflow filename    | `pr-preview.yaml`                                                          |
| Environment name             | **empty** (jobs do not use a named GitHub Environment today)               |
| Allowed action               | ☑ Allow npm publish                                                        |

`package.json` `repository.url` today (must stay exact for OIDC provenance):

```text
git+https://github.com/albuquerquesz/kubo.git
```

Present on `apps/cli`, `packages/types`, `packages/template-generator`.

---

## Current state vs skill (gap map)

| #                  | Skill requirement                                                        | Current state                                                                                                                                    | Spec fix                                                                                                |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **G1**             | Trusted Publisher on **each** package for the production workflow        | Not configured (or not verified) for all four                                                                                                    | Phase 1 human config + checklist                                                                        |
| **G2**             | Publish with **no** `NODE_AUTH_TOKEN` / write token                      | `release.yaml`, `pr-preview.yaml`, `publish-create-kubojs.yaml` all set `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` on publish                   | Phase 3–5 strip after canary pass                                                                       |
| **G3**             | Job `permissions.id-token: write`                                        | Already set on all three workflows                                                                                                               | Keep; do not remove                                                                                     |
| **G4**             | Node ≥ 22.14 (prefer **24**); npm CLI ≥ **11.5.1**                       | Root `engines.node` is `24.x`; setup uses `node-version-file: package.json` + `check-latest: true` — good baseline, but npm version not asserted | Phase 2 assert `npm --version` / install `npm@latest` if needed                                         |
| **G5**             | Hosted GitHub Actions runners for OIDC                                   | `runs-on: ubuntu-latest`                                                                                                                         | Keep                                                                                                    |
| **G6**             | Workflow filename on npm = **filename only** under `.github/workflows/`  | Files are `release.yaml`, `pr-preview.yaml`                                                                                                      | Document; never rename without updating npm Trusted Publisher                                           |
| **G7**             | Environment name empty unless job uses GH Environment                    | No `environment:` on jobs                                                                                                                        | Keep empty on npm form                                                                                  |
| **G8**             | `repository.url` exact match to GitHub repo                              | Already correct                                                                                                                                  | Guard in Phase 0; fail CI if drifted                                                                    |
| **G9**             | Do not treat bootstrap / one-off workflow as long-term production path   | `publish-create-kubojs.yaml` is `workflow_dispatch` bootstrap                                                                                    | Mark retired after OIDC prod works; do not add new Trusted Publisher for it unless needed for emergency |
| **G10**            | Prefer rotating / stopping long-lived write tokens after OIDC works      | `NPM_TOKEN` is primary publish auth                                                                                                              | Phase 6: rotate secret; stop using for publish; optional break-glass only                               |
| **G11**            | Publish order types → template-generator → create-kubojs → `@kubojs/cli` | Already correct in workflows                                                                                                                     | Preserve order and existing `smoke:publish` gate on release                                             |
| **G12**            | Smoke after publish / create-command resolution                          | `bun run smoke:publish` before publish on release                                                                                                | Keep; add post-publish `npm view` checks on canary + first OIDC release                                 |
| **G13** (optional) | npm v12 install-time allowlists                                          | Not yet required for this migration                                                                                                              | Appendix only; do not block OIDC cutover                                                                |

---

## Non-negotiable safety rules (test deploy without breaking current process)

1. **Do not remove `NPM_TOKEN` from GitHub secrets** until an OIDC canary publish has succeeded for all four packages.
2. **Do not strip `NODE_AUTH_TOKEN` from `release.yaml` on `main`** until Phase 4 acceptance is green.
3. **Never canary on `latest`.** Canary uses a dedicated dist-tag (e.g. `oidc-canary`) and a pre-release version (e.g. `3.36.3-oidc.1` or `0.0.0-oidc.<sha>`).
4. **Do not re-publish an existing immutable version.** Canary and real releases must use versions npm has not seen.
5. **One workflow change at a time on the production path:** canary workflow → prove OIDC → switch `release.yaml` → prove real release or dry rehearsal → switch `pr-preview.yaml`.
6. **Preserve release gates:** version parse, “already exists” skip, build, `smoke:publish`, then publish order, then tag/GitHub Release.
7. **Rollback is token restore**, not “force push package versions.” Keep a working `NPM_TOKEN` path in a documented rollback snippet until Phase 6.
8. **No tokens in git, chat logs, or PR bodies** (same as existing secrets spec).

---

## Phased plan (execute in order)

### Phase 0 — Preflight (no registry write, no workflow auth change)

**Owner:** anyone with repo + npm read.

**Steps:**

1. Confirm packages exist:

   ```bash
   npm view create-kubojs version
   npm view @kubojs/cli version
   npm view @kubojs/types version
   npm view @kubojs/template-generator version
   ```

2. Confirm Node/npm locally or in CI dry job:

   ```bash
   node -v   # expect v24.x when using engines
   npm -v    # must be ≥ 11.5.1 for OIDC publish client support
   ```

3. Confirm `repository.url` on all three publishable `package.json` files matches  
   `git+https://github.com/albuquerquesz/kubo.git`.

4. Confirm workflow filenames under `.github/workflows/`:
   - `release.yaml`
   - `pr-preview.yaml`
   - `publish-create-kubojs.yaml` (bootstrap only)

5. Run local consumer smoke (no publish):

   ```bash
   bun install --frozen-lockfile
   bun run build:cli
   bun run smoke:publish
   ```

6. Optional: `cd apps/cli && npm publish --access public --dry-run` (local; no upload).

**Exit criteria:** all four packages resolve; smoke green; repository URLs correct; Node 24 / npm ≥ 11.5.1 available on CI path.

**Current process impact:** none.

---

### Phase 1 — Configure Trusted Publishers (human, npm UI)

**Owner:** package maintainer with browser 2FA (not a bypass-2FA GAT — admin may already require human 2FA ~Aug 2026).

For **each** of the four packages on npmjs.com:

1. Package → **Settings** → **Trusted Publisher** → **GitHub Actions**.
2. Set:

   | Field                | Value                                                                                  |
   | -------------------- | -------------------------------------------------------------------------------------- |
   | Organization or user | `albuquerquesz`                                                                        |
   | Repository           | `kubo`                                                                                 |
   | Workflow filename    | `release.yaml` **and** (separately or second publisher if UI allows) `pr-preview.yaml` |
   | Environment          | _(leave empty)_                                                                        |
   | Allow npm publish    | checked                                                                                |

**Important:**

- If the UI allows **only one** workflow per package, prefer **`release.yaml` first**. Add `pr-preview.yaml` as a second Trusted Publisher when the UI supports multiple, **or** keep preview on `NPM_TOKEN` until multiple workflows are supported (document which path was taken in the PR).
- Do **not** configure Trusted Publisher for `publish-create-kubojs.yaml` as the primary path.

**Exit criteria:** screenshot or maintainer confirmation that Trusted Publisher is set for all four packages for `release.yaml` (and preview plan decided).

**Current process impact:** none. Token publish continues to work; OIDC is additive until workflows stop sending tokens.

---

### Phase 2 — Harden CI tooling without removing tokens

**Owner:** implementer (repo PR).

**Code changes (safe, additive):**

1. In `release.yaml` and `pr-preview.yaml` (and optionally the canary workflow), after `setup-node`:

   ```yaml
   - name: Ensure npm supports OIDC Trusted Publishing
     run: |
       npm install -g npm@latest
       node -v
       npm -v
       # Fail if npm is older than 11.5.1
       node -e "const [M,m,p]=process.versions?require('child_process').execSync('npm -v').toString().trim().split('.').map(Number):[]; const v=require('child_process').execSync('npm -v').toString().trim(); const [a,b]=v.split('.').map(Number); if(a<11||(a===11&&b<5)){console.error('npm too old for OIDC:',v); process.exit(1)}"
   ```

   Prefer a small shell compare if cleaner; goal is **assert npm ≥ 11.5.1**.

2. Keep `permissions.id-token: write`.
3. Keep `registry-url: https://registry.npmjs.org` on `setup-node`.
4. **Do not remove** `NODE_AUTH_TOKEN` yet.
5. Optionally add a repository-url guard step (grep/jq) that fails if `repository.url` drifts.

**Tests before merge:**

- [ ] PR runs existing `test.yaml` (or equivalent) green.
- [ ] Manually inspect YAML: no secret printed; no rename of `release.yaml`.
- [ ] `bun run smoke:publish` still green locally.

**Exit criteria:** merged to `main` **without** changing publish auth. Next real `chore(release):` (if any) still uses token path successfully, or no release occurs in this window.

**Current process impact:** minimal (extra setup time). Token path unchanged.

---

### Phase 3 — OIDC canary (prove publish works; do not touch `latest`)

**Owner:** implementer + maintainer.

**Add** a dedicated workflow (recommended name):

`.github/workflows/oidc-publish-canary.yaml`

| Property        | Value                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| Trigger         | `workflow_dispatch` only                                                                                 |
| Permissions     | `contents: read`, `id-token: write`                                                                      |
| Auth on publish | **no** `NODE_AUTH_TOKEN`                                                                                 |
| Version         | input, default e.g. `0.0.0-oidc.<run_id>` or explicit pre-release **not** equal to any published version |
| Dist-tag        | fixed `oidc-canary` (never `latest`)                                                                     |
| Packages        | same four, same order as release                                                                         |
| Smoke           | run `bun run smoke:publish` before publish                                                               |
| Post-publish    | `npm view <pkg>@<version> version` for all four; fail job if missing                                     |

**Publish commands (sketch):**

```yaml
- name: Publish types (OIDC)
  run: cd packages/types && npm publish --access public --tag oidc-canary
  # NO env NODE_AUTH_TOKEN

- name: Publish template-generator (OIDC)
  run: cd packages/template-generator && npm publish --access public --tag oidc-canary

- name: Publish create-kubojs (OIDC)
  run: cd apps/cli && npm publish --access public --tag oidc-canary

- name: Publish @kubojs/cli alias (OIDC)
  run: |
    cd apps/cli
    ORIGINAL=$(cat package.json)
    jq '.name = "@kubojs/cli"' package.json > tmp.json && mv tmp.json package.json
    npm publish --access public --tag oidc-canary
    echo "$ORIGINAL" > package.json
```

**Trusted Publisher note:** this canary workflow filename must also be registered on npm for each package **or** the canary must reuse an already-trusted filename. Prefer:

- **Option A (recommended):** register a second Trusted Publisher workflow `oidc-publish-canary.yaml` on each package for the canary only; or
- **Option B:** temporarily run canary logic as a `workflow_dispatch` job **inside** `release.yaml` (same trusted filename) gated by `if: github.event_name == 'workflow_dispatch'`, so Phase 1 Trusted Publisher for `release.yaml` covers the canary without a second npm form entry.

**Choose Option B if npm only allows one workflow and you do not want two entries.** Spec default: **Option B** for least npm UI friction.

Option B shape:

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      oidc_canary:
        description: "If true, publish OIDC canary tag only (no latest, no git tag)"
        type: boolean
        default: false
      canary_version:
        description: "Pre-release version for OIDC canary"
        type: string
        default: ""
```

Gate existing release job vs canary job carefully so a normal push never runs canary and canary never creates `vX.Y.Z` git tags.

**Canary acceptance tests:**

| #   | Check                                                                      | Pass |
| --- | -------------------------------------------------------------------------- | ---- |
| C1  | Job logs show publish **without** `NODE_AUTH_TOKEN` on publish steps       | yes  |
| C2  | All four packages accept OIDC publish (HTTP 200 / npm success)             | yes  |
| C3  | `npm view <pkg>@<canary_version> version` matches                          | yes  |
| C4  | `npm view create-kubojs dist-tags` shows `oidc-canary` → canary version    | yes  |
| C5  | `latest` dist-tag **unchanged** from pre-canary                            | yes  |
| C6  | Install smoke: `npx create-kubojs@oidc-canary --version` (or `bunx`) works | yes  |
| C7  | Existing token-based path still present in YAML for non-canary job         | yes  |

**On canary failure:**

1. Do **not** strip tokens from production job.
2. Use skill error map: workflow name mismatch, missing `id-token: write`, old npm, wrong owner/repo, environment mismatch, `repository.url` mismatch.
3. Fix and re-run canary with a **new** canary version.

**Current process impact:** none on `latest` or normal `chore(release):` if gates are correct.

---

### Phase 4 — Switch production `release.yaml` to OIDC

**Owner:** implementer. **Only after Phase 3 green.**

**Code changes:**

1. On every **production** `npm publish` step in `release.yaml`:
   - **Remove** `env.NODE_AUTH_TOKEN`.
   - Keep `npm publish --access public` (optionally add `--provenance` if not already implied by OIDC; preview already uses `--provenance` — align if desired).
2. Keep version existence check, build, `smoke:publish`, order, dual alias publish, git tag, GitHub Release.
3. Add post-publish verification step:

   ```bash
   VERSION=...
   npm view create-kubojs@$VERSION version
   npm view @kubojs/cli@$VERSION version
   npm view @kubojs/types@$VERSION version
   npm view @kubojs/template-generator@$VERSION version
   ```

4. Ensure canary-only paths (if Option B) still do not set tokens on canary either.

**How to test without gambling production:**

| Approach                                                                                     | When                                                          |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Preferred:** next planned patch release after canary                                       | Real `chore(release): x.y.z` with OIDC                        |
| **If no release pending:** keep canary green; merge Phase 4; first release is the prod proof | Document that first OIDC release is the gate before Phase 5/6 |
| **Do not** publish the same version twice                                                    | Always bump                                                   |

**Production acceptance tests (first OIDC release):**

| #   | Check                                                                                            | Pass                       |
| --- | ------------------------------------------------------------------------------------------------ | -------------------------- |
| R1  | Workflow run succeeds end-to-end                                                                 | yes                        |
| R2  | All four packages at `$VERSION` on registry                                                      | yes                        |
| R3  | `latest` points to `$VERSION` for intended packages                                              | yes                        |
| R4  | Git tag `v$VERSION` + GitHub Release exist                                                       | yes                        |
| R5  | Publish steps have **no** `NODE_AUTH_TOKEN`                                                      | yes                        |
| R6  | `bun create kubojs@$VERSION --help` or install + `--version` works                               | yes                        |
| R7  | No partial publish (if types published and CLI failed — treat as incident; fix version strategy) | smoke already reduces this |

**Rollback (same day):**

1. Revert the PR that stripped tokens **or** re-add:

   ```yaml
   env:
     NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
   ```

   on publish steps only.

2. Confirm `NPM_TOKEN` secret still valid.
3. Re-run release only if version was **not** partially published; if partial, bump version and complete remaining packages carefully.

**Current process impact:** auth method only. Triggers, commit message gate, order, smoke, tags unchanged.

---

### Phase 5 — Switch `pr-preview.yaml` to OIDC (or document token exception)

**Owner:** implementer. **Only after Phase 4 green (or explicit waiver).**

**If** Trusted Publisher includes `pr-preview.yaml` (or a shared trusted filename strategy works with `pull_request_target`):

1. Remove `NODE_AUTH_TOKEN` from preview publish steps **and** from `npm whoami` if that step cannot work under OIDC (OIDC identity is not a classic whoami session). Replace “Verify NPM auth” with:

   ```yaml
   - name: Verify Node/npm for OIDC
     run: |
       node -v
       npm -v
   ```

2. Keep label gate `preview`, version scheme `*-prN.sha`, tag `prN`, PR comment body.

**If** npm Trusted Publisher **cannot** attach to `pull_request_target` workflows reliably:

- Document **preview remains on granular `NPM_TOKEN`** as temporary exception.
- Scope token to publish-only, short expiry, no bypass-2FA long-term reliance.
- Track follow-up: move preview to `workflow_dispatch` on a trusted file or OIDC-supported trigger.

**Preview acceptance tests:**

| #   | Check                                                                  | Pass |
| --- | ---------------------------------------------------------------------- | ---- |
| P1  | Label `preview` publishes four packages under tag `prN`                | yes  |
| P2  | PR comment install commands still work                                 | yes  |
| P3  | No publish to `latest`                                                 | yes  |
| P4  | Auth path matches chosen strategy (OIDC or documented token exception) | yes  |

**Current process impact:** auth only; preview UX unchanged.

---

### Phase 6 — Token hygiene + retire bootstrap path

**Owner:** maintainer. **Only after Phase 4 green.**

1. **Rotate** `NPM_TOKEN` (revoke old granular/classic write token on npmjs.com).
2. If preview still needs a token: set new **short-lived**, package-scoped publish token as `NPM_TOKEN`.
3. If preview is OIDC-only: remove `NPM_TOKEN` from GitHub Actions secrets **or** leave empty with comment in docs that production no longer needs it.
4. Mark `.github/workflows/publish-create-kubojs.yaml`:
   - Header comment: **bootstrap only; retired for routine releases; do not use when packages already exist.**
   - Optional: disable by removing `workflow_dispatch` or adding `if: false` until deleted in a later cleanup.
5. Update docs:
   - This spec → Status: **Done** when acceptance below is checked.
   - [`spec-npm-publish-secrets-and-oss.md`](./spec-npm-publish-secrets-and-oss.md): section C.3/C.4 rewrite — production = OIDC; token = break-glass / optional preview.
   - Vault `projects/kubo/npm.md`: note “production on Trusted Publishing as of \<date\>”.
6. Optional hard mode (skill): package **Publishing access** → require 2FA and **disallow tokens** — only after preview also OIDC and break-glass plan agreed.

**Exit criteria:** production publish has no write token; tokens rotated; docs consistent; bootstrap not the default path.

---

### Phase 7 (optional) — npm v12 install-time security readiness

Not required for OIDC cutover. When npm v12 is `latest` in CI consumers:

- Audit lifecycle scripts / git deps / remote deps.
- Use `npm approve-scripts` / allowlists as needed for CI install and documented consumer paths.
- Re-run `smoke:publish` under npm 12.

---

## Concrete file change checklist

| File                                           | Phase | Change                                                                                    |
| ---------------------------------------------- | ----- | ----------------------------------------------------------------------------------------- |
| npmjs.com (4 packages)                         | 1     | Trusted Publisher → GitHub `albuquerquesz` / `kubo` / `release.yaml` (+ preview if multi) |
| `.github/workflows/release.yaml`               | 2     | Assert npm ≥ 11.5.1; keep tokens                                                          |
| `.github/workflows/release.yaml`               | 3     | Option B: `workflow_dispatch` canary job/path without token                               |
| `.github/workflows/oidc-publish-canary.yaml`   | 3     | **Only if Option A**                                                                      |
| `.github/workflows/release.yaml`               | 4     | Remove `NODE_AUTH_TOKEN` from production publish; post-`npm view` verify                  |
| `.github/workflows/pr-preview.yaml`            | 2, 5  | npm assert; then OIDC or documented token exception                                       |
| `.github/workflows/publish-create-kubojs.yaml` | 6     | Retire / document bootstrap-only                                                          |
| `docs/spec-npm-publish-secrets-and-oss.md`     | 6     | Point production at this migration                                                        |
| Vault `projects/kubo/npm.md`                   | 6     | Operator status update (private)                                                          |

**Do not change:** package names, workspace publish order, `smoke:publish` semantics, release commit message gate, PR label gate.

---

## Relationship to existing process (must keep working)

```text
Today (token):
  main + "chore(release): x.y.z"
    → release.yaml
    → smoke:publish
    → npm publish ×4 with NPM_TOKEN
    → git tag + GH release

Target (OIDC):
  main + "chore(release): x.y.z"
    → release.yaml
    → smoke:publish          # UNCHANGED
    → npm publish ×4 via OIDC  # AUTH ONLY CHANGE
    → git tag + GH release   # UNCHANGED
    → npm view verify        # ADDED

Preview:
  label "preview" → pr-preview.yaml → dist-tag prN  # UX UNCHANGED; auth OIDC or exception
```

Regression risk is concentrated in **auth and Trusted Publisher misconfiguration**, not in build or versioning — hence canary before stripping tokens.

---

## Error → action map (skill-aligned)

| Symptom during canary/prod         | Likely cause                                                     | Fix without breaking token fallback                                                 |
| ---------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| OIDC publish 403/404               | Trusted Publisher missing / wrong workflow filename / wrong repo | Fix npm UI; keep token path; re-canary                                              |
| OIDC fails only when token removed | Token was masking OIDC misconfig                                 | Restore token temporarily; fix OIDC; canary again                                   |
| `npm too old`                      | CLI &lt; 11.5.1                                                  | `npm install -g npm@latest` step                                                    |
| Provenance / repository mismatch   | `repository.url` wrong                                           | Fix package.json; do not force wrong owner                                          |
| Preview fails after OIDC-only      | `pull_request_target` not trusted on npm                         | Keep preview on token (Phase 5 exception)                                           |
| Partial monorepo publish           | Mid-job failure after first package                              | smoke already gates; complete remaining with next version or manual careful publish |

---

## Acceptance (this migration is done when)

### Deploy environment / skill 1:1

- [ ] **G1** Trusted Publisher configured for all four packages for production workflow `release.yaml` _(human)_
- [x] **G2** Production publish steps have **no** `NODE_AUTH_TOKEN` _(repo)_
- [x] **G3** `id-token: write` retained
- [x] **G4** CI asserts Node 24 path + npm ≥ 11.5.1
- [x] **G5–G8** Hosted runners, filename, empty environment, matching `repository.url` guard
- [x] **G9** Bootstrap workflow not the production path (header comment + docs)
- [ ] **G10** Write token rotated / no longer primary for production publish _(human after canary + first OIDC release)_
- [x] **G11–G12** Order + smoke preserved; post-publish `npm view` steps added

### Safe process proof

- [x] Phase 0 preflight green (local)
- [x] Phase 2 workflow harden landed with production OIDC strip (see implementation record)
- [ ] Phase 3 OIDC canary: all four packages + `latest` unchanged + install from canary tag works _(run after G1)_
- [ ] Phase 4 first production OIDC release green _(after canary)_
- [x] Phase 5 preview strategy decided: **token exception** for `pr-preview.yaml`
- [x] Rollback procedure documented; keep `NPM_TOKEN` secret until Phase 6 complete

### Docs

- [ ] This spec marked **Done** _(after G1 + canary + first OIDC release + token rotation)_
- [x] `spec-npm-publish-secrets-and-oss.md` updated for production = OIDC
- [ ] Operator vault note updated _(private; human)_

---

## Implementation notes for agents

1. Prefer **small PRs**: (a) npm assert only, (b) canary path, (c) strip tokens from release, (d) preview, (e) docs/retire bootstrap.
2. Never commit tokens or paste them into PR text.
3. Do not rename `release.yaml` without simultaneous npm Trusted Publisher update.
4. Do not run canary against an already-published version.
5. Keep Conventional Commits: e.g. `ci(release): assert npm for OIDC`, `ci(release): add OIDC canary path`, `ci(release): publish via Trusted Publishing`.
6. Verification commands for PR description: `bun run smoke:publish`, canary run URL, `npm view` outputs (versions only, no secrets).

---

## Quick operator checklist (print / PR body)

```text
[ ] Phase 0: npm view ×4, smoke:publish, repository URLs
[ ] Phase 1: Trusted Publisher on create-kubojs, @kubojs/cli, @kubojs/types, @kubojs/template-generator → release.yaml
[ ] Phase 2: npm version assert merged; tokens still present
[ ] Phase 3: OIDC canary publish tag oidc-canary; latest unchanged
[ ] Phase 4: strip NODE_AUTH_TOKEN from release publish; first OIDC release OK
[ ] Phase 5: preview OIDC or documented token exception
[ ] Phase 6: rotate NPM_TOKEN; retire bootstrap as default; update docs
```
