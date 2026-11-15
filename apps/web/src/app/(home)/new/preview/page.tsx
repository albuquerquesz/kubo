import type { Metadata } from "next";
import { Suspense } from "react";

import { StackBuilder } from "../_components/stack-builder";

export const metadata: Metadata = {
  title: "Prévia do projeto - kubojs",
  description: "Veja a árvore de arquivos e o conteúdo do projeto antes de criar",
};

export default function PreviewStepPage() {
  return (
    <Suspense>
      <div className="grid h-[calc(100vh-64px)] w-full flex-1 grid-cols-1 overflow-hidden">
        <StackBuilder step="preview" />
      </div>
    </Suspense>
  );
}
