import pc from "picocolors";

export const KUBO_GOLD = "#FFD84A";

const KUBO_GOLD_OPEN = "\u001b[38;2;255;216;74m";
const KUBO_GOLD_CLOSE = "\u001b[39m";

/** Render the Kubo brand accent as the same truecolor yellow used by the video. */
export function kuboGold(text: string, enabled = pc.isColorSupported): string {
  return enabled ? `${KUBO_GOLD_OPEN}${text}${KUBO_GOLD_CLOSE}` : text;
}
