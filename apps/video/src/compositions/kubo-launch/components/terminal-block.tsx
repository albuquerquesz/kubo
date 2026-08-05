import { loadFont } from "@remotion/google-fonts/JetBrainsMono";
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const { fontFamily: MONO } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type TerminalBlockProps = {
  command: string;
  /** Type-on starts at this local frame. */
  typeFrom?: number;
  /** Frames to type the full command. */
  typeDuration?: number;
  fontSize?: number;
  style?: React.CSSProperties;
};

/**
 * Fake terminal chrome with typewriter command (music-only — no VO).
 */
export const TerminalBlock: React.FC<TerminalBlockProps> = ({
  command,
  typeFrom = 0,
  typeDuration = 36,
  fontSize = 48,
  style,
}) => {
  const frame = useCurrentFrame();
  const chars = Math.floor(
    interpolate(frame, [typeFrom, typeFrom + typeDuration], [0, command.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const shown = command.slice(0, chars);
  const cursorOn = Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #2a2a2a",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
        width: "100%",
        maxWidth: 1100,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "18px 24px",
          borderBottom: "1px solid #222",
          background: "#101010",
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span
            key={c}
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: c,
              display: "inline-block",
            }}
          />
        ))}
        <span
          style={{
            marginLeft: 12,
            color: "#666",
            fontSize: 16,
            fontFamily: MONO,
          }}
        >
          terminal
        </span>
      </div>
      <div
        style={{
          padding: "48px 52px",
          fontFamily: MONO,
          fontSize,
          lineHeight: 1.4,
          color: "#e8e8e8",
          letterSpacing: "-0.02em",
          flex: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#FBC80D", marginRight: 12 }}>$</span>
        <span>{shown}</span>
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: fontSize * 0.9,
            marginLeft: 2,
            background: cursorOn ? "#FBC80D" : "transparent",
            verticalAlign: "text-bottom",
          }}
        />
      </div>
    </div>
  );
};
