import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site/site-header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="pt-12">{children}</div>
    </>
  );
}
