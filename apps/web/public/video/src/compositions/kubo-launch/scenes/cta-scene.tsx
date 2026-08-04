import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { KuboMarkCharacter } from "../components/kubo-mark-character";
import { SceneShell } from "../components/scene-shell";

type CtaSceneProps = {
  command: string;
  ctaUrl: string;
};

export const CtaScene: React.FC<CtaSceneProps> = ({ command, ctaUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 130 } });
  const scale = interpolate(enter, [0, 1], [0.92, 1]);
  const op = interpolate(enter, [0, 1], [0, 1]);

  return (
    <SceneShell>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          opacity: op,
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <KuboMarkCharacter width={300} mode="celebrate" localFrame={frame} />
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 56,
            fontWeight: 600,
            color: "#FBC80D",
            letterSpacing: "-0.02em",
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: 14,
            padding: "22px 40px",
          }}
        >
          {command}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#aaa",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          {ctaUrl}
        </div>
      </div>
    </SceneShell>
  );
};
