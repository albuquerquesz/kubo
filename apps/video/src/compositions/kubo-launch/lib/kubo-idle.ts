export type KuboIdlePose = "rest" | "rise" | "fall";

export const KUBO_IDLE = {
  cycleFrames: 48,
  steps: [
    { pose: "rest", duration: 18 },
    { pose: "rise", duration: 6 },
    { pose: "rest", duration: 18 },
    { pose: "fall", duration: 6 },
  ],
} as const satisfies {
  cycleFrames: number;
  steps: ReadonlyArray<{ pose: KuboIdlePose; duration: number }>;
};

const VERTICAL_OFFSETS: Record<KuboIdlePose, number> = {
  rest: 0,
  rise: -18,
  fall: 18,
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

export function getKuboVerticalOffset(pose: KuboIdlePose) {
  return VERTICAL_OFFSETS[pose];
}
