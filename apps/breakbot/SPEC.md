# PUSH — Spec de implementação (protótipo HTML → projeto React 3D)

> Fontes: protótipo `push-game (1).html` (canvas 2D pseudo-3D, ~550 linhas, gerado no Claude Artifacts) e post de referência `@mobcontrolgame` ("Lead, Multiply, and Conquer", vídeo vertical 9:16).
> A referência serve só como **referência de gênero e acabamento** (canhão que dispara multidão, portões multiplicadores, leitura 3D vertical, "juice"). A identidade, os nomes, a arte e o design de fases vêm do PUSH. Não é uma recriação do Mob Control.

## Glossário de domínio

Use estes termos em código, UI e issues (o código usa inglês, a UI português):

| Domínio (UI)      | Código              | O que é                                                                                             |
| ----------------- | ------------------- | --------------------------------------------------------------------------------------------------- |
| Tropa / verdes    | `troop` / `ally`    | Unidades do jogador disparadas pelo canhão (no protótipo a variável chama `blues`, mas são verdes)  |
| Robôs / vermelhos | `bot` / `enemy`     | Horda inimiga que desce a pista em direção ao jogador                                               |
| Gigante (aliado)  | `champion`          | Unidade aliada grande (hp 40), liberada pela barra de carga ou pelo Konami                          |
| Gigante (inimigo) | `giant`             | Robô grande com HP próprio e barra de vida                                                          |
| Chefão            | `boss`              | Robô gigante a cada 5 ondas                                                                         |
| Guardas           | `guard`             | Robôs que descem pela fileira lateral a partir da onda 3                                            |
| Pista principal   | `mainLane` (lane 0) | Faixa larga da direita, onde a horda vem                                                            |
| Fileira lateral   | `sideLane` (lane 1) | Faixa estreita da esquerda por onde descem as paredes; a tropa dela faz o flanco                    |
| Flanco            | `flank`             | Tropa que saiu da fileira lateral, entra na pista principal pelo fundo e ataca a horda pelas costas |
| Torre / ninho     | `tower`             | Base inimiga no fim da pista; tropa que chega nela pontua                                           |
| Onda              | `wave`              | Unidade de progressão; cada onda é mais forte                                                       |
| Carga             | `charge`            | Barra de 0–30 tiros que libera um gigante aliado                                                    |
| Vidas             | `lives`             | 30 no início; robô que passa pelo canhão tira vida                                                  |
| Segredos          | `secrets` (eggs)    | 10 easter eggs persistentes                                                                         |
| Terminal secreto  | `terminal`          | Console in-game com comandos que dão poderes                                                        |
| Modo demo         | `attract`           | Partida automática que roda atrás do menu                                                           |

## Problem Statement

Tenho um protótipo jogável do PUSH num único arquivo HTML: canvas 2D com projeção pseudo-3D feita à mão, todo o estado em variáveis globais mutáveis, render, física, input, áudio, persistência e UI misturados num IIFE só. Ele prova que o loop é divertido (atirar, multiplicar na fileira lateral, flanquear a horda, sobreviver a ondas), mas não dá para evoluir: não tem como testar regras, trocar o visual por 3D de verdade, adicionar telas e rotas, revisar mudanças por partes ou colocar mais gente mexendo sem quebrar tudo. Também quero que o jogo tenha o acabamento 3D do gênero (multidões volumosas, portões chamativos, câmera vertical) e não um desenho 2D com perspectiva simulada.

## Solution

Reconstruir o PUSH como um projeto de verdade, com as mesmas regras do protótipo:

- Um **monorepo Turborepo + pnpm** com dois workspaces principais: o app web (**TanStack Start + React**) e um pacote de **simulação pura em TypeScript** (`game-core`), sem React, sem DOM, sem Three.
- Render 3D com **React Three Fiber + drei + three**, multidões em `InstancedMesh`, câmera em perspectiva atrás do canhão, layout vertical mobile-first.
- App organizado **por feature**: cada feature (menu, partida, HUD, render da arena, input, áudio, terminal, segredos, progresso) tem sua própria pasta com UI, hooks e lógica. Assim cada PR fica restrito a uma área e fica fácil de revisar.
- Toda regra de jogo (ondas, colisão, paredes, poderes, pontuação, game over) mora no `game-core` e é testável headless com RNG com seed. Os números do protótipo viram a configuração inicial e o jogo final tem que ter a mesma sensação.

Para o jogador, o resultado é o mesmo PUSH (mesmo loop, mesmos segredos, mesma graça "dev"), agora em 3D, mais bonito, mais fluido em celular e com recorde e segredos salvos.

## User Stories

### Menu e fluxo

1. Como jogador, quero ver um menu com o logo PUSH animado (glitch + cursor piscando), para que o jogo tenha identidade logo de cara.
2. Como jogador, quero ver uma partida demo rodando sozinha atrás do menu, para entender o jogo antes de tocar.
3. Como jogador, quero ler em uma frase como jogar ("segure e arraste pra atirar, passe pelas faixas roxas pra multiplicar"), para começar sem tutorial longo.
4. Como jogador, quero ver meu recorde (onda e pontos) no menu, para ter um objetivo.
5. Como jogador, quero um botão "jogar" pulsando, para saber onde tocar.
6. Como jogador, quero uma intro curta (~2s) estilo terminal digitando "aguente o máximo" com barra de carregamento e dicas, para entrar no clima.
7. Como jogador, quero pular a intro tocando na tela, para não esperar quando já sei jogar.
8. Como jogador, quero uma tela de fim com onda, pontos, robôs derrubados, moedas ganhas, tempo e recorde, para avaliar minha partida.
9. Como jogador, quero ver "★ NOVO RECORDE" com confete quando bato o recorde, para comemorar.
10. Como jogador, quero ver "FIM DE JOGO" com glitch quando não bato o recorde, para ficar claro que acabou.
11. Como jogador, quero "de novo" e "menu" na tela de fim, para jogar outra vez ou voltar.
12. Como jogador, quero ver quantos segredos achei (x/10) na tela de fim, para ter vontade de procurar o resto.
13. Como jogador, quero que recarregar a página em `/play` comece uma partida nova e não quebre, para não perder o fluxo.

### Controles

14. Como jogador mobile, quero segurar o dedo na tela para atirar sem parar, para jogar com uma mão.
15. Como jogador mobile, quero arrastar o dedo para os lados para mover o canhão, para mirar enquanto atiro.
16. Como jogador mobile, quero que o canhão siga o dedo de forma relativa (delta) e não pule para a posição do toque, para ter controle fino.
17. Como jogador desktop, quero usar setas ←/→ para mover e espaço para atirar, para jogar no teclado (a tecla G solta o gigante aliado com a carga cheia).
18. Como jogador, quero que a tela não role, não dê zoom nem selecione texto durante o jogo, para não atrapalhar o toque.
19. Como jogador, quero ver uma linha tracejada animada saindo do canhão até o fim da pista, para saber para onde estou mirando.
20. Como jogador iniciante, quero uma dica "segure e arraste" com mãozinha animada na primeira onda até eu tocar, para aprender sem ler.

### Tropa e fileira lateral

21. Como jogador, quero que mirar na fileira da esquerda mande a tropa para a fileira lateral, e mirar na direita mande para a pista principal, para escolher a estratégia com a mira.
22. (removida em 2026-10-31: as placas saíram do jogo; a fileira lateral ficou só com paredes e flanco)
23. (removida em 2026-10-31: as placas saíram do jogo; a fileira lateral ficou só com paredes e flanco)
24. (removida em 2026-10-31: as placas saíram do jogo; a fileira lateral ficou só com paredes e flanco)
25. (removida em 2026-10-31: as placas saíram do jogo; a fileira lateral ficou só com paredes e flanco)
26. Como jogador, quero que a tropa da fileira lateral, ao chegar no fim, entre na pista principal pelo fundo e ataque a horda pelas costas (flanco), para ter uma jogada tática.
27. Como jogador, quero que a tropa do flanco, depois de atravessar a pista, volte a avançar rumo à torre, para que ela continue útil.
28. (removida em 2026-10-31: o contador de tropa ao lado do canhão saiu da tela)
29. (removida em 2026-10-31: as placas saíram do jogo; a fileira lateral ficou só com paredes e flanco)

### Inimigos e ondas

30. Como jogador, quero que cada onda traga uma horda em formação que "brota" no fundo da pista, para ver a ameaça chegando.
31. Como jogador, quero ondas progressivamente mais fortes (mais robôs, mais rápidos), para o desafio crescer.
32. Como jogador, quero robôs gigantes com barra de vida e número de HP, para saber quanto falta para derrubar.
33. Como jogador, quero um chefão a cada 5 ondas, com visual diferente (duas antenas, olhos amarelos), para ter picos de tensão.
34. Como jogador, quero guardas descendo rápido pela fileira lateral a partir da onda 3, para que a fileira lateral não seja grátis.
35. Como jogador, quero um fluxo contínuo de robôs avulsos entre as hordas, para não ter tempo morto.
36. Como jogador, quero um banner "ONDA N" digitando com glitch e o resumo "+X robôs · chefão!", para saber o que vem.
37. Como jogador, quero que a onda acabe por tempo ou quando sobrar pouca horda, e ganhar bônus "onda limpa +N" se eu limpei, para ser recompensado por jogar bem.
38. Como jogador, quero recuperar até 2 vidas a cada 5 ondas, para ter fôlego em partidas longas.

### Combate, vidas e pontuação

39. Como jogador, quero que tropa e robô troquem HP ao colidir (o menor zera, o maior perde o mesmo tanto), para que gigantes atravessem vários robôs.
40. Como jogador, quero que só unidades da mesma faixa colidam, para que as faixas façam sentido.
41. Como jogador, quero perder 1 vida quando um robô passa pelo canhão e 3 quando é um gigante, para entender o peso de cada ameaça.
42. Como jogador, quero ver vidas coloridas por perigo (verde > 6, amarelo > 3, vermelho), para sentir a urgência.
43. Como jogador, quero ganhar pontos por robô derrubado, por tropa que chega na torre (12 para gigante) e por onda limpa, para entender a pontuação.
44. Como jogador, quero ver a torre no fim da pista com o número da onda, barra de progresso da onda e LEDs que piscam mais rápido quando é atingida, para ler o estado da onda sem olhar o HUD.
45. Como jogador, quero ver a contagem de robôs vivos no topo da tela, para saber o tamanho da horda.
46. Como jogador, quero "K.O.!" e explosão grande ao derrubar um gigante, para a vitória ter impacto.
47. Como jogador, quero tremor de câmera em eventos fortes (vida perdida, gigante derrubado, +99, game over), para o jogo ter peso.

### Gigante aliado (carga)

48. Como jogador, quero uma barra de carga que enche a cada tiro normal (30 tiros), para ter uma recompensa por atirar.
49. Como jogador, quero tocar no botão "⚡ GIGANTE" brilhando quando a carga encher, para soltar um gigante aliado.
50. Como jogador, quero que o gigante aliado seja grande, brilhante e com orbitais, para destacá-lo na multidão.

### Poderes e segredos

51. Como jogador curioso, quero abrir um terminal secreto com long-press no placar ou tecla `` ` ``, para descobrir comandos.
52. Como jogador, quero que o jogo pause com o terminal aberto, para digitar com calma.
53. Como jogador, quero `help` listando alguns comandos e insinuando que há outros, para explorar.
54. Como jogador, quero `sudo` (ou digitar "sudo" no teclado durante o jogo) para rajada infinita por 6s, uma vez por onda.
55. Como jogador, quero `coffee`/`café` para disparo 2x por 6s, uma vez por onda.
56. Como jogador, quero `git push --force` para ganhar 40 de tropa na pista principal, uma vez por onda.
57. Como jogador, quero `rm -rf /` para apagar todos os robôs e também minha tropa, uma vez por onda.
58. Como jogador, quero `vim` me prender num prompt `:` até eu digitar `:q`, para a piada funcionar.
59. Como jogador, quero `sudo make me a sandwich`, `42`, `eggs`, `clear`, `exit` e "command not found" para comandos desconhecidos, para o terminal parecer real.
60. Como jogador, quero ser avisado "já usado nesta onda" e "comece uma partida primeiro" quando não posso usar um comando, para entender a regra.
61. Como jogador, quero fazer o código Konami (setas + B A no teclado, ou swipes + 2 toques no celular) para que todo tiro vire gigante por 8s.
62. Como jogador, quero tocar 7 vezes no placar em 2,5s para ativar o modo desenvolvedor com FPS e contadores, para "virar dev".
63. Como jogador, quero um toast "🥚 segredo: X (n/10)" com jingle ao achar cada segredo pela primeira vez, para colecionar.
64. Como jogador, quero segredos escondidos por condição de jogo (ter exatamente 42 de tropa; 1337 tiros na vida), para ter surpresas.
65. Como jogador, quero `eggs` no terminal mostrando quais achei e "???" nos outros, para acompanhar a coleção.
66. Como jogador, quero ver o canhão brilhar na cor do poder ativo (vermelho sudo, amarelo café, arco-íris Konami), para saber que estou com poder.

### Áudio e feedback

67. Como jogador, quero bipes sintetizados (chiptune) para tiro, impacto, parede quebrada, vida perdida e jingles de onda/recorde/segredo, para ter feedback sonoro sem baixar arquivos.
68. Como jogador, quero mutar/desmutar pelo ícone 🔊 no HUD e que isso fique salvo, para jogar em silêncio.
69. Como jogador, quero que o áudio só comece após minha primeira interação, para respeitar as regras do navegador.
70. Como jogador, quero que o volume de bipes não estoure quando há centenas de colisões, para não doer o ouvido (rate limit de bipes).

### Persistência

71. Como jogador, quero que recorde, segredos, total de tiros e preferência de som fiquem salvos no navegador, para não perder progresso.
72. Como jogador do protótipo, quero que meu progresso salvo (`push_v2`) seja migrado, para não perder segredos já achados.
73. Como jogador, quero que dados salvos corrompidos não quebrem o jogo, para ele sempre abrir.
74. Como jogador, quero ganhar moedas no fim de cada onda (1 a cada 10 robôs derrubados nela, inclusive na onda em que perco) e ver minha carteira acumulada e o tempo de partida no HUD, para ter uma economia que uma loja futura possa usar.
75. Como jogador, quero que cada mini-boneco que acerta um robô derrube também os vizinhos mais próximos (até 8 por impacto), para a tropa abrir caminho na horda em vez de trocar um por um.
76. Como jogador, quero faixas roxas ×2 e ×3 paradas, fechando o corredor de muro a muro, para que todo boneco que desce o corredor se multiplique (uma vez por faixa).
77. Como jogador, quero uma estátua de pedra por onda na borda da pista principal, com a vida escrita no pedestal, para ter um alvo extra: quebrar a estátua dá um upgrade do canhão (efeito a definir).

### Telemetria (#18)

76. Como dono do jogo, quero eventos de produto escolhidos a dedo no PostHog (partida iniciada, onda concluída, fim, abandono, "de novo"), sem autocapture de cliques e nunca no modo demo, para medir funil, retenção, curva de dificuldade e economia.
77. Como dono do jogo, quero que exceções não tratadas e os erros silenciosos mapeados (WebGL, loop da partida, ouvintes, estado inválido, save, chunk, rota, câmera lenta) cheguem ao error tracking como issues separadas, com rota, fase, onda e seed, para saber quando o jogo quebra no aparelho do jogador.
78. Como jogador, quero ver uma tela com saída (recarregar, recomeçar ou menu) quando a arena ou a partida falham, em vez de tela branca ou cena congelada.

### Desempenho e plataforma

79. Como jogador mobile, quero 60fps estáveis com até ~1500 robôs e ~900 de tropa na tela, para o jogo não travar nas ondas grandes.
80. Como jogador com aparelho fraco, quero que o jogo reduza resolução e efeitos sozinho quando o FPS cai, para continuar jogável.
81. Como jogador desktop, quero que o jogo apareça numa coluna vertical centralizada (até ~480px de largura), para manter o enquadramento do mobile.
82. Como jogador, quero que trocar de aba pause a partida e não dê um salto de tempo na volta, para não perder vidas.
83. Como jogador, quero que o jogo funcione em Safari iOS e Chrome Android, para jogar no celular.

### Desenvolvimento e manutenção

84. Como desenvolvedor, quero toda regra de jogo num pacote puro testável sem browser, para validar balanceamento com testes rápidos.
85. Como desenvolvedor, quero simulação determinística (RNG com seed + passo fixo), para reproduzir bugs e escrever testes estáveis.
86. Como desenvolvedor, quero os números de balanceamento (ondas, velocidades, caps, cooldowns) centralizados numa config tipada, para ajustar sem caçar constantes.
87. Como desenvolvedor, quero que cada feature do app fique numa pasta própria com fronteira clara, para revisar PRs por área.
88. Como desenvolvedor, quero que o render 3D só leia o estado da simulação e nunca mude regras, para trocar o visual sem medo.
89. Como desenvolvedor, quero eventos de jogo tipados (kill, bandCrossed, lifeLost, waveStarted, secretFound…), para que áudio, partículas, toasts e segredos reajam sem acoplar no core.
90. Como desenvolvedor, quero um painel de debug (modo dev) com FPS, contagem de entidades e tiros, para diagnosticar desempenho.
91. Como desenvolvedor, quero adicionar um comando novo de terminal mexendo só na feature de terminal e num comando do core, para incrementar o jogo rápido.
92. Como desenvolvedor, quero adicionar um segredo novo declarando-o num catálogo, para não espalhar lógica.
93. Como designer, quero poder trocar primitivas procedurais por modelos GLTF no futuro sem mudar a simulação, para evoluir a arte.

## Implementation Decisions

### Estrutura do repositório

- **Monorepo Turborepo + pnpm workspaces.** Motivo: força uma fronteira física entre regra de jogo e UI (o pacote de simulação não consegue importar React/Three), deixa o core testável e reutilizável (validação de score no servidor, multiplayer, outro front) e mantém o cache de build/test do Turbo. Decisão confirmada pelo dono do projeto.
- Workspaces:
  - **app web**: TanStack Start (React, Vite), arquitetura by feature.
  - **game-core**: TypeScript puro, sem dependências de runtime além de, no máximo, uma lib de validação. É dono de todas as regras.
  - **config compartilhada**: tsconfig base, config do linter/formatter (Biome), preset do Vitest.
- TypeScript `strict` em tudo. Biome para lint+format. Vitest para testes. Playwright só para smoke do app.

### game-core (simulação)

- **Interface pública (o seam principal):**
  - criar uma partida a partir de `{ seed, mode: 'play' | 'attract', config? }`;
  - `step(dt, input)`: avança a simulação com **passo fixo** (1/60s; o app acumula o tempo real e chama N passos, com teto de passos por frame para evitar a espiral da morte; o protótipo limitava dt a 33ms);
  - `dispatch(command)`: ações discretas (`fireChampion`, `terminal:sudo`, `terminal:coffee`, `terminal:force`, `terminal:rm`, `konami`, `pause`, `resume`, `skipIntro`). Cada comando retorna aceito/recusado com o motivo (`notPlaying`, `usedThisWave`, `notCharged`), que o terminal usa para responder;
  - snapshot de leitura: fase (`intro | play | over`), onda, tempo da onda / duração, score, kills, vidas, carga, tempos de poder ativos, posição do canhão, recoil, e as coleções de entidades como **arrays estruturados (SoA / typed arrays)** para o render ler sem alocar;
  - fila de eventos drenada a cada frame.
- **Input por frame** é um objeto simples: `{ firing: boolean, aimDelta: number, aimAxis: -1|0|1 }`. Gestos (Konami, toques no placar, long-press) são interpretados no app e viram comandos. O core não sabe o que é pointer ou tecla.
- **Coordenadas do mundo**: manter o espaço do protótipo (x ∈ [-1, 1], z de -12 a L). O protótipo usava L=100; no 3D a pista foi encurtada para L=55, depois 40 e voltou a 60 (2026-10-31): o funil fica perto do canhão (z 14–24) e o fundo guarda a mega horda, e hordas grandes se compactam na metade de trás. O render aplica uma escala para unidades 3D. Faixas, simétricas em torno do centro da estrada: rampa esquerda x ∈ [-0.97, -0.51], corredor da horda [-0.45, 0.45], rampa direita [0.51, 0.97], com muros de contenção entre elas; atrás do funil a horda ocupa [-0.94, 0.94]. A faixa da tropa é decidida pela mira: além do centro de um muro → rampa daquele lado. Canhão limitado a [-0.84, 0.84].
- **Módulos internos** (by domain, dentro do core): `config` (balanceamento), `rng` (seed), `waves` (geração/spawn), `lanes` (geometria e regras de faixa/flanco), `walls` (paredes e mini-canhões), `combat` (grade espacial + troca de HP), `powers` (sudo/coffee/konami/champion/force/rm + "uma vez por onda"), `scoring`, `lifecycle` (intro → play → over, attract com reset), `events`.
- **Regras portadas literalmente do protótipo** (valores iniciais da config):
  - Config de onda (prototype snippet, encoda a curva de dificuldade):

    ```
    waveCfg(w) = {
      horde:   0,                           // massa extra por onda; zerada: a horda vem em fluxo contínuo (2026-11-01)
      speed:   min(3.5, 1.4 + w*0.12),      // mais devagar: a massa inteira desce junta
      boss:    w % 5 === 0 ? 150 + w*45 : 0,      // HP do chefão
      giants:  floor((w-1)/2),  giantHp: 25 + w*2,
      guards:  w >= 3 ? max(1.4, 5 - w*0.25) : 0,  // intervalo (s) de trios na fileira lateral
    }
    waveDuration(w) = min(45, 30 + w*1.5)   // ondas emendadas: só marca quando a marcha acelera
    waveEnds  = t >= duration || (t > 5 && reds < max(8, horde*0.08))
    clearBonus = w * 25 (só se terminou por limpeza; com o fluxo contínuo a pista nunca esvazia)
    ```
  - Horda spawna em grade de 24 colunas no fundo da pista, com animação de "brotar" escalonada por fileira (`grow` de negativo até 1; robô só anda com grow ≥ 0.3). Chefão no meio da formação.
  - Tropa: hp 1, raio .03, vz ~8.5 (`troopSpeed` ±7%), um tiro a cada 0.25s (`fireInterval`), leve jitter lateral com amortecimento; ricocheteia nas bordas da faixa.
  - Gigante aliado: hp 40, raio .075, vz 20 (`championHealth`, `championRadius`, `championSpeed`); troca HP com a horda como a tropa (atravessa vários robôs); dá 12 pontos ao chegar na torre (`championTowerPoints`); não multiplica nas faixas ×N; ignora o teto de tropa. Mirando na fileira lateral, faz o flanco como a tropa e volta a avançar a vz 20. Criado por `releaseChampion(x)` em `champions.ts`, separado da carga para o Konami reutilizar.
  - Robôs: hp 1 / gigante `giantHp` / chefão `boss`; velocidade base `speed`, ×0.85 chefão, ×1.3 gigante, ×3.2 guardas na lateral; pequeno balanço senoidal em x.
  - Estátua da fileira (`sideStatue`, `side-statue.ts`, adicionada em 2026-10-31): tranca a rampa esquerda em z 4, ocupando a largura toda; vida `8 + onda*4`. Uma por partida: tranca a rampa na onda 1 e, derrubada, não volta mais (a rampa fica aberta e só restam as paredes). Cada tropa da rampa que chega na profundidade dela morre e tira a própria vida (`sideStatueHit{health}`). Ao zerar, emite `sideStatueBroken{wave}`; a única função dela é liberar as paredes (o upgrade do canhão é da estátua da direita).
  - Paredes (adicionado depois do protótipo; desde 2026-10-31 substitui as placas, que foram removidas): fila de 3 paredes **paradas** no deck da rampa esquerda, atrás da estátua da fileira (`wallRowZ`: z 7, 9.5 e 12), renovadas cheias no início de cada onda; vida `20 + onda*10`. Só levam dano com a estátua quebrada: cada tropa da rampa que alcança a profundidade de uma parede morre e tira 1 de vida, então a da frente cai primeiro e a seguinte vira o alvo. Ao quebrar, dá um mini-canhão (`sidekick`, até 14, ou seja 15 canhões; `sidekickJoined{slot, total}`). Os mini-canhões ocupam slots de uma cunha atrás do canhão (`sidekick-formation.ts`: fileiras de 2, 4, 4 e 4) e atiram junto quando o gatilho está seguro, a cada 1s, cada slot numa fase própria da cadência para sair uma rajada contínua.
- Faixas multiplicadoras (`band`, convivem com as paredes): duas no corredor da horda, ×2 em z 5 e ×3 em z 10, paradas e fechando o corredor de muro a muro. Cada boneco guarda o índice da próxima faixa; ao cruzar o z de uma faixa, todo boneco do corredor vira N (clones até o teto de tropa) e os clones herdam o índice, sem re-disparar. Tropa da fileira lateral não multiplica. Evento `bandCrossed{band, multiplier, clones, x, z}`.
- Funil de barricadas (`funnel` no balance, `funnel.ts`, adicionado em 2026-10-31): duas cercas de madeira, uma de cada lado, simétricas em torno do centro da estrada. Formam duas quinas retas (┐ ┌): trechos transversais em z 19 (`neckZ`) vão da borda da área da horda (`hordeBounds`, x ±0.94) até a abertura central; dali seguem na borda do corredor até z 14 (`mouthZ`), onde começam as rampas. A horda converge gradualmente desde z 24 (`wideZ`) para alcançar essa abertura, antes da cerca, sem trechos diagonais de madeira. São só a cerca: sem chão e sem face da frente. Depois dela, as duas pistas laterais são pontes com asfalto, laje fina, pilares e guarda-corpos metálicos; os acessos sobem do chão em z -6 até o tabuleiro em z 3 (altura 0.75), sem blocos marrons maciços nas laterais. O corredor da horda (`laneBounds.main`, x -0.405 a 0.405, passagem 10% mais estreita) segue dali até o canhão entre as rampas (esquerda -0.97 a -0.51, direita 0.51 a 0.97). Robôs têm o x apertado proporcionalmente à faixa livre (`funnelBoundsAt`): a horda se estreita por igual até o corredor, sem empilhar nas cercas, e não sai mais dele. A tropa do corredor quica nas mesmas bordas. A horda nasce atrás do pescoço: as fileiras que caem dentro da área de convergência já nascem com a largura livre do funil.
- Mega horda em fluxo contínuo (`hordeLayout` e `hordeStream` no balance, `horde-formation.ts`, 2026-11-01): a partida começa com a área atrás do funil lotada, 24 robôs por fileira na largura toda de `botBounds` mais 12 na largura do corredor (`corridorColumns`, o meio chega mais cheio), de z 25 (`frontZ`) até z 56 a cada 0.62 (fileiras cerca de 11% mais próximas). A massa inteira marcha junta, afunila e desce pelo corredor; sempre que a última fileira avança um espaçamento, nasce uma nova no fundo, então a pista nunca esvazia. As ondas se emendam sem intervalo: a virada só acelera a marcha de todos os robôs juntos (sem abrir buraco no fluxo) e traz a fila nova de paredes. A horda escorre para os vazios (`hordeFillSpeed` 0.9 x/s): o robô desliza para o lado cuja média nas 2 células vizinhas está mais vazia que a própria célula; colado na cerca, o lado de fora conta como igual, então o bolo da cerca se espalha para dentro e o buraco que o canhão abre no meio se fecha. A velocidade lateral (`Bot.drift`) acelera e freia aos poucos (alcança o alvo a 3/s), para o deslize sair suave, sem tranco. Os avulsos (`trickle`) saíram. `waveSettings.horde` ainda solta uma massa extra no início da onda (usada nos cenários de teste, com `hordeStream` desligado). `botCap` 3000.
- Estátuas de upgrade (`statue`, a da direita): fixa no meio da rampa direita, um pouco antes do fim dela (z 11, largura 0.36). Fica de pé entre as ondas guardando o dano; depois de quebrada, uma nova surge no início da onda seguinte com vida `min(1000, 400 + onda*100)`. Cada boneco da pista principal que passa pela profundidade dela morre e tira 1; ao zerar emite `statueBroken{wave}` e soma `cannonUpgrades` (o efeito do upgrade ainda não existe, issue #17). Robôs ignoram a estátua.
  - Fim de pista: tropa das rampas some ao chegar na face da barricada (`mouthZ`), sem pontuar (o flanco foi removido em 2026-10-31). Tropa do corredor que chega em z ≥ L−0.5 atinge a torre.
  - Colisão: só mesma faixa; elipse com dz escalado por 0.075; troca de HP `m = min(a.hp, b.hp)`. Grade espacial uniforme (células 0.1 × 1.2) recriada por passo; gigantes consultam vizinhança maior.
  - Vidas: 12; robô em z ≤ −1 tira 1 (gigante/chefão 3). Em ondas onde `w % 5 === 1` (exceto a 1), recupera até 2, teto 12.
  - Tiro: intervalo 0.5s; café e sudo dividem esse intervalo por 2 e 4 (6s cada); Konami 8s, todo tiro vira gigante (ignora o teto de tropa). Carga +1 por tiro normal até 30 (`chargeCapacity`, `charge` no snapshot, `charge.ts`): só o tiro do canhão principal conta, o do mini-canhão não. `fireChampion` é recusado com `notPlaying` fora da fase de jogo e com `notCharged` antes de encher; aceito, zera a carga e solta o gigante aliado na mira atual, com o evento `championReleased{x, z}`.
  - `git push --force`: +40 de tropa na principal perto do canhão. `rm -rf /`: remove todos os robôs e toda a tropa. Ambos, mais café e sudo, uma vez por onda (registro zerado no início de cada onda).
  - Caps: robôs 1500, tropa 900. Partículas não são do core (são do render).
  - Score = kills + acertos na torre + bônus de onda limpa. Recorde = maior onda; empate decidido por score.
  - Attract: mira automática `x = sin(t*0.7)*0.75`, tiro contínuo, sem vidas/score/eventos de segredo, reinicia ao chegar na onda 3.
  - Intro: 2.1s, pulável.
- **Determinismo**: nada de `Math.random` no core; todo sorteio passa pelo RNG da partida. Variações puramente visuais (fase de animação, partículas) ficam no render.
- **Eventos emitidos** (tipados, com posição no mundo quando fizer sentido): `shot`, `championReleased`, `enemyKilled{big, boss}`, `towerHit{amount}`, `lifeLost{amount}`, `waveStarted{wave, horde, hasBoss}`, `waveCleared{bonus}`, `livesRestored{amount}`, `powerStarted{kind}`, `gameOver{newRecord, stats}`, `troopCountChanged` (para o segredo 42). O core **não** conhece segredos nem persistência; ele só emite fatos.

### App web (TanStack Start, by feature)

- **Rotas**:
  - `/`: menu (logo, instrução, recorde, botão jogar) sobre a arena em modo attract.
  - `/play`: partida. Intro, HUD, terminal, banner e tela de fim são overlays dentro da rota, não rotas próprias, para não desmontar o Canvas no meio do jogo.
  - O Canvas 3D fica num layout compartilhado entre `/` e `/play` para a transição menu → jogo não recriar o contexto WebGL; a rota só troca o modo da partida e os overlays.
  - O jogo é 100% client-side: a rota da arena renderiza só no cliente (sem SSR do Canvas); o shell (HTML, fontes, meta) pode ser SSR/SSG.
- **Features** (cada uma com seus componentes, hooks, estado e testes; uma feature só fala com outra pela API pública dela):
  - `game-session`: dono da instância do core, do loop (rAF + acumulador de passo fixo), pausa por visibilidade/terminal, ponte de eventos (event bus tipado) e do store de HUD.
  - `arena-render`: cena R3F (estrada, faixas, meio-fio, zebras animadas, setas, paredes, barricadas do funil, mega horda de robôs reais, com modelo leve longe da câmera (a torre não é mais desenhada; a regra de pontuar no fim da pista segue no core), canhão, unidades, partículas, câmera, shake, pós-processamento).
  - `hud`: score, contador de robôs, vidas, mute, botão/ barra de gigante, banner de onda, textos flutuantes, dica de tutorial, overlay do modo dev.
  - `input`: pointer (hold + drag relativo + captura de ponteiro), teclado, detector de gestos (swipe/tap → sequência Konami, 7 toques, long-press 900ms, digitação de "sudo"). Produz o input por frame e comandos.
  - `terminal`: overlay do console; **parser puro** de comando (texto → `{ command?, output lines, secret? }`) incluindo estado do vim; despacha para o core e mostra o motivo de recusa.
  - `secrets`: catálogo dos 10 segredos (`konami, dev, term, sudo, force, rm, vim, sandwich, n42, l33t`) e um detector que escuta eventos do core, do input e do terminal, desbloqueia uma vez e dispara toast + jingle.
  - `progress`: persistência (recorde, carteira de moedas, segredos, total de tiros na vida, mute) atrás de uma interface de storage; schema versionado e validado, com migração de `push_v2`; fallback silencioso se o storage falhar.
  - `audio`: síntese WebAudio (osciladores + envelope) portada do protótipo, com rate limit (30ms) para bipes não forçados, desbloqueio no primeiro gesto e mute. Reage a eventos, não é chamado pelo core.
  - `menu` e `results`: telas de título e de fim (estatísticas, recorde, confete, ações).
  - `shared/`: UI base (botão, card, toast, painel tipo terminal), tokens de design, utilitários.
- **Estado**:
  - Estado da simulação é mutável, vive no core, **fora do React**. O render lê o snapshot dentro de `useFrame` e escreve direto nas matrizes de instância (sem re-render do React por frame).
  - Estado de UI (HUD, overlays, toasts) num store leve (Zustand) atualizado com throttle (~10–15 Hz para números; imediato para eventos discretos).
  - Progresso persistido também no store, hidratado do storage no boot.
- **Render 3D**:
  - React Three Fiber + drei; câmera em perspectiva atrás e acima do canhão, olhando a pista (equivalente ao horizonte do protótipo), FOV ajustado para retrato; layout mobile-first numa coluna de no máximo ~480px no desktop.
  - Multidões: um `InstancedMesh` por tipo visual (robô pequeno, tropa), com capacidade = caps do core. Animação de passo/balanço/piscar via atributos por instância + shader (ou matriz por instância), nunca um componente React por unidade.
  - Gigantes, chefões e gigantes aliados: meshes individuais com barra de vida em billboard e número de HP.
  - Contador de tropa: número de bonecos vivos (`troops.length` do snapshot) em texto 3D ao lado do canhão, seguindo a mira.
  - Torre: bloco tipo rack de servidor com LEDs (verde/amarelo/vermelho) piscando, número da onda, barra de progresso e luzes de alerta.
  - Partículas e confete: pool instanciado próprio do render, alimentado por eventos (limite ~420 como no protótipo).
  - Estética: paleta do protótipo (tema GitHub dark: fundo `#05070a`, verde `#3fb950`, vermelho `#f85149`, azul `#58a6ff`, roxo `#a371f7`, amarelo `#e3b341`), fonte JetBrains Mono, low-poly/flat com bloom leve em LEDs, poderes e faixas.
  - Desempenho: DPR máximo 2 (1.5 em mobile), monitor de desempenho que reduz DPR/bloom/sombras quando o FPS cai, sombras falsas (decal/blob) em vez de shadow maps para as multidões.
- **Tailwind CSS** nos overlays HTML. Animações de UI (glitch, pulse, pop, blink) portadas do CSS do protótipo.
- **Gerenciamento de pausa**: abrir o terminal pausa; `visibilitychange` pausa; ao voltar, o acumulador zera (sem salto de tempo).
- **Textos em pt-BR**, centralizados por feature para permitir i18n no futuro sem implementar agora.
- **Telemetria (#18)**: feature `telemetry` no app e porta de saída em `shared/telemetry` (sink PostHog, no-op, console e gravador para testes). O SDK `posthog-js` carrega depois da primeira pintura, sem autocapture de cliques, sem replay, com exception autocapture. Os eventos de produto saem dos eventos tipados do core contados pelo gravador da partida; o core continua sem saber de analytics. Cada erro silencioso é uma exceção com fingerprint igual ao seu tipo. Sem `VITE_POSTHOG_KEY` tudo é no-op.

## Testing Decisions

- **O que é um bom teste aqui:** testa comportamento observável pela interface pública (snapshot, eventos, resultado de comandos), nunca campos internos, a grade espacial ou a ordem de chamadas. Testes usam seed fixa e passos fixos para ser determinísticos. Se a implementação interna mudar (por exemplo, a grade virar outra estrutura) e o comportamento não, nenhum teste deve quebrar.
- **Seam principal (único seam de regra): a API pública do `game-core`.** Exemplos de comportamento a cobrir:
  - curva de ondas (horda, chefão a cada 5, gigantes, guardas a partir da 3);
  - fim de onda por tempo vs. por limpeza, e o bônus só na limpeza;
  - mira à esquerda do meio-fio leva tropa para a fileira lateral; à direita, para a principal;
  - flanco: tropa lateral chega ao fim, vira para a principal, anda para trás, depois volta a avançar;
  - colisão só na mesma faixa e troca de HP (gigante aliado atravessa vários robôs);
  - vidas: −1 por robô, −3 por gigante; recuperação de 5 a cada 5 ondas com teto 30; game over em 0 com stats corretas;
  - carga enche com tiros normais e libera gigante; comando recusado com `notCharged` antes disso;
  - poderes: sudo/café alteram cadência por 6s; Konami faz todo tiro virar gigante por 8s; force/rm têm o efeito esperado; cada um recusado com `usedThisWave` na segunda vez na mesma onda e liberado na onda seguinte;
  - attract não altera score/vidas e reinicia na onda 3;
  - determinismo: mesma seed + mesma sequência de input = mesmo snapshot final.
  - testes de "golden" de balanceamento (ex.: script de bot simples sobrevive até a onda X com seed Y), marcados como lentos.
- **Testes puros dentro do app, sem browser** (mesmo estilo, Vitest): parser do terminal (comandos, aliases, estado do vim, "command not found"), detector de gestos (sequência de swipes/teclas → Konami; 7 toques em 2,5s; long-press), catálogo/detector de segredos (desbloqueia uma vez), storage de progresso (migração de `push_v2`, dado corrompido → default).
- **Smoke E2E (Playwright), mínimo:** abrir `/`, ver menu e Canvas; clicar "jogar"; ver HUD; abrir terminal com `` ` ``, rodar `help`. Não testa visual do 3D nem regras (isso é do core).
- **Não testar:** cena R3F, shaders, partículas, valores de cor, áudio. Validação visual é manual (modo dev + checklist de comparação com o protótipo).
- **Prior art:** projeto novo, não existe teste anterior. O protótipo HTML funciona como **oráculo manual**: durante o port, rodar lado a lado e comparar a sensação das ondas 1–10.

## Out of Scope

- Multiplayer, ranking online, contas e backend (o core puro deixa isso possível depois, mas não entra agora).
- Validação de score no servidor / anti-cheat.
- Modelos GLTF, animações esqueléticas e arte final; esta etapa usa primitivas procedurais com o visual do protótipo.
- Música de fundo e samples de áudio (só síntese).
- Lojas, upgrades permanentes, skins, fases com mapas diferentes (as moedas já existem; o que fazer com elas fica para depois).
- i18n além de pt-BR.
- PWA/offline, app nativo (Capacitor etc.).
- Pipeline de deploy (fica para uma issue separada; o app é estático/client-side e cabe em Cloudflare Pages/Workers, que é o padrão já usado em outros projetos).
- Qualquer elemento visual, nome, personagem ou layout de fase copiado do Mob Control.

## Further Notes

- **Ordem sugerida de entrega (fatias verticais):**
  1. Monorepo + app TanStack vazio + core com loop, ondas e horda andando; render 3D mínimo (estrada + instâncias).
  2. Canhão, input (hold/drag/teclado), tiro, colisão, vidas, game over, telas de menu/fim.
  3. Fileira lateral, paredes, flanco, torre.
  4. Gigantes, chefão, guardas, carga e gigante aliado, banner, HUD completo.
  5. Áudio, partículas, shake, juice visual, persistência.
  6. Terminal, poderes, segredos, modo dev.
  7. Passe de desempenho mobile (instancing, DPR adaptativo) e polimento visual.
- Esquisitices conhecidas do protótipo, **mantidas como estão no port e refinadas em iterações futuras** (o jogo segue sendo protótipo): (a) as variáveis chamam a tropa de `blues` mas ela é verde e no `git push --force` o texto diz "+40 azuis" (no código novo já se usa o termo `troop` do glossário; o texto da UI fica como está por enquanto); (b) o segredo 42 dispara quando a tropa é exatamente 42 em qualquer frame, então é fácil achar sem querer.
- O protótipo usa `Math.random` em tudo; no core isso vira o RNG com seed, o que pode mudar levemente a sensação. Calibrar comparando lado a lado.
- O teto de 1500 robôs + 900 de tropa é o principal risco de desempenho em mobile; validar a fatia 1 num Android intermediário antes de seguir.
- Não havia issue tracker configurado nesta pasta; este spec foi salvo como arquivo. Para publicar como issue com o label `ready-for-agent`, configurar o tracker (`/setup-matt-pocock-skills`) e reexecutar a publicação.
