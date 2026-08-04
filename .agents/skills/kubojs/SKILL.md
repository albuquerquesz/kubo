---
name: kubojs
description: Project workflow router for documented changes and evidence-based reviews in the kubojs monorepo.
---

# kubojs workflows

Use this entrypoint to select one repository workflow. It is router-only: it does not replace the repository rules in [`AGENTS.md`](../../../AGENTS.md).

## Orchestrator

1. Classify the request as documentation work or a code-change review.
2. Load exactly one matching workflow contract.
3. Apply the root repository rules and the selected contract.
4. Close only after the workflow review gate passes, or report the unmet gate with evidence.

## Command routing

Invoke `/<skillName> <command>` as `/kubojs document` or `/kubojs review`.

- `document` → [`workflows/document/SKILL.md`](workflows/document/SKILL.md)
- `review` → [`workflows/review/SKILL.md`](workflows/review/SKILL.md)

When subcommands are not parsed automatically, read the command from the user request and load its mapped contract. Do not create flat alias skills.

Natural-language aliases for documentation (still load **document** only):

- “atualize a blueprint / update the blueprint”
- “document this change”
- “sync agent docs with the monorepo”

## Internal helpers

- [`workflows/document/SKILL.md`](workflows/document/SKILL.md)
- [`workflows/review/SKILL.md`](workflows/review/SKILL.md)
- [`reference/routing-matrix.md`](reference/routing-matrix.md)
- [`reference/role-contracts.md`](reference/role-contracts.md)
- [`reference/monorepo-map.md`](reference/monorepo-map.md)

## Hard rules

- Preserve unrelated worktree changes; stage only files within the requested scope.
- Use TypeScript with strict typing and kebab-case filenames.
- Run `bun run check` before committing; run focused tests when behavior changes.
- Follow Conventional Commits with a repository-appropriate scope (`cli`, `web`, `video`, package name).
- Respect app boundaries in [`reference/monorepo-map.md`](reference/monorepo-map.md): Remotion lives in `apps/video` (`@kubojs/video`); do not nest video sources under `apps/web/public`.
- Link to [`AGENTS.md`](../../../AGENTS.md) for full coding, template, and test conventions instead of copying them here.
