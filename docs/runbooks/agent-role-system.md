# Agent role system

The repository's agent workflow entrypoint is [`kubojs`](../../.agents/skills/kubojs/SKILL.md).

Use one router command per invocation:

- [`/kubojs document`](../../.agents/skills/kubojs/workflows/document/SKILL.md) for evidence-backed documentation.
- [`/kubojs review`](../../.agents/skills/kubojs/workflows/review/SKILL.md) for read-only change reviews.

The root repository rules remain authoritative in [`AGENTS.md`](../../AGENTS.md). The role boundaries and routing rationale live in the skill's [reference material](../../.agents/skills/kubojs/reference/role-contracts.md).
