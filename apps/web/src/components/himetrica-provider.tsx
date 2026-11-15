"use client";

import { useEffect } from "react";

import { useAnalyticsConsent } from "@/components/consent/use-analytics-consent";
import { getHimetricaClient } from "@/lib/himetrica";

export function KuboHimetricaProvider({ children }: { children: React.ReactNode }) {
  const consent = useAnalyticsConsent();
  useEffect(() => {
    // Starts once the visitor accepts; a reload after refusing keeps it off.
    if (consent === "granted") getHimetricaClient();
  }, [consent]);

  return children;
}
