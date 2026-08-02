import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import CopyInstallCommandButton from "./copy-install-command-button";
import DotMatrixBackdrop from "./dot-matrix-backdrop";

/** Final conversion CTA; yellow field, black dots, white copy. */
export default function FinalCtaDotMatrix() {
  return (
    <section
      id="cta"
      aria-labelledby="final-cta-title"
      className="final-cta ui-scroll-target relative isolate min-h-[20.375rem] overflow-hidden border-b border-white/20 bg-[#c49314] text-white shadow-none"
    >
      <DotMatrixBackdrop />

      <div className="relative z-10 mx-auto flex min-h-[20.375rem] w-full max-w-[1200px] flex-col justify-center gap-6 px-6 py-20 md:px-8">
        <h2
          id="final-cta-title"
          className="ui-display max-w-[47.5rem] text-balance text-[clamp(2rem,3vw,3.5rem)] leading-[0.93] text-white"
        >
          Pare de montar.
          <br />
          Comece a publicar.
        </h2>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href="/new"
            className={cn(
              buttonVariants({ variant: "cta", size: "xl" }),
              // Invert fill for contrast on the yellow final-CTA field.
              "no-underline bg-black text-white hover:bg-black/85 hover:ring-white/20",
              "focus-visible:outline-white",
            )}
          >
            Monte sua stack
            <ArrowUpRight
              aria-hidden
              data-icon="inline-end"
              className="size-5 shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover/button:-translate-y-0.5 motion-safe:group-hover/button:translate-x-0.5"
            />
          </Link>
          <CopyInstallCommandButton />
        </div>
      </div>
    </section>
  );
}
