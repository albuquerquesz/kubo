import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewsletterForm({
  id,
  className,
  label = "Seu email",
  placeholder = "voce@exemplo.com",
  submitLabel = "Entrar",
}: {
  id: string;
  className?: string;
  label?: string;
  placeholder?: string;
  submitLabel?: string;
}) {
  return (
    <form
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}
      action="/api/newsletter"
      method="post"
    >
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={placeholder}
        className="min-h-12 min-w-0 flex-1 rounded-full border border-rule bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 sm:max-w-[280px]"
      />
      <Button type="submit" variant="cta" size="lg" className="shrink-0">
        {submitLabel}
        <ArrowUpRight className="size-4" />
      </Button>
    </form>
  );
}
