export const dynamic = "force-static";

import { api } from "@kubojs/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { emptySponsorsData } from "@/lib/sponsors";

import { SponsorsPage } from "./_components/sponsors-page";

export const metadata: Metadata = {
  title: "Sponsors - kubojs",
  description: "The companies and developers funding kubojs development",
  openGraph: {
    title: "Sponsors - kubojs",
    description: "The companies and developers funding kubojs development",
    url: "https://kubojs.dev/sponsors",
    images: [
      {
        url: "https://kubojs.dev/og/site/sponsors.png",
        width: 1200,
        height: 630,
        alt: "kubojs Sponsors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsors - kubojs",
    description: "The companies and developers funding kubojs development",
    images: ["https://kubojs.dev/og/site/sponsors.png"],
  },
};

export default async function Sponsors() {
  const stats = await fetchQuery(api.analytics.getStats, {});
  return (
    <SponsorsPage sponsorsData={emptySponsorsData} totalProjects={stats?.totalProjects ?? 0} />
  );
}
