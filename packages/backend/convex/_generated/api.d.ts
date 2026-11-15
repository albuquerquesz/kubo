/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as healthcheck from "../healthcheck.js";
import type * as hooks from "../hooks.js";
import type * as http from "../http.js";
import type * as layoutCodes from "../layoutCodes.js";
import type * as layoutProfiles from "../layoutProfiles.js";
import type * as newsletter from "../newsletter.js";
import type * as schema_analyticsDailyStats from "../schema/analyticsDailyStats.js";
import type * as schema_analyticsEvents from "../schema/analyticsEvents.js";
import type * as schema_analyticsStats from "../schema/analyticsStats.js";
import type * as schema_layoutCodes from "../schema/layoutCodes.js";
import type * as schema_layoutProfiles from "../schema/layoutProfiles.js";
import type * as schema_newsletterSubscribers from "../schema/newsletterSubscribers.js";
import type * as schema_showcase from "../schema/showcase.js";
import type * as schema_tweets from "../schema/tweets.js";
import type * as schema_videos from "../schema/videos.js";
import type * as showcase from "../showcase.js";
import type * as stats from "../stats.js";
import type * as testimonials from "../testimonials.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  crons: typeof crons;
  emails: typeof emails;
  healthcheck: typeof healthcheck;
  hooks: typeof hooks;
  http: typeof http;
  layoutCodes: typeof layoutCodes;
  layoutProfiles: typeof layoutProfiles;
  newsletter: typeof newsletter;
  "schema/analyticsDailyStats": typeof schema_analyticsDailyStats;
  "schema/analyticsEvents": typeof schema_analyticsEvents;
  "schema/analyticsStats": typeof schema_analyticsStats;
  "schema/layoutCodes": typeof schema_layoutCodes;
  "schema/layoutProfiles": typeof schema_layoutProfiles;
  "schema/newsletterSubscribers": typeof schema_newsletterSubscribers;
  "schema/showcase": typeof schema_showcase;
  "schema/tweets": typeof schema_tweets;
  "schema/videos": typeof schema_videos;
  showcase: typeof showcase;
  stats: typeof stats;
  testimonials: typeof testimonials;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  ossStats: import("@erquhart/convex-oss-stats/_generated/component.js").ComponentApi<"ossStats">;
};
