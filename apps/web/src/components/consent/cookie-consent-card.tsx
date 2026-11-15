"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { writeConsent } from "@/lib/consent";

import { useAnalyticsConsent } from "./use-analytics-consent";

/** Asks once for analytics consent; nothing is tracked or recorded until the visitor accepts. */
export function CookieConsentCard() {
  const consent = useAnalyticsConsent();
  if (consent !== null) return null;

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-4 bottom-4 z-50 rounded-xl border border-border bg-fd-background p-4 shadow-lg sm:inset-x-auto sm:left-4 sm:max-w-sm"
    >
      <div className="flex items-center gap-2">
        <Cookie className="size-4 shrink-0 text-primary" aria-hidden />
        <h2 id="cookie-consent-title" className="font-semibold text-sm">
          Cookies e análise de uso
        </h2>
      </div>
      <p
        id="cookie-consent-description"
        className="mt-2 text-muted-foreground text-xs leading-relaxed"
      >
        Com sua permissão, medimos o uso do site e gravamos sessões anônimas do Stack Builder para
        melhorar o Kubo. O que você digita nunca é gravado.{" "}
        <Link href="/docs/privacy" className="text-foreground underline underline-offset-2">
          Saiba mais
        </Link>
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => writeConsent("denied")}>
          Recusar
        </Button>
        <Button variant="cta" size="sm" onClick={() => writeConsent("granted")}>
          Aceitar
        </Button>
      </div>
    </section>
  );
}

/** Footer link that reopens the card so the visitor can change the answer. */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => writeConsent(null)}>
      Preferências de cookies
    </button>
  );
}
