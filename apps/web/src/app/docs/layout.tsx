import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";

import { getBaseOptions } from "@/app/layout.config";
import { SiteHeader } from "@/components/site/site-header";
import { SpecialSponsorBanner } from "@/components/special-sponsor-banner";
import { getDictionary, getLocale } from "@/i18n/server";
import { source } from "@/lib/source";

export default async function Layout({ children }: { children: ReactNode }) {
  const dictionary = getDictionary(await getLocale());
  const docsOptions = {
    ...getBaseOptions(dictionary),
    tree: source.pageTree,
    sidebar: {
      banner: <SpecialSponsorBanner />,
    },
  };

  return (
    <>
      <SiteHeader />
      <div className="pt-12">
        <DocsLayout
          {...docsOptions}
          nav={{ enabled: false, mode: "top", title: null }}
          sidebar={{ ...docsOptions.sidebar, className: "border-rule! border-e bg-background!" }}
        >
          {children}
        </DocsLayout>
      </div>
    </>
  );
}
