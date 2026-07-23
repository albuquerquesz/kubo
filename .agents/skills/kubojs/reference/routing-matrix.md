# Routing matrix

| Intent                                                                       | Command            | Contract                                                           |
| ---------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------ |
| Create, revise, or validate project docs, runbooks, ADRs, or specs           | `/kubojs document` | [`../workflows/document/SKILL.md`](../workflows/document/SKILL.md) |
| Inspect a diff, PR, implementation, or regression risk without changing code | `/kubojs review`   | [`../workflows/review/SKILL.md`](../workflows/review/SKILL.md)     |

If a request includes both intents, finish `document` first when it defines the acceptance criteria; otherwise begin with `review`. Use one contract per invocation.
