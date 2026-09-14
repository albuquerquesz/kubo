"use client";

import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import KuboCliTerminal from "./kubo-cli-terminal";

export default function StackFlowSection() {
  const router = useRouter();

  return (
    <div className="mx-auto my-12 w-[1200px] max-w-full sm:my-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6 px-1 text-zinc-100">
        <div className="max-w-2xl">
          <h2
            id="stack-flow-title"
            className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl"
          >
            Monte sua stack em minutos.
          </h2>
        </div>
        <Button type="button" variant="cta" size="xl" onClick={() => router.push("/new")}>
          Montar minha stack
          <ArrowUpRight aria-hidden data-icon="inline-end" />
        </Button>
      </div>
      <section
        aria-labelledby="stack-flow-title"
        className="box-border h-[1080px] w-full overflow-hidden rounded-3xl bg-yellow-400 p-16"
      >
        <KuboCliTerminal />
      </section>
    </div>
  );
}
