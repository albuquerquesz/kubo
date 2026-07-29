import { useTheme } from "next-themes";
import Image from "next/image";

import { cn } from "@/lib/utils";

function isImageIconSrc(icon: string) {
  return icon.startsWith("https://") || icon.startsWith("/");
}

const LIGHT_VARIANT_REMOTE_ICONS = [
  "drizzle",
  "prisma",
  "express",
  "clerk",
  "planetscale",
  "nx",
  "astro",
  "vercel",
] as const;

export function TechIcon({
  icon,
  name,
  className,
}: {
  icon: string;
  name: string;
  className?: string;
}) {
  const { theme } = useTheme();

  if (!icon) return null;

  if (!isImageIconSrc(icon)) {
    return <span className={cn("inline-flex items-center text-lg", className)}>{icon}</span>;
  }

  // Light-mode *-light.svg rewrites are only for remote R2 icons that ship both variants.
  // Local /integrations assets have a single file and must not be rewritten.
  let iconSrc = icon;
  if (
    theme === "light" &&
    icon.startsWith("https://") &&
    LIGHT_VARIANT_REMOTE_ICONS.some((token) => icon.includes(token))
  ) {
    iconSrc = icon.replace(".svg", "-light.svg");
  }

  return (
    <Image
      suppressHydrationWarning
      src={iconSrc}
      alt={`${name} icon`}
      width={20}
      height={20}
      className={cn("inline-block", className)}
      unoptimized
    />
  );
}
