"use client";

import { HimetricaProvider } from "@himetrica/tracker-js/react";

import { env } from "@/env/client";

export function KuboHimetricaProvider({ children }: { children: React.ReactNode }) {
  const apiKey = env.NEXT_PUBLIC_HIMETRICA_API_KEY;

  if (!apiKey) {
    return children;
  }

  return (
    <HimetricaProvider apiKey={apiKey} autoTrackErrors trackVitals>
      {children}
    </HimetricaProvider>
  );
}
