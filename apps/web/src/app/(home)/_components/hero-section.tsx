import { ArrowDownRight, ArrowUpRight, Check, GitFork } from "lucide-react";
import Link from "next/link";

const buildStages = [
  { index: "01", label: "Frontend", value: "Next.js" },
  { index: "02", label: "API", value: "Elysia" },
  { index: "03", label: "Database", value: "Postgres" },
  { index: "04", label: "Auth", value: "Better Auth" },
] as const;

export default function HeroSection() {
  return (
    <section id="top" className="ui-scroll-target border-rule border-b">
      <div className="grid lg:grid-cols-12">
        <div className="relative flex min-h-[42rem] flex-col justify-center overflow-hidden border-rule px-5 py-8 sm:px-8 sm:py-10 lg:col-span-8 lg:min-h-[calc(100svh-3.5rem)] lg:border-r lg:px-12 lg:py-14">
          <div className="relative max-w-5xl">
            <h1 className="ui-display ui-enter text-[clamp(3.5rem,8vw,8.5rem)] leading-[0.9]">
              One command.
              <br />
              <span className="text-primary">Every layer.</span>
              <br />
              Yours.
            </h1>
          </div>
        </div>

        <aside className="flex flex-col bg-card lg:col-span-4 lg:self-start">
          <div className="relative flex flex-col gap-6 p-5 sm:gap-8 sm:p-8">
            <div
              aria-hidden
              className="absolute top-0 bottom-0 left-10 w-px bg-primary/55 sm:left-14"
            />

            <div className="relative grid gap-3">
              {buildStages.map((stage, index) => (
                <div
                  key={stage.label}
                  className="group grid min-h-20 grid-cols-[3rem_1fr_auto] items-center border border-rule bg-background p-4 transition-colors hover:border-primary sm:min-h-24"
                >
                  <span className="relative z-10 grid size-8 place-items-center bg-primary font-mono text-xs font-semibold text-primary-foreground">
                    {stage.index}
                  </span>
                  <span className="pl-4">
                    <span className="ui-kicker block text-muted-foreground">{stage.label}</span>
                    <span className="mt-1 block text-lg font-semibold">{stage.value}</span>
                  </span>
                  {index < buildStages.length - 1 ? (
                    <GitFork aria-hidden className="size-4 text-muted-foreground" />
                  ) : (
                    <Check aria-hidden className="size-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-px border-rule border-t sm:flex-row">
            <Link
              href="/new"
              className="inline-flex min-h-12 flex-1 items-center justify-between gap-4 bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Build in the browser
              <ArrowUpRight className="size-4 shrink-0" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex min-h-12 flex-1 items-center justify-between gap-4 border-rule px-5 font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:border-l"
            >
              Read the docs
              <ArrowDownRight className="size-4 shrink-0" />
            </Link>
          </div>
        </aside>
      </div>

      <div className="grid border-rule sm:grid-cols-2 lg:grid-cols-4">
        {["Web", "API", "Database", "Infrastructure"].map((label, index) => (
          <div
            key={label}
            className="flex min-h-16 items-center gap-4 border-rule px-5 not-last:border-b sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(-n+2)]:border-b lg:not-last:border-r lg:not-last:border-b-0"
          >
            <span className="ui-kicker text-primary">{String(index + 1).padStart(2, "0")}</span>
            <span className="ui-kicker text-muted-foreground">{label} stays typed</span>
          </div>
        ))}
      </div>
    </section>
  );
}
