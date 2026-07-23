# Spec: Home Hero com Ethereal Beams

## Status

Proposta

## Data

23 de julho de 2026

## Contexto

O hero atual da home usa uma composição editorial em grid com duas colunas, pin desktop via GSAP, título com entrada mascarada, missão lateral, ícones revelados no scroll e o card de instalação. A implementação está em [`hero-section.tsx`](<../apps/web/src/app/(home)/_components/hero-section.tsx>), com partes reutilizáveis em [`hero-display-title.tsx`](<../apps/web/src/app/(home)/_components/hero-display-title.tsx>), [`hero-rail-lower.tsx`](<../apps/web/src/app/(home)/_components/hero-rail-lower.tsx>), [`hero-install-card.tsx`](<../apps/web/src/app/(home)/_components/hero-install-card.tsx>) e [`scroll-reveal-icons.tsx`](<../apps/web/src/app/(home)/_components/scroll-reveal-icons.tsx>).

Esta spec adapta a gramática visual do hero de referência `Ethereal Beams`: fundo 3D de feixes de luz, conteúdo centralizado, contraste por camadas e tratamento translúcido dos controles. A adaptação deve manter a identidade e a informação do Kubo. O exemplo de referência não é fonte para copy, logo, links, estatísticas, palette ou navegação do produto.

## Objetivos

- Substituir a leitura inicial do grid/pin por um hero de palco único, alto e centralizado.
- Usar feixes 3D animados como visual de fundo, sem competir com a copy.
- Preservar integralmente copy, links, conversão, tokens de tema e marca do Kubo.
- Manter o comportamento responsivo e acessível da home nos breakpoints atuais.
- Preservar uma saída estática e legível quando WebGL ou motion não estiver disponível.

## Não objetivos

- Copiar o `Mysh UI`, a navegação, o badge `Trusted by industry leaders`, as estatísticas ou qualquer copy do exemplo.
- Reintroduzir uma navegação interna paralela ao [`SiteHeader`](../apps/web/src/components/site/site-header.tsx).
- Trocar a paleta quente do tema Kubo por preto/branco puro, gradiente branco ou roxo.
- Remover o instalador, o seletor de package manager ou o comando de criação.
- Alterar as seções posteriores da home, a API dos componentes ou os destinos dos links.
- Manter o pin de duas colunas apenas por compatibilidade visual; a interação deve ser simplificada se ela não servir ao novo palco.

## Invariantes de conteúdo e marca

| Elemento      | Conteúdo obrigatório                                                                     | Regra                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| H1            | `Um comando. Todas as camadas.`                                                          | Continua sendo um único H1 semântico; as quebras visuais podem mudar.                                                             |
| Missão        | `Um app TypeScript full-stack` / `a partir de um comando` / `com cada camada tipada.`    | Preservar o texto e a ordem; pode virar subtítulo ou bloco de apoio central.                                                      |
| CTA principal | `Monte sua stack`                                                                        | Continua apontando para `/new`; deve ser o controle de maior contraste.                                                           |
| Instalador    | `Iniciar com`, seletor de `bun`/`pnpm`/`npm` e comando gerado                            | Preservar seleção, cópia e acessibilidade de [`HeroInstallCard`](<../apps/web/src/app/(home)/_components/hero-install-card.tsx>). |
| Navegação     | Links e labels atuais de [`SiteHeader`](../apps/web/src/components/site/site-header.tsx) | Não criar links genéricos `Home`, `Components`, `Templates` ou `Docs` no hero.                                                    |
| Marca         | Kubo e assets existentes                                                                 | Não usar logo ou ícones do exemplo.                                                                                               |

## Tokens visuais

O componente deve consumir tokens existentes, principalmente os definidos no tema Kubo em [`global.css`](../apps/web/src/app/global.css), em vez de valores de cor hardcoded do exemplo.

| Função               | Token atual de referência                                 |
| -------------------- | --------------------------------------------------------- |
| Canvas               | `--background` (`#11110d` no tema Kubo)                   |
| Texto principal      | `--foreground` (`#f2ede0`)                                |
| Ação primária        | `--primary` (`#c49314`)                                   |
| Hover/acento         | `--accent` (`#d6a72b`)                                    |
| Texto secundário     | `--muted-foreground`                                      |
| Regras e bordas      | `--rule` / `border-rule`                                  |
| Fundo de superfícies | `--card`, `--muted` e transparências derivadas dos tokens |

Os feixes devem usar uma variação clara e dessaturada dos tokens de texto ou um tom aprovado derivado do tema. O glow e o overlay devem ser contidos: o H1 e o CTA continuam sendo os pontos de maior contraste. Não usar `#000000` como substituto global de `--background` nem `white` como substituto global de `--foreground`.

## Composição proposta

### Camadas

1. **Canvas de fundo:** `Canvas` do `@react-three/fiber`, `aria-hidden`, cobrindo o palco inteiro.
2. **Véu de legibilidade:** overlay CSS com gradiente discreto baseado em `--background`; deve reduzir a luz atrás do texto sem apagar os feixes.
3. **Header existente:** o [`SiteHeader`](../apps/web/src/components/site/site-header.tsx) continua fixo, com seus links, menu mobile, sociais e CTA. Se receber tratamento translúcido, ele deve conservar as dimensões, os destinos e os estados de foco atuais.
4. **Conteúdo do hero:** H1 centralizado, missão abaixo, CTA `Monte sua stack` e card de instalação. A ordem visual deve ser H1 → missão → CTA/instalador.
5. **Controles auxiliares:** o indicador para rolar pode permanecer, mas não deve competir com o CTA. O destino continua sendo `#product`.

O hero deve continuar usando `id="top"` e a altura deve considerar o header fixo de `3rem` (`100svh - 3rem`), sem criar uma faixa vazia acima ou abaixo do palco.

### Tratamento translúcido

O efeito glassmorphism fica restrito a superfícies funcionais, como o wrapper do instalador e, se necessário, o header sobre o canvas. Usar `background` derivado de `--card`/`--background`, `backdrop-filter` com fallback opaco, `border-rule` e raio pequeno existente. Não aplicar blur ao H1, à missão ou ao canvas inteiro.

## Implementação técnica

### Beams

Extrair o algoritmo do exemplo para componentes locais do web app, preferencialmente em `apps/web/src/app/(home)/_components/` ou em um módulo visual compartilhado se houver reutilização real. O algoritmo pode manter:

- geometria de planos empilhados;
- ruído procedural no vertex shader;
- atualização de `time` por frame;
- material customizado com luz e fog controlados.

Restrições da integração:

- O componente deve ser client-only; nenhum acesso a `window`, WebGL ou `Canvas` pode ocorrer durante renderização no servidor.
- Usar a câmera nativa do R3F ou uma câmera local; não adicionar `@react-three/drei` apenas para `PerspectiveCamera` sem necessidade.
- Não ativar sombras ou pós-processamento para esse fundo.
- Dispor geometry/material no unmount ou usar hooks de ciclo de vida compatíveis para evitar vazamento ao navegar.
- Manter o canvas sem eventos de ponteiro (`pointer-events-none`) para que links e botões recebam interação normalmente.
- Limitar o DPR efetivo e a quantidade de feixes em telas estreitas; o valor `[1, 2]` do exemplo não é obrigatório.

Valores iniciais sugeridos, sujeitos a medição visual:

| Ambiente     |              Feixes | DPR máximo | Animação |
| ------------ | ------------------: | ---------: | -------- |
| `>= 1440px`  |               12–15 |      1.5–2 | Completa |
| `768–1439px` |                8–10 |        1.5 | Reduzida |
| `< 768px`    | 5–7 ou fallback CSS |          1 | Reduzida |

### Motion

O novo hero deve ter uma única gramática de movimento dominante: deriva lenta dos feixes. A entrada do H1 pode reutilizar [`HeroDisplayTitle`](<../apps/web/src/app/(home)/_components/hero-display-title.tsx>), mas não deve somar pin, scale/translate do host, saída de título e revelação de ícones se isso gerar competição visual.

Para `prefers-reduced-motion: reduce`:

- pausar o loop do canvas ou renderizar um frame estático;
- desativar entrada por caracteres, shimmer e indicador animado;
- manter H1, missão, CTA e instalador imediatamente visíveis;
- manter o indicador de rolagem funcional, sem animação.

A implementação pode remover o wiring de `playHeroStickyScale` e `playHeroScrollRevealIcons` do hero novo. Os módulos de motion continuam no repositório enquanto forem usados em outras superfícies; não removê-los como parte desta spec sem evidência de que ficaram sem consumidores.

## Responsividade

| Viewport     | Composição                                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1440px+`    | Palco de viewport completo, H1 em escala editorial, feixes ocupando o fundo com margem visual, instalador alinhado ao centro ou em uma faixa inferior curta.                      |
| `768–1439px` | Mesmo palco sem pin obrigatório; reduzir escala e densidade dos feixes, mantendo uma coluna de leitura e CTA sem overflow horizontal.                                             |
| `390px`      | Conteúdo empilhado, H1 com quebras controladas, missão em largura confortável, CTA e instalador com alvo mínimo de `44px`; reduzir fortemente o canvas ou usar fallback estático. |

O menu mobile continua sendo o diálogo acessível existente. O canvas não pode alterar foco, scroll, cálculo de largura ou a área clicável do menu.

## Acessibilidade e fallback

- Usar landmarks semânticos: `header` global, `main` e `section` do hero.
- Manter H1 real para leitores de tela; qualquer camada decorativa duplicada deve usar `aria-hidden`.
- O canvas e os feixes são decorativos e não recebem descrição verbal como se fossem conteúdo.
- Garantir contraste do H1, missão, CTA, seletor e comando contra o pior frame do fundo; o overlay deve ser ajustado com essa finalidade.
- Preservar `focus-visible` em todos os controles, sem depender de hover.
- Se WebGL falhar, desabilitar o canvas e manter uma superfície CSS com os tokens Kubo e, opcionalmente, uma textura/gradiente muito sutil. A copy e a conversão não podem depender do WebGL.
- Testar teclado, `prefers-reduced-motion`, zoom de 200% e largura de `390px`.

## Mapa de mudança

| Área           | Arquivo provável                                                                          | Mudança                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Orquestração   | [`hero-section.tsx`](<../apps/web/src/app/(home)/_components/hero-section.tsx>)           | Recompor o palco, manter copy/anchors, remover ou simplificar pin e wiring de motion incompatível.      |
| Canvas         | Novo componente em `apps/web/src/app/(home)/_components/`                                 | Implementar beams, câmera, material, fallback e parâmetros responsivos.                                 |
| Instalador     | [`hero-install-card.tsx`](<../apps/web/src/app/(home)/_components/hero-install-card.tsx>) | Apenas adaptar superfície/posicionamento; não alterar comportamento ou copy.                            |
| Header         | [`site-header.tsx`](../apps/web/src/components/site/site-header.tsx)                      | Só alterar tratamento visual se necessário para leitura sobre o canvas; links e comportamento intactos. |
| Tema           | [`global.css`](../apps/web/src/app/global.css)                                            | Preferir tokens atuais; adicionar CSS apenas para overlay/fallback se não houver token equivalente.     |
| Testes visuais | `docs/.playwright-cli/`                                                                   | Adicionar ou atualizar probes/capturas sem transformar imagens de referência em dependência de runtime. |

## Critérios de aceitação

- [ ] Em `1440 × 900`, o primeiro viewport apresenta feixes animados, H1 centralizado e CTA/instalador sem clipping.
- [ ] O texto `Um comando. Todas as camadas.` aparece uma única vez como H1 semântico.
- [ ] A missão permanece exatamente `Um app TypeScript full-stack a partir de um comando com cada camada tipada.` em leitura contínua.
- [ ] `Monte sua stack` continua levando a `/new`; o instalador continua trocando package manager e copiando o comando correto.
- [ ] Nenhum texto, label, estatística, logo, ícone ou link do exemplo `Ethereal Beams` aparece no produto.
- [ ] O visual usa tokens Kubo: fundo quente escuro, texto off-white, acento dourado e regras sutis; não há preto/branco puro como palette principal.
- [ ] Em `768px` e `390px`, não há overflow horizontal, clipping de copy ou controles menores que `44px`.
- [ ] Com WebGL indisponível, o hero continua legível e todos os controles continuam funcionais.
- [ ] Com reduced motion, o conteúdo inicia visível e o canvas fica estático ou é substituído pelo fallback.
- [ ] O header global não é duplicado e seu menu mobile continua com foco, Escape e restauração de foco funcionando.

## Verificação

Executar após a implementação:

```bash
bun run check
```

Com o web app em `:3333`, validar por Playwright pelo menos em `1440 × 900`, `768 × 1024` e `390 × 844`:

- screenshot do primeiro viewport;
- snapshot de acessibilidade e tab order;
- console sem erro de shader, hydration ou WebGL não tratado;
- teste com `prefers-reduced-motion: reduce`;
- teste com WebGL desabilitado ou fallback forçado;
- click em `Monte sua stack`, rolagem para `#product`, seleção de package manager e cópia do comando.

## Ordem de implementação

1. Isolar o componente de beams com parâmetros responsivos, fallback e `aria-hidden`.
2. Recompor `HeroSection` em torno do canvas, reaproveitando copy, CTA, instalador e anchor existentes.
3. Ajustar overlay, glass e contraste usando tokens Kubo, sem introduzir uma nova palette.
4. Remover/simplificar motion concorrente e implementar reduced motion.
5. Validar desktop, tablet, mobile, teclado, WebGL fallback e performance antes do polimento visual.

## Fora do escopo desta spec

- Redesign do header ou da arquitetura das seções seguintes.
- Nova copy de marketing, prova social ou estatísticas.
- Inclusão de imagens raster, logo externa ou asset proprietário.
- Migração geral do sistema GSAP/motion da home.
- Otimização de bundle além do que for necessário para o canvas do hero.
