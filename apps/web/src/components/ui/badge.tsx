import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-primary bg-primary/10 px-4 py-2 font-mono text-sm font-semibold leading-[1.4] tracking-[0.12em] text-primary",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
