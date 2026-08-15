# @kubojs/discord

Cliente REST mínimo para enviar mensagens para um canal específico do Discord usando um bot.

## Variáveis de ambiente

Obrigatórias:

- `DISCORD_BOT_TOKEN`: token do bot criado no Discord Developer Portal.
- `DISCORD_CHANNEL_ID`: ID do canal que receberá as mensagens.

Recomendada:

- `DISCORD_GUILD_ID`: ID do servidor. Quando fornecida, o package consulta o canal antes de cada envio e falha se ele não pertencer ao servidor esperado.

## Configuração do Discord

1. Crie uma aplicação em [Discord Developer Portal](https://discord.com/developers/applications).
2. Na aba **Bot**, crie o bot e copie o token para `DISCORD_BOT_TOKEN`.
3. Convide o bot para o servidor com os escopos `bot` e `applications.commands`.
4. Conceda no canal alvo as permissões `View Channel` e `Send Messages`.
5. Ative o modo desenvolvedor no Discord e use **Copy ID** no servidor e no canal.

Para mensagens com embeds, conceda também `Embed Links`.

## Uso

```ts
import { createDiscordClient } from "@kubojs/discord";

const discord = createDiscordClient();

await discord.sendMessage({
  content: "Uma nova versão do KuboJS foi publicada.",
  embeds: [
    {
      title: "KuboJS 1.0.0",
      description: "Leia o changelog completo.",
      url: "https://kubojs.dev/updates/1.0.0",
      color: 0xc49314,
    },
  ],
});
```

O package usa `POST /channels/{channel.id}/messages` da API v10 do Discord e nunca expõe o token em erros.
