"use client";

import { getHimetricaClient } from "@/lib/himetrica";

type HimetricaEventProperties = {
  builder_started: Record<string, never>;
  stack_option_selected: { category: string; value: string };
  command_copied: { source: "builder" };
  stack_randomized: Record<string, never>;
  stack_saved: Record<string, never>;
  stack_reset: Record<string, never>;
  preset_applied: { preset: string };
  webgl_context_lost: { surface: WebGLSurface; route: string; status_message: string };
  webgl_context_restored: { surface: WebGLSurface; route: string };
  webgl_context_creation_error: { surface: WebGLSurface; route: string; status_message: string };
  webgl_shader_error: {
    surface: WebGLSurface;
    route: string;
    message: string;
    source: "window_error";
  };
};

export type WebGLSurface = "hero_dithering" | "cta_dot_matrix";

export type KuboHimetricaEvent = keyof HimetricaEventProperties;

export type KuboErrorContext = {
  boundary: "route" | "global" | "manual";
  route: string;
  digest?: string;
};

function trackKuboEvent<EventName extends KuboHimetricaEvent>(
  eventName: EventName,
  properties: HimetricaEventProperties[EventName],
) {
  getHimetricaClient()?.track(eventName, properties);
}

const kuboHimetrica = { track: trackKuboEvent };

export function useKuboHimetrica() {
  return kuboHimetrica;
}

export function captureKuboError(error: Error, context: KuboErrorContext) {
  getHimetricaClient()?.captureError(error, context);
}

export function useKuboCaptureError() {
  return captureKuboError;
}
