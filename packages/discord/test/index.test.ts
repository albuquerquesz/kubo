import { describe, expect, test } from "bun:test";

import {
  createDiscordClient,
  DiscordApiError,
  DiscordConfigurationError,
  DiscordClient,
  discordConfigFromEnv,
} from "../src";

function response(body: unknown, status = 200): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

describe("@kubojs/discord", () => {
  test("loads the client configuration from environment variables", () => {
    expect(
      discordConfigFromEnv({
        DISCORD_BOT_TOKEN: " bot-token ",
        DISCORD_CHANNEL_ID: "channel-id",
        DISCORD_GUILD_ID: "guild-id",
      }),
    ).toEqual({
      botToken: "bot-token",
      channelId: "channel-id",
      guildId: "guild-id",
    });
  });

  test("requires the bot token and channel ID", () => {
    expect(() => createDiscordClient({})).toThrow(DiscordConfigurationError);
  });

  test("verifies the guild before sending and posts a message to the channel", async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const client = new DiscordClient({
      botToken: "bot-token",
      channelId: "channel-id",
      guildId: "guild-id",
      apiBaseUrl: "https://discord.test/api/v10",
      fetch: async (input, init) => {
        requests.push({ url: String(input), init });
        return requests.length === 1
          ? response({ guild_id: "guild-id" })
          : response({ id: "message-id" });
      },
    });

    await client.sendMessage({ content: "Release publicada" });

    expect(requests).toHaveLength(2);
    expect(requests[0]?.url).toBe("https://discord.test/api/v10/channels/channel-id");
    expect(requests[1]?.url).toBe("https://discord.test/api/v10/channels/channel-id/messages");
    expect(requests[1]?.init?.headers).toMatchObject({
      Authorization: "Bot bot-token",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(requests[1]?.init?.body))).toEqual({
      content: "Release publicada",
      embeds: undefined,
      allowed_mentions: undefined,
    });
  });

  test("rejects a channel from another guild", async () => {
    const client = new DiscordClient({
      botToken: "bot-token",
      channelId: "channel-id",
      guildId: "expected-guild-id",
      fetch: async () => response({ guild_id: "other-guild-id" }),
    });

    await expect(client.sendMessage({ content: "Não deve enviar" })).rejects.toThrow(
      DiscordConfigurationError,
    );
  });

  test("surfaces Discord API errors without exposing the bot token", async () => {
    const client = new DiscordClient({
      botToken: "secret-token",
      channelId: "channel-id",
      fetch: async () => response({ message: "Missing Permissions" }, 403),
    });

    const error = await client
      .sendMessage({ content: "Release publicada" })
      .catch((value) => value);

    expect(error).toBeInstanceOf(DiscordApiError);
    expect(error.status).toBe(403);
    expect(error.details).toEqual({ message: "Missing Permissions" });
    expect(error.message).not.toContain("secret-token");
  });

  test("supports embeds without message content", async () => {
    let requestBody = "";
    const client = new DiscordClient({
      botToken: "bot-token",
      channelId: "channel-id",
      fetch: async (_input, init) => {
        requestBody = String(init?.body);
        return response({ id: "message-id" });
      },
    });

    await client.sendMessage({ embeds: [{ title: "KuboJS 1.0.0", color: 0xc49314 }] });

    expect(JSON.parse(requestBody).embeds).toEqual([{ title: "KuboJS 1.0.0", color: 0xc49314 }]);
  });
});
