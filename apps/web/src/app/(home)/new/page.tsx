import type { Metadata } from "next";
import { Suspense } from "react";

import { SITE_URL } from "@/lib/site";

import { StackBuilder } from "./_components/stack-builder";

export const metadata: Metadata = {
  title: "Stack Builder - kubojs",
  description: "Interface interativa para montar a sua stack",
  openGraph: {
    title: "Stack Builder - kubojs",
    description: "Interface interativa para montar a sua stack",
    url: `${SITE_URL}/new`,
    images: [
      {
        url: `${SITE_URL}/og/site/new.png`,
        width: 1200,
        height: 630,
        alt: "Stack Builder kubojs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stack Builder - kubojs",
    description: "Interface interativa para montar a sua stack",
    images: [`${SITE_URL}/og/site/new.png`],
  },
};

export default function FullScreenStackBuilder() {
  return (
    <Suspense>
      <div className="grid h-[calc(100vh-64px)] w-full flex-1 grid-cols-1 overflow-hidden">
        <StackBuilder />
      </div>
    </Suspense>
  );
}
