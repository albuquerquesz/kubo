export type KuboIdlePose = "rest" | "left-step" | "right-step";

export const KUBO_IDLE = {
  cycleFrames: 48,
  steps: [
    { pose: "rest", duration: 18 },
    { pose: "left-step", duration: 6 },
    { pose: "rest", duration: 18 },
    { pose: "right-step", duration: 6 },
  ],
} as const satisfies {
  cycleFrames: number;
  steps: ReadonlyArray<{ pose: KuboIdlePose; duration: number }>;
};

export type KuboLegOffsets = {
  left: { x: number; y: number };
  right: { x: number; y: number };
};

const LEG_OFFSETS: Record<KuboIdlePose, KuboLegOffsets> = {
  rest: { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } },
  "left-step": { left: { x: -14, y: 0 }, right: { x: 10, y: -8 } },
  "right-step": { left: { x: -10, y: -8 }, right: { x: 14, y: 0 } },
};

export function getKuboIdlePose(frame: number): KuboIdlePose {
  const cycleFrame =
    ((frame % KUBO_IDLE.cycleFrames) + KUBO_IDLE.cycleFrames) % KUBO_IDLE.cycleFrames;
  let elapsed = 0;

  for (const step of KUBO_IDLE.steps) {
    elapsed += step.duration;
    if (cycleFrame < elapsed) return step.pose;
  }

  return "rest";
}

export function getKuboLegOffsets(pose: KuboIdlePose): KuboLegOffsets {
  return LEG_OFFSETS[pose];
}
