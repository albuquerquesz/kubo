# Code quality review — last 3 commits

**Date:** 2026-08-04  
**Scope:** `HEAD~3..HEAD` only (exclusive of older history).  
**Method:** static + diff analysis of semantic deltas; pure rename/skill/media trees summarized, not re-audited line-by-line.  
**Rules referenced:** `AGENTS.md` and evidence-only findings.

## Executive summary

The three tip commits (1) wire production **web deploy to Vercel** on the same `chore(release):` gate as npm publish, (2) **extract Remotion** from `apps/web/public/video` into first-class `apps/video` (`@kubojs/video`), and (3) complete monorepo integration (Turbo `bundle`, root scripts, lockfile, agent docs).

Overall risk is **moderate for release CI** (credential and URL-parsing fragility on the new deploy job; ops docs that still claim pure OIDC while production publish uses `NPM_TOKEN`) and **low for the video move** once wiring is correct—`bun build` no longer typechecks nested Remotion under Next, and video is correctly opt-in via `bundle`. No **blocker** was found that would ship broken app source by itself; the highest severity items are **release reliability / credential / documentation mismatch**.

**This review does not implement fixes.**

## Reviewed commits (exclusive scope)

| Short      | Full hash                                  | Subject                                             |
| ---------- | ------------------------------------------ | --------------------------------------------------- |
| `0450614a` | `0450614aec37ac51d74b59d43265a3d34c4463aa` | chore: update 20 files                              |
| `cd822e63` | `cd822e632fd52be7993a0a41f805f2dbdfa02799` | refactor(video): Move video app from public to root |
| `45e9f3ee` | `45e9f3ee606da20d44af06a28102bd7af5caac4d` | ci(release): deploy web to Vercel after npm publish |

Commit order is newest → oldest (`git log -3`).

## Scope inventory

### Semantic / non-rename surfaces (inspected)

| Area          | Paths                                                                    | Role in range                                                        |
| ------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| CI            | `.github/workflows/release.yaml`                                         | New `deploy-web` job; release summary web blurb                      |
| Publish docs  | `docs/spec-npm-publish-secrets-and-oss.md`                               | Vercel credential table                                              |
| Monorepo root | `package.json`, `turbo.json`, `bun.lock`                                 | `dev:video` / `build:video`, Turbo `bundle` task, hoisted video deps |
| Video package | `apps/video/package.json`, `apps/video/.gitignore`                       | rename `@kubojs/video`, `build`→`bundle`, `render` script            |
| Web           | `apps/web/tsconfig.json`                                                 | drop `public/video` exclude after move                               |
| Agent docs    | `AGENTS.md`, `README.md`, `CONTEXT.md`, `.agents/skills/kubojs/SKILL.md` | agent guidance (context only)                                        |

### Rename / asset noise (summarized, not line-audited)

- **~224 pure renames** under `apps/web/public/video` → `apps/video` (Remotion skills, CLI, compositions, demo `history-of-venus` media, configs).
- Content delta on those trees in `cd822e63`: **0 lines** (path move only).
- Follow-up semantic edits live in `0450614a` (package scripts, ignore, docs).

### Explicitly out of scope

- History before `45e9f3ee`.
- Full monorepo product features unrelated to these commits.
- Live Remotion render, live Vercel deploy, or npm publish in this review environment.

---

## Findings (severity-ordered)

### High

#### H1 — Production release summary still claims OIDC “no write token” while publish uses `NPM_TOKEN`

- **Evidence:** `.github/workflows/release.yaml` production publish steps set `NPM_TOKEN` / `NODE_AUTH_TOKEN` (e.g. Publish types ~lines 353–358). The same job’s **Release Summary** still writes: `OIDC Trusted Publishing (no write token on publish steps)` (~line 433). Header comments also mix “OIDC … no NODE_AUTH_TOKEN” with later “Auth: NPM_TOKEN”.
- **Failure mode:** Operators and auditors trust the step summary / top-of-file narrative, under-provision or rotate the wrong secret, or believe Trusted Publisher is active for production when the path is token-based. The new `deploy-web` job sits on this release path and inherits the confusion.
- **Note:** Comment block ~344–351 is internally contradictory (title says OIDC / no token; body says `NPM_TOKEN`).

#### H2 — `deploy-web` URL capture via `tail -n 1` is fragile

- **Evidence:** `.github/workflows/release.yaml` Deploy prebuilt step:

  ```bash
  url=$(vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN" | tee /tmp/vercel-deploy.log | tail -n 1)
  ```

- **Failure mode:** Any extra footer/warning/progress line after the deployment URL makes `DEPLOY_URL` wrong; smoke then hits a bad URL, or the job “succeeds” with a non-URL string in the summary. Vercel CLI output shape is not a stable API.
- **Safer pattern (recommendation only):** parse URL with a regex over the full log, or use `vercel deploy ... --format=json` / documented machine-readable flags if available for the pinned CLI major.

#### H3 — `deploy-web` fails closed on missing Vercel credentials (good) but blocks the post-npm release path

- **Evidence:** Require Vercel credentials step exits 1 if `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` empty (~484–500). Job `needs: release` and runs after successful npm release when `chore(release):` matches.
- **Failure mode:** A successful npm publish can be followed by a red workflow if secrets/vars are not configured (observed as an operational gap in prior session notes). Site stays stale while packages are already live; team may misread the whole “Release” workflow as failed npm.
- **Mitigation (ops):** ensure secrets before next `chore(release):`; optionally split workflow notifications so “npm OK / web failed” is obvious in summaries.

### Medium

#### M1 — Operator docs still describe pure OIDC production publish

- **Evidence:** `docs/spec-npm-publish-secrets-and-oss.md` §G Open-source CI still says production uses Trusted Publisher OIDC and `npm publish without NODE_AUTH_TOKEN`, then deploy-web. Workflow reality for production steps is `NPM_TOKEN` (see H1). Commit `45e9f3ee` added Vercel tables but left this path description.
- **Failure mode:** Same as H1 for humans reading docs instead of YAML.

#### M2 — Smoke content marker and default production URL are brittle

- **Evidence:** Smoke step defaults `PROD_URL` to `https://kubo-gamma.vercel.app` and requires `grep -q 'kubojs'` on home HTML (~530–552).
- **Failure mode:** Custom domain cutover without `VERCEL_PRODUCTION_URL`, or marketing copy that drops the substring `kubojs`, fails release after a successful deploy.
- **Note:** Smoke does retry (6× / 5s) and optionally checks `DEPLOY_URL` — positive.

#### M3 — `deploy-web` runs whenever `release` job **succeeds**, including “version already on npm” skips

- **Evidence:** Release job does not fail when `exists=true`; publish steps are skipped via `if: steps.check-version.outputs.exists == 'false'`. `deploy-web` only requires `needs.release.result == 'success'` + `chore(release):` message.
- **Failure mode / behavior:** Re-pushing an already-published version still redeploys the site. Can be desirable (site-only refresh) or surprise cost/risk if the commit was a mistaken re-tag. Not a silent npm double-publish (guarded), but web side is not version-gated the same way.

#### M4 — Demo media (~25 MB) remains in git after extraction

- **Evidence:** `git ls-files` under `apps/video/public/content/history-of-venus/**` — 16 binary assets; `du` of tracked video public tree ≈ **25 MB**.
- **Failure mode:** Clone/CI bandwidth cost; accidental inclusion of future AI-generated blobs; monorepo noise for a package that is marketing/tooling, not the CLI publish surface.
- **Note:** Move did not introduce the media; it relocated it. Still a post-move quality issue for the new app root.

#### M5 — Story CLI defensive gaps (pre-existing, now first-class package surface)

- **Evidence:**
  - `apps/video/cli/service.ts` `generateAiImage`: on `res.ok`, uses `data.data[0].b64_json` without guarding empty `data` (~92–94) → runtime throw with opaque message.
  - `apps/video/src/lib/utils.ts` `loadTimelineFromFile`: no `res.ok` check before `res.json()`; `lengthMs` variable is actually **seconds** (`endMs / 1000`) (~12–14) — naming trap for future frame math edits.
  - Module-level mutable `apiKey` in `service.ts` (~9–13) with no concurrent-use protection (CLI single-process only today).
- **Failure mode:** Generator CLI crashes mid-run after paid API calls; wrong duration if someone “fixes” naming without understanding units.
- **Severity note:** Not introduced by the move commits’ line edits; elevated because `@kubojs/video` is now a workspace app with root scripts.

#### M6 — Dual toolchain pin for video vs monorepo root

- **Evidence:** `apps/video/package.json` pins `typescript@5.9.3`, own `eslint`/`prettier`; root catalog uses `typescript@6.0.3` and monorepo `oxfmt`/`oxlint`.
- **Failure mode:** Divergent typecheck results; contributors run package `lint` vs root `bun run check` and see different outcomes. Root `oxlint apps/video` currently clean (see verification).

### Low

#### L1 — Turbo `bundle` inputs hash ~225 files including agent skill trees

- **Evidence:** `turbo run bundle --filter=@kubojs/video --dry-run` → Inputs Files Considered = 225 under `apps/video` (includes `.agents/skills/**`).
- **Failure mode:** Doc-only skill edits invalidate Turbo cache for `bundle` unnecessarily.

#### L2 — Launch docs vs defaults for music bed

- **Evidence:** `LAUNCH.md` table lists default `musicFile` as `audio/launch-bed.mp3` (or null); `defaultKuboLaunchProps` sets `musicFile: null` and `public/audio/` only has `.gitkeep`.
- **Failure mode:** Mild operator confusion; Studio won’t fail if null (code guards with conditional `Audio`).

#### L3 — CLI shebang / cwd assumptions

- **Evidence:** `apps/video/cli/cli.ts` shebang `#!/usr/bin/env node`; `ContentFS.getDir` joins `process.cwd()` with `public/content/...`.
- **Failure mode:** Running `gen` from monorepo root writes content to wrong tree; docs say run from package / via package script (OK if followed).

### Nits

#### N1 — Commit message quality on follow-up

- **Evidence:** `0450614a` subject `chore: update 20 files` is non-descriptive for monorepo + agent blueprint + video package renames.
- **Impact:** History archaeology only.

#### N2 — Empty `repository: {}` on `@kubojs/video`

- **Evidence:** `apps/video/package.json`. Harmless for `private: true`; inconsistent with published packages’ repository guards in CI.

---

## Areas inspected with no material findings

| Area                                   | Result                                                                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Workspace membership                   | `@kubojs/video@workspace:apps/video` resolves via Bun workspaces `apps/*`                                               |
| Opt-out of monorepo `build`            | Package has **no** `build` script; `turbo run build --filter=@kubojs/video` executes **0 tasks** (WARNING only, exit 0) |
| Opt-in bundle                          | `turbo run bundle --filter=@kubojs/video` maps to `remotion bundle`; root `build:video` matches                         |
| Nested Next pollution                  | `apps/web/public/video` **absent**; `apps/web/tsconfig.json` exclude only `node_modules`                                |
| `deploy-web` gate when release skipped | `needs.release.result == 'success'` prevents deploy on non-release pushes (`skipped` ≠ `success`)                       |
| YAML validity                          | `release.yaml` parses under PyYAML                                                                                      |
| Remotion root composition              | `kubo-launch` registered with schema + defaults; frame-driven mark composition structure is coherent                    |
| `oxlint` on video src/cli              | 0 warnings / 0 errors on 23 files                                                                                       |
| `tsc --noEmit` in `apps/video`         | Exit 0 (no diagnostics)                                                                                                 |

---

## Positive observations

1. **Correct monorepo boundary:** moving Remotion out of `public/` fixes a real Next typecheck/deps footgun (historical `public/video` exclude comment).
2. **`build` → `bundle` rename** keeps expensive/opt-in video work off default `bun build` / Turbo `build` graph.
3. **`deploy-web` uses prebuilt path** (`vercel build` + `vercel deploy --prebuilt`) instead of uploading local `node_modules`/`.next` from a laptop — good CI hygiene.
4. **Explicit credential guard** with `::error::` messages before Vercel CLI work fails early and loudly.
5. **Smoke retries + dual URL check** improve post-deploy signal quality despite H2/M2 caveats.
6. **Agent blueprint / monorepo map** updated in-range so future agents route video work correctly (docs quality, not runtime).

---

## Verification performed

Commands and outcomes (captured under implementer scratch `review-checks.log` / `git-scope.txt`):

| Check                                | Command / action                                              | Outcome                                                      |
| ------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------ |
| Scope                                | `git log -3 --oneline`, `git diff HEAD~3..HEAD --name-status` | Commits match table above; ~224 renames + ~20 semantic paths |
| YAML                                 | `yaml.safe_load(release.yaml)`                                | `yaml_ok`                                                    |
| Workspace                            | `bun pm ls`                                                   | `@kubojs/video@workspace:apps/video`                         |
| Turbo bundle                         | `turbo run bundle --filter=@kubojs/video --dry-run`           | Task `@kubojs/video#bundle` → `remotion bundle`              |
| Turbo build opt-out                  | `turbo run build --filter=@kubojs/video`                      | 0 tasks executed, exit 0                                     |
| Path move                            | `test ! -e apps/web/public/video`                             | gone                                                         |
| Video typecheck                      | `cd apps/video && bunx tsc --noEmit`                          | clean                                                        |
| Video lint (oxlint)                  | `oxlint apps/video/src apps/video/cli`                        | 0 issues                                                     |
| Media weight                         | `du` on tracked `apps/video/public`                           | ~25 MB                                                       |
| Full monorepo `bun run check`        | **Skipped** (repo-wide fmt/lint cost; residual risk noted)    |
| Live Vercel deploy / Remotion render | **Skipped** (env/credentials + non-goal)                      |

Automated regression guard added: `apps/cli/test/monorepo-video-workspace.test.ts` asserts workspace name, scripts, Turbo `bundle`, release `deploy-web` markers, absence of `apps/web/public/video`, and presence of this report’s commit hashes.

---

## Residual risks / open questions

1. Are `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` already set on `albuquerquesz/kubo` Actions? Without them the next `chore(release):` will publish npm and fail web deploy (H3).
2. Is production intentionally on **token** npm publish (not OIDC)? If yes, strip OIDC claims from summaries/docs (H1/M1). If no, production steps are the bug.
3. Should re-running `chore(release):` for an **existing** version redeploy web (M3)?
4. Keep `history-of-venus` demo assets in-repo or LFS/gitignore + generate on demand (M4)?
5. Root `bun run check` / full `bun build` not re-run in this review — CI on main remains the authority for fmt/lint of the whole tree.

---

## Recommended next steps (priority)

1. **Ops:** Configure Vercel Actions secrets/vars; dry-run a non-prod deploy or workflow_dispatch if available.
2. **CI truthfulness:** Align release job comments + GitHub step summary + `spec-npm-publish-secrets-and-oss.md` with the real auth path (`NPM_TOKEN` vs OIDC).
3. **Hardening:** Parse Vercel deploy URL robustly; make smoke marker/URL configurable without hard-failing on brand string drift if needed.
4. **Repo hygiene:** Consider removing or LFS-ing large demo media under `apps/video/public/content/`.
5. **Video CLI:** Guard OpenAI image payload shape; fix `lengthMs` naming / `res.ok` in timeline load.
6. **History:** Prefer descriptive Conventional Commits for multi-area chores (`chore(video): …`, `docs(agents): …`).

---

## Report metadata

| Field         | Value                                             |
| ------------- | ------------------------------------------------- |
| Author role   | Thermo-nuclear static code-quality review (agent) |
| Fixes applied | None (report-only per scope)                      |
| Related guide | `.agents/skills/kubojs/SKILL.md`                  |
