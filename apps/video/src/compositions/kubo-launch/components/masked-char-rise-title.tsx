import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

import { TITLE_INTRO } from "../lib/timing";

type MaskedCharRiseTitleProps = {
  /** Visual lines (one rise wave per line). */
  lines: readonly string[];
  style?: React.CSSProperties;
  /** Char stagger jitter multiplier (LP `randomness`, default 1). */
  randomness?: number;
};

/** GSAP `power4.inOut` ≈ poly(4) inOut. */
const CHAR_EASE = Easing.inOut(Easing.poly(4));

function charRiseY(
  frame: number,
  lineIndex: number,
  charIndex: number,
  randomness: number,
): number {
  const start =
    TITLE_INTRO.delayFrames +
    lineIndex * TITLE_INTRO.lineDelayFrames +
    charIndex * TITLE_INTRO.charStaggerFrames * randomness;
  const end = start + TITLE_INTRO.charDurationFrames;

  return interpolate(frame, [start, end], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CHAR_EASE,
  });
}

/**
 * LP hero Family A: line-masked char rise (`y: 100% → 0%`), play-once on the timeline.
 * Frame-driven Remotion port of `createHeroDisplayIntro` (no GSAP SplitText).
 */
export const MaskedCharRiseTitle: React.FC<MaskedCharRiseTitleProps> = ({
  lines,
  style,
  randomness = 1,
}) => {
  const frame = useCurrentFrame();

  return (
    <h2
      style={{
        margin: 0,
        ...style,
      }}
    >
      {lines.map((line, lineIndex) => (
        <span
          key={`line-${lineIndex}`}
          style={{
            display: "block",
            overflow: "hidden",
            // Slight pad so descenders aren't clipped mid-rise.
            paddingBottom: "0.06em",
          }}
        >
          {Array.from(line).map((char, charIndex) => {
            const y = charRiseY(frame, lineIndex, charIndex, randomness);
            return (
              <span
                key={`c-${lineIndex}-${charIndex}`}
                style={{
                  display: "inline-block",
                  translate: `0 ${y}%`,
                  // Preserve spaces inside the rise span.
                  whiteSpace: "pre",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </span>
      ))}
    </h2>
  );
};
