import { defineSchema } from "convex/server";

import { analyticsDailyStats } from "./schema/analyticsDailyStats";
import { analyticsEvents } from "./schema/analyticsEvents";
import { analyticsStats } from "./schema/analyticsStats";
import { showcase } from "./schema/showcase";
import { tweets } from "./schema/tweets";
import { videos } from "./schema/videos";

export default defineSchema({
  videos,
  tweets,
  showcase,
  analyticsEvents,
  analyticsStats,
  analyticsDailyStats,
});
