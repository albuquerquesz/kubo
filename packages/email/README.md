# @kubojs/email

Templates React Email e helpers de envio via Notifique para o KuboJS.

## Preview local

```bash
bun run --filter @kubojs/email preview
```

Abra `http://localhost:3001` para visualizar o template com dados de exemplo.

## Renderização

```bash
bun run --filter @kubojs/email render:example
```

O comando renderiza HTML e texto simples no terminal. A renderização não envia emails.

## Envio via Notifique

`ReleaseChangelogEmail` recebe dados tipados de release. Para enviar o mesmo conteúdo por email, use `mail`:

```ts
import { mail } from "@kubojs/email";

await mail({
  release,
  to: "updates@example.com",
  idempotencyKey: `release-${release.version}`,
});
```

O remetente precisa pertencer a um domínio verificado na Notifique. Configure:

```env
NOTIFIQUE_API_KEY=
NOTIFIQUE_FROM_EMAIL=
```

O envio usa `POST /v1/email/messages` e preserva HTML e texto simples.
