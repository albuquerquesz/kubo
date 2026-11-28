"use node";

import { mail, sendMagicLinkEmail } from "@kubojs/email";
import { v } from "convex/values";

import { releaseNoticeToEmail } from "../shared/newsletter";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const sendMagicLink = internalAction({
  args: { email: v.string(), url: v.string() },
  handler: async (_ctx, { email, url }) => {
    await sendMagicLinkEmail({ to: email, url });
  },
});

async function releaseIdempotencyKey(version: string, email: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"));
  return `release-${version}-${hex.join("")}`;
}

/** Emails one release note to every active subscriber. One failure does not stop the rest. */
export const sendRelease = internalAction({
  args: { version: v.string(), notes: v.string() },
  returns: v.object({ sent: v.number(), failed: v.number() }),
  handler: async (ctx, { version, notes }) => {
    const site = process.env.CONVEX_SITE_URL;
    if (!site) {
      throw new Error("CONVEX_SITE_URL is not set");
    }

    const releasedOn = new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    }).format(new Date());
    const release = releaseNoticeToEmail({ version, notes, releasedOn });

    let cursor: string | null = null;
    let sent = 0;
    let failed = 0;
    for (let page = 0; page < 40; page += 1) {
      const batch: {
        page: { email: string; unsubscribeToken: string }[];
        continueCursor: string;
        isDone: boolean;
      } = await ctx.runQuery(internal.newsletter.pageSubscribed, {
        cursor,
        numItems: 25,
      });
      for (const subscriber of batch.page) {
        try {
          await mail({
            release,
            to: subscriber.email,
            idempotencyKey: await releaseIdempotencyKey(version, subscriber.email),
            unsubscribeUrl: `${site}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`,
          });
          sent += 1;
        } catch (error) {
          failed += 1;
          console.error("Newsletter release send failed", error);
        }
      }
      if (batch.isDone) break;
      cursor = batch.continueCursor;
    }

    return { sent, failed };
  },
});
