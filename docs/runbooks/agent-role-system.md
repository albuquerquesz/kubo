# Agent role system

The repository's agent workflow entrypoint is [`better-t-stack`](../../.agents/skills/better-t-stack/SKILL.md).

Use one router command per invocation:

- [`/better-t-stack document`](../../.agents/skills/better-t-stack/workflows/document/SKILL.md) for evidence-backed documentation.
- [`/better-t-stack review`](../../.agents/skills/better-t-stack/workflows/review/SKILL.md) for read-only change reviews.

The root repository rules remain authoritative in [`AGENTS.md`](../../AGENTS.md). The role boundaries and routing rationale live in the skill's [reference material](../../.agents/skills/better-t-stack/reference/role-contracts.md).
