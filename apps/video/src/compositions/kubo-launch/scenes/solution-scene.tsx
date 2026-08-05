import { loadFont } from "@remotion/google-fonts/BreeSerif";
import React from "react";

import { CliSelectPanel } from "../components/cli-select-panel";
import { KuboMarkCharacter } from "../components/kubo-mark-character";
import { SceneShell } from "../components/scene-shell";
import { WordBlurInTitle } from "../components/word-blur-in-title";
import { KUBO_MARK_VIEWBOX } from "../lib/mark-paths";
import { SQUARE_LAYOUT } from "../lib/timing";

const { fontFamily: titleFontFamily } = loadFont();

/** Word splits matching LP hero blur-in grammar. */
const TITLE_LINES = [
  ["Um", "comando."],
  ["Stack", "pronta."],
] as const;

type SolutionSceneProps = {
  command: string;
};

const MARK_HEIGHT = (SQUARE_LAYOUT.markWidth * KUBO_MARK_VIEWBOX.height) / KUBO_MARK_VIEWBOX.width;
const CREAM_BACKGROUND = "#faf8f2";
/** Feet flush on panel rim (slight seat into edge). */
const MARK_TOP = -(MARK_HEIGHT - 2);

/**
 * Square CLI-perch solution: title in upper plate, dark CLI card lower ~⅔,
 * mark perched on the left edge of the panel.
 */
export const SolutionScene: React.FC<SolutionSceneProps> = ({ command }) => {
  return (
    <SceneShell background={CREAM_BACKGROUND} color="#0a0a0a" showGoldGlow={false}>
      <WordBlurInTitle
        lines={TITLE_LINES}
        style={{
          position: "absolute",
          top: SQUARE_LAYOUT.titleTop,
          left: SQUARE_LAYOUT.insetX,
          width: SQUARE_LAYOUT.titleWidth,
          fontFamily: titleFontFamily,
          fontSize: SQUARE_LAYOUT.titleFontSize,
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.08,
          color: "#0a0a0a",
        }}
      />

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
            left: SQUARE_LAYOUT.markLeft,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <KuboMarkCharacter width={SQUARE_LAYOUT.markWidth} />
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
