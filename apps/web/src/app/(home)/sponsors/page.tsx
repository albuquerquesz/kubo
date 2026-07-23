export const dynamic = "force-static";

import { api } from "@kubojs/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { emptySponsorsData } from "@/lib/sponsors";

import { SponsorsPage } from "./_components/sponsors-page";

export const metadata: Metadata = {
  title: "Patrocinadores - kubojs",
  description: "Empresas e desenvolvedores que financiam o desenvolvimento do kubojs",
  openGraph: {
    title: "Patrocinadores - kubojs",
    description: "Empresas e desenvolvedores que financiam o desenvolvimento do kubojs",
    url: "https://kubojs.dev/sponsors",
    images: [
      {
        url: "https://kubojs.dev/og/site/sponsors.png",
        width: 1200,
        height: 630,
        alt: "Patrocinadores do kubojs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patrocinadores - kubojs",
    description: "Empresas e desenvolvedores que financiam o desenvolvimento do kubojs",
    images: ["https://kubojs.dev/og/site/sponsors.png"],
  },
};

export default async function Sponsors() {
  const stats = await fetchQuery(api.analytics.getStats, {});
  return (
    <SponsorsPage sponsorsData={emptySponsorsData} totalProjects={stats?.totalProjects ?? 0} />
  );
}
