import React from "react";

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

/** Static Kubo mark kept ready for the next animation pass. */
export const KuboMarkCharacter: React.FC<KuboMarkCharacterProps> = ({ width = 280, style }) => {
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
      <g>
        <g>
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
          <g>
            <path fill={KUBO_MARK_FILL} d={KUBO_MARK_LEG_LEFT_PATH} />
          </g>
          <g>
            <path fill={KUBO_MARK_FILL} d={KUBO_MARK_LEG_RIGHT_PATH} />
          </g>
        </g>
      </g>
    </svg>
  );
};
