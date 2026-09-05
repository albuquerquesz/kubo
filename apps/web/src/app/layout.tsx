import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import Providers from "@/components/providers";
import UmamiScript from "@/components/umami-script";
import { LocaleProvider } from "@/i18n";
import { getDictionary, getLocale } from "@/i18n/server";
import { cn } from "@/lib/utils";

import "./global.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const ogImage = "https://kubojs.dev/assets/kubo-social.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = getDictionary(locale);

  return {
    title: meta.title,
    description: meta.description,
    keywords: [...meta.keywords],
    authors: [{ name: meta.authors }],
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
      title: meta.title,
      description: meta.description,
      url: "https://kubojs.dev",
      siteName: "kubojs",
      images: [
        {
          url: ogImage,
          width: 1670,
          height: 942,
          type: "image/jpeg",
          alt: meta.ogAlt,
        },
      ],
      locale: meta.openGraphLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
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
    category: meta.category,
    icons: {
      icon: [
        { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default async function Layout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return (
    <html
      lang={locale}
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
        <UmamiScript />
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <Providers>{children}</Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
