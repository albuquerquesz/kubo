"use client";

import { Share2 } from "lucide-react";

import { ShareDialog } from "@/components/ui/share-dialog";
import type { StackState } from "@/lib/constant";

interface ShareButtonProps {
  stackUrl: string;
  stackState: StackState;
}

export function ShareButton({ stackUrl, stackState }: ShareButtonProps) {
  return (
    <ShareDialog stackUrl={stackUrl} stackState={stackState}>
      <button
        type="button"
        className="builder-focus-ring inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary/15 px-3 font-mono font-medium text-primary text-xs transition-colors hover:bg-primary/22"
        title="Compartilhar sua stack"
      >
        <Share2 className="h-3 w-3" />
        Compartilhar
      </button>
    </ShareDialog>
  );
}
