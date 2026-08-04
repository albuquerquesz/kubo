import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

import { CLI_PHASES } from "../lib/timing";

type CliSelectPanelProps = {
  command?: string;
  style?: React.CSSProperties;
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const CYAN = "#FBC80D";
const DIM = "#686868";
const GREEN = "#FBC80D";
const MAGENTA = "#FBC80D";
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
  width: 9,
  height: 22,
  marginLeft: 3,
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
        gap: 10,
        minWidth: 0,
        color: option.selected ? WHITE : "#9A9A9A",
        fontSize: 20,
        lineHeight: 1.28,
      }}
    >
      <span style={{ width: 18, flexShrink: 0, color: markerColor }}>{marker}</span>
      <span style={{ minWidth: 0 }}>{option.label}</span>
      <span style={{ color: DIM, fontSize: 14, whiteSpace: "nowrap" }}>({option.hint})</span>
    </div>
  );
};

const SubmittedPrompt: React.FC<{ message: string; value: string }> = ({ message, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ color: DIM, fontSize: 18, lineHeight: 1 }}>│</div>
    <div style={{ display: "flex", gap: 10, color: "#A6E3A1", fontSize: 21, lineHeight: 1.25 }}>
      <span>◇</span>
      <span style={{ color: WHITE }}>{message}</span>
    </div>
    <div style={{ paddingLeft: 28, color: DIM, fontSize: 20, lineHeight: 1.28 }}>{value}</div>
  </div>
);

const PromptFrame: React.FC<{
  message: string;
  options: CliOption[];
  multi?: boolean;
  first?: boolean;
}> = ({ message, options, multi = false, first = false }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ color: DIM, fontSize: 18, lineHeight: 1 }}>│</div>
      <div style={{ display: "flex", gap: 10, color: CYAN, fontSize: 21, lineHeight: 1.25 }}>
        <span>◆</span>
        <span style={{ color: WHITE }}>{message}</span>
      </div>
      <div style={{ paddingLeft: 28, display: "flex", flexDirection: "column", gap: 5 }}>
        {options.map((option) => (
          <CliOptionRow key={option.label} option={option} multi={multi} />
        ))}
      </div>
      <div style={{ color: CYAN, fontSize: 18, lineHeight: 1 }}>└</div>
      <div style={{ paddingLeft: 28, color: DIM, fontSize: 14, lineHeight: 1.3 }}>
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
  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
    <div style={{ color: DIM, fontSize: 18, lineHeight: 1 }}>│</div>
    <div style={{ display: "flex", gap: 10, color: CYAN, fontSize: 21, lineHeight: 1.25 }}>
      <span>◆</span>
      <span style={{ color: WHITE }}>
        Enter your project name or path (relative to current directory)
      </span>
    </div>
    <div style={{ paddingLeft: 28, color: WHITE, fontSize: 20, lineHeight: 1.28 }}>
      {value}
      <span style={cursorStyle(cursorVisible)} />
    </div>
    <div style={{ color: CYAN, fontSize: 18, lineHeight: 1 }}>└</div>
  </div>
);

const SubmittedName: React.FC<{ value: string }> = ({ value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ color: DIM, fontSize: 18, lineHeight: 1 }}>│</div>
    <div style={{ display: "flex", gap: 10, color: "#A6E3A1", fontSize: 21, lineHeight: 1.25 }}>
      <span>◇</span>
      <span style={{ color: WHITE }}>
        Enter your project name or path (relative to current directory)
      </span>
    </div>
    <div style={{ paddingLeft: 28, color: DIM, fontSize: 20, lineHeight: 1.28 }}>{value}</div>
  </div>
);

const Intro: React.FC = () => (
  <div style={{ color: MAGENTA, fontSize: 20, lineHeight: 1.35 }}>
    ┌&nbsp; Creating a new I dont know project
  </div>
);

const CommandLine: React.FC<{ command: string; frame: number }> = ({ command, frame }) => {
  const typeEnd = CLI_PHASES.commandTypeEnd;
  const chars = Math.floor(
    interpolate(frame, [0, typeEnd], [0, command.length], { extrapolateRight: "clamp" }),
  );
  const shown = command.slice(0, chars);
  const isTyping = frame < typeEnd;

  return (
    <div style={{ color: WHITE, fontSize: 21, lineHeight: 1.3 }}>
      <span style={{ color: CYAN }}>$</span> {shown}
      {isTyping ? <span style={cursorStyle(Math.floor(frame / 6) % 2 === 0)} /> : null}
    </div>
  );
};

/** Deterministic visual playback of the create-kubojs @clack session (6s square). */
export const CliSelectPanel: React.FC<CliSelectPanelProps> = ({
  command = "bun create kubojs",
  style,
}) => {
  const frame = useCurrentFrame();
  const projectNameChars = Math.floor(
    interpolate(
      frame,
      [CLI_PHASES.nameTypeStart, CLI_PHASES.nameTypeEnd],
      [0, "my-kubo-app".length],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ),
  );
  const projectName = "my-kubo-app".slice(0, projectNameChars);

  const showLogo = frame >= CLI_PHASES.logoAt;
  const showIntro = frame >= CLI_PHASES.introAt;
  const showName = frame >= CLI_PHASES.nameAt;
  const nameSubmitted = frame >= CLI_PHASES.nameSubmitted;
  const showProjectType = frame >= CLI_PHASES.projectTypeAt;
  const projectTypeSubmitted = frame >= CLI_PHASES.projectTypeSubmitted;
  const showWeb = frame >= CLI_PHASES.webAt;
  // Collapse banner once selects fill the card so options stay readable on 1080².
  const showBanner = showLogo && !showWeb;

  return (
    <div
      style={{
        background: "#0d0d0d",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 28px 90px rgba(0,0,0,0.55)",
        width: "100%",
        boxSizing: "border-box",
        padding: "36px 40px 32px",
        fontFamily: MONO,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        minHeight: 0,
        ...style,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "stretch" }}>
        <CommandLine command={command} frame={frame} />
        {showBanner ? (
          <pre
            style={{
              margin: 0,
              color: "transparent",
              fontSize: 13,
              lineHeight: 1.08,
              letterSpacing: "-0.05em",
              whiteSpace: "pre",
              backgroundImage: `linear-gradient(90deg, ${MAGENTA}, ${MAGENTA}, ${CYAN}, ${GREEN})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
            }}
          >
            {KUBO_TITLE.trimStart()}
          </pre>
        ) : null}
        {showIntro && !showWeb ? <Intro /> : null}
        {showName ? (
          nameSubmitted ? (
            <SubmittedName value="my-kubo-app" />
          ) : (
            <NamePrompt value={projectName} cursorVisible={Math.floor(frame / 6) % 2 === 0} />
          )
        ) : null}
        {showProjectType ? (
          projectTypeSubmitted ? (
            <SubmittedPrompt message="Select project type" value="Web" />
          ) : (
            <PromptFrame message="Select project type" options={PROJECT_TYPE_OPTIONS} multi first />
          )
        ) : null}
        {showWeb ? <PromptFrame message="Choose web" options={WEB_OPTIONS} /> : null}
      </div>
    </div>
  );
};
