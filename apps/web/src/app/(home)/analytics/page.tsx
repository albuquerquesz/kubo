import { api } from "@kubojs/backend/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { AnalyticsClient } from "./analytics-client";

export const metadata: Metadata = {
  title: "Analytics - kubojs",
  description: "Convex-backed project creation analytics for kubojs.",
  openGraph: {
    title: "Analytics - kubojs",
    description: "Convex-backed project creation analytics for kubojs.",
    url: "https://kubojs.dev/analytics",
    images: [
      {
        url: "https://kubojs.dev/og/site/analytics.png",
        width: 1200,
        height: 630,
        alt: "kubojs Convex Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Analytics - kubojs",
    description: "Convex-backed project creation analytics for kubojs.",
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
