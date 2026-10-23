"use client";

import { Home, RotateCcw, Terminal } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useKuboCaptureError } from "@/lib/himetrica-events";

export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const captureError = useKuboCaptureError();

  useEffect(() => {
    captureError(error, {
      boundary: "route",
      route: window.location.pathname,
      digest: error.digest,
    });
  }, [captureError, error]);

  return (
    <div className="container mx-auto min-h-svh">
      <main className="mx-auto px-4 pt-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-bold font-mono text-lg sm:text-xl">ERROR_500.TXT</span>
          </div>
          <div className="h-px flex-1 bg-border" />
          <span className="text-muted-foreground text-xs">[ALGO DEU ERRADO]</span>
        </div>

        <div className="rounded border border-border bg-fd-background p-4">
          <p className="font-mono text-sm">
            <span className="text-primary">$ </span>
            Não foi possível carregar esta página.
          </p>
          {error.digest ? (
            <p className="mt-2 font-mono text-muted-foreground text-xs">digest: {error.digest}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={retry}>
              <RotateCcw />
              Tentar novamente
            </Button>
            <Link href="/" className={buttonVariants({ variant: "ghost" })}>
              <Home />
              Voltar à página inicial
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
