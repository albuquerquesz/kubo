import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

import { TITLE_BLUR_INTRO } from "../lib/timing";

type WordBlurInTitleProps = {
  /** Lines of words (word-by-word blur-in, sequential across lines). */
  lines: readonly (readonly string[])[];
  style?: React.CSSProperties;
};

/** GSAP `expo.out` ≈ cubic-bezier(0.16, 1, 0.3, 1) — same token as LP `ease.expoOut`. */
const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);

type WordMotion = {
  opacity: number;
  y: number;
  blur: number;
};

function wordMotion(frame: number, wordIndex: number): WordMotion {
  const start = TITLE_BLUR_INTRO.delayFrames + wordIndex * TITLE_BLUR_INTRO.wordStaggerFrames;
  const end = start + TITLE_BLUR_INTRO.durationFrames;

  return {
    opacity: interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    }),
    y: interpolate(frame, [start, end], [TITLE_BLUR_INTRO.fromY, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    }),
    blur: interpolate(frame, [start, end], [TITLE_BLUR_INTRO.fromBlur, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    }),
  };
}

/**
 * LP hero title entrance (`playHeroContentIntro` / word blur-in):
 * words: opacity 0→1, blur(10px)→0, y 10→0, duration 0.8s, stagger 0.055s, expo.out.
 */
export const WordBlurInTitle: React.FC<WordBlurInTitleProps> = ({ lines, style }) => {
  const frame = useCurrentFrame();
  let wordIndex = 0;

  return (
    <h2
      style={{
        margin: 0,
        ...style,
      }}
    >
      {lines.map((words, lineIndex) => (
        <span
          key={`line-${lineIndex}`}
          style={{
            display: "block",
          }}
        >
          {words.map((word, i) => {
            const index = wordIndex;
            wordIndex += 1;
            const { opacity, y, blur } = wordMotion(frame, index);
            const isLastOnLine = i === words.length - 1;

            return (
              <span
                key={`w-${lineIndex}-${i}`}
                style={{
                  display: "inline-block",
                  opacity,
                  translate: `0 ${y}px`,
                  filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
                  willChange: "transform, opacity, filter",
                  marginRight: isLastOnLine ? 0 : "0.28em",
                }}
              >
                {word}
              </span>
            );
          })}
        </span>
      ))}
    </h2>
  );
};
