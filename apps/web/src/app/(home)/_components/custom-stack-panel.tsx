import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stackFeatures = [
  "FRONTEND + BACKEND",
  "CONFIGURAÇÃO DE DATABASE",
  "AUTH E PAGAMENTOS",
  "PRODUCTION-READY",
] as const;

type CustomStackPanelProps = {
  variant?: "stack-builder" | "documentation";
  sectionId?: string;
  titleId?: string;
  className?: string;
  showSideBorders?: boolean;
  showViewportTopRule?: boolean;
  showViewportBottomRule?: boolean;
};

export default function CustomStackPanel({
  variant = "stack-builder",
  sectionId = "product",
  titleId = "custom-stack-title",
  className,
  showSideBorders = true,
  showViewportTopRule = true,
  showViewportBottomRule = true,
}: CustomStackPanelProps) {
  const content =
    variant === "documentation"
      ? {
          title: "Construa com o Kubo.",
          description:
            "Consulte guias práticos para entender cada camada, configurar seu projeto e colocá-lo em produção.",
          cta: "Ler documentação",
          href: "/docs",
          imageAlt: "Exemplo de código gerado pelo Kubo",
        }
      : {
          title: "Monte sua stack.",
          description:
            "Escolha cada camada no Stack Builder e gere uma base TypeScript pronta para evoluir com o seu projeto.",
          cta: "Abra o Stack Builder",
          href: "/new",
          imageAlt: "Interface do Stack Builder do Kubo",
        };

  return (
    <section
      id={sectionId}
      aria-labelledby={titleId}
      className={cn(
        "custom-stack-panel ui-scroll-target mx-auto mt-12 mb-12 w-full max-w-[1240px] border-rule bg-background sm:mt-16 sm:mb-16 lg:mt-20 lg:mb-20",
        showSideBorders && "border-x",
        !showViewportTopRule && "custom-stack-panel--no-top-rule",
        !showViewportBottomRule && "custom-stack-panel--no-bottom-rule",
        className,
      )}
    >
      <div className="border-rule border-b px-4 py-6 sm:px-6 sm:py-7 lg:flex lg:min-h-[6.5rem] lg:items-center lg:justify-between lg:px-6 lg:py-6">
        <h2 id={titleId} className="ui-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[0.95]">
          {content.title}
        </h2>
        <Link
          href={content.href}
          className={cn(
            buttonVariants({ variant: "cta" }),
            "mt-5 min-h-12 px-4 py-3 text-sm lg:mt-0",
          )}
        >
          {content.cta}
          <ArrowUpRight
            aria-hidden
            data-icon="inline-end"
            className="size-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover/button:-translate-y-0.5 motion-safe:group-hover/button:translate-x-0.5"
          />
        </Link>
      </div>

      <p className="border-rule border-b px-4 py-6 text-lg leading-snug text-muted-foreground sm:px-6 lg:px-6 lg:py-6 lg:text-xl">
        {content.description}
      </p>

      <div className="px-4 py-6 sm:px-6 lg:px-6 lg:py-6">
        <div className="relative aspect-[1.9] min-h-[16rem] overflow-hidden bg-muted sm:min-h-0">
          <Image
            src="/assets/kubo-bg.png"
            alt={content.imageAlt}
            fill
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 100vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 py-4 sm:px-6 lg:px-6">
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
