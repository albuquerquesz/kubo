# Choosing a stack: decide out loud before you install

Summary and meta description (146 characters): How to pick frontend, backend, database, ORM, auth and deploy on purpose, without inheriting boilerplate, and turn the choice into a command your team repeats.

Slug: /article/escolha-de-stack-explicita
Publication date: 2026-11-27

## It starts with the last project

Picture this: you're starting a new project. The fastest way is to open the previous one, copy the structure and delete what you don't need.

It works. In an hour you have a screen running. The problem shows up a few months later, when someone asks why auth is that one, why the database is this one and why deploy is set up this way. Nobody remembers, because nobody chose. The stack was inherited.

## What choosing a stack on purpose means

Choosing on purpose means answering one short question for each piece. These are the six decisions almost every web project has to make:

| Decision | Question it answers                                 |
| -------- | --------------------------------------------------- |
| Frontend | How does the person use the product?                |
| Backend  | Where does the business logic live?                 |
| Database | What kind of data do I store and how do I query it? |
| ORM      | How does the code talk to the database?             |
| Auth     | How do I know who the person is?                    |
| Deploy   | Where and how does this go live?                    |

If you can answer all six in one sentence each, you chose. If any answer is "because the other project used it", you inherited.

## Why boilerplate hides decisions

A boilerplate is a set of decisions someone else made, in another context, for another problem. It doesn't come with the explanation.

The cost doesn't show up when you copy. It shows up later, in two ways. First, you carry things the project doesn't use and you have to decide whether you can remove them. Second, when something breaks, you debug a decision that isn't yours.

The rule that helps is simple: assemble only what you need. If the project has no login, it doesn't need auth. If it's a static site, it may not even need a backend.

## Write the choice down, not only the code

A decision that lives only in code disappears when the person who made it leaves the project. It's worth keeping a short file with what was chosen and the reason in one line:

```txt
frontend: Next.js, because the team already uses React
database: Postgres, because the data is relational
orm: Drizzle, because we want the SQL to stay visible
auth: external provider, so we don't store passwords
deploy: managed platform, so we don't run servers
```

These reasons are examples, not a recipe. The point is that every line has a why, and whoever arrives later can disagree with a line instead of guessing.

## From the choice to a command

The last step is the one that gets lost the most: turning the choice into something repeatable. If the team has to follow a twenty step document to set up the project, each person will set it up a little differently.

A command solves that. The same choice, run by different people, produces the same project. That's what Kubo does, a public CLI for people who write TypeScript: you choose frontend, backend, database, ORM, auth and deploy, and the command assembles only that. The recommended command is:

```bash
bun create kubojs@latest
```

There are also `pnpm create kubojs@latest` and `npx create-kubojs@latest`.

## Common traps

- **Choosing by trend.** The stack of the week isn't a decision, it's a guess. Answer the table's question before looking at what's hot.
- **Deciding everything before knowing the problem.** If you don't know yet whether there will be a login, you don't need to choose auth now. Assemble what you already know you need.
- **Redoing the choice on every project.** If your projects have the same profile, the same choice fits. Save your energy for where the project is different.
- **Documenting without a command.** A nice text nobody runs gets old. Prefer the command and keep the text for the why.

## Checklist

- Can I answer the six questions in the table in one sentence each?
- Is any answer just "because the other project used it"?
- Is there something in the project I never used and still carry?
- Is the choice written down with the reason?
- Can someone else repeat the setup with one command?

## Wrapping up

Choosing the stack out loud doesn't make the project better on its own. It makes the project yours. When something breaks, you know what was decided and why, and so does whoever arrives later. The rest is tooling detail.

## Keep reading

- [Feature architecture: organize your code by topic, not by layer](https://albuquerquesz.com/article/arquitetura-por-feature)
- [When to use Zustand: a criterion for deciding before you install](https://albuquerquesz.com/article/quando-usar-zustand)
