# breakbot

Jogo PUSH: protótipo HTML sendo portado para monorepo Turborepo (TanStack Start + React Three Fiber + `game-core` puro). Spec em `SPEC.md`.

## Coding standards

Leia `CODING_STANDARDS.md` antes de escrever código. Resumo: sem tipos inline, sem tipos repetidos, sem `unknown`, sem `as` (exceto `as const`), sem `any`, sem anotação inferível, sem `else`. Rode `pnpm lint`, `pnpm typecheck` e `pnpm test` antes de dar algo como pronto.

## Agent skills

### Issue tracker

Issues vivem no GitHub Issues de `albuquerquesz/breakbot` (via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Labels padrão: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` na raiz. See `docs/agents/domain.md`.
