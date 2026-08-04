import { interpolate } from "remotion";

export type KuboWalkPose = {
  bodyRot: number;
  bodyX: number;
  bodyY: number;
  legLRot: number;
  legRRot: number;
  legLScaleY: number;
  legRScaleY: number;
  rootY: number;
  rootScale: number;
  rootRot: number;
};

export const KUBO_WALK_REST: KuboWalkPose = {
  bodyRot: 0,
  bodyX: 0,
  bodyY: 0,
  legLRot: 0,
  legRRot: 0,
  legLScaleY: 1,
  legRScaleY: 1,
  rootY: 0,
  rootScale: 1,
  rootRot: 0,
};

type WalkSegment = {
  from: number;
  to: number;
  start: KuboWalkPose;
  end: KuboWalkPose;
};

const CONTACT_LEFT: KuboWalkPose = {
  ...KUBO_WALK_REST,
  bodyRot: -2.2,
  bodyX: 2,
  legLRot: 13,
  legRRot: -11,
};

const PASS_LEFT: KuboWalkPose = {
  ...KUBO_WALK_REST,
  bodyRot: -1,
  bodyX: 1,
  legLRot: 3,
  legRRot: -3,
};

const CONTACT_RIGHT: KuboWalkPose = {
  ...KUBO_WALK_REST,
  bodyRot: 2.2,
  bodyX: -2,
  legLRot: -11,
  legRRot: 13,
};

const PASS_RIGHT: KuboWalkPose = {
  ...KUBO_WALK_REST,
  bodyRot: 1,
  bodyX: -1,
  legLRot: -3,
  legRRot: 3,
};

const WALK_SEGMENTS: WalkSegment[] = [
  { from: 0, to: 0.25, start: CONTACT_LEFT, end: PASS_LEFT },
  { from: 0.25, to: 0.5, start: PASS_LEFT, end: CONTACT_RIGHT },
  { from: 0.5, to: 0.75, start: CONTACT_RIGHT, end: PASS_RIGHT },
  { from: 0.75, to: 1, start: PASS_RIGHT, end: CONTACT_LEFT },
];

function interpolatePose(start: KuboWalkPose, end: KuboWalkPose, progress: number): KuboWalkPose {
  return {
    bodyRot: interpolate(progress, [0, 1], [start.bodyRot, end.bodyRot]),
    bodyX: interpolate(progress, [0, 1], [start.bodyX, end.bodyX]),
    bodyY: 0,
    legLRot: interpolate(progress, [0, 1], [start.legLRot, end.legLRot]),
    legRRot: interpolate(progress, [0, 1], [start.legRRot, end.legRRot]),
    legLScaleY: 1,
    legRScaleY: 1,
    rootY: 0,
    rootScale: 1,
    rootRot: 0,
  };
}

/** Returns a grounded, alternating leg pose for a deterministic Remotion frame. */
export function getKuboWalkPose(frameInCycle: number, cycleFrames: number): KuboWalkPose {
  const normalized = (((frameInCycle % cycleFrames) + cycleFrames) % cycleFrames) / cycleFrames;
  const segment = WALK_SEGMENTS.find(({ from, to }) => normalized >= from && normalized <= to);

  if (!segment) return KUBO_WALK_REST;

  const progress = (normalized - segment.from) / (segment.to - segment.from);
  return interpolatePose(segment.start, segment.end, progress);
}

/** One-way travel: the mark enters from the right and never rebounds. */
export function getKuboWalkX(
  frame: number,
  startFrame: number,
  endFrame: number,
  startX: number,
  endX: number,
): number {
  if (frame <= startFrame) return startX;
  if (frame >= endFrame) return endX;

  return interpolate(frame, [startFrame, endFrame], [startX, endX]);
}
