import { httpRouter } from "convex/server";

import { parseAnalyticsEventPayload } from "../shared/analytics-event";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { ossStats } from "./stats";

const http = httpRouter();

authComponent.registerRoutesLazy(http, createAuth);

http.route({
  path: "/api/analytics/ingest",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response("Bad Request", { status: 400 });
    }

    const body = parseAnalyticsEventPayload(rawBody);
    if (!body) {
      return new Response("Bad Request", { status: 400 });
    }

    try {
      await ctx.runMutation(internal.analytics.ingestEvent, body);
    } catch (error) {
      console.error("Failed to ingest analytics:", error);
      return new Response("Internal Server Error", { status: 500 });
    }

    return new Response("ok");
  }),
});

ossStats.registerRoutes(http);
export default http;
