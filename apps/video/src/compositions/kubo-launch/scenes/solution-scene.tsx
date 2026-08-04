import { loadFont } from "@remotion/google-fonts/BreeSerif";
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { CliSelectPanel } from "../components/cli-select-panel";
import { KuboMarkCharacter } from "../components/kubo-mark-character";
import { SceneShell } from "../components/scene-shell";
import { KUBO_MARK_VIEWBOX } from "../lib/mark-paths";
import { SQUARE_LAYOUT } from "../lib/timing";

const { fontFamily: titleFontFamily } = loadFont();

type SolutionSceneProps = {
  command: string;
};

const MARK_HEIGHT = (SQUARE_LAYOUT.markWidth * KUBO_MARK_VIEWBOX.height) / KUBO_MARK_VIEWBOX.width;
/** Feet flush on panel rim (slight seat into edge). */
const MARK_TOP = -(MARK_HEIGHT - 2);

const KUBO_ARRIVAL_START = 34;
const KUBO_RUN_END = 92;
const KUBO_ARRIVAL_OFFSET_X = 1040;

function getKuboArrivalX(frame: number): number {
  if (frame < KUBO_ARRIVAL_START) return KUBO_ARRIVAL_OFFSET_X;
  if (frame < KUBO_RUN_END) {
    return interpolate(frame, [KUBO_ARRIVAL_START, KUBO_RUN_END], [KUBO_ARRIVAL_OFFSET_X, 0], {
      easing: Easing.bezier(0.15, 0.85, 0.25, 1),
    });
  }
  return 0;
}

function getKuboWalkFrame(frame: number): number {
  if (frame <= KUBO_ARRIVAL_START) return 0;
  if (frame < KUBO_RUN_END) return (frame - KUBO_ARRIVAL_START) * 1.2;

  return (KUBO_RUN_END - KUBO_ARRIVAL_START) * 1.2 + (frame - KUBO_RUN_END);
}

/**
 * Square CLI-perch solution: title in upper plate, dark CLI card lower ~⅔,
 * mark perched top-right of panel with walk loop.
 */
export const SolutionScene: React.FC<SolutionSceneProps> = ({ command }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const y = interpolate(enter, [0, 1], [30, 0]);
  const op = interpolate(enter, [0, 1], [0, 1]);

  return (
    <SceneShell background="#ffffff" color="#0a0a0a" showGoldGlow={false}>
      <h2
        style={{
          position: "absolute",
          top: SQUARE_LAYOUT.titleTop,
          left: SQUARE_LAYOUT.insetX,
          width: SQUARE_LAYOUT.titleWidth,
          margin: 0,
          opacity: op,
          transform: `translateY(${y}px)`,
          fontFamily: titleFontFamily,
          fontSize: SQUARE_LAYOUT.titleFontSize,
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.08,
          color: "#0a0a0a",
        }}
      >
        Um comando.
        <br />
        Stack pronta.
      </h2>

      <div
        style={{
          position: "absolute",
          top: SQUARE_LAYOUT.panelTop,
          left: SQUARE_LAYOUT.insetX,
          right: 0,
          bottom: 0,
          opacity: op,
          transform: `translateY(${y}px)`,
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: MARK_TOP,
            right: SQUARE_LAYOUT.markRight,
            zIndex: 2,
            pointerEvents: "none",
            transform: `translateX(${getKuboArrivalX(frame)}px)`,
          }}
        >
          <KuboMarkCharacter
            width={SQUARE_LAYOUT.markWidth}
            mode="walk"
            localFrame={getKuboWalkFrame(frame)}
          />
        </div>
        <CliSelectPanel
          command={command}
          style={{
            width: "100%",
            maxWidth: "none",
            height: "100%",
            minHeight: 0,
            borderRadius: "28px 0 0 28px",
          }}
        />
      </div>
    </SceneShell>
  );
};
