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
  "#E86F5D",
  "#F08A4B",
  "#E08A2E",
  "#C49314",
  "#FFF7D6",
  "#F2EDE0",
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
