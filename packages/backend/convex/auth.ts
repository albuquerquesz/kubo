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

const extraAuthHosts = (env.AUTH_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

/**
 * With extra hosts, the base URL follows the request host (forwarded by the Next.js auth proxy),
 * so OAuth callbacks and magic links point back to the site the user is on. Unknown hosts fall
 * back to SITE_URL. Without extra hosts this is the plain SITE_URL, as before.
 */
const authBaseURL =
  extraAuthHosts.length > 0
    ? {
        allowedHosts: [new URL(env.SITE_URL).host, ...extraAuthHosts],
        fallback: env.SITE_URL,
        protocol: "auto" as const,
      }
    : env.SITE_URL;

const authTrustedOrigins = [env.SITE_URL, ...extraAuthHosts.map((host) => `https://${host}`)];

export function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    baseURL: authBaseURL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: authTrustedOrigins,
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
