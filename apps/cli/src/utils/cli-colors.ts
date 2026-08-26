import pc from "picocolors";

type CliColor = (text: string) => string;
type TerminalLike = { isTTY?: boolean | undefined };
type EnvLike = NodeJS.ProcessEnv;

const KUBO_COLORS = {
  signal: "#c49314",
  bright: "#d6a72b",
  orange: "#e08a2e",
  cream: "#f2ede0",
} as const;

const TRUECOLOR_COLORTERM = new Set(["24bit", "truecolor"]);

function parseForceColor(forceColor: string | undefined): number | undefined {
  if (forceColor === undefined || forceColor === "") return undefined;
  if (forceColor === "true") return 1;

  const parsed = Number.parseInt(forceColor, 10);
  return Number.isNaN(parsed) ? 1 : parsed;
}

export function supportsAnsiColor(
  env: EnvLike = process.env,
  terminal: TerminalLike = process.stdout,
): boolean {
  if (env.NO_COLOR !== undefined) return false;

  const forceColor = parseForceColor(env.FORCE_COLOR);
  if (forceColor === 0) return false;
  if (forceColor !== undefined) return true;

  return terminal.isTTY === true;
}

export function supportsTrueColor(
  env: EnvLike = process.env,
  terminal: TerminalLike = process.stdout,
): boolean {
  if (!supportsAnsiColor(env, terminal)) return false;

  const forceColor = parseForceColor(env.FORCE_COLOR);
  if (forceColor !== undefined) return forceColor >= 3;

  const colorTerm = env.COLORTERM?.toLowerCase();
  if (colorTerm !== undefined && TRUECOLOR_COLORTERM.has(colorTerm)) {
    return true;
  }

  return env.TERM?.toLowerCase().includes("direct") === true;
}

function createColor(hex: string, fallback: CliColor): CliColor {
  if (!supportsTrueColor()) return fallback;

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
