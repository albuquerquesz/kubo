import { defineTable } from "convex/server";
import { v } from "convex/values";

export const showcase = defineTable({
  title: v.string(),
  description: v.string(),
  imageUrl: v.string(),
  liveUrl: v.string(),
  tags: v.array(v.string()),
});
