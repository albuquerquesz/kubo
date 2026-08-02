import Image from "next/image";

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
  if (!icon) return null;

  if (!isImageIconSrc(icon)) {
    return <span className={cn("inline-flex items-center text-lg", className)}>{icon}</span>;
  }

  // Site is dark-only; always use the default (dark) icon asset.
  return (
    <Image
      suppressHydrationWarning
      src={icon}
      alt={`${name} icon`}
      width={20}
      height={20}
      className={cn("inline-block", className)}
      unoptimized
    />
  );
}
