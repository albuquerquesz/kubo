import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

type AuthEnvironmentVariable =
  | "BETTER_AUTH_SECRET"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "SITE_URL";

function getRequiredEnvironmentVariable(name: AuthEnvironmentVariable): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required Convex environment variable: ${name}`);
  }

  return value;
}

export const authComponent = createClient<DataModel>(components.betterAuth);

export function createAuth(ctx: GenericCtx<DataModel>) {
  const siteUrl = getRequiredEnvironmentVariable("SITE_URL");

  return betterAuth({
    baseURL: siteUrl,
    secret: getRequiredEnvironmentVariable("BETTER_AUTH_SECRET"),
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: getRequiredEnvironmentVariable("GOOGLE_CLIENT_ID"),
        clientSecret: getRequiredEnvironmentVariable("GOOGLE_CLIENT_SECRET"),
      },
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  });
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return {
      id: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? null,
      email: identity.email ?? null,
      image: identity.pictureUrl ?? null,
    };
  },
});
