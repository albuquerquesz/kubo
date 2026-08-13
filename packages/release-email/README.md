# @kubojs/release-email

Template React Email para futuros anúncios de release do KuboJS.

## Preview local

```bash
bun run --filter @kubojs/release-email preview
```

Abra `http://localhost:3001` para visualizar o template com dados de exemplo.

## Renderização

```bash
bun run --filter @kubojs/release-email render:example
```

O comando renderiza HTML e texto simples no terminal. O pacote não envia emails e ainda não está conectado ao workflow de release.

## Uso futuro

`ReleaseChangelogEmail` recebe dados tipados de release. Quando o fluxo de email for ativado, o CI poderá buscar o changelog gerado, renderizar este componente e enviá-lo pelo SDK oficial do Resend.
