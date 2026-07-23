"use client";

import NumberFlow from "@number-flow/react";
import { AreaChart, Flame, Gauge, Radar, Sparkles, Sunrise } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  formatCompactNumber,
  formatDateLabel,
  formatDelta,
  getTrendTone,
  shortenLabel,
} from "./analytics-helpers";
import { CategoryBarChart, TrendAreaChart } from "./bklit-charts";
import type { AggregatedAnalyticsData } from "./types";

function MetricTile({
  label,
  value,
  detail,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded border border-border bg-fd-background p-4",
        tone === "success" && "border-primary/25",
        tone === "warning" && "border-chart-3/25",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="text-muted-foreground/80">{icon}</span>
      </div>
      <div className="mt-3 font-semibold text-2xl">{value}</div>
      <p className="mt-2 text-muted-foreground text-xs leading-5">{detail}</p>
    </div>
  );
}

export function MetricsCards({ data }: { data: AggregatedAnalyticsData }) {
  const momentumTone = getTrendTone(data.momentum.deltaPercentage);
  const sparklineData = (
    data.timeSeries.length > 0
      ? data.timeSeries
      : [
          {
            dateValue: new Date(),
            count: 0,
            rollingAverage: 0,
            cumulativeProjects: 0,
            date: new Date().toISOString().slice(0, 10),
          },
        ]
  ).map((point) => ({
    date: point.dateValue,
    projects: point.count,
    average: Number(point.rollingAverage.toFixed(2)),
  }));

  const leadingChoices = [
    { category: "Frontend", item: data.frontendDistribution[0] },
    { category: "Backend", item: data.backendDistribution[0] },
    { category: "Database", item: data.databaseDistribution[0] },
    { category: "ORM", item: data.ormDistribution[0] },
    { category: "Runtime", item: data.runtimeDistribution[0] },
    {
      category: "Pacotes",
      item: data.packageManagerDistribution[0],
    },
  ].map(({ category, item }) => ({
    choice: `${category} · ${shortenLabel(item?.name ?? "n/d", 18)}`,
    setups: item?.value ?? 0,
  }));
  const momentumComparison = [
    { window: "Últimos 7 dias", projects: data.momentum.last7Days },
    { window: "7 dias anteriores", projects: data.momentum.previous7Days },
  ];

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] xl:items-start">
      <div className="grid min-w-0 gap-4">
        <section className="min-w-0 overflow-hidden rounded border border-border bg-fd-background p-4 sm:p-5">
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(220px,0.36fr)_minmax(0,0.64fr)] xl:items-center">
            <div className="min-w-0 space-y-5">
              <div className="space-y-2">
                <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
                  Total Convex
                </div>
                <NumberFlow
                  value={data.totalProjects}
                  className="block font-semibold text-4xl sm:text-5xl"
                  transformTiming={{ duration: 850, easing: "ease-out" }}
                  willChange
                  isolate
                />
                <p className="max-w-md text-muted-foreground text-sm leading-6">
                  Inícios de projetos ao vivo no conjunto atual de telemetria.
                </p>
              </div>

              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div className="min-w-0 rounded border border-border p-3">
                  <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
                    Média por dia
                  </div>
                  <div className="mt-2 font-semibold text-2xl">
                    {data.avgProjectsPerDay.toFixed(1)}
                  </div>
                </div>
                <div className="min-w-0 rounded border border-border p-3">
                  <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
                    Par líder
                  </div>
                  <div className="mt-2 font-medium text-base">
                    {shortenLabel(data.summary.topStack, 24)}
                  </div>
                </div>
              </div>
            </div>

            <TrendAreaChart
              data={sparklineData}
              height={310}
              series={[
                { key: "projects", label: "Projetos" },
                { key: "average", label: "Média de 7 dias", line: true },
              ]}
            />
          </div>
        </section>

        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <MetricTile
            label="Momentum de 7 dias"
            value={formatDelta(data.momentum.deltaPercentage)}
            detail={`${formatCompactNumber(data.momentum.last7Days)} projetos nos últimos 7 dias versus ${formatCompactNumber(data.momentum.previous7Days)} na janela anterior.`}
            icon={<Gauge className="h-4 w-4" />}
            tone={
              momentumTone === "up" ? "success" : momentumTone === "down" ? "warning" : "default"
            }
          />

          <MetricTile
            label="Dias ativos"
            value={`${data.momentum.activeDaysLast30}/30`}
            detail="Dias no último mês com pelo menos uma criação de projeto rastreada."
            icon={<AreaChart className="h-4 w-4" />}
          />

          <MetricTile
            label="Dia de pico"
            value={data.momentum.peakDay ? formatCompactNumber(data.momentum.peakDay.count) : "0"}
            detail={
              data.momentum.peakDay
                ? `Maior volume diário em ${formatDateLabel(data.momentum.peakDay.date)}.`
                : "Aguardando atividade suficiente para identificar um pico."
            }
            icon={<Flame className="h-4 w-4" />}
            tone="warning"
          />

          <MetricTile
            label="Hora mais movimentada"
            value={data.momentum.busiestHour?.hour.replace(":00", "") ?? "--"}
            detail={
              data.momentum.busiestHour
                ? `${formatCompactNumber(data.momentum.busiestHour.count)} projetos iniciados nesta hora UTC.`
                : "A atividade por hora do dia aparece quando os eventos começam a chegar."
            }
            icon={<Sunrise className="h-4 w-4" />}
          />

          <MetricTile
            label="Escolhas líderes"
            value={shortenLabel(
              `${data.summary.mostPopularFrontend} / ${data.summary.mostPopularBackend}`,
              24,
            )}
            detail={`${data.summary.mostPopularDatabase} lidera as escolhas de database, e ${data.summary.mostPopularORM} lidera as de ORM.`}
            icon={<Sparkles className="h-4 w-4" />}
          />

          <MetricTile
            label="Runtime + pacotes"
            value={shortenLabel(
              `${data.summary.mostPopularRuntime} / ${data.summary.mostPopularPackageManager}`,
              24,
            )}
            detail="Principais escolhas de runtime e gerenciador de pacotes nas configurações rastreadas."
            icon={<Radar className="h-4 w-4" />}
          />
        </div>
      </div>

      <div className="grid min-w-0 gap-4">
        <section className="min-w-0 overflow-hidden rounded border border-border bg-fd-background p-4 sm:p-5">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-sm sm:text-base">Escolhas líderes</h3>
            <p className="text-muted-foreground text-sm leading-6">
              A opção mais selecionada em cada categoria principal, por contagem de configurações
              rastreadas.
            </p>
          </div>
          <div className="mt-3">
            <CategoryBarChart
              data={leadingChoices}
              xKey="choice"
              orientation="horizontal"
              height={290}
              labelWidth={140}
              series={[{ key: "setups", label: "Configurações rastreadas" }]}
            />
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded border border-border bg-fd-background p-4 sm:p-5">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-sm sm:text-base">Comparação de 7 dias</h3>
            <p className="text-muted-foreground text-sm leading-6">
              Inícios recentes de projetos comparados com a janela anterior de 7 dias.
            </p>
          </div>
          <div className="mt-3">
            <CategoryBarChart
              data={momentumComparison}
              xKey="window"
              height={220}
              series={[{ key: "projects", label: "Projetos" }]}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
