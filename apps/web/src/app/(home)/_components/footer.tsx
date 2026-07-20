import { ArrowUpRight, Copy } from "lucide-react";
import Image from "next/image";
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
      { label: "NPM package", href: "https://www.npmjs.com/package/create-better-t-stack" },
    ],
  },
  {
    label: "Community",
    links: [
      { label: "Sponsors", href: "/sponsors" },
      { label: "Discord", href: "https://discord.gg/ZYsbjpDaM5" },
      {
        label: "GitHub",
        href: "https://github.com/AmanVarshney01/create-better-t-stack",
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
        <div className="ui-rule-grid min-h-[30rem] p-6 sm:p-8 lg:col-span-8 lg:border-r lg:p-12">
          <div className="flex h-full flex-col justify-between">
            <p className="ui-kicker text-primary">Ready / Generate locally</p>
            <h2
              id="final-cta-title"
              className="ui-display max-w-5xl text-[clamp(3.4rem,7.5vw,8rem)] leading-[0.84]"
            >
              Stop assembling.
              <br />
              <span className="text-primary">Start shipping.</span>
            </h2>
          </div>
        </div>

        <div className="grid lg:col-span-4">
          <Link
            href="/new"
            className="group flex min-h-60 flex-col justify-between bg-primary p-6 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:p-8 lg:p-10"
          >
            <span className="ui-kicker">Interactive path</span>
            <span className="flex items-end justify-between gap-6 text-3xl font-semibold tracking-tight">
              Build your stack
              <ArrowUpRight className="size-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </span>
          </Link>
          <div className="flex min-h-44 flex-col justify-between border-rule border-t bg-card p-6 sm:p-8 lg:p-10">
            <span className="ui-kicker text-muted-foreground">Terminal path</span>
            <code className="break-all font-mono text-sm leading-relaxed">
              bun create kubots@latest
            </code>
            <span className="ui-kicker flex items-center gap-2 text-primary">
              <Copy className="size-3.5" aria-hidden />
              One command
            </span>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-12">
        <div className="border-rule p-6 sm:p-8 lg:col-span-3 lg:border-r lg:p-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            aria-label="Kubo home"
          >
            <span aria-hidden className="relative size-12 overflow-hidden">
              <Image
                src="/assets/kubo-mark.png"
                alt=""
                width={48}
                height={48}
                className="size-12 object-contain"
              />
            </span>
            <span className="font-semibold">Kubo</span>
          </Link>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            A source-first generator for end-to-end TypeScript projects.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="grid border-rule sm:grid-cols-3 lg:col-span-9"
        >
          {footerGroups.map((group) => (
            <div
              key={group.label}
              className="border-rule p-6 not-last:border-b sm:p-8 sm:not-last:border-r sm:not-last:border-b-0 lg:p-10"
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
                        className="group flex items-center justify-between gap-4 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
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
      </div>

      <div className="grid border-rule border-t sm:grid-cols-2">
        <p className="ui-kicker flex min-h-14 items-center px-5 text-muted-foreground sm:px-8">
          © {new Date().getFullYear()} Kubo
        </p>
      </div>

      <div className="overflow-hidden border-rule border-t px-5 py-8 sm:px-8">
        <p
          aria-hidden
          className="ui-display text-center whitespace-nowrap text-[clamp(4rem,12.7vw,12rem)] leading-[0.75] text-foreground"
        >
          KUBO_
        </p>
      </div>
    </footer>
  );
}
