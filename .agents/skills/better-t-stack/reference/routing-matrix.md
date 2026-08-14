# Routing matrix

| Intent                                                                       | Command                    | Contract                                                           |
| ---------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------ |
| Create, revise, or validate project docs, runbooks, ADRs, or specs           | `/better-t-stack document` | [`../workflows/document/SKILL.md`](../workflows/document/SKILL.md) |
| Inspect a diff, PR, implementation, or regression risk without changing code | `/better-t-stack review`   | [`../workflows/review/SKILL.md`](../workflows/review/SKILL.md)     |

If a request includes both intents, finish `document` first when it defines the acceptance criteria; otherwise begin with `review`. Use one contract per invocation.
