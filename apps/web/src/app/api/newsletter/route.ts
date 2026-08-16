import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createNotifiqueClient,
  NotifiqueConfigurationError,
  NotifiqueError,
} from "@/lib/notifique/client";

const subscriptionSchema = z.object({
  email: z.email(),
});

function getRequiredEnv(name: "NOTIFIQUE_API_KEY" | "NOTIFIQUE_NEWSLETTER_LIST_ID") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

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
    const client = createNotifiqueClient({
      apiKey: getRequiredEnv("NOTIFIQUE_API_KEY"),
      baseUrl: process.env.NOTIFIQUE_BASE_URL,
    });
    await client.forms.subscribe({
      email: result.data.email,
      listId: getRequiredEnv("NOTIFIQUE_NEWSLETTER_LIST_ID"),
    });

    return NextResponse.redirect(
      new URL("/?newsletter=subscribed#newsletter-title", request.url),
      303,
    );
  } catch (error) {
    if (error instanceof NotifiqueError || error instanceof NotifiqueConfigurationError) {
      console.error("Newsletter subscription failed", {
        code: error instanceof NotifiqueError ? error.code : undefined,
        message: error.message,
        status: error instanceof NotifiqueError ? error.status : undefined,
      });
    } else {
      console.error("Newsletter subscription failed", error);
    }

    return NextResponse.redirect(new URL("/?newsletter=error#newsletter-title", request.url), 303);
  }
}
