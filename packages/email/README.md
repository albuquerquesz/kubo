# @kubojs/email

Templates React Email e helpers de envio via [Resend](https://resend.com) para o KuboJS.

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

## Envio via Resend

`ReleaseChangelogEmail` recebe dados tipados de release. Para enviar o mesmo conteúdo por email, use `mail`:

```ts
import { mail } from "@kubojs/email";

await mail({
  release,
  to: "updates@example.com",
  idempotencyKey: `release-${release.version}`,
  // Opcional: adiciona `List-Unsubscribe` (RFC 8058) para descadastro em um clique.
  unsubscribeUrl: `${CONVEX_SITE_URL}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`,
});
```

O remetente precisa pertencer a um domínio verificado na Resend. O envio roda no Convex, então configure as variáveis lá:

```bash
cd packages/backend
bunx convex env set RESEND_API_KEY re_...
bunx convex env set EMAIL_FROM "Kubo <noreply@kubojs.dev>"
```

`mail` lança `EmailDeliveryError` quando a Resend rejeita o envio. O cliente é criado no primeiro envio, então importar o pacote não exige a chave.

## Newsletter

Os inscritos ficam na tabela `newsletterSubscribers` do Convex (`packages/backend/convex/newsletter.ts`): email normalizado, status, token de descadastro e datas. O formulário do site chama `api.newsletter.subscribe`, e `/newsletter/unsubscribe?token=...` no site do Convex cancela a inscrição (página de confirmação no GET, efetivação no POST e one-click).
