"use client";

import { useEffect } from "react";

import { captureKuboError } from "@/lib/himetrica-events";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    captureKuboError(error, {
      boundary: "global",
      route: window.location.pathname,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="pt-BR" className="dark">
      <body
        style={{ background: "#0a0a0a", color: "#fafafa", fontFamily: "monospace", padding: 48 }}
      >
        <p>ERROR_500.TXT — algo deu errado.</p>
        {error.digest ? <p style={{ opacity: 0.6 }}>digest: {error.digest}</p> : null}
        <button type="button" onClick={retry} style={{ marginTop: 16 }}>
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
