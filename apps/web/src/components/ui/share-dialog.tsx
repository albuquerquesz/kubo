"use client";

import { Link2, Share2, Terminal, XIcon } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import React, { useEffect, useRef, useState } from "react";
import { FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CopyCommandButton } from "@/components/ui/copy-command-button";
import {
  Dialog,
  DialogClose,
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

type CopyTarget = "command" | "url";
type PreviewStatus = "loading" | "loaded" | "error";

export function ShareDialog({
  children,
  trigger,
  stackUrl,
  stackState,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const normalizedStack = { ...stackState, projectName: formatProjectName(stackState.projectName) };
  const projectName = normalizedStack.projectName;
  const command = generateStackCommand(normalizedStack);
  const ogImageUrl = generateStackOgImageUrl(normalizedStack);
  const selectedTechs = getSelectedTechs(stackState);
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [qrFailed, setQrFailed] = useState(false);
  const [previewState, setPreviewState] = useState<{
    url: string;
    status: PreviewStatus;
  }>({ url: ogImageUrl, status: "loading" });
  const [canNativeShare, setCanNativeShare] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewStatus =
    previewState.url === ogImageUrl ? previewState.status : ("loading" satisfies PreviewStatus);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    return () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!stackUrl) return;
    setQrCodeDataUrl("");
    setQrFailed(false);
    QRCode.toDataURL(stackUrl, {
      width: 448,
      margin: 2,
      color: {
        dark: "#cdd6f4",
        light: "#00000000",
      },
    })
      .then(setQrCodeDataUrl)
      .catch(() => {
        setQrCodeDataUrl("");
        setQrFailed(true);
      });
  }, [stackUrl]);

  const copyValue = async (target: CopyTarget, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedTarget(target);
      toast.success(
        target === "url"
          ? "URL copiada para a área de transferência!"
          : "Comando copiado para a área de transferência!",
      );
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

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(stackUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: projectName, text: shareText(), url: stackUrl });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Falha ao abrir o compartilhamento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="grid max-h-[85vh] min-h-0 grid-cols-1 gap-0 overflow-hidden rounded-2xl bg-fd-background p-0 md:min-h-[30rem] md:max-w-5xl md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]"
      >
        <div className="flex min-h-0 min-w-0 flex-col overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4 pr-8">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <DialogTitle className="font-mono font-semibold text-foreground text-sm">
                Compartilhar Stack
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid gap-3">
            <CopyCommandButton
              value={command}
              copied={copiedTarget === "command"}
              onCopy={() => copyValue("command", command)}
            />
            <CopyCommandButton
              value={stackUrl}
              label="URL"
              icon={<Link2 className="h-3.5 w-3.5" />}
              copied={copiedTarget === "url"}
              onCopy={() => copyValue("url", stackUrl)}
            />
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center py-4">
            {qrCodeDataUrl ? (
              <Image
                src={qrCodeDataUrl}
                width={224}
                height={224}
                alt="QR code com link para esta stack"
                className="h-56 w-56 rounded"
              />
            ) : qrFailed ? (
              <div className="flex h-56 w-56 items-center justify-center font-mono text-destructive text-xs">
                falha ao gerar qr
              </div>
            ) : (
              <div className="flex h-56 w-56 items-center justify-center font-mono text-muted-foreground text-xs">
                <span className="animate-pulse">gerando...</span>
              </div>
            )}
          </div>

          <div className="mt-auto grid gap-2 pt-6">
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
                onClick={shareToLinkedIn}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <FaLinkedin className="h-4 w-4" />
                Postar
              </Button>
            </div>
          </div>
        </div>

        <div className="relative flex min-w-0 items-center overflow-y-auto border-border border-t bg-muted/5 p-3 sm:p-4 md:border-t-0 md:border-l">
          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-foreground"
              />
            }
          >
            <XIcon className="size-4" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
          <div className="w-full min-w-0">
            <div className="rounded border border-border">
              <div className="relative aspect-[1200/630] w-full overflow-hidden bg-muted/10">
                {previewStatus === "loading" && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-muted-foreground text-xs">
                    <span className="text-primary">$</span>
                    <span className="animate-pulse">renderizando prévia...</span>
                  </div>
                )}
                {previewStatus === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-destructive text-xs">
                    falha ao renderizar prévia
                  </div>
                )}
                <Image
                  src={ogImageUrl}
                  alt={`Cartão de prévia social de ${projectName}`}
                  width={1200}
                  height={630}
                  unoptimized
                  onLoad={() => setPreviewState({ url: ogImageUrl, status: "loaded" })}
                  onError={() => setPreviewState({ url: ogImageUrl, status: "error" })}
                  className={cn(
                    "h-full w-full object-cover transition-opacity duration-300",
                    previewStatus === "loaded" ? "opacity-100" : "opacity-0",
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
