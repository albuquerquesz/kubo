# Agent role system

The repository's agent workflow entrypoint is [`kubojs`](../../.agents/skills/kubojs/SKILL.md).

Use one router command per invocation:

- [`/kubojs document`](../../.agents/skills/kubojs/workflows/document/SKILL.md) for evidence-backed documentation (including blueprint / monorepo-map refresh).
- [`/kubojs review`](../../.agents/skills/kubojs/workflows/review/SKILL.md) for read-only change reviews.

The root repository rules remain authoritative in [`AGENTS.md`](../../AGENTS.md). Role boundaries live in [role contracts](../../.agents/skills/kubojs/reference/role-contracts.md). App ownership and script homes live in the [monorepo map](../../.agents/skills/kubojs/reference/monorepo-map.md).
