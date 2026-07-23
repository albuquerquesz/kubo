export const dynamic = "force-static";

import { api } from "@kubojs/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";

import { ShowcasePage } from "./_components/showcase-page";

export const metadata: Metadata = {
  title: "Exibição - kubojs",
  description: "Projetos criados com o kubojs",
  openGraph: {
    title: "Exibição - kubojs",
    description: "Projetos criados com o kubojs",
    url: "https://kubojs.dev/showcase",
    images: [
      {
        url: "https://kubojs.dev/og/site/showcase.png",
        width: 1200,
        height: 630,
        alt: "Exibição do kubojs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Exibição - kubojs",
    description: "Projetos criados com o kubojs",
    images: ["https://kubojs.dev/og/site/showcase.png"],
  },
};

export default async function Showcase() {
  const showcaseProjects = await fetchQuery(api.showcase.getShowcaseProjects);
  return <ShowcasePage showcaseProjects={showcaseProjects} />;
}
