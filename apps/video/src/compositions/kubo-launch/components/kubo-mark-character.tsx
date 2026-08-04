import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import {
  KUBO_MARK_BODY_PATH,
  KUBO_MARK_EYE_FILL,
  KUBO_MARK_EYE_LEFT,
  KUBO_MARK_EYE_RIGHT,
  KUBO_MARK_FEET_CENTER,
  KUBO_MARK_FILL,
  KUBO_MARK_HIP_CENTER,
  KUBO_MARK_HIP_LEFT,
  KUBO_MARK_HIP_RIGHT,
  KUBO_MARK_LEG_LEFT_PATH,
  KUBO_MARK_LEG_RIGHT_PATH,
  KUBO_MARK_VIEWBOX,
} from "../lib/mark-paths";
import { WALK_CYCLE_FRAMES } from "../lib/timing";

export type KuboMarkMode = "idle" | "walk" | "celebrate" | "static";

type KuboMarkCharacterProps = {
  /** Width in px (height follows viewBox aspect). */
  width?: number;
  mode?: KuboMarkMode;
  /** Local frame offset so celebrate/walk can start mid-composition Sequence. */
  localFrame?: number;
  style?: React.CSSProperties;
};

type Pose = {
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

const REST: Pose = {
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

/** Piecewise walk matching the site GSAP idle feel (step / pass / rest). */
function walkPose(frameInCycle: number): Pose {
  const t = frameInCycle / WALK_CYCLE_FRAMES;
  // Segment boundaries (normalized): stepA 0–0.28, passA 0.28–0.42, stepB 0.42–0.70, passB 0.70–0.88, rest 0.88–1
  if (t < 0.28) {
    const p = t / 0.28;
    return {
      ...REST,
      legLRot: interpolate(p, [0, 1], [0, 10]),
      legRRot: interpolate(p, [0, 1], [0, -8]),
      legRScaleY: interpolate(p, [0, 1], [1, 1.04]),
      bodyRot: interpolate(p, [0, 1], [0, -2.5]),
      bodyY: interpolate(p, [0, 1], [0, -3]),
      bodyX: interpolate(p, [0, 1], [0, 2]),
      rootY: interpolate(p, [0, 1], [0, -2]),
    };
  }
  if (t < 0.42) {
    const p = (t - 0.28) / 0.14;
    return {
      ...REST,
      legLRot: interpolate(p, [0, 1], [10, 0]),
      legRRot: interpolate(p, [0, 1], [-8, 0]),
      legRScaleY: interpolate(p, [0, 1], [1.04, 1]),
      bodyRot: interpolate(p, [0, 1], [-2.5, 0]),
      bodyY: interpolate(p, [0, 1], [-3, -1]),
      bodyX: interpolate(p, [0, 1], [2, 0]),
      rootY: interpolate(p, [0, 1], [-2, 0]),
    };
  }
  if (t < 0.7) {
    const p = (t - 0.42) / 0.28;
    return {
      ...REST,
      legLRot: interpolate(p, [0, 1], [0, -8]),
      legLScaleY: interpolate(p, [0, 1], [1, 1.04]),
      legRRot: interpolate(p, [0, 1], [0, 10]),
      bodyRot: interpolate(p, [0, 1], [0, 2.5]),
      bodyY: interpolate(p, [0, 1], [-1, -3]),
      bodyX: interpolate(p, [0, 1], [0, -2]),
      rootY: interpolate(p, [0, 1], [0, -2]),
    };
  }
  if (t < 0.88) {
    const p = (t - 0.7) / 0.18;
    return {
      ...REST,
      legLRot: interpolate(p, [0, 1], [-8, 0]),
      legLScaleY: interpolate(p, [0, 1], [1.04, 1]),
      legRRot: interpolate(p, [0, 1], [10, 0]),
      bodyRot: interpolate(p, [0, 1], [2.5, 0]),
      bodyY: interpolate(p, [0, 1], [-3, 0]),
      bodyX: interpolate(p, [0, 1], [-2, 0]),
      rootY: interpolate(p, [0, 1], [-2, 0]),
    };
  }
  return REST;
}

function celebratePose(frame: number, fps: number): Pose {
  const s = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.6 },
  });
  const punch = interpolate(frame, [0, 4, 8, 12, 18, 28], [1, 1.12, 0.96, 1.04, 1.02, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rot = interpolate(frame, [0, 4, 8, 12, 18, 28], [0, 0, 6, -5, 2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(s, [0, 1], [0, -6]);
  return {
    ...REST,
    rootScale: punch,
    rootRot: rot,
    rootY: y,
  };
}

function transformAround(
  cx: number,
  cy: number,
  opts: { rotate?: number; scaleX?: number; scaleY?: number; tx?: number; ty?: number },
): string {
  const { rotate = 0, scaleX = 1, scaleY = 1, tx = 0, ty = 0 } = opts;
  return [
    `translate(${cx + tx} ${cy + ty})`,
    `rotate(${rotate})`,
    `scale(${scaleX} ${scaleY})`,
    `translate(${-cx} ${-cy})`,
  ].join(" ");
}

/**
 * Frame-driven Kubo mark (Mode A walk / celebrate). Deterministic for Remotion render.
 */
export const KuboMarkCharacter: React.FC<KuboMarkCharacterProps> = ({
  width = 280,
  mode = "walk",
  localFrame,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = localFrame ?? frame;

  const pose = useMemo((): Pose => {
    if (mode === "static") return REST;
    if (mode === "celebrate") return celebratePose(f, fps);
    if (mode === "idle" || mode === "walk") {
      const cycle = ((f % WALK_CYCLE_FRAMES) + WALK_CYCLE_FRAMES) % WALK_CYCLE_FRAMES;
      return walkPose(cycle);
    }
    return REST;
  }, [f, fps, mode]);

  const height = (width * KUBO_MARK_VIEWBOX.height) / KUBO_MARK_VIEWBOX.width;
  const clipId = "kubo-mark-ground-clip";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${KUBO_MARK_VIEWBOX.width} ${KUBO_MARK_VIEWBOX.height}`}
      width={width}
      height={height}
      fill="none"
      style={{ overflow: "visible", ...style }}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={-40} y={-50} width={843} height={728} />
        </clipPath>
      </defs>
      <g
        transform={transformAround(KUBO_MARK_FEET_CENTER.x, KUBO_MARK_FEET_CENTER.y, {
          rotate: pose.rootRot,
          scaleX: pose.rootScale,
          scaleY: pose.rootScale,
          ty: pose.rootY,
        })}
      >
        <g
          transform={transformAround(KUBO_MARK_HIP_CENTER.x, KUBO_MARK_HIP_CENTER.y, {
            rotate: pose.bodyRot,
            tx: pose.bodyX,
            ty: pose.bodyY,
          })}
        >
          <path fill={KUBO_MARK_FILL} fillRule="evenodd" d={KUBO_MARK_BODY_PATH} />
          {/* Solid eyes (body path uses evenodd cutouts — transparent on light backgrounds). */}
          <rect
            x={KUBO_MARK_EYE_LEFT.x}
            y={KUBO_MARK_EYE_LEFT.y}
            width={KUBO_MARK_EYE_LEFT.width}
            height={KUBO_MARK_EYE_LEFT.height}
            fill={KUBO_MARK_EYE_FILL}
          />
          <rect
            x={KUBO_MARK_EYE_RIGHT.x}
            y={KUBO_MARK_EYE_RIGHT.y}
            width={KUBO_MARK_EYE_RIGHT.width}
            height={KUBO_MARK_EYE_RIGHT.height}
            fill={KUBO_MARK_EYE_FILL}
          />
        </g>
        <g clipPath={`url(#${clipId})`}>
          <g
            transform={transformAround(KUBO_MARK_HIP_LEFT.x, KUBO_MARK_HIP_LEFT.y, {
              rotate: pose.legLRot,
              scaleY: pose.legLScaleY,
            })}
          >
            <path fill={KUBO_MARK_FILL} d={KUBO_MARK_LEG_LEFT_PATH} />
          </g>
          <g
            transform={transformAround(KUBO_MARK_HIP_RIGHT.x, KUBO_MARK_HIP_RIGHT.y, {
              rotate: pose.legRRot,
              scaleY: pose.legRScaleY,
            })}
          >
            <path fill={KUBO_MARK_FILL} d={KUBO_MARK_LEG_RIGHT_PATH} />
          </g>
        </g>
      </g>
    </svg>
  );
};
