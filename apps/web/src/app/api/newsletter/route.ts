import { subscribeToNewsletter } from "@kubojs/email";
import { NotifiqueApiError } from "@notifique/sdk-node";
import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/env/server";

const subscriptionSchema = z.object({
  email: z.email(),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = subscriptionSchema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    return NextResponse.redirect(
      new URL("/?newsletter=invalid#newsletter-title", request.url),
      303,
    );
  }

  const subscriptionFailed = await subscribeToNewsletter({
    email: result.data.email,
    listId: env.NOTIFIQUE_NEWSLETTER_LIST_ID,
  })
    .then(() => false)
    .catch((error: unknown) => {
      logNewsletterSubscriptionError(error);
      return true;
    });

  if (subscriptionFailed) {
    return NextResponse.redirect(new URL("/?newsletter=error#newsletter-title", request.url), 303);
  }

  return NextResponse.redirect(
    new URL("/?newsletter=subscribed#newsletter-title", request.url),
    303,
  );
}

function logNewsletterSubscriptionError(error: unknown): void {
  if (!(error instanceof NotifiqueApiError)) {
    console.error("Newsletter subscription failed", error);
    return;
  }

  const responseData = error.responseData;
  const responseCode =
    responseData &&
    typeof responseData === "object" &&
    "code" in responseData &&
    typeof responseData.code === "string"
      ? responseData.code
      : undefined;

  console.error("Newsletter subscription failed", {
    code: responseCode ?? error.code,
    message: error.message,
    status: error.statusCode,
  });
}
