import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import DotMatrixBackdrop from "./dot-matrix-backdrop";

/** Final conversion CTA; its canvas backdrop is purely decorative. */
export default function FinalCtaDotMatrix() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="relative isolate min-h-[20.375rem] overflow-hidden border-b border-rule bg-[#050505] text-[#f5f5f5]"
    >
      <DotMatrixBackdrop />

      <div className="relative z-10 mx-auto flex min-h-[20.375rem] w-full max-w-[1200px] flex-col justify-center gap-6 px-6 py-20 md:px-8">
        <h2
          id="final-cta-title"
          className="ui-display max-w-[47.5rem] text-balance text-[clamp(2rem,3vw,3.5rem)] leading-[0.93] text-[#f5f5f5]"
        >
          Pare de montar.
          <br />
          Comece a publicar.
        </h2>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href="/new"
            className="group inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-5 py-3 text-[0.9375rem] font-semibold tracking-[-0.02em] text-primary-foreground no-underline transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
          >
            Monte sua stack
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
            />
          </Link>
          <code className="select-text break-all font-mono text-[0.8125rem] leading-6 text-[#f5f5f5]/55">
            bun create kubojs@latest
          </code>
        </div>
      </div>
    </section>
  );
}
