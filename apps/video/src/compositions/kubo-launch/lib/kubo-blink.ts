import type { KuboMarkEye } from "./mark-paths";

export type KuboEyeState = "open" | "closing" | "closed" | "opening";

/** Short, frame-locked blinks for deterministic Remotion renders. */
const BLINKS = [
  { closeAt: 45, closedUntil: 47, openAt: 48 },
  { closeAt: 95, closedUntil: 97, openAt: 98 },
  { closeAt: 145, closedUntil: 147, openAt: 148 },
  { closeAt: 195, closedUntil: 197, openAt: 198 },
] as const;

export function getKuboEyeState(frame: number): KuboEyeState {
  for (const blink of BLINKS) {
    if (frame === blink.closeAt) return "closing";
    if (frame >= blink.closeAt + 1 && frame <= blink.closedUntil) return "closed";
    if (frame === blink.openAt) return "opening";
  }

  return "open";
}

export function getKuboEyeRect(eye: KuboMarkEye, state: KuboEyeState) {
  // State labels mark the beat; the rendered geometry still snaps.
  const height = state === "open" || state === "opening" ? eye.height : 8;

  return {
    x: eye.x,
    y: eye.y + (eye.height - height) / 2,
    width: eye.width,
    height,
  };
}
