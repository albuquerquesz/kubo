import type { KuboMarkEye } from "./mark-paths";

export type KuboEyeState = "open" | "closing" | "closed" | "opening";

/** Short, frame-locked blinks for deterministic Remotion renders. */
const BLINKS = [
  { closeAt: 71, closedUntil: 73, openAt: 74 },
  { closeAt: 151, closedUntil: 153, openAt: 154 },
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
  const height = state === "closed" ? 8 : state === "open" ? eye.height : 42;

  return {
    x: eye.x,
    y: eye.y + (eye.height - height) / 2,
    width: eye.width,
    height,
  };
}
