/** Editorial dark tokens for stack OG cards. */
export const ogEditorial = {
  background: "#000000",
  card: "#0c0c0c",
  muted: "#161616",
  foreground: "#f1f1f1",
  mutedForeground: "#a0a0a0",
  /** Brand yellow — mark + footer link. */
  brand: "#FBC80D",
  /** Soft structural rule ≈ white 10% on black (Satori has no color-mix). */
  rule: "rgba(255,255,255,0.10)",
  ruleStrong: "rgba(255,255,255,0.18)",
} as const;

export function mixHex(a: string, b: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const ar = Number.parseInt(a.slice(1, 3), 16);
  const ag = Number.parseInt(a.slice(3, 5), 16);
  const ab = Number.parseInt(a.slice(5, 7), 16);
  const br = Number.parseInt(b.slice(1, 3), 16);
  const bg = Number.parseInt(b.slice(3, 5), 16);
  const bb = Number.parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * clamped);
  const g = Math.round(ag + (bg - ag) * clamped);
  const bl = Math.round(ab + (bb - ab) * clamped);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}
