import { api } from "@kubojs/backend/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { NextResponse } from "next/server";

type NewsletterOutcome = "subscribed" | "invalid" | "error";

function redirectTo(outcome: NewsletterOutcome, request: Request) {
  return NextResponse.redirect(
    new URL(`/?newsletter=${outcome}#newsletter-title`, request.url),
    303,
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email");
  if (typeof email !== "string") {
    return redirectTo("invalid", request);
  }

  const outcome = await fetchMutation(api.newsletter.subscribe, { email }).catch(
    (error: unknown): NewsletterOutcome => {
      console.error("Newsletter subscription failed", error);
      return "error";
    },
  );

  return redirectTo(outcome, request);
}
