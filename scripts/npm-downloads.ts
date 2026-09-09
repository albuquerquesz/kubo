export {
  formatHelp,
  formatHumanReport,
  getAllTimeDownloads,
  getPackageCreatedDate,
  parseArguments,
  runDownloadsCommand,
  type DownloadQueryOptions,
  type DownloadReport,
} from "../apps/cli/src/commands/downloads";
import { runDownloadsCommand } from "../apps/cli/src/commands/downloads";

async function main(): Promise<void> {
  await runDownloadsCommand(process.argv.slice(2));
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
