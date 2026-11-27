export const dynamic = "force-static";

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://kubojs.dev/",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://kubojs.dev/new",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://kubojs.dev/docs",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: "https://kubojs.dev/updates/newsletter",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://kubojs.dev/blog",
      lastModified: new Date("2026-11-27"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...[
      "escolha-de-stack-explicita",
      "telemetria-honesta-em-cli",
      "agente-de-codigo-instala-o-projeto",
    ].flatMap((slug) => [
      {
        url: `https://kubojs.dev/blog/${slug}`,
        lastModified: new Date("2026-11-27"),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
      {
        url: `https://kubojs.dev/blog/${slug}/en`,
        lastModified: new Date("2026-11-27"),
        changeFrequency: "monthly" as const,
        priority: 0.4,
      },
    ]),
  ];
}
