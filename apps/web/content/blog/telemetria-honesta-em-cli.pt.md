# Telemetria honesta em ferramenta de dev: meça o que ajuda, não o que expõe

Meta description (148 caracteres): O que uma CLI pode medir sem guardar caminho, nome de projeto nem IP, como desligar a telemetria e como explicar tudo isso em duas frases.

Slug: /article/telemetria-honesta-em-cli
Data de publicação: 2026-11-27

## Tudo começa com uma pergunta no terminal

Imagina que você roda um comando de uma ferramenta nova. Ele faz o que prometeu, o terminal fica quieto e você segue o dia. O que você não sabe é se aquele comando mandou alguma coisa para algum lugar.

Para quem escreve a ferramenta, a tentação é a mesma há anos: medir o máximo possível, por via das dúvidas. Para quem usa, a reação é desligar e desconfiar. A telemetria honesta fica no meio, e ela começa por uma pergunta: o que eu preciso saber para melhorar isso?

## O que vale a pena medir

Uma ferramenta que cria projetos precisa saber poucas coisas para melhorar:

- quais opções as pessoas escolhem, para saber o que priorizar;
- se o comando terminou bem ou falhou, para achar os erros;
- de onde veio a instalação, para saber por onde a ferramenta chega;
- como contar uma instalação sem saber quem é a pessoa, com um identificador aleatório.

Repare no padrão: tudo isso é sobre a ferramenta, não sobre a pessoa nem sobre o projeto dela.

## O que não vale a pena medir

A lista do que fica de fora importa mais do que a lista do que entra:

- **O nome do projeto.** Ele pode revelar um cliente ou um produto ainda não lançado.
- **O caminho dos arquivos.** Ele costuma carregar o nome de usuário da máquina e a estrutura de pastas.
- **O conteúdo.** O código e os arquivos do projeto não são da ferramenta.
- **Segredos.** Variáveis de ambiente e chaves nunca entram, nem por acidente.
- **O IP.** Ele identifica quem usa e a rede onde a pessoa está.

Se um dado permite descobrir quem é a pessoa ou o que ela está construindo, a pergunta "preciso disso para melhorar a ferramenta?" quase sempre tem resposta não.

## Um exemplo concreto

O Kubo, uma CLI pública para montar projetos em TypeScript, documenta a telemetria do create em uma página própria. Pelo que está lá, o comando envia as escolhas da stack, o resultado, a origem e um install_id aleatório. Não envia nome do projeto, caminho, conteúdo, segredo nem IP.

O que torna isso honesto não é só a lista curta. É que ela está escrita onde qualquer pessoa pode ler, e que dá para desligar.

## O jeito de desligar

Uma telemetria só é honesta se existir uma saída simples. No Kubo, basta definir uma variável de ambiente antes de rodar o comando:

```bash
KUBO_TELEMETRY_DISABLED=1 bun create kubojs@latest
```

A variável `DO_NOT_TRACK=1`, uma convenção usada por várias ferramentas, também desliga. Quem escolheu não participar não precisa procurar um menu escondido.

## O teste das duas frases

Um teste simples para saber se a sua telemetria é defensável: explique, em duas frases, o que ela coleta e o que ela não coleta. Se a explicação precisa de um parágrafo cheio de ressalvas, a coleta está grande demais.

Para o exemplo acima, seria algo assim: "Mandamos as escolhas da stack, o resultado e um identificador aleatório. Não mandamos nome, caminho, conteúdo, segredo nem IP."

## Armadilhas comuns

- **Coletar por via das dúvidas.** Dado que você não sabe usar hoje é um risco amanhã.
- **Derivar o identificador da máquina.** Um identificador gerado a partir do computador deixa de ser aleatório. Gere um valor novo e sem relação com a pessoa.
- **Ligar por padrão sem avisar.** Se a coleta é discreta, a documentação precisa ser clara.
- **Esconder a saída.** Se desligar exige ler o código-fonte, na prática não dá para desligar.
- **Prometer mais do que a ferramenta faz.** Se a documentação diz "não coletamos X", isso precisa ser verdade a cada versão.

## Checklist

- Cada dado coletado responde "preciso disso para melhorar a ferramenta"?
- A lista do que não é coletado está escrita?
- O identificador é aleatório e sem relação com a pessoa?
- Existe uma forma simples e documentada de desligar?
- Eu consigo explicar tudo em duas frases?

## Fechando

Telemetria não precisa ser um assunto de bastidor. Uma ferramenta que diz o que mede, o que não mede e como desligar ganha uma coisa que dado nenhum compra: a confiança de quem a usa. E ela costuma medir melhor, porque mede menos.

## Para ler mais

- [Você provavelmente não precisa de useEffect](https://albuquerquesz.com/article/voce-nao-precisa-de-useeffect)
- [Arquitetura por feature: organize o código por assunto, não por camada](https://albuquerquesz.com/article/arquitetura-por-feature)
