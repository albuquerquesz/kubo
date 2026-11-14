"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { builderStepHref, type BuilderStep } from "@/lib/builder-steps";

type BuilderStepLinkProps = {
  step: BuilderStep;
  className?: string;
  children: ReactNode;
  "aria-current"?: "step";
};

/** Link to a builder step that carries the current stack query along. */
export function BuilderStepLink({ step, ...props }: BuilderStepLinkProps) {
  const searchParams = useSearchParams();
  return <Link href={builderStepHref(step, searchParams.toString())} {...props} />;
}
