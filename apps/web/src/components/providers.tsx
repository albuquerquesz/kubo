"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { RemoteDevSync } from "@/components/dev/remote-dev-sync";
import { KuboHimetricaProvider } from "@/components/himetrica-provider";
import { Toaster } from "@/components/ui/sonner";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KuboHimetricaProvider>
      <ConvexProvider client={convex}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </ConvexProvider>
      <Toaster />
      {process.env.NODE_ENV === "development" ? <RemoteDevSync /> : null}
    </KuboHimetricaProvider>
  );
}
