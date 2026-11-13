import { httpRouter } from "convex/server";

import { parseAnalyticsEventPayload } from "../shared/analytics-event";
import { renderUnsubscribePage, type UnsubscribePageState } from "../shared/newsletter";
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

function htmlResponse(state: UnsubscribePageState, status = 200): Response {
  return new Response(renderUnsubscribePage(state), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

http.route({
  path: "/newsletter/unsubscribe",
  method: "GET",
  handler: httpAction(async (_ctx, req) => {
    const token = new URL(req.url).searchParams.get("token");
    return htmlResponse(token ? "confirm" : "invalid", token ? 200 : 400);
  }),
});

// Handles both the confirmation form and RFC 8058 one-click unsubscribe from mail clients.
http.route({
  path: "/newsletter/unsubscribe",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) return htmlResponse("invalid", 400);

    const found = await ctx.runMutation(internal.newsletter.unsubscribe, { token });
    return found ? htmlResponse("done") : htmlResponse("invalid", 404);
  }),
});

ossStats.registerRoutes(http);
export default http;
