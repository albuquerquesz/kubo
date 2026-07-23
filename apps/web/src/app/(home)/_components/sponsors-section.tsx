import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { TECH_OPTIONS } from "@/lib/constant";
import { cn } from "@/lib/utils";

type EcosystemItem = {
  id: string;
  name: string;
  href: string;
  iconSrc: string;
  className?: string;
};

/** Official product URLs keyed by TECH_OPTIONS id. */
const TECH_HREFS: Record<string, string> = {
  trpc: "https://trpc.io",
  orpc: "https://orpc.unnoq.com",
  "tanstack-router": "https://tanstack.com/router",
  "react-router": "https://reactrouter.com",
  "tanstack-start": "https://tanstack.com/start",
  next: "https://nextjs.org",
  nuxt: "https://nuxt.com",
  svelte: "https://svelte.dev",
  solid: "https://www.solidjs.com",
  astro: "https://astro.build",
  "native-bare": "https://expo.dev",
  "native-uniwind": "https://expo.dev",
  "native-unistyles": "https://expo.dev",
  bun: "https://bun.sh",
  node: "https://nodejs.org",
  workers: "https://workers.cloudflare.com",
  hono: "https://hono.dev",
  elysia: "https://elysiajs.com",
  express: "https://expressjs.com",
  fastify: "https://fastify.dev",
  convex: "https://www.convex.dev",
  sqlite: "https://www.sqlite.org",
  postgres: "https://www.postgresql.org",
  mysql: "https://www.mysql.com",
  mongodb: "https://www.mongodb.com",
  drizzle: "https://orm.drizzle.team",
  prisma: "https://www.prisma.io",
  mongoose: "https://mongoosejs.com",
  turso: "https://turso.tech",
  d1: "https://developers.cloudflare.com/d1",
  neon: "https://neon.tech",
  supabase: "https://supabase.com",
  planetscale: "https://planetscale.com",
  docker: "https://www.docker.com",
  cloudflare: "https://www.cloudflare.com",
  vercel: "https://vercel.com",
  "better-auth": "https://www.better-auth.com",
  clerk: "https://clerk.com",
  abacatepay: "https://www.abacatepay.com",
  getmonitor: "https://getmonitor.io",
  guaracloud: "https://guaracloud.com",
  npm: "https://www.npmjs.com",
  pnpm: "https://pnpm.io",
  tauri: "https://tauri.app",
  starlight: "https://starlight.astro.build",
  fumadocs: "https://fumadocs.dev",
  biome: "https://biomejs.dev",
  oxlint: "https://oxc.rs",
  turborepo: "https://turbo.build",
  nx: "https://nx.dev",
  "vite-plus": "https://viteplus.dev",
  ultracite: "https://www.ultracite.ai",
};

const SHOW_CATEGORIES = [
  "webFrontend",
  "nativeFrontend",
  "runtime",
  "backend",
  "api",
  "database",
  "orm",
  "dbSetup",
  "auth",
  "payments",
  "observability",
  "webDeploy",
  "packageManager",
  "addons",
] as const;

const SKIP_IDS = new Set([
  "none",
  "self-next",
  "self-tanstack-start",
  "self-nuxt",
  "self-svelte",
  "self-astro",
  "prisma-postgres",
  "mongodb-atlas",
  "native-uniwind",
  "native-unistyles",
]);

const BR_INTEGRATIONS: EcosystemItem[] = [
  {
    id: "abacatepay",
    name: "AbacatePay",
    href: TECH_HREFS.abacatepay,
    iconSrc: "/integrations/abacatepay.svg",
  },
  {
    id: "guaracloud",
    name: "Guara Cloud",
    href: TECH_HREFS.guaracloud,
    iconSrc: "/integrations/guaracloud.png",
  },
  {
    id: "getmonitor",
    name: "GetMonitor",
    href: TECH_HREFS.getmonitor,
    iconSrc: "/integrations/getmonitor.svg",
  },
];

const ROW_COUNT = 4;
/** Duplicates per track so short rows still fill the viewport for a seamless loop. */
const TRACK_COPIES = 2;

function buildEcosystem(): EcosystemItem[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const items: EcosystemItem[] = [];

  for (const category of SHOW_CATEGORIES) {
    for (const option of TECH_OPTIONS[category]) {
      if (SKIP_IDS.has(option.id) || seenIds.has(option.id)) continue;
      if (!option.icon) continue;
      const name = option.id === "native-bare" ? "Expo" : option.name;
      const nameKey = name.toLowerCase();
      if (seenNames.has(nameKey)) continue;

      const href = TECH_HREFS[option.id];
      if (!href) continue;

      seenIds.add(option.id);
      seenNames.add(nameKey);

      items.push({
        id: option.id,
        name,
        href,
        iconSrc: option.icon,
        className: option.className,
      });
    }
  }

  for (const br of BR_INTEGRATIONS) {
    const key = br.name.toLowerCase();
    if (seenNames.has(key) || seenIds.has(br.id)) continue;
    seenNames.add(key);
    seenIds.add(br.id);
    items.push(br);
  }

  return items;
}

/** Split into 4 balanced rows (4×N “grid” of marquees). */
function splitIntoRows(items: EcosystemItem[], rows: number): EcosystemItem[][] {
  if (items.length === 0) return Array.from({ length: rows }, () => []);
  const size = Math.ceil(items.length / rows);
  return Array.from({ length: rows }, (_, i) => items.slice(i * size, (i + 1) * size));
}

/**
 * Row 0,2 → right (content drifts right).
 * Row 1,3 → left (content drifts left).
 */
function rowDirection(index: number): "right" | "left" {
  return index % 2 === 0 ? "right" : "left";
}

const ecosystem = buildEcosystem();
const rows = splitIntoRows(ecosystem, ROW_COUNT);

function TechIcon({ item }: { item: EcosystemItem }) {
  return (
    <img
      src={item.iconSrc}
      alt=""
      width={16}
      height={16}
      className={cn("size-4 shrink-0 object-contain", item.className)}
      aria-hidden
    />
  );
}

function TechCell({ item, interactive }: { item: EcosystemItem; interactive: boolean }) {
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-2.5">
        <TechIcon item={item} />
        <span className="truncate font-semibold">{item.name}</span>
      </span>
      <ArrowUpRight
        className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-150 ease-out group-hover:text-foreground motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1"
        aria-hidden
      />
    </>
  );

  const cellClass =
    "tech-marquee__cell group flex min-h-[5.5rem] min-w-[11.5rem] shrink-0 items-center justify-between gap-3 border-rule border-r p-5 no-underline";

  if (!interactive) {
    return (
      <span className={cellClass} aria-hidden="true">
        {body}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        cellClass,
        "text-inherit transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
      )}
    >
      {body}
    </Link>
  );
}

function TechMarqueeRow({
  items,
  direction,
  rowIndex,
}: {
  items: EcosystemItem[];
  direction: "left" | "right";
  rowIndex: number;
}) {
  if (items.length === 0) return null;

  // Ensure enough cells for a continuous strip (at least ~8 visual slots).
  const sequence =
    items.length >= 4 ? items : Array.from({ length: 8 }, (_, i) => items[i % items.length]!);

  return (
    <div
      className={cn(
        // Tailwind layout is intentional: custom CSS animations have flaked under Turbopack HMR.
        "tech-marquee__row relative overflow-hidden border-rule border-b last:border-b-0",
        direction === "left" ? "tech-marquee__row--left" : "tech-marquee__row--right",
      )}
      data-tech-marquee-row={rowIndex}
      data-direction={direction}
    >
      <div className="tech-marquee__track flex w-max will-change-transform">
        {Array.from({ length: TRACK_COPIES }, (_, copyIndex) => (
          <div
            key={copyIndex}
            className="tech-marquee__sequence flex shrink-0"
            aria-hidden={copyIndex > 0 ? true : undefined}
          >
            {sequence.map((item, itemIndex) => (
              <TechCell
                key={`${copyIndex}-${item.id}-${itemIndex}`}
                item={item}
                interactive={copyIndex === 0}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SponsorsSection() {
  return (
    <section aria-labelledby="ecosystem-title" className="border-rule border-b">
      <div className="grid lg:grid-cols-12">
        <div className="border-rule p-5 sm:p-8 lg:col-span-4 lg:border-r lg:p-10">
          <h2 id="ecosystem-title" className="text-3xl font-semibold tracking-tight">
            Um gerador.
            <br />
            Escolhas reais.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            Todas as opções de stack que a CLI pode gerar — frontends, backends, dados, auth, deploy
            e integrações brasileiras.
          </p>
        </div>

        <div
          className="tech-marquee flex min-w-0 flex-col overflow-hidden lg:col-span-8"
          aria-label="Tecnologias suportadas"
          data-tech-marquee
        >
          {rows.map((rowItems, index) => (
            <TechMarqueeRow
              key={index}
              items={rowItems}
              direction={rowDirection(index)}
              rowIndex={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
