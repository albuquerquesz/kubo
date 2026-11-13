import { v } from "convex/values";

import { buildDailyWindow } from "../shared/analytics-date-utils";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";

const MAX_DAILY_STATS_WINDOW = 366;

type Distribution = Record<string, number>;
type StatsDoc = Doc<"analyticsStats">;
type StatsFields = Omit<StatsDoc, "_id" | "_creationTime">;

// Convex record keys must be non-empty ASCII and must not start with "$" or "_".
function isValidRecordKey(key: string): boolean {
  return /^[\x20-\x7e]+$/.test(key) && !key.startsWith("$") && !key.startsWith("_");
}

function incrementKey(dist: Distribution | undefined, key: string | undefined): Distribution {
  const base = dist ?? {};
  if (!key || !isValidRecordKey(key)) return base;
  return { ...base, [key]: (base[key] ?? 0) + 1 };
}

function incrementKeys(dist: Distribution | undefined, keys: string[] | undefined): Distribution {
  let result = dist ?? {};
  for (const key of keys ?? []) {
    result = incrementKey(result, key);
  }
  return result;
}

function incrementBool(dist: Distribution | undefined, val: boolean | undefined): Distribution {
  if (val === undefined) return dist ?? {};
  return incrementKey(dist, val ? "Yes" : "No");
}

function getMajorVersion(version: string | undefined): string | undefined {
  if (!version) return undefined;
  const clean = version.startsWith("v") ? version.slice(1) : version;
  return `v${clean.split(".")[0]}`;
}

const analyticsEventArgs = {
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
  install_id: v.optional(v.string()),
  source: v.optional(v.string()),
  mode: v.optional(v.string()),
  agent: v.optional(v.string()),
  ci: v.optional(v.boolean()),
  outcome: v.optional(v.union(v.literal("success"), v.literal("failure"), v.literal("cancelled"))),
  error_category: v.optional(v.string()),
  duration_ms: v.optional(v.number()),
};

type AnalyticsEventArgs = {
  [K in keyof typeof analyticsEventArgs]?: (typeof analyticsEventArgs)[K]["type"];
};

const EMPTY_STATS: StatsFields = {
  totalProjects: 0,
  lastEventTime: 0,
  backend: {},
  frontend: {},
  database: {},
  orm: {},
  api: {},
  auth: {},
  runtime: {},
  packageManager: {},
  platform: {},
  addons: {},
  examples: {},
  dbSetup: {},
  webDeploy: {},
  serverDeploy: {},
  payments: {},
  git: {},
  install: {},
  nodeVersion: {},
  cliVersion: {},
};

/** Audience and outcome metrics, counted for every event (success, failure, cancel). */
function applyAudienceStats(
  stats: StatsFields,
  args: AnalyticsEventArgs,
  now: number,
  isNewInstall: boolean,
): StatsFields {
  return {
    ...stats,
    lastEventTime: now,
    uniqueInstalls: (stats.uniqueInstalls ?? 0) + (isNewInstall ? 1 : 0),
    source: incrementKey(stats.source, args.source ?? "cli"),
    mode: incrementKey(stats.mode, args.mode),
    agent: incrementKey(stats.agent, args.agent ?? "none"),
    ci: incrementBool(stats.ci, args.ci),
    outcome: incrementKey(stats.outcome, args.outcome ?? "success"),
    errorCategory: incrementKey(stats.errorCategory, args.error_category),
    platform: incrementKey(stats.platform, args.platform),
    nodeVersion: incrementKey(stats.nodeVersion, getMajorVersion(args.node_version)),
    cliVersion: incrementKey(stats.cliVersion, args.cli_version),
  };
}

/** Stack choices, counted only for projects that were actually created. */
function applyStackStats(stats: StatsFields, args: AnalyticsEventArgs, now: number): StatsFields {
  const hourKey = String(new Date(now).getUTCHours()).padStart(2, "0");
  const stackKey = `${args.backend || "none"} + ${args.frontend?.[0] || "none"}`;
  const dbOrmKey = `${args.database || "none"} + ${args.orm || "none"}`;

  return {
    ...stats,
    totalProjects: stats.totalProjects + 1,
    backend: incrementKey(stats.backend, args.backend),
    frontend: incrementKeys(stats.frontend, args.frontend),
    database: incrementKey(stats.database, args.database),
    orm: incrementKey(stats.orm, args.orm),
    api: incrementKey(stats.api, args.api),
    auth: incrementKey(stats.auth, args.auth),
    runtime: incrementKey(stats.runtime, args.runtime),
    packageManager: incrementKey(stats.packageManager, args.packageManager),
    addons: incrementKeys(stats.addons, args.addons),
    examples: incrementKeys(stats.examples, args.examples),
    dbSetup: incrementKey(stats.dbSetup, args.dbSetup),
    webDeploy: incrementKey(stats.webDeploy, args.webDeploy),
    serverDeploy: incrementKey(stats.serverDeploy, args.serverDeploy),
    payments: incrementKey(stats.payments, args.payments),
    git: incrementBool(stats.git, args.git),
    install: incrementBool(stats.install, args.install),
    hourlyDistribution: incrementKey(stats.hourlyDistribution, hourKey),
    stackCombinations: incrementKey(stats.stackCombinations, stackKey),
    dbOrmCombinations: incrementKey(stats.dbOrmCombinations, dbOrmKey),
  };
}

export const ingestEvent = internalMutation({
  args: analyticsEventArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    const isNewInstall =
      args.install_id !== undefined &&
      (await ctx.db
        .query("analyticsEvents")
        .withIndex("by_install_id", (q) => q.eq("install_id", args.install_id))
        .first()) === null;

    const id = await ctx.db.insert("analyticsEvents", args);
    const event = await ctx.db.get("analyticsEvents", id);
    const now = event?._creationTime ?? Date.now();
    // Events from CLI versions without `outcome` were only sent on success.
    const created = (args.outcome ?? "success") === "success";

    const existingStats = await ctx.db.query("analyticsStats").first();
    const { _id, _creationTime, ...current } = existingStats ?? {
      _id: undefined,
      _creationTime: undefined,
      ...EMPTY_STATS,
    };

    let next = applyAudienceStats(current, args, now, isNewInstall);
    if (created) next = applyStackStats(next, args, now);

    if (_id) {
      await ctx.db.replace("analyticsStats", _id, next);
    } else {
      await ctx.db.insert("analyticsStats", next);
    }

    if (!created) return null;

    const today = new Date(now).toISOString().slice(0, 10);
    const dailyStats = await ctx.db
      .query("analyticsDailyStats")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (dailyStats) {
      await ctx.db.patch("analyticsDailyStats", dailyStats._id, { count: dailyStats.count + 1 });
    } else {
      await ctx.db.insert("analyticsDailyStats", { date: today, count: 1 });
    }

    return null;
  },
});

const distributionValidator = v.record(v.string(), v.number());

export const getStats = query({
  args: {},
  returns: v.union(
    v.object({
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
      hourlyDistribution: distributionValidator,
      stackCombinations: distributionValidator,
      dbOrmCombinations: distributionValidator,
      uniqueInstalls: v.number(),
      source: distributionValidator,
      mode: distributionValidator,
      agent: distributionValidator,
      ci: distributionValidator,
      outcome: distributionValidator,
      errorCategory: distributionValidator,
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const stats = await ctx.db.query("analyticsStats").first();
    if (!stats) return null;
    return {
      totalProjects: stats.totalProjects,
      lastEventTime: stats.lastEventTime,
      backend: stats.backend,
      frontend: stats.frontend,
      database: stats.database,
      orm: stats.orm,
      api: stats.api,
      auth: stats.auth,
      runtime: stats.runtime,
      packageManager: stats.packageManager,
      platform: stats.platform,
      addons: stats.addons,
      examples: stats.examples,
      dbSetup: stats.dbSetup,
      webDeploy: stats.webDeploy,
      serverDeploy: stats.serverDeploy,
      payments: stats.payments,
      git: stats.git,
      install: stats.install,
      nodeVersion: stats.nodeVersion,
      cliVersion: stats.cliVersion,
      hourlyDistribution: stats.hourlyDistribution || {},
      stackCombinations: stats.stackCombinations || {},
      dbOrmCombinations: stats.dbOrmCombinations || {},
      uniqueInstalls: stats.uniqueInstalls ?? 0,
      source: stats.source ?? {},
      mode: stats.mode ?? {},
      agent: stats.agent ?? {},
      ci: stats.ci ?? {},
      outcome: stats.outcome ?? {},
      errorCategory: stats.errorCategory ?? {},
    };
  },
});

export const getDailyStats = query({
  args: {
    days: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      date: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const now = Date.now();
    const today = new Date(now).toISOString().slice(0, 10);

    const allDaily = await ctx.db
      .query("analyticsDailyStats")
      .withIndex("by_date")
      .order("asc")
      .collect();

    const requestedDays = args.days;
    const sanitizedDays =
      typeof requestedDays === "number" && Number.isFinite(requestedDays) && requestedDays > 0
        ? Math.min(Math.floor(requestedDays), MAX_DAILY_STATS_WINDOW)
        : 30;
    const cutoffDate = new Date(now - (sanitizedDays - 1) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    return buildDailyWindow(
      allDaily
        .filter((d) => d.date >= cutoffDate && d.date <= today)
        .map((d) => ({ date: d.date, count: d.count })),
      cutoffDate,
      today,
    );
  },
});

export const getMonthlyStats = query({
  args: {},
  returns: v.object({
    monthly: v.array(
      v.object({
        month: v.string(),
        totalProjects: v.number(),
      }),
    ),
    firstDate: v.union(v.string(), v.null()),
    lastDate: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10);
    const allDaily = await ctx.db
      .query("analyticsDailyStats")
      .withIndex("by_date")
      .order("asc")
      .collect();

    const usableDaily = allDaily.filter((d) => d.date <= today);
    if (usableDaily.length === 0) {
      return { monthly: [], firstDate: null, lastDate: null };
    }

    const byMonth = new Map<string, number>();
    for (const d of usableDaily) {
      const month = d.date.slice(0, 7);
      byMonth.set(month, (byMonth.get(month) || 0) + d.count);
    }

    const monthly = Array.from(byMonth.entries())
      .map(([month, totalProjects]) => ({ month, totalProjects }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      monthly,
      firstDate: usableDaily[0]?.date ?? null,
      lastDate: usableDaily[usableDaily.length - 1]?.date ?? null,
    };
  },
});

export const getRecentEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("analyticsEvents"),
      _creationTime: v.number(),
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
    }),
  ),
  handler: async (ctx, args) => {
    const limit =
      typeof args.limit === "number" && Number.isFinite(args.limit) && args.limit > 0
        ? Math.min(Math.floor(args.limit), 50)
        : 20;

    return await ctx.db.query("analyticsEvents").order("desc").take(limit);
  },
});

export const backfillStats = internalMutation({
  args: {},
  returns: v.object({
    totalProcessed: v.number(),
    dailyDates: v.number(),
  }),
  handler: async (ctx) => {
    const existing = await ctx.db.query("analyticsStats").first();
    if (existing) {
      await ctx.db.delete("analyticsStats", existing._id);
    }

    const existingDaily = await ctx.db.query("analyticsDailyStats").collect();
    for (const d of existingDaily) {
      await ctx.db.delete("analyticsDailyStats", d._id);
    }

    const events = await ctx.db.query("analyticsEvents").collect();

    const emptyDist: Record<string, number> = {};
    const stats = {
      totalProjects: 0,
      lastEventTime: 0,
      backend: { ...emptyDist },
      frontend: { ...emptyDist },
      database: { ...emptyDist },
      orm: { ...emptyDist },
      api: { ...emptyDist },
      auth: { ...emptyDist },
      runtime: { ...emptyDist },
      packageManager: { ...emptyDist },
      platform: { ...emptyDist },
      addons: { ...emptyDist },
      examples: { ...emptyDist },
      dbSetup: { ...emptyDist },
      webDeploy: { ...emptyDist },
      serverDeploy: { ...emptyDist },
      payments: { ...emptyDist },
      git: { ...emptyDist },
      install: { ...emptyDist },
      nodeVersion: { ...emptyDist },
      cliVersion: { ...emptyDist },
      hourlyDistribution: { ...emptyDist },
      stackCombinations: { ...emptyDist },
      dbOrmCombinations: { ...emptyDist },
    };

    const dailyCounts = new Map<string, number>();

    for (const ev of events) {
      stats.totalProjects++;
      if (ev._creationTime > stats.lastEventTime) {
        stats.lastEventTime = ev._creationTime;
      }

      const hourKey = String(new Date(ev._creationTime).getUTCHours()).padStart(2, "0");
      const fe = ev.frontend?.[0] || "none";
      const be = ev.backend || "none";
      const stackKey = `${be} + ${fe}`;
      const db = ev.database || "none";
      const o = ev.orm || "none";
      const dbOrmKey = `${db} + ${o}`;

      stats.backend = incrementKey(stats.backend, ev.backend);
      stats.frontend = incrementKeys(stats.frontend, ev.frontend);
      stats.database = incrementKey(stats.database, ev.database);
      stats.orm = incrementKey(stats.orm, ev.orm);
      stats.api = incrementKey(stats.api, ev.api);
      stats.auth = incrementKey(stats.auth, ev.auth);
      stats.runtime = incrementKey(stats.runtime, ev.runtime);
      stats.packageManager = incrementKey(stats.packageManager, ev.packageManager);
      stats.platform = incrementKey(stats.platform, ev.platform);
      stats.addons = incrementKeys(stats.addons, ev.addons);
      stats.examples = incrementKeys(stats.examples, ev.examples);
      stats.dbSetup = incrementKey(stats.dbSetup, ev.dbSetup);
      stats.webDeploy = incrementKey(stats.webDeploy, ev.webDeploy);
      stats.serverDeploy = incrementKey(stats.serverDeploy, ev.serverDeploy);
      stats.payments = incrementKey(stats.payments, ev.payments);
      stats.git = incrementBool(stats.git, ev.git);
      stats.install = incrementBool(stats.install, ev.install);
      stats.nodeVersion = incrementKey(stats.nodeVersion, getMajorVersion(ev.node_version));
      stats.cliVersion = incrementKey(stats.cliVersion, ev.cli_version);
      stats.hourlyDistribution = incrementKey(stats.hourlyDistribution, hourKey);
      stats.stackCombinations = incrementKey(stats.stackCombinations, stackKey);
      stats.dbOrmCombinations = incrementKey(stats.dbOrmCombinations, dbOrmKey);

      const date = new Date(ev._creationTime).toISOString().slice(0, 10);
      dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
    }

    if (stats.totalProjects > 0) {
      await ctx.db.insert("analyticsStats", stats);
    }

    for (const [date, count] of dailyCounts) {
      await ctx.db.insert("analyticsDailyStats", { date, count });
    }

    return {
      totalProcessed: stats.totalProjects,
      dailyDates: dailyCounts.size,
    };
  },
});
