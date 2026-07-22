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

/**
 * Categories shown in the ecosystem grid (stack-facing choices).
 * Skips git/install/examples and pure “none” scaffolding flags.
 */
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

/** CLI ids that only restate another product already listed. */
const SKIP_IDS = new Set([
  "none",
  // Fullstack self-* backends restate the frontend product
  "self-next",
  "self-tanstack-start",
  "self-nuxt",
  "self-svelte",
  "self-astro",
  // Managed variants that reuse base product logos
  "prisma-postgres",
  "mongodb-atlas",
  // Extra Expo styling modes — one Expo tile is enough
  "native-uniwind",
  "native-unistyles",
]);

/** Extra first-class BR integrations (icons local / optional CDN). */
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

function buildEcosystem(): EcosystemItem[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const items: EcosystemItem[] = [];

  for (const category of SHOW_CATEGORIES) {
    for (const option of TECH_OPTIONS[category]) {
      if (SKIP_IDS.has(option.id) || seenIds.has(option.id)) continue;
      if (!option.icon) continue;
      // Collapse Expo + Bare → Expo; normalize case for id-level dedupe (Bun vs bun)
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

  // BR stack options may have empty icons in TECH_OPTIONS — append curated assets.
  for (const br of BR_INTEGRATIONS) {
    const key = br.name.toLowerCase();
    if (seenNames.has(key) || seenIds.has(br.id)) continue;
    seenNames.add(key);
    seenIds.add(br.id);
    items.push(br);
  }

  return items;
}

const ecosystem = buildEcosystem();

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
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            Every stack option the CLI can scaffold — frontends, backends, data, auth, deploy, and
            Brazilian integrations.
          </p>
        </div>

        {/*
          Uniform 1px grid: outer edges come from the section/column; each cell draws
          right + bottom so N items stay correct without nth-child border hacks.
        */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:col-span-8 lg:grid-cols-4">
          {ecosystem.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group flex min-h-24 items-center justify-between border-rule border-b border-r p-5 transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <TechIcon item={item} />
                <span className="truncate font-semibold">{item.name}</span>
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
