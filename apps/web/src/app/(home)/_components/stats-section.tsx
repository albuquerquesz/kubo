"use client";

import { api } from "@better-t-stack/backend/convex/_generated/api";
import { useNpmDownloadCounter } from "@erquhart/convex-oss-stats/react";
import { useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type NpmPackageStats = NonNullable<Parameters<typeof useNpmDownloadCounter>[0]>;
type GithubRepoStats = {
  starCount: number;
  contributorCount: number;
};

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function getDaySpan(firstDate: string | null, lastDate: string | null): number {
  if (!firstDate || !lastDate) return 0;

  const start = Date.parse(`${firstDate}T00:00:00Z`);
  const end = Date.parse(`${lastDate}T00:00:00Z`);

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.floor((end - start) / MILLISECONDS_PER_DAY) + 1;
}

function Metric({
  index,
  label,
  value,
  detail,
}: {
  index: string;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="flex min-h-72 flex-col justify-between border-rule p-6 not-last:border-b sm:p-8 lg:not-last:border-r lg:not-last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="ui-kicker text-primary">{index}</span>
        <span className="ui-kicker text-muted-foreground">{label}</span>
      </div>
      <strong
        className="ui-display text-[clamp(4rem,8vw,7rem)] leading-none tabular-nums"
        aria-live="polite"
      >
        {value}
      </strong>
      <p className="ui-kicker text-muted-foreground">{detail}</p>
    </div>
  );
}

export default function StatsSection() {
  const stats = useQuery(api.analytics.getStats, {});
  const monthlyStats = useQuery(api.analytics.getMonthlyStats, {});
  const githubRepo = useQuery(api.stats.getGithubRepo, {
    name: "AmanVarshney01/create-better-t-stack",
  }) as GithubRepoStats | null | undefined;
  const npmPackages = useQuery(api.stats.getNpmPackages, {
    names: ["create-better-t-stack"],
  }) as NpmPackageStats | null | undefined;

  const liveNpmDownloadCount = useNpmDownloadCounter(npmPackages);
  const totalProjects = stats?.totalProjects ?? 0;
  const trackingDays = getDaySpan(monthlyStats?.firstDate ?? null, monthlyStats?.lastDate ?? null);
  const averagePerDay = trackingDays > 0 ? (totalProjects / trackingDays).toFixed(1) : "0";

  return (
    <section id="proof" className="ui-scroll-target border-rule border-b">
      <div className="grid lg:grid-cols-12">
        <div className="border-rule p-5 sm:p-8 lg:col-span-4 lg:border-r lg:p-10">
          <p className="ui-kicker text-primary">04 / Proof</p>
          <p className="mt-5 max-w-xs leading-relaxed text-muted-foreground">
            Public package, public repository, and public usage telemetry. The work is inspectable.
          </p>
        </div>
        <div className="p-5 sm:p-8 lg:col-span-8 lg:p-10">
          <h2 className="ui-display max-w-4xl text-[clamp(2.7rem,5.5vw,5.8rem)] leading-[0.92]">
            Evidence,
            <br />
            <span className="text-primary">not a pitch deck.</span>
          </h2>
        </div>
      </div>

      <div className="grid border-rule border-t lg:grid-cols-3">
        <Metric
          index="01"
          label="Generated"
          value={totalProjects.toLocaleString()}
          detail={`${averagePerDay} projects / tracked day`}
        />
        <Metric
          index="02"
          label="GitHub"
          value={(githubRepo?.starCount ?? 0).toLocaleString()}
          detail={`${githubRepo?.contributorCount ?? 0} contributors`}
        />
        <Metric
          index="03"
          label="NPM"
          value={(liveNpmDownloadCount?.count ?? 0).toLocaleString()}
          detail="live package downloads"
        />
      </div>

      <div className="grid border-rule border-t lg:grid-cols-12">
        <div className="ui-rule-grid flex min-h-64 items-end p-6 sm:p-8 lg:col-span-8 lg:border-r lg:p-10">
          <p className="max-w-3xl text-2xl font-semibold leading-tight sm:text-4xl">
            Every generated project is a vote for explicit architecture over hidden defaults.
          </p>
        </div>
        <div className="grid lg:col-span-4">
          <Link
            href="/analytics"
            className="group flex min-h-32 items-center justify-between border-rule border-b p-6 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:p-8"
          >
            <span>
              <span className="ui-kicker block text-muted-foreground">Inspect</span>
              <strong className="mt-2 block text-xl">Usage analytics</strong>
            </span>
            <ArrowUpRight className="size-5 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
          <a
            href="https://github.com/AmanVarshney01/create-better-t-stack"
            target="_blank"
            rel="noreferrer"
            className="group flex min-h-32 items-center justify-between p-6 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:p-8"
          >
            <span>
              <span className="ui-kicker block text-muted-foreground">Audit</span>
              <strong className="mt-2 block text-xl">Source on GitHub</strong>
            </span>
            <ArrowUpRight className="size-5 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
