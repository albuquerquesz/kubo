import { v } from "convex/values";

import { normalizeNewsletterEmail, planSubscription } from "../shared/newsletter";
import { internalMutation, internalQuery, mutation } from "./_generated/server";

export const subscribe = mutation({
  args: { email: v.string() },
  returns: v.union(v.literal("subscribed"), v.literal("invalid")),
  handler: async (ctx, args) => {
    const email = normalizeNewsletterEmail(args.email);
    if (!email) return "invalid";

    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    const plan = planSubscription(existing);
    if (plan === "insert") {
      await ctx.db.insert("newsletterSubscribers", {
        email,
        status: "subscribed",
        unsubscribeToken: crypto.randomUUID(),
        subscribedAt: Date.now(),
      });
    }
    if (plan === "resubscribe" && existing) {
      await ctx.db.patch(existing._id, {
        status: "subscribed",
        subscribedAt: Date.now(),
        unsubscribedAt: undefined,
      });
    }

    return "subscribed";
  },
});

const SUBSCRIBER_PAGE = v.object({
  page: v.array(v.object({ email: v.string(), unsubscribeToken: v.string() })),
  continueCursor: v.string(),
  isDone: v.boolean(),
});

/** Active subscribers only. Internal: the unsubscribe token must not leave the backend. */
export const pageSubscribed = internalQuery({
  args: { cursor: v.union(v.string(), v.null()), numItems: v.number() },
  returns: SUBSCRIBER_PAGE,
  handler: async (ctx, args) => {
    const result = await ctx.db.query("newsletterSubscribers").paginate({
      cursor: args.cursor,
      numItems: args.numItems,
    });
    return {
      page: result.page
        .filter((row) => row.status === "subscribed")
        .map((row) => ({ email: row.email, unsubscribeToken: row.unsubscribeToken })),
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});

/** Returns `false` when the token does not match any subscriber. Idempotent. */
export const unsubscribe = internalMutation({
  args: { token: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { token }) => {
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_unsubscribe_token", (q) => q.eq("unsubscribeToken", token))
      .unique();

    if (!subscriber) return false;
    if (subscriber.status === "subscribed") {
      await ctx.db.patch(subscriber._id, { status: "unsubscribed", unsubscribedAt: Date.now() });
    }
    return true;
  },
});
