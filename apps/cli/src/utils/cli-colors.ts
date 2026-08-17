import pc from "picocolors";

type CliColor = (text: string) => string;

const KUBO_COLORS = {
  signal: "#c49314",
  bright: "#d6a72b",
  orange: "#e08a2e",
  cream: "#f2ede0",
} as const;

const supportsTrueColor =
  process.env.NO_COLOR === undefined &&
  process.env.FORCE_COLOR !== "0" &&
  (process.env.FORCE_COLOR !== undefined || process.stdout.isTTY === true);

function createColor(hex: string, fallback: CliColor): CliColor {
  if (!supportsTrueColor) return fallback;

  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);

  return (text) => `\u001B[38;2;${red};${green};${blue}m${text}\u001B[39m`;
}

export const cliColors = {
  signal: createColor(KUBO_COLORS.signal, pc.yellow),
  bright: createColor(KUBO_COLORS.bright, pc.yellow),
  orange: createColor(KUBO_COLORS.orange, pc.yellow),
  cream: createColor(KUBO_COLORS.cream, pc.white),
};

export { KUBO_COLORS };
