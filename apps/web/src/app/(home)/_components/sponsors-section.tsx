import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  SiAstro,
  SiBetterauth,
  SiDrizzle,
  SiHono,
  SiNextdotjs,
  SiPrisma,
  SiReact,
  SiSolid,
  SiTrpc,
} from "react-icons/si";

import { ICON_BASE_URL } from "@/lib/constant";

type EcosystemItem = {
  name: string;
  href: string;
} & ({ Icon: IconType } | { iconSrc: string });

const ecosystem: EcosystemItem[] = [
  { name: "Next.js", href: "https://nextjs.org", Icon: SiNextdotjs },
  { name: "React", href: "https://react.dev", Icon: SiReact },
  { name: "Astro", href: "https://astro.build", Icon: SiAstro },
  { name: "Solid", href: "https://www.solidjs.com", Icon: SiSolid },
  { name: "Hono", href: "https://hono.dev", Icon: SiHono },
  // Not in Simple Icons yet — first-party SVG from stack icon set
  { name: "Elysia", href: "https://elysiajs.com", iconSrc: `${ICON_BASE_URL}/elysia.svg` },
  { name: "tRPC", href: "https://trpc.io", Icon: SiTrpc },
  { name: "oRPC", href: "https://orpc.unnoq.com", iconSrc: `${ICON_BASE_URL}/orpc.svg` },
  { name: "Drizzle", href: "https://orm.drizzle.team", Icon: SiDrizzle },
  { name: "Prisma", href: "https://www.prisma.io", Icon: SiPrisma },
  { name: "Convex", href: "https://www.convex.dev", iconSrc: `${ICON_BASE_URL}/convex.svg` },
  { name: "Better Auth", href: "https://www.better-auth.com", Icon: SiBetterauth },
];

function TechIcon({ item }: { item: EcosystemItem }) {
  if ("Icon" in item) {
    const Icon = item.Icon;
    return <Icon className="size-4 shrink-0 text-foreground" aria-hidden />;
  }

  return (
    <img
      src={item.iconSrc}
      alt=""
      width={16}
      height={16}
      className="size-4 shrink-0 object-contain"
      aria-hidden
    />
  );
}

export default function SponsorsSection() {
  return (
    <section aria-labelledby="ecosystem-title" className="border-rule border-b">
      <div className="grid lg:grid-cols-12">
        <div className="border-rule p-5 sm:p-8 lg:col-span-4 lg:border-r lg:p-10">
          <h2 id="ecosystem-title" className="text-3xl font-semibold tracking-tight">
            One generator.
            <br />
            Real choices.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:col-span-8 lg:grid-cols-4">
          {ecosystem.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group flex min-h-24 items-center justify-between border-rule p-5 not-last:border-b transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-child(2n)]:border-r md:[&:nth-child(3n)]:border-r-0 md:[&:nth-last-child(-n+3)]:border-b-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(4n)]:border-r-0 lg:[&:nth-last-child(-n+4)]:border-b-0"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <TechIcon item={item} />
                <span className="font-semibold">{item.name}</span>
              </span>
              <ArrowUpRight
                className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-150 ease-out group-hover:text-foreground motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
