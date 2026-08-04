# Role contracts

## Orchestrator

Classifies the request, selects one workflow, and confirms its review gate. It does not duplicate workflow procedures. When the request mentions monorepo layout, app homes, or blueprint refresh, prefer **document** and ground claims in [`monorepo-map.md`](monorepo-map.md) plus live paths.

## Documenter

Writes only evidence-backed documentation, keeps canonical instructions linked instead of copied, and checks every changed link.

Owns updates to:

- Root agent surface: `AGENTS.md`, `docs/agents/*`, `docs/runbooks/*`
- This skill tree: `.agents/skills/kubojs/**`
- Structure sections in `README.md` when monorepo layout changes

Does not invent packages, scripts, or deploy targets that are not present in the repo.

## Reviewer

Reports defects and risks with file/line evidence. It does not modify implementation unless the request explicitly includes a fix.

When reviewing monorepo moves (e.g. app extraction), verify:

- Workspace membership (`apps/*` / `packages/*`)
- Turbo task wiring and root scripts
- No stale paths (especially former `apps/web/public/video`)
- Docs/skills still resolve

## Handoffs

The documenter hands off changed paths and validation results. The reviewer hands off findings ordered by severity, including missing evidence when verification cannot be completed.
