/**
 * Single-use layout redeem codes: the dashboard shows `XXXX-XXXX-XXXX`, the CLI sends it back.
 * Only a SHA-256 hash of the normalized code is stored.
 */

/** Crockford base32: no I, L, O, U, so codes are easy to read and type. */
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const LAYOUT_CODE_LENGTH = 12; // 60 bits of entropy
export const LAYOUT_CODE_TTL_MS = 10 * 60 * 1000;

/** Builds a code from random bytes (caller supplies `crypto.getRandomValues` output). */
export function encodeLayoutCode(randomBytes: Uint8Array): string {
  if (randomBytes.length < LAYOUT_CODE_LENGTH) {
    throw new Error(`Need at least ${LAYOUT_CODE_LENGTH} random bytes`);
  }
  let code = "";
  for (let i = 0; i < LAYOUT_CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomBytes[i]! % CODE_ALPHABET.length];
  }
  return code;
}

/** `ABCDEFGHJKMN` → `ABCD-EFGH-JKMN`. */
export function formatLayoutCode(code: string): string {
  return code.match(/.{1,4}/g)?.join("-") ?? code;
}

/**
 * Accepts what a person might type (lowercase, spaces, dashes, O/I/L lookalikes) and returns
 * the canonical code, or null when it cannot be a valid code.
 */
export function normalizeLayoutCode(input: unknown): string | null {
  if (typeof input !== "string" || input.length > 64) return null;
  const canonical = input
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
  if (canonical.length !== LAYOUT_CODE_LENGTH) return null;
  for (const char of canonical) {
    if (!CODE_ALPHABET.includes(char)) return null;
  }
  return canonical;
}

export async function hashLayoutCode(normalizedCode: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalizedCode));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
