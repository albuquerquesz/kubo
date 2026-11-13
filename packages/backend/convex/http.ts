import { httpRouter } from "convex/server";

import { parseAnalyticsEventPayload } from "../shared/analytics-event";
import { hashLayoutCode, normalizeLayoutCode } from "../shared/layout-code";
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Exchanges a single-use layout code for the layout. Called by the CLI via kubojs.dev.
// The code is never logged.
http.route({
  path: "/layout/redeem",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "invalid_request" }, 400);
    }
    const rawCode = typeof body === "object" && body !== null && "code" in body ? body.code : null;
    const code = normalizeLayoutCode(rawCode);
    if (!code) return jsonResponse({ error: "invalid_code" }, 400);

    const result = await ctx.runMutation(internal.layoutCodes.consume, {
      codeHash: await hashLayoutCode(code),
    });
    if (!result) return jsonResponse({ error: "invalid_or_expired" }, 404);
    return jsonResponse({ layout: result.layout });
  }),
});

ossStats.registerRoutes(http);
export default http;
