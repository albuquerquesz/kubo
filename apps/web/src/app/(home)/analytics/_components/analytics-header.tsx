import { Activity, DatabaseZap, Terminal } from "lucide-react";

import { cn } from "@/lib/utils";

import { formatCompactNumber } from "./analytics-helpers";

// Feb-Nov 2025 PostHog era, estimated from npm downloads (92.8k) times the
// tracked era's projects-per-download ratio (~0.64)
const UNTRACKED_ERA_PROJECT_ESTIMATE = 59_000;

const utcDateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function formatUtcDateTime(value: string) {
  return `${utcDateTimeFormatter.format(new Date(value))} UTC`;
}

function HeaderStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded border border-border bg-fd-background p-4">
      <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-3 font-semibold text-2xl">{value}</div>
      <p className="mt-2 text-muted-foreground text-xs leading-5">{detail}</p>
    </div>
  );
}

export function AnalyticsHeader({
  lastUpdated,
  liveTotal,
  trackingDays,
  connectionStatus,
}: {
  lastUpdated: string | null;
  liveTotal: number;
  trackingDays: number;
  connectionStatus: "online" | "connecting" | "reconnecting" | "offline";
}) {
  const formattedDate = lastUpdated ? formatUtcDateTime(lastUpdated) : null;
  const statusMeta = {
    online: {
      label: "Transmitindo",
      textClass: "text-primary",
      dotClass: "bg-primary",
    },
    connecting: {
      label: "Conectando",
      textClass: "text-muted-foreground",
      dotClass: "bg-muted-foreground",
    },
    reconnecting: {
      label: "Reconectando",
      textClass: "text-chart-3",
      dotClass: "bg-chart-3",
    },
    offline: {
      label: "Offline",
      textClass: "text-destructive",
      dotClass: "bg-destructive",
    },
  }[connectionStatus];

  return (
    <section className="space-y-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
        <div className="flex min-w-0 items-center gap-2">
          <Terminal className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <h1 className="font-bold font-mono text-lg sm:text-xl">ANALISE.SH</h1>
            <p className="text-muted-foreground text-sm">Telemetria agregada da CLI do kubojs.</p>
          </div>
        </div>
        <div className="hidden h-px flex-1 bg-border sm:block" />
        <div className="flex items-center gap-2 rounded border border-border bg-fd-background px-3 py-2 font-mono text-xs">
          <Activity className={cn("h-3.5 w-3.5", statusMeta.textClass)} />
          <span className={cn("h-2 w-2 rounded-full", statusMeta.dotClass)} />
          <span className={statusMeta.textClass}>{statusMeta.label}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <HeaderStat
          label="Projetos ao vivo"
          value={formatCompactNumber(liveTotal)}
          detail="Criações de projetos rastreadas no stream atual do Convex."
        />
        <HeaderStat
          label="Período rastreado"
          value={trackingDays}
          detail="Dias de calendário representados no conjunto de telemetria ao vivo."
        />
      </div>

      <div className="rounded border border-border bg-fd-background p-4">
        <div className="flex items-start gap-2 text-sm">
          <span className="text-primary">$</span>
          <span className="text-muted-foreground">
            Esses números subestimam o uso real. A CLI foi lançada em fev. 2025, mas este conjunto
            de dados só começa em dez. 2025. A telemetria anterior ficava no PostHog e não está
            incluída. Contando aquele período pelo volume de downloads no npm, o uso estimado de
            todos os tempos fica em torno de{" "}
            {formatCompactNumber(liveTotal + UNTRACKED_ERA_PROJECT_ESTIMATE)} projetos.
          </span>
        </div>
      </div>

      <div className="rounded border border-border bg-fd-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DatabaseZap className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase">Telemetria</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Último evento</span>
            <span className="font-medium">{formattedDate ?? "Aguardando"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
