import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

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
      { label: "Analytics", href: "/analytics" },
      { label: "Showcase", href: "/showcase" },
      { label: "NPM package", href: "https://www.npmjs.com/package/kubojs" },
    ],
  },
  {
    label: "Community",
    links: [
      { label: "Sponsors", href: "/sponsors" },
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
      <section
        aria-labelledby="final-cta-title"
        className="grid border-rule border-b lg:grid-cols-12"
      >
        <div className="ui-rule-grid min-h-[32rem] p-6 sm:p-8 lg:col-span-8 lg:min-h-[40rem] lg:border-r lg:p-12">
          <div className="flex h-full flex-col justify-end">
            <h2
              id="final-cta-title"
              className="ui-display max-w-5xl text-[clamp(3.4rem,7.5vw,8rem)] leading-[0.84] text-foreground"
            >
              Stop assembling.
              <br />
              <span>Start shipping.</span>
            </h2>
          </div>
        </div>

        <div className="grid lg:col-span-4">
          <Link
            href="/new"
            className="group flex min-h-72 flex-col justify-end bg-primary p-6 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:p-8 lg:min-h-80 lg:p-10"
          >
            <span className="flex items-end justify-between gap-6 text-3xl font-semibold tracking-tight">
              Build your stack
              <ArrowUpRight className="size-6 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1" />
            </span>
          </Link>
          <div className="flex min-h-52 flex-col justify-center border-rule border-t bg-card p-6 sm:p-8 lg:min-h-56 lg:p-10">
            <code className="break-all font-mono text-sm leading-relaxed">
              bun create kubojs@latest
            </code>
          </div>
        </div>
      </section>

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
