"use client";

import { useEffect, useState } from "react";

import { onReducedMotionChange, prefersReducedMotion } from "@/lib/motion/reduced-motion";
import {
  CORE_STACK_SUMMARY,
  getStackFlowTerminalState,
  KUBO_CLI_BANNER,
  PROJECT_TYPE_OPTIONS,
  REPRODUCIBLE_COMMAND,
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

function TerminalSummary() {
  return (
    <div className="space-y-3 border-t border-zinc-800 pt-4">
      <p className="flex gap-2 text-yellow-300">
        <span aria-hidden="true">◆</span>
        <span className="text-zinc-100">Project configuration ready</span>
      </p>
      <dl className="grid min-w-0 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {CORE_STACK_SUMMARY.map(([label, value]) => (
          <div key={label} className="grid min-w-0 grid-cols-[auto_1fr] gap-2">
            <dt className="text-zinc-500">{label}:</dt>
            <dd className="min-w-0 break-words text-zinc-200">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function AccessibleTranscript() {
  return (
    <p className="sr-only">
      Demonstração animada do Create Path do Kubo. O comando bun create kubojs@latest seleciona o
      projeto my-kubo-app com TanStack Router, Hono, Bun, tRPC, SQLite, Drizzle, Better Auth,
      GetMonitor e Turborepo, e termina com o projeto criado com sucesso.
    </p>
  );
}

export default function KuboCliTerminal() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

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

  return (
    <div className="min-w-0">
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
      >
        <div className="flex items-center gap-2 border-zinc-800 border-b bg-zinc-900/80 px-5 py-3 sm:px-6">
          <span className="size-2.5 rounded-full bg-red-400/90" />
          <span className="size-2.5 rounded-full bg-yellow-300/90" />
          <span className="size-2.5 rounded-full bg-emerald-400/90" />
          <span className="ml-2 font-mono text-[0.65rem] text-zinc-500 uppercase tracking-[0.16em]">
            kubojs · create
          </span>
        </div>

        <div className="overflow-hidden p-5 font-mono text-[0.7rem] leading-relaxed sm:p-8 sm:text-xs lg:p-10 lg:text-sm">
          <div className="min-w-0 space-y-5">
            <p className="break-words text-zinc-100">
              <span className="text-yellow-300">$</span> <span>{state.visibleCommand}</span>
              {state.commandTyping ? <Cursor visible={state.commandCursorVisible} /> : null}
            </p>

            {state.showBanner ? (
              <pre className="max-w-full overflow-x-auto whitespace-pre text-[0.38rem] text-yellow-300 leading-[1.08] sm:text-[0.48rem] lg:text-[0.62rem]">
                {KUBO_CLI_BANNER}
              </pre>
            ) : null}

            {state.showIntro ? (
              <p className="text-yellow-300">
                <span className="text-zinc-500">┌</span> Creating a new kubojs project
              </p>
            ) : null}

            {state.showProjectName ? (
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
            ) : null}

            {state.showProjectType ? (
              <PromptBlock
                message="Select project type"
                options={PROJECT_TYPE_OPTIONS}
                submitted={state.projectTypeComplete}
                value="Web"
                multi
              />
            ) : null}

            {state.showWebFramework ? (
              <PromptBlock
                message="Choose web"
                options={WEB_OPTIONS}
                submitted={state.webFrameworkComplete}
                value="TanStack Router"
              />
            ) : null}

            {state.showSummary ? <TerminalSummary /> : null}

            {state.showReproducibleCommand ? (
              <div className="space-y-2 border-t border-zinc-800 pt-4">
                <p className="flex gap-2 text-emerald-300">
                  <span aria-hidden="true">◇</span>
                  <span className="text-zinc-100">
                    You can reproduce this setup with the following command:
                  </span>
                </p>
                <code className="block break-words rounded-lg bg-zinc-900 px-3 py-2 text-zinc-400">
                  {REPRODUCIBLE_COMMAND}
                </code>
              </div>
            ) : null}

            {state.showSuccess ? (
              <p className="flex gap-2 text-emerald-300">
                <span aria-hidden="true">└</span>
                <span>Project created successfully in 0.42 seconds!</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <AccessibleTranscript />
    </div>
  );
}
