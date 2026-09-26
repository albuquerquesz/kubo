"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { RemoteDevSync } from "@/components/dev/remote-dev-sync";
import { KuboHimetricaProvider } from "@/components/himetrica-provider";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/env/client";
import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL ?? "");

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KuboHimetricaProvider>
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </ConvexBetterAuthProvider>
      <Toaster />
      {process.env.NODE_ENV === "development" ? <RemoteDevSync /> : null}
    </KuboHimetricaProvider>
  );
}
