# Spec: Avaliador canônico de compatibilidade (#29)

## Status

Implementada na branch `catalog/issue-29-canonical-evaluate`; a issue do GitHub permanece aberta
para revisão/encerramento. Issue: [#29](https://github.com/albuquerquesz/kubo/issues/29). Parent:
[#26](https://github.com/albuquerquesz/kubo/issues/26). Depende de [#27](https://github.com/albuquerquesz/kubo/issues/27)
e [#28](https://github.com/albuquerquesz/kubo/issues/28).

Esta spec divide a issue em etapas independentes. A issue não deve ser considerada concluída
quando a primeira etapa terminar; cada etapa entrega uma redução verificável de duplicação e
mantém o comportamento público estável.

## Data

2026-09-13

## Diagnóstico: o problema é válido

A compatibilidade hoje é implementada em mais de uma superfície, com regras parcialmente
iguais e políticas diferentes:

| Superfície          | Arquivo                                            | Evidência                          | Consequência                                                                       |
| ------------------- | -------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| Regras da CLI       | `apps/cli/src/utils/compatibility-rules.ts`        | 751 linhas                         | concentra relações entre backend, frontend, runtime, banco, addons e deploy        |
| Orquestração da CLI | `apps/cli/src/utils/config-validation.ts`          | 667 linhas                         | chama regras independentes, diferencia flags explícitas e retorna a primeira falha |
| Stack Builder       | `apps/web/src/app/(home)/new/_components/utils.ts` | 1.365 linhas                       | reimplementa bloqueios e autoajustes em português para a UI                        |
| Deploy de servidor  | `compatibility-rules.ts`                           | quatro validadores quase idênticos | Docker, Vercel, Railway e Guara Cloud repetem o mesmo grafo de backend/runtime     |

O Builder pode permitir uma configuração que a CLI rejeita, ou aplicar um ajuste diferente do
que a CLI aceitaria. Esse risco não é apenas de manutenção: ele afeta a reprodutibilidade do
comando gerado e a confiança no Stack Builder.

O trabalho de [#27](./spec-catalog-capabilities-issue-27.md) já centralizou algumas capacidades
de backend, communication e payments. A existência dessas capacidades reduz parte da
duplicação, mas não elimina as relações entre campos nem a duplicação CLI/Builder. A issue #29
continua válida.

## Política do Bom Escoteiro

Toda etapa deve deixar a área tocada mais simples, coerente e fácil de verificar, sem ampliar o
escopo para uma reescrita geral.

Regras operacionais:

1. Fazer a menor mudança arquitetural que reduza duplicação real e preserve o comportamento
   público.
2. Remover apenas duplicações e ruído de alta confiança encontrados na área tocada; não fazer
   limpeza oportunista em arquivos não relacionados.
3. Antes de migrar uma segunda superfície, congelar o contrato da primeira com testes focados.
4. Separar regra de domínio, política do consumidor e copy:
   - `@kubojs/types` decide compatibilidade e retorna códigos estruturados;
   - a CLI decide quando rejeitar uma configuração e traduz códigos em mensagens atuais;
   - o Builder decide quando desabilitar uma opção ou aplicar autoajuste e traduz códigos em
     mensagens de UI.
5. Não colocar mensagens localizadas, prompts, efeitos de filesystem ou dependências de CLI/web
   no motor compartilhado.
6. Não mudar rejeições, ajustes, ordem de prompts ou mensagens de produto sem um teste que
   demonstre a decisão e uma justificativa explícita.
7. Cada etapa deve ser revertível e terminar com testes direcionados; o commit deve explicar
   qual duplicação ou risco foi reduzido.

Essa política é parte do aceite: uma redução de linhas sem clareza de fronteiras, testes ou
preservação de comportamento não conta como progresso arquitetural.

## Objetivo final

Oferecer uma avaliação pura e determinística da mesma **Project Configuration** para CLI e Stack
Builder:

```ts
type CompatibilityIssue = {
  code: string;
  fields: readonly string[];
  values?: readonly string[];
};

type CompatibilityEvaluation = {
  valid: boolean;
  issues: readonly CompatibilityIssue[];
};

evaluate(config: Partial<ProjectConfigDraft>): CompatibilityEvaluation;
```

O contrato final deve retornar todas as issues relevantes em ordem determinística, sem conhecer
copy ou política de interação. Os códigos devem ser estáveis e testáveis; mensagens continuam
nas superfícies consumidoras.

`disabled` não será um estado independente do domínio. Para descobrir se uma opção está
disponível, o Builder avaliará uma configuração candidata ou usará uma projeção tipada das
issues. Isso evita que o motor compartilhado precise conhecer categorias e componentes da UI.

Autoajuste também não será misturado com validade: a avaliação identifica a incompatibilidade;
uma operação separada e determinística poderá propor/aplicar ajustes no Builder. A CLI seguirá
rejeitando combinações inválidas, especialmente quando uma flag foi fornecida explicitamente.

## Etapas

### Etapa 1 — reduzir duplicação local de deploy (hoje)

Extrair os quatro validadores de deploy de servidor da CLI para um dispatcher comum orientado
por capability/provider. O dispatcher deve cobrir Docker, Vercel, Railway e Guara Cloud usando a
mesma regra para:

- backend separado obrigatório;
- incompatibilidade com runtime Workers;
- provider usado apenas como dado para a mensagem atual.

Critérios:

- [x] manter as assinaturas públicas ou criar um adaptador compatível para os consumidores atuais;
- [x] manter exatamente as rejeições e mensagens existentes;
- [x] adicionar testes parametrizados para os quatro providers e seus casos válidos;
- [x] não migrar ainda o Builder nem introduzir o `evaluate` final;
- [x] deixar o arquivo menor ou, no mínimo, remover a duplicação estrutural identificada.

Entrega: um commit isolado de refactor, fácil de revisar e reverter.

### Etapa 2 — congelar o contrato do motor ✅

Criar em `@kubojs/types` os tipos de issue e uma primeira `evaluate(config)` pura, começando pelas
relações já duplicadas e estáveis:

- backend e runtime;
- backend e frontend;
- database e ORM;
- database setup;
- API e backend/frontend;
- deploy web/servidor.

Testar códigos e campos afetados, não mensagens. A função avalia uma configuração completa e
aceita campos parciais apenas nos validadores da CLI, onde campos ainda não respondidos não podem
ser tratados como violações. Entrega: `f1de47d0`.

### Etapa 3 — adaptar a CLI ✅

Fazer `config-validation.ts` consumir o motor, mantendo no adaptador:

- distinção entre flags explícitas e valores resolvidos;
- ordem e comportamento dos prompts;
- conversão de issue em `ValidationError` com as mensagens atuais.

As regras específicas de scaffolding que não forem compatibilidade de configuração permanecem
fora do motor. Entrega: `b9906423`.

### Etapa 4 — adaptar o Stack Builder ✅

Fazer `analyzeStackCompatibility` e `getDisabledReason` consumirem o mesmo motor. A camada web
continua responsável por:

- nomes, categorias, ordem e copy em português;
- política de autoajuste;
- estado de apresentação;
- regras exclusivamente visuais.

O resultado de um autoajuste deve passar por `ProjectConfigSchema` e ser aceito pelo adaptador
da CLI.

Entrega: `5cc23034`.

### Etapa 5 — remover duplicações e fechar a issue ✅

Após CLI e Builder estarem cobertos pelo contrato compartilhado:

- remover regras locais substituídas;
- decompor `utils.ts` caso ainda exceda 1.000 linhas por responsabilidade de domínio;
- adicionar contrato cruzado CLI ↔ Builder;
- registrar qualquer diferença intencional entre rejeição da CLI e autoajuste do Builder;
- atualizar esta spec com os commits e marcar os critérios concluídos. A issue permanece aberta
  para o encerramento humano, como combinado.

Resultado: o motor retorna fatos/códigos; a CLI rejeita e mantém suas mensagens; o Builder avalia
uma configuração candidata e normaliza autoajustes em uma operação separada. `utils.ts` foi
reduzido para apresentação e reexports, e o adapter web ficou em módulo próprio.

## Fora de escopo

- Oracle da matrix ([#30](https://github.com/albuquerquesz/kubo/issues/30)).
- Templates e geração baseada em capabilities.
- Unificação do Create Path e Add Path ([#32](https://github.com/albuquerquesz/kubo/issues/32)).
- Alteração de mensagens de produto ou UX sem necessidade técnica.
- Reescrita completa de `compatibility-rules.ts`, `config-validation.ts` ou `utils.ts` em uma
  única etapa.

## Testes e validação

Cada etapa deve seguir a estratégia de testes em
[`docs/adr/0001-use-tiered-matrix-testing-for-cli-stack-coverage.md`](./adr/0001-use-tiered-matrix-testing-for-cli-stack-coverage.md):

- Etapa 1: testes focados dos quatro deploys e validações atuais da CLI.
- Etapa 2: testes unitários do contrato de issues e invariantes de determinismo.
- Etapa 3: testes de mensagens de produto e paridade com as rejeições existentes.
- Etapa 4: testes de autoajuste, opções desabilitadas e contrato cruzado.
- Etapa 5: `bun run check`, testes focados e a suíte apropriada do Default Suite.

Nenhuma etapa deve exigir a Full Matrix Job para provar uma simples extração. A Matrix Smoke e
a Full Matrix Job continuam sendo mecanismos de confiança ampla, não substitutos para testes
focados da regra alterada.

## Aceite final da issue

- [x] Existe uma `evaluate(config)` pura e canônica.
- [x] CLI e Builder não duplicam as regras de compatibilidade cobertas pelo motor.
- [x] Os quatro deploy validators usam dispatcher comum, sem clones por provider.
- [x] O autoajuste do Builder produz uma `ProjectConfig` aceita pela CLI.
- [x] `utils.ts` fica apenas com apresentação/política do Builder ou é fatiado abaixo de 1.000
      linhas sem perder clareza.
- [x] O comportamento público permanece estável, salvo decisões documentadas.
- [x] Cada etapa tem testes focados e commits isolados.
