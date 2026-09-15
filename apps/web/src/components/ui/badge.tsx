import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-primary bg-primary/10 px-3 py-1.5 font-mono text-[11px] font-semibold leading-none tracking-[0.12em] text-foreground [&_svg]:block [&_svg]:size-3.5 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
