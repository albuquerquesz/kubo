import { defineTable } from "convex/server";
import { v } from "convex/values";

export const analyticsDailyStats = defineTable({
  date: v.string(),
  count: v.number(),
}).index("by_date", ["date"]);
