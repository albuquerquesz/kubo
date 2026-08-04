import { loadFont } from "@remotion/google-fonts/BreeSerif";
import React from "react";
import { useCurrentFrame } from "remotion";

import { CliSelectPanel } from "../components/cli-select-panel";
import { KuboMarkCharacter } from "../components/kubo-mark-character";
import { SceneShell } from "../components/scene-shell";
import { getKuboWalkX } from "../lib/kubo-walk";
import { KUBO_MARK_VIEWBOX } from "../lib/mark-paths";
import {
  KUBO_WALK_END_FRAME,
  KUBO_WALK_END_X,
  KUBO_WALK_START_FRAME,
  KUBO_WALK_START_X,
  SQUARE_LAYOUT,
} from "../lib/timing";

const { fontFamily: titleFontFamily } = loadFont();

type SolutionSceneProps = {
  command: string;
};

const MARK_HEIGHT = (SQUARE_LAYOUT.markWidth * KUBO_MARK_VIEWBOX.height) / KUBO_MARK_VIEWBOX.width;
/** Feet flush on panel rim (slight seat into edge). */
const MARK_TOP = -(MARK_HEIGHT - 2);

function getKuboWalkFrame(frame: number): number {
  if (frame <= KUBO_WALK_START_FRAME) return 0;

  return frame - KUBO_WALK_START_FRAME;
}

/**
 * Square CLI-perch solution: title in upper plate, dark CLI card lower ~⅔,
 * mark perched top-right of panel with walk loop.
 */
export const SolutionScene: React.FC<SolutionSceneProps> = ({ command }) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell background="#ffffff" color="#0a0a0a" showGoldGlow={false}>
      <h2
        style={{
          position: "absolute",
          top: SQUARE_LAYOUT.titleTop,
          left: SQUARE_LAYOUT.insetX,
          width: SQUARE_LAYOUT.titleWidth,
          margin: 0,
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
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: MARK_TOP,
            left: getKuboWalkX(
              frame,
              KUBO_WALK_START_FRAME,
              KUBO_WALK_END_FRAME,
              KUBO_WALK_START_X,
              KUBO_WALK_END_X,
            ),
            zIndex: 2,
            pointerEvents: "none",
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
