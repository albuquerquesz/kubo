const DISCORD_API_URL = "https://discord.com/api/v10";
const MAX_MESSAGE_CONTENT_LENGTH = 2_000;
const MAX_EMBEDS_PER_MESSAGE = 10;

type DiscordFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type DiscordEmbed = {
  title?: string;
  type?: "rich";
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  footer?: { text: string; icon_url?: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
};

export type DiscordMessage = {
  content?: string;
  embeds?: DiscordEmbed[];
  allowedMentions?: {
    parse?: Array<"roles" | "users" | "everyone">;
    users?: string[];
    roles?: string[];
  };
};

export type DiscordConfig = {
  botToken: string;
  channelId: string;
  guildId?: string;
  apiBaseUrl?: string;
  fetch?: DiscordFetch;
};

export type DiscordEnvironment = {
  DISCORD_BOT_TOKEN?: string;
  DISCORD_CHANNEL_ID?: string;
  DISCORD_GUILD_ID?: string;
};

function currentEnvironment(): DiscordEnvironment {
  return {
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
  };
}

export class DiscordConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiscordConfigurationError";
  }
}

export class DiscordApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(status: number, details: unknown) {
    super(`Discord API request failed with status ${status}`);
    this.name = "DiscordApiError";
    this.status = status;
    this.details = details;
  }
}

type DiscordChannel = { guild_id?: string };

function requiredEnv(name: keyof DiscordEnvironment, value: string | undefined): string {
  if (!value?.trim()) {
    throw new DiscordConfigurationError(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function validateMessage(message: DiscordMessage): void {
  if (!message.content?.trim() && !message.embeds?.length) {
    throw new DiscordConfigurationError("A Discord message needs content or at least one embed");
  }

  if (message.content && message.content.length > MAX_MESSAGE_CONTENT_LENGTH) {
    throw new DiscordConfigurationError(
      `Discord message content cannot exceed ${MAX_MESSAGE_CONTENT_LENGTH} characters`,
    );
  }

  if ((message.embeds?.length ?? 0) > MAX_EMBEDS_PER_MESSAGE) {
    throw new DiscordConfigurationError(
      `A Discord message cannot contain more than ${MAX_EMBEDS_PER_MESSAGE} embeds`,
    );
  }
}

function parseResponseBody(body: string): unknown {
  if (!body) return undefined;

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}

export function discordConfigFromEnv(
  environment: DiscordEnvironment = currentEnvironment(),
): DiscordConfig {
  return {
    botToken: requiredEnv("DISCORD_BOT_TOKEN", environment.DISCORD_BOT_TOKEN),
    channelId: requiredEnv("DISCORD_CHANNEL_ID", environment.DISCORD_CHANNEL_ID),
    guildId: environment.DISCORD_GUILD_ID?.trim() || undefined,
  };
}

export class DiscordClient {
  private readonly apiBaseUrl: string;
  private readonly fetchImpl: DiscordFetch;

  constructor(private readonly config: DiscordConfig) {
    if (!config.botToken.trim()) {
      throw new DiscordConfigurationError("Discord bot token cannot be empty");
    }

    if (!config.channelId.trim()) {
      throw new DiscordConfigurationError("Discord channel ID cannot be empty");
    }

    this.apiBaseUrl = (config.apiBaseUrl ?? DISCORD_API_URL).replace(/\/$/, "");
    this.fetchImpl = config.fetch ?? globalThis.fetch;
  }

  async sendMessage(message: DiscordMessage): Promise<void> {
    validateMessage(message);

    if (this.config.guildId) {
      await this.assertChannelBelongsToGuild();
    }

    await this.request(`/channels/${this.config.channelId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content: message.content,
        embeds: message.embeds,
        allowed_mentions: message.allowedMentions,
      }),
    });
  }

  private async assertChannelBelongsToGuild(): Promise<void> {
    const channel = await this.request<DiscordChannel>(`/channels/${this.config.channelId}`);

    if (channel.guild_id !== this.config.guildId) {
      throw new DiscordConfigurationError(
        `Discord channel ${this.config.channelId} does not belong to guild ${this.config.guildId}`,
      );
    }
  }

  private async request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchImpl(`${this.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bot ${this.config.botToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    const body = parseResponseBody(await response.text());
    if (!response.ok) {
      throw new DiscordApiError(response.status, body);
    }

    return body as T;
  }
}

export function createDiscordClient(
  environment: DiscordEnvironment = currentEnvironment(),
): DiscordClient {
  return new DiscordClient(discordConfigFromEnv(environment));
}

export type { DiscordClient as Discord };
