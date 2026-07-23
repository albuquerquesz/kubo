import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";

import Providers from "@/components/providers";
import UmamiScript from "@/components/umami-script";

import "./global.css";
import { cn } from "@/lib/utils";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

const ogImage = "https://kubojs.dev/og/site/home.png";

export const metadata: Metadata = {
  title: "kubojs — crie projetos TypeScript type-safe",
  description:
    "CLI moderna para criar projetos TypeScript end-to-end com type safety, boas práticas e configurações personalizáveis",
  keywords: [
    "TypeScript",
    "scaffolding de projetos",
    "boilerplate",
    "type safety",
    "criar projetos",
    "Drizzle",
    "Prisma",
    "hono",
    "elysia",
    "turborepo",
    "trpc",
    "orpc",
    "turso",
    "neon",
    "Better-Auth",
    "convex",
    "monorepo",
    "CLI",
    "kubojs",
  ],
  authors: [{ name: "Equipe kubojs" }],
  creator: "kubojs",
  publisher: "kubojs",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL("https://kubojs.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "kubojs — crie projetos TypeScript type-safe",
    description:
      "CLI moderna para criar projetos TypeScript end-to-end com type safety, boas práticas e configurações personalizáveis",
    url: "https://kubojs.dev",
    siteName: "kubojs",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "kubojs — CLI para projetos TypeScript type-safe",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "kubojs — crie projetos TypeScript type-safe",
    description:
      "CLI moderna para criar projetos TypeScript end-to-end com type safety, boas práticas e configurações personalizáveis",
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  category: "Tecnologia",
  icons: {
    icon: [{ url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" }],
    shortcut: "/favicon/favicon-96x96.png",
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={cn(archivo.variable, ibmPlexMono.variable, "dark font-sans")}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <UmamiScript />
        <RootProvider
          search={{
            options: {
              type: "static",
            },
          }}
          i18n={{
            locale: "pt-BR",
            translations: {
              search: "Buscar",
              searchNoResult: "Nenhum resultado encontrado",
              toc: "Nesta página",
              tocNoHeadings: "Sem cabeçalhos",
              lastUpdate: "Última atualização em",
              chooseLanguage: "Escolher idioma",
              nextPage: "Próxima página",
              previousPage: "Página anterior",
              chooseTheme: "Tema",
              editOnGithub: "Editar no GitHub",
            },
          }}
          theme={{
            enableSystem: false,
            defaultTheme: "dark",
            forcedTheme: "dark",
          }}
        >
          <Providers>{children}</Providers>
        </RootProvider>
      </body>
    </html>
  );
}
