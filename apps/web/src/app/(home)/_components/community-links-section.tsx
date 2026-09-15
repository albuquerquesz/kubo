import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import CommunityLinksGrid from "./community-links-grid";

export default function CommunityLinksSection() {
  return (
    <section
      aria-label="Funcionalidades da CLI"
      className="border-rule border-b px-5 pt-6 pb-16 sm:px-8 sm:pt-8 sm:pb-20 lg:px-10 lg:pt-10 lg:pb-16"
    >
      <div className="flex flex-col gap-6 pb-8 sm:pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_auto] lg:gap-x-6 lg:gap-y-4 lg:pb-12">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:col-start-1 lg:row-start-1">
          O projeto não para na criação.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-center">
          Instale skills, conecte agentes e adicione recursos quando seu projeto pedir.
        </p>
        <Button
          className="lg:col-start-2 lg:row-start-2 lg:self-center"
          nativeButton={false}
          render={<Link href="/docs/cli" />}
          variant="cta"
          size="xl"
        >
          Explorar recursos
          <ArrowUpRight aria-hidden data-icon="inline-end" />
        </Button>
      </div>
      <CommunityLinksGrid />
    </section>
  );
}
