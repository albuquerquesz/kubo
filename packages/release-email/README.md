# @kubojs/release-email

Template React Email e envio via Notifique para anúncios de release do KuboJS.

## Preview local

```bash
bun run --filter @kubojs/release-email preview
```

Abra `http://localhost:3001` para visualizar o template com dados de exemplo.

## Renderização

```bash
bun run --filter @kubojs/release-email render:example
```

O comando renderiza HTML e texto simples no terminal. A renderização não envia emails.

## Envio via Notifique

`ReleaseChangelogEmail` recebe dados tipados de release. Para enviar o mesmo conteúdo por email, use `sendReleaseChangelogEmail`:

```ts
import { sendReleaseChangelogEmail } from "@kubojs/release-email";

await sendReleaseChangelogEmail({
  release,
  to: "updates@example.com",
  // NOTIFIQUE_API_KEY e NOTIFIQUE_FROM_EMAIL também podem vir do ambiente.
  from: "KuboJS <updates@kubojs.dev>",
  idempotencyKey: `release-${release.version}`,
});
```

O remetente precisa pertencer a um domínio verificado na Notifique. Configure `NOTIFIQUE_API_KEY`, `NOTIFIQUE_FROM_EMAIL` e, opcionalmente, `NOTIFIQUE_BASE_URL`. O envio usa `POST /v1/email/messages` e preserva HTML e texto simples.
