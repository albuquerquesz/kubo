import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { KuboMarkCharacter } from "../components/kubo-mark-character";
import { SceneShell } from "../components/scene-shell";
import { TerminalBlock } from "../components/terminal-block";

type SolutionSceneProps = {
  command: string;
};

export const SolutionScene: React.FC<SolutionSceneProps> = ({ command }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const y = interpolate(enter, [0, 1], [30, 0]);
  const op = interpolate(enter, [0, 1], [0, 1]);

  return (
    <SceneShell>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 48,
          opacity: op,
          transform: `translateY(${y}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#FBC80D",
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              A solução
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 56,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Um comando. Stack pronta.
            </h2>
          </div>
          <KuboMarkCharacter width={220} mode="walk" localFrame={frame} />
        </div>
        <TerminalBlock command={command} typeFrom={12} typeDuration={40} fontSize={44} />
      </div>
    </SceneShell>
  );
};
