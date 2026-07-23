import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";

import { baseOptions } from "@/app/layout.config";
import { SiteHeader } from "@/components/site/site-header";
import { SpecialSponsorBanner } from "@/components/special-sponsor-banner";
import { source } from "@/lib/source";

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  // links: [],
  sidebar: {
    banner: <SpecialSponsorBanner />,
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader className="border-rule border-b" />
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
