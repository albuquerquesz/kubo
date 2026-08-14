import { ArrowUpRight, Box, Braces, GitCompare, LockKeyhole, ServerCog } from "lucide-react";
import Link from "next/link";

const phases = [
  {
    index: "01",
    title: "Answer a few real questions.",
    description: "Runtime, database, auth, API, package manager, and deployment—nothing cosmetic.",
  },
  {
    index: "02",
    title: "Generate one coherent system.",
    description:
      "The generator resolves package boundaries, shared types, scripts, and environment files.",
  },
  {
    index: "03",
    title: "Continue without the generator.",
    description:
      "The result is ordinary source code. Add features, change providers, or remove anything.",
  },
] as const;

const ownershipPoints = [
  {
    icon: Braces,
    label: "Type contracts",
    value: "Across client, API, and data",
  },
  {
    icon: LockKeyhole,
    label: "Credentials",
    value: "Declared as local environment",
  },
  {
    icon: ServerCog,
    label: "Runtime",
    value: "Selected by the project",
  },
] as const;

export default function CapabilitySection() {
  return (
    <section id="capabilities" className="ui-scroll-target border-rule border-b">
      <div className="grid lg:grid-cols-12">
        <div className="border-rule p-5 sm:p-8 lg:col-span-4 lg:border-r lg:p-10">
          <p className="ui-kicker text-primary">03 / Generate</p>
          <p className="mt-5 max-w-xs leading-relaxed text-muted-foreground">
            Scaffolding should remove setup work without removing architectural control.
          </p>
        </div>
        <div className="p-5 sm:p-8 lg:col-span-8 lg:p-10">
          <h2 className="ui-display max-w-5xl text-[clamp(2.7rem,5.5vw,5.8rem)] leading-[0.92]">
            Fast to start.
            <br />
            <span className="text-primary">Boring to own.</span>
          </h2>
        </div>
      </div>

      <div className="grid border-rule border-t lg:grid-cols-12">
        <div className="border-rule bg-primary text-primary-foreground lg:col-span-7 lg:border-r">
          <div className="flex items-center justify-between border-primary-foreground/30 border-b p-5 sm:p-6">
            <p className="ui-kicker">Type ownership map</p>
            <Box className="size-4" aria-hidden />
          </div>

          <div className="grid min-h-[34rem] content-center gap-5 p-5 sm:p-8 lg:p-12">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">
              <div className="border border-primary-foreground/40 bg-background p-5 text-foreground">
                <span className="ui-kicker text-muted-foreground">Input</span>
                <strong className="mt-3 block text-2xl">Stack config</strong>
              </div>
              <div className="h-px w-10 bg-primary-foreground sm:w-20" aria-hidden />
              <div className="border border-primary-foreground/40 bg-accent p-5 text-primary-foreground">
                <span className="ui-kicker text-primary-foreground/65">Processor</span>
                <strong className="mt-3 block text-2xl">Templates</strong>
              </div>
            </div>

            <div className="mx-auto h-16 w-px bg-primary-foreground" aria-hidden />

            <div className="border border-primary-foreground/40 bg-background p-6 text-foreground">
              <div className="flex items-center justify-between gap-4">
                <span className="ui-kicker text-muted-foreground">Output</span>
                <span className="ui-kicker text-primary">No runtime attached</span>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["apps/web", "apps/server", "packages/db"].map((path) => (
                  <code key={path} className="border border-foreground/20 p-3 font-mono text-xs">
                    {path}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:col-span-5">
          <div className="border-rule border-b p-6 sm:p-8">
            <p className="ui-kicker text-muted-foreground">Ownership contract</p>
            <h3 className="mt-5 text-3xl font-semibold tracking-tight">
              Your repository is the product.
            </h3>
          </div>

          {ownershipPoints.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="grid grid-cols-[3rem_1fr] items-start border-rule border-b p-6 last:border-b-0 sm:p-8"
            >
              <Icon className="mt-1 size-4 text-primary" aria-hidden />
              <div>
                <p className="ui-kicker text-muted-foreground">{label}</p>
                <p className="mt-2 text-lg font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid border-rule border-t lg:grid-cols-12">
        <div className="border-rule p-5 sm:p-8 lg:col-span-4 lg:border-r lg:p-10">
          <p className="ui-kicker text-primary">03 / Own</p>
          <h3 className="mt-5 text-3xl font-semibold tracking-tight">From choice to source.</h3>
        </div>
        <ol className="grid lg:col-span-8 lg:grid-cols-3">
          {phases.map((phase) => (
            <li
              key={phase.index}
              className="min-h-64 border-rule p-6 not-last:border-b sm:p-8 lg:not-last:border-r lg:not-last:border-b-0"
            >
              <span className="ui-kicker text-primary">{phase.index}</span>
              <h4 className="mt-12 text-2xl font-semibold leading-tight">{phase.title}</h4>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {phase.description}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid border-rule border-t lg:grid-cols-12">
        <div className="ui-rule-grid flex min-h-80 flex-col justify-between p-6 sm:p-8 lg:col-span-8 lg:border-r lg:p-10">
          <div className="flex items-center justify-between">
            <span className="ui-kicker text-muted-foreground">Deployment posture</span>
            <GitCompare className="size-4 text-primary" aria-hidden />
          </div>
          <p className="ui-display max-w-3xl text-[clamp(2.5rem,5vw,5rem)] leading-[0.9]">
            Take the code
            <br />
            <span className="text-primary">anywhere.</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {["Local first", "CI ready", "Host agnostic"].map((item) => (
              <span key={item} className="ui-kicker border border-rule bg-background px-3 py-2">
                {item}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/docs"
          className="group flex min-h-80 flex-col justify-between bg-card p-6 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:p-8 lg:col-span-4 lg:p-10"
        >
          <span className="ui-kicker text-primary">Architecture guide</span>
          <span className="text-3xl font-semibold tracking-tight">
            See how every generated layer connects.
          </span>
          <span className="flex items-center justify-between border-rule border-t pt-5 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
            Open documentation
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </section>
  );
}
