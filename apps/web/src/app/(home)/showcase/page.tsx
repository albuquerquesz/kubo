export const dynamic = "force-static";

import { api } from "@kubojs/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { ShowcasePage } from "./_components/showcase-page";

export const metadata: Metadata = {
  title: "Showcase - kubojs",
  description: "Projects created with kubojs",
  openGraph: {
    title: "Showcase - kubojs",
    description: "Projects created with kubojs",
    url: "https://kubojs.dev/showcase",
    images: [
      {
        url: "https://kubojs.dev/og/site/showcase.png",
        width: 1200,
        height: 630,
        alt: "kubojs Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Showcase - kubojs",
    description: "Projects created with kubojs",
    images: ["https://kubojs.dev/og/site/showcase.png"],
  },
};

export default async function Showcase() {
  const showcaseProjects = await fetchQuery(api.showcase.getShowcaseProjects);
  return <ShowcasePage showcaseProjects={showcaseProjects} />;
}
