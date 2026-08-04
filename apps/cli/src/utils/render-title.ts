import { kuboGold } from "./kubo-colors";

export const TITLE_TEXT = `
██╗  ██╗██╗   ██╗██████╗  ██████╗
██║ ██╔╝██║   ██║██╔══██╗██╔═══██╗
█████╔╝ ██║   ██║██████╔╝██║   ██║
██╔═██╗ ██║   ██║██╔══██╗██║   ██║
██║  ██╗╚██████╔╝██████╔╝╚██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝
`;

export const renderTitle = () => {
  const terminalWidth = process.stdout.columns || 80;
  const titleLines = TITLE_TEXT.split("\n");
  const titleWidth = Math.max(...titleLines.map((line) => line.length));

  if (terminalWidth < titleWidth) {
    const simplifiedTitle = `Kubo`;
    console.log(kuboGold(simplifiedTitle));
  } else {
    console.log(kuboGold(TITLE_TEXT));
  }
};
