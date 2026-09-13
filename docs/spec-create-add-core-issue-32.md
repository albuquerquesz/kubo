# Spec: Núcleo compartilhado entre Create Path e Add Path — Issue #32

## Status

Em implementação na branch `catalog/issue-32-create-add-core`. A issue do GitHub permanece
aberta para revisão humana. Issue: [#32](https://github.com/albuquerquesz/kubo/issues/32). Parent:
[#26](https://github.com/albuquerquesz/kubo/issues/26). Depende de
[#31](https://github.com/albuquerquesz/kubo/issues/31).

## Diagnóstico: o problema é válido

O Create Path (`createProject` → `generate`) parte de um VFS vazio e executa o pipeline completo de
handlers e processors. O Add Path (`add-handler`) reimplementa apenas uma parte desse pipeline:
carrega arquivos por três listas locais, chama handlers/processors selecionados e aplica exceções
para task runners, Vite+ e hooks.

Hoje o Add Path mantém 22 destinos manuais:

- 14 caminhos de `package.json`;
- 2 arquivos de texto (`apps/web/vite.config.ts` e `lefthook.yml`);
- 6 arquivos de ambiente.

Essas listas são uma segunda fonte de verdade. Um addon ou processor que precise ler um novo arquivo
existente pode funcionar no Create Path e falhar silenciosamente no Add Path até que o handler seja
editado. O MCP expõe as APIs `create` e `add`, portanto mantém a mesma divergência na superfície de
contrato.

O problema não exige que Add regenere o projeto inteiro: o input é diferente (projeto existente e
subset de addons) e a política de merge também é diferente. O que deve ser compartilhado é a
aplicação dos artefatos e processors do catálogo sobre um VFS; somente a carga inicial e a escrita
final permanecem específicas do Add Path.

## Objetivo

Fazer Create, Add e MCP aplicarem o mesmo núcleo de addons sobre `ProjectConfig` e `VirtualFileSystem`.
O Add Path deve descobrir e carregar arquivos de texto existentes sem listas de destinos no handler,
detectar alterações e escrever somente arquivos novos ou modificados. Arquivos binários, diretórios
gerados e `node_modules` não devem ser reescritos.

## Política do bom escoteiro

- remover as listas manuais no caminho tocado, sem antecipar o resolver de topologia da issue #10;
- preferir uma fronteira tipada para carregar arquivos existentes e uma política explícita de merge;
- manter templates/processors como fonte do comportamento de addons, evitando duplicar o pipeline no
  CLI;
- preservar o output do Create Path, a configuração JSONC, arquivos customizados e os contratos MCP;
- adicionar testes focados no Add Path e no caso equivalente Create → Add;
- não reescrever arquivos inalterados nem carregar binários como UTF-8;
- manter a mudança localizada, sem unificar builders ou alterar a matriz de compatibilidade.

## Etapas

### Etapa 1 — especificar e congelar baseline

Registrar a divergência entre `generate` e `add-handler`, os destinos manuais e os contratos MCP.
Entrega: esta spec.

### Etapa 2 — extrair o núcleo de aplicação de addons

Centralizar a sequência de templates, dependências e configurações de addons para que Create e Add
usem os mesmos processors e o mesmo catálogo.

### Etapa 3 — substituir mapas de paths por overlay seguro do VFS

Carregar arquivos de texto existentes com rastreamento de conteúdo original. Escrever apenas o delta
do VFS; excluir diretórios gerados, dependências e binários.

### Etapa 4 — provar equivalência e revisar

Cobrir addon individual, addon adicionado a projeto existente, combinação de addons, dry-run, MCP e
preservação de arquivo não relacionado. Executar a suíte relevante, typecheck, build e check.

## Fora de escopo

- implementar o resolver de caminhos da topologia (#10);
- regenerar o core stack ao executar `kubojs add`;
- alterar o contrato público de `create`, `add` ou das tools MCP;
- mudar política de merge de JSONC ou de addons exclusivos;
- adicionar addons novos ou alterar compatibilidade.

## Aceite

- [ ] Addon declarado no catálogo funciona em Create e Add sem um segundo registro de paths.
- [ ] Add Path usa o mesmo núcleo de aplicação de addons que Create Path.
- [ ] Add Path carrega arquivos existentes de forma segura e escreve somente alterações.
- [ ] `ADD_PACKAGE_JSON_PATHS`, `ADD_ENV_FILE_PATHS` e `ADD_TEXT_FILE_PATHS` deixam de ser fonte de
      verdade.
- [ ] A suíte focada cobre Add Path, dry-run e MCP sem entrar na Full Matrix Job.
- [ ] O MCP continua usando os mesmos núcleos de `create` e `add`.
- [ ] Suíte relevante, typecheck, build e check passam sem regressões.
