---
name: add-to-project
description: Add addons or features (PWA, Tauri, Electrobun, Biome/Oxlint, Husky/Lefthook, Turborepo/Vite+, MCP, Skills, or S3-compatible Storage) to an existing kubojs project. Use when the user wants to extend, enhance, or add tooling to a project that was created with kubojs.
metadata:
  priority: 7
  docs:
    - "https://kubojs.dev/docs"
  pathPatterns:
    - "kubojs.jsonrc"
---

# Add addons to an existing kubojs project

Use the kubojs MCP server to install addons into an existing project rather than wiring the tooling by hand.

## When this applies

The user already has a kubojs project (look for a `kubojs.jsonrc` config) and wants to add tooling or features — e.g. "add PWA support", "add a docs site", "switch to Biome", "add Turborepo", "wire up the MCP addon".

For brand-new projects, use the **scaffold-project** skill instead.

## Workflow

1. **Confirm the target project** is a kubojs project and identify its directory.
2. **Plan.** Call `bts_plan_addons` with the desired addon set (and any nested `addonOptions`). This is a dry run — review the planned changes with the user.
3. **Apply.** Only after the plan succeeds and matches intent, call `bts_add_addons`.
4. **Report** what changed and the follow-up commands to run.

## Available addons

`pwa`, `tauri`, `electrobun`, `biome`, `lefthook`, `husky`, `mcp`, `turborepo`, `vite-plus`, `oxlint`, `opentui`, `skills`, `s3-storage`.

Note: `turborepo` and `vite-plus` are mutually exclusive task runners. Use `bts_get_schema` for nested addon options such as OpenTUI templates.

## Rules

- Always `bts_plan_addons` before `bts_add_addons`.
- Don't add addons the user didn't ask for.
- Surface any conflicts (e.g. two task runners) from the plan before applying.
