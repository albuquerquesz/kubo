import { defineTable } from "convex/server";
import { v } from "convex/values";

const distributionValidator = v.record(v.string(), v.number());

export const analyticsStats = defineTable({
  totalProjects: v.number(),
  lastEventTime: v.number(),
  backend: distributionValidator,
  frontend: distributionValidator,
  database: distributionValidator,
  orm: distributionValidator,
  api: distributionValidator,
  auth: distributionValidator,
  runtime: distributionValidator,
  packageManager: distributionValidator,
  platform: distributionValidator,
  addons: distributionValidator,
  examples: distributionValidator,
  dbSetup: distributionValidator,
  webDeploy: distributionValidator,
  serverDeploy: distributionValidator,
  payments: distributionValidator,
  git: distributionValidator,
  install: distributionValidator,
  nodeVersion: distributionValidator,
  cliVersion: distributionValidator,
  hourlyDistribution: v.optional(distributionValidator),
  stackCombinations: v.optional(distributionValidator),
  dbOrmCombinations: v.optional(distributionValidator),
});
