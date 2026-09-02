import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/i18n/server";
import { cn } from "@/lib/utils";

type CustomStackPanelProps = {
  variant?: "stack-builder" | "documentation" | "integrations";
  sectionId?: string;
  titleId?: string;
  className?: string;
  showSideBorders?: boolean;
  showViewportTopRule?: boolean;
  showViewportBottomRule?: boolean;
};

export default async function CustomStackPanel({
  variant = "stack-builder",
  sectionId = "builder",
  titleId = "custom-stack-title",
  className,
  showSideBorders = true,
  showViewportTopRule = true,
  showViewportBottomRule = true,
}: CustomStackPanelProps) {
  const t = getDictionary(await getLocale());
  const { panels } = t;

  const content =
    variant === "documentation"
      ? {
          title: panels.documentation.title,
          description: panels.documentation.description,
          cta: panels.documentation.cta,
          href: "/docs",
          imageSrc: "/assets/kubo-bg-3.png",
          imageAlt: panels.documentation.imageAlt,
        }
      : variant === "integrations"
        ? {
            title: panels.integrations.title,
            imageSrc: "/assets/kubo-bg.png",
            description: panels.integrations.description,
            cta: panels.integrations.cta,
            href: "/new",
            imageAlt: panels.integrations.imageAlt,
          }
        : {
            title: panels.stackBuilder.title,
            imageSrc: "/assets/kubo-bg-4.png",
            description: (
              <>
                {panels.stackBuilder.descriptionBefore}
                <span className="text-foreground">{panels.stackBuilder.descriptionHighlight}</span>
                {panels.stackBuilder.descriptionAfter}
              </>
            ),
            cta: panels.stackBuilder.cta,
            href: "/new",
            imageAlt: panels.stackBuilder.imageAlt,
          };

  return (
    <section
      id={sectionId}
      aria-labelledby={titleId}
      className={cn(
        "custom-stack-panel ui-scroll-target mx-auto mt-12 mb-12 w-full min-w-0 max-w-[1240px] border-rule bg-background sm:mt-16 sm:mb-16 lg:mt-20 lg:mb-20",
        showSideBorders && "border-x",
        !showViewportTopRule && "custom-stack-panel--no-top-rule",
        !showViewportBottomRule && "custom-stack-panel--no-bottom-rule",
        className,
      )}
    >
      <div className="border-rule flex flex-col gap-4 border-b px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-7 lg:min-h-[6.5rem] lg:px-6 lg:py-6">
        <h2 id={titleId} className="ui-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[0.95]">
          {content.title}
        </h2>
        <Link
          href={content.href}
          className={cn(
            buttonVariants({ variant: "cta", size: "xl" }),
            "shrink-0 self-start sm:self-center",
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

      <div className="border-rule border-b px-4 py-6 sm:px-6 lg:px-6 lg:py-6">
        <p className="text-lg leading-snug text-muted-foreground lg:text-xl">
          {content.description}
        </p>
      </div>

      <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-6 lg:py-6">
        <div className="relative aspect-[1.9] min-h-[16rem] w-full min-w-0 max-w-full overflow-hidden bg-muted sm:min-h-0">
          <Image
            src={content.imageSrc}
            alt={content.imageAlt}
            fill
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 100vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 py-4 sm:px-6 lg:px-6">
        {panels.features.map((feature) => (
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
