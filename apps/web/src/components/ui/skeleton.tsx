import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: Omit<React.ComponentPropsWithoutRef<"div">, "key">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted rounded-none animate-pulse", className)}
      {...props}
    />
  );
}

export { Skeleton };
