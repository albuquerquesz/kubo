import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import Providers from "@/components/providers";

import "./global.css";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

// Self-hosted (Fontsource, latin subset) so the build never fetches from Google Fonts.
const archivo = localFont({
  src: "./fonts/archivo-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-archivo",
});

const ibmPlexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/ibm-plex-mono-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-ibm-plex-mono",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
});

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
});

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin-wght-normal.woff2",
  weight: "300 700",
  variable: "--font-space-grotesk",
});

const ogImage = `${SITE_URL}/assets/kubo-social.jpg`;

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
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "kubojs — crie projetos TypeScript type-safe",
    description:
      "CLI moderna para criar projetos TypeScript end-to-end com type safety, boas práticas e configurações personalizáveis",
    url: SITE_URL,
    siteName: "kubojs",
    images: [
      {
        url: ogImage,
        width: 1670,
        height: 942,
        type: "image/jpeg",
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
    icon: [
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
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
      className={cn(
        archivo.variable,
        ibmPlexMono.variable,
        jetbrainsMono.variable,
        inter.variable,
        spaceGrotesk.variable,
        "dark font-sans",
      )}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
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
              editOnGithub: "Editar no GitHub",
            },
          }}
          // Site is forced dark via <html className="dark">. Disabling next-themes
          // avoids its client-side <script> injection, which React 19 warns about
          // ("Encountered a script tag while rendering React component").
          theme={{
            enabled: false,
          }}
        >
          <Providers>{children}</Providers>
        </RootProvider>
      </body>
    </html>
  );
}
