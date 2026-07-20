import FeaturedRail, { type FeaturedRailItem } from "./featured-rail";
import HeroDisplayTitle from "./hero-display-title";
import SignalField from "./signal-field";

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
      {/*
        Desktop: 12-col editorial split (~70 / 30) under fixed header.
        Mobile reading order: label → headline → mission/proof (rail) → SignalField.
      */}
      <div className="grid min-h-[calc(100svh-3.5rem)] w-full flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,30%)] lg:grid-rows-1">
        <div className="relative flex min-h-[22rem] w-full flex-col justify-center overflow-hidden py-8 sm:min-h-[28rem] sm:py-10 lg:min-h-0 lg:py-14">
          <HeroDisplayTitle
            title="One command. Every layer. Yours."
            className={
              "text-[clamp(2.75rem,12vw,4.25rem)] leading-[0.96] " +
              "lg:text-[clamp(3.5rem,8vw,8.5rem)] lg:leading-[0.9]"
            }
          >
            One command.
            <br />
            <span className="text-primary">Every layer.</span>
            <br />
            Yours.
          </HeroDisplayTitle>
        </div>

        <FeaturedRail
          mission={mission}
          kicker="Featured"
          items={featuredItems}
          scrollTargetId="product"
        />
      </div>

      <SignalField />
    </section>
  );
}
