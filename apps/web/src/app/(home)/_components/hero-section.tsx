import FeaturedRail, { type FeaturedRailItem } from "./featured-rail";

/** Editorial line breaks — Mistral right-rail sentence strategy (one block per line, lg:nowrap). */
const mission = [
  "We give you a full-stack",
  "TypeScript app",
  "from one command",
  "with every layer typed",
  "and every choice yours.",
] as const;

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
    <section
      id="top"
      className="ui-scroll-target flex min-h-[calc(100svh-3.5rem)] w-full flex-col border-rule border-b"
    >
      {/* Full remaining viewport under fixed header (h-14). Desktop: ~70 / 30. Mobile: stack. */}
      <div className="grid min-h-[calc(100svh-3.5rem)] w-full flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,30%)] lg:grid-rows-1">
        <div className="relative flex min-h-[28rem] w-full flex-col justify-center overflow-hidden px-5 py-8 sm:min-h-[36rem] sm:px-8 sm:py-10 lg:min-h-0 lg:px-12 lg:py-14">
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
    </section>
  );
}
