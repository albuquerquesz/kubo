# Escolha de stack: decida em voz alta antes de instalar

Meta description (150 caracteres): Como escolher frontend, backend, banco, ORM, auth e deploy de propósito, sem herdar boilerplate, e transformar a escolha em um comando que o time repete.

Slug: /article/escolha-de-stack-explicita
Data de publicação: 2026-11-27

## Tudo começa pelo projeto anterior

Imagina que você vai começar um projeto novo. O jeito mais rápido é abrir o projeto anterior, copiar a estrutura e apagar o que não serve.

Funciona. Em uma hora você tem uma tela rodando. O problema aparece uns meses depois, quando alguém pergunta por que o auth é aquele, por que o banco é esse e por que o deploy está configurado assim. Ninguém lembra, porque ninguém escolheu. A stack foi herdada.

## O que é escolher a stack de propósito

Escolher de propósito é responder, para cada peça, uma pergunta curta. São seis decisões que quase todo projeto web precisa tomar:

| Decisão  | Pergunta que ela responde                   |
| -------- | ------------------------------------------- |
| Frontend | Como a pessoa usa o produto?                |
| Backend  | Onde mora a regra de negócio?               |
| Banco    | Que tipo de dado eu guardo e como consulto? |
| ORM      | Como o código conversa com o banco?         |
| Auth     | Como eu sei quem é a pessoa?                |
| Deploy   | Onde e como isso vai para o ar?             |

Se você consegue responder as seis em uma frase cada, você escolheu. Se alguma resposta é "porque o outro projeto usava", você herdou.

## Por que o boilerplate esconde decisões

Um boilerplate é um conjunto de decisões que outra pessoa tomou, em outro contexto, para outro problema. Ele não vem com a explicação.

O custo não aparece na hora de copiar. Aparece depois, de dois jeitos. Primeiro, você carrega coisa que o projeto não usa e precisa decidir se pode remover. Segundo, quando algo quebra, você debuga uma decisão que não é sua.

A regra que ajuda é simples: monte só o que precisa. Se o projeto não tem login, ele não precisa de auth. Se é um site estático, talvez nem precise de backend.

## Escreva a escolha, não só o código

Uma decisão que existe só no código some quando a pessoa que a tomou sai do projeto. Vale registrar, em um arquivo curto, o que foi escolhido e o motivo em uma linha:

```txt
frontend: Next.js, porque o time já usa React
banco: Postgres, porque os dados são relacionais
orm: Drizzle, porque queremos o SQL visível
auth: provedor externo, para não manter senha
deploy: plataforma gerenciada, para não manter servidor
```

Esses motivos são exemplos, não uma receita. O ponto é que cada linha tem um porquê, e quem chega depois consegue discordar de uma linha em vez de ter que adivinhar.

## Da escolha ao comando

O último passo é o que mais se perde: transformar a escolha em algo que se repete. Se o time precisa seguir um documento de vinte passos para montar o projeto, cada pessoa vai montar um pouco diferente.

Um comando resolve isso. A mesma escolha, rodada por pessoas diferentes, gera o mesmo projeto. É o que o Kubo, uma CLI pública para quem escreve TypeScript, faz: você escolhe frontend, backend, banco, ORM, auth e deploy, e o comando monta só isso. O comando recomendado é:

```bash
bun create kubojs@latest
```

Também existem as versões `pnpm create kubojs@latest` e `npx create-kubojs@latest`.

## Armadilhas comuns

- **Escolher por moda.** A stack da semana não é uma decisão, é um palpite. Responda a pergunta da tabela antes de olhar o que está em alta.
- **Decidir tudo antes de conhecer o problema.** Se você ainda não sabe se vai ter login, não precisa escolher auth agora. Monte o que já sabe que precisa.
- **Refazer a escolha em todo projeto.** Se os seus projetos têm o mesmo perfil, a mesma escolha serve. Poupe a energia para onde o projeto é diferente.
- **Documentar sem comando.** Um texto bonito que ninguém roda envelhece. Prefira o comando e deixe o texto para o porquê.

## Checklist

- Eu consigo responder as seis perguntas da tabela em uma frase?
- Alguma resposta é só "porque o outro projeto usava"?
- Existe algo no projeto que eu nunca usei e ainda carrego?
- A escolha está registrada com o motivo?
- Outra pessoa consegue repetir a montagem com um comando?

## Fechando

Escolher a stack em voz alta não deixa o projeto melhor sozinho. Deixa o projeto seu. Quando algo quebra, você sabe o que foi decidido e por quê, e quem chega depois também. O resto é detalhe de ferramenta.

## Para ler mais

- [Arquitetura por feature: organize o código por assunto, não por camada](https://albuquerquesz.com/article/arquitetura-por-feature)
- [Quando usar Zustand: um critério para decidir antes de instalar](https://albuquerquesz.com/article/quando-usar-zustand)
