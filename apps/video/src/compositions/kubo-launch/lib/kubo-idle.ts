export type KuboIdlePose = "rest" | "left-step" | "right-step";

export const KUBO_IDLE = {
  cycleFrames: 28,
  steps: [
    { pose: "rest", duration: 10 },
    { pose: "left-step", duration: 4 },
    { pose: "rest", duration: 10 },
    { pose: "right-step", duration: 4 },
  ],
} as const satisfies {
  cycleFrames: number;
  steps: ReadonlyArray<{ pose: KuboIdlePose; duration: number }>;
};

const LEG_OFFSETS: Record<KuboIdlePose, { left: number; right: number }> = {
  rest: { left: 0, right: 0 },
  "left-step": { left: -8, right: 5 },
  "right-step": { left: -5, right: 8 },
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

export function getKuboLegOffsets(pose: KuboIdlePose) {
  return LEG_OFFSETS[pose];
}
