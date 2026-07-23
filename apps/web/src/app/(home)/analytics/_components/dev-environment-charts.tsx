"use client";

import { cn } from "@/lib/utils";

import { formatCount, formatPercent } from "./analytics-helpers";
import { CategoryBarChart } from "./bklit-charts";
import { ChartCard } from "./chart-card";
import { PreferenceChartCard } from "./preference-chart-card";
import { SectionHeader } from "./section-header";
import type { AggregatedAnalyticsData, ShareDistributionItem } from "./types";

function SplitMeterCard({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: ShareDistributionItem[];
}) {
  const yesShare = data.find((item) => item.name === "Yes")?.share ?? 0;
  const noShare = data.find((item) => item.name === "No")?.share ?? 0;
  const yesCount = data.find((item) => item.name === "Yes")?.value ?? 0;
  const noCount = data.find((item) => item.name === "No")?.value ?? 0;
  const chartData = data.map((item) => ({
    label: item.name === "Yes" ? "Sim" : item.name === "No" ? "Não" : item.name,
    value: item.value,
  }));

  return (
    <ChartCard title={title} description={description}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(180px,0.7fr)] sm:items-center">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded border border-primary/25 bg-fd-background p-4">
            <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
              Sim
            </div>
            <div className="mt-2 font-semibold text-2xl">{formatCount(yesCount)}</div>
            <div className="mt-1 text-muted-foreground text-xs">{formatPercent(yesShare)}</div>
          </div>
          <div className="rounded border border-border bg-fd-background p-4">
            <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
              Não
            </div>
            <div className="mt-2 font-semibold text-2xl">{formatCount(noCount)}</div>
            <div className="mt-1 text-muted-foreground text-xs">{formatPercent(noShare)}</div>
          </div>
        </div>
        <CategoryBarChart
          data={chartData}
          xKey="label"
          orientation="horizontal"
          height={210}
          labelWidth={52}
          series={[{ key: "value", label: "Configurações rastreadas", color: "var(--chart-2)" }]}
        />
      </div>
    </ChartCard>
  );
}

export function DevToolsSection({ data }: { data: AggregatedAnalyticsData }) {
  const webDeployOptions = data.webDeployDistribution;
  const serverDeployOptions = data.serverDeployDistribution;
  const hasDeploymentOptions = webDeployOptions.length > 0 || serverDeployOptions.length > 0;
  const nodeVersionPreferences = data.nodeVersionDistribution.map((item) => ({
    name: item.version,
    value: item.count,
    share: item.share,
  }));
  const cliVersionPreferences = data.cliVersionDistribution.map((item) => ({
    name: item.version,
    value: item.count,
    share: item.share,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        label="Ambiente"
        title="Gerenciador de pacotes, configuração, deploy e addons"
        description="As escolhas de ambiente que moldam os projetos gerados depois das opções de stack."
        aside={
          <div className="rounded border border-border bg-fd-background px-3 py-1.5 font-mono text-muted-foreground text-xs">
            pacotes {data.summary.mostPopularPackageManager} • runtime{" "}
            {data.summary.mostPopularRuntime}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <PreferenceChartCard
          title="Configuração de database"
          description="Com que frequência cada opção de configuração de database foi selecionada."
          data={data.dbSetupDistribution}
          colorKey="chart4"
        />
        <PreferenceChartCard
          title="Gerenciador de pacotes"
          description="Com que frequência cada gerenciador de pacotes foi selecionado."
          data={data.packageManagerDistribution}
          colorKey="chart1"
        />
      </div>

      <div
        className={cn(
          "grid gap-4",
          data.paymentsDistribution.length > 0 ? "xl:grid-cols-2" : "grid-cols-1",
        )}
      >
        <PreferenceChartCard
          title="Plataforma"
          description="Quantas execuções rastreadas da CLI vieram de cada plataforma."
          data={data.platformDistribution}
          colorKey="chart2"
        />
        {data.paymentsDistribution.length > 0 ? (
          <PreferenceChartCard
            title="Pagamentos"
            description="Com que frequência cada opção de pagamentos foi selecionada, incluindo none."
            data={data.paymentsDistribution}
            colorKey="chart3"
          />
        ) : null}
      </div>

      {hasDeploymentOptions ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {webDeployOptions.length > 0 ? (
            <PreferenceChartCard
              title="Deploy web"
              description="Com que frequência cada opção de deploy web foi selecionada, incluindo none."
              data={webDeployOptions}
              colorKey="chart3"
            />
          ) : null}

          {serverDeployOptions.length > 0 ? (
            <PreferenceChartCard
              title="Deploy de servidor"
              description="Com que frequência cada opção de deploy de servidor foi selecionada, incluindo none."
              data={serverDeployOptions}
              colorKey="chart2"
            />
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <SplitMeterCard
          title="Inicialização do Git"
          description="Parcela das configurações rastreadas em que o Git foi inicializado na criação do projeto."
          data={data.gitDistribution}
        />
        <SplitMeterCard
          title="Instalar dependências"
          description="Parcela das configurações rastreadas em que as dependências foram instaladas na criação do projeto."
          data={data.installDistribution}
        />
      </div>

      <div
        className={cn(
          "grid gap-4",
          data.examplesDistribution.length > 0 ? "xl:grid-cols-2" : "grid-cols-1",
        )}
      >
        <PreferenceChartCard
          title="Versões do Node"
          description="Quantas execuções rastreadas da CLI reportaram cada versão major do Node."
          data={nodeVersionPreferences}
          colorKey="chart5"
          layout="vertical"
        />

        {data.examplesDistribution.length > 0 ? (
          <PreferenceChartCard
            title="Exemplos"
            description="Com que frequência cada exemplo foi incluído."
            data={data.examplesDistribution}
            colorKey="chart4"
            layout="vertical"
          />
        ) : null}
      </div>

      {data.addonsDistribution.length > 0 ? (
        <PreferenceChartCard
          title="Addons"
          description="Com que frequência cada addon foi selecionado."
          data={data.addonsDistribution}
          colorKey="chart1"
          columnCount={2}
        />
      ) : null}

      {cliVersionPreferences.length > 0 ? (
        <PreferenceChartCard
          title="Versões da CLI"
          description="Quantas configurações rastreadas foram criadas com cada versão da CLI."
          data={cliVersionPreferences}
          colorKey="chart4"
          columnCount={4}
          columnGridClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        />
      ) : null}
    </div>
  );
}
