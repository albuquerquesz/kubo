import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

function isImageIconSrc(icon: string) {
  return icon.startsWith("https://") || icon.startsWith("/");
}

export function TechIcon({
  icon,
  name,
  className,
}: {
  icon: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!icon) return null;

  if (!isImageIconSrc(icon)) {
    return <span className={cn("inline-flex items-center text-lg", className)}>{icon}</span>;
  }

  // Site is dark-only; always use the default (dark) icon asset.
  if (failed) {
    return (
      <span
        aria-label={`${name} icon`}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-sm bg-muted/35 font-mono text-[9px] text-muted-foreground uppercase",
          className,
        )}
      >
        {name.slice(0, 2)}
      </span>
    );
  }

  return (
    <Image
      suppressHydrationWarning
      src={icon}
      alt={`${name} icon`}
      width={20}
      height={20}
      className={cn("inline-block", className)}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}
