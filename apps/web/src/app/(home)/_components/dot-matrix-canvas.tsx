"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  precision mediump float;

  uniform vec2 u_resolution;
  out vec2 fragCoord;

  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
    fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
    fragCoord.y = u_resolution.y - fragCoord.y;
  }
`;

const fragmentShader = `
  precision mediump float;

  in vec2 fragCoord;

  uniform float u_time;
  uniform float u_opacities[10];
  uniform vec3 u_colors[6];
  uniform float u_total_size;
  uniform float u_dot_size;
  uniform vec2 u_resolution;

  out vec4 fragColor;

  float PHI = 1.61803398874989484820459;
  float random(vec2 xy) {
    return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
  }

  void main() {
    vec2 st = fragCoord.xy;
    st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
    st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

    float opacity = step(0.0, st.x);
    opacity *= step(0.0, st.y);

    vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
    float frequency = 5.0;
    float show_offset = random(st2);
    float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
    opacity *= u_opacities[int(rand * 10.0)];
    opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
    opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

    vec3 color = u_colors[int(show_offset * 6.0)];
    float animation_speed_factor = 0.5;
    vec2 center_grid = u_resolution / 2.0 / u_total_size;
    float dist_from_center = distance(center_grid, st2);
    float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

    opacity *= step(timing_offset_intro, u_time * animation_speed_factor);
    opacity *= clamp(
      (1.0 - step(timing_offset_intro + 0.1, u_time * animation_speed_factor)) * 1.25,
      1.0,
      1.25
    );

    fragColor = vec4(color, opacity);
    fragColor.rgb *= fragColor.a;
  }
`;

function DotMatrixMaterial({ reducedMotion }: { reducedMotion: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const startTimeRef = useRef<number | null>(null);
  const { gl, size } = useThree();

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_opacities: { value: [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1] },
      u_colors: {
        value: Array.from({ length: 6 }, () => new THREE.Vector3(214 / 255, 167 / 255, 43 / 255)),
      },
      u_total_size: { value: 20 },
      u_dot_size: { value: 4 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useEffect(() => {
    uniforms.u_resolution.value.set(
      size.width * gl.getPixelRatio(),
      size.height * gl.getPixelRatio(),
    );
  }, [gl, size.height, size.width, uniforms]);

  useEffect(() => {
    startTimeRef.current = null;
    uniforms.u_time.value = reducedMotion ? 6 : 0;
  }, [reducedMotion, uniforms]);

  useFrame(({ clock }) => {
    if (reducedMotion || !materialRef.current) return;

    const startTime = startTimeRef.current ?? clock.getElapsedTime();
    startTimeRef.current = startTime;
    const timeUniform = materialRef.current.uniforms.u_time;
    if (timeUniform) {
      timeUniform.value = clock.getElapsedTime() - startTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        blending={THREE.CustomBlending}
        blendDst={THREE.OneFactor}
        blendSrc={THREE.SrcAlphaFactor}
        fragmentShader={fragmentShader}
        glslVersion={THREE.GLSL3}
        premultipliedAlpha
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}

export default function DotMatrixCanvas({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      aria-hidden="true"
      className="pointer-events-none !absolute !inset-0 !z-[-1] !h-full !w-full"
      dpr={[1, 2]}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
        premultipliedAlpha: true,
      }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <DotMatrixMaterial reducedMotion={reducedMotion} />
    </Canvas>
  );
}
