# Spec: Home Stack Flow CLI Terminal

## Status

Implemented

## Goal

Replace the temporary yellow placeholder below the logo marquee with a dedicated terminal
demonstration of Kubo's Create Path.

The section should communicate the actual Kubo workflow at a glance: type the canonical command,
choose a project shape, confirm the core stack, and finish with a successful project creation state.
The playback is a browser presentation, not Filesystem Scaffolding.

## Decisions

- The displayed command is `bun create kubojs@latest`.
- The experience is a deterministic visual simulation that loops automatically like a GIF.
- It does not execute a shell command, create files, use the network, or accept arbitrary keyboard
  input.
- The demonstrated path uses the default Project Configuration:
  `my-kubo-app`, TanStack Router, Hono, Bun, tRPC, SQLite, Drizzle, Better Auth, GetMonitor, and
  Turborepo.
- The simulation uses the actual prompt labels and selection markers from the CLI, then presents a
  compact core-stack summary before the success state.
- The loop duration is 16 seconds, with a short hold on the completed state before restarting.
- `prefers-reduced-motion` disables the loop and cursor animation and shows the complete transcript.

## Layout

The outer section remains a dedicated `StackFlowSection` component below `LogoMarquee`.

- Preferred width: `1200px`.
- Narrow viewports: `max-width: 100%` with no page-level horizontal overflow.
- Background: the existing yellow surface.
- Internal padding: `64px` minimum at every breakpoint, so the yellow frame remains visible around
  the terminal.
- Height: fixed at `800px` at every breakpoint. The terminal fills the fixed inner viewport and
  scrolls internally as the transcript grows.
- The terminal fills the available inner width and uses a dark shell, rounded corners, subtle border,
  terminal chrome, JetBrains Mono, yellow prompt accents, and green completion accents.
- Long command and option text wraps inside the terminal on narrow screens.

## Playback contract

The implementation must separate the timeline model from the visual renderer.

1. Type `$ bun create kubojs@latest` with a visible cursor.
2. Reveal the Kubo banner and `Creating a new kubojs project`.
3. Type and submit `my-kubo-app`.
4. Show `Select project type` with `Web` selected.
5. Show `Choose web` with `TanStack Router` selected.
6. Reveal the default core-stack summary.
7. Reveal the reproducible command for the demonstrated configuration.
8. Finish with `Project created successfully in 0.42 seconds!`.
9. Restart from the command after the completed-state hold.

Each phase must be represented by a typed playback state. The renderer must only derive visible
content from that state. Animation timers or animation frames must be cleaned up on unmount and when
the reduced-motion preference changes.

The canonical command must come from the existing web create-command helper. The displayed defaults
and CLI labels must be covered by a focused parity fixture, based on the CLI `DEFAULT_CONFIG` and
the output of:

```bash
BTS_TELEMETRY_DISABLED=1 bun apps/cli/src/cli.ts create apps/cli/.smoke/terminal-spec-smoke --yes --dry-run --verbose
```

That command is only a validation reference. The browser component must never invoke it.

## Accessibility

- The animated terminal visual is hidden from assistive technology to avoid repeatedly announcing a
  looping transcript.
- A static screen-reader transcript describes the command, selected stack, and successful result.
- The section has an accessible heading even though the visual heading is omitted.
- The terminal does not use `aria-live` for playback updates.
- Reduced-motion users receive the complete, non-animated transcript.

## Scope boundaries

### In scope

- Dedicated home section and terminal component.
- Typed playback state and deterministic 16-second loop.
- CLI-styled command, prompts, selections, summary, reproducible command, and success state.
- Responsive layout with a 64px yellow frame.
- Fixed 800px section height with internal terminal scrolling.
- Reduced-motion and assistive-technology behavior.
- Focused unit coverage for command, phase order, loop reset, reduced motion, and default values.

### Out of scope

- Running `kubojs` or `create-kubojs` in the browser.
- A browser PTY, xterm integration, arbitrary command input, or project generation.
- Pause, replay, skip, or configuration controls.
- Rendering every possible CLI option or the full Exhaustive Matrix.
- Changes to the CLI, its schemas, default configuration, or generated templates.

## Acceptance criteria

- [ ] The home page renders the terminal section immediately below the logo marquee.
- [ ] The yellow container always exposes at least 64px of internal yellow padding.
- [ ] The terminal shows the canonical command exactly as `bun create kubojs@latest`.
- [ ] The visual sequence follows the defined Create Path and loops without duplicated content.
- [ ] The browser never executes a shell command or writes to the filesystem.
- [ ] Reduced-motion mode renders a stable complete transcript without looping.
- [ ] Mobile layouts have no horizontal page overflow and retain the yellow frame.
- [ ] Focused tests pass, followed by `bun run check` and the web build.
