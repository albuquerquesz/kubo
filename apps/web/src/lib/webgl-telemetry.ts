export const WEBGL_MESSAGE_LIMIT = 240;

export function truncateWebGLMessage(message: string): string {
  return message.trim().slice(0, WEBGL_MESSAGE_LIMIT);
}

export function isWebGLShaderErrorMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("shadersource") && normalized.includes("webgl");
}

export function getWebGLStatusMessage(event: Event): string {
  if ("statusMessage" in event && typeof event.statusMessage === "string") {
    return truncateWebGLMessage(event.statusMessage);
  }

  return "";
}
