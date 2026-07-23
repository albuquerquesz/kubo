/**
 * Decorative pixel-art style icons for the deployment section intro.
 * Each icon is a 56x56 viewBox with simple geometric shapes inspired by
 * the Mistral reference (code window, lightbulb, mountain).
 */

export function IconCodeWindow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Window frame */}
      <rect x="4" y="8" width="48" height="36" rx="2" stroke="currentColor" strokeWidth="2" />
      {/* Title bar dots */}
      <circle cx="12" cy="14" r="2" fill="currentColor" />
      <circle cx="20" cy="14" r="2" fill="currentColor" />
      <circle cx="28" cy="14" r="2" fill="currentColor" />
      {/* Code lines */}
      <rect x="10" y="22" width="16" height="2" rx="1" fill="currentColor" />
      <rect x="10" y="28" width="24" height="2" rx="1" fill="currentColor" />
      <rect x="10" y="34" width="20" height="2" rx="1" fill="currentColor" />
      <rect x="10" y="40" width="12" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

export function IconLightbulb({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Bulb glass */}
      <path
        d="M18 22 C18 14 22 10 28 10 C34 10 38 14 38 22 C38 28 34 30 34 34 L22 34 C22 30 18 28 18 22Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Filament */}
      <path d="M24 26 L28 20 L32 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Base */}
      <rect x="22" y="34" width="12" height="4" rx="1" fill="currentColor" />
      <rect x="24" y="38" width="8" height="3" rx="1" fill="currentColor" />
      {/* Rays */}
      <line
        x1="28"
        y1="4"
        x2="28"
        y2="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="12"
        x2="17"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="42"
        y1="12"
        x2="39"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="22"
        x2="14"
        y2="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="46"
        y1="22"
        x2="42"
        y2="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMountain({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left peak */}
      <path
        d="M4 42 L18 16 L32 42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right peak */}
      <path
        d="M22 42 L34 22 L46 42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Snow caps */}
      <path d="M18 16 L14 24 L22 24Z" fill="currentColor" />
      <path d="M34 22 L30.5 28 L37.5 28Z" fill="currentColor" />
      {/* Base line */}
      <line
        x1="4"
        y1="42"
        x2="52"
        y2="42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
