import gradient from "gradient-string";
import pc from "picocolors";

import { supportsTrueColor } from "./cli-colors";

export const TITLE_TEXT = `
██╗  ██╗██╗   ██╗██████╗  ██████╗
██║ ██╔╝██║   ██║██╔══██╗██╔═══██╗
█████╔╝ ██║   ██║██████╔╝██║   ██║
██╔═██╗ ██║   ██║██╔══██╗██║   ██║
██║  ██╗╚██████╔╝██████╔╝╚██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝
`;

export const KUBO_TITLE_COLORS = [
  "#D6A72B",
  "#F5D76E",
  "#E0B43E",
  "#E08A2E",
  "#E0B43E",
  "#E8A43A",
  "#E08A2E",
  "#E08A2E",
  "#C49314",
  "#E8C978",
  "#E5D3A5",
] as const;

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
