"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ProjectNameFieldProps = {
  id: string;
  value: string;
  error?: string | null;
  onChange: (value: string) => void;
};

export function ProjectNameField({ id, value, error, onChange }: ProjectNameFieldProps) {
  const errorId = `${id}-error`;
  return (
    <label className="flex flex-col">
      <span className="mb-1 font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
        Nome do projeto
      </span>
      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "builder-focus-ring min-h-12 min-w-0 w-full rounded-full border border-rule bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-background md:text-sm",
          error
            ? "border-destructive bg-destructive/10 text-destructive-foreground dark:bg-destructive/10"
            : undefined,
        )}
        placeholder="my-kubo-app"
      />
      {error && (
        <p id={errorId} className="mt-1 text-destructive text-xs">
          {error}
        </p>
      )}
    </label>
  );
}
