import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kubo",
    short_name: "Kubo",
    description:
      "CLI moderna para criar projetos TypeScript end-to-end com type safety, boas práticas e configurações personalizáveis",
    start_url: "/new",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon/web-app-manifest-192x192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/web-app-manifest-512x512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/web-app-manifest-192x192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon/web-app-manifest-512x512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
