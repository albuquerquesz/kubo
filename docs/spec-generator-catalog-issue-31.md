# Spec: Geração por catálogo para integrações — Issue #31

## Status

Em implementação na branch `catalog/issue-31-generator-catalog`. A issue do GitHub permanece
aberta para revisão humana. Issue: [#31](https://github.com/albuquerquesz/kubo/issues/31). Parent:
[#26](https://github.com/albuquerquesz/kubo/issues/26). Depende de [#27](https://github.com/albuquerquesz/kubo/issues/27).

## Diagnóstico: o problema é válido

O gerador ainda orquestra integrações por condicionais específicas de provider. Em
`template-handlers/communication.ts`, Resend, Notifique e Arara repetem blocos de
`processSingleTemplate`; adicionar um provider exige editar o handler e criar outra ramificação.

`processors/observability.ts` tem 478 linhas e combina dependências, geração de helpers e patches
de código já gerado. Esses patches procuram `<Outlet />`, `<body>`, `Providers`, exports de
configuração e chamadas `listen` com regex/string replacement. Um template novo pode mudar o
formato sem falhar de forma explícita, produzindo um scaffold sem a integração ou parcialmente
instrumentado. Himetrica necessariamente copiaria esse processor.

`processors/readme-generator.ts` tem 1342 linhas e incorpora setup e lista de features de cada
provider no mesmo módulo. A extensão cresce o orquestrador e aumenta a superfície de regressão.

O problema não é apenas tamanho: catálogo, templates e pós-processadores possuem responsabilidades
misturadas. A geração deve declarar artefatos e pontos de montagem como dados, deixando o template
ser a fonte do código estrutural.

## Objetivo

Fazer as integrações selecionadas serem aplicadas por catálogos declarativos:

```ts
for (const integration of selectedIntegrations(config)) {
  for (const artifact of integration.artifacts) {
    if (artifact.when(config)) applyTemplate(artifact);
  }
}
```

O catálogo deve definir os templates, destinos e dependências de cada provider. Montagens de
observabilidade em layout, router, config e server devem estar nos `.hbs`; processors não devem
reescrever código-fonte gerado por regex. O README deve concentrar extensões em um catálogo/módulo
de integrações, mantendo o gerador principal pequeno.

## Política do bom escoteiro

Ao tocar o caminho de geração:

- remover a duplicação de condicionais encontrada no arquivo alterado, sem reescrever áreas não
  relacionadas;
- preferir catálogos tipados e predicados nomeados a cadeias de `if` e assertions;
- manter templates responsáveis por sua própria estrutura e tornar destinos ausentes explícitos;
- preservar os nomes públicos, variáveis de ambiente, dependências e o output atual dos stacks;
- adicionar testes de contrato para cada provider e para o caso combinado;
- manter arquivos de produção focados, sem deixar novos módulos monolíticos;
- não alterar a política da Virtual Generation nem misturar a unificação dos builders.

## Etapas

### Etapa 1 — especificar e congelar baseline

Registrar o diagnóstico, os pontos de montagem atuais e os testes existentes antes da migração.
Entrega: esta spec.

### Etapa 2 — catalogar comunicação

Substituir as três ramificações do handler por uma tabela de artefatos e predicados. O caso
específico de Arara no backend Convex deve permanecer uma declaração de artefato, não uma nova
ramificação do handler.

### Etapa 3 — mover observabilidade para templates

Gerar helpers por templates e declarar suas montagens em Next, Nuxt, routers, entradas Vite e
servidores. Reduzir `processors/observability.ts` à responsabilidade de dependências/metadata;
ele não pode usar `String.replace` ou regex para patch de fonte.

### Etapa 4 — isolar extensões do README

Extrair setup e features de integrações para módulo/catalogo próprio. O orquestrador do README deve
permanecer abaixo de 1000 linhas e não crescer com cada novo provider.

### Etapa 5 — provar equivalência e revisar

Executar testes focados, smoke/default da CLI, build/typecheck e a revisão thermo-nuclear. Registrar
os resultados e os limites conhecidos nesta spec; a issue continua aberta até revisão humana.

## Fora de escopo

- unificar os builders de frontend/backend;
- alterar contratos públicos de configuração ou mensagens de erro;
- adicionar novos providers;
- modificar integrações não relacionadas ao catálogo;
- corrigir avisos preexistentes fora dos arquivos tocados.

## Aceite

- [ ] Adicionar provider de comunicação exige apenas entrada de catálogo e templates.
- [ ] O handler de comunicação não possui uma ramificação por provider.
- [ ] `processors/observability.ts` não patcha fonte gerada por regex/string replacement.
- [ ] GetMonitor e Himetrica são montados pelos templates nos targets suportados.
- [ ] Os outputs atuais de comunicação e observabilidade permanecem equivalentes.
- [ ] O README mantém setup/features de integração isolado e o gerador principal fica abaixo de 1000
      linhas.
- [ ] Há testes para providers individuais, combinação de providers e geração sem integração.
- [ ] A suíte relevante, build e revisão thermo-nuclear passam sem regressões.
