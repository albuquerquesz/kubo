import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("delete stale layout codes", { hours: 1 }, internal.layoutCodes.deleteStale, {});

export default crons;
