import { runDownloadsCommand } from "./commands/downloads";
import { createBtsCli } from "./index";
import { startBtsMcpServer } from "./mcp";

const [, , command, ...args] = process.argv;

if (command === "mcp") {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage: kubojs mcp

Start the kubojs MCP server over stdio.

This command is intended to be launched by an MCP client, for example:
  kubojs mcp`);
    process.exit(0);
  }

  await startBtsMcpServer();
} else if (command === "downloads") {
  try {
    await runDownloadsCommand(args);
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
} else {
  await createBtsCli().run();
}
