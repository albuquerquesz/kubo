# Spec: marquee de logos da home Kubo (gramática Mistral)

## Status

Pronto para implementação.

## Data e fonte

Medição feita em **21 de julho de 2026**, no Chromium via Playwright, em
[mistral.ai](https://mistral.ai/). A referência visual enviada pelo usuário é
uma captura de **1830 × 286 px**. Esta spec reproduz somente a geometria e a
interação: usar nomes, logos, paleta e conteúdo da Kubo.

## Objetivo

Criar uma faixa horizontal, full-bleed, de parceiros/clientes em cartões
quadrados monocromáticos. Ela fica logo depois do hero, com uma sucessão
contínua de cartões com grade de 1 px e arrasto horizontal.

Não reutilizar logos, arquivos de mídia, nomes de clientes, marca ou tokens
visuais da Mistral.

## Contrato de layout

### Estrutura

```text
section.logo-marquee (largura da viewport; overflow hidden)
└─ div.logo-marquee__viewport (altura da célula; cursor grab; touch pan-x)
   ├─ ol.logo-marquee__track (12 cartões Kubo; posição absoluta)
   ├─ ol.logo-marquee__track (mesma sequência; duplicata para loop)
   └─ ol.logo-marquee__track (mesma sequência; duplicata para loop)
      └─ li.logo-marquee__cell > img/logo Kubo
```

- O viewport e cada célula têm a mesma altura; não há padding externo nem
  separação vertical antes/depois da faixa.
- Cada trilho contém **12 cartões**. A referência mantém **três cópias
  idênticas** em posição absoluta para que o arrasto possa atravessar uma
  borda sem espaço vazio.
- Só a primeira cópia é exposta a leitores de tela. As cópias auxiliares têm
  `aria-hidden="true"`; se os logos forem decorativos, as imagens também usam
  `alt=""`.

### Medidas exatas

| Faixa de viewport | Breakpoint | Célula / altura da faixa | Passo entre células |  Limite do logo |
| ----------------- | ---------: | -----------------------: | ------------------: | --------------: |
| Compacta          |  `< 768px` |         **160 × 160 px** |          **160 px** |  **80 × 40 px** |
| Desktop           | `>= 768px` |         **272 × 272 px** |          **271 px** | **112 × 60 px** |

No desktop, o cartão seguinte recebe margem esquerda de **-1 px**. Por isso,
os retângulos continuam sendo `272 × 272 px`, mas as origens são `-1`, `270`,
`541`, `812`… e o passo visual é **271 px**. Essa sobreposição elimina a
parede dupla entre cartões adjacentes.

No recorte de referência de **1830 px** de largura:

| Item                                   |               Medida Playwright |
| -------------------------------------- | ------------------------------: |
| Faixa                                  |                 `1830 × 272 px` |
| Primeiro cartão                        |        `x = -1`, `272 × 272 px` |
| Segundo cartão                         |       `x = 270`, `272 × 272 px` |
| Largura de uma sequência de 12 cartões |                       `3252 px` |
| Borda                                  | `1 px solid rgb(228, 227, 222)` |

### Cartão e logo

| Propriedade         | Contrato                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| Layout              | `position: relative; flex: 0 0 auto; display: flex; align-items: center; justify-content: center`        |
| Forma               | quadrada (`aspect-ratio: 1`)                                                                             |
| Borda               | 1 px em todos os lados; sobrepor a borda esquerda dos irmãos por -1 px no desktop                        |
| Logo                | `display: block; width: auto; object-fit: contain; max-width/max-height` da tabela acima                 |
| Estado de repouso   | monocromático: `filter: grayscale(1)`                                                                    |
| Hover/focus visível | remover a escala de cinza e usar uma superfície secundária Kubo discreta; preservar a dimensão do cartão |
| Transição           | transicionar filtro, cor de fundo e opacidade por **500 ms**, `ease-in-out`                              |

O logo fica geometricamente centrado no cartão. A imagem fonte pode ter
proporções diferentes: jamais force `width` ou `height` fixa; aplique somente
os limites máximos acima e `width: auto`.

## Interação de marquee

- A faixa tem `overflow: hidden`, `cursor: grab`, `touch-action: pan-x` e
  `user-select: none`.
- Em pointer down, o cursor passa para `grabbing`; deslocar o trilho em X com
  o delta do ponteiro.
- Ao chegar ao fim/início de uma cópia, normalizar a posição em incrementos de
  **3252 px** (desktop) ou **1920 px** (compacto), mantendo a posição pintada.
- A observação do site em repouso não mostrou animação CSS automática
  (`animation-name: none`, `transform: none`). Portanto, a fidelidade mínima
  é **arrasto infinito**, não autoplay inventado. Se produto pedir autoplay,
  ele deve ser uma decisão Kubo separada e respeitar `prefers-reduced-motion`.
- Clique/teclado não deve ser roubado pelo gesto de arrastar. Se um cartão for
  um link, só navegar quando o deslocamento total não passar de 6 px.

## Implementação CSS de referência

```css
.logo-marquee__viewport {
  position: relative;
  display: flex;
  width: 100%;
  height: 160px;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-x;
  user-select: none;
}

.logo-marquee__track {
  position: absolute;
  display: flex;
  width: max-content;
}

.logo-marquee__cell {
  display: flex;
  width: 160px;
  height: 160px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--kubo-border-subtle);
  filter: grayscale(1);
  transition:
    filter 500ms ease-in-out,
    background-color 500ms ease-in-out;
}

.logo-marquee__cell img {
  display: block;
  width: auto;
  max-width: 80px;
  max-height: 40px;
  object-fit: contain;
}

@media (min-width: 768px) {
  .logo-marquee__viewport {
    height: 272px;
  }
  .logo-marquee__cell {
    width: 272px;
    height: 272px;
  }
  .logo-marquee__cell + .logo-marquee__cell {
    margin-left: -1px;
  }
  .logo-marquee__cell img {
    max-width: 112px;
    max-height: 60px;
  }
}
```

## Critérios de aceite

- Em `1830px` de viewport, a faixa mede 272 px de altura e os cartões têm
  origens `-1`, `270`, `541`, `812`… (tolerância de 0,5 px).
- Em `767px`, faixa e cartões medem 160 px; em `768px`, passam para 272 px.
- No desktop, há apenas uma linha de 1 px entre cartões, nunca uma linha de
  2 px ou um vão.
- O logo visível respeita máximo de 112 × 60 px no desktop e 80 × 40 px no
  compacto, sempre centrado.
- Arrastar por mais que uma sequência não revela área vazia, salto visual nem
  muda o passo de 271/160 px.
- `prefers-reduced-motion` mantém a faixa estática e totalmente utilizável.
- A implementação usa exclusivamente logos e tokens Kubo.

## Verificação Playwright

1. Abrir a home Kubo em `1830 × 900`.
2. Medir o container, os quatro primeiros cartões e o primeiro logo.
3. Confirmar `height = 272`, cartões `272 × 272`, posições em passo de 271 e
   limites de logo `112 × 60`.
4. Repetir em `767 × 900` e `768 × 900` para validar a transição de 160 para
   272 px.
5. Arrastar horizontalmente por mais de uma largura de sequência e confirmar
   continuidade, ausência de espaço vazio e navegação somente em clique.
