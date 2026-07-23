---
name: guaracloud-deploy
description: Use when integrating Guara Cloud deployment into kubojs projects, scaffolds, or generated repos.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [deploy, guaracloud, docker, monorepo, kubojs]
    related_skills: [scaffold-project]
---

# Guara Cloud Deploy Integration

## Overview

Guara Cloud is a container-oriented deploy target that works well with kubojs monorepos when each deployable app is treated as its own Guara service.

In this repo, the correct integration pattern is:

1. expose `guaracloud` as a first-class `webDeploy` / `serverDeploy` option;
2. reuse the existing Dockerfile generation paths for app builds;
3. add root package scripts that run the Guara CLI from `apps/web` or `apps/server`;
4. document monorepo service-root expectations in generated README output.

## When to Use

- Adding Guara Cloud as a selectable deployment target in the CLI or web builder
- Updating scaffolded package scripts for Guara CLI workflows
- Writing docs for Guara-based deploy flows in generated READMEs
- Extending deployment compatibility rules for container-based hosting

Do not use for:

- Cloudflare Workers-specific deployments
- Convex-hosted backend deployment flows
- Static-only hosting without app Dockerfiles

## Integration Rules

1. Treat Guara Cloud as a container deploy target.
   - Reuse Dockerfile template generation for `apps/web` and `apps/server`.
   - Do not generate `docker-compose.yml` just because Guara is selected.
     Completion criterion: Guara-enabled scaffolds create app Dockerfiles but not Docker Compose-only orchestration files.

2. Link one Guara service per app directory.
   - `apps/web` maps to one Guara service.
   - `apps/server` maps to one Guara service.
   - Guara CLI commands should run from the app directory being linked/deployed.
     Completion criterion: generated scripts use `cd apps/web && guara ...` or `cd apps/server && guara ...`.

3. Use target-specific script names when web and server deploy differently.
   - Prefer `deploy:web` / `deploy:server` when targets are split.
   - Prefer generic `deploy` only when Guara is the sole deploy target in the project.
     Completion criterion: no script-name collision between Cloudflare, Vercel, and Guara flows.

4. Keep runtime compatibility strict.
   - Guara server deploy is valid for Bun/Node backends.
   - Guara server deploy is not valid for Workers runtime.
   - Fullstack `self-*` backends should use `webDeploy=guaracloud`, not `serverDeploy=guaracloud`.
     Completion criterion: config validation rejects unsupported combinations with a clear message.

## CLI Surface Expected in Generated Repos

Always support:

- `deploy:login` → `guara login`

For single-target Guara deploys:

- `deploy:link`
- `deploy`
- `deploy:logs`
- `deploy:build-logs`
- `rollback`

For split-target deploys:

- `deploy:web:link` / `deploy:server:link`
- `deploy:web` / `deploy:server`
- `deploy:web:logs` / `deploy:server:logs`
- `deploy:web:build-logs` / `deploy:server:build-logs`
- `rollback:web` / `rollback:server`

## Docs That Matter

Use these Guara doc themes when updating integration copy:

- getting started: introduction, quickstart, concepts, pricing
- services: creating services, environment variables, scaling, storage volumes, build configuration, health checks, managing services
- deployments: overview, GitHub deploys, Docker deploys
- domains: service domains
- cli: login, link, deploy, logs, build-logs, rollback, env, domains
- supported technologies

## Repo-Specific Notes

- Deployment types are defined centrally in `packages/types/src/schemas.ts`.
- CLI prompts live in `apps/cli/src/prompts/`.
- Validation rules live in `apps/cli/src/utils/compatibility-rules.ts` and `config-validation.ts`.
- Generated package scripts come from `packages/template-generator/src/post-process/package-configs.ts`.
- Generated README deployment docs come from `packages/template-generator/src/processors/readme-generator.ts`.
- Builder option lists and disable reasons live in `apps/web/src/lib/constant.ts` and `apps/web/src/app/(home)/new/_components/utils.ts`.

## Common Pitfalls

1. Adding Guara only to the schema.
   This leaves prompts, builder UI, and generated docs out of sync.

2. Treating Guara like Docker Compose.
   Guara needs app Dockerfiles and per-service CLI commands, not root compose orchestration.

3. Running `guara link` from repo root.
   In a monorepo this links the wrong directory. Use the app directory.

4. Reusing generic `deploy` when web/server are split across providers.
   This causes script collisions and confusing README instructions.

5. Allowing Guara server deploy with Workers.
   Guara is container-based, so Workers must be redirected to Cloudflare deploy.

## Verification Checklist

- [ ] `guaracloud` exists in both web and server deploy schemas
- [ ] CLI prompts show Guara Cloud with repo-matched copy
- [ ] builder options include Guara Cloud
- [ ] server deploy validation rejects Workers + Guara
- [ ] generated root scripts include Guara CLI commands in the correct app directory
- [ ] generated README includes a Guara Cloud deployment section
- [ ] app Dockerfiles are generated for Guara deploy targets
- [ ] smoke test confirms generated files/scripts for a Guara config
