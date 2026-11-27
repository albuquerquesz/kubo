# O agente de código como quem instala o projeto

Meta description (147 caracteres): O que muda quando o agente de código digita o primeiro comando do projeto: como conectar uma CLI por MCP, o que delegar e o que continua sendo seu.

Slug: /article/agente-de-codigo-instala-o-projeto
Data de publicação: 2026-11-27

## Tudo começa com um primeiro comando

Imagina que você abre o editor, descreve o projeto que quer e o agente de código responde com um comando: `create` alguma coisa. Quem digitou o primeiro comando do projeto não foi você.

Isso parece um detalhe, mas muda quem a ferramenta de criar projeto precisa agradar. Antes, só pessoas liam o `--help` e o README. Agora, um agente também lê, e ele vai seguir o que estiver escrito ao pé da letra.

## O que um agente precisa de uma CLI

Um agente não tem intuição. Ele depende do que a ferramenta deixa claro:

- **Opções explícitas.** Se uma escolha só aparece depois de uma pergunta interativa, ele precisa conseguir passá-la de outro jeito.
- **Resultado previsível.** O mesmo comando, com as mesmas opções, gera o mesmo projeto.
- **Saída legível.** Uma mensagem de erro que diz o que fazer ajuda mais do que uma que só diz que falhou.

São as mesmas qualidades que ajudam uma pessoa cansada às seis da tarde. O agente só deixa a falta delas mais visível.

## O que é o MCP, em uma frase

O MCP (Model Context Protocol) é um protocolo aberto que liga um agente a ferramentas e dados. Em vez de o agente adivinhar como usar uma CLI, a CLI se apresenta ao agente e diz o que consegue fazer.

## Conectando uma CLI ao agente

No caso do Kubo, uma CLI pública para quem escreve TypeScript, a documentação de início rápido traz o comando para conectar o agente pelo MCP:

```bash
npx -y add-mcp@latest "npx -y kubojs@latest mcp"
```

Depois da conexão, o agente consegue montar a stack a partir do que você pedir. A filosofia que a documentação descreve é montar só o que o projeto precisa, o que combina bem com um agente: ele recebe uma lista curta de escolhas, em vez de um boilerplate para podar.

## O que você delega e o que continua sendo seu

Delegar a montagem não é delegar a decisão. Uma divisão que funciona:

| Delegue ao agente                  | Continue decidindo                                               |
| ---------------------------------- | ---------------------------------------------------------------- |
| Rodar o comando e passar as opções | Quais peças entram: frontend, backend, banco, ORM, auth e deploy |
| Montar a estrutura inicial         | Se o projeto precisa de cada peça                                |
| Corrigir um erro de instalação     | Onde o projeto vai ser publicado                                 |

A pergunta de cada linha é a mesma: se o agente errar aqui, o custo é pequeno ou grande? Montar é barato de refazer. Escolher a stack, não.

## Cuidados ao deixar um agente instalar

- **Revisar o que ele escolheu.** Sem uma instrução clara, ele tende a escolher o que aparece com mais frequência, e não o que serve ao seu projeto.
- **Dizer as escolhas no pedido.** "Monte um projeto" gera um palpite. "Monte um projeto com estas seis peças" gera o que você queria.
- **Ler o comando antes de aprovar.** Um agente que roda comandos precisa de um humano que olha o que está sendo executado.
- **Não passar segredos no pedido.** Chaves e senhas não entram na conversa.
- **Guardar o comando final.** Se o agente montou o projeto, o comando que ele rodou é o registro do que foi escolhido. Salve-o.

## Checklist

- O pedido ao agente lista as peças da stack?
- Eu li o comando antes de ele rodar?
- O comando final está salvo, para outra pessoa repetir?
- Há algum segredo na conversa que não deveria estar?
- Eu consigo explicar por que cada peça entrou?

## Fechando

O agente que instala o projeto não substitui a escolha da stack. Ele acelera o passo mecânico e deixa o passo humano mais exposto: sobra para você decidir o que entra. Uma boa CLI ajuda nisso, porque conversa com a pessoa e com o agente do mesmo jeito: com opções claras e resultado previsível.

## Para ler mais

- [Escolha de stack: decida em voz alta antes de instalar](https://albuquerquesz.com/article/escolha-de-stack-explicita)
- [Quando usar Zustand: um critério para decidir antes de instalar](https://albuquerquesz.com/article/quando-usar-zustand)
