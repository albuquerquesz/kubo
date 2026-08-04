import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { KuboMarkCharacter } from "../components/KuboMarkCharacter";
import { SceneShell } from "../components/SceneShell";

type HookSceneProps = {
  headline: string;
};

export const HookScene: React.FC<HookSceneProps> = ({ headline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const titleY = interpolate(enter, [0, 1], [40, 0]);
  const titleOp = interpolate(enter, [0, 1], [0, 1]);
  const markScale = interpolate(enter, [0, 1], [0.85, 1]);

  return (
    <SceneShell>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 64,
        }}
      >
        <div style={{ flex: 1, opacity: titleOp, transform: `translateY(${titleY}px)` }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#FBC80D",
              marginBottom: 20,
              fontWeight: 600,
            }}
          >
            Lançamento
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 84,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            {headline}
          </h1>
        </div>
        <div
          style={{
            transform: `scale(${markScale})`,
            opacity: titleOp,
            flexShrink: 0,
          }}
        >
          <KuboMarkCharacter width={360} mode="walk" localFrame={frame} />
        </div>
      </div>
    </SceneShell>
  );
};
