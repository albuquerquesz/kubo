import { loadFont } from "@remotion/google-fonts/JetBrainsMono";
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

import { CLI_PHASES } from "../lib/timing";

type CliSelectPanelProps = {
  command?: string;
  style?: React.CSSProperties;
};

const { fontFamily: MONO } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const ACCENT = "#FFD84A";
const DIM = "#686868";
const WHITE = "#F5F5F5";

/** Type scale inside the CLI panel (JetBrains Mono throughout). */
const TYPE = {
  command: 26,
  body: 24,
  option: 24,
  hint: 16,
  tree: 20,
  footer: 16,
  banner: 15,
} as const;

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

const monoStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: MONO,
  ...extra,
});

const cursorStyle = (visible: boolean): React.CSSProperties => ({
  display: "inline-block",
  width: 11,
  height: 26,
  marginLeft: 3,
  background: visible ? ACCENT : "transparent",
  verticalAlign: "-3px",
  fontFamily: MONO,
});

const CliOptionRow: React.FC<{ option: CliOption; multi?: boolean }> = ({
  option,
  multi = false,
}) => {
  const marker = multi ? (option.selected ? "◼" : "◻") : option.selected ? "●" : "○";
  const markerColor = option.selected ? ACCENT : DIM;

  return (
    <div
      style={monoStyle({
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        minWidth: 0,
        color: option.selected ? WHITE : "#9A9A9A",
        fontSize: TYPE.option,
        lineHeight: 1.28,
      })}
    >
      <span style={monoStyle({ width: 20, flexShrink: 0, color: markerColor })}>{marker}</span>
      <span style={monoStyle({ minWidth: 0 })}>{option.label}</span>
      <span style={monoStyle({ color: DIM, fontSize: TYPE.hint, whiteSpace: "nowrap" })}>
        ({option.hint})
      </span>
    </div>
  );
};

const SubmittedPrompt: React.FC<{ message: string; value: string }> = ({ message, value }) => (
  <div style={monoStyle({ display: "flex", flexDirection: "column", gap: 6 })}>
    <div style={monoStyle({ color: DIM, fontSize: TYPE.tree, lineHeight: 1 })}>│</div>
    <div
      style={monoStyle({
        display: "flex",
        gap: 10,
        color: "#A6E3A1",
        fontSize: TYPE.body,
        lineHeight: 1.25,
      })}
    >
      <span>◇</span>
      <span style={monoStyle({ color: WHITE })}>{message}</span>
    </div>
    <div
      style={monoStyle({ paddingLeft: 28, color: DIM, fontSize: TYPE.option, lineHeight: 1.28 })}
    >
      {value}
    </div>
  </div>
);

const PromptFrame: React.FC<{
  message: string;
  options: CliOption[];
  multi?: boolean;
  first?: boolean;
}> = ({ message, options, multi = false, first = false }) => {
  return (
    <div style={monoStyle({ display: "flex", flexDirection: "column", gap: 6 })}>
      <div style={monoStyle({ color: DIM, fontSize: TYPE.tree, lineHeight: 1 })}>│</div>
      <div
        style={monoStyle({
          display: "flex",
          gap: 10,
          color: ACCENT,
          fontSize: TYPE.body,
          lineHeight: 1.25,
        })}
      >
        <span>◆</span>
        <span style={monoStyle({ color: WHITE })}>{message}</span>
      </div>
      <div style={monoStyle({ paddingLeft: 28, display: "flex", flexDirection: "column", gap: 5 })}>
        {options.map((option) => (
          <CliOptionRow key={option.label} option={option} multi={multi} />
        ))}
      </div>
      <div style={monoStyle({ color: ACCENT, fontSize: TYPE.tree, lineHeight: 1 })}>└</div>
      <div
        style={monoStyle({ paddingLeft: 28, color: DIM, fontSize: TYPE.footer, lineHeight: 1.3 })}
      >
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
  <div style={monoStyle({ display: "flex", flexDirection: "column", gap: 7 })}>
    <div style={monoStyle({ color: DIM, fontSize: TYPE.tree, lineHeight: 1 })}>│</div>
    <div
      style={monoStyle({
        display: "flex",
        gap: 10,
        color: ACCENT,
        fontSize: TYPE.body,
        lineHeight: 1.25,
      })}
    >
      <span>◆</span>
      <span style={monoStyle({ color: WHITE })}>
        Enter your project name or path (relative to current directory)
      </span>
    </div>
    <div
      style={monoStyle({ paddingLeft: 28, color: WHITE, fontSize: TYPE.option, lineHeight: 1.28 })}
    >
      {value}
      <span style={cursorStyle(cursorVisible)} />
    </div>
    <div style={monoStyle({ color: ACCENT, fontSize: TYPE.tree, lineHeight: 1 })}>└</div>
  </div>
);

const SubmittedName: React.FC<{ value: string }> = ({ value }) => (
  <div style={monoStyle({ display: "flex", flexDirection: "column", gap: 6 })}>
    <div style={monoStyle({ color: DIM, fontSize: TYPE.tree, lineHeight: 1 })}>│</div>
    <div
      style={monoStyle({
        display: "flex",
        gap: 10,
        color: "#A6E3A1",
        fontSize: TYPE.body,
        lineHeight: 1.25,
      })}
    >
      <span>◇</span>
      <span style={monoStyle({ color: WHITE })}>
        Enter your project name or path (relative to current directory)
      </span>
    </div>
    <div
      style={monoStyle({ paddingLeft: 28, color: DIM, fontSize: TYPE.option, lineHeight: 1.28 })}
    >
      {value}
    </div>
  </div>
);

const Intro: React.FC = () => (
  <div style={monoStyle({ color: ACCENT, fontSize: TYPE.body, lineHeight: 1.35 })}>
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
    <div style={monoStyle({ color: WHITE, fontSize: TYPE.command, lineHeight: 1.3 })}>
      <span style={monoStyle({ color: ACCENT })}>$</span> {shown}
      {isTyping ? <span style={cursorStyle(Math.floor(frame / 6) % 2 === 0)} /> : null}
    </div>
  );
};

/** Deterministic visual playback of the create-kubojs @clack session (7s square). */
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
      style={monoStyle({
        background: "#0d0d0d",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 28px 90px rgba(0,0,0,0.55)",
        width: "100%",
        boxSizing: "border-box",
        padding: "36px 40px 32px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        minHeight: 0,
        ...style,
      })}
    >
      <div
        style={monoStyle({
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "stretch",
        })}
      >
        <CommandLine command={command} frame={frame} />
        {showBanner ? (
          <pre
            style={monoStyle({
              margin: 0,
              color: "transparent",
              fontSize: TYPE.banner,
              lineHeight: 1.08,
              letterSpacing: "-0.05em",
              whiteSpace: "pre",
              backgroundImage: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}, ${ACCENT}, ${ACCENT})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
            })}
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
