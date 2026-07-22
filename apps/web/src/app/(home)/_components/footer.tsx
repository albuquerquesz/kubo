import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import FinalCtaDotMatrix from "./final-cta-dot-matrix";

const footerGroups = [
  {
    label: "Build",
    links: [
      { label: "Visual builder", href: "/new" },
      { label: "Documentation", href: "/docs" },
      { label: "Stack display", href: "/stack" },
    ],
  },
  {
    label: "Inspect",
    links: [
      { label: "Showcase", href: "/showcase" },
      { label: "NPM package", href: "https://www.npmjs.com/package/kubojs" },
    ],
  },
  {
    label: "Community",
    links: [
      { label: "Discord", href: "https://discord.gg/ZYsbjpDaM5" },
      {
        label: "GitHub",
        href: "https://github.com/albuquerquesz/kubo",
      },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer>
      <FinalCtaDotMatrix />

      <nav aria-label="Footer navigation" className="grid border-rule sm:grid-cols-3">
        {footerGroups.map((group) => (
          <div
            key={group.label}
            className="border-rule p-6 not-last:border-b sm:p-8 sm:not-last:border-r sm:not-last:border-b-0 lg:p-12 lg:py-20"
          >
            <p className="ui-kicker text-primary">{group.label}</p>
            <ul className="mt-8 space-y-4">
              {group.links.map((link) => {
                const isExternal = link.href.startsWith("http");

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      className="group flex items-center justify-between gap-4 text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="grid border-rule border-t sm:grid-cols-2">
        <p className="ui-kicker flex min-h-16 items-center px-5 text-muted-foreground sm:px-8">
          © {new Date().getFullYear()} Kubo
        </p>
      </div>
    </footer>
  );
}
