import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

import { env } from "@/env/client";

function getRequiredPublicEnvironmentVariable(
  name: "NEXT_PUBLIC_CONVEX_SITE_URL" | "NEXT_PUBLIC_CONVEX_URL",
): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required web environment variable: ${name}`);
  }

  return value;
}

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: getRequiredPublicEnvironmentVariable("NEXT_PUBLIC_CONVEX_URL"),
  convexSiteUrl: getRequiredPublicEnvironmentVariable("NEXT_PUBLIC_CONVEX_SITE_URL"),
});
