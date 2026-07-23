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

## Internal helpers

- [`workflows/document/SKILL.md`](workflows/document/SKILL.md)
- [`workflows/review/SKILL.md`](workflows/review/SKILL.md)
- [`reference/routing-matrix.md`](reference/routing-matrix.md)
- [`reference/role-contracts.md`](reference/role-contracts.md)

## Hard rules

- Preserve unrelated worktree changes; stage only files within the requested scope.
- Use TypeScript with strict typing and kebab-case filenames.
- Run `bun run check` before committing; run focused tests when behavior changes.
- Follow Conventional Commits with a repository-appropriate scope.
