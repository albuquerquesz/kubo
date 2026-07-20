/**
 * Centralized GSAP ease + timing tokens for authored marketing motion.
 * Surfaces should not invent conflicting eases.
 */
export const ease = {
  /** Hero char rise, line grow */
  standard: "power4.inOut",
  /** Leave / dismiss */
  exit: "power4.out",
} as const;

export const duration = {
  /** Char travel (seconds) */
  intro: 1,
  /** Line mask open when grow is enabled */
  lineGrow: 1.3,
} as const;

export const stagger = {
  /** Delay between lines */
  line: 0.7,
  /**
   * Base for per-char jitter: multiply by `randomness` prop.
   * Effective char stagger ≈ 0.005 * randomness
   */
  charFactor: 0.005,
} as const;
