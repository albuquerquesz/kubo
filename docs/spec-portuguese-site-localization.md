# Spec: Localização completa do site para português

## Status

Pronta para implementação

## Data

23 de julho de 2026

## Objetivo

Disponibilizar o site público do Kubo em português brasileiro, traduzindo todos os textos visíveis, o título do site e os metadados usados por mecanismos de busca e compartilhamento social. A marca `Kubo`, nomes próprios, nomes de tecnologias, comandos, URLs, nomes de arquivos e identificadores de código permanecem inalterados.

## Contexto e evidências

| Área                      | Fonte atual                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Metadados globais         | `apps/web/src/app/layout.tsx` exporta `metadata`, `openGraph`, `twitter` e `lang="en"`                                                          |
| Navegação da documentação | `apps/web/src/app/layout.config.tsx` contém `Docs`, `Builder`, `Analytics`, `Showcase`, `Sponsors` e `Demo`                                     |
| Página inicial            | `apps/web/src/app/(home)/` contém hero, CTA, depoimentos, patrocinadores, rodapé e componentes de interação                                     |
| Documentação              | `apps/web/content/docs/**/*.mdx` contém títulos, descrições, corpo, exemplos e navegação                                                        |
| SEO adicional             | `apps/web/src/app/manifest.ts`, `sitemap.ts`, `not-found.tsx` e `apps/web/src/app/llms-full.txt/route.ts` geram superfícies públicas indexáveis |

## Escopo

### Incluído

- Textos visíveis da home, Builder, Analytics, Showcase, Sponsors e páginas de erro.
- Rótulos de navegação, botões, tooltips, estados de carregamento, mensagens vazias, mensagens de erro e atributos acessíveis (`aria-label`, `alt`, `title`).
- Títulos e descrições do frontmatter da documentação, além do conteúdo textual dos arquivos MDX.
- `lang="pt-BR"`, título padrão do site, descrição, palavras-chave, Open Graph, Twitter Cards, canonical e manifesto.
- Texto emitido por endpoints públicos de SEO/LLM quando for texto editorial do produto.
- Verificação de codificação UTF-8 e renderização correta de `á`, `ã`, `ç`, `é`, `ê`, `í`, `ó`, `ô`, `õ` e `ú`.

### Fora do escopo

- Tradução de comandos de terminal, código, nomes de frameworks, bibliotecas, propriedades, variáveis, rotas, URLs, domínios, nomes de pacotes e nomes de arquivos.
- Alteração da identidade visual, layout, animações, fontes ou idioma de conteúdo fornecido por serviços externos.
- Internacionalização dinâmica com seletor de idioma. Esta entrega define português como idioma único do site.
- Tradução automática de nomes de patrocinadores, depoimentos, handles ou texto fornecido pelo usuário.

## Diretrizes de tradução

- Usar português brasileiro natural, direto e consistente; evitar tradução literal de jargão técnico.
- Manter `Kubo` e `kubojs` exatamente nessa capitalização.
- Preferir “criar”, “configurar”, “gerar”, “documentação”, “análise”, “exibição” e “patrocinadores” quando aplicável.
- Preservar termos técnicos amplamente usados em inglês quando a tradução reduzir clareza, por exemplo `TypeScript`, `runtime`, `API`, `CLI`, `frontend`, `backend`, `monorepo`, `stack`, `build` e `deploy`.
- Traduzir o texto ao redor de comandos sem modificar o comando. Exemplo: escrever “Crie seu projeto com” seguido do comando `bun create kubojs@latest`.
- Usar capitalização de frase em títulos e botões, salvo nomes próprios e marcas.
- Não introduzir entidades HTML para acentos em arquivos UTF-8; usar os caracteres Unicode diretamente nos arquivos-fonte.

## Metadados e SEO

Atualizar `apps/web/src/app/layout.tsx`:

| Campo                             | Critério                                                                 |
| --------------------------------- | ------------------------------------------------------------------------ |
| `lang`                            | `pt-BR` no elemento `<html>`                                             |
| `title`                           | Título curto em português que mantenha a marca Kubo                      |
| `description`                     | Descrição em português, clara e orientada a scaffolding TypeScript       |
| `keywords`                        | Palavras-chave em português e termos técnicos relevantes, sem duplicatas |
| `openGraph.title` / `description` | Iguais ou semanticamente alinhados aos metadados principais              |
| `openGraph.locale`                | `pt_BR`                                                                  |
| `openGraph.siteName`              | `Kubo` ou `kubojs`, conforme a convenção escolhida para o título         |
| `openGraph.images[].alt`          | Texto alternativo em português                                           |
| `twitter.title` / `description`   | Versões em português                                                     |
| `category`                        | Categoria em português apenas se isso não prejudicar a classificação     |

Revisar também:

- `apps/web/src/app/manifest.ts`: `name`, `short_name`, `description` e rótulos exibidos pelo PWA.
- `apps/web/src/app/layout.config.tsx`: todos os textos de navegação e `alt`/`label` editoriais.
- `apps/web/src/app/not-found.tsx`: título, mensagem e ações.
- `apps/web/src/app/sitemap.ts`: manter apenas URLs válidas; não traduzir slugs existentes.
- `apps/web/src/app/llms-full.txt/route.ts`: refletir a descrição e o posicionamento em português.

## Arquitetura recomendada

Para esta primeira entrega, manter os textos próximos dos componentes existentes e centralizar apenas os textos compartilhados ou de SEO. Não criar um sistema de tradução, dicionários por idioma ou rotas `/pt-BR` sem uma decisão posterior de suportar mais idiomas.

Se a implementação identificar textos duplicados entre páginas, extrair constantes tipadas em `apps/web/src/lib/` com nomes em inglês para o código e valores em português. Não duplicar traduções em componentes diferentes.

## Critérios de aceite

- [ ] Nenhum texto editorial em inglês permanece nas superfícies públicas do site, exceto termos técnicos, marcas, nomes próprios e código explicitamente excluídos.
- [ ] O `<html>` usa `lang="pt-BR"`.
- [ ] O título exibido na aba do navegador e a descrição padrão estão em português.
- [ ] Open Graph e Twitter Cards estão em português e usam `pt_BR` no locale do Open Graph.
- [ ] A navegação, botões, tooltips, estados vazios, erros, `aria-label` e textos alternativos estão traduzidos.
- [ ] Os títulos e descrições da documentação estão em português; comandos e identificadores dos exemplos continuam válidos.
- [ ] O manifesto e a saída pública de LLM refletem o idioma português.
- [ ] Uma busca case-insensitive por textos editoriais ingleses conhecidos não encontra resíduos fora das exclusões documentadas.
- [ ] Todos os arquivos alterados são UTF-8 válido e preservam acentos e `ç` sem mojibake (`Ã`, `Â`, `�`).
- [ ] A aplicação compila, passa pelo formatter/linter e não apresenta erro de hidratação causado por texto ou locale.

## Verificação

Executar após a implementação:

```bash
bun run check
bun run build:web
```

Validar manualmente no navegador:

1. Abrir `/`, `/new`, `/analytics`, `/showcase`, `/sponsors`, `/docs` e uma página inexistente.
2. Conferir título da aba, menu, conteúdo, tooltips, estados de erro e acessibilidade.
3. Inspecionar o HTML para confirmar `lang="pt-BR"`, `og:locale`, título, descrição, canonical e Twitter Card.
4. Compartilhar ou pré-visualizar uma URL para confirmar que título, descrição e `alt` não exibem caracteres corrompidos.
