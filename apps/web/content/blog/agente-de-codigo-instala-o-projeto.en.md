# The coding agent as the one who installs the project

Summary and meta description (142 characters): What changes when the coding agent types the first command of a project: how to connect a CLI through MCP, what to delegate and what stays yours.

Slug: /article/agente-de-codigo-instala-o-projeto
Publication date: 2026-11-27

## It starts with a first command

Picture this: you open the editor, describe the project you want and the coding agent answers with a command: `create` something. The one who typed the first command of the project wasn't you.

It looks like a detail, but it changes who a project creation tool has to please. Before, only people read `--help` and the README. Now an agent reads too, and it will follow what's written to the letter.

## What an agent needs from a CLI

An agent has no intuition. It depends on what the tool makes clear:

- **Explicit options.** If a choice only shows up after an interactive question, the agent needs another way to pass it.
- **Predictable results.** The same command, with the same options, produces the same project.
- **Readable output.** An error message that says what to do helps more than one that only says it failed.

These are the same qualities that help a tired person at six in the evening. The agent just makes their absence more visible.

## What MCP is, in one sentence

MCP (Model Context Protocol) is an open protocol that connects an agent to tools and data. Instead of the agent guessing how to use a CLI, the CLI introduces itself to the agent and says what it can do.

## Connecting a CLI to the agent

In Kubo's case, a public CLI for people who write TypeScript, the quick start documentation has the command to connect the agent through MCP:

```bash
npx -y add-mcp@latest "npx -y kubojs@latest mcp"
```

After connecting, the agent can assemble the stack from what you ask. The philosophy the documentation describes is to assemble only what the project needs, which fits an agent well: it gets a short list of choices instead of a boilerplate to prune.

## What you delegate and what stays yours

Delegating the setup isn't delegating the decision. A split that works:

| Delegate to the agent                       | Keep deciding                                                         |
| ------------------------------------------- | --------------------------------------------------------------------- |
| Running the command and passing the options | Which pieces go in: frontend, backend, database, ORM, auth and deploy |
| Assembling the initial structure            | Whether the project needs each piece                                  |
| Fixing an install error                     | Where the project will be published                                   |

The question for each row is the same: if the agent gets this wrong, is the cost small or large? Assembling is cheap to redo. Choosing the stack isn't.

## Care when letting an agent install

- **Review what it chose.** Without a clear instruction, it tends to pick whatever shows up most, not what suits your project.
- **State the choices in the request.** "Set up a project" produces a guess. "Set up a project with these six pieces" produces what you wanted.
- **Read the command before approving.** An agent that runs commands needs a human who looks at what is being executed.
- **Don't put secrets in the request.** Keys and passwords don't belong in the conversation.
- **Keep the final command.** If the agent assembled the project, the command it ran is the record of what was chosen. Save it.

## Checklist

- Does the request to the agent list the pieces of the stack?
- Did I read the command before it ran?
- Is the final command saved, so someone else can repeat it?
- Is there any secret in the conversation that shouldn't be there?
- Can I explain why each piece went in?

## Wrapping up

The agent that installs the project doesn't replace choosing the stack. It speeds up the mechanical step and leaves the human step more exposed: what goes in is for you to decide. A good CLI helps with that, because it talks to the person and to the agent the same way: with clear options and a predictable result.

## Keep reading

- [Choosing a stack: decide out loud before you install](https://albuquerquesz.com/article/escolha-de-stack-explicita)
- [When to use Zustand: a criterion for deciding before you install](https://albuquerquesz.com/article/quando-usar-zustand)
