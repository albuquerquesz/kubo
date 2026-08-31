import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import type { StackState } from "@/lib/constant";
import { OG_SIZE } from "@/lib/og";
import { loadStackParams } from "@/lib/stack-url-state";
import { getSelectedTechs } from "@/lib/stack-utils";

import { ogEditorial } from "./_lib/colors";
import { loadKuboMarkDataUrl, loadStackOgFonts } from "./_lib/fonts";
import { loadTechIconDataUrls } from "./_lib/icons";
import { OgMosaicField } from "./_lib/mosaic";

export const runtime = "nodejs";

const MAX_CHIPS = 12;
const CHIP_ICON_SIZE = 22;

function commandBase(packageManager: StackState["packageManager"]) {
  if (packageManager === "npm") return "npx create-kubojs@latest";
  if (packageManager === "pnpm") return "pnpm create kubojs@latest";
  return "bun create kubojs@latest";
}

export async function GET(req: NextRequest) {
  const stack = await loadStackParams(
    Promise.resolve(Object.fromEntries(req.nextUrl.searchParams)),
  );
  const projectName = (stack.projectName || "my-kubo-app").slice(0, 40);
  const techs = getSelectedTechs(stack);
  const visible = techs.slice(0, MAX_CHIPS);
  const overflow = techs.length - visible.length;
  const command = `${commandBase(stack.packageManager)} ${projectName}`;

  const [fonts, markSrc, iconSrcByPath] = await Promise.all([
    loadStackOgFonts(),
    loadKuboMarkDataUrl(),
    loadTechIconDataUrls(visible.map((tech) => tech.icon)),
  ]);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        position: "relative",
        background: ogEditorial.background,
        color: ogEditorial.foreground,
        fontFamily: '"Space Grotesk"',
      }}
    >
      <OgMosaicField width={OG_SIZE.width} height={OG_SIZE.height} />

      {/* Copy-safe veil — denser on the left where type sits */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.22) 72%, rgba(0,0,0,0.45) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 28%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "48px 56px 40px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img
            src={markSrc}
            width={52}
            height={52}
            alt=""
            style={{ display: "flex", objectFit: "contain" }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <span
              style={{
                fontFamily: '"IBM Plex Mono"',
                fontSize: "14px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: ogEditorial.primary,
                display: "flex",
              }}
            >
              STACK
            </span>
            <span
              style={{
                fontFamily: '"IBM Plex Mono"',
                fontSize: "14px",
                color: ogEditorial.mutedForeground,
                display: "flex",
              }}
            >
              kubojs.dev/new
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            maxWidth: "980px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontFamily: '"IBM Plex Mono"',
              fontSize: "20px",
              fontWeight: 400,
            }}
          >
            <span style={{ color: ogEditorial.primary, display: "flex" }}>$</span>
            <span style={{ color: ogEditorial.mutedForeground, display: "flex" }}>{command}</span>
          </div>

          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: ogEditorial.foreground,
              display: "flex",
            }}
          >
            {projectName}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", maxWidth: "1020px" }}>
            {visible.map((tech, index) => {
              const emphasize = index === 0;
              const iconSrc = iconSrcByPath.get(tech.icon);
              return (
                <div
                  key={`${tech.category}-${tech.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: iconSrc ? "7px 14px 7px 10px" : "7px 16px",
                    borderRadius: "9999px",
                    border: `1px solid ${emphasize ? ogEditorial.primary : ogEditorial.ruleStrong}`,
                    background: emphasize ? "rgba(196,147,20,0.14)" : "rgba(255,255,255,0.04)",
                    color: emphasize ? ogEditorial.accent : ogEditorial.foreground,
                    fontSize: "18px",
                    fontWeight: 500,
                  }}
                >
                  {iconSrc ? (
                    <img
                      src={iconSrc}
                      width={CHIP_ICON_SIZE}
                      height={CHIP_ICON_SIZE}
                      alt=""
                      style={{ display: "flex", objectFit: "contain" }}
                    />
                  ) : null}
                  <span style={{ display: "flex" }}>{tech.name}</span>
                </div>
              );
            })}
            {overflow > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 16px",
                  borderRadius: "9999px",
                  border: `1px solid ${ogEditorial.rule}`,
                  color: ogEditorial.mutedForeground,
                  fontSize: "18px",
                  fontFamily: '"IBM Plex Mono"',
                }}
              >
                +{overflow} mais
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${ogEditorial.rule}`,
            paddingTop: "18px",
          }}
        >
          <span
            style={{
              fontFamily: '"IBM Plex Mono"',
              fontSize: "16px",
              color: ogEditorial.mutedForeground,
              display: "flex",
            }}
          >
            {techs.length} tecnologias
          </span>
          <span
            style={{
              fontFamily: '"IBM Plex Mono"',
              fontSize: "16px",
              color: ogEditorial.primary,
              display: "flex",
            }}
          >
            kubojs.dev
          </span>
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts,
    },
  );
}
