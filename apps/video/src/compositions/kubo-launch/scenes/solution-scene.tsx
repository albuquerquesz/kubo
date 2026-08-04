import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { CliSelectPanel } from "../components/cli-select-panel";
import { KuboMarkCharacter } from "../components/kubo-mark-character";
import { SceneShell } from "../components/scene-shell";
import { KUBO_MARK_VIEWBOX } from "../lib/mark-paths";
import { SQUARE_LAYOUT } from "../lib/timing";

type SolutionSceneProps = {
  command: string;
};

const MARK_HEIGHT = (SQUARE_LAYOUT.markWidth * KUBO_MARK_VIEWBOX.height) / KUBO_MARK_VIEWBOX.width;
/** Feet flush on panel rim (slight seat into edge). */
const MARK_TOP = -(MARK_HEIGHT - 2);

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
          fontSize: SQUARE_LAYOUT.titleFontSize,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          lineHeight: 1.05,
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
          }}
        >
          <KuboMarkCharacter width={SQUARE_LAYOUT.markWidth} mode="walk" localFrame={frame} />
        </div>
        <CliSelectPanel
          command={command}
          style={{
            width: "100%",
            maxWidth: "none",
            height: "100%",
            minHeight: 0,
            borderRadius: "28px 0 0 0",
          }}
        />
      </div>
    </SceneShell>
  );
};
