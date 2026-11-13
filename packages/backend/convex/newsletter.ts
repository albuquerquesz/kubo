import { v } from "convex/values";

import { normalizeNewsletterEmail, planSubscription } from "../shared/newsletter";
import { internalMutation, mutation } from "./_generated/server";

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
