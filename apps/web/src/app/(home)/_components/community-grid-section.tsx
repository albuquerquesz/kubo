import { BookOpen, ChartNoAxesColumn, LayoutGrid, MessagesSquare } from "lucide-react";
import Link from "next/link";

const communityEntries = [
  {
    icon: LayoutGrid,
    title: "Veja o que foi publicado.",
    href: "/showcase",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Acompanhe o ecossistema.",
    href: "/analytics",
  },
  {
    icon: MessagesSquare,
    title: "Traga sua stack.",
    href: "https://discord.gg/ZYsbjpDaM5",
    external: true,
  },
  {
    icon: BookOpen,
    title: "Leia as camadas.",
    href: "/docs",
  },
] as const;

export default function CommunityGridSection() {
  return (
    <section
      aria-label="Comunidade grid"
      className="community-grid-section bg-primary text-primary-foreground"
    >
      <div className="community-grid">
        {communityEntries.map((entry) => {
          const Icon = entry.icon;
          return (
            <Link
              key={entry.title}
              href={entry.href}
              target={entry.external ? "_blank" : undefined}
              rel={entry.external ? "noreferrer" : undefined}
              className="community-grid-card"
            >
              <Icon aria-hidden className="community-grid-card__icon" />
              <h3 className="community-grid-card__title">{entry.title}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
