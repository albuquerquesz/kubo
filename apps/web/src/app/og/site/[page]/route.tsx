import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { OG_SIZE, OgShell, ogColors } from "@/lib/og";

export const revalidate = false;

const PAGES: Record<
  string,
  { path: string; section: string; title: string; description: string; command?: string }
> = {
  home: {
    path: "~",
    section: "home",
    title: "Monte a sua stack",
    description: "CLI moderna para criar projetos TypeScript end-to-end com type safety",
    command: "bun create kubojs@latest",
  },
  new: {
    path: "~/new",
    section: "stack builder",
    title: "Stack Builder",
    description: "Escolha sua stack e receba um comando pronto para rodar",
    command: "bun create kubojs@latest my-app --yes",
  },
  showcase: {
    path: "~/showcase",
    section: "exibição",
    title: "Exibição",
    description: "Projetos criados com kubojs",
  },
  analytics: {
    path: "~/analytics",
    section: "análise",
    title: "Análise",
    description: "Insights de uso em tempo real da CLI kubojs",
  },
  sponsors: {
    path: "~/sponsors",
    section: "patrocinadores",
    title: "Patrocinadores",
    description: "Empresas e desenvolvedores que financiam o desenvolvimento do kubojs",
  },
};

export async function GET(_req: Request, { params }: RouteContext<"/og/site/[page]">) {
  const { page: pageParam } = await params;
  const page = PAGES[pageParam.replace(/\.png$/, "")];
  if (!page) notFound();

  return new ImageResponse(
    <OgShell path={page.path} section={page.section}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "48px 56px",
          flex: 1,
          justifyContent: "center",
          gap: "20px",
        }}
      >
        {page.command && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontFamily: "monospace",
              fontSize: "20px",
            }}
          >
            <span style={{ color: ogColors.green, display: "flex" }}>$</span>
            <span style={{ color: ogColors.subtext, display: "flex" }}>{page.command}</span>
            <div
              style={{
                width: "11px",
                height: "24px",
                background: ogColors.accent,
                display: "flex",
              }}
            />
          </div>
        )}

        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: ogColors.text,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {page.title}
        </div>

        <div
          style={{
            fontSize: "26px",
            color: ogColors.subtext,
            lineHeight: 1.5,
            display: "flex",
            flexWrap: "wrap",
            maxWidth: "900px",
          }}
        >
          {page.description}
        </div>
      </div>
    </OgShell>,
    OG_SIZE,
  );
}

export function generateStaticParams() {
  return Object.keys(PAGES).map((page) => ({ page: `${page}.png` }));
}
