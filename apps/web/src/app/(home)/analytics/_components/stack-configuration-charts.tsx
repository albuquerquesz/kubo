"use client";

import { shortenLabel } from "./analytics-helpers";
import { PreferenceChartCard } from "./preference-chart-card";
import { SectionHeader } from "./section-header";
import type { AggregatedAnalyticsData } from "./types";

export function StackSection({ data }: { data: AggregatedAnalyticsData }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        label="Escolhas de stack"
        title="Frameworks, runtimes, camadas de dados e auth"
        description="As decisões de stack e combinações mais comuns selecionadas na criação de projetos."
        aside={
          <div className="rounded border border-border bg-fd-background px-3 py-1.5 font-mono text-muted-foreground text-xs">
            stack líder {shortenLabel(data.summary.topStack, 28)}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <PreferenceChartCard
          title="Combinações de frontend e backend"
          description="As combinações que mais aparecem nas configurações rastreadas."
          data={data.stackCombinationDistribution}
          colorKey="chart1"
          maxItems={10}
        />
        <PreferenceChartCard
          title="Combinações de database e ORM"
          description="Quais escolhas de persistência costumam ser selecionadas juntas."
          data={data.databaseORMCombinationDistribution}
          colorKey="chart4"
          maxItems={10}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PreferenceChartCard
          title="Frontend"
          description="Com que frequência cada frontend foi selecionado."
          data={data.frontendDistribution}
          colorKey="chart1"
        />
        <PreferenceChartCard
          title="Backend"
          description="Com que frequência cada backend foi selecionado."
          data={data.backendDistribution}
          colorKey="chart2"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <PreferenceChartCard
          title="Database"
          description="Com que frequência cada database foi selecionada."
          data={data.databaseDistribution}
          colorKey="chart4"
        />
        <PreferenceChartCard
          title="ORM"
          description="Com que frequência cada ORM foi selecionado."
          data={data.ormDistribution}
          colorKey="chart5"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        <PreferenceChartCard
          title="API"
          description="Com que frequência cada tipo de API foi selecionado."
          data={data.apiDistribution}
          colorKey="chart3"
        />
        <PreferenceChartCard
          title="Provedor de autenticação"
          description="Com que frequência cada provedor de autenticação foi selecionado."
          data={data.authDistribution}
          colorKey="chart1"
        />
        <PreferenceChartCard
          title="Runtime"
          description="Com que frequência cada runtime foi selecionado."
          data={data.runtimeDistribution}
          colorKey="chart2"
        />
      </div>
    </div>
  );
}
