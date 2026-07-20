import { cn } from "@/lib/utils";

/**
 * Original Better T Stack decorative field for the home hero.
 * Dark grid + occasional gold signals + muted stack-config glyphs.
 * Never carries meaning, focus, or pointer capture.
 *
 * @see docs/spec-home-editorial-system.md — SignalField
 */

type CellKind = "idle" | "signal" | "line" | "glyph";

type Cell = {
  kind: CellKind;
  glyph?: string;
  /** Stagger delay in seconds */
  delay: number;
  /** Cycle length in seconds */
  duration: number;
};

/** Fixed arrangement — deterministic, no runtime random, reduced-motion safe via CSS. */
const CELLS: readonly Cell[] = [
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "glyph", glyph: "ts", delay: 0.2, duration: 3.8 },
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "signal", delay: 0.4, duration: 2.8 },
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "line", delay: 0.9, duration: 3.4 },
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "glyph", glyph: "orm", delay: 1.1, duration: 4.2 },
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "signal", delay: 0.6, duration: 3.6 },
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "glyph", glyph: "api", delay: 1.4, duration: 3.0 },
  { kind: "line", delay: 0.3, duration: 4.0 },
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "signal", delay: 1.8, duration: 2.6 },
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "glyph", glyph: "auth", delay: 0.7, duration: 3.5 },
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "signal", delay: 1.2, duration: 4.4 },
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "line", delay: 2.0, duration: 3.1 },
  { kind: "idle", delay: 0, duration: 3.2 },
  { kind: "glyph", glyph: "db", delay: 0.5, duration: 3.9 },
  { kind: "idle", delay: 0, duration: 3.2 },
];

function CellContent({ cell }: { cell: Cell }) {
  const style = {
    ["--signal-delay" as string]: `${cell.delay}s`,
    ["--signal-duration" as string]: `${cell.duration}s`,
  };

  if (cell.kind === "signal") {
    return <span className="signal-cell-pulse size-2.5 bg-primary sm:size-3" style={style} />;
  }

  if (cell.kind === "line") {
    return <span className="signal-cell-pulse h-px w-8 bg-primary/80 sm:w-10" style={style} />;
  }

  if (cell.kind === "glyph" && cell.glyph) {
    return (
      <span
        className="signal-glyph-swap font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground sm:text-[0.6875rem]"
        style={style}
      >
        {cell.glyph}
      </span>
    );
  }

  return <span className="size-1 bg-rule" />;
}

export default function SignalField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none select-none border-rule border-t",
        "aspect-[16/9] w-full overflow-hidden sm:aspect-[4/3] lg:aspect-auto lg:h-36",
        className,
      )}
    >
      <div className="grid h-full grid-cols-6 gap-px bg-rule sm:grid-cols-8 lg:grid-cols-12">
        {CELLS.map((cell, index) => (
          <div
            key={`${cell.kind}-${index}`}
            className="flex items-center justify-center bg-background"
          >
            <CellContent cell={cell} />
          </div>
        ))}
      </div>
    </div>
  );
}
