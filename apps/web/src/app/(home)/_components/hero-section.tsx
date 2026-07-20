import FeaturedRail, { type FeaturedRailItem } from "./featured-rail";

const mission =
  "Generate full-stack TypeScript apps with one command—every layer typed, every choice yours.";

const featuredItems = [
  {
    id: "builder",
    href: "/new",
    title: "Compose your stack in the browser",
    imageSrc: "/assets/kubo-mark.png",
    imageAlt: "Kubo mark",
  },
  {
    id: "docs",
    href: "/docs",
    title: "Read the architecture guide",
    imageSrc: "/assets/kubo.png",
    imageAlt: "Kubo character art",
  },
  {
    id: "catalog",
    href: "/stack",
    title: "Browse the stack catalog",
    imageSrc: "/assets/kubo-mark.png",
    imageAlt: "Kubo mark",
  },
  {
    id: "showcase",
    href: "/showcase",
    title: "See what people ship",
    imageSrc: "/assets/kubo.png",
    imageAlt: "Kubo character art",
  },
] as const satisfies readonly FeaturedRailItem[];

export default function HeroSection() {
  return (
    <section id="top" className="ui-scroll-target border-rule border-b">
      {/* Desktop: ~70 / 30 split (grammar from featured-rail spec). Mobile: stack option A. */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,30%)]">
        <div className="relative flex min-h-[28rem] flex-col justify-center overflow-hidden px-5 py-8 sm:min-h-[36rem] sm:px-8 sm:py-10 lg:min-h-[calc(100svh-3.5rem)] lg:px-12 lg:py-14">
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

        <FeaturedRail
          mission={mission}
          kicker="Featured"
          items={featuredItems}
          scrollTargetId="product"
        />
      </div>

      <div className="grid border-rule border-t sm:grid-cols-2 lg:grid-cols-4">
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
