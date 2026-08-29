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

  console.error("Newsletter subscription failed", {
    code: getNotifiqueErrorCode(error.responseData) ?? error.code,
    message: error.message,
    status: error.statusCode,
  });
}

function getNotifiqueErrorCode(responseData: unknown): string | undefined {
  if (!responseData || typeof responseData !== "object" || !("code" in responseData)) {
    return undefined;
  }

  const code = responseData.code;
  return typeof code === "string" ? code : undefined;
}
