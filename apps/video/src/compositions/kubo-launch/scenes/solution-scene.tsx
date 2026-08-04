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
    <SceneShell>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 48,
          opacity: op,
          transform: `translateY(${y}px)`,
          // Room for mascot perched above the panel top edge
          paddingTop: 48,
        }}
      >
        <div style={{ flex: "0 1 520px", minWidth: 0, marginTop: 12 }}>
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
            position: "relative",
            minWidth: 0,
            maxWidth: 980,
            // Let the perched mark paint above the panel
            overflow: "visible",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -64,
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
              minHeight: 560,
            }}
          />
        </div>
      </div>
    </SceneShell>
  );
};
