"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import * as THREE from "three";

type BeamColors = {
  background: string;
  foreground: string;
  primary: string;
  accent: string;
};

type BeamSettings = {
  count: number;
  maxDpr: number;
};

const FALLBACK_COLORS: BeamColors = {
  background: "#11110d",
  foreground: "#f2ede0",
  primary: "#c49314",
  accent: "#d6a72b",
};

const DEFAULT_BEAM_SETTINGS: BeamSettings = { count: 7, maxDpr: 1 };

const vertexShader = /* glsl */ `
  uniform float u_time;
  uniform float u_seed;

  varying vec2 v_uv;
  varying float v_depth;

  void main() {
    v_uv = uv;

    vec3 transformed = position;
    float wave = sin(position.y * 0.72 + u_time * 0.18 + u_seed) * 0.18;
    wave += sin(position.y * 1.37 - u_time * 0.11 + u_seed * 2.4) * 0.07;
    transformed.x += wave * (0.42 + uv.y * 0.58);
    transformed.z += sin(position.y * 0.4 + u_seed) * 0.06;

    vec4 world_position = modelMatrix * vec4(transformed, 1.0);
    v_depth = clamp((world_position.z + 4.0) / 8.0, 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * world_position;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float u_time;
  uniform float u_seed;
  uniform float u_opacity;
  uniform vec3 u_foreground;
  uniform vec3 u_primary;
  uniform vec3 u_accent;

  varying vec2 v_uv;
  varying float v_depth;

  void main() {
    float edge = smoothstep(0.0, 0.18, v_uv.x) * smoothstep(1.0, 0.82, v_uv.x);
    float core = pow(max(0.0, 1.0 - abs(v_uv.x - 0.5) * 2.0), 4.0);
    float drift = sin(v_uv.y * 5.5 + u_time * 0.1 + u_seed) * 0.5 + 0.5;
    float taper = smoothstep(0.0, 0.12, v_uv.y) * (1.0 - smoothstep(0.64, 1.0, v_uv.y));
    float alpha = (edge * 0.3 + core * 0.58) * taper * u_opacity;

    vec3 beam_color = mix(u_foreground, u_primary, 0.45 + drift * 0.25);
    beam_color = mix(beam_color, u_accent, core * 0.42);
    beam_color *= 0.78 + v_depth * 0.22;

    gl_FragColor = vec4(beam_color, alpha);
  }
`;

function getBeamSettings(): BeamSettings {
  if (typeof window === "undefined") return DEFAULT_BEAM_SETTINGS;

  if (window.innerWidth >= 1440) return { count: 14, maxDpr: 1.75 };
  if (window.innerWidth >= 768) return { count: 9, maxDpr: 1.5 };
  return { count: 6, maxDpr: 1 };
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function useThemeColors() {
  const [colors, setColors] = useState(FALLBACK_COLORS);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const readToken = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;

    setColors({
      background: readToken("--background", FALLBACK_COLORS.background),
      foreground: readToken("--foreground", FALLBACK_COLORS.foreground),
      primary: readToken("--primary", FALLBACK_COLORS.primary),
      accent: readToken("--accent", FALLBACK_COLORS.accent),
    });
  }, []);

  return colors;
}

function Beam({
  index,
  colors,
  reducedMotion,
}: {
  index: number;
  colors: BeamColors;
  reducedMotion: boolean;
}) {
  const seed = (index * 1.61803398875) % 10;
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          u_accent: { value: new THREE.Color(colors.accent) },
          u_foreground: { value: new THREE.Color(colors.foreground) },
          u_opacity: { value: 0.68 + (index % 3) * 0.08 },
          u_primary: { value: new THREE.Color(colors.primary) },
          u_seed: { value: seed },
          u_time: { value: 0 },
        },
        vertexShader,
        fragmentShader,
      }),
    [colors.accent, colors.foreground, colors.primary, index, seed],
  );

  useFrame(({ clock }) => {
    if (!reducedMotion) material.uniforms.u_time.value = clock.getElapsedTime();
  });

  const position = [
    (((index * 37) % 100) / 100) * 6 - 3,
    ((index * 19) % 20) / 10 - 1,
    -index * 0.28,
  ] as const;
  const rotation = [
    0.04 * Math.sin(index),
    0.12 * Math.cos(index * 1.4),
    -0.16 + index * 0.075,
  ] as const;
  const scale = [0.62 + (index % 4) * 0.15, 1.5 + (index % 3) * 0.2, 1] as const;

  return (
    <mesh material={material} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1.15, 6.8, 1, 18]} />
    </mesh>
  );
}

function BeamScene({
  colors,
  reducedMotion,
  settings,
}: {
  colors: BeamColors;
  reducedMotion: boolean;
  settings: BeamSettings;
}) {
  const beams = useMemo(
    () => Array.from({ length: settings.count }, (_, index) => index),
    [settings.count],
  );

  return (
    <>
      <color attach="background" args={[colors.background]} />
      <group position={[0, 0, -1]}>
        {beams.map((index) => (
          <Beam key={index} colors={colors} index={index} reducedMotion={reducedMotion} />
        ))}
      </group>
    </>
  );
}

function StaticBeams() {
  return <div className="ethereal-beams-fallback" aria-hidden="true" />;
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export default function EtherealBeamsCanvas() {
  const [mounted, setMounted] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_BEAM_SETTINGS);
  const reducedMotion = usePrefersReducedMotion();
  const colors = useThemeColors();

  useEffect(() => {
    setMounted(true);
    setSettings(getBeamSettings());

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    setWebglAvailable(Boolean(context));

    const handleResize = () => setSettings(getBeamSettings());
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <StaticBeams />
      {mounted && webglAvailable && (
        <WebGLErrorBoundary fallback={<StaticBeams />} onError={() => setWebglAvailable(false)}>
          <Canvas
            camera={{ far: 30, fov: 38, near: 0.1, position: [0, 0, 7] }}
            className="ethereal-beams-canvas !absolute !inset-0 !h-full !w-full"
            dpr={[1, settings.maxDpr]}
            frameloop={reducedMotion ? "demand" : "always"}
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            onCreated={({ gl }) => gl.setClearColor(new THREE.Color(colors.background), 0)}
          >
            <BeamScene colors={colors} reducedMotion={reducedMotion} settings={settings} />
          </Canvas>
        </WebGLErrorBoundary>
      )}
    </div>
  );
}
