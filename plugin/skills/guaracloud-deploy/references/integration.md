# Guara Cloud integration reference

Primary implementation facts pulled from Guara Cloud docs during this integration:

- Guara supports app deployment from GitHub and Docker images.
- Monorepo apps should be deployed as separate services with their own root directory.
- Build/runtime configuration includes environment variables, health checks, storage volumes, and scaling.
- CLI workflow centers on `guara login`, `guara link`, `guara deploy`, `guara logs`, `guara build-logs`, `guara rollback`, `guara env ...`, and domain management commands.
- Custom domains are attached after service creation/deploy.
- Supported technologies include Node/Bun-style containerized apps, which fits Better-T-Stack Dockerfile output.

Repo-specific guidance:

- Reuse Dockerfile templates instead of inventing Guara-only Dockerfiles.
- Keep Guara scripts at repo root but execute them from `apps/web` / `apps/server`.
- Keep README guidance explicit about per-app service linking in monorepos.
