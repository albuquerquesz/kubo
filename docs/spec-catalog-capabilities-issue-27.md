# Spec: Catálogo de capabilities (#27)

## Status

Implemented on `catalog/issue-27-capabilities`. Parent: [#26](https://github.com/albuquerquesz/kubo/issues/26). Issue: [#27](https://github.com/albuquerquesz/kubo/issues/27).

## Date

2026-09-11

## Goal

Congelar o contrato de **communication**, **observability** e **backend kinds** no mesmo estilo de payments (`PAYMENT_PROVIDER_CAPABILITIES` + `getPaymentCompatibilityIssue` em `@kubojs/types`). CLI e Stack Builder **só traduzem issue → mensagem**. Sem unificar `StackState`, `evaluate()`, oracle ou templates.

## Non-goals

- Unificar `self-next` / `ProjectConfig` (#28)
- Motor `evaluate(config)` único (#29)
- Oracle da matrix derivado do catálogo (#30)
- Geração por catálogo / observability sem regex (#31)
- Create Path e Add Path no mesmo núcleo (#32)
- Mudança visível no **Create Path** (mesmas rejeições, mesmas mensagens de produto)

## Padrão a copiar

`packages/types/src/payments.ts`:

- tabela `as const` de capabilities por provider
- `getXCompatibilityIssue(input) -> issue | null`
- `normalizeX` no pacote de types
- CLI/web mapeiam issue para copy

## Trechos a identificar

### Contrato (mover para cá)

| Área                    | Arquivo hoje                                                                                                          | Problema                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Payments (referência)   | `packages/types/src/payments.ts`                                                                                      | Já está certo                                                              |
| Communication           | `apps/cli/src/utils/compatibility-rules.ts` `validateCommunicationCompatibility`, `validateAraraRuntimeCompatibility` | `if (resend \| notifique \| arara)` e AraraHQ workers como função irmã     |
| NestJS API / AI         | `allowedApisForFrontends`, `isExampleAIAllowedForBackend`                                                             | string mágica `"nestjs"`                                                   |
| NestJS constraints      | `apps/cli/src/utils/config-validation.ts` `validateBackendConstraints`                                                | bloco `if (backend === "nestjs")` com api/auth/db/orm/ai/payments          |
| Observability normalize | `packages/template-generator/src/generator.ts` + `apps/cli/src/utils/config-processing.ts`                            | filtro local `getmonitor \| himetrica`; terceiro provider some no silêncio |
| Builder disable         | `apps/web/.../utils.ts` `getDisabledReason` communication                                                             | só Resend/Notifique; AraraHQ não entra                                     |

### Consumers (só traduzem)

| Superfície            | Função                                                    | Copy                     |
| --------------------- | --------------------------------------------------------- | ------------------------ |
| CLI create validation | `validateCommunicationCompatibility`                      | inglês, mensagens atuais |
| CLI create validation | `validateBackendConstraints` NestJS                       | inglês, mensagens atuais |
| CLI prompts           | `allowedApisForFrontends`, `isExampleAIAllowedForBackend` | filtro de opções         |
| Builder               | `getDisabledReason`                                       | português                |

## Modelo

### Communication

```ts
{
  resend:     { requiresBackend: true, supportsConvex: true, supportsWorkers: true },
  notifique:  { requiresBackend: true, supportsConvex: true, supportsWorkers: true },
  arara:      { requiresBackend: true, supportsConvex: true, supportsWorkers: false },
}
```

Issues:

- `requires-backend` — provider escolhido com `backend` ausente ou `"none"`
- `workers-unsupported` — `supportsWorkers: false` e (`runtime === "workers"` ou `serverDeploy === "cloudflare"`), **exceto** `backend === "convex"` (Node Action)

Mensagens CLI (inalteradas):

- `{Resend\|Notifique\|AraraHQ} communication requires a server backend. Please choose a backend or use '--communication none'.`
- `AraraHQ requires the official Node SDK and is not compatible with Edge/Workers runtimes. Use a Node/Bun server deployment or Convex Node Action.`

Mensagens builder:

- `{Resend\|Notifique\|AraraHQ} exige um backend com runtime de servidor`
- AraraHQ em workers/cloudflare: copy PT equivalente à CLI (hoje o builder não desabilita; este gap é aceite da issue)

### Observability

```ts
{
  getmonitor: { mounts: ["web-browser", "next-config", "react-error-boundary", "node-server"] },
  himetrica:  { mounts: ["web-browser"] },
}
```

`normalizeObservability` canônico em `@kubojs/types` (mesmo contrato de `normalizePayments`: `"none"` / `undefined` → `[]`, unique, rejeita provider desconhecido). Gerador e CLI deixam de ter cópia local.

Mounts são declaração para #31; este passo **não** muda templates.

### Backends

`kind: "convex" | "hosted-server" | "fullstack-self" | "none"`

| Backend                  | kind           | apis                    | examples.ai | restrições extra                                                            |
| ------------------------ | -------------- | ----------------------- | ----------- | --------------------------------------------------------------------------- |
| hono                     | hosted-server  | trpc, orpc, orval, none | true        | —                                                                           |
| express, fastify, elysia | hosted-server  | trpc, orpc, none        | true        | —                                                                           |
| nestjs                   | hosted-server  | none                    | false       | auth better-auth\|none; db none\|postgres; orm none\|prisma; payments false |
| convex                   | convex         | none                    | true        | owns runtime/db/api/serverDeploy                                            |
| self                     | fullstack-self | trpc, orpc, none        | true        | owns runtime + serverDeploy                                                 |
| none                     | none           | none                    | false       | owns runtime/db/api/serverDeploy                                            |

`getBackendCompatibilityIssue` reporta a primeira restrição violada (ordem atual do bloco NestJS): api → auth → database → orm → example-ai → payments.

`allowedApisForFrontends`: se `apis` é só `"none"`, retorna `["none"]` (NestJS deixa de ser identificador mágico). Filtro tRPC×Nuxt/Svelte/Solid/Astro permanece neste passo.

`isExampleAIAllowedForBackend`: `BACKEND_CAPABILITIES[backend].examples.ai`.

`isApiCompatibleWithBackend`: Orval só se `apis` inclui `"orval"` (hoje Hono). **Não** usar o allow-list completo aqui — NestJS+tRPC continua passando nesta função para a mensagem de NestJS disparar em `validateBackendConstraints` primeiro.

## Implementação

1. `packages/types/src/communication.ts`
2. `packages/types/src/observability.ts`
3. `packages/types/src/backends.ts`
4. Export em `packages/types/src/index.ts`
5. CLI `compatibility-rules.ts` + `config-validation.ts` consomem issues
6. Remover `normalizeObservability` local (gerador + `config-processing.ts`)
7. Builder `getDisabledReason` communication via `getCommunicationCompatibilityIssue`
8. Testes focados nas issues, não na forma da tabela

## Testes

### `@kubojs/types` (`packages/types/test/capabilities.test.ts`)

Cobre o **issue**, não a implementação:

- communication: none/undefined → null; resend sem backend → `requires-backend`; arara+workers → `workers-unsupported`; arara+convex+workers → null; resend+workers → null
- observability: `none`/`undefined` → `[]`; string única e array; duplicata; provider inválido lança
- backend: nestjs+trpc → `api-unsupported`; nestjs+none api → null; nestjs+clerk → `auth-unsupported`; nestjs+ai → `example-ai-unsupported`; hono+trpc → null; `examples.ai` false só nestjs/none

### CLI (mensagens de produto)

- communication sem backend: mensagem atual Resend/Notifique/AraraHQ
- arara+workers: mensagem atual de Node SDK
- nestjs+orval/trpc: `"NestJS currently supports no API layer yet"`
- `normalizeObservability` reexportado não filtra mais no gerador (import de types)

### Builder

- Resend/Notifique/AraraHQ com `backend: "none"` desabilitam
- AraraHQ + workers desabilita; Resend + workers não

## Aceite (checklist da issue)

- [x] Capabilities em `@kubojs/types`
- [x] CLI e `getDisabledReason` consomem issues tipadas
- [x] `normalizeObservability` some do gerador
- [x] NestJS não é string mágica em `allowedApisForFrontends` / `isExampleAIAllowedForBackend`
- [x] Create Path: mesmas rejeições e mensagens
- [x] Testes focados nas issues
