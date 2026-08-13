import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: Omit<React.ComponentProps<"svg">, "key">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Carregando"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
