import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type MosaicTone = "featured" | "card" | "muted";

type MosaicItem = {
  id: string;
  index: string;
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  tone: MosaicTone;
  layoutClassName: string;
};

const mosaicItems = [
  {
    id: "start",
    index: "01",
    href: "/new",
    eyebrow: "Start a project",
    title: "Build the stack you actually want to own.",
    description: "Compose compatible choices in the browser, then take the source code with you.",
    tone: "featured",
    layoutClassName: "md:col-span-6 lg:col-span-5 lg:col-start-4 lg:row-span-2 lg:row-start-1",
  },
  {
    id: "builder",
    index: "02",
    href: "/new",
    eyebrow: "Stack builder",
    title: "Choose every layer.",
    description: "Runtime, API, auth, database, and tooling—resolved as one coherent system.",
    tone: "card",
    layoutClassName: "md:col-span-3 lg:col-span-3 lg:col-start-1 lg:row-span-2 lg:row-start-1",
  },
  {
    id: "docs",
    index: "03",
    href: "/docs",
    eyebrow: "Documentation",
    title: "Read the architecture.",
    description: "Guides for the CLI, generated projects, and the decisions behind each layer.",
    tone: "muted",
    layoutClassName: "md:col-span-3 lg:col-span-4 lg:col-start-9 lg:row-start-1",
  },
  {
    id: "catalog",
    index: "04",
    href: "/stack",
    eyebrow: "Stack catalog",
    title: "Browse the available parts.",
    description: "Inspect the technologies and integrations that can make up your next project.",
    tone: "card",
    layoutClassName: "md:col-span-3 lg:col-span-4 lg:col-start-9 lg:row-start-2",
  },
  {
    id: "analytics",
    index: "05",
    href: "/analytics",
    eyebrow: "Analytics",
    title: "Inspect the signals.",
    description: "See public adoption and ecosystem activity around Kubo.",
    tone: "muted",
    layoutClassName: "md:col-span-3 lg:col-span-3 lg:col-start-1 lg:row-start-3",
  },
  {
    id: "showcase",
    index: "06",
    href: "/showcase",
    eyebrow: "Community projects",
    title: "See what people ship.",
    description: "Explore projects made with the stack and patterns worth borrowing.",
    tone: "card",
    layoutClassName: "md:col-span-3 lg:col-span-5 lg:col-start-4 lg:row-start-3",
  },
  {
    id: "sponsors",
    index: "07",
    href: "/sponsors",
    eyebrow: "Sponsor the project",
    title: "Keep the generator open.",
    description:
      "Support steady maintenance for the tools and documentation the community relies on.",
    tone: "muted",
    layoutClassName: "md:col-span-3 lg:col-span-9 lg:col-start-4 lg:row-start-4",
  },
] as const satisfies readonly MosaicItem[];

const toneClassNames: Record<MosaicTone, string> = {
  featured:
    "bg-primary text-primary-foreground hover:bg-accent hover:ring-primary-foreground/45 active:bg-primary/90",
  card: "bg-card hover:bg-muted hover:ring-primary/70 active:bg-muted/70",
  muted: "bg-muted hover:bg-card hover:ring-primary/70 active:bg-muted/70",
};

function MosaicTile({ item }: { item: MosaicItem }) {
  const isFeatured = item.tone === "featured";
  const labelClassName = isFeatured ? "text-primary-foreground/70" : "text-primary";
  const descriptionClassName = isFeatured ? "text-primary-foreground/80" : "text-muted-foreground";
  const arrowClassName = isFeatured ? "text-primary-foreground" : "text-primary";

  return (
    <Link
      href={item.href}
      className={`group relative min-h-40 p-5 outline-none ring-1 ring-transparent motion-safe:transition-[background-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring hover:ring-1 sm:min-h-48 sm:p-6 lg:min-h-0 lg:p-7 ${toneClassNames[item.tone]} ${item.layoutClassName}`}
    >
      <span className="flex h-full min-h-0 flex-col justify-between overflow-hidden">
        <span className="flex items-center justify-between gap-4">
          <span className={`ui-kicker ${labelClassName}`}>
            {item.index} / {item.eyebrow}
          </span>
          <ArrowUpRight
            className={`size-4 shrink-0 ${arrowClassName} motion-safe:transition-transform motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1`}
            aria-hidden
          />
        </span>

        <span className="mt-auto pt-4">
          <span className="block max-w-md text-2xl font-semibold leading-[1.02] tracking-tight sm:text-3xl">
            {item.title}
          </span>
          <span className={`mt-3 block max-w-md text-sm leading-relaxed ${descriptionClassName}`}>
            {item.description}
          </span>
        </span>
      </span>
    </Link>
  );
}

function StructuralCell({ index, className }: { index: string; className: string }) {
  return (
    <div
      aria-hidden
      className={`ui-rule-grid relative hidden min-h-0 bg-background/40 p-5 lg:block ${className}`}
    >
      <span className="ui-kicker text-muted-foreground/60">Idle / {index}</span>
      <span className="absolute right-5 bottom-5 size-2 border border-primary/70" />
    </div>
  );
}

export default function ProductMosaicSection() {
  return (
    <section
      id="explore"
      className="ui-scroll-target border-rule border-b"
      aria-labelledby="explore-title"
    >
      <div className="grid lg:grid-cols-12">
        <div className="border-rule p-5 sm:p-8 lg:col-span-4 lg:border-r lg:p-10">
          <p className="ui-kicker text-primary">02 / Navigate</p>
          <p className="mt-5 max-w-xs leading-relaxed text-muted-foreground">
            One generator, several useful ways into the work.
          </p>
        </div>
        <div className="p-5 sm:p-8 lg:col-span-8 lg:p-10">
          <h2
            id="explore-title"
            className="ui-display max-w-5xl text-[clamp(2.7rem,5.5vw,5.8rem)] leading-[0.92]"
          >
            One stack.
            <br />
            <span className="text-primary">Your next move.</span>
          </h2>
        </div>
      </div>

      <nav
        aria-label="Explore Kubo"
        className="grid gap-px border-rule border-t bg-rule md:grid-cols-6 lg:auto-rows-[12rem] lg:grid-cols-12"
      >
        {mosaicItems.map((item) => (
          <MosaicTile key={item.id} item={item} />
        ))}
        <StructuralCell index="A" className="lg:col-span-4 lg:col-start-9 lg:row-start-3" />
        <StructuralCell index="B" className="lg:col-span-3 lg:col-start-1 lg:row-start-4" />
      </nav>
    </section>
  );
}
