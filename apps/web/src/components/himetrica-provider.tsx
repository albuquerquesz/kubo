"use client";

import { useEffect } from "react";

import { getHimetricaClient } from "@/lib/himetrica";

export function KuboHimetricaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getHimetricaClient();
  }, []);

  return children;
}
