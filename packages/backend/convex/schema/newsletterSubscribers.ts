import { defineTable } from "convex/server";
import { v } from "convex/values";

export const newsletterSubscribers = defineTable({
  /** Lowercased, trimmed address (see `normalizeNewsletterEmail`). */
  email: v.string(),
  status: v.union(v.literal("subscribed"), v.literal("unsubscribed")),
  /** Opaque token embedded in unsubscribe links; never exposed to queries. */
  unsubscribeToken: v.string(),
  subscribedAt: v.number(),
  unsubscribedAt: v.optional(v.number()),
})
  .index("by_email", ["email"])
  .index("by_unsubscribe_token", ["unsubscribeToken"]);
