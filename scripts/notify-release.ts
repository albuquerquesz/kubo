import { readFile } from "node:fs/promises";

import { createDiscordClient } from "../packages/discord/src/index.ts";

const MAX_EMBED_DESCRIPTION_LENGTH = 4_096;

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function truncateDescription(value: string): string {
  if (value.length <= MAX_EMBED_DESCRIPTION_LENGTH) {
    return value;
  }

  const suffix = "\n\n… changelog truncated";
  return `${value.slice(0, MAX_EMBED_DESCRIPTION_LENGTH - suffix.length)}${suffix}`;
}

async function main(): Promise<void> {
  const version = requiredEnvironment("RELEASE_VERSION");
  const releaseUrl = requiredEnvironment("RELEASE_URL");
  const changelogFile = process.env.RELEASE_NOTES_FILE?.trim();
  const changelog = changelogFile
    ? (await readFile(changelogFile, "utf8")).trim()
    : process.env.RELEASE_NOTES?.trim() || "A new KuboJS release is available.";

  const discord = createDiscordClient();
  await discord.sendMessage({
    embeds: [
      {
        title: `KuboJS ${version} released`,
        url: releaseUrl,
        description: truncateDescription(changelog),
        color: 0xc49314,
        timestamp: new Date().toISOString(),
        footer: { text: "KuboJS release" },
      },
    ],
  });

  console.log(`Discord release notification sent for ${version}`);
}

await main();
