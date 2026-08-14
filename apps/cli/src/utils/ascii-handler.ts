import figlet from "figlet";

const ASCII_TITLE = "I DONT KNOW";
const ASCII_FONT = "ANSI Compact";

export const renderAsciiTitle = () =>
  figlet
    .textSync(ASCII_TITLE, {
      font: ASCII_FONT,
      horizontalLayout: "fitted",
    })
    .trim();
