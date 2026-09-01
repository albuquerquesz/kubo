"use client";

import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/ui/share-dialog";
import type { StackState } from "@/lib/constant";

interface ShareButtonProps {
  stackUrl: string;
  stackState: StackState;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShareButton({ stackUrl, stackState, open, onOpenChange }: ShareButtonProps) {
  return (
    <ShareDialog
      stackUrl={stackUrl}
      stackState={stackState}
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <Button
          type="button"
          variant="secondary"
          size="default"
          className="w-full font-mono"
          title="Compartilhar sua stack"
        />
      }
    >
      <Share2 data-icon="inline-start" className="h-3 w-3" />
      Compartilhar
    </ShareDialog>
  );
}
