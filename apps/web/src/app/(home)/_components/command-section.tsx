import { ArrowUpRight, FileCode2, GitBranch } from "lucide-react";
import Link from "next/link";

export default function CommandSection() {
  return (
    <section id="product" className="ui-scroll-target border-rule border-b">
      <div className="grid border-rule lg:grid-cols-12">
        <div className="border-rule p-5 sm:p-8 lg:col-span-4 lg:border-r lg:p-10">
          <p className="ui-kicker text-primary">01 / Compose</p>
        </div>
        <div className="border-rule p-5 sm:p-8 lg:col-span-8 lg:p-10">
          <h2 className="ui-display max-w-4xl text-[clamp(2.7rem,5.5vw,5.8rem)] leading-[0.92] text-foreground">
            Choose the parts.
            <br />
            Keep the whole.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Kubo resolves compatible choices into a codebase you can read, change, and deploy on
            your own terms.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="ui-rule-grid absolute inset-0 opacity-35" aria-hidden />
        <div className="relative flex min-h-[42rem] flex-col justify-between gap-10 p-5 sm:p-8 lg:p-10">
          <div className="mx-auto my-auto grid w-full max-w-2xl grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-center gap-y-3">
            <div className="border border-primary bg-primary p-5 text-primary-foreground">
              <strong className="block text-xl">App Router</strong>
            </div>
            <div className="h-px bg-primary" aria-hidden />
            <div className="border border-rule bg-background p-5">
              <strong className="block text-xl">Typed API</strong>
            </div>

            <div className="col-start-3 h-8 w-px justify-self-center bg-primary" aria-hidden />

            <div className="col-start-3 border border-rule bg-background p-5">
              <strong className="block text-xl">Runtime</strong>
            </div>

            <div className="col-start-3 h-8 w-px justify-self-center bg-primary" aria-hidden />

            <div className="col-start-3 border border-rule bg-background p-5">
              <strong className="block text-xl">Schema</strong>
            </div>
          </div>

          <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
            <div className="bg-background p-5">
              <GitBranch className="size-4 text-primary" aria-hidden />
              <p className="mt-4 font-semibold">Compatible combinations</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Invalid paths disappear before generation.
              </p>
            </div>
            <Link
              href="/new"
              className="group flex min-h-36 flex-col justify-between bg-primary p-5 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
            >
              <FileCode2 className="size-4" aria-hidden />
              <span className="flex items-end justify-between gap-4 text-xl font-semibold">
                Open the visual builder
                <ArrowUpRight className="size-5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
