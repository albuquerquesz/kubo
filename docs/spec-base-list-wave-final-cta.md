# Spec: CTA final Kubo com listas amarelas animadas

## Status

Pronto para implementacao.

## Objetivo

Substituir a primeira secao do `Footer` por um CTA final unico, original e de
largura total. O componente preserva a conversao existente para `/new`, mas
troca a composicao estaticamente dividida por um campo decorativo de listas
amarelas que se move de modo continuo no lado direito.

Esta especificacao usa a skill
[`base-list-wave-animation`](../.agents/skills/base-list-wave-animation/SKILL.md)
como contrato canonico de movimento e acessibilidade. As medidas observadas e
as limitacoes da captura Playwright estao na
[referencia da skill](../.agents/skills/base-list-wave-animation/references/base-capture.md).
O padrao e inspirado apenas pela gramatica de composicao pesquisada: nao usar
marca, copy, paleta azul, assets, canvas, video ou codigo da Base.

## Escopo

### Incluido

- Criar `apps/web/src/app/(home)/_components/final-cta-list-wave.tsx` e renderiza-lo
  no inicio de `footer.tsx`, no lugar da secao atual com
  `aria-labelledby="final-cta-title"`.
- Manter o titulo atual, **"Stop assembling. Start shipping."**, o CTA
  **"Build your stack"** e o destino interno `/new`.
- Manter o comando `bun create kubojs@latest` como informacao secundaria no
  mesmo componente; ele nao e um controle e nao deve competir visualmente com
  a acao principal.
- Implementar o campo decorativo somente com DOM e CSS, sem dependencia nova,
  canvas ou WebGL.

### Excluido

- Alterar as colunas de navegacao, copyright, rotas ou dados da home.
- Recriar os tracos verticais, a animacao shader ou qualquer cor/identidade da
  Base.
- Transformar a animacao em loader, parallax de ponteiro ou mecanismo para
  revelar conteudo funcional.

## Estrutura e interface

`FinalCtaListWave` e um componente privado da home, sem props publicas. O
conteudo e local, pois a copy e a rota ja sao parte do footer atual.

```text
section[aria-labelledby="final-cta-title"].final-cta-list-wave
├─ div[aria-hidden="true"].final-cta-list-wave__backdrop
│  ├─ div.final-cta-list-wave__mask
│  └─ div.final-cta-list-wave__track × 4
│     └─ div.final-cta-list-wave__sequence × 2
│        └─ span.final-cta-list-wave__item × N
└─ div.final-cta-list-wave__content
   ├─ h2#final-cta-title
   └─ div.final-cta-list-wave__actions
      ├─ Link[href="/new"] "Build your stack" + icone decorativo
      └─ code "bun create kubojs@latest"
```

- O `section` e o unico marco semantico. A decoracao inteira tem
  `aria-hidden="true"` e `pointer-events: none`.
- O link ocupa somente sua propria area de acao, mede pelo menos `48px` de
  altura e preserva o foco visivel ja usado pela home.
- O icone de seta continua `aria-hidden`; o texto do link fornece todo o nome
  acessivel. O comando permanece texto selecionavel.

## Composicao visual

### Camadas

| Camada   | Contrato                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| Card     | `position: relative`, `overflow: hidden`, fundo marrom-preto quente, borda `border-rule` inferior.         |
| Backdrop | `position: absolute; inset: 0; z-index: 0`; nunca altera o fluxo.                                          |
| Mascara  | Gradiente horizontal do fundo opaco ate transparente; a area esquerda de 40% permanece visualmente quieta. |
| Conteudo | `position: relative; z-index: 1`; acima de todas as listas e sempre legivel.                               |

Use a familia original `#F4C430`, `#FFD84D`, `#FFE9A6` e um ocre amortecido
sobre a base quente. As listas devem ter opacidade e tamanhos variados; nao
usar gradiente multicolorido, azul intenso, sombra ou painel flutuante.

O conteudo fica em um frame de `max-width: 1200px`. Em desktop, o titulo
mantem o peso editorial da home, mas deve caber em duas linhas dentro do card:
use `clamp(2rem, 3vw, 3.5rem)`, `line-height` entre `0.9` e `0.96` e no maximo
aproximadamente 760 px de largura. A acao fica abaixo do titulo e o comando
acompanha-a como metadado secundario; no mobile, eles podem quebrar em duas
linhas, sem colisao com a decoracao.

### Listas e loop

- Renderizar **quatro** trilhos horizontais independentes, ancorados entre
  22% e 82% da altura do card. Cada trilho contem uma sequencia e uma copia
  imediata, com largura equivalente, para que o reinicio seja invisivel.
- Cada sequencia usa de 7 a 12 itens simples: capsulas arredondadas ou regras
  curtas, com 4–14 px de altura e 24–112 px de largura. Variar proporcoes e
  espacamentos por trilho; nao desenhar uma onda senoidal sincronizada.
- Aplicar movimento linear em X a cada sequencia duplicada. Usar direcoes
  alternadas, duracoes de 14, 17, 22 e 26 segundos e atrasos negativos
  distintos. Cada trilho recebe tambem deriva vertical discreta de 8–20 px.
- Usar `transform: translate3d(...)` e `will-change: transform` somente nos
  elementos que se movem. Nenhuma animacao pode alterar largura, altura,
  padding ou posicao do conteudo.
- O lado direito e mais denso; o campo deve ficar perceptivel apenas depois da
  transicao da mascara, sem passar sob o titulo ou a acao de forma ruidosa.

## Responsividade e movimento reduzido

| Largura    | Conteudo                                                      | Card e listas                                                                                                            |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `>= 768px` | `80px` vertical e `32px` horizontal; frame maximo de 1200 px. | Meta de 326–333 px de altura quando a copy nao cresce; trilhos podem ocupar o lado direito inteiro.                      |
| `< 768px`  | `80px` vertical e `24px` horizontal.                          | O card pode crescer para acomodar acao e comando empilhados; reduzir opacidade/densidade e manter a area esquerda livre. |

Em `prefers-reduced-motion: reduce`, desabilitar todas as animacoes infinitas
e renderizar uma disposicao estatica, proposital e visivel das listas. Nao
ocultar o CTA, nao manter timers JavaScript e nao exigir movimento para
compreensao.

## Plano de implementacao

1. Extrair a secao inicial de `footer.tsx` para `FinalCtaListWave`; manter o
   restante do footer sem mudanca estrutural.
2. Definir os quatro trilhos e seus itens como configuracao local tipada e
   renderizar as duas sequencias decorativas por trilho.
3. Adicionar as classes/keyframes locais ou globais necessarias, usando tokens
   de regra e foco existentes e valores de cor explicitamente limitados ao
   campo decorativo amarelo.
4. Conferir que o DOM acessivel apresenta somente titulo, link e comando; as
   duplicatas usadas para o loop nao podem aparecer duas vezes a leitores de
   tela.

## Criterios de aceite

- O CTA final permanece antes da navegacao do footer, tem uma unica acao
  funcional para `/new` e conserva a copy e o comando atuais.
- Em viewport desktop, o card tem leitura tranquila no lado esquerdo e listas
  amarelas independentes, densas e animadas no lado direito, sem layout shift.
- Em 390 px, o texto, link e comando nao sobrepoem nem sofrem clipping; o link
  continua ter ao menos 48 px de altura e foco claramente visivel.
- Assistive technology e navegacao por Tab nao encontram itens duplicados ou
  decorativos; nenhum elemento animado captura o ponteiro.
- Dois ciclos completos de cada trilho nao revelam espacamento vazio ou salto
  no ponto de reinicio.
- Com movimento reduzido, o resultado e estatico, legivel e ainda composto;
  com zoom de 200%, a secao cresce em vez de cortar conteudo.
- Nenhum asset, nome, copy, cor azul ou tecnologia WebGL da Base e introduzido.

## Verificacao

1. Rodar `bun run check` na raiz.
2. Com Playwright, inspecionar `/` em 1440 × 1000, 768 × 1024 e 390 × 844;
   capturar o CTA final em cada largura.
3. Gravar ou observar dois ciclos completos, verificando continuidade,
   clipping e que o conteudo permanece acima da decoracao.
4. Emular `prefers-reduced-motion: reduce`, navegar por Tab ate o CTA e testar
   zoom de texto de 200%.
