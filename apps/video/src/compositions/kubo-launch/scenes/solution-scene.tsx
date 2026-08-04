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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 56,
          opacity: op,
          transform: `translateY(${y}px)`,
        }}
      >
        <div style={{ flex: "0 1 560px", minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 92,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
            }}
          >
            Um comando. Stack pronta.
          </h2>
        </div>

        <div
          style={{
            flex: "1 1 900px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 20,
            minWidth: 0,
          }}
        >
          <KuboMarkCharacter width={120} mode="walk" localFrame={frame} />
          <TerminalBlock
            command={command}
            typeFrom={12}
            typeDuration={40}
            fontSize={56}
            style={{
              width: "100%",
              maxWidth: 980,
              minHeight: 520,
            }}
          />
        </div>
      </div>
    </SceneShell>
  );
};
