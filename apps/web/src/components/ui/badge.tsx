import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full border border-primary/40 bg-zinc-400/10 px-4 py-2 font-mono text-[0.6875rem] font-semibold leading-[1.4] tracking-[0.12em] text-primary",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
