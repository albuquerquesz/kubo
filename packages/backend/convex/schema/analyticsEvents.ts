import { defineTable } from "convex/server";
import { v } from "convex/values";

export const analyticsEvents = defineTable({
  database: v.optional(v.string()),
  orm: v.optional(v.string()),
  backend: v.optional(v.string()),
  runtime: v.optional(v.string()),
  frontend: v.optional(v.array(v.string())),
  addons: v.optional(v.array(v.string())),
  examples: v.optional(v.array(v.string())),
  auth: v.optional(v.string()),
  payments: v.optional(v.string()),
  git: v.optional(v.boolean()),
  packageManager: v.optional(v.string()),
  install: v.optional(v.boolean()),
  dbSetup: v.optional(v.string()),
  api: v.optional(v.string()),
  webDeploy: v.optional(v.string()),
  serverDeploy: v.optional(v.string()),
  cli_version: v.optional(v.string()),
  node_version: v.optional(v.string()),
  platform: v.optional(v.string()),
});
