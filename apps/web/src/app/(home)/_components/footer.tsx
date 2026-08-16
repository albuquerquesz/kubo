import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import FinalCtaDotMatrix from "./final-cta-dot-matrix";

const footerGroups = [
  {
    label: "Criar",
    links: [
      { label: "Builder", href: "/new" },
      { label: "Docs", href: "/docs" },
    ],
  },
  {
    label: "Explorar",
    links: [{ label: "Pacote NPM", href: "https://www.npmjs.com/package/create-kubojs" }],
  },
  {
    label: "Comunidade",
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

      <nav
        aria-label="Navegação do rodapé"
        className="grid border-rule sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="border-rule p-6 sm:p-8 lg:px-4 lg:py-20">
          <p id="newsletter-title" className="ui-kicker text-primary">
            Newsletter
          </p>
          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            action="/updates/newsletter"
            method="get"
          >
            <label className="sr-only" htmlFor="footer-newsletter-email">
              Seu email
            </label>
            <input
              id="footer-newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@exemplo.com"
              className="min-h-12 min-w-0 flex-1 rounded-2xl border border-rule bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <Button type="submit" variant="cta" size="lg" className="shrink-0">
              Entrar
              <ArrowUpRight className="size-4" />
            </Button>
          </form>
        </div>

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
