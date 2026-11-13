import { NextResponse } from "next/server";

import { env } from "@/env/client";

const MAX_BODY_BYTES = 1024;

/**
 * Stable public endpoint for the CLI (`create --layout-code`): forwards the single-use code to
 * the Convex HTTP action, which consumes it atomically. The code is never logged.
 */
export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "invalid_request" }, { status: 413 });
  }

  try {
    const upstream = await fetch(`${env.NEXT_PUBLIC_CONVEX_SITE_URL}/layout/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const payload: unknown = await upstream.json().catch(() => ({ error: "upstream_error" }));
    return NextResponse.json(payload, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
