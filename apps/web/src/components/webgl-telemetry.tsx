"use client";

import { useLayoutEffect, type RefObject } from "react";

import { useKuboHimetrica, type WebGLSurface } from "@/lib/himetrica-events";
import {
  getWebGLStatusMessage,
  isWebGLShaderErrorMessage,
  truncateWebGLMessage,
} from "@/lib/webgl-telemetry";

function getRoute(): string {
  return typeof window === "undefined" ? "unknown" : window.location.pathname;
}

export function useWebGLTelemetry(
  surface: WebGLSurface,
  hostRef: RefObject<HTMLElement | null>,
  captureShaderErrors = false,
): void {
  const analytics = useKuboHimetrica();

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const attachedCanvases = new WeakSet<HTMLCanvasElement>();
    const cleanups: Array<() => void> = [];

    const attachCanvas = (canvas: HTMLCanvasElement) => {
      if (attachedCanvases.has(canvas)) return;
      attachedCanvases.add(canvas);

      let contextLossReported = false;
      const onContextLost = (event: Event) => {
        if (contextLossReported) return;
        contextLossReported = true;
        analytics.track("webgl_context_lost", {
          surface,
          route: getRoute(),
          status_message: getWebGLStatusMessage(event),
        });
      };
      const onContextRestored = () => {
        contextLossReported = false;
        analytics.track("webgl_context_restored", { surface, route: getRoute() });
      };
      const onContextCreationError = (event: Event) => {
        analytics.track("webgl_context_creation_error", {
          surface,
          route: getRoute(),
          status_message: getWebGLStatusMessage(event),
        });
      };

      canvas.addEventListener("webglcontextlost", onContextLost);
      canvas.addEventListener("webglcontextrestored", onContextRestored);
      canvas.addEventListener("webglcontextcreationerror", onContextCreationError);

      cleanups.push(() => {
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.removeEventListener("webglcontextrestored", onContextRestored);
        canvas.removeEventListener("webglcontextcreationerror", onContextCreationError);
      });
    };

    const scanCanvases = () => {
      host.querySelectorAll<HTMLCanvasElement>("canvas").forEach(attachCanvas);
    };

    const observer = new MutationObserver(scanCanvases);
    observer.observe(host, { childList: true, subtree: true });
    scanCanvases();

    const onWindowError = captureShaderErrors
      ? (event: ErrorEvent) => {
          const message =
            event.message || (event.error instanceof Error ? event.error.message : "");
          if (!isWebGLShaderErrorMessage(message)) return;

          analytics.track("webgl_shader_error", {
            surface,
            route: getRoute(),
            message: truncateWebGLMessage(message),
            source: "window_error",
          });
        }
      : null;

    if (onWindowError) window.addEventListener("error", onWindowError);

    return () => {
      observer.disconnect();
      if (onWindowError) window.removeEventListener("error", onWindowError);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [analytics, captureShaderErrors, hostRef, surface]);
}
