# Honest telemetry in a dev tool: measure what helps, not what exposes

Summary and meta description (141 characters): What a CLI can measure without keeping paths, project names or IPs, how to switch telemetry off and how to explain all of it in two sentences.

Slug: /article/telemetria-honesta-em-cli
Publication date: 2026-11-27

## It starts with a question in the terminal

Picture this: you run a command from a new tool. It does what it promised, the terminal goes quiet and you move on with your day. What you don't know is whether that command sent something somewhere.

For the person building the tool, the temptation has been the same for years: measure as much as possible, just in case. For the person using it, the reaction is to turn it off and get suspicious. Honest telemetry sits in the middle, and it starts with one question: what do I need to know to make this better?

## What is worth measuring

A tool that creates projects needs to know only a few things to improve:

- which options people choose, to know what to prioritize;
- whether the command finished or failed, to find the errors;
- where the install came from, to know how the tool reaches people;
- how to count an install without knowing who the person is, with a random identifier.

Notice the pattern: all of it is about the tool, not about the person or their project.

## What is not worth measuring

The list of what stays out matters more than the list of what goes in:

- **The project name.** It can reveal a client or an unreleased product.
- **File paths.** They usually carry the machine's username and the folder structure.
- **Content.** The code and files of the project don't belong to the tool.
- **Secrets.** Environment variables and keys never go in, not even by accident.
- **The IP.** It identifies who uses the tool and the network they're on.

If a piece of data lets you find out who the person is or what they're building, the question "do I need this to improve the tool?" almost always has the answer no.

## A concrete example

Kubo, a public CLI for assembling TypeScript projects, documents the create command's telemetry on its own page. From what's there, the command sends the stack choices, the result, the origin and a random install_id. It doesn't send the project name, path, content, secrets or IP.

What makes it honest isn't only the short list. It's that the list is written where anyone can read it, and that it can be turned off.

## How to turn it off

Telemetry is only honest if there's a simple way out. In Kubo, you just set an environment variable before running the command:

```bash
KUBO_TELEMETRY_DISABLED=1 bun create kubojs@latest
```

The `DO_NOT_TRACK=1` variable, a convention many tools respect, also turns it off. Someone who chose not to take part shouldn't have to hunt for a hidden menu.

## The two sentence test

A simple test to know if your telemetry is defensible: explain, in two sentences, what it collects and what it doesn't. If the explanation needs a paragraph full of caveats, the collection is too big.

For the example above, it would be something like: "We send the stack choices, the result and a random identifier. We don't send names, paths, content, secrets or IPs."

## Common traps

- **Collecting just in case.** Data you don't know how to use today is a risk tomorrow.
- **Deriving the identifier from the machine.** An identifier generated from the computer stops being random. Generate a new value with no link to the person.
- **Turning it on by default without saying so.** If the collection is quiet, the documentation has to be clear.
- **Hiding the way out.** If switching it off means reading the source code, in practice you can't switch it off.
- **Promising more than the tool does.** If the docs say "we don't collect X", that has to be true in every version.

## Checklist

- Does each piece of collected data answer "do I need this to improve the tool"?
- Is the list of what is not collected written down?
- Is the identifier random and unrelated to the person?
- Is there a simple, documented way to turn it off?
- Can I explain everything in two sentences?

## Wrapping up

Telemetry doesn't have to be a backstage subject. A tool that says what it measures, what it doesn't and how to turn it off earns something no data can buy: the trust of the people using it. And it usually measures better, because it measures less.

## Keep reading

- [You probably don't need useEffect](https://albuquerquesz.com/article/voce-nao-precisa-de-useeffect)
- [Feature architecture: organize your code by topic, not by layer](https://albuquerquesz.com/article/arquitetura-por-feature)
