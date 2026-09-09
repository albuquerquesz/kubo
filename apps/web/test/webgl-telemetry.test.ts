import { describe, expect, test } from "bun:test";

import { isWebGLShaderErrorMessage, truncateWebGLMessage } from "@/lib/webgl-telemetry";

describe("WebGL telemetry helpers", () => {
  test("recognizes the browser shaderSource error", () => {
    expect(
      isWebGLShaderErrorMessage(
        "Argument 1 ('shader') to WebGL2RenderingContext.shaderSource must be an instance of WebGLShader",
      ),
    ).toBe(true);
  });

  test("ignores unrelated WebGL messages", () => {
    expect(isWebGLShaderErrorMessage("WebGL context restored")).toBe(false);
    expect(isWebGLShaderErrorMessage("shaderSource failed")).toBe(false);
  });

  test("limits messages sent as event properties", () => {
    expect(truncateWebGLMessage(` ${"x".repeat(300)} `)).toHaveLength(240);
  });
});
