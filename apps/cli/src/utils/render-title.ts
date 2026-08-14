import gradient from "gradient-string";

import { renderAsciiTitle } from "./ascii-handler";

const catppuccinTheme = {
  pink: "#F5C2E7",
  mauve: "#CBA6F7",
  red: "#F38BA8",
  maroon: "#E78284",
  peach: "#FAB387",
  yellow: "#F9E2AF",
  green: "#A6E3A1",
  teal: "#94E2D5",
  sky: "#89DCEB",
  sapphire: "#74C7EC",
  lavender: "#B4BEFE",
};

export const renderTitle = () => {
  const terminalWidth = process.stdout.columns || 80;
  const title = renderAsciiTitle();
  const titleLines = title.split("\n");
  const titleWidth = Math.max(...titleLines.map((line) => line.length));

  if (terminalWidth < titleWidth) {
    const simplifiedTitle = `I dont know`;
    console.log(gradient(Object.values(catppuccinTheme)).multiline(simplifiedTitle));
  } else {
    console.log(gradient(Object.values(catppuccinTheme)).multiline(title));
  }
};
