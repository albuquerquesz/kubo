import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { env } from "@kubojs/env/convex";
import { betterAuth } from "better-auth/minimal";
import { magicLink } from "better-auth/plugins";

import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

export const authComponent = createClient<DataModel>(components.betterAuth);

export function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    baseURL: env.SITE_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.SITE_URL],
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [
      magicLink({
        expiresIn: 60 * 5,
        sendMagicLink: async ({ email, url }) => {
          await requireActionCtx(ctx).scheduler.runAfter(0, internal.emails.sendMagicLink, {
            email,
            url,
          });
        },
      }),
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
