# Coding standards

Regras obrigatórias para todo código TypeScript do repo. O que dá para checar automaticamente está no `biome.json` e em `biome-plugins/` (`pnpm lint`). O resto é checado em review (`/code-review`).

## TypeScript

| Regra                  | Como cumprir                                                                                                                                                 | Enforcement                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Sem tipos inline       | Todo tipo objeto vira um `type` nomeado. Nada de `{ ... }` em parâmetro, genérico ou retorno.                                                                | plugin `no-inline-object-type`                         |
| Sem tipos repetidos    | Um shape tem uma única fonte. Derive com `Pick`, `Omit`, `typeof`, `ReturnType`, `Parameters`, indexed access.                                               | review                                                 |
| Sem `unknown`          | Valide dados externos na borda (ex.: schema) e trabalhe com o tipo nomeado resultante.                                                                       | plugin `no-unknown`                                    |
| Sem `as`               | Modele o tipo para o TS inferir. Só `as const` é permitido.                                                                                                  | plugin `no-type-assertion`                             |
| Sem `any`              | Sem exceção no código do jogo.                                                                                                                               | `noExplicitAny`                                        |
| Sem `!` (non-null)     | Trate o caso ausente (retorno antecipado, valor padrão).                                                                                                     | `noNonNullAssertion`                                   |
| Sem anotação inferível | Não anote retorno de função nem variável com inicializador. Anote só parâmetros e o que o TS não consegue inferir (ex.: `useRef<T>(null)`, type predicates). | plugin `no-inferrable-annotation`, `noInferrableTypes` |

Uma exceção só entra com `// biome-ignore <regra>: <motivo concreto>` na linha. Sem motivo, não entra.

## Object Calisthenics

Adotadas:

1. **Sem `else`.** Use retorno antecipado, guard clauses ou mapa de lookup. Ternário simples é permitido, ternário aninhado não. (plugin `no-else`, `noNestedTernary`)
2. **Um nível de indentação por função, no máximo dois.** Extraia funções pequenas com nome. (review + `noExcessiveCognitiveComplexity` máx. 10)
3. **Sem abreviações.** `troop`, não `t`; `velocityZ`, não `vz`. Exceção: `x`, `z` para coordenadas e `index` em laços curtos.
4. **Entidades e arquivos pequenos.** Função faz uma coisa; arquivo com mais de ~150 linhas pede divisão.
5. **Coleções de primeira classe.** Regras sobre uma coleção (ex.: tropa, horda) moram num módulo dela, não espalhadas.
6. **Um ponto por linha (Lei de Demeter).** Evite cadeias `a.b.c.d`; peça ao dono do dado.

Adaptadas (motivo: o `game-core` simula ~2400 entidades a 60Hz e precisa ser barato):

- **Encapsular todo primitivo:** aplicado a conceitos de domínio com regra própria (ex.: `Lane`, `MatchPhase` como uniões literais). Coordenadas e HP continuam `number` nas entidades quentes.
- **No máximo duas variáveis de instância / sem getters e setters:** entidades da simulação são registros de dados simples, mutados só pelos módulos do core. O mundo exterior lê via snapshot readonly.

## Arquitetura

- `packages/game-core` não importa React, DOM nem three. Nada de `Math.random` no core: use o RNG da partida.
- `apps/web/src/features/<feature>` só expõe o que outras features usam pelo `index.ts` da feature. Nada de import profundo entre features.
- O render só lê o snapshot do core. Regra de jogo nunca mora no app.
- Vocabulário do `GLOSSARY.md` em nomes de código, testes e issues.
