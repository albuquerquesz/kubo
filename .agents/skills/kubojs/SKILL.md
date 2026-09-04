---
name: kubojs
description: Practical guide for using KuboJS in projects created with KuboJS. Use when a repository has kubojs.jsonrc or when the user wants to create, inspect, or extend a KuboJS project with the CLI or MCP server.
---

# Use KuboJS

KuboJS helps choose a valid TypeScript stack, generate a project, and add supported tooling later.
This skill guides work inside a KuboJS project. It is not a guide for contributing to the KuboJS
repository or maintaining the CLI.

## Start here

1. Confirm the working directory.
2. Look for `kubojs.jsonrc`.
3. Read `kubojs.jsonrc`, `package.json`, and the generated `README.md` before changing structure or scripts.
4. Use the project's declared `packageManager` for commands (`npm`, `pnpm`, or `bun`).

If `kubojs.jsonrc` exists, treat it as the record of the selected stack. Do not guess the frontend,
backend, database, ORM, API, auth, deployment, or addon choices from folder names.

If it does not exist, do not run `kubojs add`. Confirm that the repository was created with KuboJS
or treat the request as a new project scaffold.

## Main commands

Run `kubojs --help` whenever command details may differ from this guide.

### Create a project

Interactive:

```bash
bun create kubojs@latest my-app
```

Direct CLI:

```bash
kubojs create my-app
```

Useful options:

- `--template mern|pern|t3|uniwind|none` for a predefined stack.
- `--dry-run` to validate and preview without writing files.
- `--frontend`, `--backend`, `--runtime`, `--database`, `--orm`, `--api`, and `--auth` for stack choices.
- `--addons`, `--examples`, and `--testing` for optional project capabilities.
- `--package-manager npm|pnpm|bun` to choose the package manager.
- `--install` to install dependencies during creation; omit it when the environment should stay untouched.

For automation, use `create-json` with a complete JSON payload:

```bash
kubojs create-json --input '{"projectName":"my-app", "frontend":["next"]}'
```

Use `kubojs schema --name createInput` first. The example above is abbreviated and is not a valid
creation payload by itself.

### Inspect available choices

```bash
kubojs schema
kubojs schema --name createInput
kubojs schema --name addInput
```

Use schema output as the authority for current choices and required fields. Do not rely on a copied
list when the CLI or MCP server can provide it.

### Add capabilities to an existing project

```bash
kubojs add --addons pwa
kubojs add --testing vitest
kubojs add --addons turborepo --project-dir ../my-app
```

Use `--install` only when dependency installation is wanted:

```bash
kubojs add --addons pwa --install
```

For automation, use `add-json` with a payload validated against `kubojs schema --name addInput`.
Inspect the diff after adding anything. Preserve application code and custom configuration that
KuboJS did not generate.

### Open docs and Stack Builder

```bash
kubojs docs
kubojs builder
```

Use `docs` for product documentation and `builder` when choosing a stack visually before creating
it.

### Review project history

```bash
kubojs history
kubojs history --json
kubojs history --limit 20
```

Use history to recover the original creation context when `kubojs.jsonrc` or the README is unclear.

### Check version and help

```bash
kubojs --version
kubojs --help
kubojs create --help
kubojs add --help
```

## Agent workflow with MCP

When the agent can use MCP, connect the server with:

```bash
npx -y add-mcp@latest "npx -y kubojs@latest mcp"
```

Use tools in this order:

1. `bts_get_stack_guidance` when the requested stack is ambiguous.
2. `bts_get_schema` for current valid values and payload shapes.
3. `bts_plan_project` before creating a new project.
4. `bts_create_project` only after the plan matches the user's intent.
5. `bts_plan_addons` before changing an existing project.
6. `bts_add_addons` only after the addon plan is accepted.

Creation and addon payloads must be explicit. Use `none`, empty arrays, and boolean values instead
of leaving stack choices implicit. Prefer `install: false` for MCP creation, then run the project's
install command separately in a terminal.

## Choosing the right path

- New project: use `create` or the MCP plan/create flow.
- Existing KuboJS project, new tooling: use `add` or the MCP plan/add flow.
- Unsure what the project contains: read `kubojs.jsonrc`, `package.json`, and `README.md`; then use `schema`.
- Unsure which stack combination is valid: use `bts_get_stack_guidance` and `bts_get_schema`.
- Need ordinary feature code: work in the generated app using its existing conventions; KuboJS does not replace normal application development.

## Safety rules

- Never use `--yolo` unless the user explicitly accepts bypassing validation and compatibility checks.
- Never add addons, apps, providers, or deployment targets the user did not request.
- Check for conflicting task runners and other compatibility errors before applying changes.
- Use generated README scripts and the project's `packageManager` instead of assuming Bun or a fixed folder layout.
- Report exact files changed, commands run, and any install or database setup still required.
