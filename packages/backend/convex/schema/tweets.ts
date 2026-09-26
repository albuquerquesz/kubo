import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tweets = defineTable({
  tweetId: v.string(),
  order: v.optional(v.number()),
});
