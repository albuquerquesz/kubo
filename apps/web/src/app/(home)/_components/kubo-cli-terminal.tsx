"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { onReducedMotionChange, prefersReducedMotion } from "@/lib/motion/reduced-motion";
import {
  getStackFlowTerminalState,
  BACKEND_OPTIONS,
  DATABASE_OPTIONS,
  KUBO_CLI_BANNER,
  PROJECT_TYPE_OPTIONS,
  RUNTIME_OPTIONS,
  WEB_OPTIONS,
  type TerminalOption,
} from "@/lib/stack-flow-terminal";

function Cursor({ visible }: { visible: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="ml-1 inline-block h-[1.1em] w-[0.55em] align-[-0.15em] bg-yellow-300"
      style={{ opacity: visible ? 1 : 0 }}
    />
  );
}

function OptionRow({ option, multi = false }: { option: TerminalOption; multi?: boolean }) {
  const marker = multi ? (option.selected ? "◼" : "◻") : option.selected ? "●" : "○";

  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-zinc-300">
      <span className={option.selected ? "text-yellow-300" : "text-zinc-600"}>{marker}</span>
      <span>{option.label}</span>
      <span className="text-zinc-500">({option.hint})</span>
    </div>
  );
}

function TerminalTreeStep({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-5">
      <span aria-hidden="true" className="absolute -top-5 left-0 h-5 text-zinc-600 leading-5">
        │
      </span>
      {children}
    </div>
  );
}

function PromptBlock({
  message,
  options,
  submitted,
  value,
  multi = false,
}: {
  message: string;
  options: readonly TerminalOption[];
  submitted: boolean;
  value: string;
  multi?: boolean;
}) {
  if (submitted) {
    return (
      <div className="space-y-1">
        <p className="flex gap-2 text-emerald-300">
          <span aria-hidden="true">◇</span>
          <span className="text-zinc-100">{message}</span>
        </p>
        <p className="pl-6 text-zinc-400">{value}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="flex gap-2 text-yellow-300">
        <span aria-hidden="true">◆</span>
        <span className="text-zinc-100">{message}</span>
      </p>
      <div className="space-y-1 pl-6">
        {options.map((option) => (
          <OptionRow key={option.label} option={option} multi={multi} />
        ))}
      </div>
      <p className="pl-6 text-[0.8em] text-zinc-500">
        ↑/↓ navigate • {multi ? "space select • " : ""}enter confirm • ctrl+c cancel
      </p>
    </div>
  );
}

function AccessibleTranscript() {
  return (
    <p className="sr-only">
      Demonstração animada do Create Path do Kubo. O comando bun create kubojs@latest seleciona o
      projeto my-kubo-app com TanStack Router, Elysia, Bun e PostgreSQL.
    </p>
  );
}

export default function KuboCliTerminal() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    return onReducedMotionChange(setReducedMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion !== false) return;

    let animationFrame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      setElapsedMs(now - startedAt);
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [reducedMotion]);

  const state = getStackFlowTerminalState(elapsedMs, reducedMotion === true);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    content.scrollTop = state.phase === "command" ? 0 : content.scrollHeight;
  }, [state.phase]);

  return (
    <div className="h-full min-w-0">
      <div
        aria-hidden="true"
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
      >
        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-y-auto p-5 font-mono text-xs leading-relaxed sm:p-8 sm:text-sm lg:p-10 lg:text-base"
        >
          <div className="min-w-0">
            <p className="break-words text-zinc-100">
              <span className="text-yellow-300">$</span> <span>{state.visibleCommand}</span>
              {state.commandTyping ? <Cursor visible={state.commandCursorVisible} /> : null}
            </p>

            {state.showBanner ? (
              <pre className="mt-5 max-w-full overflow-x-auto whitespace-pre font-mono text-xs text-yellow-300 leading-[1.08] sm:text-sm lg:text-base">
                {KUBO_CLI_BANNER}
              </pre>
            ) : null}

            {state.showProjectName ? (
              <TerminalTreeStep>
                <div className="space-y-2">
                  {state.projectNameComplete ? (
                    <>
                      <p className="flex gap-2 text-emerald-300">
                        <span aria-hidden="true">◇</span>
                        <span className="text-zinc-100">
                          Enter your project name or path (relative to current directory)
                        </span>
                      </p>
                      <p className="pl-6 text-zinc-400">my-kubo-app</p>
                    </>
                  ) : (
                    <>
                      <p className="flex gap-2 text-yellow-300">
                        <span aria-hidden="true">◆</span>
                        <span className="text-zinc-100">
                          Enter your project name or path (relative to current directory)
                        </span>
                      </p>
                      <p className="pl-6 text-zinc-100">
                        {state.visibleProjectName}
                        {state.projectNameTyping ? (
                          <Cursor visible={state.projectNameCursorVisible} />
                        ) : null}
                      </p>
                    </>
                  )}
                </div>
              </TerminalTreeStep>
            ) : null}

            {state.showProjectType ? (
              <TerminalTreeStep>
                <PromptBlock
                  message="Select project type"
                  options={PROJECT_TYPE_OPTIONS}
                  submitted={state.projectTypeComplete}
                  value="Web"
                  multi
                />
              </TerminalTreeStep>
            ) : null}

            {state.showWebFramework ? (
              <TerminalTreeStep>
                <PromptBlock
                  message="Choose web"
                  options={WEB_OPTIONS}
                  submitted={state.webFrameworkComplete}
                  value="TanStack Router"
                />
              </TerminalTreeStep>
            ) : null}

            {state.showBackend ? (
              <TerminalTreeStep>
                <PromptBlock
                  message="Select backend"
                  options={BACKEND_OPTIONS}
                  submitted={state.backendComplete}
                  value="Elysia"
                />
              </TerminalTreeStep>
            ) : null}

            {state.showRuntime ? (
              <TerminalTreeStep>
                <PromptBlock
                  message="Select runtime"
                  options={RUNTIME_OPTIONS}
                  submitted={state.runtimeComplete}
                  value="Bun"
                />
              </TerminalTreeStep>
            ) : null}

            {state.showDatabase ? (
              <TerminalTreeStep>
                <PromptBlock
                  message="Select database"
                  options={DATABASE_OPTIONS}
                  submitted={state.databaseComplete}
                  value="PostgreSQL"
                />
              </TerminalTreeStep>
            ) : null}
          </div>
        </div>
      </div>
      <AccessibleTranscript />
    </div>
  );
}
