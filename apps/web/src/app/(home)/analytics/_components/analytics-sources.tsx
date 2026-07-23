import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function AnalyticsSources() {
  return (
    <div className="rounded border border-border bg-fd-background p-4">
      <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
        Mapa de fontes
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <Link
          href="https://github.com/albuquerquesz/kubo/blob/main/apps/cli/src/utils/analytics.ts"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between rounded border border-border px-3 py-2.5 transition-colors hover:border-muted-foreground/30"
        >
          <span className="min-w-0">
            <span className="block text-muted-foreground text-xs">Emissor da CLI</span>
            <span className="block truncate">apps/cli/src/utils/analytics.ts</span>
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>

        <Link
          href="https://github.com/albuquerquesz/kubo/blob/main/packages/backend/convex/analytics.ts"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between rounded border border-border px-3 py-2.5 transition-colors hover:border-muted-foreground/30"
        >
          <span className="min-w-0">
            <span className="block text-muted-foreground text-xs">Agregador</span>
            <span className="block truncate">packages/backend/convex/analytics.ts</span>
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>

        <Link
          href="https://umami.amanv.cloud/share/pHvqHleyOl9PBfaK"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between rounded border border-border px-3 py-2.5 transition-colors hover:border-muted-foreground/30"
        >
          <span className="min-w-0">
            <span className="block text-muted-foreground text-xs">Análise do site</span>
            <span className="block truncate">Painel Umami</span>
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
      </div>

      <p className="mt-4 text-muted-foreground text-xs leading-5">
        Nenhum dado pessoal é coletado aqui. A página só exibe o uso agregado da CLI e um pequeno
        feed ao vivo de atividade anônima recente.
      </p>
    </div>
  );
}
