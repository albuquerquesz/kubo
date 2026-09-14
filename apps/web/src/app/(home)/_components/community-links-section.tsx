import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type CommunityEntry = {
  title: string;
  description: string;
  href: string;
  image?: string;
};

const communityEntries: CommunityEntry[] = [
  {
    title: "Instale skills para seu agente.",
    description:
      "Adicione playbooks de Next, Elysia, Prisma e shadcn ao Cursor, Codex ou Claude Code.",
    href: "/docs/cli/agent-workflows",
    image: "/assets/gold-brain-v2.png",
  },
  {
    title: "Conecte o MCP do Kubo.",
    description: "Planeje stacks, consulte schemas e gere projetos direto no seu agente de IA.",
    href: "/docs/cli/agent-workflows",
    image: "/assets/gold-link.png",
  },
  {
    title: "Adicione recursos depois.",
    description: "Use kubojs add para incluir PWA, Tauri, S3, OpenTUI, lint e mais sem recomeçar.",
    href: "/docs/cli#add",
    image: "/assets/gold-puzzle.png",
  },
  {
    title: "Automatize com segurança.",
    description: "Use create-json, add-json, schema e dry-run em scripts, CI e fluxos com agentes.",
    href: "/docs/cli/agent-workflows",
    image: "/assets/gold-workflow.png",
  },
];

function CommunityCard({ entry }: { entry: CommunityEntry }) {
  const isExternal = entry.href.startsWith("http");

  return (
    <Link
      href={entry.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="group flex min-w-0 flex-col bg-background transition-colors duration-150 ease-out hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
    >
      <article className="flex min-h-[30rem] min-w-0 flex-col border-rule border-t border-l p-6 sm:min-h-[36rem] sm:p-8">
        {entry.image ? (
          <Image
            src={entry.image}
            alt=""
            width={96}
            height={96}
            className="size-14 object-contain object-left-top sm:size-16"
            aria-hidden
            unoptimized
          />
        ) : null}
        <div className="mt-auto">
          <h3 className="min-w-0 max-w-full break-words text-balance text-lg font-semibold leading-tight tracking-tight transition-transform duration-300 ease-out sm:text-2xl lg:group-hover:duration-700 lg:group-hover:-translate-y-1 lg:group-focus-within:duration-700 lg:group-focus-within:-translate-y-1">
            {entry.title}
          </h3>
          <p className="mt-4 min-w-0 max-w-full break-words leading-relaxed text-pretty text-muted-foreground transition-[max-height,opacity,transform] duration-[300ms] ease-out lg:max-h-0 lg:translate-y-2 lg:overflow-hidden lg:opacity-0 lg:group-hover:duration-[800ms] lg:group-hover:max-h-24 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:duration-[800ms] lg:group-focus-within:max-h-24 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
            {entry.description}
          </p>
        </div>
      </article>
    </Link>
  );
}

export default function CommunityLinksSection() {
  return (
    <section
      aria-label="Funcionalidades da CLI"
      className="border-rule border-b px-5 pt-6 pb-16 sm:px-8 sm:pt-8 sm:pb-20 lg:px-10 lg:pt-10 lg:pb-24"
    >
      <div className="flex flex-col gap-6 pb-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between lg:pb-12">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            A CLI não para no scaffold.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Instale skills, conecte agentes e adicione recursos quando seu projeto pedir.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/docs/cli" />} variant="cta" size="xl">
          Explorar recursos
        </Button>
      </div>
      <div className="relative grid grid-cols-1 border-r border-b border-rule sm:grid-cols-2 xl:grid-cols-4">
        {communityEntries.map((entry) => (
          <CommunityCard key={entry.title} entry={entry} />
        ))}
      </div>
    </section>
  );
}
