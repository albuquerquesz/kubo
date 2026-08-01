import Image from "next/image";
import Link from "next/link";

type CommunityEntry = {
  title: string;
  description: string;
  href: string;
  image?: string;
};

const communityEntries: CommunityEntry[] = [
  {
    title: "Comece pela visão geral.",
    description: "Entenda o fluxo do projeto antes de explorar as peças menores.",
    href: "/docs",
    image: "/assets/gold-open-book.png",
  },
  {
    title: "Leia a referência da CLI.",
    description: "Veja flags, comandos e o caminho mais curto até a geração.",
    href: "/docs/cli",
    image: "/assets/gold-chat-bubbles.png",
  },
  {
    title: "Explore a estrutura.",
    description: "Veja como o template se organiza depois da criação.",
    href: "/docs/project-structure",
    image: "/assets/gold-apps-grid.png",
  },
  {
    title: "Revise o que combina.",
    description: "Revise combinações válidas antes de montar sua stack.",
    href: "/docs/cli/compatibility",
    image: "/assets/gold-bar-chart.png",
  },
];

function CommunityCard({ entry }: { entry: CommunityEntry }) {
  const isExternal = entry.href.startsWith("http");

  return (
    <Link
      href={entry.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="group flex flex-col bg-background transition-colors duration-150 ease-out hover:bg-[#2d2d2d] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
    >
      <article className="flex min-h-96 flex-col p-6 sm:min-h-[28rem] sm:p-8">
        {entry.image ? (
          <Image
            src={entry.image}
            alt=""
            width={96}
            height={96}
            className="size-16 object-contain object-left-top sm:size-20"
            aria-hidden
            unoptimized
          />
        ) : null}
        <div className="mt-auto">
          <h3 className="max-w-md text-3xl font-semibold leading-tight tracking-tight transition-transform duration-300 ease-out lg:group-hover:duration-700 lg:group-hover:-translate-y-1 lg:group-focus-within:duration-700 lg:group-focus-within:-translate-y-1">
            {entry.title}
          </h3>
          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground transition-[max-height,opacity,transform] duration-[300ms] ease-out lg:max-h-0 lg:translate-y-2 lg:overflow-hidden lg:opacity-0 lg:group-hover:duration-[800ms] lg:group-hover:max-h-24 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:duration-[800ms] lg:group-focus-within:max-h-24 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
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
      aria-label="Comunidade"
      className="border-rule border-b pt-6 pb-16 sm:pt-8 sm:pb-20 lg:pt-10 lg:pb-24"
    >
      <div className="flex flex-col gap-6 px-5 pb-8 sm:px-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:pb-12">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Antes da comunidade, leia o mapa.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sem prova social ainda. Comece pela documentação.
          </p>
        </div>
        <Link
          href="/docs"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-md border border-rule bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Ler documentação
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-px border-rule border-t bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {communityEntries.map((entry, index) => (
          <CommunityCard key={`${entry.href}-${index}`} entry={entry} />
        ))}
      </div>
    </section>
  );
}
