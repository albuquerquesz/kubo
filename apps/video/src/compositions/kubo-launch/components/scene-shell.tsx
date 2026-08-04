import React from "react";
import { AbsoluteFill } from "remotion";

const BG = "#0a0a0a";
const SAFE_X = 120;
const SAFE_Y = 80;

type SceneShellProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * Dark brand plate + horizontal safe margins for LinkedIn / X crops.
 */
export const SceneShell: React.FC<SceneShellProps> = ({ children, style }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        color: "#f5f5f5",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        ...style,
      }}
    >
      {/* subtle vignette / brand gold accent line */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(251,200,13,0.06) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          padding: `${SAFE_Y}px ${SAFE_X}px`,
          boxSizing: "border-box",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
