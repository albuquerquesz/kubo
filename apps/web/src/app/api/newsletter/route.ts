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

  try {
    await subscribeToNewsletter({
      email: result.data.email,
      listId: env.NOTIFIQUE_NEWSLETTER_LIST_ID,
    });

    return NextResponse.redirect(
      new URL("/?newsletter=subscribed#newsletter-title", request.url),
      303,
    );
  } catch (error) {
    if (error instanceof NotifiqueApiError) {
      const responseData = error.responseData as { code?: string } | undefined;
      console.error("Newsletter subscription failed", {
        code: responseData?.code ?? error.code,
        message: error.message,
        status: error.statusCode,
      });
    } else {
      console.error("Newsletter subscription failed", error);
    }

    return NextResponse.redirect(new URL("/?newsletter=error#newsletter-title", request.url), 303);
  }
}
