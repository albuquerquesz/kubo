import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { CliSelectPanel } from "../components/cli-select-panel";
import { KuboMarkCharacter } from "../components/kubo-mark-character";
import { SceneShell } from "../components/scene-shell";

type SolutionSceneProps = {
  command: string;
};

export const SolutionScene: React.FC<SolutionSceneProps> = ({ command: _command }) => {
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
          top: 92,
          left: 120,
          width: 560,
          margin: 0,
          opacity: op,
          transform: `translateY(${y}px)`,
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          lineHeight: 1.05,
          color: "#0a0a0a",
        }}
      >
        Um comando. Stack pronta.
      </h2>

      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 8,
          left: 608,
          opacity: op,
          transform: `translateY(${y}px)`,
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            // Full mark height (~100px) + gap so feet sit above the panel, not inside
            top: -102,
            right: 36,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <KuboMarkCharacter width={112} mode="walk" localFrame={frame} />
        </div>
        <CliSelectPanel
          selectedIndex={0}
          style={{
            width: "100%",
            maxWidth: "none",
            minHeight: 560,
          }}
        />
      </div>
    </SceneShell>
  );
};
