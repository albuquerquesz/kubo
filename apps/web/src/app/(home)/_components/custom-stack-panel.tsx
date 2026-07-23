import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const stackFeatures = [
  "FRONTEND + BACKEND",
  "CONFIGURAÇÃO DE DATABASE",
  "AUTH E PAGAMENTOS",
  "PRODUCTION-READY",
] as const;

export default function CustomStackPanel() {
  return (
    <section
      id="product"
      aria-labelledby="custom-stack-title"
      className="custom-stack-panel ui-scroll-target mx-auto mt-12 mb-12 w-full max-w-[1240px] border-rule border-x bg-background sm:mt-16 sm:mb-16 lg:mt-20 lg:mb-20"
    >
      <div className="border-rule border-b px-4 py-6 sm:px-6 sm:py-7 lg:flex lg:min-h-[6.5rem] lg:items-center lg:justify-between lg:px-6 lg:py-6">
        <h2
          id="custom-stack-title"
          className="ui-display text-[clamp(2rem,4vw,3rem)] leading-[0.95]"
        >
          Desenvolvimento de stack personalizada.
        </h2>
        <Link
          href="/new"
          className="mt-5 inline-flex min-h-12 items-center gap-3 rounded-md bg-muted px-4 py-3 text-sm font-medium text-foreground transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:mt-0"
        >
          Monte sua stack
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </div>

      <p className="border-rule border-b px-4 py-6 text-lg leading-snug text-muted-foreground sm:px-6 lg:px-6 lg:py-6 lg:text-xl">
        Transforme suas escolhas de arquitetura em um app TypeScript pronto para produção.
      </p>

      <div className="px-4 py-6 sm:px-6 lg:px-6 lg:py-6">
        <div className="relative aspect-[1.9] min-h-[16rem] overflow-hidden bg-muted sm:min-h-0">
          <Image
            src="/assets/kubo-bg.png"
            alt="Interface do stack builder do Kubo"
            fill
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 100vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-rule border-t px-4 py-4 sm:px-6 lg:px-6">
        {stackFeatures.map((feature) => (
          <span
            key={feature}
            className="bg-muted px-2 py-1 font-mono text-[0.625rem] text-muted-foreground uppercase tracking-[0.04em]"
          >
            {feature}
          </span>
        ))}
      </div>
    </section>
  );
}
