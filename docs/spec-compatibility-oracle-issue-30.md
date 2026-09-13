# Spec: Compatibility Oracle derivado do catálogo — Issue #30

## Status

Implementada na branch `catalog/issue-30-compatibility-oracle`; a issue do GitHub permanece aberta
para revisão/encerramento humano. Issue:
[\#30](https://github.com/albuquerquesz/kubo/issues/30). Parent:
[\#26](https://github.com/albuquerquesz/kubo/issues/26). Depende de [\#27](https://github.com/albuquerquesz/kubo/issues/27)
e [\#29](https://github.com/albuquerquesz/kubo/issues/29).

Esta spec mantém o Oracle como código de teste, mas remove a terceira implementação das regras de
compatibilidade. A matriz deve derivar categorias do catálogo canônico e observar o resultado da
geração por códigos estruturados, nunca por cópia de listas de produção ou parsing de mensagens.

## Diagnóstico: o problema é válido

`apps/cli/test/matrix/oracle.ts` atualmente redefine listas como frontends web/fullstack, frontends
incompatíveis com Convex e Better Auth, além de reproduzir regras de banco, backend, runtime,
deploy, exemplos e pagamentos. A produção já possui essas relações em `@kubojs/types` e o CLI as
consome por `evaluate(config)`.

Isso cria drift silencioso: adicionar ou alterar uma capability exige lembrar de atualizar o
catálogo, o validador e o Oracle. A matrix pode então declarar uma configuração válida ou inválida
incorretamente, mascarando regressões na geração.

O classificador atual também usa substrings de mensagens da CLI para recuperar a categoria da
falha. Isso torna a cobertura dependente de copy de usuário, embora a ADR determine que a matrix
deve validar regra/categoria e que mensagens sejam cobertas por testes focados.

## Objetivo

Fazer o Oracle consumir o contrato canônico sem torná-lo um alias opaco do validador da CLI:

```ts
type MatrixRule = CompatibilityIssueCode;

evaluateMatrixConfig(config: ProjectConfig): {
  valid: boolean;
  rules: readonly MatrixRule[];
};
```

O Oracle continuará sendo a camada que traduz issues do catálogo para expectativas da matrix e
preserva a ordenação/deduplicação necessária ao teste. Ele não deve redefinir listas de catálogo ou
reimplementar predicados de compatibilidade.

Falhas de geração devem carregar o `CompatibilityIssueCode` como metadado estruturado até o teste.
O texto continuará igual para usuários e seguirá coberto pelos testes específicos da CLI.

## Política do bom escoteiro

Ao tocar o caminho de validação e da matrix:

- substituir parsing de mensagens por códigos tipados, sem alterar o texto público;
- eliminar constantes e predicados duplicados no arquivo tocado;
- manter o Oracle pequeno, declarativo e separado da orquestração da matrix;
- adicionar testes para o contrato código → categoria e para a ausência de drift;
- preservar a execução rápida da suíte default/smoke e o modo full opt-in;
- não corrigir avisos ou arquivos não relacionados.

## Etapas

### Etapa 1 — congelar diagnóstico e baseline ✅

Registrar o problema, o contrato atual da matrix e os testes relevantes. Executar a suíte focada
antes da migração para preservar comportamento e detectar mudanças de classificação.

Entrega: `4c2404a8`.

### Etapa 2 — derivar expectativas do catálogo ✅

Fazer `evaluateMatrixConfig` adaptar `ProjectConfig` para `evaluate()` e retornar os códigos
canônicos. Remover listas locais e todas as regras duplicadas do Oracle. Cada `MatrixRule` deve ser
um código/capability existente no catálogo.

Entrega: `c2b6287a`.

### Etapa 3 — transportar códigos estruturados ✅

Adicionar código opcional aos erros de validação/geração sem mudar mensagens. Fazer a matrix
inspecionar o código estruturado, removendo `classifyMatrixError` e o acoplamento a copy.

Entrega: `c2b6287a`.

### Etapa 4 — provar cobertura e performance ✅

Manter testes focados das mensagens, executar default, smoke e uma amostra/full matrix conforme a
ADR. Adicionar teste que verifica que cada expectativa retornada pelo Oracle corresponde a um
`CompatibilityIssueCode` do catálogo.

Resultados: default `591 pass`, smoke `282 pass` e full shard `523 pass`.

### Etapa 5 — revisão arquitetural final ✅

Reexecutar a revisão thermo-nuclear: sem duplicação de catálogo, sem condicionais espalhadas,
sem arquivo monolítico e sem regressão de tipos. Atualizar esta spec com os commits e deixar a
issue do GitHub aberta até revisão humana.

Resultado: Oracle reduzido de 502 para 56 linhas, sem listas locais ou parsing de mensagens; os
avisos existentes do repositório permanecem fora do escopo.

## Fora de escopo

- alterar a política de cobertura da ADR ou tornar a full matrix obrigatória;
- cobrir addons, MCP ou filesystem pelo mesmo produto cartesiano;
- alterar mensagens de usuário;
- transformar o Oracle em uma chamada direta ao validador da CLI sem contrato intermediário.

## Aceite

- [x] Listas de frontends/backends incompatíveis não são redefinidas no Oracle.
- [x] Cada `MatrixRule` mapeia para um `CompatibilityIssueCode` ou capability do catálogo.
- [x] Adicionar uma capability no catálogo não exige um PR paralelo de constantes do Oracle.
- [x] Default Suite, Matrix Smoke e Full Matrix continuam funcionando nos modos previstos pela ADR.
- [x] A matrix não depende de mensagens de erro para classificar falhas.
- [x] Mensagens continuam cobertas por testes de validação focados.
- [x] A branch passa typecheck, lint, testes relevantes e revisão thermo-nuclear.
