import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type CliSelectPanelProps = {
  command?: string;
  style?: React.CSSProperties;
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const CYAN = "#89DCEB";
const DIM = "#686868";
const GREEN = "#A6E3A1";
const MAGENTA = "#F5C2E7";
const WHITE = "#F5F5F5";

const KUBO_TITLE = `
██╗  ██╗██╗   ██╗██████╗  ██████╗
██║ ██╔╝██║   ██║██╔══██╗██╔═══██╗
█████╔╝ ██║   ██║██████╔╝██║   ██║
██╔═██╗ ██║   ██║██╔══██╗██║   ██║
██║  ██╗╚██████╔╝██████╔╝╚██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝`;

type CliOption = {
  label: string;
  hint: string;
  selected?: boolean;
};

const PROJECT_TYPE_OPTIONS: CliOption[] = [
  { label: "Web", hint: "React, Vue or Svelte Web Application", selected: true },
  { label: "Native", hint: "Create a React Native/Expo app" },
];

const WEB_OPTIONS: CliOption[] = [
  {
    label: "TanStack Router",
    hint: "Modern and scalable routing for React Applications",
    selected: true,
  },
  {
    label: "React Router",
    hint: "A user-obsessed, standards-focused, multi-strategy router",
  },
  { label: "Next.js", hint: "The React Framework for the Web" },
  { label: "Nuxt", hint: "The Progressive Web Framework for Vue.js" },
  { label: "Svelte", hint: "Web development for the rest of us" },
  { label: "Solid", hint: "Simple and performant reactivity for building user interfaces" },
  { label: "Astro", hint: "The web framework for content-driven websites" },
  {
    label: "TanStack Start",
    hint: "SSR, Server Functions, API Routes and more with TanStack Router",
  },
];

const cursorStyle = (visible: boolean): React.CSSProperties => ({
  display: "inline-block",
  width: 11,
  height: 27,
  marginLeft: 4,
  background: visible ? CYAN : "transparent",
  verticalAlign: "-3px",
});

const CliOptionRow: React.FC<{ option: CliOption; multi?: boolean }> = ({
  option,
  multi = false,
}) => {
  const marker = multi ? (option.selected ? "◼" : "◻") : option.selected ? "●" : "○";
  const markerColor = option.selected ? GREEN : DIM;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        minWidth: 0,
        color: option.selected ? WHITE : "#9A9A9A",
        fontSize: 25,
        lineHeight: 1.3,
      }}
    >
      <span style={{ width: 22, flexShrink: 0, color: markerColor }}>{marker}</span>
      <span style={{ minWidth: 0 }}>{option.label}</span>
      <span style={{ color: DIM, fontSize: 17, whiteSpace: "nowrap" }}>({option.hint})</span>
    </div>
  );
};

const PromptFrame: React.FC<{
  message: string;
  options: CliOption[];
  multi?: boolean;
  first?: boolean;
}> = ({ message, options, multi = false, first = false }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ color: DIM, fontSize: 22, lineHeight: 1 }}>│</div>
      <div style={{ display: "flex", gap: 12, color: CYAN, fontSize: 26, lineHeight: 1.25 }}>
        <span>◆</span>
        <span style={{ color: WHITE }}>{message}</span>
      </div>
      <div style={{ paddingLeft: 34, display: "flex", flexDirection: "column", gap: 7 }}>
        {options.map((option) => (
          <CliOptionRow key={option.label} option={option} multi={multi} />
        ))}
      </div>
      <div style={{ color: CYAN, fontSize: 22, lineHeight: 1 }}>└</div>
      <div style={{ paddingLeft: 34, color: DIM, fontSize: 17, lineHeight: 1.3 }}>
        ↑/↓ navigate • {multi ? "space select • " : ""}enter confirm • {!first ? "b back • " : ""}
        ctrl+c cancel
      </div>
    </div>
  );
};

const NamePrompt: React.FC<{ value: string; cursorVisible: boolean }> = ({
  value,
  cursorVisible,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
    <div style={{ color: DIM, fontSize: 22, lineHeight: 1 }}>│</div>
    <div style={{ display: "flex", gap: 12, color: CYAN, fontSize: 26, lineHeight: 1.25 }}>
      <span>◆</span>
      <span style={{ color: WHITE }}>
        Enter your project name or path (relative to current directory)
      </span>
    </div>
    <div style={{ paddingLeft: 34, color: WHITE, fontSize: 25, lineHeight: 1.3 }}>
      {value}
      <span style={cursorStyle(cursorVisible)} />
    </div>
    <div style={{ color: CYAN, fontSize: 22, lineHeight: 1 }}>└</div>
  </div>
);

const Intro: React.FC = () => (
  <div style={{ color: MAGENTA, fontSize: 25, lineHeight: 1.35 }}>
    ┌&nbsp; Creating a new I dont know project
  </div>
);

const CommandLine: React.FC<{ command: string; frame: number }> = ({ command, frame }) => {
  const chars = Math.floor(
    interpolate(frame, [0, 24], [0, command.length], { extrapolateRight: "clamp" }),
  );
  const shown = command.slice(0, chars);

  return (
    <div style={{ color: WHITE, fontSize: 26, lineHeight: 1.3 }}>
      <span style={{ color: CYAN }}>$</span> {shown}
      <span style={cursorStyle(Math.floor(frame / 6) % 2 === 0)} />
    </div>
  );
};

/** Deterministic visual playback of the create-kubojs @clack session. */
export const CliSelectPanel: React.FC<CliSelectPanelProps> = ({
  command = "bun create kubojs",
  style,
}) => {
  const frame = useCurrentFrame();
  const projectNameChars = Math.floor(
    interpolate(frame, [92, 116], [0, "my-kubo-app".length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const projectName = "my-kubo-app".slice(0, projectNameChars);

  let content: React.ReactNode;
  if (frame < 28) {
    content = <CommandLine command={command} frame={frame} />;
  } else if (frame < 67) {
    content = (
      <pre
        style={{
          margin: 0,
          color: "transparent",
          fontSize: 16,
          lineHeight: 1.08,
          letterSpacing: "-0.05em",
          whiteSpace: "pre",
          backgroundImage: `linear-gradient(90deg, ${MAGENTA}, #CBA6F7, ${CYAN}, ${GREEN})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
        }}
      >
        {KUBO_TITLE.trimStart()}
      </pre>
    );
  } else if (frame < 91) {
    content = <Intro />;
  } else if (frame < 130) {
    content = <NamePrompt value={projectName} cursorVisible={Math.floor(frame / 6) % 2 === 0} />;
  } else if (frame < 181) {
    content = (
      <PromptFrame message="Select project type" options={PROJECT_TYPE_OPTIONS} multi first />
    );
  } else {
    content = <PromptFrame message="Choose web" options={WEB_OPTIONS} />;
  }

  return (
    <div
      style={{
        background: "#0d0d0d",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 28px 90px rgba(0,0,0,0.55)",
        width: "100%",
        boxSizing: "border-box",
        padding: "44px 48px 40px",
        fontFamily: MONO,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        minHeight: 680,
        ...style,
      }}
    >
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start" }}>{content}</div>
    </div>
  );
};
