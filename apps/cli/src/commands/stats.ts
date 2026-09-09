import { runDownloadsCommand } from "./downloads";

type StatsCommand = (arguments_: string[]) => Promise<void>;

const statsCommands: Record<string, StatsCommand> = {
  downloads: runDownloadsCommand,
};

export async function runStatsCommand(arguments_: string[]): Promise<void> {
  const [metric, ...metricArguments] = arguments_;

  if (!metric) {
    throw new Error("Usage: kubojs stats downloads [--json]");
  }

  const command = statsCommands[metric];
  if (!command) {
    throw new Error(`Unknown stats metric: ${metric}`);
  }

  await command(metricArguments);
}
