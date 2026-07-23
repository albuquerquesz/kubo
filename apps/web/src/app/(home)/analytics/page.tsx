import { api } from "@kubojs/backend/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { AnalyticsClient } from "./analytics-client";

export const metadata: Metadata = {
  title: "Análise - kubojs",
  description: "Análise de criação de projetos com Convex para o kubojs.",
  openGraph: {
    title: "Análise - kubojs",
    description: "Análise de criação de projetos com Convex para o kubojs.",
    url: "https://kubojs.dev/analytics",
    images: [
      {
        url: "https://kubojs.dev/og/site/analytics.png",
        width: 1200,
        height: 630,
        alt: "Análise Convex do kubojs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Análise - kubojs",
    description: "Análise de criação de projetos com Convex para o kubojs.",
    images: ["https://kubojs.dev/og/site/analytics.png"],
  },
};

export default async function Analytics() {
  const [preloadedStats, preloadedDailyStats, preloadedMonthlyStats] = await Promise.all([
    preloadQuery(api.analytics.getStats, {}),
    preloadQuery(api.analytics.getDailyStats, { days: 30 }),
    preloadQuery(api.analytics.getMonthlyStats, {}),
  ]);

  return (
    <AnalyticsClient
      preloadedStats={preloadedStats}
      preloadedDailyStats={preloadedDailyStats}
      preloadedMonthlyStats={preloadedMonthlyStats}
    />
  );
}
