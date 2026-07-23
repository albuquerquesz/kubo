"use client";

import {
  formatCompactNumber,
  formatDateLabel,
  formatHourLabel,
  formatMonthLabel,
} from "./analytics-helpers";
import { CategoryBarChart, TrendAreaChart } from "./bklit-charts";
import { ChartCard } from "./chart-card";
import { SectionHeader } from "./section-header";
import type { AggregatedAnalyticsData } from "./types";

export function TimelineSection({ data }: { data: AggregatedAnalyticsData }) {
  const peakDayLabel = data.momentum.peakDay ? formatDateLabel(data.momentum.peakDay.date) : "n/d";
  const busiestHourLabel = data.momentum.busiestHour
    ? `${formatHourLabel(data.momentum.busiestHour.hour)} UTC`
    : "n/d";
  const dailyData = data.timeSeries.map((point) => ({
    date: point.dateValue,
    projects: point.count,
    average: Number(point.rollingAverage.toFixed(2)),
  }));
  const monthlyData = data.monthlyTimeSeries.map((point) => ({
    month: formatMonthLabel(point.month, "MMM yy"),
    projects: point.totalProjects,
  }));
  const weekdayData = data.weekdayDistribution.map((point) => ({
    weekday: point.shortLabel,
    average: Number(point.averageDailyProjects.toFixed(2)),
  }));
  const hourlyData = data.hourlyDistribution.map((point) => ({
    hour: point.label,
    projects: point.count,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        label="Atividade"
        title="Volume de criação de projetos ao longo do tempo"
        description="Momentum recente, totais mensais, médias por dia da semana e concentração por hora UTC da telemetria ao vivo da CLI."
        aside={
          <div className="rounded border border-border bg-fd-background px-3 py-1.5 font-mono text-muted-foreground text-xs">
            pico {peakDayLabel} · hora quente {busiestHourLabel}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <ChartCard
          title="Inícios diários de projetos"
          description="Atividade diária bruta com a média móvel sobreposta."
          footer={
            <>
              Últimos 7 dias:{" "}
              <span className="text-foreground">
                {formatCompactNumber(data.momentum.last7Days)}
              </span>
              {" · "}7 dias anteriores:{" "}
              <span className="text-foreground">
                {formatCompactNumber(data.momentum.previous7Days)}
              </span>
            </>
          }
        >
          <TrendAreaChart
            data={dailyData}
            height={340}
            series={[
              { key: "projects", label: "Inícios diários" },
              { key: "average", label: "Média de 7 dias", line: true },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Inícios mensais"
          description="A visão mais longa de quando o histórico rastreado se acumulou; o mês mais recente ainda pode estar em andamento."
          footer={
            <>
              Total ao vivo:{" "}
              <span className="text-foreground">{data.totalProjects.toLocaleString("pt-BR")}</span>
            </>
          }
        >
          <CategoryBarChart
            data={monthlyData}
            xKey="month"
            height={340}
            series={[{ key: "projects", label: "Inícios mensais" }]}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Média por dia da semana"
          description="Média de inícios de projetos para cada dia da semana no último mês."
          footer={
            <>
              Dias ativos nos últimos 30:{" "}
              <span className="text-foreground">{data.momentum.activeDaysLast30}</span>
            </>
          }
        >
          <CategoryBarChart
            data={weekdayData}
            xKey="weekday"
            height={260}
            series={[{ key: "average", label: "Inícios médios" }]}
          />
        </ChartCard>

        <ChartCard
          title="Distribuição por hora UTC"
          description="Quando os inícios de projetos se concentram ao longo do dia."
          footer={
            <>
              Hora mais movimentada:{" "}
              <span className="text-foreground">
                {data.momentum.busiestHour
                  ? `${formatHourLabel(data.momentum.busiestHour.hour)} UTC`
                  : "n/d"}
              </span>
            </>
          }
        >
          <CategoryBarChart
            data={hourlyData}
            xKey="hour"
            height={260}
            maxLabels={12}
            series={[{ key: "projects", label: "Inícios de projetos" }]}
          />
        </ChartCard>
      </div>
    </div>
  );
}
