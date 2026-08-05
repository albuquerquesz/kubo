import React from "react";
import { useCurrentFrame } from "remotion";

import { getKuboEyeRect, getKuboEyeState } from "../lib/kubo-blink";
import {
  KUBO_MARK_BODY_PATH,
  KUBO_MARK_EYE_FILL,
  KUBO_MARK_EYE_LEFT,
  KUBO_MARK_EYE_RIGHT,
  KUBO_MARK_FILL,
  KUBO_MARK_LEG_LEFT_PATH,
  KUBO_MARK_LEG_RIGHT_PATH,
  KUBO_MARK_VIEWBOX,
} from "../lib/mark-paths";
type KuboMarkCharacterProps = {
  /** Width in px (height follows viewBox aspect). */
  width?: number;
  style?: React.CSSProperties;
};

/** Frame-driven Kubo mark with a static pose and a discrete blink. */
export const KuboMarkCharacter: React.FC<KuboMarkCharacterProps> = ({ width = 280, style }) => {
  const frame = useCurrentFrame();
  const eyeState = getKuboEyeState(frame);
  const height = (width * KUBO_MARK_VIEWBOX.height) / KUBO_MARK_VIEWBOX.width;
  const clipId = "kubo-mark-ground-clip";
  const leftEye = getKuboEyeRect(KUBO_MARK_EYE_LEFT, eyeState);
  const rightEye = getKuboEyeRect(KUBO_MARK_EYE_RIGHT, eyeState);

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
      <g data-kubo-mark-root>
        <g>
          <path fill={KUBO_MARK_FILL} fillRule="evenodd" d={KUBO_MARK_BODY_PATH} />
          {/* Restore the eye cutouts before the animated black eyelids. */}
          <rect {...KUBO_MARK_EYE_LEFT} fill={KUBO_MARK_FILL} />
          <rect {...KUBO_MARK_EYE_RIGHT} fill={KUBO_MARK_FILL} />
          <rect {...leftEye} fill={KUBO_MARK_EYE_FILL} />
          <rect {...rightEye} fill={KUBO_MARK_EYE_FILL} />
        </g>
        <g clipPath={`url(#${clipId})`}>
          <g data-kubo-leg-left>
            <path fill={KUBO_MARK_FILL} d={KUBO_MARK_LEG_LEFT_PATH} />
          </g>
          <g data-kubo-leg-right>
            <path fill={KUBO_MARK_FILL} d={KUBO_MARK_LEG_RIGHT_PATH} />
          </g>
        </g>
      </g>
    </svg>
  );
};
