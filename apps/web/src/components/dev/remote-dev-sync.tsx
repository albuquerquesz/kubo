"use client";

import { useEffect, useRef } from "react";

/**
 * Phone / Tailscale preview: when the agent saves files on the notebook, full-reload.
 *
 * Why not only Next HMR? Turbopack HMR WebSockets die easily on mobile + MagicDNS.
 * `dev:remote` runs a file watcher that bumps `.remote-reload-token`; this client
 * polls `/api/dev/remote-reload` and does `location.reload()` when the token changes.
 */
function isRemoteDevHost(hostname: string): boolean {
  if (!hostname) return false;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") {
    return false;
  }
  return true;
}

const POLL_MS = 1200;

export function RemoteDevSync() {
  const lastTokenRef = useRef<string | null>(null);
  const loggedRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;
    if (!isRemoteDevHost(window.location.hostname)) return;

    if (!loggedRef.current) {
      loggedRef.current = true;
      console.info(
        "[kubo remote-dev] Preview remoto ativo em",
        window.location.host,
        `— polling a cada ${POLL_MS}ms. Suba com \`bun run dev:remote\`.`,
      );
    }

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const response = await fetch("/api/dev/remote-reload", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as { token?: string | null };
        const token = data.token ?? null;
        if (!token) return;

        if (lastTokenRef.current === null) {
          lastTokenRef.current = token;
          return;
        }
        if (token !== lastTokenRef.current) {
          lastTokenRef.current = token;
          console.info("[kubo remote-dev] Código mudou no notebook — recarregando…");
          window.location.reload();
        }
      } catch {
        // Network blip on Tailscale — try again next tick.
      }
    };

    void poll();
    const id = window.setInterval(() => void poll(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return null;
}
