import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import Providers from "@/components/providers";

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

const ogImage = "https://better-t-stack.dev/og/site/home.png";

export const metadata: Metadata = {
  title: "Better-T-Stack",
  description:
    "A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations",
  keywords: [
    "TypeScript",
    "project scaffolding",
    "boilerplate",
    "type safety",
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
    "Better-T-Stack",
    "create-better-t-stack",
  ],
  authors: [{ name: "Better-T-Stack Team" }],
  creator: "Better-T-Stack",
  publisher: "Better-T-Stack",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL("https://better-t-stack.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Better-T-Stack",
    description:
      "A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations",
    url: "https://better-t-stack.dev",
    siteName: "Better-T-Stack",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Better-T-Stack",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Better-T-Stack",
    description:
      "A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations",
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
  category: "Technology",
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
      lang="en"
      className={cn(archivo.variable, ibmPlexMono.variable, "dark font-sans")}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <Script
          src="https://umami.amanv.cloud/script.js"
          data-website-id="3fe218f9-a51b-40c3-ab37-d65e6963d686"
          strategy="afterInteractive"
        />
        <RootProvider
          search={{
            options: {
              type: "static",
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
