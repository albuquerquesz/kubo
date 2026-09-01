"use client";

import { QrCode, Share2, Terminal } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import React, { useEffect, useRef, useState } from "react";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CopyCommandButton } from "@/components/ui/copy-command-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { StackState } from "@/lib/constant";
import {
  formatProjectName,
  generateStackCommand,
  generateStackOgImageUrl,
  getSelectedTechs,
} from "@/lib/stack-utils";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  /** Visible trigger content (icon + label). */
  children: React.ReactNode;
  /** Element merged by DialogTrigger (prefer shared `Button`). */
  trigger: React.ReactElement;
  stackUrl: string;
  stackState: StackState;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type CopyTarget = "command";

export function ShareDialog({
  children,
  trigger,
  stackUrl,
  stackState,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [qrFailed, setQrFailed] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalizedStack = { ...stackState, projectName: formatProjectName(stackState.projectName) };
  const projectName = normalizedStack.projectName;
  const command = generateStackCommand(normalizedStack);
  const ogImageUrl = generateStackOgImageUrl(normalizedStack);
  const selectedTechs = getSelectedTechs(stackState);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    return () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    };
  }, []);

  const copyValue = async (target: CopyTarget, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedTarget(target);
      toast.success("Comando copiado para a área de transferência!");
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
      copyResetTimer.current = setTimeout(() => setCopiedTarget(null), 2000);
    } catch {
      toast.error("Falha ao copiar");
    }
  };

  const shareText = () => {
    const techNames = selectedTechs.map((tech) => tech.name);
    const summary = techNames.slice(0, 6).join(" · ");
    const rest = techNames.length > 6 ? ` +${techNames.length - 6} mais` : "";
    return `${projectName} — minha stack kubojs\n\n${summary}${rest}\n\n`;
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(shareText());
    const url = encodeURIComponent(stackUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: projectName, text: shareText(), url: stackUrl });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Falha ao abrir o compartilhamento");
    }
  };

  useEffect(() => {
    if (!showQr || !stackUrl) return;
    setQrFailed(false);
    // Site is dark-only; match QR contrast to the forced dark UI.
    QRCode.toDataURL(stackUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#cdd6f4",
        light: "#11111b",
      },
    })
      .then(setQrCodeDataUrl)
      .catch(() => {
        setQrCodeDataUrl("");
        setQrFailed(true);
      });
  }, [showQr, stackUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="grid max-h-[85vh] min-h-0 grid-cols-1 gap-0 overflow-hidden bg-fd-background p-0 md:min-h-[28rem] md:max-w-4xl md:grid-cols-2"
      >
        <div className="flex min-w-0 min-h-0 flex-col overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4 pr-8">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <DialogTitle className="font-mono font-semibold text-foreground text-sm">
                Compartilhar Stack
              </DialogTitle>
            </div>
          </DialogHeader>

          <CopyCommandButton
            value={command}
            copied={copiedTarget === "command"}
            onCopy={() => copyValue("command", command)}
          />

          <div className="flex min-h-0 flex-1 items-center justify-center py-4">
            {showQr ? (
              qrCodeDataUrl ? (
                <Image
                  src={qrCodeDataUrl}
                  width={160}
                  height={160}
                  alt="QR code com link para esta stack"
                  className="h-40 w-40 rounded"
                />
              ) : qrFailed ? (
                <div className="flex h-40 w-40 items-center justify-center font-mono text-destructive text-xs">
                  falha ao gerar qr
                </div>
              ) : (
                <div className="flex h-40 w-40 items-center justify-center font-mono text-muted-foreground text-xs">
                  <span className="animate-pulse">gerando...</span>
                </div>
              )
            ) : null}
          </div>

          <div className="grid gap-2 pt-2">
            <div className={cn("grid gap-2", canNativeShare ? "grid-cols-3" : "grid-cols-2")}>
              <Button
                type="button"
                onClick={shareToTwitter}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <FaXTwitter className="h-4 w-4" />
                Postar
              </Button>
              {canNativeShare && (
                <Button
                  type="button"
                  onClick={nativeShare}
                  variant="cta"
                  size="lg"
                  className="w-full"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              )}
              <Button
                type="button"
                onClick={() => setShowQr((prev) => !prev)}
                variant="secondary"
                size="lg"
                className={cn(
                  "w-full",
                  showQr &&
                    "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:ring-primary/20",
                )}
              >
                <QrCode className="h-4 w-4" />
                QR
              </Button>
            </div>
          </div>
        </div>

        <div className="min-w-0 overflow-y-auto border-border border-t bg-muted/5 p-4 sm:p-6 md:border-t-0 md:border-l">
          <div className="flex h-full min-h-0 flex-col justify-center gap-3">
            <div className="rounded border border-border">
              <div className="relative aspect-[1200/630] w-full overflow-hidden bg-muted/10">
                {!previewLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-muted-foreground text-xs">
                    <span className="text-primary">$</span>
                    <span className="animate-pulse">renderizando prévia...</span>
                  </div>
                )}
                <Image
                  src={ogImageUrl}
                  alt={`Cartão de prévia social de ${projectName}`}
                  width={1200}
                  height={630}
                  unoptimized
                  onLoad={() => setPreviewLoaded(true)}
                  className={cn(
                    "h-full w-full object-cover transition-opacity duration-300",
                    previewLoaded ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
