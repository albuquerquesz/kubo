import { KUBO_CLI_TITLE, KUBO_TITLE_COLORS } from "@kubojs/types";
import gradient from "gradient-string";
import pc from "picocolors";

import { supportsTrueColor } from "./cli-colors";

export const TITLE_TEXT = KUBO_CLI_TITLE;
export { KUBO_TITLE_COLORS };

export const renderTitle = () => {
  const terminalWidth = process.stdout.columns || 80;
  const titleLines = TITLE_TEXT.split("\n");
  const titleWidth = Math.max(...titleLines.map((line) => line.length));
  const title = terminalWidth < titleWidth ? "Kubo" : TITLE_TEXT;

  if (supportsTrueColor()) {
    console.log(gradient([...KUBO_TITLE_COLORS]).multiline(title));
    return;
  }

  console.log(pc.yellow(title));
};
