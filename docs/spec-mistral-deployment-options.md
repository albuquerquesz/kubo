# Spec: opções de deployment com gramática Mistral

## Status

Pronto para implementação.

## Fonte e objetivo

Esta spec documenta a seção **AI deployments designed for privacy.** da home
do Mistral. A página foi inspecionada com Playwright em 23 de julho de 2026.
O objetivo é reproduzir a hierarquia, o ritmo e a responsividade da seção no
Kubo; cores, tokens, assets, rotas e branding devem continuar sendo do Kubo.

Fonte estrutural: [mistral.ai](https://mistral.ai/).

## Conteúdo de referência

Eyebrow:

> AI deployments designed for privacy.

Headline:

> Deploy frontier AI in your environment, or consume as a service or from one of our cloud partners.

Cards:

1. **Self-hosted.** Deploy Studio on virtual cloud, edge, or on-premises.
   Self-hosted deployments offer more advanced levels of customization and
   control. Your data stays within your walls.
2. **Mistral cloud.** Get started with Studio hosted on Mistral’s
   infrastructure and build your own applications and services with our APIs.
   Our servers are hosted in the EU.
3. **Cloud providers.** Access the power of Studio via your preferred cloud
   provider (Google Cloud, AWS, Azure, SAP, IBM, Snowflake, NVIDIA, Outscale)
   using your cloud credits.

Na implementação final, substituir nomes, copy e links por conteúdo aprovado
para o produto Kubo quando necessário.

## Estrutura semântica

```tsx
<section aria-labelledby="deployment-title">
  <div className="deployment-intro">
    <p className="eyebrow">AI deployments designed for privacy.</p>

    <div className="deployment-icons" aria-hidden="true">
      <IconCodeWindow />
      <IconLightbulb />
      <IconMountain />
    </div>

    <h2 id="deployment-title">Deploy frontier AI...</h2>
  </div>

  <div className="deployment-grid">
    <article className="deployment-card">...</article>
    <article className="deployment-card">...</article>
    <article className="deployment-card">...</article>
  </div>
</section>
```

Os ícones são decorativos. Os cards não devem ser links ou botões sem uma ação
de produto definida.

## Contrato visual desktop

- Seção full-bleed com fundo escuro, sem border-radius e sem sombra.
- Fundo de referência: `rgb(21, 21, 36)` (`#151524`). Usar o token de
  superfície escura do Kubo.
- Texto principal: `#fbfbf8`.
- Divisores: aproximadamente `#31313a`, com 1px.
- Área de introdução com `padding-top: 160px`.
- Eyebrow centralizado, em mono uppercase, 13px/20px.
- Linha de três ícones pixel-art de 56×56px, com gap de 16px e margem
  superior de 40px.
- Headline centralizado, com largura máxima de 1024px, fonte display de
  56px/60px e tracking aproximado de `-0.56px`. O espaçamento entre ícones e
  headline é de 40px.
- A grade de cards tem largura máxima aproximada de 1728px e fica centralizada.
  Em viewport de 1892px, isso produz rails laterais de aproximadamente 82px.
- Três colunas de mesma largura, separadas por linhas verticais de 1px.
- Card desktop: padding de 40px, altura mínima aproximada de 364px e layout
  flexível com conteúdo superior e descrição ancorada na parte inferior.
- Ícone do card: SVG de aproximadamente 20×20px.
- Grupo ícone/título com gap de 24px.
- Título do card: fonte display, 32px/40px.
- Descrição do card: 16px/24px.

## Contrato visual mobile

Breakpoint recomendado: `< 768px`.

- Padding lateral da seção: 16px.
- Introdução com padding superior de 40px.
- Eyebrow em 12px/16px.
- Ícones mantêm caixas de 56×56px.
- Espaçamento vertical entre eyebrow, ícones e headline: 24px.
- Headline em 28px/40px, centralizado e ocupando a largura disponível.
- Cards empilhados em uma coluna.
- Padding dos cards: 24px.
- Título do card: 20px/24px.
- Gap entre título e descrição: 16px.
- Preservar bordas horizontais e laterais.
- Não permitir overflow horizontal.

## Regras de implementação

- Manter o conteúdo estrutural em fluxo normal; não usar `position: absolute`
  para posicionar headline, cards ou descrições.
- Reutilizar tokens de cor, tipografia e borda do Kubo em vez de hard-code de
  valores de marca Mistral.
- Usar SVGs locais ou componentes de ícone do Kubo; não hotlinkar os assets do
  Mistral.
- Respeitar `prefers-reduced-motion`; a seção deve permanecer completa e
  utilizável sem animações.
- Garantir foco visível caso qualquer card seja transformado em link no futuro.
- Usar `h2` para o título da seção e `h3` para os títulos dos cards.

## Critérios de aceite

- Em desktop, a hierarquia visual é: eyebrow → ícones → headline → três
  cards.
- Em viewport de aproximadamente 1892×937px, a composição mantém as quebras
  de linha e o espaçamento visual da referência.
- Em 390×844px, headline e cards permanecem dentro da viewport sem overflow.
- Os três cards aparecem em sequência vertical no mobile.
- As linhas divisórias têm baixo contraste e não competem com o texto.
- O contraste e a semântica são adequados para leitura e navegação por teclado.

## Verificação Playwright

1. Abrir a rota local em 1440×900 e 1892×937.
2. Confirmar intro com padding superior de 160px, headline de 1024px e grade
   de três colunas.
3. Abrir em 390×844 e confirmar padding lateral de 16px, cards empilhados e
   `document.documentElement.scrollWidth <= viewportWidth`.
4. Verificar ausência de sobreposição entre headline, ícones e cards.
5. Repetir com `prefers-reduced-motion: reduce`.
