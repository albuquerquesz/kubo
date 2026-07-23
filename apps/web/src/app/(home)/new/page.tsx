import type { Metadata } from "next";
import { Suspense } from "react";

import { StackBuilder } from "./_components/stack-builder";

export const metadata: Metadata = {
  title: "Construtor de stack - kubojs",
  description: "Interface interativa para montar a sua stack",
  openGraph: {
    title: "Construtor de stack - kubojs",
    description: "Interface interativa para montar a sua stack",
    url: "https://kubojs.dev/new",
    images: [
      {
        url: "https://kubojs.dev/og/site/new.png",
        width: 1200,
        height: 630,
        alt: "Construtor de stack kubojs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Construtor de stack - kubojs",
    description: "Interface interativa para montar a sua stack",
    images: ["https://kubojs.dev/og/site/new.png"],
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
