---
name: kubojs-review
description: Review scoped changes for correctness, regressions, and verification gaps.
---

# id: kubojs.workflow.review

## Goal

Assess a scoped change for correctness, regressions, rule violations, and missing verification.

## Scope

Applies to existing diffs, pull requests, and implementation changes. It does not modify files or create commits unless the request explicitly asks for a fix.

## Triggers

- A request to review a diff, pull request, implementation, or regression risk.
- A request to inspect changes before commit or release.

## Inputs

- Base branch: `main`.
- Diff scope, target paths, and relevant tests or acceptance criteria.
- Existing repository instructions in [`AGENTS.md`](../../../../../AGENTS.md).

## Invariants

- Review the requested scope first and preserve unrelated worktree changes.
- Prioritize findings by severity and support each finding with file/line evidence.
- Do not claim a defect without a concrete failure mode or violated rule.
- Do not implement a fix unless explicitly authorized.

## Procedure

1. Inspect `git status`, the scoped diff, and the adjacent implementation.
2. Compare behavior against acceptance criteria, types, error paths, and repository rules.
3. Run the narrowest relevant checks when they are safe and available.
4. Report only actionable findings, ordered by severity; list open verification gaps separately.
5. If no findings remain, state that result and name the checks performed.

## Outputs

- A review with severity, evidence, impact, and reproduction or failure conditions for each finding.
- Validation results and explicit remaining risks.

## Review gate

- [ ] The requested diff and adjacent code were inspected.
- [ ] Every finding includes file/line evidence and a concrete impact.
- [ ] Relevant checks were run or the limitation is stated.
- [ ] The review does not modify code without authorization.

## References

- [Project router](../../SKILL.md)
- [Routing matrix](../../reference/routing-matrix.md)
- [Role contracts](../../reference/role-contracts.md)
- [Repository rules](../../../../../AGENTS.md)
