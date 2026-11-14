import type { Metadata } from "next";
import { Suspense } from "react";

import { StackBuilder } from "../_components/stack-builder";

export const metadata: Metadata = {
  title: "Layout do projeto - kubojs",
  description: "Escolha a estrutura de pastas do projeto e veja a árvore gerada",
};

export default function LayoutStepPage() {
  return (
    <Suspense>
      <div className="grid h-[calc(100vh-64px)] w-full flex-1 grid-cols-1 overflow-hidden">
        <StackBuilder step="layout" />
      </div>
    </Suspense>
  );
}
