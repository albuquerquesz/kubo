---
name: kubojs-document
description: Create or update repository documentation from current implementation evidence.
---

# id: kubojs.workflow.document

## Goal

Create or update repository documentation that matches the current implementation and repository rules.

## Scope

Applies to Markdown documentation, runbooks, specifications, and agent instructions. It does not implement product behavior or alter generated files without explicit authorization.

## Triggers

- A request to create, revise, or verify project documentation.
- Changes to `docs/`, `AGENTS.md`, or `.agents/skills/` that need an evidence-backed explanation.

## Inputs

- Base branch: `main`.
- Requested documentation scope and the relevant source files or diffs.
- Existing repository instructions in [`AGENTS.md`](../../../../../AGENTS.md).
- Monorepo layout reference: [`../../reference/monorepo-map.md`](../../reference/monorepo-map.md).

## Invariants

- State only facts supported by local repository evidence or explicitly cited external sources.
- Link to canonical instructions instead of duplicating long rules.
- Keep paths, command names, and workflow identifiers exact.
- Preserve unrelated worktree changes.
- When the request is a blueprint refresh, keep the router-only surface and sync `SKILL.md`, `template.json`, `reference/*`, and `AGENTS.md` links without inventing workflows.

## Procedure

1. Inspect the relevant files with `rg`, targeted reads, and `git diff` when changes are involved.
2. Identify the canonical source for each documented behavior (package manifests and live paths beat older prose).
3. Update only the requested documents using repository terminology and relative links.
4. If monorepo apps moved, update [`../../reference/monorepo-map.md`](../../reference/monorepo-map.md) and structure sections in `AGENTS.md` / root `README.md` together.
5. Verify every new or changed link resolves to an existing file.
6. Run a proportional validation, at minimum Markdown/path checks; run `bun run check` when repository formatting or linting may be affected.

## Outputs

- Updated documentation with accurate links.
- A concise handoff naming changed files and validation performed.

## Review gate

- [ ] All behavioral claims have repository evidence.
- [ ] Links and paths resolve.
- [ ] No unrelated instructions or files changed.
- [ ] Applicable validation passed or any limitation is reported.

## References

- [Project router](../../SKILL.md)
- [Routing matrix](../../reference/routing-matrix.md)
- [Monorepo map](../../reference/monorepo-map.md)
- [Repository rules](../../../../../AGENTS.md)
