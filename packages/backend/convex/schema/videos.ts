import { defineTable } from "convex/server";
import { v } from "convex/values";

export const videos = defineTable({
  embedId: v.string(),
  title: v.string(),
});
