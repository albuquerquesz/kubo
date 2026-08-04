import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { KuboMarkCharacter } from "../components/kubo-mark-character";
import { SceneShell } from "../components/scene-shell";

type ProblemSceneProps = {
  bullets: string[];
};

export const ProblemScene: React.FC<ProblemSceneProps> = ({ bullets }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneShell>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 80,
        }}
      >
        <div style={{ flexShrink: 0, opacity: 0.95 }}>
          <KuboMarkCharacter width={280} mode="walk" localFrame={frame} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 20,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#888",
              marginBottom: 28,
              fontWeight: 600,
            }}
          >
            O problema
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {bullets.map((bullet, i) => {
              const delay = i * 8;
              const s = spring({
                frame: Math.max(0, frame - delay),
                fps,
                config: { damping: 16, stiffness: 140 },
              });
              const x = interpolate(s, [0, 1], [36, 0]);
              const op = interpolate(s, [0, 1], [0, 1]);
              return (
                <li
                  key={bullet}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    opacity: op,
                    transform: `translateX(${x}px)`,
                    fontSize: 48,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: "#FBC80D",
                      flexShrink: 0,
                    }}
                  />
                  {bullet}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </SceneShell>
  );
};
