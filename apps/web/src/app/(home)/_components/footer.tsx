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
    links: [
      { label: "Pacote NPM", href: "https://www.npmjs.com/package/create-kubojs" },
      { label: "Newsletter", href: "/updates/newsletter" },
    ],
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

      <section
        className="grid bg-background border-rule border-y lg:grid-cols-[1fr_1.4fr]"
        aria-labelledby="newsletter-title"
      >
        <div className="border-rule p-6 lg:border-r lg:p-12">
          <h2
            id="newsletter-title"
            className="max-w-sm text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
          >
            Menos ruído. Mais Kubo.
          </h2>
        </div>
        <div className="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-12">
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Receba lançamentos, decisões de produto e guias curtos para montar projetos TypeScript
            com mais clareza.
          </p>
          <form
            className="flex flex-col gap-3 sm:flex-row"
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
              className="min-h-12 min-w-0 flex-1 border border-rule bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <Button type="submit" variant="cta" size="lg" className="min-h-12">
              Entrar na lista
              <ArrowUpRight className="size-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            Um email quando houver algo que valha seu tempo. Você pode sair quando quiser.
          </p>
        </div>
      </section>

      <nav aria-label="Navegação do rodapé" className="grid border-rule sm:grid-cols-3">
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
