import gradient from "gradient-string";

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

  if (terminalWidth < titleWidth) {
    const simplifiedTitle = `Kubo`;
    console.log(gradient([...KUBO_TITLE_COLORS]).multiline(simplifiedTitle));
  } else {
    console.log(gradient([...KUBO_TITLE_COLORS]).multiline(TITLE_TEXT));
  }
};
