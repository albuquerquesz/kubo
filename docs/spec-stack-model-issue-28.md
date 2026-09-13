# Spec: Modelo único de stack no Stack Builder (#28)

## Status

Proposed. Issue: [#28](https://github.com/albuquerquesz/kubo/issues/28). Depends on the catalog contracts delivered by [#27](./spec-catalog-capabilities-issue-27.md).

## Objetivo

Fazer o Stack Builder usar a mesma representação de configuração da CLI, com `ProjectConfig` como fonte canônica para as escolhas da stack. A interface pode ter metadados de apresentação, mas não pode criar IDs paralelos para representar uma configuração válida.

## Problema confirmado

- A CLI representa fullstack como `backend: "self"` + um frontend compatível.
- O builder representa a mesma escolha como `backend: "self-next"`, `"self-nuxt"` etc.
- `generateStackCommand` precisa converter esses IDs antes de emitir o comando.
- `TECH_OPTIONS` é uma lista paralela e já divergiu do catálogo canônico: não expõe `nestjs`, `orval` ou `arara`.
- O builder mantém um `StackState` próprio, com frontends separados e booleanos como strings, enquanto `ProjectConfig` usa um único `frontend` e tipos normalizados.

## Decisões de arquitetura

1. Criar em `@kubojs/types` um tipo de draft derivado de `ProjectConfig`, excluindo apenas campos derivados do filesystem (`projectDir` e `relativePath`). O draft terá `frontend: Frontend[]`, `backend: Backend`, booleanos reais para `git` e `install`, e os demais campos canônicos.
2. Manter fora do draft somente estado de apresentação ou controle do builder, como `viewMode`, `selectedFile` e `yolo`.
3. O builder usará `backend: "self"`. O frontend selecionado determina a apresentação “Next.js fullstack”, “Nuxt fullstack” etc.; esses nomes não serão IDs persistidos.
4. `TECH_OPTIONS` será montado a partir dos valores e capabilities de `@kubojs/types`. Labels, descrições, ícones e cores continuam sendo metadados da web indexados pelos IDs canônicos. O catálogo deve incluir `nestjs`, `orval` e `arara` quando esses valores forem suportados pela superfície correspondente.
5. `generateStackCommand` receberá o draft normalizado e serializará diretamente os campos da CLI. Remover `mapBackendToCli` e qualquer tradução de `self-*`.
6. URL e `localStorage` gravarão somente o formato canônico. A leitura terá uma migração de borda para links e preferências antigas: `self-*` vira `backend: "self"` e o frontend correspondente entra em `frontend`; arrays `webFrontend`/`nativeFrontend` são combinados; `git` e `install` são convertidos para booleanos.
7. `analyzeStackCompatibility` e `getDisabledReason` continuam no builder nesta issue, mas passam a consumir o modelo canônico. O motor único `evaluate(config)` permanece fora do escopo e pertence à issue #29.

## Limpeza obrigatória no escopo

- Remover listas, regras e presets que existem apenas para sustentar `self-*`.
- Centralizar a classificação web/native e a relação de frontends compatíveis com `self` em helpers tipados de `@kubojs/types`.
- Substituir casts usados para esconder a diferença entre `StackState` e `ProjectConfig` por fronteiras tipadas de normalização.
- Manter a mudança localizada ao modelo, catálogo, serialização e testes; não refatorar templates nem o oracle da matrix.

## Testes e validação

- Teste de paridade: cada valor canônico exposto ao builder aparece no catálogo da categoria correta; cobre especialmente `backend: "self"`, `nestjs`, `api: "orval"` e `communication: "arara"`.
- Teste de contrato: um draft normalizado passa no `ProjectConfigSchema` após receber os campos de filesystem derivados.
- Teste de round-trip: draft → URL → draft preserva os valores canônicos e nunca produz `self-*`.
- Teste de migração: URLs e preferências antigas com `self-next`, frontends separados e booleanos string são convertidos uma vez na entrada.
- Teste de comando: `backend: "self"` + `frontend: ["next"]` produz `--backend self --frontend next` sem tradutor intermediário; o mesmo vale para os cinco frontends fullstack suportados.
- Atualizar os testes do builder para usar os IDs da CLI e preservar as regras atuais de compatibilidade e as mensagens de produto.
- Manter os testes existentes da CLI para `self` e NestJS; adicionar pelo menos um contrato cruzado usando a configuração normalizada.

Validação mínima: `bun test apps/web/test/stack-builder-compatibility.test.ts`, `bun test apps/web/test/stack-compatibility-invariant.test.ts`, `bun test apps/cli/test/backend-runtime.test.ts apps/cli/test/cli-validation.test.ts` e `bun run check`.

## Fora de escopo

- Criar um motor de compatibilidade único (`evaluate`) (#29).
- Derivar o oracle da matrix do catálogo (#30).
- Gerar templates diretamente por capabilities (#31).
- Unificar Create Path e Add Path (#32).
- Alterar rejeições ou mensagens de produto da CLI sem necessidade do novo modelo.

## Aceite

- [ ] O builder persiste e compartilha o mesmo modelo canônico de escolhas da CLI.
- [ ] `self-*` não aparece em estado persistido, URL nova ou comando reproduzível.
- [ ] `TECH_OPTIONS` não mantém uma enumeração paralela de IDs e expõe `nestjs` com as regras da CLI.
- [ ] O comando é serializado diretamente a partir da configuração normalizada.
- [ ] Estados legados continuam carregáveis por uma migração explícita na borda.
- [ ] Os testes cobrem paridade de catálogo, schema, round-trip, migração, comando e compatibilidade.
- [ ] A área alterada fica sem listas duplicadas e casts usados apenas para mascarar o modelo divergente.
