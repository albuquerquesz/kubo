import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type CommunityEntry = {
  title: string;
  description: string;
  href: string;
  icon: PixelIconName;
};

type PixelIconName = "install" | "connect" | "addons" | "workflow";

const pixelIconPaths: Record<PixelIconName, string> = {
  install: "M8 2v7M5 7l3 3 3-3M3 13h10",
  connect: "M6 5H4v2H2v3h2v2h3M10 11h2V9h2V6h-2V4h-3M6 8h4",
  addons: "M2 5h12v9H2zM2 5l3-3h6l3 3M8 5v9",
  workflow: "M2 2h4v4H2zM10 10h4v4h-4zM6 4h4v7M8 11h2M8 8l2 3-3 1",
};

function PixelCommunityIcon({ name }: { name: PixelIconName }) {
  return (
    <svg
      aria-hidden="true"
      className="block size-8 text-primary"
      focusable="false"
      shapeRendering="crispEdges"
      viewBox="0 0 16 16"
    >
      <path
        d={pixelIconPaths[name]}
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth="1"
      />
    </svg>
  );
}

const communityEntries: CommunityEntry[] = [
  {
    title: "Instale skills para seu agente.",
    description:
      "Adicione playbooks de Next, Elysia, Prisma e shadcn ao Cursor, Codex ou Claude Code.",
    href: "/docs/cli/agent-workflows",
    icon: "install",
  },
  {
    title: "Conecte o MCP do Kubo.",
    description: "Planeje stacks, consulte schemas e gere projetos direto no seu agente de IA.",
    href: "/docs/cli/agent-workflows",
    icon: "connect",
  },
  {
    title: "Adicione recursos depois.",
    description: "Use kubojs add para incluir PWA, Tauri, S3, OpenTUI, lint e mais sem recomeçar.",
    href: "/docs/cli#add",
    icon: "addons",
  },
  {
    title: "Automatize com segurança.",
    description: "Use create-json, add-json, schema e dry-run em scripts, CI e fluxos com agentes.",
    href: "/docs/cli/agent-workflows",
    icon: "workflow",
  },
];

function CommunityCard({ entry }: { entry: CommunityEntry }) {
  const isExternal = entry.href.startsWith("http");

  return (
    <Link
      href={entry.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="group flex min-w-0 flex-col bg-muted transition-colors duration-[400ms] ease-out hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
    >
      <article className="flex min-h-[30rem] min-w-0 flex-col border-rule border-t border-l p-6 pb-4 sm:min-h-[36rem] sm:p-8 sm:pb-4">
        <PixelCommunityIcon name={entry.icon} />
        <div className="mt-auto">
          <h3 className="min-w-0 max-w-full break-words text-balance text-lg font-semibold leading-tight tracking-tight sm:text-2xl">
            {entry.title}
          </h3>
          <div className="mt-4 grid grid-rows-[auto] transition-[grid-template-rows,margin] duration-[400ms] ease-out lg:mt-0 lg:grid-rows-[0fr] lg:overflow-hidden lg:group-hover:mt-4 lg:group-hover:grid-rows-[1fr] lg:group-focus-within:mt-4 lg:group-focus-within:grid-rows-[1fr]">
            <p className="min-h-0 min-w-0 max-w-full break-words leading-relaxed text-pretty text-muted-foreground">
              {entry.description}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function CommunityLinksSection() {
  return (
    <section
      aria-label="Funcionalidades da CLI"
      className="border-rule border-b px-5 pt-6 pb-16 sm:px-8 sm:pt-8 sm:pb-20 lg:px-10 lg:pt-10 lg:pb-16"
    >
      <div className="flex flex-col gap-6 pb-8 sm:pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_auto] lg:gap-x-6 lg:gap-y-4 lg:pb-12">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:col-start-1 lg:row-start-1">
          O projeto não para na criação.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-center">
          Instale skills, conecte agentes e adicione recursos quando seu projeto pedir.
        </p>
        <Button
          className="lg:col-start-2 lg:row-start-2 lg:self-center"
          nativeButton={false}
          render={<Link href="/docs/cli" />}
          variant="cta"
          size="xl"
        >
          Explorar recursos
          <ArrowUpRight aria-hidden data-icon="inline-end" />
        </Button>
      </div>
      <div className="relative mt-4 grid grid-cols-1 border-r border-b border-rule sm:grid-cols-2 xl:grid-cols-4">
        {communityEntries.map((entry) => (
          <CommunityCard key={entry.title} entry={entry} />
        ))}
      </div>
    </section>
  );
}
