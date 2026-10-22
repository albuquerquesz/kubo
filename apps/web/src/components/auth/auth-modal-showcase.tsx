import Image from "next/image";

import { cn } from "@/lib/utils";

type ShowcaseTile =
  | { kind: "image"; src: string; alt: string; caption: string }
  | { kind: "stack"; caption: string; icons: readonly string[] };

const leftColumn: readonly ShowcaseTile[] = [
  {
    kind: "image",
    src: "/assets/kubo-templates.png",
    alt: "Templates de stack do Kubo",
    caption: "Templates",
  },
  { kind: "stack", caption: "Next + Convex", icons: ["nextjs", "convex", "better-auth"] },
  {
    kind: "image",
    src: "/assets/kubo-bg-3.png",
    alt: "Código gerado pelo Kubo",
    caption: "Código gerado",
  },
  { kind: "stack", caption: "Hono + Drizzle", icons: ["hono", "drizzle", "postgres"] },
];

const rightColumn: readonly ShowcaseTile[] = [
  {
    kind: "image",
    src: "/assets/kubo-bg-4.png",
    alt: "Stack Builder do Kubo",
    caption: "Stack Builder",
  },
  { kind: "stack", caption: "TanStack + Prisma", icons: ["tanstack", "prisma", "neon"] },
  {
    kind: "image",
    src: "/assets/kubo-bg.png",
    alt: "Integrações disponíveis no Kubo",
    caption: "Integrações",
  },
  { kind: "stack", caption: "Turborepo + Bun", icons: ["turborepo", "bun", "biome"] },
];

/** Brazilian integrations shipped by Kubo (same assets as the home logo marquee). */
const brazilianIntegrations = [
  { name: "AbacatePay", src: "/integrations/abacatepay.svg" },
  { name: "Guara Cloud", src: "/integrations/guaracloud.png" },
  { name: "GetMonitor", src: "https://getmonitor.io/logo.svg" },
  { name: "Himetrica", src: "https://www.himetrica.com/himetrica.png" },
  { name: "Notifique.dev", src: "https://notifique.dev/logo-notifique.png" },
  { name: "MillionSend", src: "/integrations/millionsend.svg" },
  { name: "AraraHQ", src: "/integrations/arara.svg" },
] as const;

export function AuthModalShowcase({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative overflow-hidden border-rule border-l bg-muted", className)}
    >
      {/* Absolute so the scrolling columns never stretch the dialog height. */}
      <div className="absolute inset-0 flex flex-col">
        <div className="auth-showcase relative grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-hidden px-5 pt-5">
          <ShowcaseColumn tiles={leftColumn} direction="up" />
          <ShowcaseColumn tiles={rightColumn} direction="down" />
        </div>

        <div className="border-rule border-t px-6 pt-5 pb-8">
          <p className="font-mono text-[0.6875rem] text-muted-foreground uppercase tracking-[0.12em]">
            Integrações brasileiras
          </p>
          <div className="auth-showcase-marquee mt-9 overflow-hidden">
            <div className="auth-showcase-marquee__track flex w-max items-center">
              {[...brazilianIntegrations, ...brazilianIntegrations].map((logo, index) => (
                <img
                  key={`${logo.name}-${index}`}
                  src={logo.src}
                  alt=""
                  title={logo.name}
                  className="mr-10 h-8 w-auto max-w-36 object-contain opacity-60 grayscale"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowcaseColumn({
  tiles,
  direction,
}: {
  tiles: readonly ShowcaseTile[];
  direction: "up" | "down";
}) {
  return (
    <div className="min-h-0 overflow-hidden">
      <div className="auth-showcase__track flex flex-col gap-3" data-direction={direction}>
        {[...tiles, ...tiles].map((tile, index) => (
          <ShowcaseTileCard key={`${tile.caption}-${index}`} tile={tile} />
        ))}
      </div>
    </div>
  );
}

function ShowcaseTileCard({ tile }: { tile: ShowcaseTile }) {
  return (
    <figure className="flex flex-col gap-2">
      {tile.kind === "image" ? (
        <div className="relative aspect-[16/10] overflow-hidden border border-rule bg-card">
          <Image
            src={tile.src}
            alt={tile.alt}
            fill
            sizes="(min-width: 768px) 260px, 0px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="relative flex aspect-[16/10] items-center justify-center gap-4 overflow-hidden border border-rule bg-card ui-rule-grid [background-size:1.5rem_1.5rem]">
          {tile.icons.map((icon) => (
            <span
              key={icon}
              className="flex size-12 items-center justify-center border border-rule bg-background"
            >
              <Image src={`/icon/${icon}.svg`} alt="" width={26} height={26} className="size-6.5" />
            </span>
          ))}
        </div>
      )}
      <figcaption className="font-mono text-[0.6875rem] text-muted-foreground tracking-[0.04em]">
        {tile.caption}
      </figcaption>
    </figure>
  );
}
